!function() {
    'use strict';
    function h(nodeName, attributes) {
        var lastSimple, child, simple, i, children = [];
        for (i = arguments.length; i-- > 2; ) stack.push(arguments[i]);
        if (attributes && null != attributes.children) {
            if (!stack.length) stack.push(attributes.children);
            delete attributes.children;
        }
        while (stack.length) if ((child = stack.pop()) && void 0 !== child.pop) for (i = child.length; i--; ) stack.push(child[i]); else {
            if ('boolean' == typeof child) child = null;
            if (simple = 'function' != typeof nodeName) if (null == child) child = ''; else if ('number' == typeof child) child = String(child); else if ('string' != typeof child) simple = !1;
            if (simple && lastSimple) children[children.length - 1] += child; else if (0 === children.length) children = [ child ]; else children.push(child);
            lastSimple = simple;
        }
        var p = new VNode();
        p.nodeName = nodeName;
        p.children = children;
        p.attributes = null == attributes ? void 0 : attributes;
        p.key = null == attributes ? void 0 : attributes.key;
        if (void 0 !== options.vnode) options.vnode(p);
        return p;
    }
    function extend(obj, props) {
        for (var i in props) obj[i] = props[i];
        return obj;
    }
    function applyRef(ref, value) {
        if (null != ref) if ('function' == typeof ref) ref(value); else ref.current = value;
    }
    function isArray(obj) {
        return '[object Array]' === Object.prototype.toString.call(obj);
    }
    function getUse(data, paths) {
        var obj = [];
        paths.forEach(function(path, index) {
            var isPath = 'string' == typeof path;
            if (isPath) obj[index] = getTargetByPath(data, path); else {
                var key = Object.keys(path)[0];
                var value = path[key];
                if ('string' == typeof value) obj[index] = getTargetByPath(data, value); else {
                    var tempPath = value[0];
                    if ('string' == typeof tempPath) {
                        var tempVal = getTargetByPath(data, tempPath);
                        obj[index] = value[1] ? value[1](tempVal) : tempVal;
                    } else {
                        var args = [];
                        tempPath.forEach(function(path) {
                            args.push(getTargetByPath(data, path));
                        });
                        obj[index] = value[1].apply(null, args);
                    }
                }
                obj[key] = obj[index];
            }
        });
        return obj;
    }
    function getTargetByPath(origin, path) {
        var arr = path.replace(/]/g, '').replace(/\[/g, '.').split('.');
        var current = origin;
        for (var i = 0, len = arr.length; i < len; i++) current = current[arr[i]];
        return current;
    }
    function cloneElement(vnode, props) {
        return h(vnode.nodeName, extend(extend({}, vnode.attributes), props), arguments.length > 2 ? [].slice.call(arguments, 2) : vnode.children);
    }
    function enqueueRender(component) {
        if (!component.__d && (component.__d = !0) && 1 == items.push(component)) (options.debounceRendering || defer)(rerender);
    }
    function rerender() {
        var p;
        while (p = items.pop()) if (p.__d) renderComponent(p);
    }
    function isSameNodeType(node, vnode, hydrating) {
        if ('string' == typeof vnode || 'number' == typeof vnode) return void 0 !== node.splitText;
        if ('string' == typeof vnode.nodeName) {
            var ctor = mapping[vnode.nodeName];
            if (ctor) return hydrating || node._componentConstructor === ctor; else return !node._componentConstructor && isNamedNode(node, vnode.nodeName);
        }
        return hydrating || node._componentConstructor === vnode.nodeName;
    }
    function isNamedNode(node, nodeName) {
        return node.__n === nodeName || node.nodeName.toLowerCase() === nodeName.toLowerCase();
    }
    function getNodeProps(vnode) {
        var props = extend({}, vnode.attributes);
        props.children = vnode.children;
        var defaultProps = vnode.nodeName.defaultProps;
        if (void 0 !== defaultProps) for (var i in defaultProps) if (void 0 === props[i]) props[i] = defaultProps[i];
        return props;
    }
    function createNode(nodeName, isSvg) {
        var node = isSvg ? options.doc.createElementNS('http://www.w3.org/2000/svg', nodeName) : options.doc.createElement(nodeName);
        node.__n = nodeName;
        return node;
    }
    function parseCSSText(cssText) {
        var cssTxt = cssText.replace(/\/\*(.|\s)*?\*\//g, ' ').replace(/\s+/g, ' ');
        var style = {}, _ref = cssTxt.match(/ ?(.*?) ?{([^}]*)}/) || [ a, b, cssTxt ], a = _ref[0], b = _ref[1], rule = _ref[2];
        var properties = rule.split(';').map(function(o) {
            return o.split(':').map(function(x) {
                return x && x.trim();
            });
        });
        for (var i = properties, i = Array.isArray(i), i = 0, i = i ? i : i[Symbol.iterator](); ;) {
            var _ref3;
            if (i) {
                if (i >= i.length) break;
                _ref3 = i[i++];
            } else {
                i = i.next();
                if (i.done) break;
                _ref3 = i.value;
            }
            var _ref2 = _ref3;
            var property = _ref2[0];
            var value = _ref2[1];
            style[function(s) {
                return s.replace(/\W+\w/g, function(match) {
                    return match.slice(-1).toUpperCase();
                });
            }(property)] = value;
        }
        return style;
    }
    function removeNode(node) {
        var parentNode = node.parentNode;
        if (parentNode) parentNode.removeChild(node);
    }
    function setAccessor(node, name, old, value, isSvg) {
        if ('className' === name) name = 'class';
        if ('key' === name) ; else if ('ref' === name) {
            applyRef(old, null);
            applyRef(value, node);
        } else if ('class' === name && !isSvg) node.className = value || ''; else if ('style' === name) if (options.isWeb) {
            if (!value || 'string' == typeof value || 'string' == typeof old) node.style.cssText = value || '';
            if (value && 'object' == typeof value) {
                if ('string' != typeof old) for (var i in old) if (!(i in value)) node.style[i] = '';
                for (var i in value) node.style[i] = 'number' == typeof value[i] && !1 === IS_NON_DIMENSIONAL$1.test(i) ? value[i] + 'px' : value[i];
            }
        } else {
            var oldJson = old, currentJson = value;
            if ('string' == typeof old) oldJson = parseCSSText(old);
            if ('string' == typeof value) currentJson = parseCSSText(value);
            var result = {}, changed = !1;
            if (oldJson) {
                for (var key in oldJson) if ('object' == typeof currentJson && !(key in currentJson)) {
                    result[key] = '';
                    changed = !0;
                }
                for (var ckey in currentJson) if (currentJson[ckey] !== oldJson[ckey]) {
                    result[ckey] = currentJson[ckey];
                    changed = !0;
                }
                if (changed) node.setStyles(result);
            } else node.setStyles(currentJson);
        } else if ('dangerouslySetInnerHTML' === name) {
            if (value) node.innerHTML = value.__html || '';
        } else if ('o' == name[0] && 'n' == name[1]) {
            var useCapture = name !== (name = name.replace(/Capture$/, ''));
            name = name.toLowerCase().substring(2);
            if (value) {
                if (!old) {
                    node.addEventListener(name, eventProxy, useCapture);
                    if ('tap' == name) {
                        node.addEventListener('touchstart', touchStart, useCapture);
                        node.addEventListener('touchend', touchEnd, useCapture);
                    }
                }
            } else {
                node.removeEventListener(name, eventProxy, useCapture);
                if ('tap' == name) {
                    node.removeEventListener('touchstart', touchStart, useCapture);
                    node.removeEventListener('touchend', touchEnd, useCapture);
                }
            }
            (node.__l || (node.__l = {}))[name] = value;
        } else if ('list' !== name && 'type' !== name && !isSvg && name in node) {
            try {
                node[name] = null == value ? '' : value;
            } catch (e) {}
            if ((null == value || !1 === value) && 'spellcheck' != name) node.removeAttribute(name);
        } else {
            var ns = isSvg && name !== (name = name.replace(/^xlink:?/, ''));
            if (null == value || !1 === value) if (ns) node.removeAttributeNS('http://www.w3.org/1999/xlink', name.toLowerCase()); else node.removeAttribute(name); else if ('function' != typeof value) if (ns) node.setAttributeNS('http://www.w3.org/1999/xlink', name.toLowerCase(), value); else node.setAttribute(name, value);
        }
    }
    function eventProxy(e) {
        return this.__l[e.type](options.event && options.event(e) || e);
    }
    function touchStart(e) {
        this.C = e.touches[0].pageX;
        this.D = e.touches[0].pageY;
        this.F = document.body.scrollTop;
    }
    function touchEnd(e) {
        if (Math.abs(e.changedTouches[0].pageX - this.C) < 30 && Math.abs(e.changedTouches[0].pageY - this.D) < 30 && Math.abs(document.body.scrollTop - this.F) < 30) this.dispatchEvent(new CustomEvent('tap', {
            detail: e
        }));
    }
    function getCtorName(ctor) {
        for (var i = 0, len = options.styleCache.length; i < len; i++) {
            var item = options.styleCache[i];
            if (item.ctor === ctor) return item.attrName;
        }
        var attrName = 's' + styleId;
        options.styleCache.push({
            ctor: ctor,
            attrName: attrName
        });
        styleId++;
        return attrName;
    }
    function scoper(css, prefix) {
        prefix = '[' + prefix.toLowerCase() + ']';
        css = css.replace(/\/\*[^*]*\*+([^\/][^*]*\*+)*\//g, '');
        var re = new RegExp('([^\r\n,{}:]+)(:[^\r\n,{}]+)?(,(?=[^{}]*{)|s*{)', 'g');
        css = css.replace(re, function(g0, g1, g2, g3) {
            if (void 0 === g2) g2 = '';
            if (g1.match(/^\s*(@media|\d+%?|@-webkit-keyframes|@keyframes|to|from|@font-face)/)) return g1 + g2 + g3;
            var appendClass = g1.replace(/(\s*)$/, '') + prefix + g2;
            return appendClass + g3;
        });
        return css;
    }
    function addStyle(cssText, id) {
        id = id.toLowerCase();
        var ele = document.getElementById(id);
        var head = document.getElementsByTagName('head')[0];
        if (ele && ele.parentNode === head) head.removeChild(ele);
        var someThingStyles = document.createElement('style');
        head.appendChild(someThingStyles);
        someThingStyles.setAttribute('type', 'text/css');
        someThingStyles.setAttribute('id', id);
        if (window.ActiveXObject) someThingStyles.styleSheet.cssText = cssText; else someThingStyles.textContent = cssText;
    }
    function addStyleWithoutId(cssText) {
        var head = document.getElementsByTagName('head')[0];
        var someThingStyles = document.createElement('style');
        head.appendChild(someThingStyles);
        someThingStyles.setAttribute('type', 'text/css');
        if (window.ActiveXObject) someThingStyles.styleSheet.cssText = cssText; else someThingStyles.textContent = cssText;
    }
    function addScopedAttrStatic(vdom, attr) {
        if (options.scopedStyle) scopeVdom(attr, vdom);
    }
    function addStyleToHead(style, attr) {
        if (options.scopedStyle) {
            if (!options.staticStyleMapping[attr]) {
                addStyle(scoper(style, attr), attr);
                options.staticStyleMapping[attr] = !0;
            }
        } else if (!options.staticStyleMapping[attr]) {
            addStyleWithoutId(style);
            options.staticStyleMapping[attr] = !0;
        }
    }
    function scopeVdom(attr, vdom) {
        if ('object' == typeof vdom) {
            vdom.attributes = vdom.attributes || {};
            vdom.attributes[attr] = '';
            vdom.css = vdom.css || {};
            vdom.css[attr] = '';
            vdom.children.forEach(function(child) {
                return scopeVdom(attr, child);
            });
        }
    }
    function scopeHost(vdom, css) {
        if ('object' == typeof vdom && css) {
            vdom.attributes = vdom.attributes || {};
            for (var key in css) vdom.attributes[key] = '';
        }
    }
    function flushMounts() {
        var c;
        while (c = mounts.shift()) {
            if (options.afterMount) options.afterMount(c);
            if (c.componentDidMount) c.componentDidMount();
            if (c.installed) c.installed();
            if (c.constructor.css || c.css) addStyleToHead(c.constructor.css ? c.constructor.css : 'function' == typeof c.css ? c.css() : c.css, '_s' + getCtorName(c.constructor));
        }
    }
    function diff(dom, vnode, context, mountAll, parent, componentRoot) {
        if (!diffLevel++) {
            isSvgMode = null != parent && void 0 !== parent.ownerSVGElement;
            hydrating = null != dom && !('__omiattr_' in dom);
        }
        var ret;
        if (isArray(vnode)) vnode = {
            nodeName: 'span',
            children: vnode
        };
        ret = idiff(dom, vnode, context, mountAll, componentRoot);
        if (parent && ret.parentNode !== parent) parent.appendChild(ret);
        if (!--diffLevel) {
            hydrating = !1;
            if (!componentRoot) flushMounts();
        }
        return ret;
    }
    function idiff(dom, vnode, context, mountAll, componentRoot) {
        var out = dom, prevSvgMode = isSvgMode;
        if (null == vnode || 'boolean' == typeof vnode) vnode = '';
        var vnodeName = vnode.nodeName;
        if (options.mapping[vnodeName]) {
            vnode.nodeName = options.mapping[vnodeName];
            return buildComponentFromVNode(dom, vnode, context, mountAll);
        }
        if ('string' == typeof vnode || 'number' == typeof vnode) {
            if (dom && void 0 !== dom.splitText && dom.parentNode && (!dom._component || componentRoot)) {
                if (dom.nodeValue != vnode) dom.nodeValue = vnode;
            } else {
                out = document.createTextNode(vnode);
                if (dom) {
                    if (dom.parentNode) dom.parentNode.replaceChild(out, dom);
                    recollectNodeTree(dom, !0);
                }
            }
            try {
                out.__omiattr_ = !0;
            } catch (e) {}
            return out;
        }
        if ('function' == typeof vnodeName) return buildComponentFromVNode(dom, vnode, context, mountAll);
        isSvgMode = 'svg' === vnodeName ? !0 : 'foreignObject' === vnodeName ? !1 : isSvgMode;
        vnodeName = String(vnodeName);
        if (!dom || !isNamedNode(dom, vnodeName)) {
            out = createNode(vnodeName, isSvgMode);
            if (dom) {
                while (dom.firstChild) out.appendChild(dom.firstChild);
                if (dom.parentNode) dom.parentNode.replaceChild(out, dom);
                recollectNodeTree(dom, !0);
            }
        }
        var fc = out.firstChild, props = out.__omiattr_, vchildren = vnode.children;
        if (null == props) {
            props = out.__omiattr_ = {};
            for (var a = out.attributes, i = a.length; i--; ) props[a[i].name] = a[i].value;
        }
        if (!hydrating && vchildren && 1 === vchildren.length && 'string' == typeof vchildren[0] && null != fc && void 0 !== fc.splitText && null == fc.nextSibling) {
            if (fc.nodeValue != vchildren[0]) fc.nodeValue = vchildren[0];
        } else if (vchildren && vchildren.length || null != fc) innerDiffNode(out, vchildren, context, mountAll, hydrating || null != props.dangerouslySetInnerHTML);
        diffAttributes(out, vnode.attributes, props);
        isSvgMode = prevSvgMode;
        return out;
    }
    function innerDiffNode(dom, vchildren, context, mountAll, isHydrating) {
        var j, c, f, vchild, child, originalChildren = dom.childNodes, children = [], keyed = {}, keyedLen = 0, min = 0, len = originalChildren.length, childrenLen = 0, vlen = vchildren ? vchildren.length : 0;
        if (0 !== len) for (var i = 0; i < len; i++) {
            var _child = originalChildren[i], props = _child.__omiattr_, key = vlen && props ? _child._component ? _child._component.__k : props.key : null;
            if (null != key) {
                keyedLen++;
                keyed[key] = _child;
            } else if (props || (void 0 !== _child.splitText ? isHydrating ? _child.nodeValue.trim() : !0 : isHydrating)) children[childrenLen++] = _child;
        }
        if (0 !== vlen) for (var i = 0; i < vlen; i++) {
            vchild = vchildren[i];
            child = null;
            var key = vchild.key;
            if (null != key) {
                if (keyedLen && void 0 !== keyed[key]) {
                    child = keyed[key];
                    keyed[key] = void 0;
                    keyedLen--;
                }
            } else if (min < childrenLen) for (j = min; j < childrenLen; j++) if (void 0 !== children[j] && isSameNodeType(c = children[j], vchild, isHydrating)) {
                child = c;
                children[j] = void 0;
                if (j === childrenLen - 1) childrenLen--;
                if (j === min) min++;
                break;
            }
            child = idiff(child, vchild, context, mountAll);
            f = originalChildren[i];
            if (child && child !== dom && child !== f) if (null == f) dom.appendChild(child); else if (child === f.nextSibling) removeNode(f); else dom.insertBefore(child, f);
        }
        if (keyedLen) for (var i in keyed) if (void 0 !== keyed[i]) recollectNodeTree(keyed[i], !1);
        while (min <= childrenLen) if (void 0 !== (child = children[childrenLen--])) recollectNodeTree(child, !1);
    }
    function recollectNodeTree(node, unmountOnly) {
        var component = node._component;
        if (component) unmountComponent(component); else {
            if (null != node.__omiattr_) applyRef(node.__omiattr_.ref, null);
            if (!1 === unmountOnly || null == node.__omiattr_) removeNode(node);
            removeChildren(node);
        }
    }
    function removeChildren(node) {
        node = node.lastChild;
        while (node) {
            var next = node.previousSibling;
            recollectNodeTree(node, !0);
            node = next;
        }
    }
    function diffAttributes(dom, attrs, old) {
        var name;
        for (name in old) if ((!attrs || null == attrs[name]) && null != old[name]) setAccessor(dom, name, old[name], old[name] = void 0, isSvgMode);
        for (name in attrs) if (!('children' === name || 'innerHTML' === name || name in old && attrs[name] === ('value' === name || 'checked' === name ? dom[name] : old[name]))) setAccessor(dom, name, old[name], old[name] = attrs[name], isSvgMode);
    }
    function define(name, ctor) {
        options.mapping[name] = ctor;
        if (ctor.use) ctor.updatePath = getPath(ctor.use); else if (ctor.data) ctor.updatePath = getUpdatePath(ctor.data);
    }
    function getPath(obj) {
        if ('[object Array]' === Object.prototype.toString.call(obj)) {
            var result = {};
            obj.forEach(function(item) {
                if ('string' == typeof item) result[item] = !0; else {
                    var tempPath = item[Object.keys(item)[0]];
                    if ('string' == typeof tempPath) result[tempPath] = !0; else if ('string' == typeof tempPath[0]) result[tempPath[0]] = !0; else tempPath[0].forEach(function(path) {
                        return result[path] = !0;
                    });
                }
            });
            return result;
        } else return getUpdatePath(obj);
    }
    function getUpdatePath(data) {
        var result = {};
        dataToPath(data, result);
        return result;
    }
    function dataToPath(data, result) {
        Object.keys(data).forEach(function(key) {
            result[key] = !0;
            var type = Object.prototype.toString.call(data[key]);
            if ('[object Object]' === type) _objToPath(data[key], key, result); else if ('[object Array]' === type) _arrayToPath(data[key], key, result);
        });
    }
    function _objToPath(data, path, result) {
        Object.keys(data).forEach(function(key) {
            result[path + '.' + key] = !0;
            delete result[path];
            var type = Object.prototype.toString.call(data[key]);
            if ('[object Object]' === type) _objToPath(data[key], path + '.' + key, result); else if ('[object Array]' === type) _arrayToPath(data[key], path + '.' + key, result);
        });
    }
    function _arrayToPath(data, path, result) {
        data.forEach(function(item, index) {
            result[path + '[' + index + ']'] = !0;
            delete result[path];
            var type = Object.prototype.toString.call(item);
            if ('[object Object]' === type) _objToPath(item, path + '[' + index + ']', result); else if ('[object Array]' === type) _arrayToPath(item, path + '[' + index + ']', result);
        });
    }
    function createComponent(Ctor, props, context, vnode) {
        var inst, i = recyclerComponents.length;
        if (Ctor.prototype && Ctor.prototype.render) {
            inst = new Ctor(props, context);
            Component.call(inst, props, context);
        } else {
            inst = new Component(props, context);
            inst.constructor = Ctor;
            inst.render = doRender;
        }
        vnode && (inst.scopedCssAttr = vnode.css);
        if (inst.store && inst.store.data) if (inst.constructor.use) {
            inst.use = getUse(inst.store.data, inst.constructor.use);
            inst.store.instances.push(inst);
        } else if (inst.initUse) {
            var use = inst.initUse();
            inst.H = getPath(use);
            inst.use = getUse(inst.store.data, use);
            inst.store.instances.push(inst);
        }
        while (i--) if (recyclerComponents[i].constructor === Ctor) {
            inst.__b = recyclerComponents[i].__b;
            recyclerComponents.splice(i, 1);
            return inst;
        }
        return inst;
    }
    function doRender(props, data, context) {
        return this.constructor(props, context);
    }
    function fireTick() {
        callbacks.forEach(function(item) {
            item.fn.call(item.scope);
        });
        nextTickCallback.forEach(function(nextItem) {
            nextItem.fn.call(nextItem.scope);
        });
        nextTickCallback.length = 0;
    }
    function proxyUpdate(ele) {
        var timeout = null;
        obaa(ele.data, function() {
            if (!ele.A) if (ele.constructor.mergeUpdate) {
                clearTimeout(timeout);
                timeout = setTimeout(function() {
                    ele.update();
                    fireTick();
                }, 0);
            } else {
                ele.update();
                fireTick();
            }
        });
    }
    function setComponentProps(component, props, renderMode, context, mountAll) {
        if (!component.__x) {
            component.__x = !0;
            component.__r = props.ref;
            component.__k = props.key;
            delete props.ref;
            delete props.key;
            if (void 0 === component.constructor.getDerivedStateFromProps) if (!component.base || mountAll) {
                if (component.componentWillMount) component.componentWillMount();
            } else if (component.componentWillReceiveProps) component.componentWillReceiveProps(props, context);
            if (!component.base || mountAll) {
                if (component.beforeInstall) component.beforeInstall();
                if (component.install) component.install();
                if (component.constructor.observe) proxyUpdate(component);
            } else if (component.receiveProps) component.receiveProps(props, context, component.props);
            if (context && context !== component.context) {
                if (!component.__c) component.__c = component.context;
                component.context = context;
            }
            if (!component.__p) component.__p = component.props;
            component.props = props;
            component.__x = !1;
            if (0 !== renderMode) if (1 === renderMode || !1 !== options.syncComponentUpdates || !component.base) renderComponent(component, 1, mountAll); else enqueueRender(component);
            applyRef(component.__r, component);
        }
    }
    function renderComponent(component, renderMode, mountAll, isChild) {
        if (!component.__x) {
            var rendered, inst, cbase, props = component.props, state = component.state, context = component.context, previousProps = component.__p || props, previousState = component.__s || state, previousContext = component.__c || context, isUpdate = component.base, nextBase = component.__b, initialBase = isUpdate || nextBase, initialChildComponent = component._component, skip = !1, snapshot = previousContext;
            if (component.constructor.getDerivedStateFromProps) {
                state = extend(extend({}, state), component.constructor.getDerivedStateFromProps(props, state));
                component.state = state;
            }
            if (isUpdate) {
                component.props = previousProps;
                component.state = previousState;
                component.context = previousContext;
                if (2 !== renderMode && component.shouldComponentUpdate && !1 === component.shouldComponentUpdate(props, state, context)) skip = !0; else {
                    if (component.componentWillUpdate) component.componentWillUpdate(props, state, context);
                    if (component.beforeUpdate) component.beforeUpdate(props, state, context);
                }
                component.props = props;
                component.state = state;
                component.context = context;
            }
            component.__p = component.__s = component.__c = component.__b = null;
            component.__d = !1;
            if (!skip) {
                component.beforeRender && component.beforeRender();
                rendered = component.render(props, state, context);
                if (component.constructor.css || component.css) addScopedAttrStatic(rendered, '_s' + getCtorName(component.constructor));
                scopeHost(rendered, component.scopedCssAttr);
                if (component.getChildContext) context = extend(extend({}, context), component.getChildContext());
                if (isUpdate && component.getSnapshotBeforeUpdate) snapshot = component.getSnapshotBeforeUpdate(previousProps, previousState);
                var toUnmount, base, childComponent = rendered && rendered.nodeName, ctor = options.mapping[childComponent];
                if ('function' == typeof childComponent) ctor = childComponent;
                if (ctor) {
                    var childProps = getNodeProps(rendered);
                    inst = initialChildComponent;
                    if (inst && inst.constructor === ctor && childProps.key == inst.__k) setComponentProps(inst, childProps, 1, context, !1); else {
                        toUnmount = inst;
                        component._component = inst = createComponent(ctor, childProps, context);
                        inst.__b = inst.__b || nextBase;
                        inst.__u = component;
                        setComponentProps(inst, childProps, 0, context, !1);
                        renderComponent(inst, 1, mountAll, !0);
                    }
                    base = inst.base;
                } else {
                    cbase = initialBase;
                    toUnmount = initialChildComponent;
                    if (toUnmount) cbase = component._component = null;
                    if (initialBase || 1 === renderMode) {
                        if (cbase) cbase._component = null;
                        base = diff(cbase, rendered, context, mountAll || !isUpdate, initialBase && initialBase.parentNode, !0);
                    }
                }
                if (initialBase && base !== initialBase && inst !== initialChildComponent) {
                    var baseParent = initialBase.parentNode;
                    if (baseParent && base !== baseParent) {
                        baseParent.replaceChild(base, initialBase);
                        if (!toUnmount) {
                            initialBase._component = null;
                            recollectNodeTree(initialBase, !1);
                        }
                    }
                }
                if (toUnmount) unmountComponent(toUnmount);
                component.base = base;
                if (base && !isChild) {
                    var componentRef = component, t = component;
                    while (t = t.__u) (componentRef = t).base = base;
                    base._component = componentRef;
                    base._componentConstructor = componentRef.constructor;
                }
            }
            if (!isUpdate || mountAll) mounts.push(component); else if (!skip) {
                if (component.componentDidUpdate) component.componentDidUpdate(previousProps, previousState, snapshot);
                if (component.updated) component.updated(previousProps, previousState, snapshot);
                if (options.afterUpdate) options.afterUpdate(component);
            }
            if (null != component.__h) while (component.__h.length) component.__h.pop().call(component);
            if (!diffLevel && !isChild) flushMounts();
        }
    }
    function buildComponentFromVNode(dom, vnode, context, mountAll) {
        var c = dom && dom._component, originalComponent = c, oldDom = dom, isDirectOwner = c && dom._componentConstructor === vnode.nodeName, isOwner = isDirectOwner, props = getNodeProps(vnode);
        while (c && !isOwner && (c = c.__u)) isOwner = c.constructor === vnode.nodeName;
        if (c && isOwner && (!mountAll || c._component)) {
            setComponentProps(c, props, 3, context, mountAll);
            dom = c.base;
        } else {
            if (originalComponent && !isDirectOwner) {
                unmountComponent(originalComponent);
                dom = oldDom = null;
            }
            c = createComponent(vnode.nodeName, props, context, vnode);
            if (dom && !c.__b) {
                c.__b = dom;
                oldDom = null;
            }
            setComponentProps(c, props, 1, context, mountAll);
            dom = c.base;
            if (oldDom && dom !== oldDom) {
                oldDom._component = null;
                recollectNodeTree(oldDom, !1);
            }
        }
        return dom;
    }
    function unmountComponent(component) {
        if (options.beforeUnmount) options.beforeUnmount(component);
        var base = component.base;
        component.__x = !0;
        if (component.componentWillUnmount) component.componentWillUnmount();
        if (component.uninstall) component.uninstall();
        if (component.store && component.store.instances) for (var i = 0, len = component.store.instances.length; i < len; i++) if (component.store.instances[i] === component) {
            component.store.instances.splice(i, 1);
            break;
        }
        component.base = null;
        var inner = component._component;
        if (inner) unmountComponent(inner); else if (base) {
            if (null != base.__omiattr_) applyRef(base.__omiattr_.ref, null);
            component.__b = base;
            removeNode(base);
            recyclerComponents.push(component);
            removeChildren(base);
        }
        applyRef(component.__r, null);
    }
    function Component(props, store) {
        this.__d = !0;
        this.context = store;
        this.props = props;
        this.elementId = id++;
        this.state = this.state || {};
        this.data = this.data || {};
        this.z = null;
        this.store = store;
        this.__h = [];
    }
    function render(vnode, parent, store, empty, merge) {
        parent = 'string' == typeof parent ? document.querySelector(parent) : parent;
        if (store && ('string' == typeof store || 3 === arguments.length && void 0 !== typeof Element && (store instanceof Element || 3 === store.nodeType))) return diff(store, vnode, {}, !1, parent, !1);
        obsStore(store);
        if (empty) while (parent.firstChild) parent.removeChild(parent.firstChild);
        if (merge) merge = 'string' == typeof merge ? document.querySelector(merge) : merge;
        return diff(merge, vnode, store, !1, parent, !1);
    }
    function obsStore(store) {
        if (store && store.data) {
            store.instances = [];
            extendStoreUpate(store);
            obaa(store.data, function(prop, val, old, path) {
                var patchs = {};
                var key = fixPath(path + '-' + prop);
                patchs[key] = !0;
                store.update(patchs);
            });
        }
    }
    function merge(vnode, merge, store) {
        obsStore(store);
        merge = 'string' == typeof merge ? document.querySelector(merge) : merge;
        return diff(merge, vnode, store);
    }
    function extendStoreUpate(store) {
        store.update = function(patch) {
            var _this = this;
            var updateAll = matchGlobalData(this.globalData, patch);
            if (Object.keys(patch).length > 0) {
                this.instances.forEach(function(instance) {
                    if (updateAll || _this.updateAll || instance.constructor.updatePath && needUpdate(patch, instance.constructor.updatePath) || instance.H && needUpdate(patch, instance.H)) {
                        if (instance.constructor.use) instance.use = getUse(store.data, instance.constructor.use); else if (instance.initUse) instance.use = getUse(store.data, instance.initUse());
                        instance.update();
                    }
                });
                this.onChange && this.onChange(patch);
            }
        };
    }
    function matchGlobalData(globalData, diffResult) {
        if (!globalData) return !1;
        for (var keyA in diffResult) {
            if (globalData.indexOf(keyA) > -1) return !0;
            for (var i = 0, len = globalData.length; i < len; i++) if (includePath(keyA, globalData[i])) return !0;
        }
        return !1;
    }
    function needUpdate(diffResult, updatePath) {
        for (var keyA in diffResult) {
            if (updatePath[keyA]) return !0;
            for (var keyB in updatePath) if (includePath(keyA, keyB)) return !0;
        }
        return !1;
    }
    function includePath(pathA, pathB) {
        if (0 === pathA.indexOf(pathB)) {
            var next = pathA.substr(pathB.length, 1);
            if ('[' === next || '.' === next) return !0;
        }
        return !1;
    }
    function fixPath(path) {
        var mpPath = '';
        var arr = path.replace('#-', '').split('-');
        arr.forEach(function(item, index) {
            if (index) if (isNaN(Number(item))) mpPath += '.' + item; else mpPath += '[' + item + ']'; else mpPath += item;
        });
        return mpPath;
    }
    function rpx(str) {
        return str.replace(/([1-9]\d*|0)(\.\d*)*rpx/g, function(a, b) {
            return window.innerWidth * Number(b) / 750 + 'px';
        });
    }
    function tag(name) {
        return function(target) {
            define(name, target);
        };
    }
    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) throw new TypeError("Cannot call a class as a function");
    }
    function _possibleConstructorReturn(self, call) {
        if (!self) throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
        return call && ("object" == typeof call || "function" == typeof call) ? call : self;
    }
    function _inherits(subClass, superClass) {
        if ("function" != typeof superClass && null !== superClass) throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
        subClass.prototype = Object.create(superClass && superClass.prototype, {
            constructor: {
                value: subClass,
                enumerable: !1,
                writable: !0,
                configurable: !0
            }
        });
        if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
    }
    function classNames() {
        var classes = [];
        for (var i = 0; i < arguments.length; i++) {
            var arg = arguments[i];
            if (arg) {
                var argType = typeof arg;
                if ('string' === argType || 'number' === argType) classes.push(arg); else if (Array.isArray(arg) && arg.length) {
                    var inner = classNames.apply(null, arg);
                    if (inner) classes.push(inner);
                } else if ('object' === argType) for (var key in arg) if (hasOwn.call(arg, key) && arg[key]) classes.push(key);
            }
        }
        return classes.join(' ');
    }
    function extractClass() {
        var _Array$prototype$slic = Array.prototype.slice.call(arguments, 0), props = _Array$prototype$slic[0], args = _Array$prototype$slic.slice(1);
        if (props) if (props.class) {
            args.unshift(props.class);
            delete props.class;
        } else if (props.className) {
            args.unshift(props.className);
            delete props.className;
        }
        if (args.length > 0) return {
            class: classNames.apply(null, args)
        };
    }
    function getHost(component) {
        var base = component.base;
        if (base) while (base.parentNode) if (base.parentNode._component) return base.parentNode._component; else base = base.parentNode;
    }
    function styleObjToCss(s) {
        var str = '';
        for (var prop in s) {
            var val = s[prop];
            if (null != val) {
                if (str) str += ' ';
                str += JS_TO_CSS[prop] || (JS_TO_CSS[prop] = prop.replace(/([A-Z])/g, '-$1').toLowerCase());
                str += ': ';
                str += val;
                if ('number' == typeof val && !1 === IS_NON_DIMENSIONAL.test(prop)) str += 'px';
                str += ';';
            }
        }
        return str || void 0;
    }
    function renderToString(vnode, opts, store, isSvgMode) {
        store = store || {};
        opts = Object.assign({
            scopedCSS: !0
        }, opts);
        var css = {};
        var html = _renderToString(vnode, opts, store, isSvgMode, css);
        return {
            css: Object.values(css),
            html: html
        };
    }
    function _renderToString(vnode, opts, store, isSvgMode, css) {
        if (null == vnode || 'boolean' == typeof vnode) return '';
        var nodeName = vnode.nodeName, attributes = vnode.attributes, isComponent = !1;
        var pretty = opts.pretty, indentChar = pretty && 'string' == typeof pretty ? pretty : '\t';
        if ('object' != typeof vnode && !nodeName) return encodeEntities(vnode);
        var ctor = mapping$1[nodeName];
        if (ctor) {
            isComponent = !0;
            var rendered, props = getNodeProps$1(vnode);
            var c = new ctor(props, store);
            c.__x = c.G = !0;
            c.props = props;
            c.store = store;
            if (c.install) c.install();
            if (c.beforeRender) c.beforeRender();
            rendered = c.render(c.props, c.data, c.store);
            if (opts.scopedCSS) {
                if (c.constructor.css || c.css) {
                    var cssStr = c.constructor.css ? c.constructor.css : 'function' == typeof c.css ? c.css() : c.css;
                    var cssAttr = '_s' + getCtorName(c.constructor);
                    css[cssAttr] = {
                        id: cssAttr,
                        css: scoper(cssStr, cssAttr)
                    };
                    addScopedAttrStatic(rendered, cssAttr);
                }
                c.scopedCSSAttr = vnode.css;
                scopeHost(rendered, c.scopedCSSAttr);
            }
            return _renderToString(rendered, opts, store, !1, css);
        }
        var html, s = '';
        if (attributes) {
            var attrs = Object.keys(attributes);
            if (opts && !0 === opts.sortAttributes) attrs.sort();
            for (var i = 0; i < attrs.length; i++) {
                var name = attrs[i], v = attributes[name];
                if ('children' !== name) if (!name.match(/[\s\n\\\/='"\0<>]/)) if (opts && opts.allAttributes || 'key' !== name && 'ref' !== name) {
                    if ('className' === name) {
                        if (attributes.class) continue;
                        name = 'class';
                    } else if (isSvgMode && name.match(/^xlink:?./)) name = name.toLowerCase().replace(/^xlink:?/, 'xlink:');
                    if ('style' === name && v && 'object' == typeof v) v = styleObjToCss(v);
                    var hooked = opts.attributeHook && opts.attributeHook(name, v, store, opts, isComponent);
                    if (!hooked && '' !== hooked) {
                        if ('dangerouslySetInnerHTML' === name) html = v && v.__html; else if ((v || 0 === v || '' === v) && 'function' != typeof v) {
                            if (!0 === v || '' === v) {
                                v = name;
                                if (!opts || !opts.xml) {
                                    s += ' ' + name;
                                    continue;
                                }
                            }
                            s += ' ' + name + '="' + encodeEntities(v) + '"';
                        }
                    } else s += hooked;
                }
            }
        }
        if (pretty) {
            var sub = s.replace(/^\n\s*/, ' ');
            if (sub !== s && !~sub.indexOf('\n')) s = sub; else if (pretty && ~s.indexOf('\n')) s += '\n';
        }
        s = '<' + nodeName + s + '>';
        if (String(nodeName).match(/[\s\n\\\/='"\0<>]/)) throw s;
        var isVoid = String(nodeName).match(VOID_ELEMENTS);
        if (isVoid) s = s.replace(/>$/, ' />');
        var pieces = [];
        if (html) {
            if (pretty && isLargeString(html)) html = '\n' + indentChar + indent(html, indentChar);
            s += html;
        } else if (vnode.children) {
            var hasLarge = pretty && ~s.indexOf('\n');
            for (var i = 0; i < vnode.children.length; i++) {
                var child = vnode.children[i];
                if (null != child && !1 !== child) {
                    var childSvgMode = 'svg' === nodeName ? !0 : 'foreignObject' === nodeName ? !1 : isSvgMode, ret = _renderToString(child, opts, store, childSvgMode, css);
                    if (pretty && !hasLarge && isLargeString(ret)) hasLarge = !0;
                    if (ret) pieces.push(ret);
                }
            }
            if (pretty && hasLarge) for (var i = pieces.length; i--; ) pieces[i] = '\n' + indentChar + indent(pieces[i], indentChar);
        }
        if (pieces.length) s += pieces.join(''); else if (opts && opts.xml) return s.substring(0, s.length - 1) + ' />';
        if (!isVoid) {
            if (pretty && ~s.indexOf('\n')) s += '\n';
            s += '</' + nodeName + '>';
        }
        return s;
    }
    function assign$1(obj, props) {
        for (var i in props) obj[i] = props[i];
        return obj;
    }
    function getNodeProps$1(vnode) {
        var props = assign$1({}, vnode.attributes);
        props.children = vnode.children;
        var defaultProps = vnode.nodeName.defaultProps;
        if (void 0 !== defaultProps) for (var i in defaultProps) if (void 0 === props[i]) props[i] = defaultProps[i];
        return props;
    }
    function htm(t) {
        var r = n(this, e(t), arguments, []);
        return r.length > 1 ? r : r[0];
    }
    function _classCallCheck$1(instance, Constructor) {
        if (!(instance instanceof Constructor)) throw new TypeError("Cannot call a class as a function");
    }
    function _possibleConstructorReturn$1(self, call) {
        if (!self) throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
        return call && ("object" == typeof call || "function" == typeof call) ? call : self;
    }
    function _inherits$1(subClass, superClass) {
        if ("function" != typeof superClass && null !== superClass) throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
        subClass.prototype = Object.create(superClass && superClass.prototype, {
            constructor: {
                value: subClass,
                enumerable: !1,
                writable: !0,
                configurable: !0
            }
        });
        if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
    }
    function objectIs(x, y) {
        if (x === y) return 0 !== x || 1 / x == 1 / y; else return x !== x && y !== y;
    }
    function createEventEmitter(value) {
        var handlers = [];
        return {
            on: function(handler) {
                handlers.push(handler);
            },
            off: function(handler) {
                handlers = handlers.filter(function(h) {
                    return h !== handler;
                });
            },
            get: function() {
                return value;
            },
            set: function(newValue, changedBits) {
                value = newValue;
                handlers.forEach(function(handler) {
                    return handler(value, changedBits);
                });
            }
        };
    }
    function onlyChild(children) {
        return Array.isArray(children) ? children[0] : children;
    }
    function createContext(defaultValue, calculateChangedBits) {
        var contextProp = '__create-react-context-' + id$1++ + '__';
        var Provider = function(_Component) {
            function Provider() {
                var _temp, _this, _ret;
                _classCallCheck$1(this, Provider);
                for (var _len = arguments.length, args = Array(_len), key = 0; key < _len; key++) args[key] = arguments[key];
                return _ret = (_temp = _this = _possibleConstructorReturn$1(this, _Component.call.apply(_Component, [ this ].concat(args))), 
                _this.emitter = createEventEmitter(_this.props.value), _temp), _possibleConstructorReturn$1(_this, _ret);
            }
            _inherits$1(Provider, _Component);
            Provider.prototype.getChildContext = function() {
                var _ref;
                return _ref = {}, _ref[contextProp] = this.emitter, _ref;
            };
            Provider.prototype.componentWillReceiveProps = function(nextProps) {
                if (this.props.value !== nextProps.value) {
                    var oldValue = this.props.value;
                    var newValue = nextProps.value;
                    var changedBits;
                    if (objectIs(oldValue, newValue)) changedBits = 0; else {
                        changedBits = 'function' == typeof calculateChangedBits ? calculateChangedBits(oldValue, newValue) : 1073741823;
                        if ('production' !== process.env.NODE_ENV) ;
                        changedBits |= 0;
                        if (0 !== changedBits) this.emitter.set(nextProps.value, changedBits);
                    }
                }
            };
            Provider.prototype.render = function() {
                return this.props.children;
            };
            return Provider;
        }(Component);
        var Consumer = function(_Component2) {
            function Consumer() {
                var _temp2, _this2, _ret2;
                _classCallCheck$1(this, Consumer);
                for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) args[_key2] = arguments[_key2];
                return _ret2 = (_temp2 = _this2 = _possibleConstructorReturn$1(this, _Component2.call.apply(_Component2, [ this ].concat(args))), 
                _this2.state = {
                    value: _this2.getValue()
                }, _this2.onUpdate = function(newValue, changedBits) {
                    var observedBits = 0 | _this2.observedBits;
                    if (0 != (observedBits & changedBits)) _this2.setState({
                        value: _this2.getValue()
                    });
                }, _temp2), _possibleConstructorReturn$1(_this2, _ret2);
            }
            _inherits$1(Consumer, _Component2);
            Consumer.prototype.componentWillReceiveProps = function(nextProps) {
                var observedBits = nextProps.observedBits;
                this.observedBits = void 0 === observedBits || null === observedBits ? 1073741823 : observedBits;
            };
            Consumer.prototype.componentDidMount = function() {
                if (this.context && this.context[contextProp]) this.context[contextProp].on(this.onUpdate);
                var observedBits = this.props.observedBits;
                this.observedBits = void 0 === observedBits || null === observedBits ? 1073741823 : observedBits;
            };
            Consumer.prototype.componentWillUnmount = function() {
                if (this.context && this.context[contextProp]) this.context[contextProp].off(this.onUpdate);
            };
            Consumer.prototype.getValue = function() {
                if (this.context && this.context[contextProp]) return this.context[contextProp].get(); else return defaultValue;
            };
            Consumer.prototype.render = function() {
                return onlyChild(this.props.children)(this.state.value);
            };
            return Consumer;
        }(Component);
        return {
            Provider: Provider,
            Consumer: Consumer
        };
    }
    function _classCallCheck$2(instance, Constructor) {
        if (!(instance instanceof Constructor)) throw new TypeError("Cannot call a class as a function");
    }
    function createRef() {
        return {};
    }
    function isValidElement(element) {
        return element && (element instanceof VNode || element.$$typeof === REACT_ELEMENT_TYPE);
    }
    function renderSubtreeIntoContainer(parentComponent, vnode, container, callback) {
        var wrap = h(ContextProvider, {
            context: parentComponent.context
        }, vnode);
        var renderContainer = render(wrap, container);
        var component = renderContainer._component || renderContainer.base;
        if (callback) callback.call(component, renderContainer);
        return component;
    }
    function Portal(props) {
        renderSubtreeIntoContainer(this, props.vnode, props.container);
    }
    function createPortal(vnode, container) {
        return h(Portal, {
            vnode: vnode,
            container: container
        });
    }
    function findDOMNode(component) {
        return component && (component.base || 1 === component.nodeType && component) || null;
    }
    function unmountComponentAtNode(container) {
        var existing = container.I && container.I.base;
        if (existing && existing.parentNode === container) {
            render(h(EmptyComponent), container, existing);
            return !0;
        }
        return !1;
    }
    function shallowDiffers(a, b) {
        for (var i in a) if (!(i in b)) return !0;
        for (var i in b) if (a[i] !== b[i]) return !0;
        return !1;
    }
    function callMethod(ctx, m, args) {
        if ('string' == typeof m) m = ctx.constructor.prototype[m];
        if ('function' == typeof m) return m.apply(ctx, args);
    }
    function multihook(hooks, skipDuplicates) {
        return function() {
            var ret;
            for (var i = 0; i < hooks.length; i++) {
                var r = callMethod(this, hooks[i], arguments);
                if (skipDuplicates && null != r) {
                    if (!ret) ret = {};
                    for (var key in r) if (r.hasOwnProperty(key)) ret[key] = r[key];
                } else if (void 0 !== r) ret = r;
            }
            return ret;
        };
    }
    function newComponentHook(props, context) {
        propsHook.call(this, props, context);
        this.componentWillReceiveProps = multihook([ propsHook, this.componentWillReceiveProps || 'componentWillReceiveProps' ]);
        this.render = multihook([ propsHook, beforeRender, this.render || 'render', afterRender ]);
    }
    function propsHook(props, context) {
        if (props) {
            var c = props.children;
            if (c && Array.isArray(c) && 1 === c.length && ('string' == typeof c[0] || 'function' == typeof c[0] || c[0] instanceof VNode)) {
                props.children = c[0];
                if (props.children && 'object' == typeof props.children) {
                    props.children.length = 1;
                    props.children[0] = props.children;
                }
            }
            if (options.DEV) {
                var ctor = 'function' == typeof this ? this : this.constructor;
                this.propTypes || ctor.propTypes;
                this.displayName || ctor.name;
            }
        }
    }
    function beforeRender(props) {}
    function afterRender() {}
    function _Component(props, context, opts) {
        Component.call(this, props, context);
        this.state = this.getInitialState ? this.getInitialState() : {};
        this.refs = {};
        this.J = {};
        if (opts !== BYPASS_HOOK) newComponentHook.call(this, props, context);
    }
    function F() {}
    function PureComponent(props, context) {
        _Component.call(this, props, context);
    }
    var VNode = function() {};
    var options = {
        scopedStyle: !0,
        mapping: {},
        isWeb: !0,
        staticStyleMapping: {},
        doc: 'object' == typeof document ? document : null,
        root: function() {
            if ('object' != typeof global || !global || global.Math !== Math || global.Array !== Array) {
                if ('undefined' != typeof self) return self; else if ('undefined' != typeof window) return window; else if ('undefined' != typeof global) return global;
                return function() {
                    return this;
                }();
            }
            return global;
        }(),
        styleCache: []
    };
    var stack = [];
    if ('undefined' != typeof Element && !Element.prototype.addEventListener) {
        var runListeners = function(oEvent) {
            if (!oEvent) oEvent = window.event;
            for (var iLstId = 0, iElId = 0, oEvtListeners = oListeners[oEvent.type]; iElId < oEvtListeners.aEls.length; iElId++) if (oEvtListeners.aEls[iElId] === this) {
                for (iLstId; iLstId < oEvtListeners.aEvts[iElId].length; iLstId++) oEvtListeners.aEvts[iElId][iLstId].call(this, oEvent);
                break;
            }
        };
        var oListeners = {};
        Element.prototype.addEventListener = function(sEventType, fListener) {
            if (oListeners.hasOwnProperty(sEventType)) {
                var oEvtListeners = oListeners[sEventType];
                for (var nElIdx = -1, iElId = 0; iElId < oEvtListeners.aEls.length; iElId++) if (oEvtListeners.aEls[iElId] === this) {
                    nElIdx = iElId;
                    break;
                }
                if (-1 === nElIdx) {
                    oEvtListeners.aEls.push(this);
                    oEvtListeners.aEvts.push([ fListener ]);
                    this['on' + sEventType] = runListeners;
                } else {
                    var aElListeners = oEvtListeners.aEvts[nElIdx];
                    if (this['on' + sEventType] !== runListeners) {
                        aElListeners.splice(0);
                        this['on' + sEventType] = runListeners;
                    }
                    for (var iLstId = 0; iLstId < aElListeners.length; iLstId++) if (aElListeners[iLstId] === fListener) return;
                    aElListeners.push(fListener);
                }
            } else {
                oListeners[sEventType] = {
                    aEls: [ this ],
                    aEvts: [ [ fListener ] ]
                };
                this['on' + sEventType] = runListeners;
            }
        };
        Element.prototype.removeEventListener = function(sEventType, fListener) {
            if (oListeners.hasOwnProperty(sEventType)) {
                var oEvtListeners = oListeners[sEventType];
                for (var nElIdx = -1, iElId = 0; iElId < oEvtListeners.aEls.length; iElId++) if (oEvtListeners.aEls[iElId] === this) {
                    nElIdx = iElId;
                    break;
                }
                if (-1 !== nElIdx) for (var iLstId = 0, aElListeners = oEvtListeners.aEvts[nElIdx]; iLstId < aElListeners.length; iLstId++) if (aElListeners[iLstId] === fListener) aElListeners.splice(iLstId, 1);
            }
        };
    }
    if ('function' != typeof Object.create) Object.create = function(proto, propertiesObject) {
        function F() {}
        if ('object' != typeof proto && 'function' != typeof proto) throw new TypeError('Object prototype may only be an Object: ' + proto); else if (null === proto) throw new Error("This browser's implementation of Object.create is a shim and doesn't support 'null' as the first argument.");
        F.prototype = proto;
        return new F();
    };
    if (!String.prototype.trim) String.prototype.trim = function() {
        return this.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
    };
    var usePromise = 'function' == typeof Promise;
    if ('object' != typeof document && 'undefined' != typeof global && global.v) if ('android' === global.v.platform) usePromise = !0; else {
        var systemVersion = global.v.systemVersion && global.v.systemVersion.split('.')[0] || 0;
        if (systemVersion > 8) usePromise = !0;
    }
    var defer = usePromise ? Promise.resolve().then.bind(Promise.resolve()) : setTimeout;
    var IS_NON_DIMENSIONAL$1 = /acit|ex(?:s|g|n|p|$)|rph|ows|mnc|ntw|ine[ch]|zoo|^ord/i;
    var items = [];
    var mapping = options.mapping;
    var styleId = 0;
    var mounts = [];
    var diffLevel = 0;
    var isSvgMode = !1;
    var hydrating = !1;
    var recyclerComponents = [];
    var obaa = function obaa(target, arr, callback) {
        var _observe = function(target, arr, callback) {
            if (!target.$observer) target.$observer = this;
            var $observer = target.$observer;
            var eventPropArr = [];
            if (obaa.isArray(target)) {
                if (0 === target.length) {
                    target.$observeProps = {};
                    target.$observeProps.$observerPath = '#';
                }
                $observer.mock(target);
            }
            for (var prop in target) if (target.hasOwnProperty(prop)) if (callback) {
                if (obaa.isArray(arr) && obaa.isInArray(arr, prop)) {
                    eventPropArr.push(prop);
                    $observer.watch(target, prop);
                } else if (obaa.isString(arr) && prop == arr) {
                    eventPropArr.push(prop);
                    $observer.watch(target, prop);
                }
            } else {
                eventPropArr.push(prop);
                $observer.watch(target, prop);
            }
            $observer.target = target;
            if (!$observer.propertyChangedHandler) $observer.propertyChangedHandler = [];
            var propChanged = callback ? callback : arr;
            $observer.propertyChangedHandler.push({
                all: !callback,
                propChanged: propChanged,
                eventPropArr: eventPropArr
            });
        };
        _observe.prototype = {
            onPropertyChanged: function(prop, value, oldValue, target, path) {
                if (value !== oldValue && this.propertyChangedHandler) {
                    var rootName = obaa.y(prop, path);
                    for (var i = 0, len = this.propertyChangedHandler.length; i < len; i++) {
                        var handler = this.propertyChangedHandler[i];
                        if (handler.all || obaa.isInArray(handler.eventPropArr, rootName) || 0 === rootName.indexOf('Array-')) handler.propChanged.call(this.target, prop, value, oldValue, path);
                    }
                }
                if (0 !== prop.indexOf('Array-') && 'object' == typeof value) this.watch(target, prop, target.$observeProps.$observerPath);
            },
            mock: function(target) {
                var self = this;
                obaa.methods.forEach(function(item) {
                    target[item] = function() {
                        var old = Array.prototype.slice.call(this, 0);
                        var result = Array.prototype[item].apply(this, Array.prototype.slice.call(arguments));
                        if (new RegExp('\\b' + item + '\\b').test(obaa.triggerStr)) {
                            for (var cprop in this) if (this.hasOwnProperty(cprop) && !obaa.isFunction(this[cprop])) self.watch(this, cprop, this.$observeProps.$observerPath);
                            self.onPropertyChanged('Array-' + item, this, old, this, this.$observeProps.$observerPath);
                        }
                        return result;
                    };
                    target['pure' + item.substring(0, 1).toUpperCase() + item.substring(1)] = function() {
                        return Array.prototype[item].apply(this, Array.prototype.slice.call(arguments));
                    };
                });
            },
            watch: function(target, prop, path) {
                if ('$observeProps' !== prop && '$observer' !== prop) if (!obaa.isFunction(target[prop])) {
                    if (!target.$observeProps) target.$observeProps = {};
                    if (void 0 !== path) target.$observeProps.$observerPath = path; else target.$observeProps.$observerPath = '#';
                    var self = this;
                    var currentValue = target.$observeProps[prop] = target[prop];
                    Object.defineProperty(target, prop, {
                        get: function() {
                            return this.$observeProps[prop];
                        },
                        set: function(value) {
                            var old = this.$observeProps[prop];
                            this.$observeProps[prop] = value;
                            self.onPropertyChanged(prop, value, old, this, target.$observeProps.$observerPath);
                        }
                    });
                    if ('object' == typeof currentValue) {
                        if (obaa.isArray(currentValue)) {
                            this.mock(currentValue);
                            if (0 === currentValue.length) {
                                if (!currentValue.$observeProps) currentValue.$observeProps = {};
                                if (void 0 !== path) currentValue.$observeProps.$observerPath = path; else currentValue.$observeProps.$observerPath = '#';
                            }
                        }
                        for (var cprop in currentValue) if (currentValue.hasOwnProperty(cprop)) this.watch(currentValue, cprop, target.$observeProps.$observerPath + '-' + prop);
                    }
                }
            }
        };
        return new _observe(target, arr, callback);
    };
    obaa.methods = [ 'concat', 'copyWithin', 'entries', 'every', 'fill', 'filter', 'find', 'findIndex', 'forEach', 'includes', 'indexOf', 'join', 'keys', 'lastIndexOf', 'map', 'pop', 'push', 'reduce', 'reduceRight', 'reverse', 'shift', 'slice', 'some', 'sort', 'splice', 'toLocaleString', 'toString', 'unshift', 'values', 'size' ];
    obaa.triggerStr = [ 'concat', 'copyWithin', 'fill', 'pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift', 'size' ].join(',');
    obaa.isArray = function(obj) {
        return '[object Array]' === Object.prototype.toString.call(obj);
    };
    obaa.isString = function(obj) {
        return 'string' == typeof obj;
    };
    obaa.isInArray = function(arr, item) {
        for (var i = arr.length; --i > -1; ) if (item === arr[i]) return !0;
        return !1;
    };
    obaa.isFunction = function(obj) {
        return '[object Function]' == Object.prototype.toString.call(obj);
    };
    obaa.y = function(prop, path) {
        if ('#' === path) return prop; else return path.split('-')[1];
    };
    obaa.add = function(obj, prop) {
        var $observer = obj.$observer;
        $observer.watch(obj, prop);
    };
    obaa.set = function(obj, prop, value, exec) {
        if (!exec) obj[prop] = value;
        var $observer = obj.$observer;
        $observer.watch(obj, prop);
        if (exec) obj[prop] = value;
    };
    Array.prototype.size = function(length) {
        this.length = length;
    };
    var callbacks = [];
    var nextTickCallback = [];
    var id = 0;
    extend(Component.prototype, {
        isReactComponent: {},
        update: function(callback) {
            this.A = !0;
            if (callback) (this.__h = this.__h || []).push(callback);
            renderComponent(this, 2);
            if (options.componentChange) options.componentChange(this, this.base);
            this.A = !1;
        },
        setState: function(state, callback) {
            if (!this.__s) this.__s = this.state;
            this.state = extend(extend({}, this.state), 'function' == typeof state ? state(this.state, this.props) : state);
            if (callback) this.__h.push(callback);
            enqueueRender(this);
        },
        fire: function(type, data) {
            var _this = this;
            Object.keys(this.props).every(function(key) {
                if ('on' + type.toLowerCase() === key.toLowerCase()) {
                    _this.props[key]({
                        detail: data
                    });
                    return !1;
                }
                return !0;
            });
        },
        forceUpdate: function(callback) {
            if (callback) this.__h.push(callback);
            renderComponent(this, 2);
        },
        render: function() {}
    });
    Component.is = 'WeElement';
    var ModelView = function(_Component) {
        function ModelView() {
            _classCallCheck(this, ModelView);
            return _possibleConstructorReturn(this, _Component.apply(this, arguments));
        }
        _inherits(ModelView, _Component);
        ModelView.prototype.beforeInstall = function() {
            this.data = this.vm.data;
        };
        return ModelView;
    }(Component);
    ModelView.observe = !0;
    ModelView.mergeUpdate = !0;
    var hasOwn = {}.hasOwnProperty;
    var encodeEntities = function(s) {
        return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    };
    var indent = function(s, char) {
        return String(s).replace(/(\n+)/g, '$1' + (char || '\t'));
    };
    var mapping$1 = options.mapping;
    var VOID_ELEMENTS = /^(area|base|br|col|embed|hr|img|input|link|meta|param|source|track|wbr)$/;
    var isLargeString = function(s, length, ignoreLines) {
        return String(s).length > (length || 40) || !ignoreLines && -1 !== String(s).indexOf('\n') || -1 !== String(s).indexOf('<');
    };
    var JS_TO_CSS = {};
    var n = function(t, r, u, e) {
        for (var p = 1; p < r.length; p++) {
            var s = r[p++], a = "number" == typeof s ? u[s] : s;
            1 === r[p] ? e[0] = a : 2 === r[p] ? (e[1] = e[1] || {})[r[++p]] = a : 3 === r[p] ? e[1] = Object.assign(e[1] || {}, a) : e.push(r[p] ? t.apply(null, n(t, a, u, [ "", null ])) : a);
        }
        return e;
    }, t = function(n) {
        for (var t, r, u = 1, e = "", p = "", s = [ 0 ], a = function(n) {
            1 === u && (n || (e = e.replace(/^\s*\n\s*|\s*\n\s*$/g, ""))) ? s.push(n || e, 0) : 3 === u && (n || e) ? (s.push(n || e, 1), 
            u = 2) : 2 === u && "..." === e && n ? s.push(n, 3) : 2 === u && e && !n ? s.push(!0, 2, e) : 4 === u && r && (s.push(n || e, 2, r), 
            r = ""), e = "";
        }, f = 0; f < n.length; f++) {
            f && (1 === u && a(), a(f));
            for (var h = 0; h < n[f].length; h++) t = n[f][h], 1 === u ? "<" === t ? (a(), s = [ s ], u = 3) : e += t : p ? t === p ? p = "" : e += t : '"' === t || "'" === t ? p = t : ">" === t ? (a(), 
            u = 1) : u && ("=" === t ? (u = 4, r = e, e = "") : "/" === t ? (a(), 3 === u && (s = s[0]), u = s, (s = s[0]).push(u, 4), 
            u = 0) : " " === t || "\t" === t || "\n" === t || "\r" === t ? (a(), u = 2) : e += t);
        }
        return a(), s;
    }, r = "function" == typeof Map, u = r ? new Map() : {}, e = r ? function(n) {
        var r = u.get(n);
        return r || u.set(n, r = t(n)), r;
    } : function(n) {
        for (var r = "", e = 0; e < n.length; e++) r += n[e].length + "-" + n[e];
        return u[r] || (u[r] = t(n));
    };
    var ARR = [];
    var Children = {
        map: function(children, fn, ctx) {
            if (null == children) return null;
            children = Children.toArray(children);
            if (ctx && ctx !== children) fn = fn.bind(ctx);
            return children.map(fn);
        },
        forEach: function(children, fn, ctx) {
            if (null == children) return null;
            children = Children.toArray(children);
            if (ctx && ctx !== children) fn = fn.bind(ctx);
            children.forEach(fn);
        },
        count: function(children) {
            return children && children.length || 0;
        },
        only: function(children) {
            children = Children.toArray(children);
            if (1 !== children.length) throw new Error('Children.only() expects only one child.');
            return children[0];
        },
        toArray: function(children) {
            if (null == children) return []; else return ARR.concat(children);
        }
    };
    var id$1 = 0;
    var html = htm.bind(h);
    var WeElement = Component;
    var defineElement = define;
    var REACT_ELEMENT_TYPE = 'undefined' != typeof Symbol && Symbol.for && Symbol.for('react.element') || 60103;
    var ContextProvider = function() {
        function ContextProvider() {
            _classCallCheck$2(this, ContextProvider);
        }
        ContextProvider.prototype.getChildContext = function() {
            return this.props.context;
        };
        ContextProvider.prototype.render = function(props) {
            return props.children[0];
        };
        return ContextProvider;
    }();
    var unstable_renderSubtreeIntoContainer = renderSubtreeIntoContainer;
    var BYPASS_HOOK = {};
    extend(_Component.prototype = new Component(), {
        constructor: _Component,
        replaceState: function(state, callback) {
            this.setState(state, callback);
            for (var i in this.state) if (!(i in state)) delete this.state[i];
        },
        getDOMNode: function() {
            return this.base;
        },
        isMounted: function() {
            return !!this.base;
        }
    });
    F.prototype = _Component.prototype;
    PureComponent.prototype = new F();
    PureComponent.prototype.isPureReactComponent = !0;
    PureComponent.prototype.shouldComponentUpdate = function(props, state) {
        return shallowDiffers(this.props, props) || shallowDiffers(this.state, state);
    };
    options.root.Omi = {
        h: h,
        createElement: h,
        cloneElement: cloneElement,
        createRef: createRef,
        Component: Component,
        render: render,
        rerender: rerender,
        options: options,
        WeElement: WeElement,
        define: define,
        rpx: rpx,
        ModelView: ModelView,
        defineElement: defineElement,
        classNames: classNames,
        extractClass: extractClass,
        getHost: getHost,
        renderToString: renderToString,
        tag: tag,
        merge: merge,
        html: html,
        htm: htm,
        Children: Children,
        isValidElement: isValidElement,
        createPortal: createPortal,
        findDOMNode: findDOMNode,
        unmountComponentAtNode: unmountComponentAtNode,
        unstable_renderSubtreeIntoContainer: unstable_renderSubtreeIntoContainer,
        PureComponent: PureComponent,
        createContext: createContext
    };
    options.root.omi = options.root.Omi;
    options.root.Omi.version = 'reomi-1.0.0';
    var Omi = {
        h: h,
        createElement: h,
        cloneElement: cloneElement,
        createRef: createRef,
        Component: Component,
        render: render,
        rerender: rerender,
        options: options,
        WeElement: WeElement,
        define: define,
        rpx: rpx,
        ModelView: ModelView,
        defineElement: defineElement,
        classNames: classNames,
        extractClass: extractClass,
        getHost: getHost,
        renderToString: renderToString,
        tag: tag,
        merge: merge,
        html: html,
        htm: htm,
        Children: Children,
        isValidElement: isValidElement,
        createPortal: createPortal,
        findDOMNode: findDOMNode,
        unmountComponentAtNode: unmountComponentAtNode,
        unstable_renderSubtreeIntoContainer: unstable_renderSubtreeIntoContainer,
        PureComponent: PureComponent,
        createContext: createContext
    };
    if ('undefined' != typeof module) module.exports = Omi; else self.Omi = Omi;
}();
//# sourceMappingURL=omi.js.map