import { pathToArr } from './util'

export const extension = {}
// 扩展的属性名
export function extend(name, handler) {
	extension['o-' + name] = handler
}
// 可优化 为啥不写成一个正则 ？
export function set(origin, path, value) {
	// 可优化
	const arr = pathToArr(path)
	let current = origin
	for (let i = 0, len = arr.length;i < len;i++) {
		// TODO:
		if (i === len - 1) {
			current[arr[i]] = value
		} else {
			current = current[arr[i]]
		}
	}
}

export function get(origin, path) {
	// 可优化
	const arr = pathToArr(path)
	let current = origin
	for (let i = 0, len = arr.length;i < len;i++) {
		current = current[arr[i]]
	}

	return current
}

// 执行监听器回调
function eventProxy(e) {
	return this._listeners[e.type](e)
}

// 绑定监听器
export function bind(el, type, handler) {
	el._listeners = el._listeners || {}
	el._listeners[type] = handler
	el.addEventListener(type, eventProxy)
}

// 解绑监听器
export function unbind(el, type) {
	el.removeEventListener(type, eventProxy)
}
