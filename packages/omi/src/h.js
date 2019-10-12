import { VNode } from './vnode'
import options from './options'

const stack = []

export function h(nodeName, attributes) {
	let children = [],
		lastSimple,
		child,
		simple,
		i
	// TODO: 将传入的参数反过来 ？
	for (i = arguments.length;i-- > 2;) {
		stack.push(arguments[i])
	}
	// stack 中的值可以算成是 children ？
	// TODO: 为啥要删除 children 放到 stack 中？
	if (attributes && attributes.children != null) {
		if (!stack.length) stack.push(attributes.children)
		delete attributes.children
	}
	while (stack.length) {
		// 获取到第一个参数，并判断是否是一个数组
		if ((child = stack.pop()) && child.pop !== undefined) {
			for (i = child.length;i--;) stack.push(child[i])
		} else {
			// TODO:
			if (typeof child === 'boolean') child = null

			if ((simple = typeof nodeName !== 'function')) {
				if (child == null) child = ''
				else if (typeof child === 'number') child = String(child)
				else if (typeof child !== 'string') simple = false
			}

			if (simple && lastSimple) {
				children[children.length - 1] += child
			} else if (children.length === 0) {
				children = [child]
			} else {
				children.push(child)
			}

			lastSimple = simple
		}
	}

	// vnode 实例是一个空对象。。。 TODO: 为啥不做成一个类呢 ？
	let p = new VNode()
	p.nodeName = nodeName
	// 循环计算出来的 children
	p.children = children
	p.attributes = attributes == null ? undefined : attributes
	p.key = attributes == null ? undefined : attributes.key

	// if a "vnode hook" is defined, pass every created VNode to it
	if (options.vnode !== undefined) options.vnode(p)

	return p
}
