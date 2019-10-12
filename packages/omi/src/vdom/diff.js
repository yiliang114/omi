import { ATTR_KEY } from '../constants'
import { isSameNodeType, isNamedNode } from './index'
import { createNode, setAccessor } from '../dom/index'
import { camelCase, isArray } from '../util'
import { removeNode } from '../dom/index'
import options from '../options'

/** Queue of components that have been mounted and are awaiting componentDidMount */
export const mounts = []

/** Diff recursion count, used to track the end of the diff cycle. */
export let diffLevel = 0

/** Global flag indicating if the diff is currently within an SVG */
let isSvgMode = false

/** Global flag indicating if the diff is performing hydration */
let hydrating = false

/** Apply differences in a given vnode (and it's deep children) to a real DOM Node.
 *	@param {Element} [dom=null]		A DOM node to mutate into the shape of the `vnode`
 *	@param {VNode} vnode			A VNode (with descendants forming a tree) representing the desired DOM structure
 *	@returns {Element} dom			The created/mutated element
 *	@private
 */
export function diff(dom, vnode, parent, component, updateSelf) {
	// diffLevel having been 0 here indicates initial entry into the diff (not a subdiff)
	let ret
	// 根节点的时候执行逻辑
	if (!diffLevel++) {
		// TODO:
		// diffLevel = 1
		// when first starting the diff, check if we're diffing an SVG or within an SVG
		// 检查是否是 svg 标签
		isSvgMode = parent != null && parent.ownerSVGElement !== undefined

		// hydration is indicated by the existing element to be diffed not having a prop cache
		hydrating = dom != null && !(ATTR_KEY in dom)
	}
	// 渲染子节点。
	// vnode 是 array 的情况是对应渲染的组件有多个节点
	if (isArray(vnode)) {
		if (parent) {
			const styles = parent.querySelectorAll('style')
			styles.forEach(s => {
				parent.removeChild(s)
			})
			innerDiffNode(parent, vnode, null, null, null, component)

			for (let i = styles.length - 1;i >= 0;i--) {
				parent.firstChild ? parent.insertBefore(styles[i], parent.firstChild) : parent.appendChild(style[i])
			}
		} else {
			ret = []
			vnode.forEach((item, index) => {
				let ele = idiff(index === 0 ? dom : null, item, component, updateSelf)
				ret.push(ele)
			})
		}
	} else {
		if (isArray(dom)) {
			dom.forEach((one, index) => {
				if (index === 0) {
					ret = idiff(one, vnode, component, updateSelf)
				} else {
					recollectNodeTree(one, false)
				}
			})
		} else {
			// 根组件渲染的时候走这里。。。dom = null, component => false, updateSelf => undefined
			// 最后返回的结果基本上是经过比较，复制了新的属性的真实节点了
			ret = idiff(dom, vnode, component, updateSelf)
		}
		// append the element if its a new parent
		// 如果是一个新的父组件，就添加到节点上去. 如果是根虚拟节点渲染的话，会将经过加工的 根虚拟节点添加到 render 第二个参数指定的 dom 节点中
		// appendChild 执行完成之后， ret.appendChild === parent
		// 也就是说这里的逻辑是，父节点首先会被挂载，其次它的子（虚拟）节点将属性一个一个更新到真实节点上去
		if (parent && ret.parentNode !== parent) parent.appendChild(ret)
	}

	// diffLevel being reduced to 0 means we're exiting the diff
	if (!--diffLevel) {
		hydrating = false
		// invoke queued componentDidMount lifecycle methods
	}

	return ret
}

// 内部实际使用的 diff 方法
/** Internals of `diff()`, separated to allow bypassing diffLevel / mount flushing. */
function idiff(dom, vnode, component, updateSelf) {
	if (dom && vnode && dom.props) {
		dom.props.children = vnode.children
	}
	let out = dom,
		prevSvgMode = isSvgMode

	// 空的 vnode 就当做是空的文本节点渲染
	// empty values (null, undefined, booleans) render as empty Text nodes
	if (vnode == null || typeof vnode === 'boolean') vnode = ''

	// Fast case: Strings & Numbers create/update Text nodes.
	if (typeof vnode === 'string' || typeof vnode === 'number') {
		// update if it's already a Text node:
		if (
			dom &&
			dom.splitText !== undefined &&
			dom.parentNode &&
			(!dom._component || component)
		) {
			/* istanbul ignore if */ /* Browser quirk that can't be covered: https://github.com/developit/preact/commit/fd4f21f5c45dfd75151bd27b4c217d8003aa5eb9 */
			if (dom.nodeValue != vnode) {
				dom.nodeValue = vnode
			}
		} else {
			// it wasn't a Text node: replace it with one and recycle the old Element
			out = document.createTextNode(vnode)
			if (dom) {
				if (dom.parentNode) dom.parentNode.replaceChild(out, dom)
				recollectNodeTree(dom, true)
			}
		}

		out[ATTR_KEY] = true

		return out
	}

	// 如果 VNode 代表的是一个组件，进行组件更新的形式
	// If the VNode represents a Component, perform a component diff:
	let vnodeName = vnode.nodeName // 标签名
	// 如果计算 vnodeName 值是一个函数，从缓存中寻找出对应的标签名
	if (typeof vnodeName === 'function') {
		for (let key in options.mapping) {
			if (options.mapping[key] === vnodeName) {
				vnodeName = key
				vnode.nodeName = key
				break
			}
		}
	}
	// TODO:
	// 可优化
	// Tracks entering and exiting SVG namespace when descending through the tree.
	isSvgMode =
		vnodeName === 'svg'
			? true
			: vnodeName === 'foreignObject'
				? false
				: isSvgMode

	// if(vnodeName === 'svg') {
	//   isSvgMode = true
	// } else if(vnodeName === 'foreignObject') {
	//   isSvgMode = false
	// }

	// 不存在元素或者是一个错误的类型，就新建一个
	// If there's no existing element or it's the wrong type, create a new one:
	vnodeName = String(vnodeName)
	// TODO: 主要真的没有感受到在比的一个过程。。 每次都在新建一个 node 节点
	if (!dom || !isNamedNode(dom, vnodeName)) {
		// 初始化 out === dom
		// 创建一个新的标签节点，并标识 normalizedNodeName
		out = createNode(vnodeName, isSvgMode)

		if (dom) {
			// move children into the replacement node
			while (dom.firstChild) out.appendChild(dom.firstChild)

			// if the previous Element was mounted into the DOM, replace it inline
			if (dom.parentNode) dom.parentNode.replaceChild(out, dom)

			// recycle the old element (skips non-Element node types)
			recollectNodeTree(dom, true)
		}
	}

	let fc = out.firstChild,
		props = out[ATTR_KEY],
		vchildren = vnode.children

	// 扩展所有 attributes 到 props 上去。 当然如果 out 是刚刚创建的节点，那 props 一开始 。。。？ TODO:
	if (props == null) {
		props = out[ATTR_KEY] = {}
		for (let a = out.attributes, i = a.length;i--;)
			props[a[i].name] = a[i].value
	}

	// Optimization: fast-path for elements containing a single TextNode:
	if (
		!hydrating &&
		vchildren &&
		vchildren.length === 1 &&
		typeof vchildren[0] === 'string' &&
		fc != null &&
		fc.splitText !== undefined &&
		fc.nextSibling == null
	) {
		if (fc.nodeValue != vchildren[0]) {
			fc.nodeValue = vchildren[0]
		}
	}
	// 存在新的子节点，就 diff 他们
	// otherwise, if there are existing or new children, diff them:
	else if ((vchildren && vchildren.length) || fc != null) {
		// TODO: noSlot 和 is 属性只有 WeElement 标签才会有
		if (!(out.constructor.is == 'WeElement' && out.constructor.noSlot)) {
			// 到这里为止 一般 out 这个还是个未被挂载的空的容器节点标签
			innerDiffNode(
				out,// TODO: 这个讲道理叫 out 很难理解，最好是叫 containerEle 之类的
				vchildren,
				hydrating || props.dangerouslySetInnerHTML != null,
				component,
				updateSelf
			)
		}
	}

	// 应用所有属性和 props 到真实的 dom 节点中去
	// out “根”节点 out 一般一开始都没有 attributes， 而 vnode.attributes 一般都是 props 之类的值？ TODO: 是什么时候传入的 ？
	// TODO: 根节点 out 是 WeWeElement 实例 ？
	// Apply attributes/props from VNode to the DOM Element:
	diffAttributes(out, vnode.attributes, props, component, updateSelf)
	// TODO: 经过 diffAttributes 函数执行之后，新旧节点上都扩展的新的 props 属性 ？
	// out 是真实的 dom 节点， vnode 是自定义标签的虚拟节点，将 children 复制到真实节点中去。 out.props.children 一开始是空的
	if (out.props) {
		out.props.children = vnode.children
	}
	// restore previous SVG mode: (in case we're exiting an SVG namespace)
	isSvgMode = prevSvgMode

	return out
}

/** Apply child and attribute changes between a VNode and a DOM Node to the DOM.
 *	@param {Element} dom			Element whose children should be compared & mutated
 *	@param {Array} vchildren		Array of VNodes to compare to `dom.childNodes`
 *	@param {Boolean} isHydrating	If `true`, consumes externally created elements similar to hydration
 */
function innerDiffNode(dom, vchildren, isHydrating, component, updateSelf) {
	let originalChildren = dom.childNodes,
		children = [],
		keyed = {},
		keyedLen = 0,
		min = 0,
		len = originalChildren.length,
		childrenLen = 0,
		vlen = vchildren ? vchildren.length : 0,
		j,
		c,
		f,
		vchild,
		child

	// Build up a map of keyed children and an Array of unkeyed children:
	if (len !== 0) {
		for (let i = 0;i < len;i++) {
			let child = originalChildren[i],
				props = child[ATTR_KEY],
				key =
					vlen && props
						? child._component
							? child._component.__key
							: props.key
						: null
			if (key != null) {
				keyedLen++
				keyed[key] = child
			} else if (
				props ||
				(child.splitText !== undefined
					? isHydrating
						? child.nodeValue.trim()
						: true
					: isHydrating)
			) {
				children[childrenLen++] = child
			}
		}
	}

	if (vlen !== 0) {
		for (let i = 0;i < vlen;i++) {
			vchild = vchildren[i]
			child = null

			// attempt to find a node based on key matching
			let key = vchild.key
			if (key != null) {
				if (keyedLen && keyed[key] !== undefined) {
					child = keyed[key]
					keyed[key] = undefined
					keyedLen--
				}
			}
			// attempt to pluck a node of the same type from the existing children
			else if (!child && min < childrenLen) {
				for (j = min;j < childrenLen;j++) {
					if (
						children[j] !== undefined &&
						isSameNodeType((c = children[j]), vchild, isHydrating)
					) {
						child = c
						children[j] = undefined
						if (j === childrenLen - 1) childrenLen--
						if (j === min) min++
						break
					}
				}
			}

			// morph the matched/found/created DOM child to match vchild (deep)
			child = idiff(child, vchild, component, updateSelf)

			f = originalChildren[i]
			if (child && child !== dom && child !== f) {
				if (f == null) {
					dom.appendChild(child)
				} else if (child === f.nextSibling) {
					removeNode(f)
				} else {
					dom.insertBefore(child, f)
				}
			}
		}
	}

	// remove unused keyed children:
	if (keyedLen) {
		for (let i in keyed)
			if (keyed[i] !== undefined) recollectNodeTree(keyed[i], false)
	}

	// remove orphaned unkeyed children:
	while (min <= childrenLen) {
		if ((child = children[childrenLen--]) !== undefined)
			recollectNodeTree(child, false)
	}
}

/** Recursively recycle (or just unmount) a node and its descendants.
 *	@param {Node} node						DOM node to start unmount/removal from
 *	@param {Boolean} [unmountOnly=false]	If `true`, only triggers unmount lifecycle, skips removal
 */
export function recollectNodeTree(node, unmountOnly) {
	// If the node's VNode had a ref function, invoke it with null here.
	// (this is part of the React spec, and smart for unsetting references)
	if (node[ATTR_KEY] != null && node[ATTR_KEY].ref) {
		if (typeof node[ATTR_KEY].ref === 'function') {
			node[ATTR_KEY].ref(null)
		} else if (node[ATTR_KEY].ref.current) {
			node[ATTR_KEY].ref.current = null
		}
	}

	if (unmountOnly === false || node[ATTR_KEY] == null) {
		removeNode(node)
	}

	removeChildren(node)
}

/** Recollect/unmount all children.
 *	- we use .lastChild here because it causes less reflow than .firstChild
 *	- it's also cheaper than accessing the .childNodes Live NodeList
 */
export function removeChildren(node) {
	node = node.lastChild
	while (node) {
		let next = node.previousSibling
		recollectNodeTree(node, true)
		node = next
	}
}

// 比较属性之间的区别
/** Apply differences in attributes from a VNode to the given DOM Element.
 *	@param {Element} dom		Element with attributes to diff `attrs` against
 *	@param {Object} attrs		The desired end-state key-value attribute pairs
 *	@param {Object} old			Current/previous attributes (from previous VNode or element's prop cache)
 */
// TODO: 其实 attrs 叫 newVnode 比较好
function diffAttributes(dom, attrs, old, component, updateSelf) {
	let name
	//let update = false
	// TODO: update 函数是什么时候挂载的 ？ 这个变量的命名也不是很标准，命名是一个 update 函数
	let isWeElement = dom.update
	let oldClone
	// 可优化，添加一个判断对象是否为空。。
	// receiveProps 又是一个什么函数？ 原生？ 这里应该是一个执行的结果， false 就不更新
	// react 整个系统都是监听 props 是否有变化，才进行更新的。 所以标签的属性 attrs 在更新之前都必须扩展到 props 中才能够进行判断
	if (dom.receiveProps) {
		// TODO: 这里为啥又不用 extend 了。。？
		oldClone = Object.assign({}, old)
	}
	// remove attributes no longer present on the vnode by setting them to undefined
	// 移除一些已经不存在的属性
	for (name in old) {
		if (!(attrs && attrs[name] != null) && old[name] != null) {
			setAccessor(dom, name, old[name], (old[name] = undefined), isSvgMode, component)
			if (isWeElement) {
				delete dom.props[name]
				//update = true
			}
		}
	}

	// add new & update changed attributes
	// 添加一些新的属性
	for (name in attrs) {
		// 排除 ref 属性， ref 需要特殊处理 ？
		if (isWeElement && typeof attrs[name] === 'object' && name !== 'ref') {
			// 处理直接写在标签中的 style
			if (name === 'style') {
				setAccessor(dom, name, old[name], (old[name] = attrs[name]), isSvgMode, component)
			}
			// 如果 name 中包含 - 符号的话，去掉 - 符号，并且首字母大写， 否则不变
			let ccName = camelCase(name)
			// 同时更新 dom.props 和 旧的虚拟节点（其实是旧的虚拟节点的 props）上的属性为最新的值
			dom.props[ccName] = old[ccName] = attrs[name]
			//update = true
		} else if (
			name !== 'children' &&
			(!(name in old) ||
				attrs[name] !==
				(name === 'value' || name === 'checked' ? dom[name] : old[name]))
		) {
			setAccessor(dom, name, old[name], attrs[name], isSvgMode, component)
			if (isWeElement) {
				let ccName = camelCase(name)
				dom.props[ccName] = old[ccName] = attrs[name]
				//update = true
			} else {
				old[name] = attrs[name]
			}
		}
	}

	if (isWeElement && !updateSelf && dom.parentNode) {
		//__hasChildren is not accuracy when it was empty at first, so add dom.children.length > 0 condition
		//if (update || dom.__hasChildren || dom.children.length > 0 || (dom.store && !dom.store.data)) {
		if (dom.receiveProps(dom.props, oldClone) !== false) {
			dom.update()
		}
		//}
	}
}
