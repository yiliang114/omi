import WeElement from './we-element'
import options from './options'

const getType = function (obj) {
	return Object.prototype.toString.call(obj).slice(8, -1)
}

// 传入标签名和构造函数，一般构造函数就是 react class component
export function define(name, ctor) {
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
		//TODO:
		if (ctor.use) {
			//TODO: 获取 use 属性对象 ？
			ctor.updatePath = getPath(ctor.use)
		}
	} else {
		// 处理函数式组件， define 自定义标签传超过两个参数， 第三个参数会是函数式组件的配置信息
		let depPaths // TODO: 依赖深度？
		let config = {}
		const len = arguments.length
		// 解析出 nodeName, depPaths, ctor, config 四个参数
		if (len === 3) {
			// 一般来说，参数分别为，标签名、构造函数、注入配置
			if (typeof arguments[1] === 'function') {
				ctor = arguments[1]
				config = arguments[2]
			} else {
				depPaths = arguments[1]
				ctor = arguments[2]
			}
		} else if (len === 4) {
			depPaths = arguments[1]
			ctor = arguments[2]
			config = arguments[3]
		}
		// 诡异的 css 属性， 说明 css 属性可以直接作为最后一个参数添加
		if (typeof config === 'string') {
			config = { css: config }
		}
		// 函数式组件的声明
		class Ele extends WeElement {
			// 类似 react 的静态属性。 不会被实例继承，是类上的属性和方法
			static use = depPaths

			static css = config.css

			static propTypes = config.propTypes

			static defaultProps = config.defaultProps
			// 类似 vue 的生命钩子函数 ？
			// 重写父类中的空函数
			render() {
				return ctor.call(this, this)
			}

			receiveProps() {
				if (config.receiveProps) {
					return config.receiveProps.apply(this, arguments)
				}
			}
		}

		const EleHooks = ['install', 'installed', 'uninstall', 'beforeUpdate', 'updated', 'beforeRender', 'rendered'],
			storeHelpers = ['use', 'useSelf']
		// 默认直接在原型链上添加 hook
		EleHooks.forEach(hook => {
			if (config[hook]) {
				Ele.prototype[hook] = function () {
					config[hook].apply(this, arguments)
				}
			}
		})

		storeHelpers.forEach(func => {
			if (config[func]) {
				Ele.prototype[func] = function () {
					return typeof config[func] === 'function'
						? config[func].apply(this, arguments)
						: config[func]
				}
			}
		})

		if (config.use) {
			Ele.prototype.use = function () {
				return typeof config.use === 'function'
					? config.use.apply(this, arguments)
					: config.use
			}
		}

		if (config.useSelf) {
			Ele.prototype.useSelf = function () {
				return typeof config.useSelf === 'function'
					? config.useSelf.apply(this, arguments)
					: config.useSelf
			}
		}

		if (Ele.use) {
			Ele.updatePath = getPath(Ele.use)
		}
		// 为函数式组件自定义标签
		customElements.define(name, Ele)
		options.mapping[name] = Ele
	}
}
// TODO: obj 只能是数组或者是对象 ？
export function getPath(obj) {
	if (getType(obj) === 'Array') {
		const result = {}
		obj.forEach(item => {
			if (typeof item === 'string') {
				result[item] = true
			} else {
				const tempPath = item[Object.keys(item)[0]]
				if (typeof tempPath === 'string') {
					result[tempPath] = true
				} else {
					if (typeof tempPath[0] === 'string') {
						result[tempPath[0]] = true
					} else {
						tempPath[0].forEach(path => (result[path] = true))
					}
				}
			}
		})
		return result
	} else {
		// 这里默认 obj 是一个对象了。。
		return getUpdatePath(obj)
	}
}
// 可优化
export function getUpdatePath(data) {
	const result = {}
	dataToPath(data, result)
	return result
}

function dataToPath(data, result) {
	Object.keys(data).forEach(key => {
		result[key] = true
		const type = getType(data[key])
		if (type === 'Object') {
			_objToPath(data[key], key, result)
		} else if (type === 'Array') {
			_arrayToPath(data[key], key, result)
		}
	})
}

function _objToPath(data, path, result) {
	Object.keys(data).forEach(key => {
		result[path + '.' + key] = true
		delete result[path]
		const type = getType(data[key])
		if (type === 'Object') {
			_objToPath(data[key], path + '.' + key, result)
		} else if (type === 'Array') {
			_arrayToPath(data[key], path + '.' + key, result)
		}
	})
}

function _arrayToPath(data, path, result) {
	data.forEach((item, index) => {
		result[path + '[' + index + ']'] = true
		delete result[path]
		const type = getType(item)
		if (type === 'Object') {
			_objToPath(item, path + '[' + index + ']', result)
		} else if (type === 'Array') {
			_arrayToPath(item, path + '[' + index + ']', result)
		}
	})
}
