import { define } from './define'

export function tag(name, pure) {
	return function (target) {
		// TODO: 纯函数 ？ 构造函数上添加这个属性
		target.pure = pure
		define(name, target)
	}
}
