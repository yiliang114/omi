function getGlobal() {
	if (
		typeof global !== 'object' ||
		!global ||
		global.Math !== Math ||
		global.Array !== Array
	) {
		return (
			self ||
			window ||
			global ||
			(function () {
				return this
			})()
		)
	}
	return global
}

/** Global options
 *	@public
 *	@namespace options {Object}
 */
export default {
	store: null,
	// 根据环境返回 window 或者 global
	root: getGlobal(),
	mapping: {},
	isMultiStore: false
}
