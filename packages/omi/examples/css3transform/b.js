(function () {
	'use strict';

	/** Virtual DOM Node */
	function VNode() {}

	function getGlobal() {
		if (typeof global !== "object" || !global || global.Math !== Math || global.Array !== Array) {
			return self || window || global || function () {
				return this;
			}();
		}
		return global;
	}

	/** Global options
	 *	@public
	 *	@namespace options {Object}
	 */
	var options = {
		store: null,
		root: getGlobal()
	};

	var stack = [];
	var EMPTY_CHILDREN = [];

	function h(nodeName, attributes) {
		var children = EMPTY_CHILDREN,
		    lastSimple = void 0,
		    child = void 0,
		    simple = void 0,
		    i = void 0;
		for (i = arguments.length; i-- > 2;) {
			stack.push(arguments[i]);
		}
		if (attributes && attributes.children != null) {
			if (!stack.length) stack.push(attributes.children);
			delete attributes.children;
		}
		while (stack.length) {
			if ((child = stack.pop()) && child.pop !== undefined) {
				for (i = child.length; i--;) {
					stack.push(child[i]);
				}
			} else {
				if (typeof child === "boolean") child = null;

				if (simple = typeof nodeName !== "function") {
					if (child == null) child = "";else if (typeof child === "number") child = String(child);else if (typeof child !== "string") simple = false;
				}

				if (simple && lastSimple) {
					children[children.length - 1] += child;
				} else if (children === EMPTY_CHILDREN) {
					children = [child];
				} else {
					children.push(child);
				}

				lastSimple = simple;
			}
		}

		var p = new VNode();
		p.nodeName = nodeName;
		p.children = children;
		p.attributes = attributes == null ? undefined : attributes;
		p.key = attributes == null ? undefined : attributes.key;

		// if a "vnode hook" is defined, pass every created VNode to it
		if (options.vnode !== undefined) options.vnode(p);

		return p;
	}

	/**
	 * @license
	 * Copyright (c) 2016 The Polymer Project Authors. All rights reserved.
	 * This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
	 * The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
	 * The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
	 * Code distributed by Google as part of the polymer project is also
	 * subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
	 */

	/**
	 * This shim allows elements written in, or compiled to, ES5 to work on native
	 * implementations of Custom Elements v1. It sets new.target to the value of
	 * this.constructor so that the native HTMLElement constructor can access the
	 * current under-construction element's definition.
	 */
	(function () {
		if (
		// No Reflect, no classes, no need for shim because native custom elements
		// require ES2015 classes or Reflect.
		window.Reflect === undefined || window.customElements === undefined ||
		// The webcomponentsjs custom elements polyfill doesn't require
		// ES2015-compatible construction (`super()` or `Reflect.construct`).
		window.customElements.hasOwnProperty("polyfillWrapFlushCallback")) {
			return;
		}
		var BuiltInHTMLElement = HTMLElement;
		window.HTMLElement = function HTMLElement() {
			return Reflect.construct(BuiltInHTMLElement, [], this.constructor);
		};
		HTMLElement.prototype = BuiltInHTMLElement.prototype;
		HTMLElement.prototype.constructor = HTMLElement;
		Object.setPrototypeOf(HTMLElement, BuiltInHTMLElement);
	})();

	function cssToDom(css) {
		var node = document.createElement("style");
		node.textContent = css;
		return node;
	}

	function npn(str) {
		return str.replace(/-(\w)/g, function ($, $1) {
			return $1.toUpperCase();
		});
	}

	/** Invoke or update a ref, depending on whether it is a function or object ref.
	 *  @param {object|function} [ref=null]
	 *  @param {any} [value]
	 */
	function applyRef(ref, value) {
		if (ref != null) {
			if (typeof ref == "function") ref(value);else ref.current = value;
		}
	}

	/**
	 * Call a function asynchronously, as soon as possible. Makes
	 * use of HTML Promise to schedule the callback if available,
	 * otherwise falling back to `setTimeout` (mainly for IE<11).
	 * @type {(callback: function) => void}
	 */
	var defer = typeof Promise == "function" ? Promise.resolve().then.bind(Promise.resolve()) : setTimeout;

	function isArray(obj) {
		return Object.prototype.toString.call(obj) === "[object Array]";
	}

	function nProps(props) {
		if (!props || isArray(props)) return {};
		var result = {};
		Object.keys(props).forEach(function (key) {
			result[key] = props[key].value;
		});
		return result;
	}

	// render modes

	var ATTR_KEY = "__preactattr_";

	// DOM properties that should NOT have "px" added when numeric
	var IS_NON_DIMENSIONAL = /acit|ex(?:s|g|n|p|$)|rph|ows|mnc|ntw|ine[ch]|zoo|^ord/i;

	/**
	 * Check if two nodes are equivalent.
	 *
	 * @param {Node} node			DOM Node to compare
	 * @param {VNode} vnode			Virtual DOM node to compare
	 * @param {boolean} [hydrating=false]	If true, ignores component constructors when comparing.
	 * @private
	 */
	function isSameNodeType(node, vnode, hydrating) {
		if (typeof vnode === "string" || typeof vnode === "number") {
			return node.splitText !== undefined;
		}
		if (typeof vnode.nodeName === "string") {
			return !node._componentConstructor && isNamedNode(node, vnode.nodeName);
		}
		return hydrating || node._componentConstructor === vnode.nodeName;
	}

	/**
	 * Check if an Element has a given nodeName, case-insensitively.
	 *
	 * @param {Element} node	A DOM Element to inspect the name of.
	 * @param {String} nodeName	Unnormalized name to compare against.
	 */
	function isNamedNode(node, nodeName) {
		return node.normalizedNodeName === nodeName || node.nodeName.toLowerCase() === nodeName.toLowerCase();
	}

	/**
	 * A DOM event listener
	 * @typedef {(e: Event) => void} EventListner
	 */

	/**
	 * A mapping of event types to event listeners
	 * @typedef {Object.<string, EventListener>} EventListenerMap
	 */

	/**
	 * Properties Preact adds to elements it creates
	 * @typedef PreactElementExtensions
	 * @property {string} [normalizedNodeName] A normalized node name to use in diffing
	 * @property {EventListenerMap} [_listeners] A map of event listeners added by components to this DOM node
	 * @property {import('../component').Component} [_component] The component that rendered this DOM node
	 * @property {function} [_componentConstructor] The constructor of the component that rendered this DOM node
	 */

	/**
	 * A DOM element that has been extended with Preact properties
	 * @typedef {Element & ElementCSSInlineStyle & PreactElementExtensions} PreactElement
	 */

	/**
	 * Create an element with the given nodeName.
	 * @param {string} nodeName The DOM node to create
	 * @param {boolean} [isSvg=false] If `true`, creates an element within the SVG
	 *  namespace.
	 * @returns {PreactElement} The created DOM node
	 */
	function createNode(nodeName, isSvg) {
		/** @type {PreactElement} */
		var node = isSvg ? document.createElementNS("http://www.w3.org/2000/svg", nodeName) : document.createElement(nodeName);
		node.normalizedNodeName = nodeName;
		return node;
	}

	/**
	 * Remove a child node from its parent if attached.
	 * @param {Node} node The node to remove
	 */
	function removeNode(node) {
		var parentNode = node.parentNode;
		if (parentNode) parentNode.removeChild(node);
	}

	/**
	 * Set a named attribute on the given Node, with special behavior for some names
	 * and event handlers. If `value` is `null`, the attribute/handler will be
	 * removed.
	 * @param {PreactElement} node An element to mutate
	 * @param {string} name The name/key to set, such as an event or attribute name
	 * @param {*} old The last value that was set for this name/node pair
	 * @param {*} value An attribute value, such as a function to be used as an
	 *  event handler
	 * @param {boolean} isSvg Are we currently diffing inside an svg?
	 * @private
	 */
	function setAccessor(node, name, old, value, isSvg) {
		if (name === "className") name = "class";

		if (name === "key") {
			// ignore
		} else if (name === "ref") {
			applyRef(old, null);
			applyRef(value, node);
		} else if (name === "class" && !isSvg) {
			node.className = value || "";
		} else if (name === "style") {
			if (!value || typeof value === "string" || typeof old === "string") {
				node.style.cssText = value || "";
			}
			if (value && typeof value === "object") {
				if (typeof old !== "string") {
					for (var i in old) {
						if (!(i in value)) node.style[i] = "";
					}
				}
				for (var _i in value) {
					node.style[_i] = typeof value[_i] === "number" && IS_NON_DIMENSIONAL.test(_i) === false ? value[_i] + "px" : value[_i];
				}
			}
		} else if (name === "dangerouslySetInnerHTML") {
			if (value) node.innerHTML = value.__html || "";
		} else if (name[0] == "o" && name[1] == "n") {
			var useCapture = name !== (name = name.replace(/Capture$/, ""));
			name = name.toLowerCase().substring(2);
			if (value) {
				if (!old) node.addEventListener(name, eventProxy, useCapture);
			} else {
				node.removeEventListener(name, eventProxy, useCapture);
			}
			(node._listeners || (node._listeners = {}))[name] = value;
		} else if (name !== "list" && name !== "type" && !isSvg && name in node) {
			// Attempt to set a DOM property to the given value.
			// IE & FF throw for certain property-value combinations.
			try {
				node[name] = value == null ? "" : value;
			} catch (e) {}
			if ((value == null || value === false) && name != "spellcheck") node.removeAttribute(name);
		} else {
			var ns = isSvg && name !== (name = name.replace(/^xlink:?/, ""));
			// spellcheck is treated differently than all other boolean values and
			// should not be removed when the value is `false`. See:
			// https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#attr-spellcheck
			if (value == null || value === false) {
				if (ns) node.removeAttributeNS("http://www.w3.org/1999/xlink", name.toLowerCase());else node.removeAttribute(name);
			} else if (typeof value === "string") {
				if (ns) {
					node.setAttributeNS("http://www.w3.org/1999/xlink", name.toLowerCase(), value);
				} else {
					node.setAttribute(name, value);
				}
			}
		}
	}

	/**
	 * Proxy an event to hooked event handlers
	 * @param {Event} e The event object from the browser
	 * @private
	 */
	function eventProxy(e) {
		return this._listeners[e.type](options.event && options.event(e) || e);
	}

	/** Diff recursion count, used to track the end of the diff cycle. */
	var diffLevel = 0;

	/** Global flag indicating if the diff is currently within an SVG */
	var isSvgMode = false;

	/** Global flag indicating if the diff is performing hydration */
	var hydrating = false;

	/** Apply differences in a given vnode (and it's deep children) to a real DOM Node.
	 *	@param {Element} [dom=null]		A DOM node to mutate into the shape of the `vnode`
	 *	@param {VNode} vnode			A VNode (with descendants forming a tree) representing the desired DOM structure
	 *	@returns {Element} dom			The created/mutated element
	 *	@private
	 */
	function diff(dom, vnode, context, mountAll, parent, componentRoot) {
		// diffLevel having been 0 here indicates initial entry into the diff (not a subdiff)
		var ret = void 0;
		if (!diffLevel++) {
			// when first starting the diff, check if we're diffing an SVG or within an SVG
			isSvgMode = parent != null && parent.ownerSVGElement !== undefined;

			// hydration is indicated by the existing element to be diffed not having a prop cache
			hydrating = dom != null && !(ATTR_KEY in dom);
		}
		if (isArray(vnode)) {
			ret = [];
			var parentNode = null;
			if (isArray(dom)) {
				parentNode = dom[0].parentNode;
				dom.forEach(function (item, index) {
					ret.push(idiff(item, vnode[index], context, mountAll, componentRoot));
				});
			} else {
				vnode.forEach(function (item) {
					ret.push(idiff(dom, item, context, mountAll, componentRoot));
				});
			}		if (parent) {
				ret.forEach(function (vnode) {
					parent.appendChild(vnode);
				});
			} else if (isArray(dom)) {
				dom.forEach(function (node) {
					parentNode.appendChild(node);
				});
			}
		} else {
			ret = idiff(dom, vnode, context, mountAll, componentRoot);
			// append the element if its a new parent
			if (parent && ret.parentNode !== parent) parent.appendChild(ret);
		}

		// diffLevel being reduced to 0 means we're exiting the diff
		if (! --diffLevel) {
			hydrating = false;
			// invoke queued componentDidMount lifecycle methods
		}

		return ret;
	}

	/** Internals of `diff()`, separated to allow bypassing diffLevel / mount flushing. */
	function idiff(dom, vnode, context, mountAll, componentRoot) {
		var out = dom,
		    prevSvgMode = isSvgMode;

		// empty values (null, undefined, booleans) render as empty Text nodes
		if (vnode == null || typeof vnode === "boolean") vnode = "";

		// Fast case: Strings & Numbers create/update Text nodes.
		if (typeof vnode === "string" || typeof vnode === "number") {
			// update if it's already a Text node:
			if (dom && dom.splitText !== undefined && dom.parentNode && (!dom._component || componentRoot)) {
				/* istanbul ignore if */ /* Browser quirk that can't be covered: https://github.com/developit/preact/commit/fd4f21f5c45dfd75151bd27b4c217d8003aa5eb9 */
				if (dom.nodeValue != vnode) {
					dom.nodeValue = vnode;
				}
			} else {
				// it wasn't a Text node: replace it with one and recycle the old Element
				out = document.createTextNode(vnode);
				if (dom) {
					if (dom.parentNode) dom.parentNode.replaceChild(out, dom);
					recollectNodeTree(dom, true);
				}
			}

			out[ATTR_KEY] = true;

			return out;
		}

		// If the VNode represents a Component, perform a component diff:
		var vnodeName = vnode.nodeName;

		// Tracks entering and exiting SVG namespace when descending through the tree.
		isSvgMode = vnodeName === "svg" ? true : vnodeName === "foreignObject" ? false : isSvgMode;

		// If there's no existing element or it's the wrong type, create a new one:
		vnodeName = String(vnodeName);
		if (!dom || !isNamedNode(dom, vnodeName)) {
			out = createNode(vnodeName, isSvgMode);

			if (dom) {
				// move children into the replacement node
				while (dom.firstChild) {
					out.appendChild(dom.firstChild);
				} // if the previous Element was mounted into the DOM, replace it inline
				if (dom.parentNode) dom.parentNode.replaceChild(out, dom);

				// recycle the old element (skips non-Element node types)
				recollectNodeTree(dom, true);
			}
		}

		var fc = out.firstChild,
		    props = out[ATTR_KEY],
		    vchildren = vnode.children;

		if (props == null) {
			props = out[ATTR_KEY] = {};
			for (var a = out.attributes, i = a.length; i--;) {
				props[a[i].name] = a[i].value;
			}
		}

		// Optimization: fast-path for elements containing a single TextNode:
		if (!hydrating && vchildren && vchildren.length === 1 && typeof vchildren[0] === "string" && fc != null && fc.splitText !== undefined && fc.nextSibling == null) {
			if (fc.nodeValue != vchildren[0]) {
				fc.nodeValue = vchildren[0];
			}
		}
		// otherwise, if there are existing or new children, diff them:
		else if (vchildren && vchildren.length || fc != null) {
				innerDiffNode(out, vchildren, context, mountAll, hydrating || props.dangerouslySetInnerHTML != null);
			}

		// Apply attributes/props from VNode to the DOM Element:
		diffAttributes(out, vnode.attributes, props);

		out.props && (out.props.children = vnode.children);

		// restore previous SVG mode: (in case we're exiting an SVG namespace)
		isSvgMode = prevSvgMode;

		return out;
	}

	/** Apply child and attribute changes between a VNode and a DOM Node to the DOM.
	 *	@param {Element} dom			Element whose children should be compared & mutated
	 *	@param {Array} vchildren		Array of VNodes to compare to `dom.childNodes`
	 *	@param {Object} context			Implicitly descendant context object (from most recent `getChildContext()`)
	 *	@param {Boolean} mountAll
	 *	@param {Boolean} isHydrating	If `true`, consumes externally created elements similar to hydration
	 */
	function innerDiffNode(dom, vchildren, context, mountAll, isHydrating) {
		var originalChildren = dom.childNodes,
		    children = [],
		    keyed = {},
		    keyedLen = 0,
		    min = 0,
		    len = originalChildren.length,
		    childrenLen = 0,
		    vlen = vchildren ? vchildren.length : 0,
		    j = void 0,
		    c = void 0,
		    f = void 0,
		    vchild = void 0,
		    child = void 0;

		// Build up a map of keyed children and an Array of unkeyed children:
		if (len !== 0) {
			for (var i = 0; i < len; i++) {
				var _child = originalChildren[i],
				    props = _child[ATTR_KEY],
				    key = vlen && props ? _child._component ? _child._component.__key : props.key : null;
				if (key != null) {
					keyedLen++;
					keyed[key] = _child;
				} else if (props || (_child.splitText !== undefined ? isHydrating ? _child.nodeValue.trim() : true : isHydrating)) {
					children[childrenLen++] = _child;
				}
			}
		}

		if (vlen !== 0) {
			for (var _i = 0; _i < vlen; _i++) {
				vchild = vchildren[_i];
				child = null;

				// attempt to find a node based on key matching
				var _key = vchild.key;
				if (_key != null) {
					if (keyedLen && keyed[_key] !== undefined) {
						child = keyed[_key];
						keyed[_key] = undefined;
						keyedLen--;
					}
				}
				// attempt to pluck a node of the same type from the existing children
				else if (!child && min < childrenLen) {
						for (j = min; j < childrenLen; j++) {
							if (children[j] !== undefined && isSameNodeType(c = children[j], vchild, isHydrating)) {
								child = c;
								children[j] = undefined;
								if (j === childrenLen - 1) childrenLen--;
								if (j === min) min++;
								break;
							}
						}
					}

				// morph the matched/found/created DOM child to match vchild (deep)
				child = idiff(child, vchild, context, mountAll);

				f = originalChildren[_i];
				if (child && child !== dom && child !== f) {
					if (f == null) {
						dom.appendChild(child);
					} else if (child === f.nextSibling) {
						removeNode(f);
					} else {
						dom.insertBefore(child, f);
					}
				}
			}
		}

		// remove unused keyed children:
		if (keyedLen) {
			for (var _i2 in keyed) {
				if (keyed[_i2] !== undefined) recollectNodeTree(keyed[_i2], false);
			}
		}

		// remove orphaned unkeyed children:
		while (min <= childrenLen) {
			if ((child = children[childrenLen--]) !== undefined) recollectNodeTree(child, false);
		}
	}

	/** Recursively recycle (or just unmount) a node and its descendants.
	 *	@param {Node} node						DOM node to start unmount/removal from
	 *	@param {Boolean} [unmountOnly=false]	If `true`, only triggers unmount lifecycle, skips removal
	 */
	function recollectNodeTree(node, unmountOnly) {
		// If the node's VNode had a ref function, invoke it with null here.
		// (this is part of the React spec, and smart for unsetting references)
		if (node[ATTR_KEY] != null && node[ATTR_KEY].ref) node[ATTR_KEY].ref(null);

		if (unmountOnly === false || node[ATTR_KEY] == null) {
			removeNode(node);
		}

		removeChildren(node);
	}

	/** Recollect/unmount all children.
	 *	- we use .lastChild here because it causes less reflow than .firstChild
	 *	- it's also cheaper than accessing the .childNodes Live NodeList
	 */
	function removeChildren(node) {
		node = node.lastChild;
		while (node) {
			var next = node.previousSibling;
			recollectNodeTree(node, true);
			node = next;
		}
	}

	/** Apply differences in attributes from a VNode to the given DOM Element.
	 *	@param {Element} dom		Element with attributes to diff `attrs` against
	 *	@param {Object} attrs		The desired end-state key-value attribute pairs
	 *	@param {Object} old			Current/previous attributes (from previous VNode or element's prop cache)
	 */
	function diffAttributes(dom, attrs, old) {
		var name = void 0;
		var update = false;
		var isWeElement = dom.update;
		// remove attributes no longer present on the vnode by setting them to undefined
		for (name in old) {
			if (!(attrs && attrs[name] != null) && old[name] != null) {
				setAccessor(dom, name, old[name], old[name] = undefined, isSvgMode);
				if (isWeElement) {
					delete dom.props[name];
					update = true;
				}
			}
		}

		// add new & update changed attributes
		for (name in attrs) {
			//diable when using store system?
			//!dom.store &&
			if (isWeElement && typeof attrs[name] === "object") {
				dom.props[npn(name)] = attrs[name];
				update = true;
			} else if (name !== "children" && name !== "innerHTML" && (!(name in old) || attrs[name] !== (name === "value" || name === "checked" ? dom[name] : old[name]))) {
				setAccessor(dom, name, old[name], old[name] = attrs[name], isSvgMode);
				if (isWeElement) {
					dom.props[npn(name)] = attrs[name];
					update = true;
				}
			}
		}

		dom.parentNode && update && isWeElement && dom.update();
	}

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	var WeElement = function (_HTMLElement) {
		_inherits(WeElement, _HTMLElement);

		function WeElement() {
			_classCallCheck(this, WeElement);

			var _this = _possibleConstructorReturn(this, _HTMLElement.call(this));

			_this.props = nProps(_this.constructor.props);
			_this.data = _this.constructor.data || {};
			return _this;
		}

		WeElement.prototype.connectedCallback = function connectedCallback() {
			if (!this.constructor.pure) {
				var p = this.parentNode;
				while (p && !this.store) {
					this.store = p.store;
					p = p.parentNode || p.host;
				}
				if (this.store) {
					this.store.instances.push(this);
				}
			}

			this.install();
			options.afterInstall && options.afterInstall(this);
			var shadowRoot = this.attachShadow({ mode: "open" });

			this.css && shadowRoot.appendChild(cssToDom(this.css()));
			this.beforeRender();
			this.host = diff(null, this.render(this.props, !this.constructor.pure && this.store ? this.store.data : this.data), {}, false, null, false);
			if (isArray(this.host)) {
				this.host.forEach(function (item) {
					shadowRoot.appendChild(item);
				});
			} else {
				shadowRoot.appendChild(this.host);
			}
			this.installed();
			this._isInstalled = true;
		};

		WeElement.prototype.disconnectedCallback = function disconnectedCallback() {
			this.uninstall();
			if (this.store) {
				for (var i = 0, len = this.store.instances.length; i < len; i++) {
					if (this.store.instances[i] === this) {
						this.store.instances.splice(i, 1);
						break;
					}
				}
			}
		};

		WeElement.prototype.update = function update() {
			this.beforeUpdate();
			this.beforeRender();
			diff(this.host, this.render(this.props, !this.constructor.pure && this.store ? this.store.data : this.data));
			this.afterUpdate();
		};

		WeElement.prototype.fire = function fire(name, data) {
			this.dispatchEvent(new CustomEvent(name, { detail: data }));
		};

		WeElement.prototype.install = function install() {};

		WeElement.prototype.installed = function installed() {};

		WeElement.prototype.uninstall = function uninstall() {};

		WeElement.prototype.beforeUpdate = function beforeUpdate() {};

		WeElement.prototype.afterUpdate = function afterUpdate() {};

		WeElement.prototype.beforeRender = function beforeRender() {};

		return WeElement;
	}(HTMLElement);

	/*!
	 * https://github.com/Palindrom/JSONPatcherProxy
	 * (c) 2017 Starcounter
	 * MIT license
	 */

	/** Class representing a JS Object observer  */
	var JSONPatcherProxy = function () {
		/**
	  * Deep clones your object and returns a new object.
	  */
		function deepClone(obj) {
			switch (typeof obj) {
				case "object":
					return JSON.parse(JSON.stringify(obj)); //Faster than ES5 clone - http://jsperf.com/deep-cloning-of-objects/5
				case "undefined":
					return null; //this is how JSON.stringify behaves for array items
				default:
					return obj; //no need to clone primitives
			}
		}
		JSONPatcherProxy.deepClone = deepClone;

		function escapePathComponent(str) {
			if (str.indexOf("/") == -1 && str.indexOf("~") == -1) return str;
			return str.replace(/~/g, "~0").replace(/\//g, "~1");
		}
		JSONPatcherProxy.escapePathComponent = escapePathComponent;

		/**
	  * Walk up the parenthood tree to get the path
	  * @param {JSONPatcherProxy} instance
	  * @param {Object} obj the object you need to find its path
	  */
		function findObjectPath(instance, obj) {
			var pathComponents = [];
			var parentAndPath = instance.parenthoodMap.get(obj);
			while (parentAndPath && parentAndPath.path) {
				// because we're walking up-tree, we need to use the array as a stack
				pathComponents.unshift(parentAndPath.path);
				parentAndPath = instance.parenthoodMap.get(parentAndPath.parent);
			}
			if (pathComponents.length) {
				var path = pathComponents.join("/");
				return "/" + path;
			}
			return "";
		}
		/**
	  * A callback to be used as th proxy set trap callback.
	  * It updates parenthood map if needed, proxifies nested newly-added objects, calls default callbacks with the changes occurred.
	  * @param {JSONPatcherProxy} instance JSONPatcherProxy instance
	  * @param {Object} target the affected object
	  * @param {String} key the effect property's name
	  * @param {Any} newValue the value being set
	  */
		function setTrap(instance, target, key, newValue) {
			var parentPath = findObjectPath(instance, target);

			var destinationPropKey = parentPath + "/" + escapePathComponent(key);

			if (instance.proxifiedObjectsMap.has(newValue)) {
				var newValueOriginalObject = instance.proxifiedObjectsMap.get(newValue);

				instance.parenthoodMap.set(newValueOriginalObject.originalObject, {
					parent: target,
					path: key
				});
			}
			/*
	        mark already proxified values as inherited.
	        rationale: proxy.arr.shift()
	        will emit
	        {op: replace, path: '/arr/1', value: arr_2}
	        {op: remove, path: '/arr/2'}
	          by default, the second operation would revoke the proxy, and this renders arr revoked.
	        That's why we need to remember the proxies that are inherited.
	      */
			var revokableInstance = instance.proxifiedObjectsMap.get(newValue);
			/*
	    Why do we need to check instance.isProxifyingTreeNow?
	      We need to make sure we mark revokables as inherited ONLY when we're observing,
	    because throughout the first proxification, a sub-object is proxified and then assigned to
	    its parent object. This assignment of a pre-proxified object can fool us into thinking
	    that it's a proxified object moved around, while in fact it's the first assignment ever.
	      Checking isProxifyingTreeNow ensures this is not happening in the first proxification,
	    but in fact is is a proxified object moved around the tree
	    */
			if (revokableInstance && !instance.isProxifyingTreeNow) {
				revokableInstance.inherited = true;
			}

			// if the new value is an object, make sure to watch it
			if (newValue && typeof newValue == "object" && !instance.proxifiedObjectsMap.has(newValue)) {
				instance.parenthoodMap.set(newValue, {
					parent: target,
					path: key
				});
				newValue = instance._proxifyObjectTreeRecursively(target, newValue, key);
			}
			// let's start with this operation, and may or may not update it later
			var operation = {
				op: "remove",
				path: destinationPropKey
			};
			if (typeof newValue == "undefined") {
				// applying De Morgan's laws would be a tad faster, but less readable
				if (!Array.isArray(target) && !target.hasOwnProperty(key)) {
					// `undefined` is being set to an already undefined value, keep silent
					return Reflect.set(target, key, newValue);
				}
				// when array element is set to `undefined`, should generate replace to `null`
				if (Array.isArray(target)) {
					// undefined array elements are JSON.stringified to `null`
					operation.op = "replace", operation.value = null;
				}
				var oldValue = instance.proxifiedObjectsMap.get(target[key]);
				// was the deleted a proxified object?
				if (oldValue) {
					instance.parenthoodMap.delete(target[key]);
					instance.disableTrapsForProxy(oldValue);
					instance.proxifiedObjectsMap.delete(oldValue);
				}
			} else {
				if (Array.isArray(target) && !Number.isInteger(+key.toString())) {
					/* array props (as opposed to indices) don't emit any patches, to avoid needless `length` patches */
					if (key != "length") {
						console.warn("JSONPatcherProxy noticed a non-integer prop was set for an array. This will not emit a patch");
					}
					return Reflect.set(target, key, newValue);
				}
				operation.op = "add";
				if (target.hasOwnProperty(key)) {
					if (typeof target[key] !== "undefined" || Array.isArray(target)) {
						operation.op = "replace"; // setting `undefined` array elements is a `replace` op
					}
				}
				operation.value = newValue;
			}
			var reflectionResult = Reflect.set(target, key, newValue);
			instance.defaultCallback(operation);
			return reflectionResult;
		}
		/**
	  * A callback to be used as th proxy delete trap callback.
	  * It updates parenthood map if needed, calls default callbacks with the changes occurred.
	  * @param {JSONPatcherProxy} instance JSONPatcherProxy instance
	  * @param {Object} target the effected object
	  * @param {String} key the effected property's name
	  */
		function deleteTrap(instance, target, key) {
			if (typeof target[key] !== "undefined") {
				var parentPath = findObjectPath(instance, target);
				var destinationPropKey = parentPath + "/" + escapePathComponent(key);

				var revokableProxyInstance = instance.proxifiedObjectsMap.get(target[key]);

				if (revokableProxyInstance) {
					if (revokableProxyInstance.inherited) {
						/*
	            this is an inherited proxy (an already proxified object that was moved around),
	            we shouldn't revoke it, because even though it was removed from path1, it is still used in path2.
	            And we know that because we mark moved proxies with `inherited` flag when we move them
	              it is a good idea to remove this flag if we come across it here, in deleteProperty trap.
	            We DO want to revoke the proxy if it was removed again.
	          */
						revokableProxyInstance.inherited = false;
					} else {
						instance.parenthoodMap.delete(revokableProxyInstance.originalObject);
						instance.disableTrapsForProxy(revokableProxyInstance);
						instance.proxifiedObjectsMap.delete(target[key]);
					}
				}
				var reflectionResult = Reflect.deleteProperty(target, key);

				instance.defaultCallback({
					op: "remove",
					path: destinationPropKey
				});

				return reflectionResult;
			}
		}
		/* pre-define resume and pause functions to enhance constructors performance */
		function resume() {
			var _this = this;

			this.defaultCallback = function (operation) {
				_this.isRecording && _this.patches.push(operation);
				_this.userCallback && _this.userCallback(operation);
			};
			this.isObserving = true;
		}
		function pause() {
			this.defaultCallback = function () {};
			this.isObserving = false;
		}
		/**
	  * Creates an instance of JSONPatcherProxy around your object of interest `root`.
	  * @param {Object|Array} root - the object you want to wrap
	  * @param {Boolean} [showDetachedWarning = true] - whether to log a warning when a detached sub-object is modified @see {@link https://github.com/Palindrom/JSONPatcherProxy#detached-objects}
	  * @returns {JSONPatcherProxy}
	  * @constructor
	  */
		function JSONPatcherProxy(root, showDetachedWarning) {
			this.isProxifyingTreeNow = false;
			this.isObserving = false;
			this.proxifiedObjectsMap = new Map();
			this.parenthoodMap = new Map();
			// default to true
			if (typeof showDetachedWarning !== "boolean") {
				showDetachedWarning = true;
			}

			this.showDetachedWarning = showDetachedWarning;
			this.originalObject = root;
			this.cachedProxy = null;
			this.isRecording = false;
			this.userCallback;
			/**
	   * @memberof JSONPatcherProxy
	   * Restores callback back to the original one provided to `observe`.
	   */
			this.resume = resume.bind(this);
			/**
	   * @memberof JSONPatcherProxy
	   * Replaces your callback with a noop function.
	   */
			this.pause = pause.bind(this);
		}

		JSONPatcherProxy.prototype.generateProxyAtPath = function (parent, obj, path) {
			var _this2 = this;

			if (!obj) {
				return obj;
			}
			var traps = {
				set: function set(target, key, value, receiver) {
					return setTrap(_this2, target, key, value, receiver);
				},
				deleteProperty: function deleteProperty(target, key) {
					return deleteTrap(_this2, target, key);
				}
			};
			var revocableInstance = Proxy.revocable(obj, traps);
			// cache traps object to disable them later.
			revocableInstance.trapsInstance = traps;
			revocableInstance.originalObject = obj;

			/* keeping track of object's parent and path */

			this.parenthoodMap.set(obj, { parent: parent, path: path });

			/* keeping track of all the proxies to be able to revoke them later */
			this.proxifiedObjectsMap.set(revocableInstance.proxy, revocableInstance);
			return revocableInstance.proxy;
		};
		// grab tree's leaves one by one, encapsulate them into a proxy and return
		JSONPatcherProxy.prototype._proxifyObjectTreeRecursively = function (parent, root, path) {
			for (var key in root) {
				if (root.hasOwnProperty(key)) {
					if (root[key] instanceof Object) {
						root[key] = this._proxifyObjectTreeRecursively(root, root[key], escapePathComponent(key));
					}
				}
			}
			return this.generateProxyAtPath(parent, root, path);
		};
		// this function is for aesthetic purposes
		JSONPatcherProxy.prototype.proxifyObjectTree = function (root) {
			/*
	    while proxyifying object tree,
	    the proxyifying operation itself is being
	    recorded, which in an unwanted behavior,
	    that's why we disable recording through this
	    initial process;
	    */
			this.pause();
			this.isProxifyingTreeNow = true;
			var proxifiedObject = this._proxifyObjectTreeRecursively(undefined, root, "");
			/* OK you can record now */
			this.isProxifyingTreeNow = false;
			this.resume();
			return proxifiedObject;
		};
		/**
	  * Turns a proxified object into a forward-proxy object; doesn't emit any patches anymore, like a normal object
	  * @param {Proxy} proxy - The target proxy object
	  */
		JSONPatcherProxy.prototype.disableTrapsForProxy = function (revokableProxyInstance) {
			if (this.showDetachedWarning) {
				var message = "You're accessing an object that is detached from the observedObject tree, see https://github.com/Palindrom/JSONPatcherProxy#detached-objects";

				revokableProxyInstance.trapsInstance.set = function (targetObject, propKey, newValue) {
					console.warn(message);
					return Reflect.set(targetObject, propKey, newValue);
				};
				revokableProxyInstance.trapsInstance.set = function (targetObject, propKey, newValue) {
					console.warn(message);
					return Reflect.set(targetObject, propKey, newValue);
				};
				revokableProxyInstance.trapsInstance.deleteProperty = function (targetObject, propKey) {
					return Reflect.deleteProperty(targetObject, propKey);
				};
			} else {
				delete revokableProxyInstance.trapsInstance.set;
				delete revokableProxyInstance.trapsInstance.get;
				delete revokableProxyInstance.trapsInstance.deleteProperty;
			}
		};
		/**
	  * Proxifies the object that was passed in the constructor and returns a proxified mirror of it. Even though both parameters are options. You need to pass at least one of them.
	  * @param {Boolean} [record] - whether to record object changes to a later-retrievable patches array.
	  * @param {Function} [callback] - this will be synchronously called with every object change with a single `patch` as the only parameter.
	  */
		JSONPatcherProxy.prototype.observe = function (record, callback) {
			if (!record && !callback) {
				throw new Error("You need to either record changes or pass a callback");
			}
			this.isRecording = record;
			this.userCallback = callback;
			/*
	    I moved it here to remove it from `unobserve`,
	    this will also make the constructor faster, why initiate
	    the array before they decide to actually observe with recording?
	    They might need to use only a callback.
	    */
			if (record) this.patches = [];
			this.cachedProxy = this.proxifyObjectTree(this.originalObject);
			return this.cachedProxy;
		};
		/**
	  * If the observed is set to record, it will synchronously return all the patches and empties patches array.
	  */
		JSONPatcherProxy.prototype.generate = function () {
			if (!this.isRecording) {
				throw new Error("You should set record to true to get patches later");
			}
			return this.patches.splice(0, this.patches.length);
		};
		/**
	  * Revokes all proxies rendering the observed object useless and good for garbage collection @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy/revocable}
	  */
		JSONPatcherProxy.prototype.revoke = function () {
			this.proxifiedObjectsMap.forEach(function (el) {
				el.revoke();
			});
		};
		/**
	  * Disables all proxies' traps, turning the observed object into a forward-proxy object, like a normal object that you can modify silently.
	  */
		JSONPatcherProxy.prototype.disableTraps = function () {
			this.proxifiedObjectsMap.forEach(this.disableTrapsForProxy, this);
		};
		return JSONPatcherProxy;
	}();

	var timeout = null;
	var patchs = {};

	var handler = function handler(patch, store) {
		clearTimeout(timeout);
		if (patch.op === "remove") {
			// fix arr splice
			var kv = getArrayPatch(patch.path, store);
			patchs[kv.k] = kv.v;
			timeout = setTimeout(function () {
				update(patchs, store);
				patchs = {};
			});
		} else {
			var key = fixPath(patch.path);
			patchs[key] = patch.value;
			timeout = setTimeout(function () {
				update(patchs, store);
				patchs = {};
			});
		}
	};

	function render(vnode, parent, store) {
		parent = typeof parent === "string" ? document.querySelector(parent) : parent;
		if (store) {
			store.instances = [];
			extendStoreUpate(store);
			store.data = new JSONPatcherProxy(store.data).observe(true, function (patch) {
				handler(patch, store);
			});
			parent.store = store;
		}
		diff(null, vnode, {}, false, parent, false);
	}

	function update(patch, store) {
		store.update(patch);
	}

	function extendStoreUpate(store) {
		store.update = function (patch) {
			var _this = this;

			var updateAll = matchGlobalData(this.globalData, patch);

			if (Object.keys(patch).length > 0) {
				this.instances.forEach(function (instance) {
					if (updateAll || _this.updateAll || instance.constructor.updatePath && needUpdate(patch, instance.constructor.updatePath)) {
						instance.update();
					}
				});
				this.onChange && this.onChange(patch);
			}
		};
	}

	function matchGlobalData(globalData, diffResult) {
		if (!globalData) return false;
		for (var keyA in diffResult) {
			if (globalData.indexOf(keyA) > -1) {
				return true;
			}
			for (var i = 0, len = globalData.length; i < len; i++) {
				if (includePath(keyA, globalData[i])) {
					return true;
				}
			}
		}
		return false;
	}

	function needUpdate(diffResult, updatePath) {
		for (var keyA in diffResult) {
			if (updatePath[keyA]) {
				return true;
			}
			for (var keyB in updatePath) {
				if (includePath(keyA, keyB)) {
					return true;
				}
			}
		}
		return false;
	}

	function includePath(pathA, pathB) {
		if (pathA.indexOf(pathB) === 0) {
			var next = pathA.substr(pathB.length, 1);
			if (next === "[" || next === ".") {
				return true;
			}
		}
		return false;
	}

	function fixPath(path) {
		var mpPath = "";
		var arr = path.replace("/", "").split("/");
		arr.forEach(function (item, index) {
			if (index) {
				if (isNaN(Number(item))) {
					mpPath += "." + item;
				} else {
					mpPath += "[" + item + "]";
				}
			} else {
				mpPath += item;
			}
		});
		return mpPath;
	}

	function getArrayPatch(path, store) {
		var arr = path.replace("/", "").split("/");
		var current = store.data[arr[0]];
		for (var i = 1, len = arr.length; i < len - 1; i++) {
			current = current[arr[i]];
		}
		return { k: fixArrPath(path), v: current };
	}

	function fixArrPath(path) {
		var mpPath = "";
		var arr = path.replace("/", "").split("/");
		var len = arr.length;
		arr.forEach(function (item, index) {
			if (index < len - 1) {
				if (index) {
					if (isNaN(Number(item))) {
						mpPath += "." + item;
					} else {
						mpPath += "[" + item + "]";
					}
				} else {
					mpPath += item;
				}
			}
		});
		return mpPath;
	}

	var OBJECTTYPE = "[object Object]";
	var ARRAYTYPE = "[object Array]";

	function define(name, ctor) {
		customElements.define(name, ctor);
		if (ctor.data && !ctor.pure) {
			ctor.updatePath = getUpdatePath(ctor.data);
		}
	}

	function getUpdatePath(data) {
		var result = {};
		dataToPath(data, result);
		return result;
	}

	function dataToPath(data, result) {
		Object.keys(data).forEach(function (key) {
			result[key] = true;
			var type = Object.prototype.toString.call(data[key]);
			if (type === OBJECTTYPE) {
				_objToPath(data[key], key, result);
			} else if (type === ARRAYTYPE) {
				_arrayToPath(data[key], key, result);
			}
		});
	}

	function _objToPath(data, path, result) {
		Object.keys(data).forEach(function (key) {
			result[path + "." + key] = true;
			delete result[path];
			var type = Object.prototype.toString.call(data[key]);
			if (type === OBJECTTYPE) {
				_objToPath(data[key], path + "." + key, result);
			} else if (type === ARRAYTYPE) {
				_arrayToPath(data[key], path + "." + key, result);
			}
		});
	}

	function _arrayToPath(data, path, result) {
		data.forEach(function (item, index) {
			result[path + "[" + index + "]"] = true;
			delete result[path];
			var type = Object.prototype.toString.call(item);
			if (type === OBJECTTYPE) {
				_objToPath(item, path + "[" + index + "]", result);
			} else if (type === ARRAYTYPE) {
				_arrayToPath(item, path + "[" + index + "]", result);
			}
		});
	}

	function tag(name, pure) {
		return function (target) {
			target.pure = pure;
			define(name, target);
		};
	}

	var omi = {
		tag: tag,
		WeElement: WeElement,
		render: render,
		h: h,
		createElement: h,
		options: options,
		define: define
	};

	options.root.Omi = omi;
	options.root.Omi.version = "4.0.7";

	/**
	 * omi v4.0.7  https://tencent.github.io/omi/
	 * Omi === Preact + Scoped CSS + Store System + Native Support in 3kb javascript.
	 * By dntzhang https://github.com/dntzhang
	 * Github: https://github.com/Tencent/omi
	 * MIT Licensed.
	 */

	/** Virtual DOM Node */
	function VNode$1() {}

	function getGlobal$1() {
		if (typeof global !== "object" || !global || global.Math !== Math || global.Array !== Array) {
			return self || window || global || function () {
				return this;
			}();
		}
		return global;
	}

	/** Global options
	 *	@public
	 *	@namespace options {Object}
	 */
	var options$1 = {
		store: null,
		root: getGlobal$1()
	};

	var stack$1 = [];
	var EMPTY_CHILDREN$1 = [];

	function h$1(nodeName, attributes) {
		var children = EMPTY_CHILDREN$1,
		    lastSimple,
		    child,
		    simple,
		    i;
		for (i = arguments.length; i-- > 2;) {
			stack$1.push(arguments[i]);
		}
		if (attributes && attributes.children != null) {
			if (!stack$1.length) stack$1.push(attributes.children);
			delete attributes.children;
		}
		while (stack$1.length) {
			if ((child = stack$1.pop()) && child.pop !== undefined) {
				for (i = child.length; i--;) {
					stack$1.push(child[i]);
				}
			} else {
				if (typeof child === "boolean") child = null;

				if (simple = typeof nodeName !== "function") {
					if (child == null) child = "";else if (typeof child === "number") child = String(child);else if (typeof child !== "string") simple = false;
				}

				if (simple && lastSimple) {
					children[children.length - 1] += child;
				} else if (children === EMPTY_CHILDREN$1) {
					children = [child];
				} else {
					children.push(child);
				}

				lastSimple = simple;
			}
		}

		var p = new VNode$1();
		p.nodeName = nodeName;
		p.children = children;
		p.attributes = attributes == null ? undefined : attributes;
		p.key = attributes == null ? undefined : attributes.key;

		// if a "vnode hook" is defined, pass every created VNode to it
		if (options$1.vnode !== undefined) options$1.vnode(p);

		return p;
	}

	/**
	 * @license
	 * Copyright (c) 2016 The Polymer Project Authors. All rights reserved.
	 * This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
	 * The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
	 * The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
	 * Code distributed by Google as part of the polymer project is also
	 * subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
	 */

	/**
	 * This shim allows elements written in, or compiled to, ES5 to work on native
	 * implementations of Custom Elements v1. It sets new.target to the value of
	 * this.constructor so that the native HTMLElement constructor can access the
	 * current under-construction element's definition.
	 */
	(function () {
		if (
		// No Reflect, no classes, no need for shim because native custom elements
		// require ES2015 classes or Reflect.
		window.Reflect === undefined || window.customElements === undefined ||
		// The webcomponentsjs custom elements polyfill doesn't require
		// ES2015-compatible construction (`super()` or `Reflect.construct`).
		window.customElements.hasOwnProperty("polyfillWrapFlushCallback")) {
			return;
		}
		var BuiltInHTMLElement = HTMLElement;
		window.HTMLElement = function HTMLElement() {
			return Reflect.construct(BuiltInHTMLElement, [], this.constructor);
		};
		HTMLElement.prototype = BuiltInHTMLElement.prototype;
		HTMLElement.prototype.constructor = HTMLElement;
		Object.setPrototypeOf(HTMLElement, BuiltInHTMLElement);
	})();

	function cssToDom$1(css) {
		var node = document.createElement("style");
		node.textContent = css;
		return node;
	}

	function npn$1(str) {
		return str.replace(/-(\w)/g, function ($, $1) {
			return $1.toUpperCase();
		});
	}

	/** Invoke or update a ref, depending on whether it is a function or object ref.
	 *  @param {object|function} [ref=null]
	 *  @param {any} [value]
	 */
	function applyRef$1(ref, value) {
		if (ref != null) {
			if (typeof ref == "function") ref(value);else ref.current = value;
		}
	}

	/**
	 * Call a function asynchronously, as soon as possible. Makes
	 * use of HTML Promise to schedule the callback if available,
	 * otherwise falling back to `setTimeout` (mainly for IE<11).
	 * @type {(callback: function) => void}
	 */
	var defer$1 = typeof Promise == "function" ? Promise.resolve().then.bind(Promise.resolve()) : setTimeout;

	function isArray$1(obj) {
		return Object.prototype.toString.call(obj) === "[object Array]";
	}

	function nProps$1(props) {
		if (!props || isArray$1(props)) return {};
		var result = {};
		Object.keys(props).forEach(function (key) {
			result[key] = props[key].value;
		});
		return result;
	}

	// DOM properties that should NOT have "px" added when numeric
	var IS_NON_DIMENSIONAL$1 = /acit|ex(?:s|g|n|p|$)|rph|ows|mnc|ntw|ine[ch]|zoo|^ord/i;

	/**
	 * Check if two nodes are equivalent.
	 *
	 * @param {Node} node			DOM Node to compare
	 * @param {VNode} vnode			Virtual DOM node to compare
	 * @param {boolean} [hydrating=false]	If true, ignores component constructors when comparing.
	 * @private
	 */
	function isSameNodeType$1(node, vnode, hydrating) {
		if (typeof vnode === "string" || typeof vnode === "number") {
			return node.splitText !== undefined;
		}
		if (typeof vnode.nodeName === "string") {
			return !node._componentConstructor && isNamedNode$1(node, vnode.nodeName);
		}
		return hydrating || node._componentConstructor === vnode.nodeName;
	}

	/**
	 * Check if an Element has a given nodeName, case-insensitively.
	 *
	 * @param {Element} node	A DOM Element to inspect the name of.
	 * @param {String} nodeName	Unnormalized name to compare against.
	 */
	function isNamedNode$1(node, nodeName) {
		return node.normalizedNodeName === nodeName || node.nodeName.toLowerCase() === nodeName.toLowerCase();
	}

	/**
	 * A DOM event listener
	 * @typedef {(e: Event) => void} EventListner
	 */

	/**
	 * A mapping of event types to event listeners
	 * @typedef {Object.<string, EventListener>} EventListenerMap
	 */

	/**
	 * Properties Preact adds to elements it creates
	 * @typedef PreactElementExtensions
	 * @property {string} [normalizedNodeName] A normalized node name to use in diffing
	 * @property {EventListenerMap} [_listeners] A map of event listeners added by components to this DOM node
	 * @property {import('../component').Component} [_component] The component that rendered this DOM node
	 * @property {function} [_componentConstructor] The constructor of the component that rendered this DOM node
	 */

	/**
	 * A DOM element that has been extended with Preact properties
	 * @typedef {Element & ElementCSSInlineStyle & PreactElementExtensions} PreactElement
	 */

	/**
	 * Create an element with the given nodeName.
	 * @param {string} nodeName The DOM node to create
	 * @param {boolean} [isSvg=false] If `true`, creates an element within the SVG
	 *  namespace.
	 * @returns {PreactElement} The created DOM node
	 */
	function createNode$1(nodeName, isSvg) {
		/** @type {PreactElement} */
		var node = isSvg ? document.createElementNS("http://www.w3.org/2000/svg", nodeName) : document.createElement(nodeName);
		node.normalizedNodeName = nodeName;
		return node;
	}

	/**
	 * Remove a child node from its parent if attached.
	 * @param {Node} node The node to remove
	 */
	function removeNode$1(node) {
		var parentNode = node.parentNode;
		if (parentNode) parentNode.removeChild(node);
	}

	/**
	 * Set a named attribute on the given Node, with special behavior for some names
	 * and event handlers. If `value` is `null`, the attribute/handler will be
	 * removed.
	 * @param {PreactElement} node An element to mutate
	 * @param {string} name The name/key to set, such as an event or attribute name
	 * @param {*} old The last value that was set for this name/node pair
	 * @param {*} value An attribute value, such as a function to be used as an
	 *  event handler
	 * @param {boolean} isSvg Are we currently diffing inside an svg?
	 * @private
	 */
	function setAccessor$1(node, name, old, value, isSvg) {
		if (name === "className") name = "class";

		if (name === "key") {
			// ignore
		} else if (name === "ref") {
			applyRef$1(old, null);
			applyRef$1(value, node);
		} else if (name === "class" && !isSvg) {
			node.className = value || "";
		} else if (name === "style") {
			if (!value || typeof value === "string" || typeof old === "string") {
				node.style.cssText = value || "";
			}
			if (value && typeof value === "object") {
				if (typeof old !== "string") {
					for (var i in old) {
						if (!(i in value)) node.style[i] = "";
					}
				}
				for (var i in value) {
					node.style[i] = typeof value[i] === "number" && IS_NON_DIMENSIONAL$1.test(i) === false ? value[i] + "px" : value[i];
				}
			}
		} else if (name === "dangerouslySetInnerHTML") {
			if (value) node.innerHTML = value.__html || "";
		} else if (name[0] == "o" && name[1] == "n") {
			var useCapture = name !== (name = name.replace(/Capture$/, ""));
			name = name.toLowerCase().substring(2);
			if (value) {
				if (!old) node.addEventListener(name, eventProxy$1, useCapture);
			} else {
				node.removeEventListener(name, eventProxy$1, useCapture);
			}
			(node._listeners || (node._listeners = {}))[name] = value;
		} else if (name !== "list" && name !== "type" && !isSvg && name in node) {
			// Attempt to set a DOM property to the given value.
			// IE & FF throw for certain property-value combinations.
			try {
				node[name] = value == null ? "" : value;
			} catch (e) {}
			if ((value == null || value === false) && name != "spellcheck") node.removeAttribute(name);
		} else {
			var ns = isSvg && name !== (name = name.replace(/^xlink:?/, ""));
			// spellcheck is treated differently than all other boolean values and
			// should not be removed when the value is `false`. See:
			// https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#attr-spellcheck
			if (value == null || value === false) {
				if (ns) node.removeAttributeNS("http://www.w3.org/1999/xlink", name.toLowerCase());else node.removeAttribute(name);
			} else if (typeof value === "string") {
				if (ns) {
					node.setAttributeNS("http://www.w3.org/1999/xlink", name.toLowerCase(), value);
				} else {
					node.setAttribute(name, value);
				}
			}
		}
	}

	/**
	 * Proxy an event to hooked event handlers
	 * @param {Event} e The event object from the browser
	 * @private
	 */
	function eventProxy$1(e) {
		return this._listeners[e.type](options$1.event && options$1.event(e) || e);
	}

	/** Diff recursion count, used to track the end of the diff cycle. */
	var diffLevel$1 = 0;

	/** Global flag indicating if the diff is currently within an SVG */
	var isSvgMode$1 = false;

	/** Global flag indicating if the diff is performing hydration */
	var hydrating$1 = false;

	/** Apply differences in a given vnode (and it's deep children) to a real DOM Node.
	 *	@param {Element} [dom=null]		A DOM node to mutate into the shape of the `vnode`
	 *	@param {VNode} vnode			A VNode (with descendants forming a tree) representing the desired DOM structure
	 *	@returns {Element} dom			The created/mutated element
	 *	@private
	 */
	function diff$1(dom, vnode, context, mountAll, parent, componentRoot) {
		// diffLevel having been 0 here indicates initial entry into the diff (not a subdiff)
		var ret;
		if (!diffLevel$1++) {
			// when first starting the diff, check if we're diffing an SVG or within an SVG
			isSvgMode$1 = parent != null && parent.ownerSVGElement !== undefined;

			// hydration is indicated by the existing element to be diffed not having a prop cache
			hydrating$1 = dom != null && !("__preactattr_" in dom);
		}
		if (isArray$1(vnode)) {
			ret = [];
			var parentNode = null;
			if (isArray$1(dom)) {
				parentNode = dom[0].parentNode;
				dom.forEach(function (item, index) {
					ret.push(idiff$1(item, vnode[index], context, mountAll, componentRoot));
				});
			} else {
				vnode.forEach(function (item) {
					ret.push(idiff$1(dom, item, context, mountAll, componentRoot));
				});
			}		if (parent) {
				ret.forEach(function (vnode) {
					parent.appendChild(vnode);
				});
			} else if (isArray$1(dom)) {
				dom.forEach(function (node) {
					parentNode.appendChild(node);
				});
			}
		} else {
			ret = idiff$1(dom, vnode, context, mountAll, componentRoot);
			// append the element if its a new parent
			if (parent && ret.parentNode !== parent) parent.appendChild(ret);
		}

		// diffLevel being reduced to 0 means we're exiting the diff
		if (! --diffLevel$1) {
			hydrating$1 = false;
			// invoke queued componentDidMount lifecycle methods
		}

		return ret;
	}

	/** Internals of `diff()`, separated to allow bypassing diffLevel / mount flushing. */
	function idiff$1(dom, vnode, context, mountAll, componentRoot) {
		var out = dom,
		    prevSvgMode = isSvgMode$1;

		// empty values (null, undefined, booleans) render as empty Text nodes
		if (vnode == null || typeof vnode === "boolean") vnode = "";

		// Fast case: Strings & Numbers create/update Text nodes.
		if (typeof vnode === "string" || typeof vnode === "number") {
			// update if it's already a Text node:
			if (dom && dom.splitText !== undefined && dom.parentNode && (!dom._component || componentRoot)) {
				/* istanbul ignore if */ /* Browser quirk that can't be covered: https://github.com/developit/preact/commit/fd4f21f5c45dfd75151bd27b4c217d8003aa5eb9 */
				if (dom.nodeValue != vnode) {
					dom.nodeValue = vnode;
				}
			} else {
				// it wasn't a Text node: replace it with one and recycle the old Element
				out = document.createTextNode(vnode);
				if (dom) {
					if (dom.parentNode) dom.parentNode.replaceChild(out, dom);
					recollectNodeTree$1(dom, true);
				}
			}

			out["__preactattr_"] = true;

			return out;
		}

		// If the VNode represents a Component, perform a component diff:
		var vnodeName = vnode.nodeName;

		// Tracks entering and exiting SVG namespace when descending through the tree.
		isSvgMode$1 = vnodeName === "svg" ? true : vnodeName === "foreignObject" ? false : isSvgMode$1;

		// If there's no existing element or it's the wrong type, create a new one:
		vnodeName = String(vnodeName);
		if (!dom || !isNamedNode$1(dom, vnodeName)) {
			out = createNode$1(vnodeName, isSvgMode$1);

			if (dom) {
				// move children into the replacement node
				while (dom.firstChild) {
					out.appendChild(dom.firstChild);
				} // if the previous Element was mounted into the DOM, replace it inline
				if (dom.parentNode) dom.parentNode.replaceChild(out, dom);

				// recycle the old element (skips non-Element node types)
				recollectNodeTree$1(dom, true);
			}
		}

		var fc = out.firstChild,
		    props = out["__preactattr_"],
		    vchildren = vnode.children;

		if (props == null) {
			props = out["__preactattr_"] = {};
			for (var a = out.attributes, i = a.length; i--;) {
				props[a[i].name] = a[i].value;
			}
		}

		// Optimization: fast-path for elements containing a single TextNode:
		if (!hydrating$1 && vchildren && vchildren.length === 1 && typeof vchildren[0] === "string" && fc != null && fc.splitText !== undefined && fc.nextSibling == null) {
			if (fc.nodeValue != vchildren[0]) {
				fc.nodeValue = vchildren[0];
			}
		}
		// otherwise, if there are existing or new children, diff them:
		else if (vchildren && vchildren.length || fc != null) {
				innerDiffNode$1(out, vchildren, context, mountAll, hydrating$1 || props.dangerouslySetInnerHTML != null);
			}

		// Apply attributes/props from VNode to the DOM Element:
		diffAttributes$1(out, vnode.attributes, props);

		out.props && (out.props.children = vnode.children);

		// restore previous SVG mode: (in case we're exiting an SVG namespace)
		isSvgMode$1 = prevSvgMode;

		return out;
	}

	/** Apply child and attribute changes between a VNode and a DOM Node to the DOM.
	 *	@param {Element} dom			Element whose children should be compared & mutated
	 *	@param {Array} vchildren		Array of VNodes to compare to `dom.childNodes`
	 *	@param {Object} context			Implicitly descendant context object (from most recent `getChildContext()`)
	 *	@param {Boolean} mountAll
	 *	@param {Boolean} isHydrating	If `true`, consumes externally created elements similar to hydration
	 */
	function innerDiffNode$1(dom, vchildren, context, mountAll, isHydrating) {
		var originalChildren = dom.childNodes,
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
		    child;

		// Build up a map of keyed children and an Array of unkeyed children:
		if (len !== 0) {
			for (var i = 0; i < len; i++) {
				var _child = originalChildren[i],
				    props = _child["__preactattr_"],
				    key = vlen && props ? _child._component ? _child._component.__key : props.key : null;
				if (key != null) {
					keyedLen++;
					keyed[key] = _child;
				} else if (props || (_child.splitText !== undefined ? isHydrating ? _child.nodeValue.trim() : true : isHydrating)) {
					children[childrenLen++] = _child;
				}
			}
		}

		if (vlen !== 0) {
			for (var i = 0; i < vlen; i++) {
				vchild = vchildren[i];
				child = null;

				// attempt to find a node based on key matching
				var key = vchild.key;
				if (key != null) {
					if (keyedLen && keyed[key] !== undefined) {
						child = keyed[key];
						keyed[key] = undefined;
						keyedLen--;
					}
				}
				// attempt to pluck a node of the same type from the existing children
				else if (!child && min < childrenLen) {
						for (j = min; j < childrenLen; j++) {
							if (children[j] !== undefined && isSameNodeType$1(c = children[j], vchild, isHydrating)) {
								child = c;
								children[j] = undefined;
								if (j === childrenLen - 1) childrenLen--;
								if (j === min) min++;
								break;
							}
						}
					}

				// morph the matched/found/created DOM child to match vchild (deep)
				child = idiff$1(child, vchild, context, mountAll);

				f = originalChildren[i];
				if (child && child !== dom && child !== f) {
					if (f == null) {
						dom.appendChild(child);
					} else if (child === f.nextSibling) {
						removeNode$1(f);
					} else {
						dom.insertBefore(child, f);
					}
				}
			}
		}

		// remove unused keyed children:
		if (keyedLen) {
			for (var i in keyed) {
				if (keyed[i] !== undefined) recollectNodeTree$1(keyed[i], false);
			}
		}

		// remove orphaned unkeyed children:
		while (min <= childrenLen) {
			if ((child = children[childrenLen--]) !== undefined) recollectNodeTree$1(child, false);
		}
	}

	/** Recursively recycle (or just unmount) a node and its descendants.
	 *	@param {Node} node						DOM node to start unmount/removal from
	 *	@param {Boolean} [unmountOnly=false]	If `true`, only triggers unmount lifecycle, skips removal
	 */
	function recollectNodeTree$1(node, unmountOnly) {
		// If the node's VNode had a ref function, invoke it with null here.
		// (this is part of the React spec, and smart for unsetting references)
		if (node["__preactattr_"] != null && node["__preactattr_"].ref) node["__preactattr_"].ref(null);

		if (unmountOnly === false || node["__preactattr_"] == null) {
			removeNode$1(node);
		}

		removeChildren$1(node);
	}

	/** Recollect/unmount all children.
	 *	- we use .lastChild here because it causes less reflow than .firstChild
	 *	- it's also cheaper than accessing the .childNodes Live NodeList
	 */
	function removeChildren$1(node) {
		node = node.lastChild;
		while (node) {
			var next = node.previousSibling;
			recollectNodeTree$1(node, true);
			node = next;
		}
	}

	/** Apply differences in attributes from a VNode to the given DOM Element.
	 *	@param {Element} dom		Element with attributes to diff `attrs` against
	 *	@param {Object} attrs		The desired end-state key-value attribute pairs
	 *	@param {Object} old			Current/previous attributes (from previous VNode or element's prop cache)
	 */
	function diffAttributes$1(dom, attrs, old) {
		var name;
		var update = false;
		var isWeElement = dom.update;
		// remove attributes no longer present on the vnode by setting them to undefined
		for (name in old) {
			if (!(attrs && attrs[name] != null) && old[name] != null) {
				setAccessor$1(dom, name, old[name], old[name] = undefined, isSvgMode$1);
				if (isWeElement) {
					delete dom.props[name];
					update = true;
				}
			}
		}

		// add new & update changed attributes
		for (name in attrs) {
			//diable when using store system?
			//!dom.store &&
			if (isWeElement && typeof attrs[name] === "object") {
				dom.props[npn$1(name)] = attrs[name];
				update = true;
			} else if (name !== "children" && name !== "innerHTML" && (!(name in old) || attrs[name] !== (name === "value" || name === "checked" ? dom[name] : old[name]))) {
				setAccessor$1(dom, name, old[name], old[name] = attrs[name], isSvgMode$1);
				if (isWeElement) {
					dom.props[npn$1(name)] = attrs[name];
					update = true;
				}
			}
		}

		dom.parentNode && update && isWeElement && dom.update();
	}

	function _classCallCheck$1(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn$1(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits$1(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	var WeElement$1 = function (_HTMLElement) {
		_inherits$1(WeElement, _HTMLElement);

		function WeElement() {
			_classCallCheck$1(this, WeElement);

			var _this = _possibleConstructorReturn$1(this, _HTMLElement.call(this));

			_this.props = nProps$1(_this.constructor.props);
			_this.data = _this.constructor.data || {};
			return _this;
		}

		WeElement.prototype.connectedCallback = function connectedCallback() {
			if (!this.constructor.pure) {
				var p = this.parentNode;
				while (p && !this.store) {
					this.store = p.store;
					p = p.parentNode || p.host;
				}
				if (this.store) {
					this.store.instances.push(this);
				}
			}

			this.install();
			options$1.afterInstall && options$1.afterInstall(this);
			var shadowRoot = this.attachShadow({ mode: "open" });

			this.css && shadowRoot.appendChild(cssToDom$1(this.css()));
			this.beforeRender();
			this.host = diff$1(null, this.render(this.props, !this.constructor.pure && this.store ? this.store.data : this.data), {}, false, null, false);
			if (isArray$1(this.host)) {
				this.host.forEach(function (item) {
					shadowRoot.appendChild(item);
				});
			} else {
				shadowRoot.appendChild(this.host);
			}
			this.installed();
			this._isInstalled = true;
		};

		WeElement.prototype.disconnectedCallback = function disconnectedCallback() {
			this.uninstall();
			if (this.store) {
				for (var i = 0, len = this.store.instances.length; i < len; i++) {
					if (this.store.instances[i] === this) {
						this.store.instances.splice(i, 1);
						break;
					}
				}
			}
		};

		WeElement.prototype.update = function update() {
			this.beforeUpdate();
			this.beforeRender();
			diff$1(this.host, this.render(this.props, !this.constructor.pure && this.store ? this.store.data : this.data));
			this.afterUpdate();
		};

		WeElement.prototype.fire = function fire(name, data) {
			this.dispatchEvent(new CustomEvent(name, { detail: data }));
		};

		WeElement.prototype.install = function install() {};

		WeElement.prototype.installed = function installed() {};

		WeElement.prototype.uninstall = function uninstall() {};

		WeElement.prototype.beforeUpdate = function beforeUpdate() {};

		WeElement.prototype.afterUpdate = function afterUpdate() {};

		WeElement.prototype.beforeRender = function beforeRender() {};

		return WeElement;
	}(HTMLElement);

	/*!
	 * https://github.com/Palindrom/JSONPatcherProxy
	 * (c) 2017 Starcounter
	 * MIT license
	 */

	/** Class representing a JS Object observer  */
	var JSONPatcherProxy$1 = function () {
		/**
	  * Deep clones your object and returns a new object.
	  */
		function deepClone(obj) {
			switch (typeof obj) {
				case "object":
					return JSON.parse(JSON.stringify(obj)); //Faster than ES5 clone - http://jsperf.com/deep-cloning-of-objects/5
				case "undefined":
					return null; //this is how JSON.stringify behaves for array items
				default:
					return obj; //no need to clone primitives
			}
		}
		JSONPatcherProxy.deepClone = deepClone;

		function escapePathComponent(str) {
			if (str.indexOf("/") == -1 && str.indexOf("~") == -1) return str;
			return str.replace(/~/g, "~0").replace(/\//g, "~1");
		}
		JSONPatcherProxy.escapePathComponent = escapePathComponent;

		/**
	  * Walk up the parenthood tree to get the path
	  * @param {JSONPatcherProxy} instance
	  * @param {Object} obj the object you need to find its path
	  */
		function findObjectPath(instance, obj) {
			var pathComponents = [];
			var parentAndPath = instance.parenthoodMap.get(obj);
			while (parentAndPath && parentAndPath.path) {
				// because we're walking up-tree, we need to use the array as a stack
				pathComponents.unshift(parentAndPath.path);
				parentAndPath = instance.parenthoodMap.get(parentAndPath.parent);
			}
			if (pathComponents.length) {
				var path = pathComponents.join("/");
				return "/" + path;
			}
			return "";
		}
		/**
	  * A callback to be used as th proxy set trap callback.
	  * It updates parenthood map if needed, proxifies nested newly-added objects, calls default callbacks with the changes occurred.
	  * @param {JSONPatcherProxy} instance JSONPatcherProxy instance
	  * @param {Object} target the affected object
	  * @param {String} key the effect property's name
	  * @param {Any} newValue the value being set
	  */
		function setTrap(instance, target, key, newValue) {
			var parentPath = findObjectPath(instance, target);

			var destinationPropKey = parentPath + "/" + escapePathComponent(key);

			if (instance.proxifiedObjectsMap.has(newValue)) {
				var newValueOriginalObject = instance.proxifiedObjectsMap.get(newValue);

				instance.parenthoodMap.set(newValueOriginalObject.originalObject, {
					parent: target,
					path: key
				});
			}
			/*
	        mark already proxified values as inherited.
	        rationale: proxy.arr.shift()
	        will emit
	        {op: replace, path: '/arr/1', value: arr_2}
	        {op: remove, path: '/arr/2'}
	          by default, the second operation would revoke the proxy, and this renders arr revoked.
	        That's why we need to remember the proxies that are inherited.
	      */
			var revokableInstance = instance.proxifiedObjectsMap.get(newValue);
			/*
	    Why do we need to check instance.isProxifyingTreeNow?
	      We need to make sure we mark revokables as inherited ONLY when we're observing,
	    because throughout the first proxification, a sub-object is proxified and then assigned to
	    its parent object. This assignment of a pre-proxified object can fool us into thinking
	    that it's a proxified object moved around, while in fact it's the first assignment ever.
	      Checking isProxifyingTreeNow ensures this is not happening in the first proxification,
	    but in fact is is a proxified object moved around the tree
	    */
			if (revokableInstance && !instance.isProxifyingTreeNow) {
				revokableInstance.inherited = true;
			}

			// if the new value is an object, make sure to watch it
			if (newValue && typeof newValue == "object" && !instance.proxifiedObjectsMap.has(newValue)) {
				instance.parenthoodMap.set(newValue, {
					parent: target,
					path: key
				});
				newValue = instance._proxifyObjectTreeRecursively(target, newValue, key);
			}
			// let's start with this operation, and may or may not update it later
			var operation = {
				op: "remove",
				path: destinationPropKey
			};
			if (typeof newValue == "undefined") {
				// applying De Morgan's laws would be a tad faster, but less readable
				if (!Array.isArray(target) && !target.hasOwnProperty(key)) {
					// `undefined` is being set to an already undefined value, keep silent
					return Reflect.set(target, key, newValue);
				}
				// when array element is set to `undefined`, should generate replace to `null`
				if (Array.isArray(target)) {
					// undefined array elements are JSON.stringified to `null`
					operation.op = "replace", operation.value = null;
				}
				var oldValue = instance.proxifiedObjectsMap.get(target[key]);
				// was the deleted a proxified object?
				if (oldValue) {
					instance.parenthoodMap.delete(target[key]);
					instance.disableTrapsForProxy(oldValue);
					instance.proxifiedObjectsMap.delete(oldValue);
				}
			} else {
				if (Array.isArray(target) && !Number.isInteger(+key.toString())) {
					/* array props (as opposed to indices) don't emit any patches, to avoid needless `length` patches */
					if (key != "length") {
						console.warn("JSONPatcherProxy noticed a non-integer prop was set for an array. This will not emit a patch");
					}
					return Reflect.set(target, key, newValue);
				}
				operation.op = "add";
				if (target.hasOwnProperty(key)) {
					if (typeof target[key] !== "undefined" || Array.isArray(target)) {
						operation.op = "replace"; // setting `undefined` array elements is a `replace` op
					}
				}
				operation.value = newValue;
			}
			var reflectionResult = Reflect.set(target, key, newValue);
			instance.defaultCallback(operation);
			return reflectionResult;
		}
		/**
	  * A callback to be used as th proxy delete trap callback.
	  * It updates parenthood map if needed, calls default callbacks with the changes occurred.
	  * @param {JSONPatcherProxy} instance JSONPatcherProxy instance
	  * @param {Object} target the effected object
	  * @param {String} key the effected property's name
	  */
		function deleteTrap(instance, target, key) {
			if (typeof target[key] !== "undefined") {
				var parentPath = findObjectPath(instance, target);
				var destinationPropKey = parentPath + "/" + escapePathComponent(key);

				var revokableProxyInstance = instance.proxifiedObjectsMap.get(target[key]);

				if (revokableProxyInstance) {
					if (revokableProxyInstance.inherited) {
						/*
	            this is an inherited proxy (an already proxified object that was moved around),
	            we shouldn't revoke it, because even though it was removed from path1, it is still used in path2.
	            And we know that because we mark moved proxies with `inherited` flag when we move them
	              it is a good idea to remove this flag if we come across it here, in deleteProperty trap.
	            We DO want to revoke the proxy if it was removed again.
	          */
						revokableProxyInstance.inherited = false;
					} else {
						instance.parenthoodMap.delete(revokableProxyInstance.originalObject);
						instance.disableTrapsForProxy(revokableProxyInstance);
						instance.proxifiedObjectsMap.delete(target[key]);
					}
				}
				var reflectionResult = Reflect.deleteProperty(target, key);

				instance.defaultCallback({
					op: "remove",
					path: destinationPropKey
				});

				return reflectionResult;
			}
		}
		/* pre-define resume and pause functions to enhance constructors performance */
		function resume() {
			var _this = this;

			this.defaultCallback = function (operation) {
				_this.isRecording && _this.patches.push(operation);
				_this.userCallback && _this.userCallback(operation);
			};
			this.isObserving = true;
		}
		function pause() {
			this.defaultCallback = function () {};
			this.isObserving = false;
		}
		/**
	  * Creates an instance of JSONPatcherProxy around your object of interest `root`.
	  * @param {Object|Array} root - the object you want to wrap
	  * @param {Boolean} [showDetachedWarning = true] - whether to log a warning when a detached sub-object is modified @see {@link https://github.com/Palindrom/JSONPatcherProxy#detached-objects}
	  * @returns {JSONPatcherProxy}
	  * @constructor
	  */
		function JSONPatcherProxy(root, showDetachedWarning) {
			this.isProxifyingTreeNow = false;
			this.isObserving = false;
			this.proxifiedObjectsMap = new Map();
			this.parenthoodMap = new Map();
			// default to true
			if (typeof showDetachedWarning !== "boolean") {
				showDetachedWarning = true;
			}

			this.showDetachedWarning = showDetachedWarning;
			this.originalObject = root;
			this.cachedProxy = null;
			this.isRecording = false;
			this.userCallback;
			/**
	   * @memberof JSONPatcherProxy
	   * Restores callback back to the original one provided to `observe`.
	   */
			this.resume = resume.bind(this);
			/**
	   * @memberof JSONPatcherProxy
	   * Replaces your callback with a noop function.
	   */
			this.pause = pause.bind(this);
		}

		JSONPatcherProxy.prototype.generateProxyAtPath = function (parent, obj, path) {
			var _this2 = this;

			if (!obj) {
				return obj;
			}
			var traps = {
				set: function set(target, key, value, receiver) {
					return setTrap(_this2, target, key, value, receiver);
				},
				deleteProperty: function deleteProperty(target, key) {
					return deleteTrap(_this2, target, key);
				}
			};
			var revocableInstance = Proxy.revocable(obj, traps);
			// cache traps object to disable them later.
			revocableInstance.trapsInstance = traps;
			revocableInstance.originalObject = obj;

			/* keeping track of object's parent and path */

			this.parenthoodMap.set(obj, { parent: parent, path: path });

			/* keeping track of all the proxies to be able to revoke them later */
			this.proxifiedObjectsMap.set(revocableInstance.proxy, revocableInstance);
			return revocableInstance.proxy;
		};
		// grab tree's leaves one by one, encapsulate them into a proxy and return
		JSONPatcherProxy.prototype._proxifyObjectTreeRecursively = function (parent, root, path) {
			for (var key in root) {
				if (root.hasOwnProperty(key)) {
					if (root[key] instanceof Object) {
						root[key] = this._proxifyObjectTreeRecursively(root, root[key], escapePathComponent(key));
					}
				}
			}
			return this.generateProxyAtPath(parent, root, path);
		};
		// this function is for aesthetic purposes
		JSONPatcherProxy.prototype.proxifyObjectTree = function (root) {
			/*
	    while proxyifying object tree,
	    the proxyifying operation itself is being
	    recorded, which in an unwanted behavior,
	    that's why we disable recording through this
	    initial process;
	    */
			this.pause();
			this.isProxifyingTreeNow = true;
			var proxifiedObject = this._proxifyObjectTreeRecursively(undefined, root, "");
			/* OK you can record now */
			this.isProxifyingTreeNow = false;
			this.resume();
			return proxifiedObject;
		};
		/**
	  * Turns a proxified object into a forward-proxy object; doesn't emit any patches anymore, like a normal object
	  * @param {Proxy} proxy - The target proxy object
	  */
		JSONPatcherProxy.prototype.disableTrapsForProxy = function (revokableProxyInstance) {
			if (this.showDetachedWarning) {
				var message = "You're accessing an object that is detached from the observedObject tree, see https://github.com/Palindrom/JSONPatcherProxy#detached-objects";

				revokableProxyInstance.trapsInstance.set = function (targetObject, propKey, newValue) {
					console.warn(message);
					return Reflect.set(targetObject, propKey, newValue);
				};
				revokableProxyInstance.trapsInstance.set = function (targetObject, propKey, newValue) {
					console.warn(message);
					return Reflect.set(targetObject, propKey, newValue);
				};
				revokableProxyInstance.trapsInstance.deleteProperty = function (targetObject, propKey) {
					return Reflect.deleteProperty(targetObject, propKey);
				};
			} else {
				delete revokableProxyInstance.trapsInstance.set;
				delete revokableProxyInstance.trapsInstance.get;
				delete revokableProxyInstance.trapsInstance.deleteProperty;
			}
		};
		/**
	  * Proxifies the object that was passed in the constructor and returns a proxified mirror of it. Even though both parameters are options. You need to pass at least one of them.
	  * @param {Boolean} [record] - whether to record object changes to a later-retrievable patches array.
	  * @param {Function} [callback] - this will be synchronously called with every object change with a single `patch` as the only parameter.
	  */
		JSONPatcherProxy.prototype.observe = function (record, callback) {
			if (!record && !callback) {
				throw new Error("You need to either record changes or pass a callback");
			}
			this.isRecording = record;
			this.userCallback = callback;
			/*
	    I moved it here to remove it from `unobserve`,
	    this will also make the constructor faster, why initiate
	    the array before they decide to actually observe with recording?
	    They might need to use only a callback.
	    */
			if (record) this.patches = [];
			this.cachedProxy = this.proxifyObjectTree(this.originalObject);
			return this.cachedProxy;
		};
		/**
	  * If the observed is set to record, it will synchronously return all the patches and empties patches array.
	  */
		JSONPatcherProxy.prototype.generate = function () {
			if (!this.isRecording) {
				throw new Error("You should set record to true to get patches later");
			}
			return this.patches.splice(0, this.patches.length);
		};
		/**
	  * Revokes all proxies rendering the observed object useless and good for garbage collection @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy/revocable}
	  */
		JSONPatcherProxy.prototype.revoke = function () {
			this.proxifiedObjectsMap.forEach(function (el) {
				el.revoke();
			});
		};
		/**
	  * Disables all proxies' traps, turning the observed object into a forward-proxy object, like a normal object that you can modify silently.
	  */
		JSONPatcherProxy.prototype.disableTraps = function () {
			this.proxifiedObjectsMap.forEach(this.disableTrapsForProxy, this);
		};
		return JSONPatcherProxy;
	}();

	var timeout$1 = null;
	var patchs$1 = {};

	var handler$1 = function handler(patch, store) {
		clearTimeout(timeout$1);
		if (patch.op === "remove") {
			// fix arr splice
			var kv = getArrayPatch$1(patch.path, store);
			patchs$1[kv.k] = kv.v;
			timeout$1 = setTimeout(function () {
				update$1(patchs$1, store);
				patchs$1 = {};
			});
		} else {
			var key = fixPath$1(patch.path);
			patchs$1[key] = patch.value;
			timeout$1 = setTimeout(function () {
				update$1(patchs$1, store);
				patchs$1 = {};
			});
		}
	};

	function render$1(vnode, parent, store) {
		parent = typeof parent === "string" ? document.querySelector(parent) : parent;
		if (store) {
			store.instances = [];
			extendStoreUpate$1(store);
			store.data = new JSONPatcherProxy$1(store.data).observe(true, function (patch) {
				handler$1(patch, store);
			});
			parent.store = store;
		}
		diff$1(null, vnode, {}, false, parent, false);
	}

	function update$1(patch, store) {
		store.update(patch);
	}

	function extendStoreUpate$1(store) {
		store.update = function (patch) {
			var _this = this;

			var updateAll = matchGlobalData$1(this.globalData, patch);

			if (Object.keys(patch).length > 0) {
				this.instances.forEach(function (instance) {
					if (updateAll || _this.updateAll || instance.constructor.updatePath && needUpdate$1(patch, instance.constructor.updatePath)) {
						instance.update();
					}
				});
				this.onChange && this.onChange(patch);
			}
		};
	}

	function matchGlobalData$1(globalData, diffResult) {
		if (!globalData) return false;
		for (var keyA in diffResult) {
			if (globalData.indexOf(keyA) > -1) {
				return true;
			}
			for (var i = 0, len = globalData.length; i < len; i++) {
				if (includePath$1(keyA, globalData[i])) {
					return true;
				}
			}
		}
		return false;
	}

	function needUpdate$1(diffResult, updatePath) {
		for (var keyA in diffResult) {
			if (updatePath[keyA]) {
				return true;
			}
			for (var keyB in updatePath) {
				if (includePath$1(keyA, keyB)) {
					return true;
				}
			}
		}
		return false;
	}

	function includePath$1(pathA, pathB) {
		if (pathA.indexOf(pathB) === 0) {
			var next = pathA.substr(pathB.length, 1);
			if (next === "[" || next === ".") {
				return true;
			}
		}
		return false;
	}

	function fixPath$1(path) {
		var mpPath = "";
		var arr = path.replace("/", "").split("/");
		arr.forEach(function (item, index) {
			if (index) {
				if (isNaN(Number(item))) {
					mpPath += "." + item;
				} else {
					mpPath += "[" + item + "]";
				}
			} else {
				mpPath += item;
			}
		});
		return mpPath;
	}

	function getArrayPatch$1(path, store) {
		var arr = path.replace("/", "").split("/");
		var current = store.data[arr[0]];
		for (var i = 1, len = arr.length; i < len - 1; i++) {
			current = current[arr[i]];
		}
		return { k: fixArrPath$1(path), v: current };
	}

	function fixArrPath$1(path) {
		var mpPath = "";
		var arr = path.replace("/", "").split("/");
		var len = arr.length;
		arr.forEach(function (item, index) {
			if (index < len - 1) {
				if (index) {
					if (isNaN(Number(item))) {
						mpPath += "." + item;
					} else {
						mpPath += "[" + item + "]";
					}
				} else {
					mpPath += item;
				}
			}
		});
		return mpPath;
	}

	function define$1(name, ctor) {
		customElements.define(name, ctor);
		if (ctor.data && !ctor.pure) {
			ctor.updatePath = getUpdatePath$1(ctor.data);
		}
	}

	function getUpdatePath$1(data) {
		var result = {};
		dataToPath$1(data, result);
		return result;
	}

	function dataToPath$1(data, result) {
		Object.keys(data).forEach(function (key) {
			result[key] = true;
			var type = Object.prototype.toString.call(data[key]);
			if (type === "[object Object]") {
				_objToPath$1(data[key], key, result);
			} else if (type === "[object Array]") {
				_arrayToPath$1(data[key], key, result);
			}
		});
	}

	function _objToPath$1(data, path, result) {
		Object.keys(data).forEach(function (key) {
			result[path + "." + key] = true;
			delete result[path];
			var type = Object.prototype.toString.call(data[key]);
			if (type === "[object Object]") {
				_objToPath$1(data[key], path + "." + key, result);
			} else if (type === "[object Array]") {
				_arrayToPath$1(data[key], path + "." + key, result);
			}
		});
	}

	function _arrayToPath$1(data, path, result) {
		data.forEach(function (item, index) {
			result[path + "[" + index + "]"] = true;
			delete result[path];
			var type = Object.prototype.toString.call(item);
			if (type === "[object Object]") {
				_objToPath$1(item, path + "[" + index + "]", result);
			} else if (type === "[object Array]") {
				_arrayToPath$1(item, path + "[" + index + "]", result);
			}
		});
	}

	function tag$1(name, pure) {
		return function (target) {
			target.pure = pure;
			define$1(name, target);
		};
	}

	var omi$1 = {
		tag: tag$1,
		WeElement: WeElement$1,
		render: render$1,
		h: h$1,
		createElement: h$1,
		options: options$1,
		define: define$1
	};

	options$1.root.Omi = omi$1;
	options$1.root.Omi.version = "4.0.7";

	/* css3transform 2.0.0
	 * By dntzhang
	 * Github: https://github.com/Tencent/omi/tree/master/packages/omi-transform/css3transform
	 */

	var DEG_TO_RAD = 0.017453292519943295;

	var Matrix3D = function (n11, n12, n13, n14, n21, n22, n23, n24, n31, n32, n33, n34, n41, n42, n43, n44) {
	    this.elements = window.Float32Array ? new Float32Array(16) : [];
	    var te = this.elements;
	    te[0] = (n11 !== undefined) ? n11 : 1; te[4] = n12 || 0; te[8] = n13 || 0; te[12] = n14 || 0;
	    te[1] = n21 || 0; te[5] = (n22 !== undefined) ? n22 : 1; te[9] = n23 || 0; te[13] = n24 || 0;
	    te[2] = n31 || 0; te[6] = n32 || 0; te[10] = (n33 !== undefined) ? n33 : 1; te[14] = n34 || 0;
	    te[3] = n41 || 0; te[7] = n42 || 0; te[11] = n43 || 0; te[15] = (n44 !== undefined) ? n44 : 1;
	};


	Matrix3D.prototype = {
	    set: function (n11, n12, n13, n14, n21, n22, n23, n24, n31, n32, n33, n34, n41, n42, n43, n44) {
	        var te = this.elements;
	        te[0] = n11; te[4] = n12; te[8] = n13; te[12] = n14;
	        te[1] = n21; te[5] = n22; te[9] = n23; te[13] = n24;
	        te[2] = n31; te[6] = n32; te[10] = n33; te[14] = n34;
	        te[3] = n41; te[7] = n42; te[11] = n43; te[15] = n44;
	        return this;
	    },
	    identity: function () {
	        this.set(
	            1, 0, 0, 0,
	            0, 1, 0, 0,
	            0, 0, 1, 0,
	            0, 0, 0, 1
	        );
	        return this;
	    },
	    multiplyMatrices: function (a, be) {

	        var ae = a.elements;
	        var te = this.elements;
	        var a11 = ae[0], a12 = ae[4], a13 = ae[8], a14 = ae[12];
	        var a21 = ae[1], a22 = ae[5], a23 = ae[9], a24 = ae[13];
	        var a31 = ae[2], a32 = ae[6], a33 = ae[10], a34 = ae[14];
	        var a41 = ae[3], a42 = ae[7], a43 = ae[11], a44 = ae[15];

	        var b11 = be[0], b12 = be[1], b13 = be[2], b14 = be[3];
	        var b21 = be[4], b22 = be[5], b23 = be[6], b24 = be[7];
	        var b31 = be[8], b32 = be[9], b33 = be[10], b34 = be[11];
	        var b41 = be[12], b42 = be[13], b43 = be[14], b44 = be[15];

	        te[0] = a11 * b11 + a12 * b21 + a13 * b31 + a14 * b41;
	        te[4] = a11 * b12 + a12 * b22 + a13 * b32 + a14 * b42;
	        te[8] = a11 * b13 + a12 * b23 + a13 * b33 + a14 * b43;
	        te[12] = a11 * b14 + a12 * b24 + a13 * b34 + a14 * b44;

	        te[1] = a21 * b11 + a22 * b21 + a23 * b31 + a24 * b41;
	        te[5] = a21 * b12 + a22 * b22 + a23 * b32 + a24 * b42;
	        te[9] = a21 * b13 + a22 * b23 + a23 * b33 + a24 * b43;
	        te[13] = a21 * b14 + a22 * b24 + a23 * b34 + a24 * b44;

	        te[2] = a31 * b11 + a32 * b21 + a33 * b31 + a34 * b41;
	        te[6] = a31 * b12 + a32 * b22 + a33 * b32 + a34 * b42;
	        te[10] = a31 * b13 + a32 * b23 + a33 * b33 + a34 * b43;
	        te[14] = a31 * b14 + a32 * b24 + a33 * b34 + a34 * b44;

	        te[3] = a41 * b11 + a42 * b21 + a43 * b31 + a44 * b41;
	        te[7] = a41 * b12 + a42 * b22 + a43 * b32 + a44 * b42;
	        te[11] = a41 * b13 + a42 * b23 + a43 * b33 + a44 * b43;
	        te[15] = a41 * b14 + a42 * b24 + a43 * b34 + a44 * b44;

	        return this;

	    },
	    // 解决角度为90的整数倍导致Math.cos得到极小的数，其实是0。导致不渲染
	    _rounded: function (value, i) {
	        i = Math.pow(10, i || 15);
	        // default
	        return Math.round(value * i) / i;
	    },
	    _arrayWrap: function (arr) {
	        return window.Float32Array ? new Float32Array(arr) : arr;
	    },
	    appendTransform: function (x, y, z, scaleX, scaleY, scaleZ, rotateX, rotateY, rotateZ, skewX, skewY, originX, originY, originZ) {

	        var rx = rotateX * DEG_TO_RAD;
	        var cosx = this._rounded(Math.cos(rx));
	        var sinx = this._rounded(Math.sin(rx));
	        var ry = rotateY * DEG_TO_RAD;
	        var cosy = this._rounded(Math.cos(ry));
	        var siny = this._rounded(Math.sin(ry));
	        var rz = rotateZ * DEG_TO_RAD;
	        var cosz = this._rounded(Math.cos(rz * -1));
	        var sinz = this._rounded(Math.sin(rz * -1));

	        this.multiplyMatrices(this, this._arrayWrap([
	            1, 0, 0, x,
	            0, cosx, sinx, y,
	            0, -sinx, cosx, z,
	            0, 0, 0, 1
	        ]));

	        this.multiplyMatrices(this, this._arrayWrap([
	            cosy, 0, siny, 0,
	            0, 1, 0, 0,
	            -siny, 0, cosy, 0,
	            0, 0, 0, 1
	        ]));

	        this.multiplyMatrices(this, this._arrayWrap([
	            cosz * scaleX, sinz * scaleY, 0, 0,
	            -sinz * scaleX, cosz * scaleY, 0, 0,
	            0, 0, 1 * scaleZ, 0,
	            0, 0, 0, 1
	        ]));

	        if (skewX || skewY) {
	            this.multiplyMatrices(this, this._arrayWrap([
	                this._rounded(Math.cos(skewX * DEG_TO_RAD)), this._rounded(Math.sin(skewX * DEG_TO_RAD)), 0, 0,
	                -1 * this._rounded(Math.sin(skewY * DEG_TO_RAD)), this._rounded(Math.cos(skewY * DEG_TO_RAD)), 0, 0,
	                0, 0, 1, 0,
	                0, 0, 0, 1
	            ]));
	        }


	        if (originX || originY || originZ) {
	            this.elements[12] -= originX * this.elements[0] + originY * this.elements[4] + originZ * this.elements[8];
	            this.elements[13] -= originX * this.elements[1] + originY * this.elements[5] + originZ * this.elements[9];
	            this.elements[14] -= originX * this.elements[2] + originY * this.elements[6] + originZ * this.elements[10];
	        }
	        return this;
	    }
	};

	var Matrix2D = function (a, b, c, d, tx, ty) {
	    this.a = a == null ? 1 : a;
	    this.b = b || 0;
	    this.c = c || 0;
	    this.d = d == null ? 1 : d;
	    this.tx = tx || 0;
	    this.ty = ty || 0;
	    return this;
	};

	Matrix2D.prototype = {
	    identity: function () {
	        this.a = this.d = 1;
	        this.b = this.c = this.tx = this.ty = 0;
	        return this;
	    },
	    appendTransform: function (x, y, scaleX, scaleY, rotation, skewX, skewY, originX, originY) {
	        if (rotation % 360) {
	            var r = rotation * DEG_TO_RAD;
	            var cos = Math.cos(r);
	            var sin = Math.sin(r);
	        } else {
	            cos = 1;
	            sin = 0;
	        }
	        if (skewX || skewY) {
	            skewX *= DEG_TO_RAD;
	            skewY *= DEG_TO_RAD;
	            this.append(Math.cos(skewY), Math.sin(skewY), -Math.sin(skewX), Math.cos(skewX), x, y);
	            this.append(cos * scaleX, sin * scaleX, -sin * scaleY, cos * scaleY, 0, 0);
	        } else {
	            this.append(cos * scaleX, sin * scaleX, -sin * scaleY, cos * scaleY, x, y);
	        }
	        if (originX || originY) {
	            this.tx -= originX * this.a + originY * this.c;
	            this.ty -= originX * this.b + originY * this.d;
	        }
	        return this;
	    },
	    append: function (a, b, c, d, tx, ty) {
	        var a1 = this.a;
	        var b1 = this.b;
	        var c1 = this.c;
	        var d1 = this.d;
	        this.a = a * a1 + b * c1;
	        this.b = a * b1 + b * d1;
	        this.c = c * a1 + d * c1;
	        this.d = c * b1 + d * d1;
	        this.tx = tx * a1 + ty * c1 + this.tx;
	        this.ty = tx * b1 + ty * d1 + this.ty;
	        return this;
	    },
	    initialize: function (a, b, c, d, tx, ty) {
	        this.a = a;
	        this.b = b;
	        this.c = c;
	        this.d = d;
	        this.tx = tx;
	        this.ty = ty;
	        return this;
	    },
	    setValues: function (a, b, c, d, tx, ty) {
	        this.a = a == null ? 1 : a;
	        this.b = b || 0;
	        this.c = c || 0;
	        this.d = d == null ? 1 : d;
	        this.tx = tx || 0;
	        this.ty = ty || 0;
	        return this;
	    },
	    copy: function (matrix) {
	        return this.setValues(matrix.a, matrix.b, matrix.c, matrix.d, matrix.tx, matrix.ty);
	    }
	};

	function observe(target, props, callback) {
	    for (var i = 0, len = props.length; i < len; i++) {
	        var prop = props[i];
	        watch(target, prop, callback);
	    }
	}

	function watch(target, prop, callback) {
	    Object.defineProperty(target, prop, {
	        get: function () {
	            return this["_" + prop];
	        },
	        set: function (value) {
	            this["_" + prop] = value;
	            callback();
	        }
	    });
	}

	function isElement(o) {
	    return (
	        typeof HTMLElement === "object" ? o instanceof HTMLElement : //DOM2
	            o && typeof o === "object" && o !== null && o.nodeType === 1 && typeof o.nodeName === "string"
	    );
	}

	function Transform(obj, notPerspective) {
	    if (obj.___mixCSS3Transform) return;
	    var observeProps = ["translateX", "translateY", "translateZ", "scaleX", "scaleY", "scaleZ", "rotateX", "rotateY", "rotateZ", "skewX", "skewY", "originX", "originY", "originZ"],
	        objIsElement = isElement(obj);
	    if (!notPerspective) {
	        observeProps.push("perspective");
	    }
	    obj.___mixCSS3Transform = true;
	    observe(
	        obj,
	        observeProps,
	        function () {
	            var mtx = obj.matrix3d.identity().appendTransform(obj.translateX, obj.translateY, obj.translateZ, obj.scaleX, obj.scaleY, obj.scaleZ, obj.rotateX, obj.rotateY, obj.rotateZ, obj.skewX, obj.skewY, obj.originX, obj.originY, obj.originZ);
	            var transform = (notPerspective ? "" : "perspective(" + obj.perspective + "px) ") + "matrix3d(" + Array.prototype.slice.call(mtx.elements).join(",") + ")";
	            if (objIsElement) {
	                obj.style.transform = obj.style.msTransform = obj.style.OTransform = obj.style.MozTransform = obj.style.webkitTransform = transform;
	            } else {
	                obj.transform = transform;
	            }
	        });

	    obj.matrix3d = new Matrix3D();
	    if (!notPerspective) {
	        obj.perspective = 500;
	    }
	    obj.scaleX = obj.scaleY = obj.scaleZ = 1;
	    //由于image自带了x\y\z，所有加上translate前缀
	    obj.translateX = obj.translateY = obj.translateZ = obj.rotateX = obj.rotateY = obj.rotateZ = obj.skewX = obj.skewY = obj.originX = obj.originY = obj.originZ = 0;
	}

	Transform.getMatrix3D = function (option) {
	    var defaultOption = {
	        translateX: 0,
	        translateY: 0,
	        translateZ: 0,
	        rotateX: 0,
	        rotateY: 0,
	        rotateZ: 0,
	        skewX: 0,
	        skewY: 0,
	        originX: 0,
	        originY: 0,
	        originZ: 0,
	        scaleX: 1,
	        scaleY: 1,
	        scaleZ: 1
	    };
	    for (var key in option) {
	        if (option.hasOwnProperty(key)) {
	            defaultOption[key] = option[key];
	        }
	    }
	    return new Matrix3D().identity().appendTransform(defaultOption.translateX, defaultOption.translateY, defaultOption.translateZ, defaultOption.scaleX, defaultOption.scaleY, defaultOption.scaleZ, defaultOption.rotateX, defaultOption.rotateY, defaultOption.rotateZ, defaultOption.skewX, defaultOption.skewY, defaultOption.originX, defaultOption.originY, defaultOption.originZ).elements;

	};

	Transform.getMatrix2D = function (option) {
	    var defaultOption = {
	        translateX: 0,
	        translateY: 0,
	        rotation: 0,
	        skewX: 0,
	        skewY: 0,
	        originX: 0,
	        originY: 0,
	        scaleX: 1,
	        scaleY: 1
	    };
	    for (var key in option) {
	        if (option.hasOwnProperty(key)) {
	            defaultOption[key] = option[key];
	        }
	    }
	    return new Matrix2D().identity().appendTransform(defaultOption.translateX, defaultOption.translateY, defaultOption.scaleX, defaultOption.scaleY, defaultOption.rotation, defaultOption.skewX, defaultOption.skewY, defaultOption.originX, defaultOption.originY);
	};

	class CSS3Transform extends WeElement$1 {

		install() {
			this.css = this.parentNode.host.css;
		}

		installed() {
			Transform(this.host);
			this.transformByProps();
		}

		afterUpdate() {
			this.transformByProps();
		}

		transformByProps() {
			['translateX', 'translateY', 'translateZ', 'scaleX', 'scaleY', 'scaleZ', 'rotateX', 'rotateY', 'rotateZ', 'skewX', 'skewY', 'originX', 'originY', 'originZ', 'perspective'].forEach(item => {
				if (this.props.hasOwnProperty(item)) {
					this.host[item] = this.props[item];
				}
			});
		}

		render(props) {
			return props.children[0]
		}
	}

	define$1('css3-transform', CSS3Transform);

	var _dec, _class;

	function _classCallCheck$2(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn$2(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits$2(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	var MyApp = (_dec = tag("my-app"), _dec(_class = function (_WeElement) {
		_inherits$2(MyApp, _WeElement);

		function MyApp() {
			_classCallCheck$2(this, MyApp);

			return _possibleConstructorReturn$2(this, _WeElement.apply(this, arguments));
		}

		MyApp.prototype.install = function install() {
			var _this2 = this;

			this.data.rotateZ = 30;

			this.linkRef = function (e) {
				_this2.animDiv = e;
			};
		};

		MyApp.prototype.css = function css() {
			return "\n         div{\n             color: red;\n\t\t\t cursor: pointer;\n\t\t\t width:150px;\n\t\t\t height:150px;\n\t\t\t line-height:150px;\n\t\t\t text-align: center;\n\t\t\t border: 1px solid green;\n\n         }";
		};

		MyApp.prototype.installed = function installed() {
			var _this3 = this;

			setInterval(function () {
				//slow
				// this.data.rotateZ += 2
				// this.update()

				//fast
				_this3.animDiv.rotateZ += 2;
				//sync for update call of any scenario
				_this3.data.rotateZ = _this3.animDiv.rotateZ;
			}, 16);
		};

		MyApp.prototype.render = function render$$1(props, data) {

			return Omi.h(
				"css3-transform",
				{ rotateZ: data.rotateZ, translateX: 0, perspective: 0 },
				Omi.h(
					"div",
					{ ref: this.linkRef },
					"omi-transform"
				)
			);
		};

		return MyApp;
	}(WeElement)) || _class);


	render(Omi.h("my-app", null), "body");

}());
//# sourceMappingURL=b.js.map
