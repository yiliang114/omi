import {
	cssToDom,
	isArray,
	getUse,
	hyphenate,
	getValByPath,
	removeItem
} from './util'
import { diff } from './vdom/diff'
import options from './options'
import { getPath } from './util'

let id = 0
// 定制元素
// https://segmentfault.com/a/1190000012440318
export default class WeElement extends HTMLElement {
	static is = 'WeElement'

	constructor() {
		super()
		this.props = Object.assign({},
			this.constructor.defaultProps
		)
		this.elementId = id++
	}

	// 每当元素插入 DOM 时被触发
	connectedCallback() {
		// 执行完 appendChild 函数之后，会自动进行添加 parentNode 属性到实例上
		let p = this.parentNode
		// FIXME: 没有 store 的时候，不执行。 这里必须参照 vuex 的注入逻辑，最好是能够加到初始化的钩子函数中去处理，而不是这样覆盖 store
		// case: 父子节点注入 store 不一致的情况。最主要的是，没必要每次这样去更新吧。。。。
		// TODO: store 循环为每一个子节点都注入 store
		while (p && !this.store) {
			this.store = p.store
			p = p.parentNode || p.host
		}
		if (this.store) {
			// this.store.instances 数组维护一个依赖的实例列表
			this.store.instances.push(this)
		}
		// TODO:
		if (this.use) {
			let use
			if (typeof this.use === 'function') {
				use = this.use()
			} else {
				use = this.use
			}

			this._updatePath = getPath(use)
			this.using = getUse(this.store.data, use)
		} else {
			// TODO:
			this.constructor.use && (this.using = getUse(this.store.data, this.constructor.use))
		}
		if (this.useSelf) {
			const use = typeof this.useSelf === 'function' ? this.useSelf() : this.useSelf
			this._updateSelfPath = getPath(use)
			this.usingSelf = getUse(this.store.data, use)
		}
		// 将初始化的一些类型检查，默认 props 值都扩展到 props 上
		this.attrsToProps()
		// 执行钩子
		this.beforeInstall()
		this.install()
		this.afterInstall()

		// mode 是 ShadowRoot  的只读属性，它返回 ShadowRoot 创建时的模式 ("open" 或者 "closed") 。
		// 当 ShadowRoot 的 mode 是 "closed" 时， ShadowRoot 的内部实现无法被 JavaScript 访问及修改 — 也就是说将该实现不公开
		let shadowRoot
		if (!this.shadowRoot) {
			// 给一个已存在的元素添加shadow root
			shadowRoot = this.attachShadow({
				mode: 'open'
			})
		} else {
			shadowRoot = this.shadowRoot
			let fc
			// TODO: 为啥要删除光 ？
			while ((fc = shadowRoot.firstChild)) {
				shadowRoot.removeChild(fc)
			}
		}

		if (this.constructor.css) {
			// cssToDom 创建一个 cssom 节点添加到 shadowDOM 中
			shadowRoot.appendChild(cssToDom(this.constructor.css))
		} else if (this.css) {
			shadowRoot.appendChild(cssToDom(typeof this.css === 'function' ? this.css() : this.css))
		}
		this.beforeRender()
		// TODO: 这个钩子为啥与其他钩子不一样?
		options.afterInstall && options.afterInstall(this)

		// component 实例中的 render 函数，返回的内容是类似 jsx 的东西。相当于是执行了一次 render 函数。 一个组件的虚拟节点整个都是在这一层被计算渲染的。
		const rendered = this.render(this.props, this.store)
		// 可优化。
		// TODO: 是否有子组件这么判断是否过于草率 ？ 还是说这里指的是 render 函数支持多个节点的渲染， 或者感觉命名不太合理
		this.__hasChildren = Object.prototype.toString.call(rendered) === '[object Array]' && rendered.length > 0

		// 两个参数分别为 vnode 和 component。 rendered 是一个组件渲染出的虚拟节点， 而 component 则是实际已经 appendChild 之后的真实节点
		// TODO: 可优化，这里最好是能够让 diff 函数返回的结果经过规范化
		// rootNode 估计是渲染结束之后的最新节点 ？？？
		this.rootNode = diff(
			null,
			rendered,
			null,
			this
		)
		// TODO: 渲染完成之后执行 ？
		this.rendered()

		if (this.props.css) {
			// TODO: 什么骚操作 ？？？ this._customStyleElement _customStyleContent ？
			this._customStyleElement = cssToDom(this.props.css)
			this._customStyleContent = this.props.css
			shadowRoot.appendChild(this._customStyleElement)
		}

		// TODO: 可优化： 先规范化成为数组，在一次逻辑渲染
		if (isArray(this.rootNode)) {
			this.rootNode.forEach(function (item) {
				shadowRoot.appendChild(item)
			})
		} else {
			shadowRoot.appendChild(this.rootNode)
		}
		// appendChild 函数执行了之后，页面上就能够直接看到渲染的结果了
		this.installed()
		// 组件安装结束
		this._isInstalled = true

	}

	// 每当元素从 DOM 中移除时被触发。
	disconnectedCallback() {
		this.uninstall()
		this._isInstalled = false
		if (this.store) {
			for (let i = 0, len = this.store.instances.length;i < len;i++) {
				if (this.store.instances[i] === this) {
					this.store.instances.splice(i, 1)
					break
				}
			}
		}
	}

	// TODO: 为啥这个特征不需要 ？
	// attributeChangedCallback — 当元素上的属性被添加、移除、更新或取代时被触发。


	update(ignoreAttrs, updateSelf) {
		this._willUpdate = true
		this.beforeUpdate()
		this.beforeRender()
		//fix null !== undefined
		if (this._customStyleContent != this.props.css) {
			this._customStyleContent = this.props.css
			this._customStyleElement.textContent = this._customStyleContent
		}
		this.attrsToProps(ignoreAttrs)

		const rendered = this.render(this.props, this.store)
		this.rendered()
		this.__hasChildren = this.__hasChildren || (Object.prototype.toString.call(rendered) === '[object Array]' && rendered.length > 0)

		this.rootNode = diff(
			this.rootNode,
			rendered,
			this.shadowRoot,
			this,
			updateSelf
		)
		this._willUpdate = false
		this.updated()

	}

	updateSelf(ignoreAttrs) {
		this.update(ignoreAttrs, true)
	}

	removeAttribute(key) {
		super.removeAttribute(key)
		//Avoid executing removeAttribute methods before connectedCallback
		this._isInstalled && this.update()
	}

	setAttribute(key, val) {
		if (val && typeof val === 'object') {
			super.setAttribute(key, JSON.stringify(val))
		} else {
			super.setAttribute(key, val)
		}
		//Avoid executing setAttribute methods before connectedCallback
		this._isInstalled && this.update()
	}

	pureRemoveAttribute(key) {
		super.removeAttribute(key)
	}

	pureSetAttribute(key, val) {
		super.setAttribute(key, val)
	}

	// 将 attrs 属性都添加到 props 中
	attrsToProps(ignoreAttrs) {
		const ele = this
		// TODO: normalizedNodeName 这个属性不是一般都会有么？
		if (ele.normalizedNodeName || ignoreAttrs) return
		ele.props['css'] = ele.getAttribute('css')
		// 类似 react 的 props 类型检查
		const attrs = this.constructor.propTypes
		if (!attrs) return
		Object.keys(attrs).forEach(key => {
			const type = attrs[key]
			// 用连字符号连接
			const val = ele.getAttribute(hyphenate(key))
			// 可优化
			if (val !== null) {
				switch (type) {
					case String:
						ele.props[key] = val
						break
					case Number:
						ele.props[key] = Number(val)
						break
					case Boolean:
						if (val === 'false' || val === '0') {
							ele.props[key] = false
						} else {
							ele.props[key] = true
						}
						break
					case Array:
					case Object:
						if (val[0] === ':') {
							ele.props[key] = getValByPath(val.substr(1), Omi.$)
						} else {
							ele.props[key] = JSON.parse(val
								.replace(/(['"])?([a-zA-Z0-9_-]+)(['"])?:([^\/])/g, '"$2":$4')
								.replace(/'([\s\S]*?)'/g, '"$1"')
								.replace(/,(\s*})/g, '$1')
							)
						}
						break
				}
			} else {
				if (ele.constructor.defaultProps && ele.constructor.defaultProps.hasOwnProperty(key)) {
					ele.props[key] = ele.constructor.defaultProps[key]
				} else {
					ele.props[key] = null
				}
			}
		})
	}

	// emit
	fire(name, data) {
		this.dispatchEvent(new CustomEvent(name, { detail: data }))
	}

	beforeInstall() { }
	// before the component gets mounted to the DOM
	install() { }

	afterInstall() { }

	// after the component gets mounted to the DOM
	installed() { }
	// prior to removal from the DOM
	uninstall() { }
	// before update
	beforeUpdate() { }
	// after update
	updated() { }

	beforeRender() { }

	rendered() { }
	// 父组件重新渲染的时候会触发，返回 false 的话就会阻止更新事件
	// TODO: 为啥
	// parent element re-render will trigger it, return false will prevent update action
	receiveProps() { }
}
