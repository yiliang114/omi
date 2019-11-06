import { h, h as createElement } from './h'
import options from './options'
import WeElement from './we-element'
import { render } from './render'
import { define } from './define'
import { tag } from './tag'
import { cloneElement } from './clone-element'
import { getHost } from './get-host'
import { rpx } from './rpx'
import { classNames, extractClass } from './class'
import { o } from './o'
import htm from 'htm'
// 可优化， extend 有误解。。。
import { extend, get, set, bind, unbind } from './extend'
import JSONProxy from './proxy'
import { Fragment } from './util'

h.f = Fragment

// html 模板
const html = htm.bind(h)

// 这个其实也是无意义的。。。
function createRef() {
	return {}
}

// 一个全局属性，共享性质
const $ = {}
const Component = WeElement
const defineElement = define
const elements = options.mapping

const omi = {
	tag,
	WeElement,
	Component,
	render,
	h,
	createElement,
	options,
	define,
	cloneElement,
	getHost,
	rpx,
	defineElement,
	classNames,
	extractClass,
	createRef,
	html,
	htm,
	o,
	elements,
	$,
	extend,
	get,
	set,
	bind,
	unbind,
  JSONProxy
}

// 版本信息，注入到 window 中便于控制台触发行为
options.root.Omi = omi
options.root.omi = omi
options.root.Omi.version = '6.16.1'

export default omi

export {
	tag,
	WeElement,
	Component,
	render,
	h,
	createElement,
	options,
	define,
	cloneElement,
	getHost,
	rpx,
	defineElement,
	classNames,
	extractClass,
	createRef,
	html,
	htm,
	o,
	elements,
	$,
	extend,
	get,
	set,
	bind,
	unbind,
  JSONProxy
}
