export function getHost(ele) {
	let p = ele.parentNode
	while (p) {
		if (p.host) {
			return p.host
			// TODO: shadowRoot ?
		} else if (p.shadowRoot && p.shadowRoot.host) {
			return p.shadowRoot.host
		} else {
			// 向上遍历
			p = p.parentNode
		}
	}
}
