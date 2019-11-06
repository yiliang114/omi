import WeElement from './we-element'
import options from './options'

const storeHelpers = ['use', 'useSelf']

// 传入标签名和构造函数，一般构造函数就是 react class component
export function define(name, ctor, config) {
	// TODO: 搞一个缓存已经声明的自定义组件，没必要搞一个 options 对象吧，似乎没有很好的阅读性？
	// 已经定义过的组件
	if (options.mapping[name]) {
		return
	}
	// 只处理 class 类型的组件
	// omi 自定义的标签，类似于 react 的 class 组件 WeElement ， is 是静态属性
	if (ctor.is === 'WeElement') {
		// @Wonderful
		// 自定义标签 CustomElementRegistry.define() 方法用来注册一个 custom element
		// 原生的window.customElements对象的define方法用来定义 Custom Element。该方法接受两个参数，第一个参数是自定义元素的名字，第二个参数是一个 ES6 的 class。
		customElements.define(name, ctor)
		// 缓存已经自定义后的标签名，值为构造函数。 先储存到 mapping 对象中去，实际变成一个节点还是在 render 出来的。
		options.mapping[name] = ctor

	} else {
		// 处理函数式组件， define 自定义标签传超过两个参数， 第三个参数会是函数式组件的配置信息

		if (typeof config === 'string') {
			config = { css: config }
		} else {
			config = config || {}
		}

		class Ele extends WeElement {

			static css = config.css

			static propTypes = config.propTypes

			static defaultProps = config.defaultProps

			compute = config.compute

			render() {
				return ctor.call(this, this)
			}

		}


		for (let key in config) {
			if (typeof config[key] === 'function') {
				Ele.prototype[key] = function () {
					return config[key].apply(this, arguments)
				}
			}
		}



		storeHelpers.forEach(func => {
			if (config[func] && config[func] !== 'function') {
				Ele.prototype[func] = function () {
					return config[func]
				}
			}
		})

		customElements.define(name, Ele)
		options.mapping[name] = Ele
	}
}



