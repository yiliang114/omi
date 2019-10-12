// TODO: 自动处理 rpx 这个单位
export function rpx(str) {
	return str.replace(/([1-9]\d*|0)(\.\d*)*rpx/g, (a, b) => {
		return (window.innerWidth * Number(b)) / 750 + 'px'
	})
}
