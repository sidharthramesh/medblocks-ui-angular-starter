
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function (exports) {
    'use strict';

    function noop() { }
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot(slot, slot_definition, ctx, $$scope, dirty, get_slot_changes_fn, get_slot_context_fn) {
        const slot_changes = get_slot_changes(slot_definition, $$scope, dirty, get_slot_changes_fn);
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }
    function exclude_internal_props(props) {
        const result = {};
        for (const k in props)
            if (k[0] !== '$')
                result[k] = props[k];
        return result;
    }
    function compute_rest_props(props, keys) {
        const rest = {};
        keys = new Set(keys);
        for (const k in props)
            if (!keys.has(k) && k[0] !== '$')
                rest[k] = props[k];
        return rest;
    }
    function null_to_empty(value) {
        return value == null ? '' : value;
    }
    function set_store_value(store, ret, value = ret) {
        store.set(value);
        return ret;
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function prevent_default(fn) {
        return function (event) {
            event.preventDefault();
            // @ts-ignore
            return fn.call(this, event);
        };
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function to_number(value) {
        return value === '' ? null : +value;
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function select_option(select, value) {
        for (let i = 0; i < select.options.length; i += 1) {
            const option = select.options[i];
            if (option.__value === value) {
                option.selected = true;
                return;
            }
        }
    }
    function select_value(select) {
        const selected_option = select.querySelector(':checked') || select.options[0];
        return selected_option && selected_option.__value;
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function onDestroy(fn) {
        get_current_component().$$.on_destroy.push(fn);
    }
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
    }
    function setContext(key, context) {
        get_current_component().$$.context.set(key, context);
    }
    function getContext(key) {
        return get_current_component().$$.context.get(key);
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);

    function get_spread_update(levels, updates) {
        const update = {};
        const to_null_out = {};
        const accounted_for = { $$scope: 1 };
        let i = levels.length;
        while (i--) {
            const o = levels[i];
            const n = updates[i];
            if (n) {
                for (const key in o) {
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }
    function get_spread_object(spread_props) {
        return typeof spread_props === 'object' && spread_props !== null ? spread_props : {};
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    let SvelteElement;
    if (typeof HTMLElement === 'function') {
        SvelteElement = class extends HTMLElement {
            constructor() {
                super();
                this.attachShadow({ mode: 'open' });
            }
            connectedCallback() {
                // @ts-ignore todo: improve typings
                for (const key in this.$$.slotted) {
                    // @ts-ignore todo: improve typings
                    this.appendChild(this.$$.slotted[key]);
                }
            }
            attributeChangedCallback(attr, _oldValue, newValue) {
                this[attr] = newValue;
            }
            $destroy() {
                destroy_component(this, 1);
                this.$destroy = noop;
            }
            $on(type, callback) {
                // TODO should this delegate to addEventListener?
                const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
                callbacks.push(callback);
                return () => {
                    const index = callbacks.indexOf(callback);
                    if (index !== -1)
                        callbacks.splice(index, 1);
                };
            }
            $set($$props) {
                if (this.$$set && !is_empty($$props)) {
                    this.$$.skip_bound = true;
                    this.$$set($$props);
                    this.$$.skip_bound = false;
                }
            }
        };
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.29.4' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function prop_dev(node, property, value) {
        node[property] = value;
        dispatch_dev('SvelteDOMSetProperty', { node, property, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /* src\rm\Unknown.svelte generated by Svelte v3.29.4 */

    const file = "src\\rm\\Unknown.svelte";

    function create_fragment(ctx) {
    	let div;
    	let t0_value = /*tree*/ ctx[1].rmType + "";
    	let t0;
    	let t1;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t0 = text(t0_value);
    			t1 = text(" not yet implemented");
    			attr_dev(div, "class", "field");
    			attr_dev(div, "id", /*path*/ ctx[0]);
    			add_location(div, file, 5, 0, 126);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t0);
    			append_dev(div, t1);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*tree*/ 2 && t0_value !== (t0_value = /*tree*/ ctx[1].rmType + "")) set_data_dev(t0, t0_value);

    			if (dirty & /*path*/ 1) {
    				attr_dev(div, "id", /*path*/ ctx[0]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Unknown", slots, []);
    	let { path } = $$props;
    	let { tree } = $$props;
    	let { store } = $$props;
    	const writable_props = ["path", "tree", "store"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Unknown> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("path" in $$props) $$invalidate(0, path = $$props.path);
    		if ("tree" in $$props) $$invalidate(1, tree = $$props.tree);
    		if ("store" in $$props) $$invalidate(2, store = $$props.store);
    	};

    	$$self.$capture_state = () => ({ path, tree, store });

    	$$self.$inject_state = $$props => {
    		if ("path" in $$props) $$invalidate(0, path = $$props.path);
    		if ("tree" in $$props) $$invalidate(1, tree = $$props.tree);
    		if ("store" in $$props) $$invalidate(2, store = $$props.store);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [path, tree, store];
    }

    class Unknown extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, { path: 0, tree: 1, store: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Unknown",
    			options,
    			id: create_fragment.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*path*/ ctx[0] === undefined && !("path" in props)) {
    			console.warn("<Unknown> was created without expected prop 'path'");
    		}

    		if (/*tree*/ ctx[1] === undefined && !("tree" in props)) {
    			console.warn("<Unknown> was created without expected prop 'tree'");
    		}

    		if (/*store*/ ctx[2] === undefined && !("store" in props)) {
    			console.warn("<Unknown> was created without expected prop 'store'");
    		}
    	}

    	get path() {
    		throw new Error("<Unknown>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set path(value) {
    		throw new Error("<Unknown>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get tree() {
    		throw new Error("<Unknown>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set tree(value) {
    		throw new Error("<Unknown>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get store() {
    		throw new Error("<Unknown>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set store(value) {
    		throw new Error("<Unknown>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */

    function __rest(s, e) {
        var t = {};
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
            t[p] = s[p];
        if (s != null && typeof Object.getOwnPropertySymbols === "function")
            for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
                if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                    t[p[i]] = s[p[i]];
            }
        return t;
    }

    function destroyAction(paths, store) {
        store.update((obj) => {
            let newObj = Object.assign({}, obj);
            paths.forEach(path => {
                let _a = newObj, _b = path, _ = _a[_b], excluded = __rest(_a, [typeof _b === "symbol" ? _b : _b + ""]);
                newObj = excluded;
            });
            return newObj;
        });
    }
    function triggerDestroy(paths, store) {
        onDestroy(() => destroyAction(paths, store));
    }
    function getLabel(value, input) {
        if (input.list) {
            let label = input.list.filter(option => option.value == value)[0];
            if (label && label.label) {
                return label.label;
            }
            throw new Error(`Cannot find label for ${value} in list`);
        }
        throw new Error(`Cannot find list in provided input`);
    }
    function getLabelOrdinal(value, input) {
        if (input.list) {
            let label = input.list.filter(option => option.ordinal == value)[0];
            if (label && label.label) {
                return label.label;
            }
            throw new Error(`Cannot find label for ${value} in list`);
        }
        throw new Error(`Cannot find list in provided input`);
    }
    function sanitizeDisplayFunction(path, fn, store) {
        try {
            const result = fn(store);
            if (typeof result != 'boolean') {
                console.warn(`[${path}] Got a non boolean result from displayFunction. Ignoring function.`);
                return false;
            }
            else {
                return result;
            }
        }
        catch (error) {
            console.error(`[${path}] Error while evaluating displayFunction: ${error}`);
            return false;
        }
    }
    function sanitizeComputeFunction(path, fn, store, type) {
        try {
            let computed = fn(store);
            if (typeof computed != type) {
                console.warn(`[${path}] computeFunction did not return ${type}. Got ${typeof computed} instead. Ignoring function.`);
                return;
            }
            else {
                return computed;
            }
        }
        catch (error) {
            console.error(`[${path}] Error while evaluating computeFunction: ${error}`);
            return;
        }
    }

    /* src\rm\Ordinal\OrdinalWrite.svelte generated by Svelte v3.29.4 */

    const { Object: Object_1, console: console_1 } = globals;
    const file$1 = "src\\rm\\Ordinal\\OrdinalWrite.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[14] = list[i];
    	return child_ctx;
    }

    // (75:4) {:else}
    function create_else_block(ctx) {
    	let p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "Tree does not have inputs/inputs does not have list";
    			add_location(p, file$1, 75, 8, 3146);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(75:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (62:4) {#if tree.inputs && tree.inputs[0].list}
    function create_if_block(ctx) {
    	let div;
    	let select;
    	let option;
    	let t;
    	let select_disabled_value;
    	let mounted;
    	let dispose;
    	let each_value = /*tree*/ ctx[2].inputs[0].list;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			select = element("select");
    			option = element("option");
    			t = text("Select an option");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			option.__value = undefined;
    			option.value = option.__value;
    			option.selected = true;
    			add_location(option, file$1, 68, 16, 2796);
    			attr_dev(select, "id", /*path*/ ctx[1]);
    			attr_dev(select, "name", "code");
    			select.disabled = select_disabled_value = /*tree*/ ctx[2].inputs[0].list.length === 1;
    			if (/*$store*/ ctx[8][/*internalPath*/ ctx[7] + "|ordinal"] === void 0) add_render_callback(() => /*select_change_handler*/ ctx[12].call(select));
    			add_location(select, file$1, 63, 12, 2594);
    			attr_dev(div, "class", /*selectWrapperClass*/ ctx[6]);
    			add_location(div, file$1, 62, 8, 2549);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, select);
    			append_dev(select, option);
    			append_dev(option, t);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(select, null);
    			}

    			select_option(select, /*$store*/ ctx[8][/*internalPath*/ ctx[7] + "|ordinal"]);

    			if (!mounted) {
    				dispose = listen_dev(select, "change", /*select_change_handler*/ ctx[12]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*tree*/ 4) {
    				each_value = /*tree*/ ctx[2].inputs[0].list;
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(select, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty & /*path*/ 2) {
    				attr_dev(select, "id", /*path*/ ctx[1]);
    			}

    			if (dirty & /*tree*/ 4 && select_disabled_value !== (select_disabled_value = /*tree*/ ctx[2].inputs[0].list.length === 1)) {
    				prop_dev(select, "disabled", select_disabled_value);
    			}

    			if (dirty & /*$store, internalPath, tree, undefined*/ 388) {
    				select_option(select, /*$store*/ ctx[8][/*internalPath*/ ctx[7] + "|ordinal"]);
    			}

    			if (dirty & /*selectWrapperClass*/ 64) {
    				attr_dev(div, "class", /*selectWrapperClass*/ ctx[6]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(62:4) {#if tree.inputs && tree.inputs[0].list}",
    		ctx
    	});

    	return block;
    }

    // (70:16) {#each tree.inputs[0].list as option}
    function create_each_block(ctx) {
    	let option;

    	let t_value = (typeof /*option*/ ctx[14].ordinal !== "undefined"
    	? `${/*option*/ ctx[14].ordinal}. ${/*option*/ ctx[14].label}`
    	: /*option*/ ctx[14].label) + "";

    	let t;
    	let option_value_value;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t = text(t_value);
    			option.__value = option_value_value = /*option*/ ctx[14].ordinal;
    			option.value = option.__value;
    			add_location(option, file$1, 70, 20, 2931);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*tree*/ 4 && t_value !== (t_value = (typeof /*option*/ ctx[14].ordinal !== "undefined"
    			? `${/*option*/ ctx[14].ordinal}. ${/*option*/ ctx[14].label}`
    			: /*option*/ ctx[14].label) + "")) set_data_dev(t, t_value);

    			if (dirty & /*tree*/ 4 && option_value_value !== (option_value_value = /*option*/ ctx[14].ordinal)) {
    				prop_dev(option, "__value", option_value_value);
    				option.value = option.__value;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(70:16) {#each tree.inputs[0].list as option}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let div;
    	let label_1;
    	let t0_value = (/*label*/ ctx[3] || /*tree*/ ctx[2].name) + "";
    	let t0;
    	let t1;

    	function select_block_type(ctx, dirty) {
    		if (/*tree*/ ctx[2].inputs && /*tree*/ ctx[2].inputs[0].list) return create_if_block;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			label_1 = element("label");
    			t0 = text(t0_value);
    			t1 = space();
    			if_block.c();
    			attr_dev(label_1, "class", /*labelClass*/ ctx[5]);
    			attr_dev(label_1, "for", /*path*/ ctx[1]);
    			add_location(label_1, file$1, 60, 4, 2430);
    			attr_dev(div, "class", /*wrapperClass*/ ctx[4]);
    			add_location(div, file$1, 59, 0, 2399);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, label_1);
    			append_dev(label_1, t0);
    			append_dev(div, t1);
    			if_block.m(div, null);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*label, tree*/ 12 && t0_value !== (t0_value = (/*label*/ ctx[3] || /*tree*/ ctx[2].name) + "")) set_data_dev(t0, t0_value);

    			if (dirty & /*labelClass*/ 32) {
    				attr_dev(label_1, "class", /*labelClass*/ ctx[5]);
    			}

    			if (dirty & /*path*/ 2) {
    				attr_dev(label_1, "for", /*path*/ ctx[1]);
    			}

    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(div, null);
    				}
    			}

    			if (dirty & /*wrapperClass*/ 16) {
    				attr_dev(div, "class", /*wrapperClass*/ ctx[4]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let $store,
    		$$unsubscribe_store = noop,
    		$$subscribe_store = () => ($$unsubscribe_store(), $$unsubscribe_store = subscribe(store, $$value => $$invalidate(8, $store = $$value)), store);

    	$$self.$$.on_destroy.push(() => $$unsubscribe_store());
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("OrdinalWrite", slots, []);
    	
    	
    	let { store } = $$props;
    	validate_store(store, "store");
    	$$subscribe_store();
    	let { path } = $$props;
    	let { tree } = $$props;
    	let { label = undefined } = $$props;
    	let { defaultOrdinal = undefined } = $$props;
    	let { computeFunction = undefined } = $$props;
    	let { wrapperClass = "field" } = $$props;
    	let { labelClass = "label" } = $$props;
    	let { selectWrapperClass = "select" } = $$props;
    	let { ordinalPathAppend = "/value" } = $$props;
    	let internalPath;
    	let selected;

    	//Triggers
    	onMount(() => {
    		if (defaultOrdinal) {
    			set_store_value(store, $store[internalPath + "|ordinal"] = defaultOrdinal, $store);
    		}
    	});

    	const writable_props = [
    		"store",
    		"path",
    		"tree",
    		"label",
    		"defaultOrdinal",
    		"computeFunction",
    		"wrapperClass",
    		"labelClass",
    		"selectWrapperClass",
    		"ordinalPathAppend"
    	];

    	Object_1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<OrdinalWrite> was created with unknown prop '${key}'`);
    	});

    	function select_change_handler() {
    		$store[internalPath + "|ordinal"] = select_value(this);
    		store.set($store);
    		((($$invalidate(7, internalPath), $$invalidate(1, path)), $$invalidate(11, ordinalPathAppend)), $$invalidate(0, store));
    		$$invalidate(2, tree);
    	}

    	$$self.$$set = $$props => {
    		if ("store" in $$props) $$subscribe_store($$invalidate(0, store = $$props.store));
    		if ("path" in $$props) $$invalidate(1, path = $$props.path);
    		if ("tree" in $$props) $$invalidate(2, tree = $$props.tree);
    		if ("label" in $$props) $$invalidate(3, label = $$props.label);
    		if ("defaultOrdinal" in $$props) $$invalidate(9, defaultOrdinal = $$props.defaultOrdinal);
    		if ("computeFunction" in $$props) $$invalidate(10, computeFunction = $$props.computeFunction);
    		if ("wrapperClass" in $$props) $$invalidate(4, wrapperClass = $$props.wrapperClass);
    		if ("labelClass" in $$props) $$invalidate(5, labelClass = $$props.labelClass);
    		if ("selectWrapperClass" in $$props) $$invalidate(6, selectWrapperClass = $$props.selectWrapperClass);
    		if ("ordinalPathAppend" in $$props) $$invalidate(11, ordinalPathAppend = $$props.ordinalPathAppend);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		destroyAction,
    		sanitizeComputeFunction,
    		triggerDestroy,
    		store,
    		path,
    		tree,
    		label,
    		defaultOrdinal,
    		computeFunction,
    		wrapperClass,
    		labelClass,
    		selectWrapperClass,
    		ordinalPathAppend,
    		internalPath,
    		selected,
    		$store
    	});

    	$$self.$inject_state = $$props => {
    		if ("store" in $$props) $$subscribe_store($$invalidate(0, store = $$props.store));
    		if ("path" in $$props) $$invalidate(1, path = $$props.path);
    		if ("tree" in $$props) $$invalidate(2, tree = $$props.tree);
    		if ("label" in $$props) $$invalidate(3, label = $$props.label);
    		if ("defaultOrdinal" in $$props) $$invalidate(9, defaultOrdinal = $$props.defaultOrdinal);
    		if ("computeFunction" in $$props) $$invalidate(10, computeFunction = $$props.computeFunction);
    		if ("wrapperClass" in $$props) $$invalidate(4, wrapperClass = $$props.wrapperClass);
    		if ("labelClass" in $$props) $$invalidate(5, labelClass = $$props.labelClass);
    		if ("selectWrapperClass" in $$props) $$invalidate(6, selectWrapperClass = $$props.selectWrapperClass);
    		if ("ordinalPathAppend" in $$props) $$invalidate(11, ordinalPathAppend = $$props.ordinalPathAppend);
    		if ("internalPath" in $$props) $$invalidate(7, internalPath = $$props.internalPath);
    		if ("selected" in $$props) $$invalidate(13, selected = $$props.selected);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*path, ordinalPathAppend, internalPath, store*/ 2179) {
    			 {
    				//TODO: Needs to be changed later. Must append even it /ordinal_value not present. 
    				//Convenient for passing tests for now.
    				$$invalidate(7, internalPath = path.replace("/ordinal_value", ordinalPathAppend));

    				triggerDestroy(["|ordinal", "|code", "|value"].map(a => internalPath + a), store);
    			}
    		}

    		if ($$self.$$.dirty & /*computeFunction, path, $store, store, internalPath*/ 1411) {
    			 if (computeFunction) {
    				let result = sanitizeComputeFunction(path, computeFunction, $store, "number");

    				if (result && result !== $store[path]) {
    					store.update(s => Object.assign(Object.assign({}, s), { [internalPath + "|ordinal"]: result }));
    				}
    			}
    		}

    		if ($$self.$$.dirty & /*$store, internalPath*/ 384) {
    			 $$invalidate(13, selected = $store[internalPath + "|ordinal"]);
    		}

    		if ($$self.$$.dirty & /*selected, tree, store, internalPath*/ 8325) {
    			 if (selected) {
    				if (tree.inputs && tree.inputs[0].list) {
    					let option = tree.inputs[0].list.filter(option => option.ordinal == selected)[0];
    					let { label, value } = option;

    					store.update(store => Object.assign(Object.assign({}, store), {
    						[internalPath + "|code"]: value,
    						[internalPath + "|value"]: label
    					}));
    				} else {
    					console.error("Tree does not have input/ input.list");
    				}
    			} else {
    				const pathsToRemove = [internalPath + "|code", internalPath + "|value"];
    				destroyAction(pathsToRemove, store);
    			}
    		}
    	};

    	return [
    		store,
    		path,
    		tree,
    		label,
    		wrapperClass,
    		labelClass,
    		selectWrapperClass,
    		internalPath,
    		$store,
    		defaultOrdinal,
    		computeFunction,
    		ordinalPathAppend,
    		select_change_handler
    	];
    }

    class OrdinalWrite extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {
    			store: 0,
    			path: 1,
    			tree: 2,
    			label: 3,
    			defaultOrdinal: 9,
    			computeFunction: 10,
    			wrapperClass: 4,
    			labelClass: 5,
    			selectWrapperClass: 6,
    			ordinalPathAppend: 11
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "OrdinalWrite",
    			options,
    			id: create_fragment$1.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*store*/ ctx[0] === undefined && !("store" in props)) {
    			console_1.warn("<OrdinalWrite> was created without expected prop 'store'");
    		}

    		if (/*path*/ ctx[1] === undefined && !("path" in props)) {
    			console_1.warn("<OrdinalWrite> was created without expected prop 'path'");
    		}

    		if (/*tree*/ ctx[2] === undefined && !("tree" in props)) {
    			console_1.warn("<OrdinalWrite> was created without expected prop 'tree'");
    		}
    	}

    	get store() {
    		throw new Error("<OrdinalWrite>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set store(value) {
    		throw new Error("<OrdinalWrite>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get path() {
    		throw new Error("<OrdinalWrite>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set path(value) {
    		throw new Error("<OrdinalWrite>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get tree() {
    		throw new Error("<OrdinalWrite>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set tree(value) {
    		throw new Error("<OrdinalWrite>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get label() {
    		throw new Error("<OrdinalWrite>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set label(value) {
    		throw new Error("<OrdinalWrite>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get defaultOrdinal() {
    		throw new Error("<OrdinalWrite>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set defaultOrdinal(value) {
    		throw new Error("<OrdinalWrite>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get computeFunction() {
    		throw new Error("<OrdinalWrite>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set computeFunction(value) {
    		throw new Error("<OrdinalWrite>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get wrapperClass() {
    		throw new Error("<OrdinalWrite>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set wrapperClass(value) {
    		throw new Error("<OrdinalWrite>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get labelClass() {
    		throw new Error("<OrdinalWrite>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set labelClass(value) {
    		throw new Error("<OrdinalWrite>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get selectWrapperClass() {
    		throw new Error("<OrdinalWrite>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set selectWrapperClass(value) {
    		throw new Error("<OrdinalWrite>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get ordinalPathAppend() {
    		throw new Error("<OrdinalWrite>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set ordinalPathAppend(value) {
    		throw new Error("<OrdinalWrite>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\rm\Quantity\QuantityWrite.svelte generated by Svelte v3.29.4 */

    const { Object: Object_1$1 } = globals;
    const file$2 = "src\\rm\\Quantity\\QuantityWrite.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[15] = list[i];
    	return child_ctx;
    }

    // (38:4) {#if displayTitle}
    function create_if_block_1(ctx) {
    	let label;
    	let t_value = /*tree*/ ctx[2].name + "";
    	let t;

    	const block = {
    		c: function create() {
    			label = element("label");
    			t = text(t_value);
    			attr_dev(label, "for", /*path*/ ctx[0]);
    			attr_dev(label, "class", /*labelClass*/ ctx[4]);
    			add_location(label, file$2, 38, 8, 1306);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, label, anchor);
    			append_dev(label, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*tree*/ 4 && t_value !== (t_value = /*tree*/ ctx[2].name + "")) set_data_dev(t, t_value);

    			if (dirty & /*path*/ 1) {
    				attr_dev(label, "for", /*path*/ ctx[0]);
    			}

    			if (dirty & /*labelClass*/ 16) {
    				attr_dev(label, "class", /*labelClass*/ ctx[4]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(label);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(38:4) {#if displayTitle}",
    		ctx
    	});

    	return block;
    }

    // (59:12) {:else}
    function create_else_block$1(ctx) {
    	let p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "Tree does not have input list";
    			add_location(p, file$2, 59, 16, 2114);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(59:12) {:else}",
    		ctx
    	});

    	return block;
    }

    // (51:12) {#if tree.inputs && tree.inputs[1].list}
    function create_if_block$1(ctx) {
    	let div;
    	let select;
    	let mounted;
    	let dispose;
    	let each_value = /*tree*/ ctx[2].inputs[1].list;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			select = element("select");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			if (/*internalUnits*/ ctx[8] === void 0) add_render_callback(() => /*select_change_handler*/ ctx[12].call(select));
    			add_location(select, file$2, 52, 20, 1807);
    			attr_dev(div, "class", /*selectWrapperClass*/ ctx[6]);
    			add_location(div, file$2, 51, 16, 1753);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, select);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(select, null);
    			}

    			select_option(select, /*internalUnits*/ ctx[8]);

    			if (!mounted) {
    				dispose = listen_dev(select, "change", /*select_change_handler*/ ctx[12]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*tree*/ 4) {
    				each_value = /*tree*/ ctx[2].inputs[1].list;
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(select, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty & /*internalUnits, tree*/ 260) {
    				select_option(select, /*internalUnits*/ ctx[8]);
    			}

    			if (dirty & /*selectWrapperClass*/ 64) {
    				attr_dev(div, "class", /*selectWrapperClass*/ ctx[6]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(51:12) {#if tree.inputs && tree.inputs[1].list}",
    		ctx
    	});

    	return block;
    }

    // (54:24) {#each tree.inputs[1].list as option}
    function create_each_block$1(ctx) {
    	let option;
    	let t_value = /*option*/ ctx[15].label + "";
    	let t;
    	let option_value_value;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t = text(t_value);
    			option.__value = option_value_value = /*option*/ ctx[15].value;
    			option.value = option.__value;
    			add_location(option, file$2, 54, 28, 1935);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*tree*/ 4 && t_value !== (t_value = /*option*/ ctx[15].label + "")) set_data_dev(t, t_value);

    			if (dirty & /*tree*/ 4 && option_value_value !== (option_value_value = /*option*/ ctx[15].value)) {
    				prop_dev(option, "__value", option_value_value);
    				option.value = option.__value;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(54:24) {#each tree.inputs[1].list as option}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let div3;
    	let t0;
    	let div2;
    	let div0;
    	let input;
    	let t1;
    	let div1;
    	let mounted;
    	let dispose;
    	let if_block0 = /*displayTitle*/ ctx[7] && create_if_block_1(ctx);

    	function select_block_type(ctx, dirty) {
    		if (/*tree*/ ctx[2].inputs && /*tree*/ ctx[2].inputs[1].list) return create_if_block$1;
    		return create_else_block$1;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block1 = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			if (if_block0) if_block0.c();
    			t0 = space();
    			div2 = element("div");
    			div0 = element("div");
    			input = element("input");
    			t1 = space();
    			div1 = element("div");
    			if_block1.c();
    			attr_dev(input, "id", /*path*/ ctx[0]);
    			attr_dev(input, "type", "number");
    			attr_dev(input, "class", "input");
    			add_location(input, file$2, 42, 12, 1444);
    			attr_dev(div0, "class", "column");
    			add_location(div0, file$2, 41, 8, 1410);
    			attr_dev(div1, "class", "column");
    			toggle_class(div1, "is-hidden", /*hideUnits*/ ctx[5]);
    			add_location(div1, file$2, 49, 8, 1633);
    			attr_dev(div2, "class", "columns");
    			add_location(div2, file$2, 40, 4, 1379);
    			attr_dev(div3, "class", /*wrapperClass*/ ctx[3]);
    			add_location(div3, file$2, 36, 0, 1246);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			if (if_block0) if_block0.m(div3, null);
    			append_dev(div3, t0);
    			append_dev(div3, div2);
    			append_dev(div2, div0);
    			append_dev(div0, input);
    			set_input_value(input, /*$store*/ ctx[10][/*magnitudePath*/ ctx[9]]);
    			append_dev(div2, t1);
    			append_dev(div2, div1);
    			if_block1.m(div1, null);

    			if (!mounted) {
    				dispose = listen_dev(input, "input", /*input_input_handler*/ ctx[11]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*displayTitle*/ ctx[7]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_1(ctx);
    					if_block0.c();
    					if_block0.m(div3, t0);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (dirty & /*path*/ 1) {
    				attr_dev(input, "id", /*path*/ ctx[0]);
    			}

    			if (dirty & /*$store, magnitudePath*/ 1536 && to_number(input.value) !== /*$store*/ ctx[10][/*magnitudePath*/ ctx[9]]) {
    				set_input_value(input, /*$store*/ ctx[10][/*magnitudePath*/ ctx[9]]);
    			}

    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block1) {
    				if_block1.p(ctx, dirty);
    			} else {
    				if_block1.d(1);
    				if_block1 = current_block_type(ctx);

    				if (if_block1) {
    					if_block1.c();
    					if_block1.m(div1, null);
    				}
    			}

    			if (dirty & /*hideUnits*/ 32) {
    				toggle_class(div1, "is-hidden", /*hideUnits*/ ctx[5]);
    			}

    			if (dirty & /*wrapperClass*/ 8) {
    				attr_dev(div3, "class", /*wrapperClass*/ ctx[3]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    			if (if_block0) if_block0.d();
    			if_block1.d();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let $store,
    		$$unsubscribe_store = noop,
    		$$subscribe_store = () => ($$unsubscribe_store(), $$unsubscribe_store = subscribe(store, $$value => $$invalidate(10, $store = $$value)), store);

    	$$self.$$.on_destroy.push(() => $$unsubscribe_store());
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("QuantityWrite", slots, []);
    	
    	let { path } = $$props;
    	let { store } = $$props;
    	validate_store(store, "store");
    	$$subscribe_store();
    	let { tree } = $$props;
    	let { wrapperClass = "field" } = $$props;
    	let { labelClass = "label" } = $$props;
    	let { hideUnits = false } = $$props;
    	let { selectWrapperClass = "select" } = $$props;
    	let { displayTitle = true } = $$props;
    	let internalUnits;
    	let unitPath;
    	let magnitudePath;
    	let magnitudeStoreValue;

    	const writable_props = [
    		"path",
    		"store",
    		"tree",
    		"wrapperClass",
    		"labelClass",
    		"hideUnits",
    		"selectWrapperClass",
    		"displayTitle"
    	];

    	Object_1$1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<QuantityWrite> was created with unknown prop '${key}'`);
    	});

    	function input_input_handler() {
    		$store[magnitudePath] = to_number(this.value);
    		store.set($store);
    		((($$invalidate(9, magnitudePath), $$invalidate(0, path)), $$invalidate(13, unitPath)), $$invalidate(1, store));
    	}

    	function select_change_handler() {
    		internalUnits = select_value(this);
    		$$invalidate(8, internalUnits);
    		$$invalidate(2, tree);
    	}

    	$$self.$$set = $$props => {
    		if ("path" in $$props) $$invalidate(0, path = $$props.path);
    		if ("store" in $$props) $$subscribe_store($$invalidate(1, store = $$props.store));
    		if ("tree" in $$props) $$invalidate(2, tree = $$props.tree);
    		if ("wrapperClass" in $$props) $$invalidate(3, wrapperClass = $$props.wrapperClass);
    		if ("labelClass" in $$props) $$invalidate(4, labelClass = $$props.labelClass);
    		if ("hideUnits" in $$props) $$invalidate(5, hideUnits = $$props.hideUnits);
    		if ("selectWrapperClass" in $$props) $$invalidate(6, selectWrapperClass = $$props.selectWrapperClass);
    		if ("displayTitle" in $$props) $$invalidate(7, displayTitle = $$props.displayTitle);
    	};

    	$$self.$capture_state = () => ({
    		triggerDestroy,
    		path,
    		store,
    		tree,
    		wrapperClass,
    		labelClass,
    		hideUnits,
    		selectWrapperClass,
    		displayTitle,
    		internalUnits,
    		unitPath,
    		magnitudePath,
    		magnitudeStoreValue,
    		$store
    	});

    	$$self.$inject_state = $$props => {
    		if ("path" in $$props) $$invalidate(0, path = $$props.path);
    		if ("store" in $$props) $$subscribe_store($$invalidate(1, store = $$props.store));
    		if ("tree" in $$props) $$invalidate(2, tree = $$props.tree);
    		if ("wrapperClass" in $$props) $$invalidate(3, wrapperClass = $$props.wrapperClass);
    		if ("labelClass" in $$props) $$invalidate(4, labelClass = $$props.labelClass);
    		if ("hideUnits" in $$props) $$invalidate(5, hideUnits = $$props.hideUnits);
    		if ("selectWrapperClass" in $$props) $$invalidate(6, selectWrapperClass = $$props.selectWrapperClass);
    		if ("displayTitle" in $$props) $$invalidate(7, displayTitle = $$props.displayTitle);
    		if ("internalUnits" in $$props) $$invalidate(8, internalUnits = $$props.internalUnits);
    		if ("unitPath" in $$props) $$invalidate(13, unitPath = $$props.unitPath);
    		if ("magnitudePath" in $$props) $$invalidate(9, magnitudePath = $$props.magnitudePath);
    		if ("magnitudeStoreValue" in $$props) $$invalidate(14, magnitudeStoreValue = $$props.magnitudeStoreValue);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*path, unitPath, magnitudePath, store*/ 8707) {
    			 {
    				$$invalidate(13, unitPath = path + "|unit");
    				$$invalidate(9, magnitudePath = path + "|magnitude");
    				triggerDestroy([unitPath, magnitudePath], store);
    			}
    		}

    		if ($$self.$$.dirty & /*$store, magnitudePath*/ 1536) {
    			 $$invalidate(14, magnitudeStoreValue = $store[magnitudePath]);
    		}

    		if ($$self.$$.dirty & /*magnitudeStoreValue, store, magnitudePath, unitPath, $store, internalUnits*/ 26370) {
    			 {
    				if (typeof magnitudeStoreValue != "undefined") {
    					if (magnitudeStoreValue == null) {
    						store.update(s => Object.assign(Object.assign({}, s), {
    							[magnitudePath]: undefined,
    							[unitPath]: undefined
    						}));
    					} else if ($store[unitPath] != internalUnits) {
    						store.update(s => Object.assign(Object.assign({}, s), { [unitPath]: internalUnits }));
    					}
    				}
    			}
    		}
    	};

    	return [
    		path,
    		store,
    		tree,
    		wrapperClass,
    		labelClass,
    		hideUnits,
    		selectWrapperClass,
    		displayTitle,
    		internalUnits,
    		magnitudePath,
    		$store,
    		input_input_handler,
    		select_change_handler
    	];
    }

    class QuantityWrite extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {
    			path: 0,
    			store: 1,
    			tree: 2,
    			wrapperClass: 3,
    			labelClass: 4,
    			hideUnits: 5,
    			selectWrapperClass: 6,
    			displayTitle: 7
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "QuantityWrite",
    			options,
    			id: create_fragment$2.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*path*/ ctx[0] === undefined && !("path" in props)) {
    			console.warn("<QuantityWrite> was created without expected prop 'path'");
    		}

    		if (/*store*/ ctx[1] === undefined && !("store" in props)) {
    			console.warn("<QuantityWrite> was created without expected prop 'store'");
    		}

    		if (/*tree*/ ctx[2] === undefined && !("tree" in props)) {
    			console.warn("<QuantityWrite> was created without expected prop 'tree'");
    		}
    	}

    	get path() {
    		throw new Error("<QuantityWrite>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set path(value) {
    		throw new Error("<QuantityWrite>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get store() {
    		throw new Error("<QuantityWrite>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set store(value) {
    		throw new Error("<QuantityWrite>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get tree() {
    		throw new Error("<QuantityWrite>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set tree(value) {
    		throw new Error("<QuantityWrite>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get wrapperClass() {
    		throw new Error("<QuantityWrite>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set wrapperClass(value) {
    		throw new Error("<QuantityWrite>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get labelClass() {
    		throw new Error("<QuantityWrite>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set labelClass(value) {
    		throw new Error("<QuantityWrite>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get hideUnits() {
    		throw new Error("<QuantityWrite>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set hideUnits(value) {
    		throw new Error("<QuantityWrite>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get selectWrapperClass() {
    		throw new Error("<QuantityWrite>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set selectWrapperClass(value) {
    		throw new Error("<QuantityWrite>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get displayTitle() {
    		throw new Error("<QuantityWrite>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set displayTitle(value) {
    		throw new Error("<QuantityWrite>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\rm\Ordinal\OrdinalRead.svelte generated by Svelte v3.29.4 */
    const file$3 = "src\\rm\\Ordinal\\OrdinalRead.svelte";

    // (28:12) {:else}
    function create_else_block_1(ctx) {
    	let p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "No inputs found in tree";
    			add_location(p, file$3, 28, 16, 1069);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_1.name,
    		type: "else",
    		source: "(28:12) {:else}",
    		ctx
    	});

    	return block;
    }

    // (20:12) {#if tree.inputs}
    function create_if_block$2(ctx) {
    	let p;

    	function select_block_type_1(ctx, dirty) {
    		if (typeof /*selected*/ ctx[4] !== "undefined") return create_if_block_1$1;
    		return create_else_block$2;
    	}

    	let current_block_type = select_block_type_1(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			p = element("p");
    			if_block.c();
    			attr_dev(p, "class", /*ordinalClass*/ ctx[2]);
    			add_location(p, file$3, 20, 12, 775);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			if_block.m(p, null);
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type === (current_block_type = select_block_type_1(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(p, null);
    				}
    			}

    			if (dirty & /*ordinalClass*/ 4) {
    				attr_dev(p, "class", /*ordinalClass*/ ctx[2]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    			if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(20:12) {#if tree.inputs}",
    		ctx
    	});

    	return block;
    }

    // (24:16) {:else}
    function create_else_block$2(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("-");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$2.name,
    		type: "else",
    		source: "(24:16) {:else}",
    		ctx
    	});

    	return block;
    }

    // (22:16) {#if typeof selected !== 'undefined'}
    function create_if_block_1$1(ctx) {
    	let t0;
    	let t1;
    	let t2_value = getLabelOrdinal(/*$store*/ ctx[6][/*internalPath*/ ctx[5] + "|ordinal"], /*tree*/ ctx[1].inputs[0]) + "";
    	let t2;

    	const block = {
    		c: function create() {
    			t0 = text(/*selected*/ ctx[4]);
    			t1 = text(" - ");
    			t2 = text(t2_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, t2, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*selected*/ 16) set_data_dev(t0, /*selected*/ ctx[4]);
    			if (dirty & /*$store, internalPath, tree*/ 98 && t2_value !== (t2_value = getLabelOrdinal(/*$store*/ ctx[6][/*internalPath*/ ctx[5] + "|ordinal"], /*tree*/ ctx[1].inputs[0]) + "")) set_data_dev(t2, t2_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(t2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(22:16) {#if typeof selected !== 'undefined'}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let div;
    	let p;
    	let t0_value = /*tree*/ ctx[1].name + "";
    	let t0;
    	let t1;

    	function select_block_type(ctx, dirty) {
    		if (/*tree*/ ctx[1].inputs) return create_if_block$2;
    		return create_else_block_1;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			p = element("p");
    			t0 = text(t0_value);
    			t1 = space();
    			if_block.c();
    			attr_dev(p, "class", /*labelClass*/ ctx[3]);
    			add_location(p, file$3, 18, 8, 695);
    			attr_dev(div, "class", "field");
    			add_location(div, file$3, 17, 0, 667);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, p);
    			append_dev(p, t0);
    			append_dev(div, t1);
    			if_block.m(div, null);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*tree*/ 2 && t0_value !== (t0_value = /*tree*/ ctx[1].name + "")) set_data_dev(t0, t0_value);

    			if (dirty & /*labelClass*/ 8) {
    				attr_dev(p, "class", /*labelClass*/ ctx[3]);
    			}

    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(div, null);
    				}
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let $store,
    		$$unsubscribe_store = noop,
    		$$subscribe_store = () => ($$unsubscribe_store(), $$unsubscribe_store = subscribe(store, $$value => $$invalidate(6, $store = $$value)), store);

    	$$self.$$.on_destroy.push(() => $$unsubscribe_store());
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("OrdinalRead", slots, []);
    	
    	let { store } = $$props;
    	validate_store(store, "store");
    	$$subscribe_store();
    	let { path } = $$props;
    	let { tree } = $$props;
    	let { ordinalPathAppend = "/value" } = $$props;
    	let { ordinalClass = "subtitle is-5" } = $$props;
    	let { labelClass = "has-text-grey has-text-weight-semibold is-size-6" } = $$props;
    	let selected;
    	let internalPath;
    	const writable_props = ["store", "path", "tree", "ordinalPathAppend", "ordinalClass", "labelClass"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<OrdinalRead> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("store" in $$props) $$subscribe_store($$invalidate(0, store = $$props.store));
    		if ("path" in $$props) $$invalidate(7, path = $$props.path);
    		if ("tree" in $$props) $$invalidate(1, tree = $$props.tree);
    		if ("ordinalPathAppend" in $$props) $$invalidate(8, ordinalPathAppend = $$props.ordinalPathAppend);
    		if ("ordinalClass" in $$props) $$invalidate(2, ordinalClass = $$props.ordinalClass);
    		if ("labelClass" in $$props) $$invalidate(3, labelClass = $$props.labelClass);
    	};

    	$$self.$capture_state = () => ({
    		getLabelOrdinal,
    		store,
    		path,
    		tree,
    		ordinalPathAppend,
    		ordinalClass,
    		labelClass,
    		selected,
    		internalPath,
    		$store
    	});

    	$$self.$inject_state = $$props => {
    		if ("store" in $$props) $$subscribe_store($$invalidate(0, store = $$props.store));
    		if ("path" in $$props) $$invalidate(7, path = $$props.path);
    		if ("tree" in $$props) $$invalidate(1, tree = $$props.tree);
    		if ("ordinalPathAppend" in $$props) $$invalidate(8, ordinalPathAppend = $$props.ordinalPathAppend);
    		if ("ordinalClass" in $$props) $$invalidate(2, ordinalClass = $$props.ordinalClass);
    		if ("labelClass" in $$props) $$invalidate(3, labelClass = $$props.labelClass);
    		if ("selected" in $$props) $$invalidate(4, selected = $$props.selected);
    		if ("internalPath" in $$props) $$invalidate(5, internalPath = $$props.internalPath);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*path, ordinalPathAppend*/ 384) {
    			 $$invalidate(5, internalPath = path.replace("/ordinal_value", ordinalPathAppend));
    		}

    		if ($$self.$$.dirty & /*$store, internalPath*/ 96) {
    			 $$invalidate(4, selected = $store[internalPath + "|ordinal"]);
    		}
    	};

    	return [
    		store,
    		tree,
    		ordinalClass,
    		labelClass,
    		selected,
    		internalPath,
    		$store,
    		path,
    		ordinalPathAppend
    	];
    }

    class OrdinalRead extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {
    			store: 0,
    			path: 7,
    			tree: 1,
    			ordinalPathAppend: 8,
    			ordinalClass: 2,
    			labelClass: 3
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "OrdinalRead",
    			options,
    			id: create_fragment$3.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*store*/ ctx[0] === undefined && !("store" in props)) {
    			console.warn("<OrdinalRead> was created without expected prop 'store'");
    		}

    		if (/*path*/ ctx[7] === undefined && !("path" in props)) {
    			console.warn("<OrdinalRead> was created without expected prop 'path'");
    		}

    		if (/*tree*/ ctx[1] === undefined && !("tree" in props)) {
    			console.warn("<OrdinalRead> was created without expected prop 'tree'");
    		}
    	}

    	get store() {
    		throw new Error("<OrdinalRead>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set store(value) {
    		throw new Error("<OrdinalRead>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get path() {
    		throw new Error("<OrdinalRead>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set path(value) {
    		throw new Error("<OrdinalRead>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get tree() {
    		throw new Error("<OrdinalRead>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set tree(value) {
    		throw new Error("<OrdinalRead>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get ordinalPathAppend() {
    		throw new Error("<OrdinalRead>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set ordinalPathAppend(value) {
    		throw new Error("<OrdinalRead>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get ordinalClass() {
    		throw new Error("<OrdinalRead>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set ordinalClass(value) {
    		throw new Error("<OrdinalRead>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get labelClass() {
    		throw new Error("<OrdinalRead>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set labelClass(value) {
    		throw new Error("<OrdinalRead>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\rm\helpers\DisplayLabel.svelte generated by Svelte v3.29.4 */

    const file$4 = "src\\rm\\helpers\\DisplayLabel.svelte";

    function create_fragment$4(ctx) {
    	let p;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[1].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[0], null);

    	const block = {
    		c: function create() {
    			p = element("p");
    			if (default_slot) default_slot.c();
    			attr_dev(p, "class", "is-6 has-text-grey has-text-weight-semibold");
    			add_location(p, file$4, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);

    			if (default_slot) {
    				default_slot.m(p, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 1) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[0], dirty, null, null);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("DisplayLabel", slots, ['default']);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<DisplayLabel> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("$$scope" in $$props) $$invalidate(0, $$scope = $$props.$$scope);
    	};

    	return [$$scope, slots];
    }

    class DisplayLabel extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "DisplayLabel",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    /* src\rm\Quantity\QuantityRead.svelte generated by Svelte v3.29.4 */
    const file$5 = "src\\rm\\Quantity\\QuantityRead.svelte";

    // (30:8) {:else}
    function create_else_block_1$1(ctx) {
    	let p;
    	let t;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t = text("-");
    			attr_dev(p, "class", /*magnitudeClass*/ ctx[5]);
    			add_location(p, file$5, 30, 12, 1056);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*magnitudeClass*/ 32) {
    				attr_dev(p, "class", /*magnitudeClass*/ ctx[5]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_1$1.name,
    		type: "else",
    		source: "(30:8) {:else}",
    		ctx
    	});

    	return block;
    }

    // (21:8) {#if typeof $store[magnitudePath] != "undefined"}
    function create_if_block$3(ctx) {
    	let if_block_anchor;

    	function select_block_type_1(ctx, dirty) {
    		if (/*tree*/ ctx[1].inputs) return create_if_block_1$2;
    		return create_else_block$3;
    	}

    	let current_block_type = select_block_type_1(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type === (current_block_type = select_block_type_1(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			}
    		},
    		d: function destroy(detaching) {
    			if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(21:8) {#if typeof $store[magnitudePath] != \\\"undefined\\\"}",
    		ctx
    	});

    	return block;
    }

    // (27:12) {:else}
    function create_else_block$3(ctx) {
    	let p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "Tree does not have inputs";
    			add_location(p, file$5, 27, 12, 974);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$3.name,
    		type: "else",
    		source: "(27:12) {:else}",
    		ctx
    	});

    	return block;
    }

    // (22:12) {#if tree.inputs}
    function create_if_block_1$2(ctx) {
    	let p;
    	let span0;
    	let t0_value = /*$store*/ ctx[8][/*magnitudePath*/ ctx[7]] + "";
    	let t0;
    	let t1;
    	let span1;
    	let t2_value = getLabel(/*$store*/ ctx[8][/*unitPath*/ ctx[6]], /*tree*/ ctx[1].inputs[1]) + "";
    	let t2;

    	const block = {
    		c: function create() {
    			p = element("p");
    			span0 = element("span");
    			t0 = text(t0_value);
    			t1 = space();
    			span1 = element("span");
    			t2 = text(t2_value);
    			attr_dev(span0, "class", /*magnitudeClass*/ ctx[5]);
    			add_location(span0, file$5, 23, 20, 761);
    			attr_dev(span1, "class", /*unitClass*/ ctx[4]);
    			add_location(span1, file$5, 24, 20, 842);
    			add_location(p, file$5, 22, 16, 736);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, span0);
    			append_dev(span0, t0);
    			append_dev(p, t1);
    			append_dev(p, span1);
    			append_dev(span1, t2);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$store, magnitudePath*/ 384 && t0_value !== (t0_value = /*$store*/ ctx[8][/*magnitudePath*/ ctx[7]] + "")) set_data_dev(t0, t0_value);

    			if (dirty & /*magnitudeClass*/ 32) {
    				attr_dev(span0, "class", /*magnitudeClass*/ ctx[5]);
    			}

    			if (dirty & /*$store, unitPath, tree*/ 322 && t2_value !== (t2_value = getLabel(/*$store*/ ctx[8][/*unitPath*/ ctx[6]], /*tree*/ ctx[1].inputs[1]) + "")) set_data_dev(t2, t2_value);

    			if (dirty & /*unitClass*/ 16) {
    				attr_dev(span1, "class", /*unitClass*/ ctx[4]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$2.name,
    		type: "if",
    		source: "(22:12) {#if tree.inputs}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let div;
    	let p;
    	let t0_value = /*tree*/ ctx[1].name + "";
    	let t0;
    	let t1;

    	function select_block_type(ctx, dirty) {
    		if (typeof /*$store*/ ctx[8][/*magnitudePath*/ ctx[7]] != "undefined") return create_if_block$3;
    		return create_else_block_1$1;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			p = element("p");
    			t0 = text(t0_value);
    			t1 = space();
    			if_block.c();
    			attr_dev(p, "class", /*labelClass*/ ctx[3]);
    			add_location(p, file$5, 17, 8, 567);
    			attr_dev(div, "class", /*wrapperClass*/ ctx[2]);
    			add_location(div, file$5, 16, 4, 531);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, p);
    			append_dev(p, t0);
    			append_dev(div, t1);
    			if_block.m(div, null);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*tree*/ 2 && t0_value !== (t0_value = /*tree*/ ctx[1].name + "")) set_data_dev(t0, t0_value);

    			if (dirty & /*labelClass*/ 8) {
    				attr_dev(p, "class", /*labelClass*/ ctx[3]);
    			}

    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(div, null);
    				}
    			}

    			if (dirty & /*wrapperClass*/ 4) {
    				attr_dev(div, "class", /*wrapperClass*/ ctx[2]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let $store,
    		$$unsubscribe_store = noop,
    		$$subscribe_store = () => ($$unsubscribe_store(), $$unsubscribe_store = subscribe(store, $$value => $$invalidate(8, $store = $$value)), store);

    	$$self.$$.on_destroy.push(() => $$unsubscribe_store());
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("QuantityRead", slots, []);
    	
    	let { path } = $$props;
    	let { store } = $$props;
    	validate_store(store, "store");
    	$$subscribe_store();
    	let { tree } = $$props;
    	let { wrapperClass = "field" } = $$props;
    	let { labelClass = "is-6 has-text-grey has-text-weight-semibold" } = $$props;
    	let { unitClass = "" } = $$props;
    	let { magnitudeClass = "subtitle is-5" } = $$props;
    	let unitPath;
    	let magnitudePath;

    	const writable_props = [
    		"path",
    		"store",
    		"tree",
    		"wrapperClass",
    		"labelClass",
    		"unitClass",
    		"magnitudeClass"
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<QuantityRead> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("path" in $$props) $$invalidate(9, path = $$props.path);
    		if ("store" in $$props) $$subscribe_store($$invalidate(0, store = $$props.store));
    		if ("tree" in $$props) $$invalidate(1, tree = $$props.tree);
    		if ("wrapperClass" in $$props) $$invalidate(2, wrapperClass = $$props.wrapperClass);
    		if ("labelClass" in $$props) $$invalidate(3, labelClass = $$props.labelClass);
    		if ("unitClass" in $$props) $$invalidate(4, unitClass = $$props.unitClass);
    		if ("magnitudeClass" in $$props) $$invalidate(5, magnitudeClass = $$props.magnitudeClass);
    	};

    	$$self.$capture_state = () => ({
    		DisplayLabel,
    		getLabel,
    		path,
    		store,
    		tree,
    		wrapperClass,
    		labelClass,
    		unitClass,
    		magnitudeClass,
    		unitPath,
    		magnitudePath,
    		$store
    	});

    	$$self.$inject_state = $$props => {
    		if ("path" in $$props) $$invalidate(9, path = $$props.path);
    		if ("store" in $$props) $$subscribe_store($$invalidate(0, store = $$props.store));
    		if ("tree" in $$props) $$invalidate(1, tree = $$props.tree);
    		if ("wrapperClass" in $$props) $$invalidate(2, wrapperClass = $$props.wrapperClass);
    		if ("labelClass" in $$props) $$invalidate(3, labelClass = $$props.labelClass);
    		if ("unitClass" in $$props) $$invalidate(4, unitClass = $$props.unitClass);
    		if ("magnitudeClass" in $$props) $$invalidate(5, magnitudeClass = $$props.magnitudeClass);
    		if ("unitPath" in $$props) $$invalidate(6, unitPath = $$props.unitPath);
    		if ("magnitudePath" in $$props) $$invalidate(7, magnitudePath = $$props.magnitudePath);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*path*/ 512) {
    			 $$invalidate(6, unitPath = path + "|unit");
    		}

    		if ($$self.$$.dirty & /*path*/ 512) {
    			 $$invalidate(7, magnitudePath = path + "|magnitude");
    		}
    	};

    	return [
    		store,
    		tree,
    		wrapperClass,
    		labelClass,
    		unitClass,
    		magnitudeClass,
    		unitPath,
    		magnitudePath,
    		$store,
    		path
    	];
    }

    class QuantityRead extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {
    			path: 9,
    			store: 0,
    			tree: 1,
    			wrapperClass: 2,
    			labelClass: 3,
    			unitClass: 4,
    			magnitudeClass: 5
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "QuantityRead",
    			options,
    			id: create_fragment$5.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*path*/ ctx[9] === undefined && !("path" in props)) {
    			console.warn("<QuantityRead> was created without expected prop 'path'");
    		}

    		if (/*store*/ ctx[0] === undefined && !("store" in props)) {
    			console.warn("<QuantityRead> was created without expected prop 'store'");
    		}

    		if (/*tree*/ ctx[1] === undefined && !("tree" in props)) {
    			console.warn("<QuantityRead> was created without expected prop 'tree'");
    		}
    	}

    	get path() {
    		throw new Error("<QuantityRead>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set path(value) {
    		throw new Error("<QuantityRead>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get store() {
    		throw new Error("<QuantityRead>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set store(value) {
    		throw new Error("<QuantityRead>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get tree() {
    		throw new Error("<QuantityRead>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set tree(value) {
    		throw new Error("<QuantityRead>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get wrapperClass() {
    		throw new Error("<QuantityRead>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set wrapperClass(value) {
    		throw new Error("<QuantityRead>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get labelClass() {
    		throw new Error("<QuantityRead>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set labelClass(value) {
    		throw new Error("<QuantityRead>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get unitClass() {
    		throw new Error("<QuantityRead>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set unitClass(value) {
    		throw new Error("<QuantityRead>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get magnitudeClass() {
    		throw new Error("<QuantityRead>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set magnitudeClass(value) {
    		throw new Error("<QuantityRead>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    var bind = function bind(fn, thisArg) {
      return function wrap() {
        var args = new Array(arguments.length);
        for (var i = 0; i < args.length; i++) {
          args[i] = arguments[i];
        }
        return fn.apply(thisArg, args);
      };
    };

    /*global toString:true*/

    // utils is a library of generic helper functions non-specific to axios

    var toString = Object.prototype.toString;

    /**
     * Determine if a value is an Array
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is an Array, otherwise false
     */
    function isArray(val) {
      return toString.call(val) === '[object Array]';
    }

    /**
     * Determine if a value is undefined
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if the value is undefined, otherwise false
     */
    function isUndefined(val) {
      return typeof val === 'undefined';
    }

    /**
     * Determine if a value is a Buffer
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a Buffer, otherwise false
     */
    function isBuffer(val) {
      return val !== null && !isUndefined(val) && val.constructor !== null && !isUndefined(val.constructor)
        && typeof val.constructor.isBuffer === 'function' && val.constructor.isBuffer(val);
    }

    /**
     * Determine if a value is an ArrayBuffer
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is an ArrayBuffer, otherwise false
     */
    function isArrayBuffer(val) {
      return toString.call(val) === '[object ArrayBuffer]';
    }

    /**
     * Determine if a value is a FormData
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is an FormData, otherwise false
     */
    function isFormData(val) {
      return (typeof FormData !== 'undefined') && (val instanceof FormData);
    }

    /**
     * Determine if a value is a view on an ArrayBuffer
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a view on an ArrayBuffer, otherwise false
     */
    function isArrayBufferView(val) {
      var result;
      if ((typeof ArrayBuffer !== 'undefined') && (ArrayBuffer.isView)) {
        result = ArrayBuffer.isView(val);
      } else {
        result = (val) && (val.buffer) && (val.buffer instanceof ArrayBuffer);
      }
      return result;
    }

    /**
     * Determine if a value is a String
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a String, otherwise false
     */
    function isString(val) {
      return typeof val === 'string';
    }

    /**
     * Determine if a value is a Number
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a Number, otherwise false
     */
    function isNumber(val) {
      return typeof val === 'number';
    }

    /**
     * Determine if a value is an Object
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is an Object, otherwise false
     */
    function isObject(val) {
      return val !== null && typeof val === 'object';
    }

    /**
     * Determine if a value is a plain Object
     *
     * @param {Object} val The value to test
     * @return {boolean} True if value is a plain Object, otherwise false
     */
    function isPlainObject(val) {
      if (toString.call(val) !== '[object Object]') {
        return false;
      }

      var prototype = Object.getPrototypeOf(val);
      return prototype === null || prototype === Object.prototype;
    }

    /**
     * Determine if a value is a Date
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a Date, otherwise false
     */
    function isDate(val) {
      return toString.call(val) === '[object Date]';
    }

    /**
     * Determine if a value is a File
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a File, otherwise false
     */
    function isFile(val) {
      return toString.call(val) === '[object File]';
    }

    /**
     * Determine if a value is a Blob
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a Blob, otherwise false
     */
    function isBlob(val) {
      return toString.call(val) === '[object Blob]';
    }

    /**
     * Determine if a value is a Function
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a Function, otherwise false
     */
    function isFunction(val) {
      return toString.call(val) === '[object Function]';
    }

    /**
     * Determine if a value is a Stream
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a Stream, otherwise false
     */
    function isStream(val) {
      return isObject(val) && isFunction(val.pipe);
    }

    /**
     * Determine if a value is a URLSearchParams object
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a URLSearchParams object, otherwise false
     */
    function isURLSearchParams(val) {
      return typeof URLSearchParams !== 'undefined' && val instanceof URLSearchParams;
    }

    /**
     * Trim excess whitespace off the beginning and end of a string
     *
     * @param {String} str The String to trim
     * @returns {String} The String freed of excess whitespace
     */
    function trim(str) {
      return str.replace(/^\s*/, '').replace(/\s*$/, '');
    }

    /**
     * Determine if we're running in a standard browser environment
     *
     * This allows axios to run in a web worker, and react-native.
     * Both environments support XMLHttpRequest, but not fully standard globals.
     *
     * web workers:
     *  typeof window -> undefined
     *  typeof document -> undefined
     *
     * react-native:
     *  navigator.product -> 'ReactNative'
     * nativescript
     *  navigator.product -> 'NativeScript' or 'NS'
     */
    function isStandardBrowserEnv() {
      if (typeof navigator !== 'undefined' && (navigator.product === 'ReactNative' ||
                                               navigator.product === 'NativeScript' ||
                                               navigator.product === 'NS')) {
        return false;
      }
      return (
        typeof window !== 'undefined' &&
        typeof document !== 'undefined'
      );
    }

    /**
     * Iterate over an Array or an Object invoking a function for each item.
     *
     * If `obj` is an Array callback will be called passing
     * the value, index, and complete array for each item.
     *
     * If 'obj' is an Object callback will be called passing
     * the value, key, and complete object for each property.
     *
     * @param {Object|Array} obj The object to iterate
     * @param {Function} fn The callback to invoke for each item
     */
    function forEach(obj, fn) {
      // Don't bother if no value provided
      if (obj === null || typeof obj === 'undefined') {
        return;
      }

      // Force an array if not already something iterable
      if (typeof obj !== 'object') {
        /*eslint no-param-reassign:0*/
        obj = [obj];
      }

      if (isArray(obj)) {
        // Iterate over array values
        for (var i = 0, l = obj.length; i < l; i++) {
          fn.call(null, obj[i], i, obj);
        }
      } else {
        // Iterate over object keys
        for (var key in obj) {
          if (Object.prototype.hasOwnProperty.call(obj, key)) {
            fn.call(null, obj[key], key, obj);
          }
        }
      }
    }

    /**
     * Accepts varargs expecting each argument to be an object, then
     * immutably merges the properties of each object and returns result.
     *
     * When multiple objects contain the same key the later object in
     * the arguments list will take precedence.
     *
     * Example:
     *
     * ```js
     * var result = merge({foo: 123}, {foo: 456});
     * console.log(result.foo); // outputs 456
     * ```
     *
     * @param {Object} obj1 Object to merge
     * @returns {Object} Result of all merge properties
     */
    function merge(/* obj1, obj2, obj3, ... */) {
      var result = {};
      function assignValue(val, key) {
        if (isPlainObject(result[key]) && isPlainObject(val)) {
          result[key] = merge(result[key], val);
        } else if (isPlainObject(val)) {
          result[key] = merge({}, val);
        } else if (isArray(val)) {
          result[key] = val.slice();
        } else {
          result[key] = val;
        }
      }

      for (var i = 0, l = arguments.length; i < l; i++) {
        forEach(arguments[i], assignValue);
      }
      return result;
    }

    /**
     * Extends object a by mutably adding to it the properties of object b.
     *
     * @param {Object} a The object to be extended
     * @param {Object} b The object to copy properties from
     * @param {Object} thisArg The object to bind function to
     * @return {Object} The resulting value of object a
     */
    function extend(a, b, thisArg) {
      forEach(b, function assignValue(val, key) {
        if (thisArg && typeof val === 'function') {
          a[key] = bind(val, thisArg);
        } else {
          a[key] = val;
        }
      });
      return a;
    }

    /**
     * Remove byte order marker. This catches EF BB BF (the UTF-8 BOM)
     *
     * @param {string} content with BOM
     * @return {string} content value without BOM
     */
    function stripBOM(content) {
      if (content.charCodeAt(0) === 0xFEFF) {
        content = content.slice(1);
      }
      return content;
    }

    var utils = {
      isArray: isArray,
      isArrayBuffer: isArrayBuffer,
      isBuffer: isBuffer,
      isFormData: isFormData,
      isArrayBufferView: isArrayBufferView,
      isString: isString,
      isNumber: isNumber,
      isObject: isObject,
      isPlainObject: isPlainObject,
      isUndefined: isUndefined,
      isDate: isDate,
      isFile: isFile,
      isBlob: isBlob,
      isFunction: isFunction,
      isStream: isStream,
      isURLSearchParams: isURLSearchParams,
      isStandardBrowserEnv: isStandardBrowserEnv,
      forEach: forEach,
      merge: merge,
      extend: extend,
      trim: trim,
      stripBOM: stripBOM
    };

    function encode(val) {
      return encodeURIComponent(val).
        replace(/%3A/gi, ':').
        replace(/%24/g, '$').
        replace(/%2C/gi, ',').
        replace(/%20/g, '+').
        replace(/%5B/gi, '[').
        replace(/%5D/gi, ']');
    }

    /**
     * Build a URL by appending params to the end
     *
     * @param {string} url The base of the url (e.g., http://www.google.com)
     * @param {object} [params] The params to be appended
     * @returns {string} The formatted url
     */
    var buildURL = function buildURL(url, params, paramsSerializer) {
      /*eslint no-param-reassign:0*/
      if (!params) {
        return url;
      }

      var serializedParams;
      if (paramsSerializer) {
        serializedParams = paramsSerializer(params);
      } else if (utils.isURLSearchParams(params)) {
        serializedParams = params.toString();
      } else {
        var parts = [];

        utils.forEach(params, function serialize(val, key) {
          if (val === null || typeof val === 'undefined') {
            return;
          }

          if (utils.isArray(val)) {
            key = key + '[]';
          } else {
            val = [val];
          }

          utils.forEach(val, function parseValue(v) {
            if (utils.isDate(v)) {
              v = v.toISOString();
            } else if (utils.isObject(v)) {
              v = JSON.stringify(v);
            }
            parts.push(encode(key) + '=' + encode(v));
          });
        });

        serializedParams = parts.join('&');
      }

      if (serializedParams) {
        var hashmarkIndex = url.indexOf('#');
        if (hashmarkIndex !== -1) {
          url = url.slice(0, hashmarkIndex);
        }

        url += (url.indexOf('?') === -1 ? '?' : '&') + serializedParams;
      }

      return url;
    };

    function InterceptorManager() {
      this.handlers = [];
    }

    /**
     * Add a new interceptor to the stack
     *
     * @param {Function} fulfilled The function to handle `then` for a `Promise`
     * @param {Function} rejected The function to handle `reject` for a `Promise`
     *
     * @return {Number} An ID used to remove interceptor later
     */
    InterceptorManager.prototype.use = function use(fulfilled, rejected) {
      this.handlers.push({
        fulfilled: fulfilled,
        rejected: rejected
      });
      return this.handlers.length - 1;
    };

    /**
     * Remove an interceptor from the stack
     *
     * @param {Number} id The ID that was returned by `use`
     */
    InterceptorManager.prototype.eject = function eject(id) {
      if (this.handlers[id]) {
        this.handlers[id] = null;
      }
    };

    /**
     * Iterate over all the registered interceptors
     *
     * This method is particularly useful for skipping over any
     * interceptors that may have become `null` calling `eject`.
     *
     * @param {Function} fn The function to call for each interceptor
     */
    InterceptorManager.prototype.forEach = function forEach(fn) {
      utils.forEach(this.handlers, function forEachHandler(h) {
        if (h !== null) {
          fn(h);
        }
      });
    };

    var InterceptorManager_1 = InterceptorManager;

    /**
     * Transform the data for a request or a response
     *
     * @param {Object|String} data The data to be transformed
     * @param {Array} headers The headers for the request or response
     * @param {Array|Function} fns A single function or Array of functions
     * @returns {*} The resulting transformed data
     */
    var transformData = function transformData(data, headers, fns) {
      /*eslint no-param-reassign:0*/
      utils.forEach(fns, function transform(fn) {
        data = fn(data, headers);
      });

      return data;
    };

    var isCancel = function isCancel(value) {
      return !!(value && value.__CANCEL__);
    };

    var normalizeHeaderName = function normalizeHeaderName(headers, normalizedName) {
      utils.forEach(headers, function processHeader(value, name) {
        if (name !== normalizedName && name.toUpperCase() === normalizedName.toUpperCase()) {
          headers[normalizedName] = value;
          delete headers[name];
        }
      });
    };

    /**
     * Update an Error with the specified config, error code, and response.
     *
     * @param {Error} error The error to update.
     * @param {Object} config The config.
     * @param {string} [code] The error code (for example, 'ECONNABORTED').
     * @param {Object} [request] The request.
     * @param {Object} [response] The response.
     * @returns {Error} The error.
     */
    var enhanceError = function enhanceError(error, config, code, request, response) {
      error.config = config;
      if (code) {
        error.code = code;
      }

      error.request = request;
      error.response = response;
      error.isAxiosError = true;

      error.toJSON = function toJSON() {
        return {
          // Standard
          message: this.message,
          name: this.name,
          // Microsoft
          description: this.description,
          number: this.number,
          // Mozilla
          fileName: this.fileName,
          lineNumber: this.lineNumber,
          columnNumber: this.columnNumber,
          stack: this.stack,
          // Axios
          config: this.config,
          code: this.code
        };
      };
      return error;
    };

    /**
     * Create an Error with the specified message, config, error code, request and response.
     *
     * @param {string} message The error message.
     * @param {Object} config The config.
     * @param {string} [code] The error code (for example, 'ECONNABORTED').
     * @param {Object} [request] The request.
     * @param {Object} [response] The response.
     * @returns {Error} The created error.
     */
    var createError = function createError(message, config, code, request, response) {
      var error = new Error(message);
      return enhanceError(error, config, code, request, response);
    };

    /**
     * Resolve or reject a Promise based on response status.
     *
     * @param {Function} resolve A function that resolves the promise.
     * @param {Function} reject A function that rejects the promise.
     * @param {object} response The response.
     */
    var settle = function settle(resolve, reject, response) {
      var validateStatus = response.config.validateStatus;
      if (!response.status || !validateStatus || validateStatus(response.status)) {
        resolve(response);
      } else {
        reject(createError(
          'Request failed with status code ' + response.status,
          response.config,
          null,
          response.request,
          response
        ));
      }
    };

    var cookies = (
      utils.isStandardBrowserEnv() ?

      // Standard browser envs support document.cookie
        (function standardBrowserEnv() {
          return {
            write: function write(name, value, expires, path, domain, secure) {
              var cookie = [];
              cookie.push(name + '=' + encodeURIComponent(value));

              if (utils.isNumber(expires)) {
                cookie.push('expires=' + new Date(expires).toGMTString());
              }

              if (utils.isString(path)) {
                cookie.push('path=' + path);
              }

              if (utils.isString(domain)) {
                cookie.push('domain=' + domain);
              }

              if (secure === true) {
                cookie.push('secure');
              }

              document.cookie = cookie.join('; ');
            },

            read: function read(name) {
              var match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
              return (match ? decodeURIComponent(match[3]) : null);
            },

            remove: function remove(name) {
              this.write(name, '', Date.now() - 86400000);
            }
          };
        })() :

      // Non standard browser env (web workers, react-native) lack needed support.
        (function nonStandardBrowserEnv() {
          return {
            write: function write() {},
            read: function read() { return null; },
            remove: function remove() {}
          };
        })()
    );

    /**
     * Determines whether the specified URL is absolute
     *
     * @param {string} url The URL to test
     * @returns {boolean} True if the specified URL is absolute, otherwise false
     */
    var isAbsoluteURL = function isAbsoluteURL(url) {
      // A URL is considered absolute if it begins with "<scheme>://" or "//" (protocol-relative URL).
      // RFC 3986 defines scheme name as a sequence of characters beginning with a letter and followed
      // by any combination of letters, digits, plus, period, or hyphen.
      return /^([a-z][a-z\d\+\-\.]*:)?\/\//i.test(url);
    };

    /**
     * Creates a new URL by combining the specified URLs
     *
     * @param {string} baseURL The base URL
     * @param {string} relativeURL The relative URL
     * @returns {string} The combined URL
     */
    var combineURLs = function combineURLs(baseURL, relativeURL) {
      return relativeURL
        ? baseURL.replace(/\/+$/, '') + '/' + relativeURL.replace(/^\/+/, '')
        : baseURL;
    };

    /**
     * Creates a new URL by combining the baseURL with the requestedURL,
     * only when the requestedURL is not already an absolute URL.
     * If the requestURL is absolute, this function returns the requestedURL untouched.
     *
     * @param {string} baseURL The base URL
     * @param {string} requestedURL Absolute or relative URL to combine
     * @returns {string} The combined full path
     */
    var buildFullPath = function buildFullPath(baseURL, requestedURL) {
      if (baseURL && !isAbsoluteURL(requestedURL)) {
        return combineURLs(baseURL, requestedURL);
      }
      return requestedURL;
    };

    // Headers whose duplicates are ignored by node
    // c.f. https://nodejs.org/api/http.html#http_message_headers
    var ignoreDuplicateOf = [
      'age', 'authorization', 'content-length', 'content-type', 'etag',
      'expires', 'from', 'host', 'if-modified-since', 'if-unmodified-since',
      'last-modified', 'location', 'max-forwards', 'proxy-authorization',
      'referer', 'retry-after', 'user-agent'
    ];

    /**
     * Parse headers into an object
     *
     * ```
     * Date: Wed, 27 Aug 2014 08:58:49 GMT
     * Content-Type: application/json
     * Connection: keep-alive
     * Transfer-Encoding: chunked
     * ```
     *
     * @param {String} headers Headers needing to be parsed
     * @returns {Object} Headers parsed into an object
     */
    var parseHeaders = function parseHeaders(headers) {
      var parsed = {};
      var key;
      var val;
      var i;

      if (!headers) { return parsed; }

      utils.forEach(headers.split('\n'), function parser(line) {
        i = line.indexOf(':');
        key = utils.trim(line.substr(0, i)).toLowerCase();
        val = utils.trim(line.substr(i + 1));

        if (key) {
          if (parsed[key] && ignoreDuplicateOf.indexOf(key) >= 0) {
            return;
          }
          if (key === 'set-cookie') {
            parsed[key] = (parsed[key] ? parsed[key] : []).concat([val]);
          } else {
            parsed[key] = parsed[key] ? parsed[key] + ', ' + val : val;
          }
        }
      });

      return parsed;
    };

    var isURLSameOrigin = (
      utils.isStandardBrowserEnv() ?

      // Standard browser envs have full support of the APIs needed to test
      // whether the request URL is of the same origin as current location.
        (function standardBrowserEnv() {
          var msie = /(msie|trident)/i.test(navigator.userAgent);
          var urlParsingNode = document.createElement('a');
          var originURL;

          /**
        * Parse a URL to discover it's components
        *
        * @param {String} url The URL to be parsed
        * @returns {Object}
        */
          function resolveURL(url) {
            var href = url;

            if (msie) {
            // IE needs attribute set twice to normalize properties
              urlParsingNode.setAttribute('href', href);
              href = urlParsingNode.href;
            }

            urlParsingNode.setAttribute('href', href);

            // urlParsingNode provides the UrlUtils interface - http://url.spec.whatwg.org/#urlutils
            return {
              href: urlParsingNode.href,
              protocol: urlParsingNode.protocol ? urlParsingNode.protocol.replace(/:$/, '') : '',
              host: urlParsingNode.host,
              search: urlParsingNode.search ? urlParsingNode.search.replace(/^\?/, '') : '',
              hash: urlParsingNode.hash ? urlParsingNode.hash.replace(/^#/, '') : '',
              hostname: urlParsingNode.hostname,
              port: urlParsingNode.port,
              pathname: (urlParsingNode.pathname.charAt(0) === '/') ?
                urlParsingNode.pathname :
                '/' + urlParsingNode.pathname
            };
          }

          originURL = resolveURL(window.location.href);

          /**
        * Determine if a URL shares the same origin as the current location
        *
        * @param {String} requestURL The URL to test
        * @returns {boolean} True if URL shares the same origin, otherwise false
        */
          return function isURLSameOrigin(requestURL) {
            var parsed = (utils.isString(requestURL)) ? resolveURL(requestURL) : requestURL;
            return (parsed.protocol === originURL.protocol &&
                parsed.host === originURL.host);
          };
        })() :

      // Non standard browser envs (web workers, react-native) lack needed support.
        (function nonStandardBrowserEnv() {
          return function isURLSameOrigin() {
            return true;
          };
        })()
    );

    var xhr = function xhrAdapter(config) {
      return new Promise(function dispatchXhrRequest(resolve, reject) {
        var requestData = config.data;
        var requestHeaders = config.headers;

        if (utils.isFormData(requestData)) {
          delete requestHeaders['Content-Type']; // Let the browser set it
        }

        var request = new XMLHttpRequest();

        // HTTP basic authentication
        if (config.auth) {
          var username = config.auth.username || '';
          var password = config.auth.password ? unescape(encodeURIComponent(config.auth.password)) : '';
          requestHeaders.Authorization = 'Basic ' + btoa(username + ':' + password);
        }

        var fullPath = buildFullPath(config.baseURL, config.url);
        request.open(config.method.toUpperCase(), buildURL(fullPath, config.params, config.paramsSerializer), true);

        // Set the request timeout in MS
        request.timeout = config.timeout;

        // Listen for ready state
        request.onreadystatechange = function handleLoad() {
          if (!request || request.readyState !== 4) {
            return;
          }

          // The request errored out and we didn't get a response, this will be
          // handled by onerror instead
          // With one exception: request that using file: protocol, most browsers
          // will return status as 0 even though it's a successful request
          if (request.status === 0 && !(request.responseURL && request.responseURL.indexOf('file:') === 0)) {
            return;
          }

          // Prepare the response
          var responseHeaders = 'getAllResponseHeaders' in request ? parseHeaders(request.getAllResponseHeaders()) : null;
          var responseData = !config.responseType || config.responseType === 'text' ? request.responseText : request.response;
          var response = {
            data: responseData,
            status: request.status,
            statusText: request.statusText,
            headers: responseHeaders,
            config: config,
            request: request
          };

          settle(resolve, reject, response);

          // Clean up request
          request = null;
        };

        // Handle browser request cancellation (as opposed to a manual cancellation)
        request.onabort = function handleAbort() {
          if (!request) {
            return;
          }

          reject(createError('Request aborted', config, 'ECONNABORTED', request));

          // Clean up request
          request = null;
        };

        // Handle low level network errors
        request.onerror = function handleError() {
          // Real errors are hidden from us by the browser
          // onerror should only fire if it's a network error
          reject(createError('Network Error', config, null, request));

          // Clean up request
          request = null;
        };

        // Handle timeout
        request.ontimeout = function handleTimeout() {
          var timeoutErrorMessage = 'timeout of ' + config.timeout + 'ms exceeded';
          if (config.timeoutErrorMessage) {
            timeoutErrorMessage = config.timeoutErrorMessage;
          }
          reject(createError(timeoutErrorMessage, config, 'ECONNABORTED',
            request));

          // Clean up request
          request = null;
        };

        // Add xsrf header
        // This is only done if running in a standard browser environment.
        // Specifically not if we're in a web worker, or react-native.
        if (utils.isStandardBrowserEnv()) {
          // Add xsrf header
          var xsrfValue = (config.withCredentials || isURLSameOrigin(fullPath)) && config.xsrfCookieName ?
            cookies.read(config.xsrfCookieName) :
            undefined;

          if (xsrfValue) {
            requestHeaders[config.xsrfHeaderName] = xsrfValue;
          }
        }

        // Add headers to the request
        if ('setRequestHeader' in request) {
          utils.forEach(requestHeaders, function setRequestHeader(val, key) {
            if (typeof requestData === 'undefined' && key.toLowerCase() === 'content-type') {
              // Remove Content-Type if data is undefined
              delete requestHeaders[key];
            } else {
              // Otherwise add header to the request
              request.setRequestHeader(key, val);
            }
          });
        }

        // Add withCredentials to request if needed
        if (!utils.isUndefined(config.withCredentials)) {
          request.withCredentials = !!config.withCredentials;
        }

        // Add responseType to request if needed
        if (config.responseType) {
          try {
            request.responseType = config.responseType;
          } catch (e) {
            // Expected DOMException thrown by browsers not compatible XMLHttpRequest Level 2.
            // But, this can be suppressed for 'json' type as it can be parsed by default 'transformResponse' function.
            if (config.responseType !== 'json') {
              throw e;
            }
          }
        }

        // Handle progress if needed
        if (typeof config.onDownloadProgress === 'function') {
          request.addEventListener('progress', config.onDownloadProgress);
        }

        // Not all browsers support upload events
        if (typeof config.onUploadProgress === 'function' && request.upload) {
          request.upload.addEventListener('progress', config.onUploadProgress);
        }

        if (config.cancelToken) {
          // Handle cancellation
          config.cancelToken.promise.then(function onCanceled(cancel) {
            if (!request) {
              return;
            }

            request.abort();
            reject(cancel);
            // Clean up request
            request = null;
          });
        }

        if (!requestData) {
          requestData = null;
        }

        // Send the request
        request.send(requestData);
      });
    };

    var DEFAULT_CONTENT_TYPE = {
      'Content-Type': 'application/x-www-form-urlencoded'
    };

    function setContentTypeIfUnset(headers, value) {
      if (!utils.isUndefined(headers) && utils.isUndefined(headers['Content-Type'])) {
        headers['Content-Type'] = value;
      }
    }

    function getDefaultAdapter() {
      var adapter;
      if (typeof XMLHttpRequest !== 'undefined') {
        // For browsers use XHR adapter
        adapter = xhr;
      } else if (typeof process !== 'undefined' && Object.prototype.toString.call(process) === '[object process]') {
        // For node use HTTP adapter
        adapter = xhr;
      }
      return adapter;
    }

    var defaults = {
      adapter: getDefaultAdapter(),

      transformRequest: [function transformRequest(data, headers) {
        normalizeHeaderName(headers, 'Accept');
        normalizeHeaderName(headers, 'Content-Type');
        if (utils.isFormData(data) ||
          utils.isArrayBuffer(data) ||
          utils.isBuffer(data) ||
          utils.isStream(data) ||
          utils.isFile(data) ||
          utils.isBlob(data)
        ) {
          return data;
        }
        if (utils.isArrayBufferView(data)) {
          return data.buffer;
        }
        if (utils.isURLSearchParams(data)) {
          setContentTypeIfUnset(headers, 'application/x-www-form-urlencoded;charset=utf-8');
          return data.toString();
        }
        if (utils.isObject(data)) {
          setContentTypeIfUnset(headers, 'application/json;charset=utf-8');
          return JSON.stringify(data);
        }
        return data;
      }],

      transformResponse: [function transformResponse(data) {
        /*eslint no-param-reassign:0*/
        if (typeof data === 'string') {
          try {
            data = JSON.parse(data);
          } catch (e) { /* Ignore */ }
        }
        return data;
      }],

      /**
       * A timeout in milliseconds to abort a request. If set to 0 (default) a
       * timeout is not created.
       */
      timeout: 0,

      xsrfCookieName: 'XSRF-TOKEN',
      xsrfHeaderName: 'X-XSRF-TOKEN',

      maxContentLength: -1,
      maxBodyLength: -1,

      validateStatus: function validateStatus(status) {
        return status >= 200 && status < 300;
      }
    };

    defaults.headers = {
      common: {
        'Accept': 'application/json, text/plain, */*'
      }
    };

    utils.forEach(['delete', 'get', 'head'], function forEachMethodNoData(method) {
      defaults.headers[method] = {};
    });

    utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
      defaults.headers[method] = utils.merge(DEFAULT_CONTENT_TYPE);
    });

    var defaults_1 = defaults;

    /**
     * Throws a `Cancel` if cancellation has been requested.
     */
    function throwIfCancellationRequested(config) {
      if (config.cancelToken) {
        config.cancelToken.throwIfRequested();
      }
    }

    /**
     * Dispatch a request to the server using the configured adapter.
     *
     * @param {object} config The config that is to be used for the request
     * @returns {Promise} The Promise to be fulfilled
     */
    var dispatchRequest = function dispatchRequest(config) {
      throwIfCancellationRequested(config);

      // Ensure headers exist
      config.headers = config.headers || {};

      // Transform request data
      config.data = transformData(
        config.data,
        config.headers,
        config.transformRequest
      );

      // Flatten headers
      config.headers = utils.merge(
        config.headers.common || {},
        config.headers[config.method] || {},
        config.headers
      );

      utils.forEach(
        ['delete', 'get', 'head', 'post', 'put', 'patch', 'common'],
        function cleanHeaderConfig(method) {
          delete config.headers[method];
        }
      );

      var adapter = config.adapter || defaults_1.adapter;

      return adapter(config).then(function onAdapterResolution(response) {
        throwIfCancellationRequested(config);

        // Transform response data
        response.data = transformData(
          response.data,
          response.headers,
          config.transformResponse
        );

        return response;
      }, function onAdapterRejection(reason) {
        if (!isCancel(reason)) {
          throwIfCancellationRequested(config);

          // Transform response data
          if (reason && reason.response) {
            reason.response.data = transformData(
              reason.response.data,
              reason.response.headers,
              config.transformResponse
            );
          }
        }

        return Promise.reject(reason);
      });
    };

    /**
     * Config-specific merge-function which creates a new config-object
     * by merging two configuration objects together.
     *
     * @param {Object} config1
     * @param {Object} config2
     * @returns {Object} New object resulting from merging config2 to config1
     */
    var mergeConfig = function mergeConfig(config1, config2) {
      // eslint-disable-next-line no-param-reassign
      config2 = config2 || {};
      var config = {};

      var valueFromConfig2Keys = ['url', 'method', 'data'];
      var mergeDeepPropertiesKeys = ['headers', 'auth', 'proxy', 'params'];
      var defaultToConfig2Keys = [
        'baseURL', 'transformRequest', 'transformResponse', 'paramsSerializer',
        'timeout', 'timeoutMessage', 'withCredentials', 'adapter', 'responseType', 'xsrfCookieName',
        'xsrfHeaderName', 'onUploadProgress', 'onDownloadProgress', 'decompress',
        'maxContentLength', 'maxBodyLength', 'maxRedirects', 'transport', 'httpAgent',
        'httpsAgent', 'cancelToken', 'socketPath', 'responseEncoding'
      ];
      var directMergeKeys = ['validateStatus'];

      function getMergedValue(target, source) {
        if (utils.isPlainObject(target) && utils.isPlainObject(source)) {
          return utils.merge(target, source);
        } else if (utils.isPlainObject(source)) {
          return utils.merge({}, source);
        } else if (utils.isArray(source)) {
          return source.slice();
        }
        return source;
      }

      function mergeDeepProperties(prop) {
        if (!utils.isUndefined(config2[prop])) {
          config[prop] = getMergedValue(config1[prop], config2[prop]);
        } else if (!utils.isUndefined(config1[prop])) {
          config[prop] = getMergedValue(undefined, config1[prop]);
        }
      }

      utils.forEach(valueFromConfig2Keys, function valueFromConfig2(prop) {
        if (!utils.isUndefined(config2[prop])) {
          config[prop] = getMergedValue(undefined, config2[prop]);
        }
      });

      utils.forEach(mergeDeepPropertiesKeys, mergeDeepProperties);

      utils.forEach(defaultToConfig2Keys, function defaultToConfig2(prop) {
        if (!utils.isUndefined(config2[prop])) {
          config[prop] = getMergedValue(undefined, config2[prop]);
        } else if (!utils.isUndefined(config1[prop])) {
          config[prop] = getMergedValue(undefined, config1[prop]);
        }
      });

      utils.forEach(directMergeKeys, function merge(prop) {
        if (prop in config2) {
          config[prop] = getMergedValue(config1[prop], config2[prop]);
        } else if (prop in config1) {
          config[prop] = getMergedValue(undefined, config1[prop]);
        }
      });

      var axiosKeys = valueFromConfig2Keys
        .concat(mergeDeepPropertiesKeys)
        .concat(defaultToConfig2Keys)
        .concat(directMergeKeys);

      var otherKeys = Object
        .keys(config1)
        .concat(Object.keys(config2))
        .filter(function filterAxiosKeys(key) {
          return axiosKeys.indexOf(key) === -1;
        });

      utils.forEach(otherKeys, mergeDeepProperties);

      return config;
    };

    /**
     * Create a new instance of Axios
     *
     * @param {Object} instanceConfig The default config for the instance
     */
    function Axios(instanceConfig) {
      this.defaults = instanceConfig;
      this.interceptors = {
        request: new InterceptorManager_1(),
        response: new InterceptorManager_1()
      };
    }

    /**
     * Dispatch a request
     *
     * @param {Object} config The config specific for this request (merged with this.defaults)
     */
    Axios.prototype.request = function request(config) {
      /*eslint no-param-reassign:0*/
      // Allow for axios('example/url'[, config]) a la fetch API
      if (typeof config === 'string') {
        config = arguments[1] || {};
        config.url = arguments[0];
      } else {
        config = config || {};
      }

      config = mergeConfig(this.defaults, config);

      // Set config.method
      if (config.method) {
        config.method = config.method.toLowerCase();
      } else if (this.defaults.method) {
        config.method = this.defaults.method.toLowerCase();
      } else {
        config.method = 'get';
      }

      // Hook up interceptors middleware
      var chain = [dispatchRequest, undefined];
      var promise = Promise.resolve(config);

      this.interceptors.request.forEach(function unshiftRequestInterceptors(interceptor) {
        chain.unshift(interceptor.fulfilled, interceptor.rejected);
      });

      this.interceptors.response.forEach(function pushResponseInterceptors(interceptor) {
        chain.push(interceptor.fulfilled, interceptor.rejected);
      });

      while (chain.length) {
        promise = promise.then(chain.shift(), chain.shift());
      }

      return promise;
    };

    Axios.prototype.getUri = function getUri(config) {
      config = mergeConfig(this.defaults, config);
      return buildURL(config.url, config.params, config.paramsSerializer).replace(/^\?/, '');
    };

    // Provide aliases for supported request methods
    utils.forEach(['delete', 'get', 'head', 'options'], function forEachMethodNoData(method) {
      /*eslint func-names:0*/
      Axios.prototype[method] = function(url, config) {
        return this.request(mergeConfig(config || {}, {
          method: method,
          url: url,
          data: (config || {}).data
        }));
      };
    });

    utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
      /*eslint func-names:0*/
      Axios.prototype[method] = function(url, data, config) {
        return this.request(mergeConfig(config || {}, {
          method: method,
          url: url,
          data: data
        }));
      };
    });

    var Axios_1 = Axios;

    /**
     * A `Cancel` is an object that is thrown when an operation is canceled.
     *
     * @class
     * @param {string=} message The message.
     */
    function Cancel(message) {
      this.message = message;
    }

    Cancel.prototype.toString = function toString() {
      return 'Cancel' + (this.message ? ': ' + this.message : '');
    };

    Cancel.prototype.__CANCEL__ = true;

    var Cancel_1 = Cancel;

    /**
     * A `CancelToken` is an object that can be used to request cancellation of an operation.
     *
     * @class
     * @param {Function} executor The executor function.
     */
    function CancelToken(executor) {
      if (typeof executor !== 'function') {
        throw new TypeError('executor must be a function.');
      }

      var resolvePromise;
      this.promise = new Promise(function promiseExecutor(resolve) {
        resolvePromise = resolve;
      });

      var token = this;
      executor(function cancel(message) {
        if (token.reason) {
          // Cancellation has already been requested
          return;
        }

        token.reason = new Cancel_1(message);
        resolvePromise(token.reason);
      });
    }

    /**
     * Throws a `Cancel` if cancellation has been requested.
     */
    CancelToken.prototype.throwIfRequested = function throwIfRequested() {
      if (this.reason) {
        throw this.reason;
      }
    };

    /**
     * Returns an object that contains a new `CancelToken` and a function that, when called,
     * cancels the `CancelToken`.
     */
    CancelToken.source = function source() {
      var cancel;
      var token = new CancelToken(function executor(c) {
        cancel = c;
      });
      return {
        token: token,
        cancel: cancel
      };
    };

    var CancelToken_1 = CancelToken;

    /**
     * Syntactic sugar for invoking a function and expanding an array for arguments.
     *
     * Common use case would be to use `Function.prototype.apply`.
     *
     *  ```js
     *  function f(x, y, z) {}
     *  var args = [1, 2, 3];
     *  f.apply(null, args);
     *  ```
     *
     * With `spread` this example can be re-written.
     *
     *  ```js
     *  spread(function(x, y, z) {})([1, 2, 3]);
     *  ```
     *
     * @param {Function} callback
     * @returns {Function}
     */
    var spread = function spread(callback) {
      return function wrap(arr) {
        return callback.apply(null, arr);
      };
    };

    /**
     * Determines whether the payload is an error thrown by Axios
     *
     * @param {*} payload The value to test
     * @returns {boolean} True if the payload is an error thrown by Axios, otherwise false
     */
    var isAxiosError = function isAxiosError(payload) {
      return (typeof payload === 'object') && (payload.isAxiosError === true);
    };

    /**
     * Create an instance of Axios
     *
     * @param {Object} defaultConfig The default config for the instance
     * @return {Axios} A new instance of Axios
     */
    function createInstance(defaultConfig) {
      var context = new Axios_1(defaultConfig);
      var instance = bind(Axios_1.prototype.request, context);

      // Copy axios.prototype to instance
      utils.extend(instance, Axios_1.prototype, context);

      // Copy context to instance
      utils.extend(instance, context);

      return instance;
    }

    // Create the default instance to be exported
    var axios = createInstance(defaults_1);

    // Expose Axios class to allow class inheritance
    axios.Axios = Axios_1;

    // Factory for creating new instances
    axios.create = function create(instanceConfig) {
      return createInstance(mergeConfig(axios.defaults, instanceConfig));
    };

    // Expose Cancel & CancelToken
    axios.Cancel = Cancel_1;
    axios.CancelToken = CancelToken_1;
    axios.isCancel = isCancel;

    // Expose all/spread
    axios.all = function all(promises) {
      return Promise.all(promises);
    };
    axios.spread = spread;

    // Expose isAxiosError
    axios.isAxiosError = isAxiosError;

    var axios_1 = axios;

    // Allow use of default import syntax in TypeScript
    var _default = axios;
    axios_1.default = _default;

    var axios$1 = axios_1;

    const hermesSearch = async (term, constraint, terminologyUrl) => {
        if (!term) {
            return [];
        }
        if (!(constraint && terminologyUrl)) {
            throw new Error("constraint or terminologyUrl not set");
        }
        const response = await axios$1.get(`${terminologyUrl}/v1/snomed/search`, {
            params: {
                s: term,
                constraint,
                maxHits: 15
            },
            headers: {
                "Accept": "application/json"
            }
        });
        if (response.status != 200) {
            return [];
        }
        console.log(response);
        const resultFormatted = response.data.map((result) => ({
            code: result.conceptId.toString(),
            value: result.preferredTerm,
            display: result.term
        }));
        return resultFormatted;
    };

    /* src\rm\CodedText\DropDown.svelte generated by Svelte v3.29.4 */

    const { Object: Object_1$2, console: console_1$1 } = globals;
    const file$6 = "src\\rm\\CodedText\\DropDown.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[16] = list[i];
    	return child_ctx;
    }

    // (57:4) {#if displayTitle}
    function create_if_block_2(ctx) {
    	let label;
    	let t_value = /*tree*/ ctx[2].name + "";
    	let t;

    	const block = {
    		c: function create() {
    			label = element("label");
    			t = text(t_value);
    			attr_dev(label, "for", /*path*/ ctx[0]);
    			attr_dev(label, "class", /*labelClass*/ ctx[4]);
    			add_location(label, file$6, 57, 8, 2202);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, label, anchor);
    			append_dev(label, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*tree*/ 4 && t_value !== (t_value = /*tree*/ ctx[2].name + "")) set_data_dev(t, t_value);

    			if (dirty & /*path*/ 1) {
    				attr_dev(label, "for", /*path*/ ctx[0]);
    			}

    			if (dirty & /*labelClass*/ 16) {
    				attr_dev(label, "class", /*labelClass*/ ctx[4]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(label);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(57:4) {#if displayTitle}",
    		ctx
    	});

    	return block;
    }

    // (75:4) {:else}
    function create_else_block$4(ctx) {
    	let p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "Tree does not have inputs/inputs does not have list";
    			add_location(p, file$6, 75, 8, 2895);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$4.name,
    		type: "else",
    		source: "(75:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (73:29) 
    function create_if_block_1$3(ctx) {
    	let p;
    	let t;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t = text(/*valueStoreValue*/ ctx[11]);
    			attr_dev(p, "class", /*defaultValueClass*/ ctx[7]);
    			add_location(p, file$6, 73, 8, 2824);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*valueStoreValue*/ 2048) set_data_dev(t, /*valueStoreValue*/ ctx[11]);

    			if (dirty & /*defaultValueClass*/ 128) {
    				attr_dev(p, "class", /*defaultValueClass*/ ctx[7]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$3.name,
    		type: "if",
    		source: "(73:29) ",
    		ctx
    	});

    	return block;
    }

    // (60:4) {#if tree.inputs && tree.inputs[0].list}
    function create_if_block$4(ctx) {
    	let div;
    	let select;
    	let option;
    	let t;
    	let select_disabled_value;
    	let mounted;
    	let dispose;
    	let each_value = /*tree*/ ctx[2].inputs[0].list;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			select = element("select");
    			option = element("option");
    			t = text("Select an option");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			option.__value = undefined;
    			option.value = option.__value;
    			option.selected = true;
    			add_location(option, file$6, 66, 16, 2537);
    			attr_dev(select, "id", /*path*/ ctx[0]);
    			select.disabled = select_disabled_value = /*tree*/ ctx[2].inputs[0].list.length === 1;
    			if (/*$store*/ ctx[10][/*codePath*/ ctx[8]] === void 0) add_render_callback(() => /*select_change_handler*/ ctx[12].call(select));
    			add_location(select, file$6, 61, 12, 2367);
    			attr_dev(div, "class", /*selectWrapperClass*/ ctx[5]);
    			add_location(div, file$6, 60, 8, 2322);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, select);
    			append_dev(select, option);
    			append_dev(option, t);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(select, null);
    			}

    			select_option(select, /*$store*/ ctx[10][/*codePath*/ ctx[8]]);

    			if (!mounted) {
    				dispose = listen_dev(select, "change", /*select_change_handler*/ ctx[12]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*tree*/ 4) {
    				each_value = /*tree*/ ctx[2].inputs[0].list;
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(select, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty & /*path*/ 1) {
    				attr_dev(select, "id", /*path*/ ctx[0]);
    			}

    			if (dirty & /*tree*/ 4 && select_disabled_value !== (select_disabled_value = /*tree*/ ctx[2].inputs[0].list.length === 1)) {
    				prop_dev(select, "disabled", select_disabled_value);
    			}

    			if (dirty & /*$store, codePath, tree, undefined*/ 1284) {
    				select_option(select, /*$store*/ ctx[10][/*codePath*/ ctx[8]]);
    			}

    			if (dirty & /*selectWrapperClass*/ 32) {
    				attr_dev(div, "class", /*selectWrapperClass*/ ctx[5]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$4.name,
    		type: "if",
    		source: "(60:4) {#if tree.inputs && tree.inputs[0].list}",
    		ctx
    	});

    	return block;
    }

    // (68:16) {#each tree.inputs[0].list as option}
    function create_each_block$2(ctx) {
    	let option;
    	let t_value = /*option*/ ctx[16].label + "";
    	let t;
    	let option_value_value;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t = text(t_value);
    			option.__value = option_value_value = /*option*/ ctx[16].value;
    			option.value = option.__value;
    			add_location(option, file$6, 68, 20, 2672);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*tree*/ 4 && t_value !== (t_value = /*option*/ ctx[16].label + "")) set_data_dev(t, t_value);

    			if (dirty & /*tree*/ 4 && option_value_value !== (option_value_value = /*option*/ ctx[16].value)) {
    				prop_dev(option, "__value", option_value_value);
    				option.value = option.__value;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(68:16) {#each tree.inputs[0].list as option}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$6(ctx) {
    	let div;
    	let t;
    	let if_block0 = /*displayTitle*/ ctx[6] && create_if_block_2(ctx);

    	function select_block_type(ctx, dirty) {
    		if (/*tree*/ ctx[2].inputs && /*tree*/ ctx[2].inputs[0].list) return create_if_block$4;
    		if (/*codeStoreValue*/ ctx[9]) return create_if_block_1$3;
    		return create_else_block$4;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block1 = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (if_block0) if_block0.c();
    			t = space();
    			if_block1.c();
    			attr_dev(div, "class", /*wrapperClass*/ ctx[3]);
    			add_location(div, file$6, 55, 0, 2144);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if (if_block0) if_block0.m(div, null);
    			append_dev(div, t);
    			if_block1.m(div, null);
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*displayTitle*/ ctx[6]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_2(ctx);
    					if_block0.c();
    					if_block0.m(div, t);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block1) {
    				if_block1.p(ctx, dirty);
    			} else {
    				if_block1.d(1);
    				if_block1 = current_block_type(ctx);

    				if (if_block1) {
    					if_block1.c();
    					if_block1.m(div, null);
    				}
    			}

    			if (dirty & /*wrapperClass*/ 8) {
    				attr_dev(div, "class", /*wrapperClass*/ ctx[3]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (if_block0) if_block0.d();
    			if_block1.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let $store,
    		$$unsubscribe_store = noop,
    		$$subscribe_store = () => ($$unsubscribe_store(), $$unsubscribe_store = subscribe(store, $$value => $$invalidate(10, $store = $$value)), store);

    	$$self.$$.on_destroy.push(() => $$unsubscribe_store());
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("DropDown", slots, []);
    	
    	let { path } = $$props;
    	let { store } = $$props;
    	validate_store(store, "store");
    	$$subscribe_store();
    	let { tree } = $$props;
    	let { wrapperClass = "field" } = $$props;
    	let { labelClass = "label" } = $$props;
    	let { selectWrapperClass = "select" } = $$props;
    	let { displayTitle } = $$props;
    	let { defaultValueClass = "label" } = $$props;
    	let terminologyPath;
    	let codePath;
    	let valuePath;

    	onMount(() => {
    		// To check other cases too
    		if (tree.inputs && tree.inputs.length == 2) {
    			const [codeTree, valueTree] = tree.inputs;

    			if (codeTree.defaultValue && valueTree.defaultValue && codeTree.terminology) {
    				store.update(store => Object.assign(Object.assign({}, store), {
    					[codePath]: codeTree.defaultValue,
    					[valuePath]: valueTree.defaultValue,
    					[terminologyPath]: codeTree.terminology
    				}));
    			}
    		}
    	}); // Set default values

    	const writable_props = [
    		"path",
    		"store",
    		"tree",
    		"wrapperClass",
    		"labelClass",
    		"selectWrapperClass",
    		"displayTitle",
    		"defaultValueClass"
    	];

    	Object_1$2.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$1.warn(`<DropDown> was created with unknown prop '${key}'`);
    	});

    	function select_change_handler() {
    		$store[codePath] = select_value(this);
    		store.set($store);
    		(((($$invalidate(8, codePath), $$invalidate(0, path)), $$invalidate(13, terminologyPath)), $$invalidate(14, valuePath)), $$invalidate(1, store));
    		$$invalidate(2, tree);
    	}

    	$$self.$$set = $$props => {
    		if ("path" in $$props) $$invalidate(0, path = $$props.path);
    		if ("store" in $$props) $$subscribe_store($$invalidate(1, store = $$props.store));
    		if ("tree" in $$props) $$invalidate(2, tree = $$props.tree);
    		if ("wrapperClass" in $$props) $$invalidate(3, wrapperClass = $$props.wrapperClass);
    		if ("labelClass" in $$props) $$invalidate(4, labelClass = $$props.labelClass);
    		if ("selectWrapperClass" in $$props) $$invalidate(5, selectWrapperClass = $$props.selectWrapperClass);
    		if ("displayTitle" in $$props) $$invalidate(6, displayTitle = $$props.displayTitle);
    		if ("defaultValueClass" in $$props) $$invalidate(7, defaultValueClass = $$props.defaultValueClass);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		destroyAction,
    		getLabel,
    		triggerDestroy,
    		path,
    		store,
    		tree,
    		wrapperClass,
    		labelClass,
    		selectWrapperClass,
    		displayTitle,
    		defaultValueClass,
    		terminologyPath,
    		codePath,
    		valuePath,
    		codeStoreValue,
    		$store,
    		valueStoreValue,
    		isDefault
    	});

    	$$self.$inject_state = $$props => {
    		if ("path" in $$props) $$invalidate(0, path = $$props.path);
    		if ("store" in $$props) $$subscribe_store($$invalidate(1, store = $$props.store));
    		if ("tree" in $$props) $$invalidate(2, tree = $$props.tree);
    		if ("wrapperClass" in $$props) $$invalidate(3, wrapperClass = $$props.wrapperClass);
    		if ("labelClass" in $$props) $$invalidate(4, labelClass = $$props.labelClass);
    		if ("selectWrapperClass" in $$props) $$invalidate(5, selectWrapperClass = $$props.selectWrapperClass);
    		if ("displayTitle" in $$props) $$invalidate(6, displayTitle = $$props.displayTitle);
    		if ("defaultValueClass" in $$props) $$invalidate(7, defaultValueClass = $$props.defaultValueClass);
    		if ("terminologyPath" in $$props) $$invalidate(13, terminologyPath = $$props.terminologyPath);
    		if ("codePath" in $$props) $$invalidate(8, codePath = $$props.codePath);
    		if ("valuePath" in $$props) $$invalidate(14, valuePath = $$props.valuePath);
    		if ("codeStoreValue" in $$props) $$invalidate(9, codeStoreValue = $$props.codeStoreValue);
    		if ("valueStoreValue" in $$props) $$invalidate(11, valueStoreValue = $$props.valueStoreValue);
    		if ("isDefault" in $$props) $$invalidate(15, isDefault = $$props.isDefault);
    	};

    	let codeStoreValue;
    	let valueStoreValue;
    	let isDefault;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*path, terminologyPath, codePath, valuePath, store*/ 24835) {
    			 {
    				$$invalidate(13, terminologyPath = path + "|terminology");
    				$$invalidate(8, codePath = path + "|code");
    				$$invalidate(14, valuePath = path + "|value");
    				triggerDestroy([terminologyPath, codePath, valuePath], store);
    			}
    		}

    		if ($$self.$$.dirty & /*$store, codePath*/ 1280) {
    			 $$invalidate(9, codeStoreValue = $store[codePath]);
    		}

    		if ($$self.$$.dirty & /*$store, valuePath*/ 17408) {
    			 $$invalidate(11, valueStoreValue = $store[valuePath]);
    		}

    		if ($$self.$$.dirty & /*tree, $store, codePath*/ 1284) {
    			// Don't check length == 2
    			 $$invalidate(15, isDefault = tree.inputs && tree.inputs.length == 2 && $store[codePath] == tree.inputs[0].defaultValue);
    		}

    		if ($$self.$$.dirty & /*codeStoreValue, isDefault, tree, store, valuePath, terminologyPath*/ 57862) {
    			 if (codeStoreValue && !isDefault) {
    				if (tree.inputs && tree.inputs[0].list) {
    					let selectedLabel = getLabel(codeStoreValue, tree.inputs[0]);

    					store.update(store => {
    						var _a, _b, _c;

    						return Object.assign(Object.assign({}, store), {
    							[valuePath]: selectedLabel,
    							[terminologyPath]: (_c = (_b = (_a = tree === null || tree === void 0 ? void 0 : tree.inputs) === null || _a === void 0
    							? void 0
    							: _a[0]) === null || _b === void 0
    							? void 0
    							: _b.terminology) !== null && _c !== void 0
    							? _c
    							: "local"
    						});
    					});
    				} else {
    					console.error("Tree does not have input/ input.list");
    				}
    			} else {
    				if (!isDefault) {
    					destroyAction([terminologyPath, valuePath], store);
    				}
    			}
    		}
    	};

    	return [
    		path,
    		store,
    		tree,
    		wrapperClass,
    		labelClass,
    		selectWrapperClass,
    		displayTitle,
    		defaultValueClass,
    		codePath,
    		codeStoreValue,
    		$store,
    		valueStoreValue,
    		select_change_handler
    	];
    }

    class DropDown extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {
    			path: 0,
    			store: 1,
    			tree: 2,
    			wrapperClass: 3,
    			labelClass: 4,
    			selectWrapperClass: 5,
    			displayTitle: 6,
    			defaultValueClass: 7
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "DropDown",
    			options,
    			id: create_fragment$6.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*path*/ ctx[0] === undefined && !("path" in props)) {
    			console_1$1.warn("<DropDown> was created without expected prop 'path'");
    		}

    		if (/*store*/ ctx[1] === undefined && !("store" in props)) {
    			console_1$1.warn("<DropDown> was created without expected prop 'store'");
    		}

    		if (/*tree*/ ctx[2] === undefined && !("tree" in props)) {
    			console_1$1.warn("<DropDown> was created without expected prop 'tree'");
    		}

    		if (/*displayTitle*/ ctx[6] === undefined && !("displayTitle" in props)) {
    			console_1$1.warn("<DropDown> was created without expected prop 'displayTitle'");
    		}
    	}

    	get path() {
    		throw new Error("<DropDown>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set path(value) {
    		throw new Error("<DropDown>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get store() {
    		throw new Error("<DropDown>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set store(value) {
    		throw new Error("<DropDown>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get tree() {
    		throw new Error("<DropDown>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set tree(value) {
    		throw new Error("<DropDown>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get wrapperClass() {
    		throw new Error("<DropDown>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set wrapperClass(value) {
    		throw new Error("<DropDown>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get labelClass() {
    		throw new Error("<DropDown>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set labelClass(value) {
    		throw new Error("<DropDown>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get selectWrapperClass() {
    		throw new Error("<DropDown>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set selectWrapperClass(value) {
    		throw new Error("<DropDown>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get displayTitle() {
    		throw new Error("<DropDown>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set displayTitle(value) {
    		throw new Error("<DropDown>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get defaultValueClass() {
    		throw new Error("<DropDown>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set defaultValueClass(value) {
    		throw new Error("<DropDown>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */
    /* global Reflect, Promise */

    var extendStatics = function(d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };

    function __extends(d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    }

    /** PURE_IMPORTS_START  PURE_IMPORTS_END */
    function isFunction$1(x) {
        return typeof x === 'function';
    }

    /** PURE_IMPORTS_START  PURE_IMPORTS_END */
    var _enable_super_gross_mode_that_will_cause_bad_things = false;
    var config = {
        Promise: undefined,
        set useDeprecatedSynchronousErrorHandling(value) {
            if (value) {
                var error = /*@__PURE__*/ new Error();
                /*@__PURE__*/ console.warn('DEPRECATED! RxJS was set to use deprecated synchronous error handling behavior by code at: \n' + error.stack);
            }
            _enable_super_gross_mode_that_will_cause_bad_things = value;
        },
        get useDeprecatedSynchronousErrorHandling() {
            return _enable_super_gross_mode_that_will_cause_bad_things;
        },
    };

    /** PURE_IMPORTS_START  PURE_IMPORTS_END */
    function hostReportError(err) {
        setTimeout(function () { throw err; }, 0);
    }

    /** PURE_IMPORTS_START _config,_util_hostReportError PURE_IMPORTS_END */
    var empty$1 = {
        closed: true,
        next: function (value) { },
        error: function (err) {
            if (config.useDeprecatedSynchronousErrorHandling) {
                throw err;
            }
            else {
                hostReportError(err);
            }
        },
        complete: function () { }
    };

    /** PURE_IMPORTS_START  PURE_IMPORTS_END */
    var isArray$1 = /*@__PURE__*/ (function () { return Array.isArray || (function (x) { return x && typeof x.length === 'number'; }); })();

    /** PURE_IMPORTS_START  PURE_IMPORTS_END */
    function isObject$1(x) {
        return x !== null && typeof x === 'object';
    }

    /** PURE_IMPORTS_START  PURE_IMPORTS_END */
    var UnsubscriptionErrorImpl = /*@__PURE__*/ (function () {
        function UnsubscriptionErrorImpl(errors) {
            Error.call(this);
            this.message = errors ?
                errors.length + " errors occurred during unsubscription:\n" + errors.map(function (err, i) { return i + 1 + ") " + err.toString(); }).join('\n  ') : '';
            this.name = 'UnsubscriptionError';
            this.errors = errors;
            return this;
        }
        UnsubscriptionErrorImpl.prototype = /*@__PURE__*/ Object.create(Error.prototype);
        return UnsubscriptionErrorImpl;
    })();
    var UnsubscriptionError = UnsubscriptionErrorImpl;

    /** PURE_IMPORTS_START _util_isArray,_util_isObject,_util_isFunction,_util_UnsubscriptionError PURE_IMPORTS_END */
    var Subscription = /*@__PURE__*/ (function () {
        function Subscription(unsubscribe) {
            this.closed = false;
            this._parentOrParents = null;
            this._subscriptions = null;
            if (unsubscribe) {
                this._ctorUnsubscribe = true;
                this._unsubscribe = unsubscribe;
            }
        }
        Subscription.prototype.unsubscribe = function () {
            var errors;
            if (this.closed) {
                return;
            }
            var _a = this, _parentOrParents = _a._parentOrParents, _ctorUnsubscribe = _a._ctorUnsubscribe, _unsubscribe = _a._unsubscribe, _subscriptions = _a._subscriptions;
            this.closed = true;
            this._parentOrParents = null;
            this._subscriptions = null;
            if (_parentOrParents instanceof Subscription) {
                _parentOrParents.remove(this);
            }
            else if (_parentOrParents !== null) {
                for (var index = 0; index < _parentOrParents.length; ++index) {
                    var parent_1 = _parentOrParents[index];
                    parent_1.remove(this);
                }
            }
            if (isFunction$1(_unsubscribe)) {
                if (_ctorUnsubscribe) {
                    this._unsubscribe = undefined;
                }
                try {
                    _unsubscribe.call(this);
                }
                catch (e) {
                    errors = e instanceof UnsubscriptionError ? flattenUnsubscriptionErrors(e.errors) : [e];
                }
            }
            if (isArray$1(_subscriptions)) {
                var index = -1;
                var len = _subscriptions.length;
                while (++index < len) {
                    var sub = _subscriptions[index];
                    if (isObject$1(sub)) {
                        try {
                            sub.unsubscribe();
                        }
                        catch (e) {
                            errors = errors || [];
                            if (e instanceof UnsubscriptionError) {
                                errors = errors.concat(flattenUnsubscriptionErrors(e.errors));
                            }
                            else {
                                errors.push(e);
                            }
                        }
                    }
                }
            }
            if (errors) {
                throw new UnsubscriptionError(errors);
            }
        };
        Subscription.prototype.add = function (teardown) {
            var subscription = teardown;
            if (!teardown) {
                return Subscription.EMPTY;
            }
            switch (typeof teardown) {
                case 'function':
                    subscription = new Subscription(teardown);
                case 'object':
                    if (subscription === this || subscription.closed || typeof subscription.unsubscribe !== 'function') {
                        return subscription;
                    }
                    else if (this.closed) {
                        subscription.unsubscribe();
                        return subscription;
                    }
                    else if (!(subscription instanceof Subscription)) {
                        var tmp = subscription;
                        subscription = new Subscription();
                        subscription._subscriptions = [tmp];
                    }
                    break;
                default: {
                    throw new Error('unrecognized teardown ' + teardown + ' added to Subscription.');
                }
            }
            var _parentOrParents = subscription._parentOrParents;
            if (_parentOrParents === null) {
                subscription._parentOrParents = this;
            }
            else if (_parentOrParents instanceof Subscription) {
                if (_parentOrParents === this) {
                    return subscription;
                }
                subscription._parentOrParents = [_parentOrParents, this];
            }
            else if (_parentOrParents.indexOf(this) === -1) {
                _parentOrParents.push(this);
            }
            else {
                return subscription;
            }
            var subscriptions = this._subscriptions;
            if (subscriptions === null) {
                this._subscriptions = [subscription];
            }
            else {
                subscriptions.push(subscription);
            }
            return subscription;
        };
        Subscription.prototype.remove = function (subscription) {
            var subscriptions = this._subscriptions;
            if (subscriptions) {
                var subscriptionIndex = subscriptions.indexOf(subscription);
                if (subscriptionIndex !== -1) {
                    subscriptions.splice(subscriptionIndex, 1);
                }
            }
        };
        Subscription.EMPTY = (function (empty) {
            empty.closed = true;
            return empty;
        }(new Subscription()));
        return Subscription;
    }());
    function flattenUnsubscriptionErrors(errors) {
        return errors.reduce(function (errs, err) { return errs.concat((err instanceof UnsubscriptionError) ? err.errors : err); }, []);
    }

    /** PURE_IMPORTS_START  PURE_IMPORTS_END */
    var rxSubscriber = /*@__PURE__*/ (function () {
        return typeof Symbol === 'function'
            ? /*@__PURE__*/ Symbol('rxSubscriber')
            : '@@rxSubscriber_' + /*@__PURE__*/ Math.random();
    })();

    /** PURE_IMPORTS_START tslib,_util_isFunction,_Observer,_Subscription,_internal_symbol_rxSubscriber,_config,_util_hostReportError PURE_IMPORTS_END */
    var Subscriber = /*@__PURE__*/ (function (_super) {
        __extends(Subscriber, _super);
        function Subscriber(destinationOrNext, error, complete) {
            var _this = _super.call(this) || this;
            _this.syncErrorValue = null;
            _this.syncErrorThrown = false;
            _this.syncErrorThrowable = false;
            _this.isStopped = false;
            switch (arguments.length) {
                case 0:
                    _this.destination = empty$1;
                    break;
                case 1:
                    if (!destinationOrNext) {
                        _this.destination = empty$1;
                        break;
                    }
                    if (typeof destinationOrNext === 'object') {
                        if (destinationOrNext instanceof Subscriber) {
                            _this.syncErrorThrowable = destinationOrNext.syncErrorThrowable;
                            _this.destination = destinationOrNext;
                            destinationOrNext.add(_this);
                        }
                        else {
                            _this.syncErrorThrowable = true;
                            _this.destination = new SafeSubscriber(_this, destinationOrNext);
                        }
                        break;
                    }
                default:
                    _this.syncErrorThrowable = true;
                    _this.destination = new SafeSubscriber(_this, destinationOrNext, error, complete);
                    break;
            }
            return _this;
        }
        Subscriber.prototype[rxSubscriber] = function () { return this; };
        Subscriber.create = function (next, error, complete) {
            var subscriber = new Subscriber(next, error, complete);
            subscriber.syncErrorThrowable = false;
            return subscriber;
        };
        Subscriber.prototype.next = function (value) {
            if (!this.isStopped) {
                this._next(value);
            }
        };
        Subscriber.prototype.error = function (err) {
            if (!this.isStopped) {
                this.isStopped = true;
                this._error(err);
            }
        };
        Subscriber.prototype.complete = function () {
            if (!this.isStopped) {
                this.isStopped = true;
                this._complete();
            }
        };
        Subscriber.prototype.unsubscribe = function () {
            if (this.closed) {
                return;
            }
            this.isStopped = true;
            _super.prototype.unsubscribe.call(this);
        };
        Subscriber.prototype._next = function (value) {
            this.destination.next(value);
        };
        Subscriber.prototype._error = function (err) {
            this.destination.error(err);
            this.unsubscribe();
        };
        Subscriber.prototype._complete = function () {
            this.destination.complete();
            this.unsubscribe();
        };
        Subscriber.prototype._unsubscribeAndRecycle = function () {
            var _parentOrParents = this._parentOrParents;
            this._parentOrParents = null;
            this.unsubscribe();
            this.closed = false;
            this.isStopped = false;
            this._parentOrParents = _parentOrParents;
            return this;
        };
        return Subscriber;
    }(Subscription));
    var SafeSubscriber = /*@__PURE__*/ (function (_super) {
        __extends(SafeSubscriber, _super);
        function SafeSubscriber(_parentSubscriber, observerOrNext, error, complete) {
            var _this = _super.call(this) || this;
            _this._parentSubscriber = _parentSubscriber;
            var next;
            var context = _this;
            if (isFunction$1(observerOrNext)) {
                next = observerOrNext;
            }
            else if (observerOrNext) {
                next = observerOrNext.next;
                error = observerOrNext.error;
                complete = observerOrNext.complete;
                if (observerOrNext !== empty$1) {
                    context = Object.create(observerOrNext);
                    if (isFunction$1(context.unsubscribe)) {
                        _this.add(context.unsubscribe.bind(context));
                    }
                    context.unsubscribe = _this.unsubscribe.bind(_this);
                }
            }
            _this._context = context;
            _this._next = next;
            _this._error = error;
            _this._complete = complete;
            return _this;
        }
        SafeSubscriber.prototype.next = function (value) {
            if (!this.isStopped && this._next) {
                var _parentSubscriber = this._parentSubscriber;
                if (!config.useDeprecatedSynchronousErrorHandling || !_parentSubscriber.syncErrorThrowable) {
                    this.__tryOrUnsub(this._next, value);
                }
                else if (this.__tryOrSetError(_parentSubscriber, this._next, value)) {
                    this.unsubscribe();
                }
            }
        };
        SafeSubscriber.prototype.error = function (err) {
            if (!this.isStopped) {
                var _parentSubscriber = this._parentSubscriber;
                var useDeprecatedSynchronousErrorHandling = config.useDeprecatedSynchronousErrorHandling;
                if (this._error) {
                    if (!useDeprecatedSynchronousErrorHandling || !_parentSubscriber.syncErrorThrowable) {
                        this.__tryOrUnsub(this._error, err);
                        this.unsubscribe();
                    }
                    else {
                        this.__tryOrSetError(_parentSubscriber, this._error, err);
                        this.unsubscribe();
                    }
                }
                else if (!_parentSubscriber.syncErrorThrowable) {
                    this.unsubscribe();
                    if (useDeprecatedSynchronousErrorHandling) {
                        throw err;
                    }
                    hostReportError(err);
                }
                else {
                    if (useDeprecatedSynchronousErrorHandling) {
                        _parentSubscriber.syncErrorValue = err;
                        _parentSubscriber.syncErrorThrown = true;
                    }
                    else {
                        hostReportError(err);
                    }
                    this.unsubscribe();
                }
            }
        };
        SafeSubscriber.prototype.complete = function () {
            var _this = this;
            if (!this.isStopped) {
                var _parentSubscriber = this._parentSubscriber;
                if (this._complete) {
                    var wrappedComplete = function () { return _this._complete.call(_this._context); };
                    if (!config.useDeprecatedSynchronousErrorHandling || !_parentSubscriber.syncErrorThrowable) {
                        this.__tryOrUnsub(wrappedComplete);
                        this.unsubscribe();
                    }
                    else {
                        this.__tryOrSetError(_parentSubscriber, wrappedComplete);
                        this.unsubscribe();
                    }
                }
                else {
                    this.unsubscribe();
                }
            }
        };
        SafeSubscriber.prototype.__tryOrUnsub = function (fn, value) {
            try {
                fn.call(this._context, value);
            }
            catch (err) {
                this.unsubscribe();
                if (config.useDeprecatedSynchronousErrorHandling) {
                    throw err;
                }
                else {
                    hostReportError(err);
                }
            }
        };
        SafeSubscriber.prototype.__tryOrSetError = function (parent, fn, value) {
            if (!config.useDeprecatedSynchronousErrorHandling) {
                throw new Error('bad call');
            }
            try {
                fn.call(this._context, value);
            }
            catch (err) {
                if (config.useDeprecatedSynchronousErrorHandling) {
                    parent.syncErrorValue = err;
                    parent.syncErrorThrown = true;
                    return true;
                }
                else {
                    hostReportError(err);
                    return true;
                }
            }
            return false;
        };
        SafeSubscriber.prototype._unsubscribe = function () {
            var _parentSubscriber = this._parentSubscriber;
            this._context = null;
            this._parentSubscriber = null;
            _parentSubscriber.unsubscribe();
        };
        return SafeSubscriber;
    }(Subscriber));

    /** PURE_IMPORTS_START _Subscriber PURE_IMPORTS_END */
    function canReportError(observer) {
        while (observer) {
            var _a = observer, closed_1 = _a.closed, destination = _a.destination, isStopped = _a.isStopped;
            if (closed_1 || isStopped) {
                return false;
            }
            else if (destination && destination instanceof Subscriber) {
                observer = destination;
            }
            else {
                observer = null;
            }
        }
        return true;
    }

    /** PURE_IMPORTS_START _Subscriber,_symbol_rxSubscriber,_Observer PURE_IMPORTS_END */
    function toSubscriber(nextOrObserver, error, complete) {
        if (nextOrObserver) {
            if (nextOrObserver instanceof Subscriber) {
                return nextOrObserver;
            }
            if (nextOrObserver[rxSubscriber]) {
                return nextOrObserver[rxSubscriber]();
            }
        }
        if (!nextOrObserver && !error && !complete) {
            return new Subscriber(empty$1);
        }
        return new Subscriber(nextOrObserver, error, complete);
    }

    /** PURE_IMPORTS_START  PURE_IMPORTS_END */
    var observable = /*@__PURE__*/ (function () { return typeof Symbol === 'function' && Symbol.observable || '@@observable'; })();

    /** PURE_IMPORTS_START  PURE_IMPORTS_END */
    function identity(x) {
        return x;
    }

    /** PURE_IMPORTS_START _identity PURE_IMPORTS_END */
    function pipeFromArray(fns) {
        if (fns.length === 0) {
            return identity;
        }
        if (fns.length === 1) {
            return fns[0];
        }
        return function piped(input) {
            return fns.reduce(function (prev, fn) { return fn(prev); }, input);
        };
    }

    /** PURE_IMPORTS_START _util_canReportError,_util_toSubscriber,_symbol_observable,_util_pipe,_config PURE_IMPORTS_END */
    var Observable = /*@__PURE__*/ (function () {
        function Observable(subscribe) {
            this._isScalar = false;
            if (subscribe) {
                this._subscribe = subscribe;
            }
        }
        Observable.prototype.lift = function (operator) {
            var observable = new Observable();
            observable.source = this;
            observable.operator = operator;
            return observable;
        };
        Observable.prototype.subscribe = function (observerOrNext, error, complete) {
            var operator = this.operator;
            var sink = toSubscriber(observerOrNext, error, complete);
            if (operator) {
                sink.add(operator.call(sink, this.source));
            }
            else {
                sink.add(this.source || (config.useDeprecatedSynchronousErrorHandling && !sink.syncErrorThrowable) ?
                    this._subscribe(sink) :
                    this._trySubscribe(sink));
            }
            if (config.useDeprecatedSynchronousErrorHandling) {
                if (sink.syncErrorThrowable) {
                    sink.syncErrorThrowable = false;
                    if (sink.syncErrorThrown) {
                        throw sink.syncErrorValue;
                    }
                }
            }
            return sink;
        };
        Observable.prototype._trySubscribe = function (sink) {
            try {
                return this._subscribe(sink);
            }
            catch (err) {
                if (config.useDeprecatedSynchronousErrorHandling) {
                    sink.syncErrorThrown = true;
                    sink.syncErrorValue = err;
                }
                if (canReportError(sink)) {
                    sink.error(err);
                }
                else {
                    console.warn(err);
                }
            }
        };
        Observable.prototype.forEach = function (next, promiseCtor) {
            var _this = this;
            promiseCtor = getPromiseCtor(promiseCtor);
            return new promiseCtor(function (resolve, reject) {
                var subscription;
                subscription = _this.subscribe(function (value) {
                    try {
                        next(value);
                    }
                    catch (err) {
                        reject(err);
                        if (subscription) {
                            subscription.unsubscribe();
                        }
                    }
                }, reject, resolve);
            });
        };
        Observable.prototype._subscribe = function (subscriber) {
            var source = this.source;
            return source && source.subscribe(subscriber);
        };
        Observable.prototype[observable] = function () {
            return this;
        };
        Observable.prototype.pipe = function () {
            var operations = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                operations[_i] = arguments[_i];
            }
            if (operations.length === 0) {
                return this;
            }
            return pipeFromArray(operations)(this);
        };
        Observable.prototype.toPromise = function (promiseCtor) {
            var _this = this;
            promiseCtor = getPromiseCtor(promiseCtor);
            return new promiseCtor(function (resolve, reject) {
                var value;
                _this.subscribe(function (x) { return value = x; }, function (err) { return reject(err); }, function () { return resolve(value); });
            });
        };
        Observable.create = function (subscribe) {
            return new Observable(subscribe);
        };
        return Observable;
    }());
    function getPromiseCtor(promiseCtor) {
        if (!promiseCtor) {
            promiseCtor =  Promise;
        }
        if (!promiseCtor) {
            throw new Error('no Promise impl found');
        }
        return promiseCtor;
    }

    /** PURE_IMPORTS_START  PURE_IMPORTS_END */
    var ObjectUnsubscribedErrorImpl = /*@__PURE__*/ (function () {
        function ObjectUnsubscribedErrorImpl() {
            Error.call(this);
            this.message = 'object unsubscribed';
            this.name = 'ObjectUnsubscribedError';
            return this;
        }
        ObjectUnsubscribedErrorImpl.prototype = /*@__PURE__*/ Object.create(Error.prototype);
        return ObjectUnsubscribedErrorImpl;
    })();
    var ObjectUnsubscribedError = ObjectUnsubscribedErrorImpl;

    /** PURE_IMPORTS_START tslib,_Subscription PURE_IMPORTS_END */
    var SubjectSubscription = /*@__PURE__*/ (function (_super) {
        __extends(SubjectSubscription, _super);
        function SubjectSubscription(subject, subscriber) {
            var _this = _super.call(this) || this;
            _this.subject = subject;
            _this.subscriber = subscriber;
            _this.closed = false;
            return _this;
        }
        SubjectSubscription.prototype.unsubscribe = function () {
            if (this.closed) {
                return;
            }
            this.closed = true;
            var subject = this.subject;
            var observers = subject.observers;
            this.subject = null;
            if (!observers || observers.length === 0 || subject.isStopped || subject.closed) {
                return;
            }
            var subscriberIndex = observers.indexOf(this.subscriber);
            if (subscriberIndex !== -1) {
                observers.splice(subscriberIndex, 1);
            }
        };
        return SubjectSubscription;
    }(Subscription));

    /** PURE_IMPORTS_START tslib,_Observable,_Subscriber,_Subscription,_util_ObjectUnsubscribedError,_SubjectSubscription,_internal_symbol_rxSubscriber PURE_IMPORTS_END */
    var SubjectSubscriber = /*@__PURE__*/ (function (_super) {
        __extends(SubjectSubscriber, _super);
        function SubjectSubscriber(destination) {
            var _this = _super.call(this, destination) || this;
            _this.destination = destination;
            return _this;
        }
        return SubjectSubscriber;
    }(Subscriber));
    var Subject = /*@__PURE__*/ (function (_super) {
        __extends(Subject, _super);
        function Subject() {
            var _this = _super.call(this) || this;
            _this.observers = [];
            _this.closed = false;
            _this.isStopped = false;
            _this.hasError = false;
            _this.thrownError = null;
            return _this;
        }
        Subject.prototype[rxSubscriber] = function () {
            return new SubjectSubscriber(this);
        };
        Subject.prototype.lift = function (operator) {
            var subject = new AnonymousSubject(this, this);
            subject.operator = operator;
            return subject;
        };
        Subject.prototype.next = function (value) {
            if (this.closed) {
                throw new ObjectUnsubscribedError();
            }
            if (!this.isStopped) {
                var observers = this.observers;
                var len = observers.length;
                var copy = observers.slice();
                for (var i = 0; i < len; i++) {
                    copy[i].next(value);
                }
            }
        };
        Subject.prototype.error = function (err) {
            if (this.closed) {
                throw new ObjectUnsubscribedError();
            }
            this.hasError = true;
            this.thrownError = err;
            this.isStopped = true;
            var observers = this.observers;
            var len = observers.length;
            var copy = observers.slice();
            for (var i = 0; i < len; i++) {
                copy[i].error(err);
            }
            this.observers.length = 0;
        };
        Subject.prototype.complete = function () {
            if (this.closed) {
                throw new ObjectUnsubscribedError();
            }
            this.isStopped = true;
            var observers = this.observers;
            var len = observers.length;
            var copy = observers.slice();
            for (var i = 0; i < len; i++) {
                copy[i].complete();
            }
            this.observers.length = 0;
        };
        Subject.prototype.unsubscribe = function () {
            this.isStopped = true;
            this.closed = true;
            this.observers = null;
        };
        Subject.prototype._trySubscribe = function (subscriber) {
            if (this.closed) {
                throw new ObjectUnsubscribedError();
            }
            else {
                return _super.prototype._trySubscribe.call(this, subscriber);
            }
        };
        Subject.prototype._subscribe = function (subscriber) {
            if (this.closed) {
                throw new ObjectUnsubscribedError();
            }
            else if (this.hasError) {
                subscriber.error(this.thrownError);
                return Subscription.EMPTY;
            }
            else if (this.isStopped) {
                subscriber.complete();
                return Subscription.EMPTY;
            }
            else {
                this.observers.push(subscriber);
                return new SubjectSubscription(this, subscriber);
            }
        };
        Subject.prototype.asObservable = function () {
            var observable = new Observable();
            observable.source = this;
            return observable;
        };
        Subject.create = function (destination, source) {
            return new AnonymousSubject(destination, source);
        };
        return Subject;
    }(Observable));
    var AnonymousSubject = /*@__PURE__*/ (function (_super) {
        __extends(AnonymousSubject, _super);
        function AnonymousSubject(destination, source) {
            var _this = _super.call(this) || this;
            _this.destination = destination;
            _this.source = source;
            return _this;
        }
        AnonymousSubject.prototype.next = function (value) {
            var destination = this.destination;
            if (destination && destination.next) {
                destination.next(value);
            }
        };
        AnonymousSubject.prototype.error = function (err) {
            var destination = this.destination;
            if (destination && destination.error) {
                this.destination.error(err);
            }
        };
        AnonymousSubject.prototype.complete = function () {
            var destination = this.destination;
            if (destination && destination.complete) {
                this.destination.complete();
            }
        };
        AnonymousSubject.prototype._subscribe = function (subscriber) {
            var source = this.source;
            if (source) {
                return this.source.subscribe(subscriber);
            }
            else {
                return Subscription.EMPTY;
            }
        };
        return AnonymousSubject;
    }(Subject));

    /** PURE_IMPORTS_START tslib,_Subject,_util_ObjectUnsubscribedError PURE_IMPORTS_END */
    var BehaviorSubject = /*@__PURE__*/ (function (_super) {
        __extends(BehaviorSubject, _super);
        function BehaviorSubject(_value) {
            var _this = _super.call(this) || this;
            _this._value = _value;
            return _this;
        }
        Object.defineProperty(BehaviorSubject.prototype, "value", {
            get: function () {
                return this.getValue();
            },
            enumerable: true,
            configurable: true
        });
        BehaviorSubject.prototype._subscribe = function (subscriber) {
            var subscription = _super.prototype._subscribe.call(this, subscriber);
            if (subscription && !subscription.closed) {
                subscriber.next(this._value);
            }
            return subscription;
        };
        BehaviorSubject.prototype.getValue = function () {
            if (this.hasError) {
                throw this.thrownError;
            }
            else if (this.closed) {
                throw new ObjectUnsubscribedError();
            }
            else {
                return this._value;
            }
        };
        BehaviorSubject.prototype.next = function (value) {
            _super.prototype.next.call(this, this._value = value);
        };
        return BehaviorSubject;
    }(Subject));

    /** PURE_IMPORTS_START tslib,_Subscription PURE_IMPORTS_END */
    var Action = /*@__PURE__*/ (function (_super) {
        __extends(Action, _super);
        function Action(scheduler, work) {
            return _super.call(this) || this;
        }
        Action.prototype.schedule = function (state, delay) {
            return this;
        };
        return Action;
    }(Subscription));

    /** PURE_IMPORTS_START tslib,_Action PURE_IMPORTS_END */
    var AsyncAction = /*@__PURE__*/ (function (_super) {
        __extends(AsyncAction, _super);
        function AsyncAction(scheduler, work) {
            var _this = _super.call(this, scheduler, work) || this;
            _this.scheduler = scheduler;
            _this.work = work;
            _this.pending = false;
            return _this;
        }
        AsyncAction.prototype.schedule = function (state, delay) {
            if (delay === void 0) {
                delay = 0;
            }
            if (this.closed) {
                return this;
            }
            this.state = state;
            var id = this.id;
            var scheduler = this.scheduler;
            if (id != null) {
                this.id = this.recycleAsyncId(scheduler, id, delay);
            }
            this.pending = true;
            this.delay = delay;
            this.id = this.id || this.requestAsyncId(scheduler, this.id, delay);
            return this;
        };
        AsyncAction.prototype.requestAsyncId = function (scheduler, id, delay) {
            if (delay === void 0) {
                delay = 0;
            }
            return setInterval(scheduler.flush.bind(scheduler, this), delay);
        };
        AsyncAction.prototype.recycleAsyncId = function (scheduler, id, delay) {
            if (delay === void 0) {
                delay = 0;
            }
            if (delay !== null && this.delay === delay && this.pending === false) {
                return id;
            }
            clearInterval(id);
            return undefined;
        };
        AsyncAction.prototype.execute = function (state, delay) {
            if (this.closed) {
                return new Error('executing a cancelled action');
            }
            this.pending = false;
            var error = this._execute(state, delay);
            if (error) {
                return error;
            }
            else if (this.pending === false && this.id != null) {
                this.id = this.recycleAsyncId(this.scheduler, this.id, null);
            }
        };
        AsyncAction.prototype._execute = function (state, delay) {
            var errored = false;
            var errorValue = undefined;
            try {
                this.work(state);
            }
            catch (e) {
                errored = true;
                errorValue = !!e && e || new Error(e);
            }
            if (errored) {
                this.unsubscribe();
                return errorValue;
            }
        };
        AsyncAction.prototype._unsubscribe = function () {
            var id = this.id;
            var scheduler = this.scheduler;
            var actions = scheduler.actions;
            var index = actions.indexOf(this);
            this.work = null;
            this.state = null;
            this.pending = false;
            this.scheduler = null;
            if (index !== -1) {
                actions.splice(index, 1);
            }
            if (id != null) {
                this.id = this.recycleAsyncId(scheduler, id, null);
            }
            this.delay = null;
        };
        return AsyncAction;
    }(Action));

    var Scheduler = /*@__PURE__*/ (function () {
        function Scheduler(SchedulerAction, now) {
            if (now === void 0) {
                now = Scheduler.now;
            }
            this.SchedulerAction = SchedulerAction;
            this.now = now;
        }
        Scheduler.prototype.schedule = function (work, delay, state) {
            if (delay === void 0) {
                delay = 0;
            }
            return new this.SchedulerAction(this, work).schedule(state, delay);
        };
        Scheduler.now = function () { return Date.now(); };
        return Scheduler;
    }());

    /** PURE_IMPORTS_START tslib,_Scheduler PURE_IMPORTS_END */
    var AsyncScheduler = /*@__PURE__*/ (function (_super) {
        __extends(AsyncScheduler, _super);
        function AsyncScheduler(SchedulerAction, now) {
            if (now === void 0) {
                now = Scheduler.now;
            }
            var _this = _super.call(this, SchedulerAction, function () {
                if (AsyncScheduler.delegate && AsyncScheduler.delegate !== _this) {
                    return AsyncScheduler.delegate.now();
                }
                else {
                    return now();
                }
            }) || this;
            _this.actions = [];
            _this.active = false;
            _this.scheduled = undefined;
            return _this;
        }
        AsyncScheduler.prototype.schedule = function (work, delay, state) {
            if (delay === void 0) {
                delay = 0;
            }
            if (AsyncScheduler.delegate && AsyncScheduler.delegate !== this) {
                return AsyncScheduler.delegate.schedule(work, delay, state);
            }
            else {
                return _super.prototype.schedule.call(this, work, delay, state);
            }
        };
        AsyncScheduler.prototype.flush = function (action) {
            var actions = this.actions;
            if (this.active) {
                actions.push(action);
                return;
            }
            var error;
            this.active = true;
            do {
                if (error = action.execute(action.state, action.delay)) {
                    break;
                }
            } while (action = actions.shift());
            this.active = false;
            if (error) {
                while (action = actions.shift()) {
                    action.unsubscribe();
                }
                throw error;
            }
        };
        return AsyncScheduler;
    }(Scheduler));

    /** PURE_IMPORTS_START  PURE_IMPORTS_END */
    function isScheduler(value) {
        return value && typeof value.schedule === 'function';
    }

    /** PURE_IMPORTS_START  PURE_IMPORTS_END */
    var subscribeToArray = function (array) {
        return function (subscriber) {
            for (var i = 0, len = array.length; i < len && !subscriber.closed; i++) {
                subscriber.next(array[i]);
            }
            subscriber.complete();
        };
    };

    /** PURE_IMPORTS_START _Observable,_Subscription PURE_IMPORTS_END */
    function scheduleArray(input, scheduler) {
        return new Observable(function (subscriber) {
            var sub = new Subscription();
            var i = 0;
            sub.add(scheduler.schedule(function () {
                if (i === input.length) {
                    subscriber.complete();
                    return;
                }
                subscriber.next(input[i++]);
                if (!subscriber.closed) {
                    sub.add(this.schedule());
                }
            }));
            return sub;
        });
    }

    /** PURE_IMPORTS_START _Observable,_util_subscribeToArray,_scheduled_scheduleArray PURE_IMPORTS_END */
    function fromArray(input, scheduler) {
        if (!scheduler) {
            return new Observable(subscribeToArray(input));
        }
        else {
            return scheduleArray(input, scheduler);
        }
    }

    /** PURE_IMPORTS_START _util_isScheduler,_fromArray,_scheduled_scheduleArray PURE_IMPORTS_END */
    function of() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        var scheduler = args[args.length - 1];
        if (isScheduler(scheduler)) {
            args.pop();
            return scheduleArray(args, scheduler);
        }
        else {
            return fromArray(args);
        }
    }

    /** PURE_IMPORTS_START _AsyncAction,_AsyncScheduler PURE_IMPORTS_END */
    var asyncScheduler = /*@__PURE__*/ new AsyncScheduler(AsyncAction);
    var async = asyncScheduler;

    /** PURE_IMPORTS_START tslib,_Subscriber PURE_IMPORTS_END */
    function map(project, thisArg) {
        return function mapOperation(source) {
            if (typeof project !== 'function') {
                throw new TypeError('argument is not a function. Are you looking for `mapTo()`?');
            }
            return source.lift(new MapOperator(project, thisArg));
        };
    }
    var MapOperator = /*@__PURE__*/ (function () {
        function MapOperator(project, thisArg) {
            this.project = project;
            this.thisArg = thisArg;
        }
        MapOperator.prototype.call = function (subscriber, source) {
            return source.subscribe(new MapSubscriber(subscriber, this.project, this.thisArg));
        };
        return MapOperator;
    }());
    var MapSubscriber = /*@__PURE__*/ (function (_super) {
        __extends(MapSubscriber, _super);
        function MapSubscriber(destination, project, thisArg) {
            var _this = _super.call(this, destination) || this;
            _this.project = project;
            _this.count = 0;
            _this.thisArg = thisArg || _this;
            return _this;
        }
        MapSubscriber.prototype._next = function (value) {
            var result;
            try {
                result = this.project.call(this.thisArg, value, this.count++);
            }
            catch (err) {
                this.destination.error(err);
                return;
            }
            this.destination.next(result);
        };
        return MapSubscriber;
    }(Subscriber));

    /** PURE_IMPORTS_START _hostReportError PURE_IMPORTS_END */
    var subscribeToPromise = function (promise) {
        return function (subscriber) {
            promise.then(function (value) {
                if (!subscriber.closed) {
                    subscriber.next(value);
                    subscriber.complete();
                }
            }, function (err) { return subscriber.error(err); })
                .then(null, hostReportError);
            return subscriber;
        };
    };

    /** PURE_IMPORTS_START  PURE_IMPORTS_END */
    function getSymbolIterator() {
        if (typeof Symbol !== 'function' || !Symbol.iterator) {
            return '@@iterator';
        }
        return Symbol.iterator;
    }
    var iterator = /*@__PURE__*/ getSymbolIterator();

    /** PURE_IMPORTS_START _symbol_iterator PURE_IMPORTS_END */
    var subscribeToIterable = function (iterable) {
        return function (subscriber) {
            var iterator$1 = iterable[iterator]();
            do {
                var item = void 0;
                try {
                    item = iterator$1.next();
                }
                catch (err) {
                    subscriber.error(err);
                    return subscriber;
                }
                if (item.done) {
                    subscriber.complete();
                    break;
                }
                subscriber.next(item.value);
                if (subscriber.closed) {
                    break;
                }
            } while (true);
            if (typeof iterator$1.return === 'function') {
                subscriber.add(function () {
                    if (iterator$1.return) {
                        iterator$1.return();
                    }
                });
            }
            return subscriber;
        };
    };

    /** PURE_IMPORTS_START _symbol_observable PURE_IMPORTS_END */
    var subscribeToObservable = function (obj) {
        return function (subscriber) {
            var obs = obj[observable]();
            if (typeof obs.subscribe !== 'function') {
                throw new TypeError('Provided object does not correctly implement Symbol.observable');
            }
            else {
                return obs.subscribe(subscriber);
            }
        };
    };

    /** PURE_IMPORTS_START  PURE_IMPORTS_END */
    var isArrayLike = (function (x) { return x && typeof x.length === 'number' && typeof x !== 'function'; });

    /** PURE_IMPORTS_START  PURE_IMPORTS_END */
    function isPromise(value) {
        return !!value && typeof value.subscribe !== 'function' && typeof value.then === 'function';
    }

    /** PURE_IMPORTS_START _subscribeToArray,_subscribeToPromise,_subscribeToIterable,_subscribeToObservable,_isArrayLike,_isPromise,_isObject,_symbol_iterator,_symbol_observable PURE_IMPORTS_END */
    var subscribeTo = function (result) {
        if (!!result && typeof result[observable] === 'function') {
            return subscribeToObservable(result);
        }
        else if (isArrayLike(result)) {
            return subscribeToArray(result);
        }
        else if (isPromise(result)) {
            return subscribeToPromise(result);
        }
        else if (!!result && typeof result[iterator] === 'function') {
            return subscribeToIterable(result);
        }
        else {
            var value = isObject$1(result) ? 'an invalid object' : "'" + result + "'";
            var msg = "You provided " + value + " where a stream was expected."
                + ' You can provide an Observable, Promise, Array, or Iterable.';
            throw new TypeError(msg);
        }
    };

    /** PURE_IMPORTS_START _Observable,_Subscription,_symbol_observable PURE_IMPORTS_END */
    function scheduleObservable(input, scheduler) {
        return new Observable(function (subscriber) {
            var sub = new Subscription();
            sub.add(scheduler.schedule(function () {
                var observable$1 = input[observable]();
                sub.add(observable$1.subscribe({
                    next: function (value) { sub.add(scheduler.schedule(function () { return subscriber.next(value); })); },
                    error: function (err) { sub.add(scheduler.schedule(function () { return subscriber.error(err); })); },
                    complete: function () { sub.add(scheduler.schedule(function () { return subscriber.complete(); })); },
                }));
            }));
            return sub;
        });
    }

    /** PURE_IMPORTS_START _Observable,_Subscription PURE_IMPORTS_END */
    function schedulePromise(input, scheduler) {
        return new Observable(function (subscriber) {
            var sub = new Subscription();
            sub.add(scheduler.schedule(function () {
                return input.then(function (value) {
                    sub.add(scheduler.schedule(function () {
                        subscriber.next(value);
                        sub.add(scheduler.schedule(function () { return subscriber.complete(); }));
                    }));
                }, function (err) {
                    sub.add(scheduler.schedule(function () { return subscriber.error(err); }));
                });
            }));
            return sub;
        });
    }

    /** PURE_IMPORTS_START _Observable,_Subscription,_symbol_iterator PURE_IMPORTS_END */
    function scheduleIterable(input, scheduler) {
        if (!input) {
            throw new Error('Iterable cannot be null');
        }
        return new Observable(function (subscriber) {
            var sub = new Subscription();
            var iterator$1;
            sub.add(function () {
                if (iterator$1 && typeof iterator$1.return === 'function') {
                    iterator$1.return();
                }
            });
            sub.add(scheduler.schedule(function () {
                iterator$1 = input[iterator]();
                sub.add(scheduler.schedule(function () {
                    if (subscriber.closed) {
                        return;
                    }
                    var value;
                    var done;
                    try {
                        var result = iterator$1.next();
                        value = result.value;
                        done = result.done;
                    }
                    catch (err) {
                        subscriber.error(err);
                        return;
                    }
                    if (done) {
                        subscriber.complete();
                    }
                    else {
                        subscriber.next(value);
                        this.schedule();
                    }
                }));
            }));
            return sub;
        });
    }

    /** PURE_IMPORTS_START _symbol_observable PURE_IMPORTS_END */
    function isInteropObservable(input) {
        return input && typeof input[observable] === 'function';
    }

    /** PURE_IMPORTS_START _symbol_iterator PURE_IMPORTS_END */
    function isIterable(input) {
        return input && typeof input[iterator] === 'function';
    }

    /** PURE_IMPORTS_START _scheduleObservable,_schedulePromise,_scheduleArray,_scheduleIterable,_util_isInteropObservable,_util_isPromise,_util_isArrayLike,_util_isIterable PURE_IMPORTS_END */
    function scheduled(input, scheduler) {
        if (input != null) {
            if (isInteropObservable(input)) {
                return scheduleObservable(input, scheduler);
            }
            else if (isPromise(input)) {
                return schedulePromise(input, scheduler);
            }
            else if (isArrayLike(input)) {
                return scheduleArray(input, scheduler);
            }
            else if (isIterable(input) || typeof input === 'string') {
                return scheduleIterable(input, scheduler);
            }
        }
        throw new TypeError((input !== null && typeof input || input) + ' is not observable');
    }

    /** PURE_IMPORTS_START _Observable,_util_subscribeTo,_scheduled_scheduled PURE_IMPORTS_END */
    function from(input, scheduler) {
        if (!scheduler) {
            if (input instanceof Observable) {
                return input;
            }
            return new Observable(subscribeTo(input));
        }
        else {
            return scheduled(input, scheduler);
        }
    }

    /** PURE_IMPORTS_START tslib,_Subscriber,_Observable,_util_subscribeTo PURE_IMPORTS_END */
    var SimpleInnerSubscriber = /*@__PURE__*/ (function (_super) {
        __extends(SimpleInnerSubscriber, _super);
        function SimpleInnerSubscriber(parent) {
            var _this = _super.call(this) || this;
            _this.parent = parent;
            return _this;
        }
        SimpleInnerSubscriber.prototype._next = function (value) {
            this.parent.notifyNext(value);
        };
        SimpleInnerSubscriber.prototype._error = function (error) {
            this.parent.notifyError(error);
            this.unsubscribe();
        };
        SimpleInnerSubscriber.prototype._complete = function () {
            this.parent.notifyComplete();
            this.unsubscribe();
        };
        return SimpleInnerSubscriber;
    }(Subscriber));
    var SimpleOuterSubscriber = /*@__PURE__*/ (function (_super) {
        __extends(SimpleOuterSubscriber, _super);
        function SimpleOuterSubscriber() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        SimpleOuterSubscriber.prototype.notifyNext = function (innerValue) {
            this.destination.next(innerValue);
        };
        SimpleOuterSubscriber.prototype.notifyError = function (err) {
            this.destination.error(err);
        };
        SimpleOuterSubscriber.prototype.notifyComplete = function () {
            this.destination.complete();
        };
        return SimpleOuterSubscriber;
    }(Subscriber));
    function innerSubscribe(result, innerSubscriber) {
        if (innerSubscriber.closed) {
            return undefined;
        }
        if (result instanceof Observable) {
            return result.subscribe(innerSubscriber);
        }
        return subscribeTo(result)(innerSubscriber);
    }

    /** PURE_IMPORTS_START tslib,_map,_observable_from,_innerSubscribe PURE_IMPORTS_END */
    function mergeMap(project, resultSelector, concurrent) {
        if (concurrent === void 0) {
            concurrent = Number.POSITIVE_INFINITY;
        }
        if (typeof resultSelector === 'function') {
            return function (source) { return source.pipe(mergeMap(function (a, i) { return from(project(a, i)).pipe(map(function (b, ii) { return resultSelector(a, b, i, ii); })); }, concurrent)); };
        }
        else if (typeof resultSelector === 'number') {
            concurrent = resultSelector;
        }
        return function (source) { return source.lift(new MergeMapOperator(project, concurrent)); };
    }
    var MergeMapOperator = /*@__PURE__*/ (function () {
        function MergeMapOperator(project, concurrent) {
            if (concurrent === void 0) {
                concurrent = Number.POSITIVE_INFINITY;
            }
            this.project = project;
            this.concurrent = concurrent;
        }
        MergeMapOperator.prototype.call = function (observer, source) {
            return source.subscribe(new MergeMapSubscriber(observer, this.project, this.concurrent));
        };
        return MergeMapOperator;
    }());
    var MergeMapSubscriber = /*@__PURE__*/ (function (_super) {
        __extends(MergeMapSubscriber, _super);
        function MergeMapSubscriber(destination, project, concurrent) {
            if (concurrent === void 0) {
                concurrent = Number.POSITIVE_INFINITY;
            }
            var _this = _super.call(this, destination) || this;
            _this.project = project;
            _this.concurrent = concurrent;
            _this.hasCompleted = false;
            _this.buffer = [];
            _this.active = 0;
            _this.index = 0;
            return _this;
        }
        MergeMapSubscriber.prototype._next = function (value) {
            if (this.active < this.concurrent) {
                this._tryNext(value);
            }
            else {
                this.buffer.push(value);
            }
        };
        MergeMapSubscriber.prototype._tryNext = function (value) {
            var result;
            var index = this.index++;
            try {
                result = this.project(value, index);
            }
            catch (err) {
                this.destination.error(err);
                return;
            }
            this.active++;
            this._innerSub(result);
        };
        MergeMapSubscriber.prototype._innerSub = function (ish) {
            var innerSubscriber = new SimpleInnerSubscriber(this);
            var destination = this.destination;
            destination.add(innerSubscriber);
            var innerSubscription = innerSubscribe(ish, innerSubscriber);
            if (innerSubscription !== innerSubscriber) {
                destination.add(innerSubscription);
            }
        };
        MergeMapSubscriber.prototype._complete = function () {
            this.hasCompleted = true;
            if (this.active === 0 && this.buffer.length === 0) {
                this.destination.complete();
            }
            this.unsubscribe();
        };
        MergeMapSubscriber.prototype.notifyNext = function (innerValue) {
            this.destination.next(innerValue);
        };
        MergeMapSubscriber.prototype.notifyComplete = function () {
            var buffer = this.buffer;
            this.active--;
            if (buffer.length > 0) {
                this._next(buffer.shift());
            }
            else if (this.active === 0 && this.hasCompleted) {
                this.destination.complete();
            }
        };
        return MergeMapSubscriber;
    }(SimpleOuterSubscriber));

    /** PURE_IMPORTS_START _mergeMap,_util_identity PURE_IMPORTS_END */
    function mergeAll(concurrent) {
        if (concurrent === void 0) {
            concurrent = Number.POSITIVE_INFINITY;
        }
        return mergeMap(identity, concurrent);
    }

    /** PURE_IMPORTS_START _mergeAll PURE_IMPORTS_END */
    function concatAll() {
        return mergeAll(1);
    }

    /** PURE_IMPORTS_START _of,_operators_concatAll PURE_IMPORTS_END */
    function concat() {
        var observables = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            observables[_i] = arguments[_i];
        }
        return concatAll()(of.apply(void 0, observables));
    }

    /** PURE_IMPORTS_START tslib,_Subscriber,_scheduler_async PURE_IMPORTS_END */
    function debounceTime(dueTime, scheduler) {
        if (scheduler === void 0) {
            scheduler = async;
        }
        return function (source) { return source.lift(new DebounceTimeOperator(dueTime, scheduler)); };
    }
    var DebounceTimeOperator = /*@__PURE__*/ (function () {
        function DebounceTimeOperator(dueTime, scheduler) {
            this.dueTime = dueTime;
            this.scheduler = scheduler;
        }
        DebounceTimeOperator.prototype.call = function (subscriber, source) {
            return source.subscribe(new DebounceTimeSubscriber(subscriber, this.dueTime, this.scheduler));
        };
        return DebounceTimeOperator;
    }());
    var DebounceTimeSubscriber = /*@__PURE__*/ (function (_super) {
        __extends(DebounceTimeSubscriber, _super);
        function DebounceTimeSubscriber(destination, dueTime, scheduler) {
            var _this = _super.call(this, destination) || this;
            _this.dueTime = dueTime;
            _this.scheduler = scheduler;
            _this.debouncedSubscription = null;
            _this.lastValue = null;
            _this.hasValue = false;
            return _this;
        }
        DebounceTimeSubscriber.prototype._next = function (value) {
            this.clearDebounce();
            this.lastValue = value;
            this.hasValue = true;
            this.add(this.debouncedSubscription = this.scheduler.schedule(dispatchNext, this.dueTime, this));
        };
        DebounceTimeSubscriber.prototype._complete = function () {
            this.debouncedNext();
            this.destination.complete();
        };
        DebounceTimeSubscriber.prototype.debouncedNext = function () {
            this.clearDebounce();
            if (this.hasValue) {
                var lastValue = this.lastValue;
                this.lastValue = null;
                this.hasValue = false;
                this.destination.next(lastValue);
            }
        };
        DebounceTimeSubscriber.prototype.clearDebounce = function () {
            var debouncedSubscription = this.debouncedSubscription;
            if (debouncedSubscription !== null) {
                this.remove(debouncedSubscription);
                debouncedSubscription.unsubscribe();
                this.debouncedSubscription = null;
            }
        };
        return DebounceTimeSubscriber;
    }(Subscriber));
    function dispatchNext(subscriber) {
        subscriber.debouncedNext();
    }

    /** PURE_IMPORTS_START _observable_concat,_util_isScheduler PURE_IMPORTS_END */
    function startWith() {
        var array = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            array[_i] = arguments[_i];
        }
        var scheduler = array[array.length - 1];
        if (isScheduler(scheduler)) {
            array.pop();
            return function (source) { return concat(array, source, scheduler); };
        }
        else {
            return function (source) { return concat(array, source); };
        }
    }

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (let i = 0; i < subscribers.length; i += 1) {
                        const s = subscribers[i];
                        s[1]();
                        subscriber_queue.push(s, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    /* src\rm\CodedText\Search.svelte generated by Svelte v3.29.4 */

    const { Object: Object_1$3, console: console_1$2 } = globals;
    const file$7 = "src\\rm\\CodedText\\Search.svelte";

    function add_css() {
    	var style = element("style");
    	style.id = "svelte-m17ndh-style";
    	style.textContent = "input[type=\"search\"].svelte-m17ndh::-webkit-search-decoration,input[type=\"search\"].svelte-m17ndh::-webkit-search-cancel-button,input[type=\"search\"].svelte-m17ndh::-webkit-search-results-button,input[type=\"search\"].svelte-m17ndh::-webkit-search-results-decoration{display:none}input[type=\"search\"].svelte-m17ndh::-webkit-search-cancel-button{display:none}.delete.svelte-m17ndh{vertical-align:middle}aside.svelte-m17ndh{margin:auto;z-index:100;overflow:auto;position:absolute;padding:0;margin:0;border:1px solid #dbdbdb;height:20rem;width:100%;background-color:rgba(255, 255, 255, 0.966)}\n/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU2VhcmNoLnN2ZWx0ZSIsInNvdXJjZXMiOlsiU2VhcmNoLnN2ZWx0ZSJdLCJzb3VyY2VzQ29udGVudCI6WyI8c2NyaXB0IGxhbmc9XCJ0c1wiPnZhciBfX2F3YWl0ZXIgPSAodGhpcyAmJiB0aGlzLl9fYXdhaXRlcikgfHwgZnVuY3Rpb24gKHRoaXNBcmcsIF9hcmd1bWVudHMsIFAsIGdlbmVyYXRvcikge1xyXG4gICAgZnVuY3Rpb24gYWRvcHQodmFsdWUpIHsgcmV0dXJuIHZhbHVlIGluc3RhbmNlb2YgUCA/IHZhbHVlIDogbmV3IFAoZnVuY3Rpb24gKHJlc29sdmUpIHsgcmVzb2x2ZSh2YWx1ZSk7IH0pOyB9XHJcbiAgICByZXR1cm4gbmV3IChQIHx8IChQID0gUHJvbWlzZSkpKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcclxuICAgICAgICBmdW5jdGlvbiBmdWxmaWxsZWQodmFsdWUpIHsgdHJ5IHsgc3RlcChnZW5lcmF0b3IubmV4dCh2YWx1ZSkpOyB9IGNhdGNoIChlKSB7IHJlamVjdChlKTsgfSB9XHJcbiAgICAgICAgZnVuY3Rpb24gcmVqZWN0ZWQodmFsdWUpIHsgdHJ5IHsgc3RlcChnZW5lcmF0b3JbXCJ0aHJvd1wiXSh2YWx1ZSkpOyB9IGNhdGNoIChlKSB7IHJlamVjdChlKTsgfSB9XHJcbiAgICAgICAgZnVuY3Rpb24gc3RlcChyZXN1bHQpIHsgcmVzdWx0LmRvbmUgPyByZXNvbHZlKHJlc3VsdC52YWx1ZSkgOiBhZG9wdChyZXN1bHQudmFsdWUpLnRoZW4oZnVsZmlsbGVkLCByZWplY3RlZCk7IH1cclxuICAgICAgICBzdGVwKChnZW5lcmF0b3IgPSBnZW5lcmF0b3IuYXBwbHkodGhpc0FyZywgX2FyZ3VtZW50cyB8fCBbXSkpLm5leHQoKSk7XHJcbiAgICB9KTtcclxufTtcclxuaW1wb3J0IHsgQmVoYXZpb3JTdWJqZWN0IH0gZnJvbSBcInJ4anNcIjtcclxuaW1wb3J0IHsgZGVib3VuY2VUaW1lLCBzdGFydFdpdGggfSBmcm9tIFwicnhqcy9vcGVyYXRvcnNcIjtcclxuaW1wb3J0IHsgd3JpdGFibGUgfSBmcm9tIFwic3ZlbHRlL3N0b3JlXCI7XHJcbjtcclxuaW1wb3J0IHsgZGVzdHJveUFjdGlvbiwgdHJpZ2dlckRlc3Ryb3kgfSBmcm9tIFwiLi4vdXRpbHNcIjtcclxuO1xyXG5leHBvcnQgbGV0IHBhdGg7XHJcbmV4cG9ydCBsZXQgc3RvcmU7XHJcbmV4cG9ydCBsZXQgdHJlZTtcclxuZXhwb3J0IGxldCBsYWJlbENsYXNzO1xyXG5leHBvcnQgbGV0IHdyYXBwZXJDbGFzcztcclxuZXhwb3J0IGxldCBzZWFyY2hGdW5jdGlvbjtcclxuZXhwb3J0IGxldCBjb25zdHJhaW50O1xyXG5leHBvcnQgbGV0IHRlcm1pbm9sb2d5VXJsO1xyXG5leHBvcnQgbGV0IGRpc3BsYXlUaXRsZTtcclxubGV0IHNlYXJjaFRlcm0gPSBcIlwiO1xyXG5sZXQgZXJyb3IgPSBmYWxzZTtcclxubGV0IGxvYWRpbmcgPSBmYWxzZTtcclxubGV0IHNlYXJjaFJlc3VsdHMgPSB3cml0YWJsZShbXSk7XHJcbmNvbnN0IHNlYXJjaFRlcm1TdWJqZWN0ID0gbmV3IEJlaGF2aW9yU3ViamVjdChcIlwiKTtcclxubGV0IHNlYXJjaFRlcm1SeCA9IHNlYXJjaFRlcm1TdWJqZWN0LnBpcGUoZGVib3VuY2VUaW1lKDE1MCksIHN0YXJ0V2l0aChcIlwiKSk7XHJcbiQ6IHtcclxuICAgIHNlYXJjaFRlcm1TdWJqZWN0Lm5leHQoc2VhcmNoVGVybSk7XHJcbn1cclxuY29uc3QgaGFuZGxlU2VhcmNoID0gKHsgc2VhcmNoVGVybSwgdGVybWlub2xvZ3lVcmwsIGNvbnN0cmFpbnQsIHNlYXJjaEZ1bmN0aW9uLCByZXN1bHRTdG9yZSwgfSkgPT4gX19hd2FpdGVyKHZvaWQgMCwgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uKiAoKSB7XHJcbiAgICB0cnkge1xyXG4gICAgICAgIGxvYWRpbmcgPSB0cnVlO1xyXG4gICAgICAgIGNvbnN0IHJlc3VsdHMgPSB5aWVsZCBzZWFyY2hGdW5jdGlvbihzZWFyY2hUZXJtLCBjb25zdHJhaW50LCB0ZXJtaW5vbG9neVVybCk7XHJcbiAgICAgICAgaWYgKHJlc3VsdHMpIHtcclxuICAgICAgICAgICAgcmVzdWx0U3RvcmUuc2V0KHJlc3VsdHMpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgY29uc29sZS53YXJuKGBbJHtwYXRofV06IFRoZSBzZWFyY2hGdW5jdGlvbiByZXR1cm5lZCBhIGZhbHN5IHZhbHVlLmApO1xyXG4gICAgICAgIH1cclxuICAgICAgICBsb2FkaW5nID0gZmFsc2U7XHJcbiAgICAgICAgZXJyb3IgPSBmYWxzZTtcclxuICAgIH1cclxuICAgIGNhdGNoIChlKSB7XHJcbiAgICAgICAgZXJyb3IgPSB0cnVlO1xyXG4gICAgICAgIGNvbnNvbGUuZXJyb3IoZSk7XHJcbiAgICB9XHJcbn0pO1xyXG4kOiB7XHJcbiAgICBoYW5kbGVTZWFyY2goe1xyXG4gICAgICAgIHNlYXJjaFRlcm06ICRzZWFyY2hUZXJtUngsXHJcbiAgICAgICAgdGVybWlub2xvZ3lVcmwsXHJcbiAgICAgICAgY29uc3RyYWludCxcclxuICAgICAgICBzZWFyY2hGdW5jdGlvbixcclxuICAgICAgICByZXN1bHRTdG9yZTogc2VhcmNoUmVzdWx0cyxcclxuICAgIH0pO1xyXG59XHJcbmNvbnN0IHBhdGhzID0gW3BhdGggKyBcInxjb2RlXCIsIHBhdGggKyBcInx2YWx1ZVwiLCBwYXRoICsgXCJ8dGVybWlub2xvZ3lcIl07XHJcbmNvbnN0IGRlc2VsZWN0ID0gKCkgPT4ge1xyXG4gICAgZGVzdHJveUFjdGlvbihwYXRocywgc3RvcmUpO1xyXG59O1xyXG5jb25zdCBzZWxlY3QgPSAocmVzdWx0KSA9PiB7XHJcbiAgICBzdG9yZS51cGRhdGUoKHMpID0+IChPYmplY3QuYXNzaWduKE9iamVjdC5hc3NpZ24oe30sIHMpLCB7IFtwYXRoICsgXCJ8Y29kZVwiXTogcmVzdWx0LmNvZGUsIFtwYXRoICsgXCJ8dmFsdWVcIl06IHJlc3VsdC52YWx1ZSwgW3BhdGggKyBcInx0ZXJtaW5vbG9neVwiXTogXCJTTk9NRUQtQ1RcIiB9KSkpO1xyXG59O1xyXG50cmlnZ2VyRGVzdHJveShwYXRocywgc3RvcmUpO1xyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1TZWFyY2guc3ZlbHRlLmpzLm1hcDwvc2NyaXB0PlxuXG48ZGl2IGNsYXNzPXt3cmFwcGVyQ2xhc3N9PlxuICAgIHsjaWYgZGlzcGxheVRpdGxlfVxuICAgICAgICA8bGFiZWwgZm9yPXtwYXRofSBjbGFzcz17bGFiZWxDbGFzc30+e3RyZWUubmFtZX08L2xhYmVsPlxuICAgIHsvaWZ9XG4gICAgeyNpZiAkc3RvcmVbcGF0aCArIFwifHZhbHVlXCJdfVxuICAgICAgICA8ZGl2IGNsYXNzPVwiY29udHJvbFwiPlxuICAgICAgICAgICAgPGxhYmVsIGNsYXNzPVwiaXMtc2l6ZS01XCIgZm9yPXtwYXRoICsgXCIuZGVsZXRlXCJ9XG4gICAgICAgICAgICAgICAgPnskc3RvcmVbcGF0aCArIFwifHZhbHVlXCJdfTwvbGFiZWxcbiAgICAgICAgICAgID5cbiAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgICBjbGFzcz1cImRlbGV0ZVwiXG4gICAgICAgICAgICAgICAgaWQ9e3BhdGggKyBcImRlbGV0ZVwifVxuICAgICAgICAgICAgICAgIG9uOmNsaWNrfHByZXZlbnREZWZhdWx0PXtkZXNlbGVjdH1cbiAgICAgICAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICAgIC8+XG4gICAgICAgIDwvZGl2PlxuICAgIHs6ZWxzZSBpZiAhKHRlcm1pbm9sb2d5VXJsICYmIGNvbnN0cmFpbnQpfVxuICAgICAgICA8cD5QbGVhc2UgY29uZmlndXJlIHRlcm1pbm9sb2d5VXJsIGFuZCBjb25zdHJhaW50IGluIHRoZSBzZXR0aW5ncy48L3A+XG4gICAgezplbHNlfVxuICAgICAgICA8ZGl2IGNsYXNzPVwiY29udHJvbCBoYXMtaWNvbnMtcmlnaHRcIiBjbGFzczppcy1sb2FkaW5nPXtmYWxzZX0+XG4gICAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgICAgICBpZD17cGF0aH1cbiAgICAgICAgICAgICAgICB0eXBlPVwic2VhcmNoXCJcbiAgICAgICAgICAgICAgICBjbGFzcz1cImlucHV0XCJcbiAgICAgICAgICAgICAgICBiaW5kOnZhbHVlPXtzZWFyY2hUZXJtfVxuICAgICAgICAgICAgICAgIHBsYWNlaG9sZGVyPVwiVHlwZSB0byBzZWFyY2guLi5cIlxuICAgICAgICAgICAgICAgIGF1dG9jb21wbGV0ZT1cIm9mZlwiXG4gICAgICAgICAgICAvPlxuICAgICAgICAgICAgeyNpZiBlcnJvcn08c3BhbiBjbGFzcz1cImljb24gaXMtcmlnaHRcIj7imqDvuI88L3NwYW4+ey9pZn1cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJjb250YWluZXJcIj5cbiAgICAgICAgICAgIDxhc2lkZSBjbGFzcz1cImJveCBtZW51XCIgY2xhc3M6aXMtaGlkZGVuPXshc2VhcmNoVGVybSB8fCBlcnJvcn0+XG4gICAgICAgICAgICAgICAgPHVsIGNsYXNzPVwibWVudS1saXN0XCI+XG4gICAgICAgICAgICAgICAgICAgIHsjaWYgc2VhcmNoVGVybSAmJiAhbG9hZGluZyAmJiAkc2VhcmNoUmVzdWx0cyAmJiAkc2VhcmNoUmVzdWx0cy5sZW5ndGggPT0gMH1cbiAgICAgICAgICAgICAgICAgICAgICAgIDxsaT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8YSBjbGFzczpoYXMtdGV4dC1ncmV5PXtsb2FkaW5nfSBocmVmPVwiIy9cIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA+Tm8gcmVzdWx0cyBmb3VuZDwvYVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvbGk+XG4gICAgICAgICAgICAgICAgICAgIHs6ZWxzZX1cbiAgICAgICAgICAgICAgICAgICAgICAgIHsjZWFjaCAkc2VhcmNoUmVzdWx0cyBhcyByZXN1bHR9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGxpPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8YVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3M6aGFzLXRleHQtZ3JleT17bG9hZGluZ31cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhyZWY9XCIjL1wiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbjpjbGlja3xwcmV2ZW50RGVmYXVsdD17KCkgPT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWxlY3QocmVzdWx0KX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge3Jlc3VsdC5kaXNwbGF5fTwvYVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9saT5cbiAgICAgICAgICAgICAgICAgICAgICAgIHsvZWFjaH1cbiAgICAgICAgICAgICAgICAgICAgey9pZn1cbiAgICAgICAgICAgICAgICA8L3VsPlxuICAgICAgICAgICAgPC9hc2lkZT5cbiAgICAgICAgPC9kaXY+XG4gICAgey9pZn1cbjwvZGl2PlxuXG48c3R5bGU+XG4gICAgaW5wdXRbdHlwZT1cInNlYXJjaFwiXTo6LXdlYmtpdC1zZWFyY2gtZGVjb3JhdGlvbixcbiAgICBpbnB1dFt0eXBlPVwic2VhcmNoXCJdOjotd2Via2l0LXNlYXJjaC1jYW5jZWwtYnV0dG9uLFxuICAgIGlucHV0W3R5cGU9XCJzZWFyY2hcIl06Oi13ZWJraXQtc2VhcmNoLXJlc3VsdHMtYnV0dG9uLFxuICAgIGlucHV0W3R5cGU9XCJzZWFyY2hcIl06Oi13ZWJraXQtc2VhcmNoLXJlc3VsdHMtZGVjb3JhdGlvbiB7XG4gICAgICAgIGRpc3BsYXk6IG5vbmU7XG4gICAgfVxuICAgIGlucHV0W3R5cGU9XCJzZWFyY2hcIl06Oi13ZWJraXQtc2VhcmNoLWNhbmNlbC1idXR0b24ge1xuICAgICAgICBkaXNwbGF5OiBub25lO1xuICAgIH1cbiAgICAuZGVsZXRlIHtcbiAgICAgICAgdmVydGljYWwtYWxpZ246IG1pZGRsZTtcbiAgICB9XG4gICAgYXNpZGUge1xuICAgICAgICBtYXJnaW46IGF1dG87XG4gICAgICAgIHotaW5kZXg6IDEwMDtcbiAgICAgICAgb3ZlcmZsb3c6IGF1dG87XG4gICAgICAgIHBvc2l0aW9uOiBhYnNvbHV0ZTtcbiAgICAgICAgcGFkZGluZzogMDtcbiAgICAgICAgbWFyZ2luOiAwO1xuICAgICAgICBib3JkZXI6IDFweCBzb2xpZCAjZGJkYmRiO1xuICAgICAgICBoZWlnaHQ6IDIwcmVtO1xuICAgICAgICB3aWR0aDogMTAwJTtcbiAgICAgICAgYmFja2dyb3VuZC1jb2xvcjogcmdiYSgyNTUsIDI1NSwgMjU1LCAwLjk2Nik7XG4gICAgfVxuPC9zdHlsZT5cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFrSUksS0FBSyxDQUFDLElBQUksQ0FBQyxRQUFRLGVBQUMsMkJBQTJCLENBQy9DLEtBQUssQ0FBQyxJQUFJLENBQUMsUUFBUSxlQUFDLDhCQUE4QixDQUNsRCxLQUFLLENBQUMsSUFBSSxDQUFDLFFBQVEsZUFBQywrQkFBK0IsQ0FDbkQsS0FBSyxDQUFDLElBQUksQ0FBQyxRQUFRLGVBQUMsbUNBQW1DLEFBQUMsQ0FBQyxBQUNyRCxPQUFPLENBQUUsSUFBSSxBQUNqQixDQUFDLEFBQ0QsS0FBSyxDQUFDLElBQUksQ0FBQyxRQUFRLGVBQUMsOEJBQThCLEFBQUMsQ0FBQyxBQUNoRCxPQUFPLENBQUUsSUFBSSxBQUNqQixDQUFDLEFBQ0QsT0FBTyxjQUFDLENBQUMsQUFDTCxjQUFjLENBQUUsTUFBTSxBQUMxQixDQUFDLEFBQ0QsS0FBSyxjQUFDLENBQUMsQUFDSCxNQUFNLENBQUUsSUFBSSxDQUNaLE9BQU8sQ0FBRSxHQUFHLENBQ1osUUFBUSxDQUFFLElBQUksQ0FDZCxRQUFRLENBQUUsUUFBUSxDQUNsQixPQUFPLENBQUUsQ0FBQyxDQUNWLE1BQU0sQ0FBRSxDQUFDLENBQ1QsTUFBTSxDQUFFLEdBQUcsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUN6QixNQUFNLENBQUUsS0FBSyxDQUNiLEtBQUssQ0FBRSxJQUFJLENBQ1gsZ0JBQWdCLENBQUUsS0FBSyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUMsQUFDaEQsQ0FBQyJ9 */";
    	append_dev(document.head, style);
    }

    function get_each_context$3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[25] = list[i];
    	return child_ctx;
    }

    // (72:4) {#if displayTitle}
    function create_if_block_4(ctx) {
    	let label;
    	let t_value = /*tree*/ ctx[2].name + "";
    	let t;
    	let label_class_value;

    	const block = {
    		c: function create() {
    			label = element("label");
    			t = text(t_value);
    			attr_dev(label, "for", /*path*/ ctx[0]);
    			attr_dev(label, "class", label_class_value = "" + (null_to_empty(/*labelClass*/ ctx[3]) + " svelte-m17ndh"));
    			add_location(label, file$7, 72, 8, 2663);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, label, anchor);
    			append_dev(label, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*tree*/ 4 && t_value !== (t_value = /*tree*/ ctx[2].name + "")) set_data_dev(t, t_value);

    			if (dirty & /*path*/ 1) {
    				attr_dev(label, "for", /*path*/ ctx[0]);
    			}

    			if (dirty & /*labelClass*/ 8 && label_class_value !== (label_class_value = "" + (null_to_empty(/*labelClass*/ ctx[3]) + " svelte-m17ndh"))) {
    				attr_dev(label, "class", label_class_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(label);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4.name,
    		type: "if",
    		source: "(72:4) {#if displayTitle}",
    		ctx
    	});

    	return block;
    }

    // (89:4) {:else}
    function create_else_block$5(ctx) {
    	let div0;
    	let input;
    	let t0;
    	let t1;
    	let div1;
    	let aside;
    	let ul;
    	let mounted;
    	let dispose;
    	let if_block0 = /*error*/ ctx[9] && create_if_block_3(ctx);

    	function select_block_type_1(ctx, dirty) {
    		if (/*searchTerm*/ ctx[8] && !/*loading*/ ctx[10] && /*$searchResults*/ ctx[12] && /*$searchResults*/ ctx[12].length == 0) return create_if_block_2$1;
    		return create_else_block_1$2;
    	}

    	let current_block_type = select_block_type_1(ctx);
    	let if_block1 = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			input = element("input");
    			t0 = space();
    			if (if_block0) if_block0.c();
    			t1 = space();
    			div1 = element("div");
    			aside = element("aside");
    			ul = element("ul");
    			if_block1.c();
    			attr_dev(input, "id", /*path*/ ctx[0]);
    			attr_dev(input, "type", "search");
    			attr_dev(input, "class", "input svelte-m17ndh");
    			attr_dev(input, "placeholder", "Type to search...");
    			attr_dev(input, "autocomplete", "off");
    			add_location(input, file$7, 90, 12, 3338);
    			attr_dev(div0, "class", "control has-icons-right");
    			toggle_class(div0, "is-loading", false);
    			add_location(div0, file$7, 89, 8, 3263);
    			attr_dev(ul, "class", "menu-list");
    			add_location(ul, file$7, 102, 16, 3774);
    			attr_dev(aside, "class", "box menu svelte-m17ndh");
    			toggle_class(aside, "is-hidden", !/*searchTerm*/ ctx[8] || /*error*/ ctx[9]);
    			add_location(aside, file$7, 101, 12, 3694);
    			attr_dev(div1, "class", "container");
    			add_location(div1, file$7, 100, 8, 3658);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			append_dev(div0, input);
    			set_input_value(input, /*searchTerm*/ ctx[8]);
    			append_dev(div0, t0);
    			if (if_block0) if_block0.m(div0, null);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div1, anchor);
    			append_dev(div1, aside);
    			append_dev(aside, ul);
    			if_block1.m(ul, null);

    			if (!mounted) {
    				dispose = listen_dev(input, "input", /*input_input_handler*/ ctx[18]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*path*/ 1) {
    				attr_dev(input, "id", /*path*/ ctx[0]);
    			}

    			if (dirty & /*searchTerm*/ 256) {
    				set_input_value(input, /*searchTerm*/ ctx[8]);
    			}

    			if (/*error*/ ctx[9]) {
    				if (if_block0) ; else {
    					if_block0 = create_if_block_3(ctx);
    					if_block0.c();
    					if_block0.m(div0, null);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (current_block_type === (current_block_type = select_block_type_1(ctx)) && if_block1) {
    				if_block1.p(ctx, dirty);
    			} else {
    				if_block1.d(1);
    				if_block1 = current_block_type(ctx);

    				if (if_block1) {
    					if_block1.c();
    					if_block1.m(ul, null);
    				}
    			}

    			if (dirty & /*searchTerm, error*/ 768) {
    				toggle_class(aside, "is-hidden", !/*searchTerm*/ ctx[8] || /*error*/ ctx[9]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (if_block0) if_block0.d();
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div1);
    			if_block1.d();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$5.name,
    		type: "else",
    		source: "(89:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (87:46) 
    function create_if_block_1$4(ctx) {
    	let p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "Please configure terminologyUrl and constraint in the settings.";
    			add_location(p, file$7, 87, 8, 3172);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$4.name,
    		type: "if",
    		source: "(87:46) ",
    		ctx
    	});

    	return block;
    }

    // (75:4) {#if $store[path + "|value"]}
    function create_if_block$5(ctx) {
    	let div;
    	let label;
    	let t0_value = /*$store*/ ctx[11][/*path*/ ctx[0] + "|value"] + "";
    	let t0;
    	let label_for_value;
    	let t1;
    	let button;
    	let button_id_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			label = element("label");
    			t0 = text(t0_value);
    			t1 = space();
    			button = element("button");
    			attr_dev(label, "class", "is-size-5");
    			attr_dev(label, "for", label_for_value = /*path*/ ctx[0] + ".delete");
    			add_location(label, file$7, 76, 12, 2806);
    			attr_dev(button, "class", "delete svelte-m17ndh");
    			attr_dev(button, "id", button_id_value = /*path*/ ctx[0] + "delete");
    			attr_dev(button, "type", "button");
    			add_location(button, file$7, 79, 12, 2930);
    			attr_dev(div, "class", "control");
    			add_location(div, file$7, 75, 8, 2772);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, label);
    			append_dev(label, t0);
    			append_dev(div, t1);
    			append_dev(div, button);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", prevent_default(/*deselect*/ ctx[15]), false, true, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$store, path*/ 2049 && t0_value !== (t0_value = /*$store*/ ctx[11][/*path*/ ctx[0] + "|value"] + "")) set_data_dev(t0, t0_value);

    			if (dirty & /*path*/ 1 && label_for_value !== (label_for_value = /*path*/ ctx[0] + ".delete")) {
    				attr_dev(label, "for", label_for_value);
    			}

    			if (dirty & /*path*/ 1 && button_id_value !== (button_id_value = /*path*/ ctx[0] + "delete")) {
    				attr_dev(button, "id", button_id_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$5.name,
    		type: "if",
    		source: "(75:4) {#if $store[path + \\\"|value\\\"]}",
    		ctx
    	});

    	return block;
    }

    // (99:12) {#if error}
    function create_if_block_3(ctx) {
    	let span;

    	const block = {
    		c: function create() {
    			span = element("span");
    			span.textContent = "⚠️";
    			attr_dev(span, "class", "icon is-right");
    			add_location(span, file$7, 98, 23, 3592);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(99:12) {#if error}",
    		ctx
    	});

    	return block;
    }

    // (110:20) {:else}
    function create_else_block_1$2(ctx) {
    	let each_1_anchor;
    	let each_value = /*$searchResults*/ ctx[12];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$3(get_each_context$3(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*loading, select, $searchResults*/ 70656) {
    				each_value = /*$searchResults*/ ctx[12];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$3(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$3(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_1$2.name,
    		type: "else",
    		source: "(110:20) {:else}",
    		ctx
    	});

    	return block;
    }

    // (104:20) {#if searchTerm && !loading && $searchResults && $searchResults.length == 0}
    function create_if_block_2$1(ctx) {
    	let li;
    	let a;

    	const block = {
    		c: function create() {
    			li = element("li");
    			a = element("a");
    			a.textContent = "No results found";
    			attr_dev(a, "href", "#/");
    			toggle_class(a, "has-text-grey", /*loading*/ ctx[10]);
    			add_location(a, file$7, 105, 28, 3951);
    			add_location(li, file$7, 104, 24, 3918);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, a);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*loading*/ 1024) {
    				toggle_class(a, "has-text-grey", /*loading*/ ctx[10]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$1.name,
    		type: "if",
    		source: "(104:20) {#if searchTerm && !loading && $searchResults && $searchResults.length == 0}",
    		ctx
    	});

    	return block;
    }

    // (111:24) {#each $searchResults as result}
    function create_each_block$3(ctx) {
    	let li;
    	let a;
    	let t0_value = /*result*/ ctx[25].display + "";
    	let t0;
    	let t1;
    	let mounted;
    	let dispose;

    	function click_handler(...args) {
    		return /*click_handler*/ ctx[19](/*result*/ ctx[25], ...args);
    	}

    	const block = {
    		c: function create() {
    			li = element("li");
    			a = element("a");
    			t0 = text(t0_value);
    			t1 = space();
    			attr_dev(a, "href", "#/");
    			toggle_class(a, "has-text-grey", /*loading*/ ctx[10]);
    			add_location(a, file$7, 112, 32, 4257);
    			add_location(li, file$7, 111, 28, 4220);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, a);
    			append_dev(a, t0);
    			append_dev(li, t1);

    			if (!mounted) {
    				dispose = listen_dev(a, "click", prevent_default(click_handler), false, true, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*$searchResults*/ 4096 && t0_value !== (t0_value = /*result*/ ctx[25].display + "")) set_data_dev(t0, t0_value);

    			if (dirty & /*loading*/ 1024) {
    				toggle_class(a, "has-text-grey", /*loading*/ ctx[10]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$3.name,
    		type: "each",
    		source: "(111:24) {#each $searchResults as result}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$7(ctx) {
    	let div;
    	let t;
    	let div_class_value;
    	let if_block0 = /*displayTitle*/ ctx[7] && create_if_block_4(ctx);

    	function select_block_type(ctx, dirty) {
    		if (/*$store*/ ctx[11][/*path*/ ctx[0] + "|value"]) return create_if_block$5;
    		if (!(/*terminologyUrl*/ ctx[6] && /*constraint*/ ctx[5])) return create_if_block_1$4;
    		return create_else_block$5;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block1 = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (if_block0) if_block0.c();
    			t = space();
    			if_block1.c();
    			attr_dev(div, "class", div_class_value = "" + (null_to_empty(/*wrapperClass*/ ctx[4]) + " svelte-m17ndh"));
    			add_location(div, file$7, 70, 0, 2605);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if (if_block0) if_block0.m(div, null);
    			append_dev(div, t);
    			if_block1.m(div, null);
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*displayTitle*/ ctx[7]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_4(ctx);
    					if_block0.c();
    					if_block0.m(div, t);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block1) {
    				if_block1.p(ctx, dirty);
    			} else {
    				if_block1.d(1);
    				if_block1 = current_block_type(ctx);

    				if (if_block1) {
    					if_block1.c();
    					if_block1.m(div, null);
    				}
    			}

    			if (dirty & /*wrapperClass*/ 16 && div_class_value !== (div_class_value = "" + (null_to_empty(/*wrapperClass*/ ctx[4]) + " svelte-m17ndh"))) {
    				attr_dev(div, "class", div_class_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (if_block0) if_block0.d();
    			if_block1.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let $searchTermRx;

    	let $store,
    		$$unsubscribe_store = noop,
    		$$subscribe_store = () => ($$unsubscribe_store(), $$unsubscribe_store = subscribe(store, $$value => $$invalidate(11, $store = $$value)), store);

    	let $searchResults;
    	$$self.$$.on_destroy.push(() => $$unsubscribe_store());
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Search", slots, []);

    	var __awaiter = this && this.__awaiter || function (thisArg, _arguments, P, generator) {
    		function adopt(value) {
    			return value instanceof P
    			? value
    			: new P(function (resolve) {
    						resolve(value);
    					});
    		}

    		return new (P || (P = Promise))(function (resolve, reject) {
    				function fulfilled(value) {
    					try {
    						step(generator.next(value));
    					} catch(e) {
    						reject(e);
    					}
    				}

    				function rejected(value) {
    					try {
    						step(generator["throw"](value));
    					} catch(e) {
    						reject(e);
    					}
    				}

    				function step(result) {
    					result.done
    					? resolve(result.value)
    					: adopt(result.value).then(fulfilled, rejected);
    				}

    				step((generator = generator.apply(thisArg, _arguments || [])).next());
    			});
    	};

    	
    	
    	let { path } = $$props;
    	let { store } = $$props;
    	validate_store(store, "store");
    	$$subscribe_store();
    	let { tree } = $$props;
    	let { labelClass } = $$props;
    	let { wrapperClass } = $$props;
    	let { searchFunction } = $$props;
    	let { constraint } = $$props;
    	let { terminologyUrl } = $$props;
    	let { displayTitle } = $$props;
    	let searchTerm = "";
    	let error = false;
    	let loading = false;
    	let searchResults = writable([]);
    	validate_store(searchResults, "searchResults");
    	component_subscribe($$self, searchResults, value => $$invalidate(12, $searchResults = value));
    	const searchTermSubject = new BehaviorSubject("");
    	let searchTermRx = searchTermSubject.pipe(debounceTime(150), startWith(""));
    	validate_store(searchTermRx, "searchTermRx");
    	component_subscribe($$self, searchTermRx, value => $$invalidate(20, $searchTermRx = value));

    	const handleSearch = ({ searchTerm, terminologyUrl, constraint, searchFunction, resultStore }) => __awaiter(void 0, void 0, void 0, function* () {
    		try {
    			$$invalidate(10, loading = true);
    			const results = yield searchFunction(searchTerm, constraint, terminologyUrl);

    			if (results) {
    				resultStore.set(results);
    			} else {
    				console.warn(`[${path}]: The searchFunction returned a falsy value.`);
    			}

    			$$invalidate(10, loading = false);
    			$$invalidate(9, error = false);
    		} catch(e) {
    			$$invalidate(9, error = true);
    			console.error(e);
    		}
    	});

    	const paths = [path + "|code", path + "|value", path + "|terminology"];

    	const deselect = () => {
    		destroyAction(paths, store);
    	};

    	const select = result => {
    		store.update(s => Object.assign(Object.assign({}, s), {
    			[path + "|code"]: result.code,
    			[path + "|value"]: result.value,
    			[path + "|terminology"]: "SNOMED-CT"
    		}));
    	};

    	triggerDestroy(paths, store);

    	const writable_props = [
    		"path",
    		"store",
    		"tree",
    		"labelClass",
    		"wrapperClass",
    		"searchFunction",
    		"constraint",
    		"terminologyUrl",
    		"displayTitle"
    	];

    	Object_1$3.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$2.warn(`<Search> was created with unknown prop '${key}'`);
    	});

    	function input_input_handler() {
    		searchTerm = this.value;
    		$$invalidate(8, searchTerm);
    	}

    	const click_handler = result => select(result);

    	$$self.$$set = $$props => {
    		if ("path" in $$props) $$invalidate(0, path = $$props.path);
    		if ("store" in $$props) $$subscribe_store($$invalidate(1, store = $$props.store));
    		if ("tree" in $$props) $$invalidate(2, tree = $$props.tree);
    		if ("labelClass" in $$props) $$invalidate(3, labelClass = $$props.labelClass);
    		if ("wrapperClass" in $$props) $$invalidate(4, wrapperClass = $$props.wrapperClass);
    		if ("searchFunction" in $$props) $$invalidate(17, searchFunction = $$props.searchFunction);
    		if ("constraint" in $$props) $$invalidate(5, constraint = $$props.constraint);
    		if ("terminologyUrl" in $$props) $$invalidate(6, terminologyUrl = $$props.terminologyUrl);
    		if ("displayTitle" in $$props) $$invalidate(7, displayTitle = $$props.displayTitle);
    	};

    	$$self.$capture_state = () => ({
    		__awaiter,
    		BehaviorSubject,
    		debounceTime,
    		startWith,
    		writable,
    		destroyAction,
    		triggerDestroy,
    		path,
    		store,
    		tree,
    		labelClass,
    		wrapperClass,
    		searchFunction,
    		constraint,
    		terminologyUrl,
    		displayTitle,
    		searchTerm,
    		error,
    		loading,
    		searchResults,
    		searchTermSubject,
    		searchTermRx,
    		handleSearch,
    		paths,
    		deselect,
    		select,
    		$searchTermRx,
    		$store,
    		$searchResults
    	});

    	$$self.$inject_state = $$props => {
    		if ("__awaiter" in $$props) __awaiter = $$props.__awaiter;
    		if ("path" in $$props) $$invalidate(0, path = $$props.path);
    		if ("store" in $$props) $$subscribe_store($$invalidate(1, store = $$props.store));
    		if ("tree" in $$props) $$invalidate(2, tree = $$props.tree);
    		if ("labelClass" in $$props) $$invalidate(3, labelClass = $$props.labelClass);
    		if ("wrapperClass" in $$props) $$invalidate(4, wrapperClass = $$props.wrapperClass);
    		if ("searchFunction" in $$props) $$invalidate(17, searchFunction = $$props.searchFunction);
    		if ("constraint" in $$props) $$invalidate(5, constraint = $$props.constraint);
    		if ("terminologyUrl" in $$props) $$invalidate(6, terminologyUrl = $$props.terminologyUrl);
    		if ("displayTitle" in $$props) $$invalidate(7, displayTitle = $$props.displayTitle);
    		if ("searchTerm" in $$props) $$invalidate(8, searchTerm = $$props.searchTerm);
    		if ("error" in $$props) $$invalidate(9, error = $$props.error);
    		if ("loading" in $$props) $$invalidate(10, loading = $$props.loading);
    		if ("searchResults" in $$props) $$invalidate(13, searchResults = $$props.searchResults);
    		if ("searchTermRx" in $$props) $$invalidate(14, searchTermRx = $$props.searchTermRx);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*searchTerm*/ 256) {
    			 {
    				searchTermSubject.next(searchTerm);
    			}
    		}

    		if ($$self.$$.dirty & /*$searchTermRx, terminologyUrl, constraint, searchFunction*/ 1179744) {
    			 {
    				handleSearch({
    					searchTerm: $searchTermRx,
    					terminologyUrl,
    					constraint,
    					searchFunction,
    					resultStore: searchResults
    				});
    			}
    		}
    	};

    	return [
    		path,
    		store,
    		tree,
    		labelClass,
    		wrapperClass,
    		constraint,
    		terminologyUrl,
    		displayTitle,
    		searchTerm,
    		error,
    		loading,
    		$store,
    		$searchResults,
    		searchResults,
    		searchTermRx,
    		deselect,
    		select,
    		searchFunction,
    		input_input_handler,
    		click_handler
    	];
    }

    class Search extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		if (!document.getElementById("svelte-m17ndh-style")) add_css();

    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {
    			path: 0,
    			store: 1,
    			tree: 2,
    			labelClass: 3,
    			wrapperClass: 4,
    			searchFunction: 17,
    			constraint: 5,
    			terminologyUrl: 6,
    			displayTitle: 7
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Search",
    			options,
    			id: create_fragment$7.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*path*/ ctx[0] === undefined && !("path" in props)) {
    			console_1$2.warn("<Search> was created without expected prop 'path'");
    		}

    		if (/*store*/ ctx[1] === undefined && !("store" in props)) {
    			console_1$2.warn("<Search> was created without expected prop 'store'");
    		}

    		if (/*tree*/ ctx[2] === undefined && !("tree" in props)) {
    			console_1$2.warn("<Search> was created without expected prop 'tree'");
    		}

    		if (/*labelClass*/ ctx[3] === undefined && !("labelClass" in props)) {
    			console_1$2.warn("<Search> was created without expected prop 'labelClass'");
    		}

    		if (/*wrapperClass*/ ctx[4] === undefined && !("wrapperClass" in props)) {
    			console_1$2.warn("<Search> was created without expected prop 'wrapperClass'");
    		}

    		if (/*searchFunction*/ ctx[17] === undefined && !("searchFunction" in props)) {
    			console_1$2.warn("<Search> was created without expected prop 'searchFunction'");
    		}

    		if (/*constraint*/ ctx[5] === undefined && !("constraint" in props)) {
    			console_1$2.warn("<Search> was created without expected prop 'constraint'");
    		}

    		if (/*terminologyUrl*/ ctx[6] === undefined && !("terminologyUrl" in props)) {
    			console_1$2.warn("<Search> was created without expected prop 'terminologyUrl'");
    		}

    		if (/*displayTitle*/ ctx[7] === undefined && !("displayTitle" in props)) {
    			console_1$2.warn("<Search> was created without expected prop 'displayTitle'");
    		}
    	}

    	get path() {
    		throw new Error("<Search>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set path(value) {
    		throw new Error("<Search>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get store() {
    		throw new Error("<Search>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set store(value) {
    		throw new Error("<Search>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get tree() {
    		throw new Error("<Search>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set tree(value) {
    		throw new Error("<Search>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get labelClass() {
    		throw new Error("<Search>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set labelClass(value) {
    		throw new Error("<Search>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get wrapperClass() {
    		throw new Error("<Search>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set wrapperClass(value) {
    		throw new Error("<Search>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get searchFunction() {
    		throw new Error("<Search>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set searchFunction(value) {
    		throw new Error("<Search>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get constraint() {
    		throw new Error("<Search>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set constraint(value) {
    		throw new Error("<Search>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get terminologyUrl() {
    		throw new Error("<Search>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set terminologyUrl(value) {
    		throw new Error("<Search>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get displayTitle() {
    		throw new Error("<Search>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set displayTitle(value) {
    		throw new Error("<Search>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\rm\CodedText\CodedTextWrite.svelte generated by Svelte v3.29.4 */

    // (21:0) {:else}
    function create_else_block$6(ctx) {
    	let search_1;
    	let current;

    	search_1 = new Search({
    			props: {
    				path: /*path*/ ctx[0],
    				store: /*store*/ ctx[1],
    				tree: /*tree*/ ctx[2],
    				labelClass: /*labelClass*/ ctx[5],
    				wrapperClass: /*wrapperClass*/ ctx[4],
    				displayTitle: /*displayTitle*/ ctx[3],
    				terminologyUrl: /*terminologyUrl*/ ctx[8],
    				searchFunction: /*searchFunction*/ ctx[9],
    				constraint: /*constraint*/ ctx[10]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(search_1.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(search_1, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const search_1_changes = {};
    			if (dirty & /*path*/ 1) search_1_changes.path = /*path*/ ctx[0];
    			if (dirty & /*store*/ 2) search_1_changes.store = /*store*/ ctx[1];
    			if (dirty & /*tree*/ 4) search_1_changes.tree = /*tree*/ ctx[2];
    			if (dirty & /*labelClass*/ 32) search_1_changes.labelClass = /*labelClass*/ ctx[5];
    			if (dirty & /*wrapperClass*/ 16) search_1_changes.wrapperClass = /*wrapperClass*/ ctx[4];
    			if (dirty & /*displayTitle*/ 8) search_1_changes.displayTitle = /*displayTitle*/ ctx[3];
    			if (dirty & /*terminologyUrl*/ 256) search_1_changes.terminologyUrl = /*terminologyUrl*/ ctx[8];
    			if (dirty & /*searchFunction*/ 512) search_1_changes.searchFunction = /*searchFunction*/ ctx[9];
    			if (dirty & /*constraint*/ 1024) search_1_changes.constraint = /*constraint*/ ctx[10];
    			search_1.$set(search_1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(search_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(search_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(search_1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$6.name,
    		type: "else",
    		source: "(21:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (19:0) {#if !search}
    function create_if_block$6(ctx) {
    	let dropdown;
    	let current;

    	dropdown = new DropDown({
    			props: {
    				path: /*path*/ ctx[0],
    				store: /*store*/ ctx[1],
    				tree: /*tree*/ ctx[2],
    				selectWrapperClass: /*selectWrapperClass*/ ctx[6],
    				labelClass: /*labelClass*/ ctx[5],
    				wrapperClass: /*wrapperClass*/ ctx[4],
    				displayTitle: /*displayTitle*/ ctx[3]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(dropdown.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(dropdown, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const dropdown_changes = {};
    			if (dirty & /*path*/ 1) dropdown_changes.path = /*path*/ ctx[0];
    			if (dirty & /*store*/ 2) dropdown_changes.store = /*store*/ ctx[1];
    			if (dirty & /*tree*/ 4) dropdown_changes.tree = /*tree*/ ctx[2];
    			if (dirty & /*selectWrapperClass*/ 64) dropdown_changes.selectWrapperClass = /*selectWrapperClass*/ ctx[6];
    			if (dirty & /*labelClass*/ 32) dropdown_changes.labelClass = /*labelClass*/ ctx[5];
    			if (dirty & /*wrapperClass*/ 16) dropdown_changes.wrapperClass = /*wrapperClass*/ ctx[4];
    			if (dirty & /*displayTitle*/ 8) dropdown_changes.displayTitle = /*displayTitle*/ ctx[3];
    			dropdown.$set(dropdown_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(dropdown.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(dropdown.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(dropdown, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$6.name,
    		type: "if",
    		source: "(19:0) {#if !search}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$8(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block$6, create_else_block$6];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (!/*search*/ ctx[7]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("CodedTextWrite", slots, []);
    	
    	
    	let { path } = $$props;
    	let { store } = $$props;
    	let { tree } = $$props;
    	let { displayTitle = true } = $$props;
    	let { wrapperClass = "field" } = $$props;
    	let { labelClass = "label" } = $$props;
    	let { selectWrapperClass = "select" } = $$props;
    	let { search = false } = $$props;
    	let { terminologyUrl = undefined } = $$props;
    	let { searchFunction = hermesSearch } = $$props;
    	let { constraint = undefined } = $$props;

    	const writable_props = [
    		"path",
    		"store",
    		"tree",
    		"displayTitle",
    		"wrapperClass",
    		"labelClass",
    		"selectWrapperClass",
    		"search",
    		"terminologyUrl",
    		"searchFunction",
    		"constraint"
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<CodedTextWrite> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("path" in $$props) $$invalidate(0, path = $$props.path);
    		if ("store" in $$props) $$invalidate(1, store = $$props.store);
    		if ("tree" in $$props) $$invalidate(2, tree = $$props.tree);
    		if ("displayTitle" in $$props) $$invalidate(3, displayTitle = $$props.displayTitle);
    		if ("wrapperClass" in $$props) $$invalidate(4, wrapperClass = $$props.wrapperClass);
    		if ("labelClass" in $$props) $$invalidate(5, labelClass = $$props.labelClass);
    		if ("selectWrapperClass" in $$props) $$invalidate(6, selectWrapperClass = $$props.selectWrapperClass);
    		if ("search" in $$props) $$invalidate(7, search = $$props.search);
    		if ("terminologyUrl" in $$props) $$invalidate(8, terminologyUrl = $$props.terminologyUrl);
    		if ("searchFunction" in $$props) $$invalidate(9, searchFunction = $$props.searchFunction);
    		if ("constraint" in $$props) $$invalidate(10, constraint = $$props.constraint);
    	};

    	$$self.$capture_state = () => ({
    		hermesSearch,
    		DropDown,
    		Search,
    		path,
    		store,
    		tree,
    		displayTitle,
    		wrapperClass,
    		labelClass,
    		selectWrapperClass,
    		search,
    		terminologyUrl,
    		searchFunction,
    		constraint
    	});

    	$$self.$inject_state = $$props => {
    		if ("path" in $$props) $$invalidate(0, path = $$props.path);
    		if ("store" in $$props) $$invalidate(1, store = $$props.store);
    		if ("tree" in $$props) $$invalidate(2, tree = $$props.tree);
    		if ("displayTitle" in $$props) $$invalidate(3, displayTitle = $$props.displayTitle);
    		if ("wrapperClass" in $$props) $$invalidate(4, wrapperClass = $$props.wrapperClass);
    		if ("labelClass" in $$props) $$invalidate(5, labelClass = $$props.labelClass);
    		if ("selectWrapperClass" in $$props) $$invalidate(6, selectWrapperClass = $$props.selectWrapperClass);
    		if ("search" in $$props) $$invalidate(7, search = $$props.search);
    		if ("terminologyUrl" in $$props) $$invalidate(8, terminologyUrl = $$props.terminologyUrl);
    		if ("searchFunction" in $$props) $$invalidate(9, searchFunction = $$props.searchFunction);
    		if ("constraint" in $$props) $$invalidate(10, constraint = $$props.constraint);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		path,
    		store,
    		tree,
    		displayTitle,
    		wrapperClass,
    		labelClass,
    		selectWrapperClass,
    		search,
    		terminologyUrl,
    		searchFunction,
    		constraint
    	];
    }

    class CodedTextWrite extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$8, create_fragment$8, safe_not_equal, {
    			path: 0,
    			store: 1,
    			tree: 2,
    			displayTitle: 3,
    			wrapperClass: 4,
    			labelClass: 5,
    			selectWrapperClass: 6,
    			search: 7,
    			terminologyUrl: 8,
    			searchFunction: 9,
    			constraint: 10
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "CodedTextWrite",
    			options,
    			id: create_fragment$8.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*path*/ ctx[0] === undefined && !("path" in props)) {
    			console.warn("<CodedTextWrite> was created without expected prop 'path'");
    		}

    		if (/*store*/ ctx[1] === undefined && !("store" in props)) {
    			console.warn("<CodedTextWrite> was created without expected prop 'store'");
    		}

    		if (/*tree*/ ctx[2] === undefined && !("tree" in props)) {
    			console.warn("<CodedTextWrite> was created without expected prop 'tree'");
    		}
    	}

    	get path() {
    		throw new Error("<CodedTextWrite>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set path(value) {
    		throw new Error("<CodedTextWrite>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get store() {
    		throw new Error("<CodedTextWrite>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set store(value) {
    		throw new Error("<CodedTextWrite>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get tree() {
    		throw new Error("<CodedTextWrite>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set tree(value) {
    		throw new Error("<CodedTextWrite>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get displayTitle() {
    		throw new Error("<CodedTextWrite>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set displayTitle(value) {
    		throw new Error("<CodedTextWrite>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get wrapperClass() {
    		throw new Error("<CodedTextWrite>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set wrapperClass(value) {
    		throw new Error("<CodedTextWrite>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get labelClass() {
    		throw new Error("<CodedTextWrite>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set labelClass(value) {
    		throw new Error("<CodedTextWrite>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get selectWrapperClass() {
    		throw new Error("<CodedTextWrite>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set selectWrapperClass(value) {
    		throw new Error("<CodedTextWrite>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get search() {
    		throw new Error("<CodedTextWrite>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set search(value) {
    		throw new Error("<CodedTextWrite>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get terminologyUrl() {
    		throw new Error("<CodedTextWrite>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set terminologyUrl(value) {
    		throw new Error("<CodedTextWrite>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get searchFunction() {
    		throw new Error("<CodedTextWrite>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set searchFunction(value) {
    		throw new Error("<CodedTextWrite>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get constraint() {
    		throw new Error("<CodedTextWrite>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set constraint(value) {
    		throw new Error("<CodedTextWrite>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\rm\CodedText\CodedTextRead.svelte generated by Svelte v3.29.4 */
    const file$8 = "src\\rm\\CodedText\\CodedTextRead.svelte";

    // (22:4) {#if displayTitle}
    function create_if_block_1$5(ctx) {
    	let p;
    	let t_value = /*tree*/ ctx[1].name + "";
    	let t;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t = text(t_value);
    			attr_dev(p, "class", /*labelClass*/ ctx[3]);
    			add_location(p, file$8, 22, 8, 653);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*tree*/ 2 && t_value !== (t_value = /*tree*/ ctx[1].name + "")) set_data_dev(t, t_value);

    			if (dirty & /*labelClass*/ 8) {
    				attr_dev(p, "class", /*labelClass*/ ctx[3]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$5.name,
    		type: "if",
    		source: "(22:4) {#if displayTitle}",
    		ctx
    	});

    	return block;
    }

    // (28:8) {:else}
    function create_else_block$7(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("-");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$7.name,
    		type: "else",
    		source: "(28:8) {:else}",
    		ctx
    	});

    	return block;
    }

    // (26:8) {#if $store[valuePath]}
    function create_if_block$7(ctx) {
    	let t_value = /*$store*/ ctx[7][/*valuePath*/ ctx[6]] + "";
    	let t;

    	const block = {
    		c: function create() {
    			t = text(t_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$store, valuePath*/ 192 && t_value !== (t_value = /*$store*/ ctx[7][/*valuePath*/ ctx[6]] + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$7.name,
    		type: "if",
    		source: "(26:8) {#if $store[valuePath]}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$9(ctx) {
    	let div;
    	let t;
    	let p;
    	let if_block0 = /*displayTitle*/ ctx[5] && create_if_block_1$5(ctx);

    	function select_block_type(ctx, dirty) {
    		if (/*$store*/ ctx[7][/*valuePath*/ ctx[6]]) return create_if_block$7;
    		return create_else_block$7;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block1 = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (if_block0) if_block0.c();
    			t = space();
    			p = element("p");
    			if_block1.c();
    			attr_dev(p, "class", /*valueClass*/ ctx[4]);
    			add_location(p, file$8, 24, 4, 707);
    			attr_dev(div, "class", /*wrapperClass*/ ctx[2]);
    			add_location(div, file$8, 20, 0, 593);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if (if_block0) if_block0.m(div, null);
    			append_dev(div, t);
    			append_dev(div, p);
    			if_block1.m(p, null);
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*displayTitle*/ ctx[5]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_1$5(ctx);
    					if_block0.c();
    					if_block0.m(div, t);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block1) {
    				if_block1.p(ctx, dirty);
    			} else {
    				if_block1.d(1);
    				if_block1 = current_block_type(ctx);

    				if (if_block1) {
    					if_block1.c();
    					if_block1.m(p, null);
    				}
    			}

    			if (dirty & /*valueClass*/ 16) {
    				attr_dev(p, "class", /*valueClass*/ ctx[4]);
    			}

    			if (dirty & /*wrapperClass*/ 4) {
    				attr_dev(div, "class", /*wrapperClass*/ ctx[2]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (if_block0) if_block0.d();
    			if_block1.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props, $$invalidate) {
    	let $store,
    		$$unsubscribe_store = noop,
    		$$subscribe_store = () => ($$unsubscribe_store(), $$unsubscribe_store = subscribe(store, $$value => $$invalidate(7, $store = $$value)), store);

    	$$self.$$.on_destroy.push(() => $$unsubscribe_store());
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("CodedTextRead", slots, []);
    	
    	let { path } = $$props;
    	let { store } = $$props;
    	validate_store(store, "store");
    	$$subscribe_store();
    	let { tree } = $$props;
    	let { wrapperClass = "field" } = $$props;
    	let { labelClass = "is-6 has-text-grey has-text-weight-semibold" } = $$props;
    	let { valueClass = "subtitle is-5" } = $$props;
    	let { displayTitle = true } = $$props;
    	let terminologyPath;
    	let codePath;
    	let valuePath;

    	const writable_props = [
    		"path",
    		"store",
    		"tree",
    		"wrapperClass",
    		"labelClass",
    		"valueClass",
    		"displayTitle"
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<CodedTextRead> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("path" in $$props) $$invalidate(8, path = $$props.path);
    		if ("store" in $$props) $$subscribe_store($$invalidate(0, store = $$props.store));
    		if ("tree" in $$props) $$invalidate(1, tree = $$props.tree);
    		if ("wrapperClass" in $$props) $$invalidate(2, wrapperClass = $$props.wrapperClass);
    		if ("labelClass" in $$props) $$invalidate(3, labelClass = $$props.labelClass);
    		if ("valueClass" in $$props) $$invalidate(4, valueClass = $$props.valueClass);
    		if ("displayTitle" in $$props) $$invalidate(5, displayTitle = $$props.displayTitle);
    	};

    	$$self.$capture_state = () => ({
    		getLabel,
    		path,
    		store,
    		tree,
    		wrapperClass,
    		labelClass,
    		valueClass,
    		displayTitle,
    		terminologyPath,
    		codePath,
    		valuePath,
    		$store
    	});

    	$$self.$inject_state = $$props => {
    		if ("path" in $$props) $$invalidate(8, path = $$props.path);
    		if ("store" in $$props) $$subscribe_store($$invalidate(0, store = $$props.store));
    		if ("tree" in $$props) $$invalidate(1, tree = $$props.tree);
    		if ("wrapperClass" in $$props) $$invalidate(2, wrapperClass = $$props.wrapperClass);
    		if ("labelClass" in $$props) $$invalidate(3, labelClass = $$props.labelClass);
    		if ("valueClass" in $$props) $$invalidate(4, valueClass = $$props.valueClass);
    		if ("displayTitle" in $$props) $$invalidate(5, displayTitle = $$props.displayTitle);
    		if ("terminologyPath" in $$props) terminologyPath = $$props.terminologyPath;
    		if ("codePath" in $$props) codePath = $$props.codePath;
    		if ("valuePath" in $$props) $$invalidate(6, valuePath = $$props.valuePath);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*path*/ 256) {
    			 terminologyPath = path + "terminology";
    		}

    		if ($$self.$$.dirty & /*path*/ 256) {
    			 codePath = path + "|code";
    		}

    		if ($$self.$$.dirty & /*path*/ 256) {
    			 $$invalidate(6, valuePath = path + "|value");
    		}
    	};

    	return [
    		store,
    		tree,
    		wrapperClass,
    		labelClass,
    		valueClass,
    		displayTitle,
    		valuePath,
    		$store,
    		path
    	];
    }

    class CodedTextRead extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$9, create_fragment$9, safe_not_equal, {
    			path: 8,
    			store: 0,
    			tree: 1,
    			wrapperClass: 2,
    			labelClass: 3,
    			valueClass: 4,
    			displayTitle: 5
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "CodedTextRead",
    			options,
    			id: create_fragment$9.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*path*/ ctx[8] === undefined && !("path" in props)) {
    			console.warn("<CodedTextRead> was created without expected prop 'path'");
    		}

    		if (/*store*/ ctx[0] === undefined && !("store" in props)) {
    			console.warn("<CodedTextRead> was created without expected prop 'store'");
    		}

    		if (/*tree*/ ctx[1] === undefined && !("tree" in props)) {
    			console.warn("<CodedTextRead> was created without expected prop 'tree'");
    		}
    	}

    	get path() {
    		throw new Error("<CodedTextRead>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set path(value) {
    		throw new Error("<CodedTextRead>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get store() {
    		throw new Error("<CodedTextRead>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set store(value) {
    		throw new Error("<CodedTextRead>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get tree() {
    		throw new Error("<CodedTextRead>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set tree(value) {
    		throw new Error("<CodedTextRead>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get wrapperClass() {
    		throw new Error("<CodedTextRead>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set wrapperClass(value) {
    		throw new Error("<CodedTextRead>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get labelClass() {
    		throw new Error("<CodedTextRead>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set labelClass(value) {
    		throw new Error("<CodedTextRead>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get valueClass() {
    		throw new Error("<CodedTextRead>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set valueClass(value) {
    		throw new Error("<CodedTextRead>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get displayTitle() {
    		throw new Error("<CodedTextRead>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set displayTitle(value) {
    		throw new Error("<CodedTextRead>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\rm\Text\TextWrite.svelte generated by Svelte v3.29.4 */
    const file$9 = "src\\rm\\Text\\TextWrite.svelte";

    function create_fragment$a(ctx) {
    	let div;
    	let label;
    	let t0_value = /*tree*/ ctx[1].name + "";
    	let t0;
    	let t1;
    	let textarea;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			label = element("label");
    			t0 = text(t0_value);
    			t1 = space();
    			textarea = element("textarea");
    			attr_dev(label, "for", /*path*/ ctx[0]);
    			attr_dev(label, "class", /*labelClass*/ ctx[4]);
    			add_location(label, file$9, 12, 4, 354);
    			attr_dev(textarea, "type", "text");
    			attr_dev(textarea, "id", /*path*/ ctx[0]);
    			attr_dev(textarea, "class", /*textAreaClass*/ ctx[5]);
    			add_location(textarea, file$9, 13, 4, 416);
    			attr_dev(div, "class", /*wrapperClass*/ ctx[3]);
    			add_location(div, file$9, 11, 0, 322);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, label);
    			append_dev(label, t0);
    			append_dev(div, t1);
    			append_dev(div, textarea);
    			set_input_value(textarea, /*$store*/ ctx[6][/*path*/ ctx[0]]);

    			if (!mounted) {
    				dispose = listen_dev(textarea, "input", /*textarea_input_handler*/ ctx[7]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*tree*/ 2 && t0_value !== (t0_value = /*tree*/ ctx[1].name + "")) set_data_dev(t0, t0_value);

    			if (dirty & /*path*/ 1) {
    				attr_dev(label, "for", /*path*/ ctx[0]);
    			}

    			if (dirty & /*labelClass*/ 16) {
    				attr_dev(label, "class", /*labelClass*/ ctx[4]);
    			}

    			if (dirty & /*path*/ 1) {
    				attr_dev(textarea, "id", /*path*/ ctx[0]);
    			}

    			if (dirty & /*textAreaClass*/ 32) {
    				attr_dev(textarea, "class", /*textAreaClass*/ ctx[5]);
    			}

    			if (dirty & /*$store, path*/ 65) {
    				set_input_value(textarea, /*$store*/ ctx[6][/*path*/ ctx[0]]);
    			}

    			if (dirty & /*wrapperClass*/ 8) {
    				attr_dev(div, "class", /*wrapperClass*/ ctx[3]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$a($$self, $$props, $$invalidate) {
    	let $store,
    		$$unsubscribe_store = noop,
    		$$subscribe_store = () => ($$unsubscribe_store(), $$unsubscribe_store = subscribe(store, $$value => $$invalidate(6, $store = $$value)), store);

    	$$self.$$.on_destroy.push(() => $$unsubscribe_store());
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("TextWrite", slots, []);
    	
    	let { path } = $$props;
    	let { tree } = $$props;
    	let { store } = $$props;
    	validate_store(store, "store");
    	$$subscribe_store();
    	let { wrapperClass = "field" } = $$props;
    	let { labelClass = "label" } = $$props;
    	let { textAreaClass = "textarea" } = $$props;
    	const writable_props = ["path", "tree", "store", "wrapperClass", "labelClass", "textAreaClass"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<TextWrite> was created with unknown prop '${key}'`);
    	});

    	function textarea_input_handler() {
    		$store[path] = this.value;
    		store.set($store);
    		$$invalidate(0, path);
    	}

    	$$self.$$set = $$props => {
    		if ("path" in $$props) $$invalidate(0, path = $$props.path);
    		if ("tree" in $$props) $$invalidate(1, tree = $$props.tree);
    		if ("store" in $$props) $$subscribe_store($$invalidate(2, store = $$props.store));
    		if ("wrapperClass" in $$props) $$invalidate(3, wrapperClass = $$props.wrapperClass);
    		if ("labelClass" in $$props) $$invalidate(4, labelClass = $$props.labelClass);
    		if ("textAreaClass" in $$props) $$invalidate(5, textAreaClass = $$props.textAreaClass);
    	};

    	$$self.$capture_state = () => ({
    		triggerDestroy,
    		path,
    		tree,
    		store,
    		wrapperClass,
    		labelClass,
    		textAreaClass,
    		$store
    	});

    	$$self.$inject_state = $$props => {
    		if ("path" in $$props) $$invalidate(0, path = $$props.path);
    		if ("tree" in $$props) $$invalidate(1, tree = $$props.tree);
    		if ("store" in $$props) $$subscribe_store($$invalidate(2, store = $$props.store));
    		if ("wrapperClass" in $$props) $$invalidate(3, wrapperClass = $$props.wrapperClass);
    		if ("labelClass" in $$props) $$invalidate(4, labelClass = $$props.labelClass);
    		if ("textAreaClass" in $$props) $$invalidate(5, textAreaClass = $$props.textAreaClass);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*path, store*/ 5) {
    			 triggerDestroy([path], store);
    		}
    	};

    	return [
    		path,
    		tree,
    		store,
    		wrapperClass,
    		labelClass,
    		textAreaClass,
    		$store,
    		textarea_input_handler
    	];
    }

    class TextWrite extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$a, create_fragment$a, safe_not_equal, {
    			path: 0,
    			tree: 1,
    			store: 2,
    			wrapperClass: 3,
    			labelClass: 4,
    			textAreaClass: 5
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "TextWrite",
    			options,
    			id: create_fragment$a.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*path*/ ctx[0] === undefined && !("path" in props)) {
    			console.warn("<TextWrite> was created without expected prop 'path'");
    		}

    		if (/*tree*/ ctx[1] === undefined && !("tree" in props)) {
    			console.warn("<TextWrite> was created without expected prop 'tree'");
    		}

    		if (/*store*/ ctx[2] === undefined && !("store" in props)) {
    			console.warn("<TextWrite> was created without expected prop 'store'");
    		}
    	}

    	get path() {
    		throw new Error("<TextWrite>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set path(value) {
    		throw new Error("<TextWrite>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get tree() {
    		throw new Error("<TextWrite>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set tree(value) {
    		throw new Error("<TextWrite>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get store() {
    		throw new Error("<TextWrite>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set store(value) {
    		throw new Error("<TextWrite>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get wrapperClass() {
    		throw new Error("<TextWrite>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set wrapperClass(value) {
    		throw new Error("<TextWrite>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get labelClass() {
    		throw new Error("<TextWrite>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set labelClass(value) {
    		throw new Error("<TextWrite>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get textAreaClass() {
    		throw new Error("<TextWrite>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set textAreaClass(value) {
    		throw new Error("<TextWrite>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\rm\Count\CountWrite.svelte generated by Svelte v3.29.4 */

    const { Object: Object_1$4 } = globals;
    const file$a = "src\\rm\\Count\\CountWrite.svelte";

    function create_fragment$b(ctx) {
    	let div;
    	let label;
    	let t0_value = /*tree*/ ctx[2].name + "";
    	let t0;
    	let t1;
    	let input;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			label = element("label");
    			t0 = text(t0_value);
    			t1 = space();
    			input = element("input");
    			attr_dev(label, "for", /*path*/ ctx[0]);
    			attr_dev(label, "class", "label");
    			add_location(label, file$a, 22, 4, 795);
    			attr_dev(input, "type", "number");
    			attr_dev(input, "id", /*path*/ ctx[0]);
    			attr_dev(input, "class", "input");
    			add_location(input, file$a, 23, 4, 852);
    			attr_dev(div, "class", "field");
    			add_location(div, file$a, 21, 0, 770);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, label);
    			append_dev(label, t0);
    			append_dev(div, t1);
    			append_dev(div, input);
    			set_input_value(input, /*$store*/ ctx[3][/*path*/ ctx[0]]);

    			if (!mounted) {
    				dispose = listen_dev(input, "input", /*input_input_handler*/ ctx[5]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*tree*/ 4 && t0_value !== (t0_value = /*tree*/ ctx[2].name + "")) set_data_dev(t0, t0_value);

    			if (dirty & /*path*/ 1) {
    				attr_dev(label, "for", /*path*/ ctx[0]);
    			}

    			if (dirty & /*path*/ 1) {
    				attr_dev(input, "id", /*path*/ ctx[0]);
    			}

    			if (dirty & /*$store, path*/ 9 && to_number(input.value) !== /*$store*/ ctx[3][/*path*/ ctx[0]]) {
    				set_input_value(input, /*$store*/ ctx[3][/*path*/ ctx[0]]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$b.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$b($$self, $$props, $$invalidate) {
    	let $store,
    		$$unsubscribe_store = noop,
    		$$subscribe_store = () => ($$unsubscribe_store(), $$unsubscribe_store = subscribe(store, $$value => $$invalidate(3, $store = $$value)), store);

    	$$self.$$.on_destroy.push(() => $$unsubscribe_store());
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("CountWrite", slots, []);
    	
    	let { path } = $$props;
    	let { store } = $$props;
    	validate_store(store, "store");
    	$$subscribe_store();
    	let { tree } = $$props;
    	let { computeFunction = undefined } = $$props;
    	const writable_props = ["path", "store", "tree", "computeFunction"];

    	Object_1$4.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<CountWrite> was created with unknown prop '${key}'`);
    	});

    	function input_input_handler() {
    		$store[path] = to_number(this.value);
    		store.set($store);
    		$$invalidate(0, path);
    	}

    	$$self.$$set = $$props => {
    		if ("path" in $$props) $$invalidate(0, path = $$props.path);
    		if ("store" in $$props) $$subscribe_store($$invalidate(1, store = $$props.store));
    		if ("tree" in $$props) $$invalidate(2, tree = $$props.tree);
    		if ("computeFunction" in $$props) $$invalidate(4, computeFunction = $$props.computeFunction);
    	};

    	$$self.$capture_state = () => ({
    		destroyAction,
    		sanitizeComputeFunction,
    		triggerDestroy,
    		path,
    		store,
    		tree,
    		computeFunction,
    		$store
    	});

    	$$self.$inject_state = $$props => {
    		if ("path" in $$props) $$invalidate(0, path = $$props.path);
    		if ("store" in $$props) $$subscribe_store($$invalidate(1, store = $$props.store));
    		if ("tree" in $$props) $$invalidate(2, tree = $$props.tree);
    		if ("computeFunction" in $$props) $$invalidate(4, computeFunction = $$props.computeFunction);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*computeFunction, path, $store, store*/ 27) {
    			 if (computeFunction) {
    				let result = sanitizeComputeFunction(path, computeFunction, $store, "number");

    				if (result && result !== $store[path]) {
    					store.update(s => Object.assign(Object.assign({}, s), { [path]: result }));
    				}
    			}
    		}

    		if ($$self.$$.dirty & /*$store, path, store*/ 11) {
    			 if ($store[path] == null) {
    				destroyAction([path], store);
    			}
    		}

    		if ($$self.$$.dirty & /*path, store*/ 3) {
    			 triggerDestroy([path], store);
    		}
    	};

    	return [path, store, tree, $store, computeFunction, input_input_handler];
    }

    class CountWrite extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$b, create_fragment$b, safe_not_equal, {
    			path: 0,
    			store: 1,
    			tree: 2,
    			computeFunction: 4
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "CountWrite",
    			options,
    			id: create_fragment$b.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*path*/ ctx[0] === undefined && !("path" in props)) {
    			console.warn("<CountWrite> was created without expected prop 'path'");
    		}

    		if (/*store*/ ctx[1] === undefined && !("store" in props)) {
    			console.warn("<CountWrite> was created without expected prop 'store'");
    		}

    		if (/*tree*/ ctx[2] === undefined && !("tree" in props)) {
    			console.warn("<CountWrite> was created without expected prop 'tree'");
    		}
    	}

    	get path() {
    		throw new Error("<CountWrite>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set path(value) {
    		throw new Error("<CountWrite>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get store() {
    		throw new Error("<CountWrite>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set store(value) {
    		throw new Error("<CountWrite>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get tree() {
    		throw new Error("<CountWrite>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set tree(value) {
    		throw new Error("<CountWrite>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get computeFunction() {
    		throw new Error("<CountWrite>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set computeFunction(value) {
    		throw new Error("<CountWrite>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\rm\Count\CountRead.svelte generated by Svelte v3.29.4 */

    const file$b = "src\\rm\\Count\\CountRead.svelte";

    // (12:8) {:else}
    function create_else_block$8(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("-");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$8.name,
    		type: "else",
    		source: "(12:8) {:else}",
    		ctx
    	});

    	return block;
    }

    // (10:8) {#if $store[path]}
    function create_if_block$8(ctx) {
    	let t_value = /*$store*/ ctx[3][/*path*/ ctx[0]] + "";
    	let t;

    	const block = {
    		c: function create() {
    			t = text(t_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$store, path*/ 9 && t_value !== (t_value = /*$store*/ ctx[3][/*path*/ ctx[0]] + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$8.name,
    		type: "if",
    		source: "(10:8) {#if $store[path]}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$c(ctx) {
    	let div;
    	let p0;
    	let t0_value = /*tree*/ ctx[2].name + "";
    	let t0;
    	let t1;
    	let p1;

    	function select_block_type(ctx, dirty) {
    		if (/*$store*/ ctx[3][/*path*/ ctx[0]]) return create_if_block$8;
    		return create_else_block$8;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			p0 = element("p");
    			t0 = text(t0_value);
    			t1 = space();
    			p1 = element("p");
    			if_block.c();
    			attr_dev(p0, "class", "is-6 has-text-grey has-text-weight-semibold");
    			add_location(p0, file$b, 7, 4, 158);
    			attr_dev(p1, "class", "subtitle is-5");
    			add_location(p1, file$b, 8, 4, 234);
    			attr_dev(div, "class", "field");
    			add_location(div, file$b, 6, 0, 133);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, p0);
    			append_dev(p0, t0);
    			append_dev(div, t1);
    			append_dev(div, p1);
    			if_block.m(p1, null);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*tree*/ 4 && t0_value !== (t0_value = /*tree*/ ctx[2].name + "")) set_data_dev(t0, t0_value);

    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(p1, null);
    				}
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$c.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$c($$self, $$props, $$invalidate) {
    	let $store,
    		$$unsubscribe_store = noop,
    		$$subscribe_store = () => ($$unsubscribe_store(), $$unsubscribe_store = subscribe(store, $$value => $$invalidate(3, $store = $$value)), store);

    	$$self.$$.on_destroy.push(() => $$unsubscribe_store());
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("CountRead", slots, []);
    	
    	let { path } = $$props;
    	let { store } = $$props;
    	validate_store(store, "store");
    	$$subscribe_store();
    	let { tree } = $$props;
    	const writable_props = ["path", "store", "tree"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<CountRead> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("path" in $$props) $$invalidate(0, path = $$props.path);
    		if ("store" in $$props) $$subscribe_store($$invalidate(1, store = $$props.store));
    		if ("tree" in $$props) $$invalidate(2, tree = $$props.tree);
    	};

    	$$self.$capture_state = () => ({ path, store, tree, $store });

    	$$self.$inject_state = $$props => {
    		if ("path" in $$props) $$invalidate(0, path = $$props.path);
    		if ("store" in $$props) $$subscribe_store($$invalidate(1, store = $$props.store));
    		if ("tree" in $$props) $$invalidate(2, tree = $$props.tree);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [path, store, tree, $store];
    }

    class CountRead extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$c, create_fragment$c, safe_not_equal, { path: 0, store: 1, tree: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "CountRead",
    			options,
    			id: create_fragment$c.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*path*/ ctx[0] === undefined && !("path" in props)) {
    			console.warn("<CountRead> was created without expected prop 'path'");
    		}

    		if (/*store*/ ctx[1] === undefined && !("store" in props)) {
    			console.warn("<CountRead> was created without expected prop 'store'");
    		}

    		if (/*tree*/ ctx[2] === undefined && !("tree" in props)) {
    			console.warn("<CountRead> was created without expected prop 'tree'");
    		}
    	}

    	get path() {
    		throw new Error("<CountRead>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set path(value) {
    		throw new Error("<CountRead>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get store() {
    		throw new Error("<CountRead>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set store(value) {
    		throw new Error("<CountRead>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get tree() {
    		throw new Error("<CountRead>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set tree(value) {
    		throw new Error("<CountRead>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\rm\Text\TextRead.svelte generated by Svelte v3.29.4 */

    const file$c = "src\\rm\\Text\\TextRead.svelte";

    // (12:12) {:else}
    function create_else_block$9(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("-");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$9.name,
    		type: "else",
    		source: "(12:12) {:else}",
    		ctx
    	});

    	return block;
    }

    // (10:12) {#if $store[path]}
    function create_if_block$9(ctx) {
    	let t_value = /*$store*/ ctx[3][/*path*/ ctx[0]] + "";
    	let t;

    	const block = {
    		c: function create() {
    			t = text(t_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$store, path*/ 9 && t_value !== (t_value = /*$store*/ ctx[3][/*path*/ ctx[0]] + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$9.name,
    		type: "if",
    		source: "(10:12) {#if $store[path]}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$d(ctx) {
    	let div;
    	let h1;
    	let t0_value = /*tree*/ ctx[2].name + "";
    	let t0;
    	let t1;
    	let p;

    	function select_block_type(ctx, dirty) {
    		if (/*$store*/ ctx[3][/*path*/ ctx[0]]) return create_if_block$9;
    		return create_else_block$9;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			h1 = element("h1");
    			t0 = text(t0_value);
    			t1 = space();
    			p = element("p");
    			if_block.c();
    			attr_dev(h1, "class", "is-6 has-text-grey has-text-weight-semibold");
    			add_location(h1, file$c, 7, 8, 169);
    			attr_dev(p, "class", "subtitle is-5");
    			add_location(p, file$c, 8, 8, 251);
    			attr_dev(div, "class", "field");
    			add_location(div, file$c, 6, 4, 140);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h1);
    			append_dev(h1, t0);
    			append_dev(div, t1);
    			append_dev(div, p);
    			if_block.m(p, null);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*tree*/ 4 && t0_value !== (t0_value = /*tree*/ ctx[2].name + "")) set_data_dev(t0, t0_value);

    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(p, null);
    				}
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$d.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$d($$self, $$props, $$invalidate) {
    	let $store,
    		$$unsubscribe_store = noop,
    		$$subscribe_store = () => ($$unsubscribe_store(), $$unsubscribe_store = subscribe(store, $$value => $$invalidate(3, $store = $$value)), store);

    	$$self.$$.on_destroy.push(() => $$unsubscribe_store());
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("TextRead", slots, []);
    	
    	let { path } = $$props;
    	let { store } = $$props;
    	validate_store(store, "store");
    	$$subscribe_store();
    	let { tree } = $$props;
    	const writable_props = ["path", "store", "tree"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<TextRead> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("path" in $$props) $$invalidate(0, path = $$props.path);
    		if ("store" in $$props) $$subscribe_store($$invalidate(1, store = $$props.store));
    		if ("tree" in $$props) $$invalidate(2, tree = $$props.tree);
    	};

    	$$self.$capture_state = () => ({ path, store, tree, $store });

    	$$self.$inject_state = $$props => {
    		if ("path" in $$props) $$invalidate(0, path = $$props.path);
    		if ("store" in $$props) $$subscribe_store($$invalidate(1, store = $$props.store));
    		if ("tree" in $$props) $$invalidate(2, tree = $$props.tree);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [path, store, tree, $store];
    }

    class TextRead extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$d, create_fragment$d, safe_not_equal, { path: 0, store: 1, tree: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "TextRead",
    			options,
    			id: create_fragment$d.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*path*/ ctx[0] === undefined && !("path" in props)) {
    			console.warn("<TextRead> was created without expected prop 'path'");
    		}

    		if (/*store*/ ctx[1] === undefined && !("store" in props)) {
    			console.warn("<TextRead> was created without expected prop 'store'");
    		}

    		if (/*tree*/ ctx[2] === undefined && !("tree" in props)) {
    			console.warn("<TextRead> was created without expected prop 'tree'");
    		}
    	}

    	get path() {
    		throw new Error("<TextRead>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set path(value) {
    		throw new Error("<TextRead>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get store() {
    		throw new Error("<TextRead>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set store(value) {
    		throw new Error("<TextRead>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get tree() {
    		throw new Error("<TextRead>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set tree(value) {
    		throw new Error("<TextRead>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\composition\Leaf.svelte generated by Svelte v3.29.4 */

    const { Error: Error_1, console: console_1$3 } = globals;
    const file$d = "src\\composition\\Leaf.svelte";

    function add_css$1() {
    	var style = element("style");
    	style.id = "svelte-d1lm4h-style";
    	style.textContent = ".bordered.svelte-d1lm4h{border-style:solid;border-width:4px;border-color:blanchedalmond;border-radius:5px}.is-almond.svelte-d1lm4h{background-color:blanchedalmond}.tag.svelte-d1lm4h{cursor:pointer}\n/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTGVhZi5zdmVsdGUiLCJzb3VyY2VzIjpbIkxlYWYuc3ZlbHRlIl0sInNvdXJjZXNDb250ZW50IjpbIjxzY3JpcHQgbGFuZz1cInRzXCI+O1xyXG5pbXBvcnQgVW5rbm93biBmcm9tIFwiLi4vcm0vVW5rbm93bi5zdmVsdGVcIjtcclxuaW1wb3J0IE9yZGluYWxXcml0ZSBmcm9tIFwiLi4vcm0vT3JkaW5hbC9PcmRpbmFsV3JpdGUuc3ZlbHRlXCI7XHJcbmltcG9ydCB7IHNhbml0aXplRGlzcGxheUZ1bmN0aW9uIH0gZnJvbSBcIi4uL3JtL3V0aWxzXCI7XHJcbmltcG9ydCBRdWFudGl0eVdyaXRlIGZyb20gXCIuLi9ybS9RdWFudGl0eS9RdWFudGl0eVdyaXRlLnN2ZWx0ZVwiO1xyXG5pbXBvcnQgT3JkaW5hbFJlYWQgZnJvbSBcIi4uL3JtL09yZGluYWwvT3JkaW5hbFJlYWQuc3ZlbHRlXCI7XHJcbmltcG9ydCBRdWFudGl0eVJlYWQgZnJvbSBcIi4uL3JtL1F1YW50aXR5L1F1YW50aXR5UmVhZC5zdmVsdGVcIjtcclxuaW1wb3J0IENvZGVkVGV4dFdyaXRlIGZyb20gXCIuLi9ybS9Db2RlZFRleHQvQ29kZWRUZXh0V3JpdGUuc3ZlbHRlXCI7XHJcbmltcG9ydCBDb2RlZFRleHRSZWFkIGZyb20gXCIuLi9ybS9Db2RlZFRleHQvQ29kZWRUZXh0UmVhZC5zdmVsdGVcIjtcclxuaW1wb3J0IFRleHRXcml0ZSBmcm9tIFwiLi4vcm0vVGV4dC9UZXh0V3JpdGUuc3ZlbHRlXCI7XHJcbmltcG9ydCBDb3VudFdyaXRlIGZyb20gXCIuLi9ybS9Db3VudC9Db3VudFdyaXRlLnN2ZWx0ZVwiO1xyXG5pbXBvcnQgQ291bnRSZWFkIGZyb20gXCIuLi9ybS9Db3VudC9Db3VudFJlYWQuc3ZlbHRlXCI7XHJcbmltcG9ydCBUZXh0UmVhZCBmcm9tIFwiLi4vcm0vVGV4dC9UZXh0UmVhZC5zdmVsdGVcIjtcclxuZXhwb3J0IGxldCB0cmVlO1xyXG5leHBvcnQgbGV0IHR5cGU7XHJcbmV4cG9ydCBsZXQgcGF0aCA9IFwibm8tcGF0aFwiO1xyXG5leHBvcnQgbGV0IGFxbFBhdGggPSBcIm5vLWFxbC1wYXRoXCI7XHJcbmV4cG9ydCBsZXQgcmVhZE9ubHk7XHJcbmV4cG9ydCBsZXQgY2hpbGRDbGFzcyA9IFwiZmllbGRcIjtcclxuZXhwb3J0IGxldCBjdXN0b21pemUgPSBmYWxzZTtcclxuZXhwb3J0IGxldCBjdXN0b21pemVGdW5jdGlvbiA9IChwYXJhbXMpID0+IGNvbnNvbGUubG9nKHBhcmFtcyk7XHJcbi8qKlxyXG4gKiBAcGFyYW0ge3RydWV8ZmFsc2V9IHJlbmRlciAtIFRvIHJlbmRlciB0aGUgY29tcG9uZW50IG9yIG5vdC5cclxuICogQHBhcmFtIHtmdW5jdGlvbn0gcmVuZGVyRnVuY3Rpb24gLSBUaGUgZnVuY3Rpb24gdG8gcmVuZGVyIHRoZSBjb21wb25lbnQgb3Igbm90LiBUYWtlcyBwcmVjZWRlbmNlIG92ZXIgcmVuZGVyIGlmIHByb3ZpZGVkLiBJZiB0aGUgdmFsdWUgaXMgbm90IHRydWUsIHRoZW4gaXQgaXMgY29uc2lkZXJlZCBmYWxzZS5cclxuICogQHBhcmFtIHt0cnVlfGZhbHNlfSBkaXNwbGF5IC0gVG8gZGlzcGxheSB0aGUgY29tcG9uZW50IG9yIG5vdC4gU3RpbGwgcmVuZGVycyBpdCBhbmQgYWRkcyB0aGUgdmFsdWUgdG8gdGhlIG91dHB1dC5cclxuICogQHBhcmFtIHtmdW5jdGlvbn0gZGlzcGxheUZ1bmN0aW9uIC0gVGhlIGZ1bmN0aW9uIHRvIGRpc3BsYXkgdGhlIGNvbXBvbmVudCBvciBub3QuIFRha2VzIHByZWNlZGVuY2Ugb3ZlciBkaXNwbGF5IGlmIHByb3ZpZGVkLiBJZiB0aGUgdmFsdWUgaXMgbm90IHRydWUsIHRoZW4gaXQgaXMgY29uc2lkZXJlZCBmYWxzZS5cclxuICovXHJcbmV4cG9ydCBsZXQgcmVuZGVyID0gdW5kZWZpbmVkO1xyXG5leHBvcnQgbGV0IHJlbmRlckZ1bmN0aW9uID0gdW5kZWZpbmVkO1xyXG5leHBvcnQgbGV0IGRpc3BsYXkgPSB0cnVlO1xyXG5leHBvcnQgbGV0IGRpc3BsYXlGdW5jdGlvbiA9IHVuZGVmaW5lZDtcclxuZXhwb3J0IGxldCBzdG9yZTtcclxubGV0IGludGVybmFsUmVuZGVyO1xyXG4kOiBpZiAocmVuZGVyRnVuY3Rpb24pIHtcclxuICAgIGludGVybmFsUmVuZGVyID0gc2FuaXRpemVEaXNwbGF5RnVuY3Rpb24ocGF0aCwgcmVuZGVyRnVuY3Rpb24sICRzdG9yZSk7XHJcbn1cclxuZWxzZSB7XHJcbiAgICBpbnRlcm5hbFJlbmRlciA9IHJlbmRlciAhPT0gbnVsbCAmJiByZW5kZXIgIT09IHZvaWQgMCA/IHJlbmRlciA6IHRydWU7XHJcbn1cclxubGV0IGludGVybmFsRGlzcGxheTtcclxuJDogaWYgKGRpc3BsYXlGdW5jdGlvbikge1xyXG4gICAgaW50ZXJuYWxEaXNwbGF5ID0gc2FuaXRpemVEaXNwbGF5RnVuY3Rpb24ocGF0aCwgZGlzcGxheUZ1bmN0aW9uLCAkc3RvcmUpO1xyXG59XHJcbmVsc2Uge1xyXG4gICAgaW50ZXJuYWxEaXNwbGF5ID0gZGlzcGxheSAhPT0gbnVsbCAmJiBkaXNwbGF5ICE9PSB2b2lkIDAgPyBkaXNwbGF5IDogdHJ1ZTtcclxufVxyXG5jb25zdCBnZXRDb21wb25lbnQgPSAocm1UeXBlLCByZWFkT25seSkgPT4ge1xyXG4gICAgY29uc3QgY29tcG9uZW50cyA9IHtcclxuICAgICAgICBEVl9PUkRJTkFMOiB7XHJcbiAgICAgICAgICAgIHdyaXRlOiBPcmRpbmFsV3JpdGUsXHJcbiAgICAgICAgICAgIHJlYWQ6IE9yZGluYWxSZWFkLFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgRFZfUVVBTlRJVFk6IHtcclxuICAgICAgICAgICAgd3JpdGU6IFF1YW50aXR5V3JpdGUsXHJcbiAgICAgICAgICAgIHJlYWQ6IFF1YW50aXR5UmVhZCxcclxuICAgICAgICB9LFxyXG4gICAgICAgIERWX0NPREVEX1RFWFQ6IHtcclxuICAgICAgICAgICAgd3JpdGU6IENvZGVkVGV4dFdyaXRlLFxyXG4gICAgICAgICAgICByZWFkOiBDb2RlZFRleHRSZWFkLFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgRFZfVEVYVDoge1xyXG4gICAgICAgICAgICB3cml0ZTogVGV4dFdyaXRlLFxyXG4gICAgICAgICAgICByZWFkOiBUZXh0UmVhZCxcclxuICAgICAgICB9LFxyXG4gICAgICAgIERWX0NPVU5UOiB7XHJcbiAgICAgICAgICAgIHdyaXRlOiBDb3VudFdyaXRlLFxyXG4gICAgICAgICAgICByZWFkOiBDb3VudFJlYWQsXHJcbiAgICAgICAgfSxcclxuICAgIH07XHJcbiAgICBsZXQgc2VsZWN0ZWQgPSBjb21wb25lbnRzW3JtVHlwZV07XHJcbiAgICBpZiAoc2VsZWN0ZWQpIHtcclxuICAgICAgICBzZWxlY3RlZCA9IHNlbGVjdGVkW3JlYWRPbmx5ID8gXCJyZWFkXCIgOiBcIndyaXRlXCJdO1xyXG4gICAgICAgIGlmIChzZWxlY3RlZCkge1xyXG4gICAgICAgICAgICByZXR1cm4gc2VsZWN0ZWQ7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIFVua25vd247XHJcbn07XHJcbmlmICh0eXBlICE9PSBcIkxlYWZcIikge1xyXG4gICAgdGhyb3cgbmV3IEVycm9yKFwiTGVhZiBjb21wb25lbnQgZ290IHRyZWUgbm90IG9mIHR5cGUgbGVhZlwiKTtcclxufVxyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1MZWFmLnN2ZWx0ZS5qcy5tYXA8L3NjcmlwdD5cblxuPGRpdiBjbGFzcz17Y2hpbGRDbGFzc30+XG4gICAgeyNpZiBjdXN0b21pemV9XG4gICAgICAgIDxzcGFuXG4gICAgICAgICAgICBjbGFzcz1cInRhZyBpcy1hbG1vbmRcIlxuICAgICAgICAgICAgb246Y2xpY2s9eygpID0+XG4gICAgICAgICAgICAgICAgY3VzdG9taXplRnVuY3Rpb24oeyBwYXRoLCBhcWxQYXRoLCB0cmVlLCB0eXBlOiB0cmVlLnJtVHlwZSB9KX1cbiAgICAgICAgICAgID57dHJlZS5ybVR5cGV9PC9zcGFuXG4gICAgICAgID5cbiAgICB7L2lmfVxuICAgIDxzZWN0aW9uIGNsYXNzOmJvcmRlcmVkPXtjdXN0b21pemV9IGNsYXNzOmlzLWhpZGRlbj17IWludGVybmFsRGlzcGxheX0+XG4gICAgICAgIHsjaWYgaW50ZXJuYWxSZW5kZXJ9XG4gICAgICAgICAgICA8c3ZlbHRlOmNvbXBvbmVudFxuICAgICAgICAgICAgICAgIHRoaXM9e2dldENvbXBvbmVudCh0cmVlLnJtVHlwZSwgcmVhZE9ubHkpfVxuICAgICAgICAgICAgICAgIHsuLi4kJHJlc3RQcm9wc31cbiAgICAgICAgICAgICAgICB7dHJlZX1cbiAgICAgICAgICAgICAgICB7cGF0aH1cbiAgICAgICAgICAgICAgICB7c3RvcmV9XG4gICAgICAgICAgICAvPlxuICAgICAgICB7L2lmfVxuICAgIDwvc2VjdGlvbj5cbjwvZGl2PlxuXG48c3R5bGU+XG4gICAgLmJvcmRlcmVkIHtcbiAgICAgICAgYm9yZGVyLXN0eWxlOiBzb2xpZDtcbiAgICAgICAgYm9yZGVyLXdpZHRoOiA0cHg7XG4gICAgICAgIGJvcmRlci1jb2xvcjogYmxhbmNoZWRhbG1vbmQ7XG4gICAgICAgIGJvcmRlci1yYWRpdXM6IDVweDtcbiAgICB9XG4gICAgLmlzLWFsbW9uZCB7XG4gICAgICAgIGJhY2tncm91bmQtY29sb3I6IGJsYW5jaGVkYWxtb25kO1xuICAgIH1cbiAgICAudGFnIHtcbiAgICAgICAgY3Vyc29yOiBwb2ludGVyO1xuICAgIH1cbjwvc3R5bGU+XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBMEdJLFNBQVMsY0FBQyxDQUFDLEFBQ1AsWUFBWSxDQUFFLEtBQUssQ0FDbkIsWUFBWSxDQUFFLEdBQUcsQ0FDakIsWUFBWSxDQUFFLGNBQWMsQ0FDNUIsYUFBYSxDQUFFLEdBQUcsQUFDdEIsQ0FBQyxBQUNELFVBQVUsY0FBQyxDQUFDLEFBQ1IsZ0JBQWdCLENBQUUsY0FBYyxBQUNwQyxDQUFDLEFBQ0QsSUFBSSxjQUFDLENBQUMsQUFDRixNQUFNLENBQUUsT0FBTyxBQUNuQixDQUFDIn0= */";
    	append_dev(document.head, style);
    }

    // (85:4) {#if customize}
    function create_if_block_1$6(ctx) {
    	let span;
    	let t_value = /*tree*/ ctx[0].rmType + "";
    	let t;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(t_value);
    			attr_dev(span, "class", "tag is-almond svelte-d1lm4h");
    			add_location(span, file$d, 85, 8, 3133);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);

    			if (!mounted) {
    				dispose = listen_dev(span, "click", /*click_handler*/ ctx[17], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*tree*/ 1 && t_value !== (t_value = /*tree*/ ctx[0].rmType + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$6.name,
    		type: "if",
    		source: "(85:4) {#if customize}",
    		ctx
    	});

    	return block;
    }

    // (94:8) {#if internalRender}
    function create_if_block$a(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;

    	const switch_instance_spread_levels = [
    		/*$$restProps*/ ctx[11],
    		{ tree: /*tree*/ ctx[0] },
    		{ path: /*path*/ ctx[1] },
    		{ store: /*store*/ ctx[7] }
    	];

    	var switch_value = /*getComponent*/ ctx[10](/*tree*/ ctx[0].rmType, /*readOnly*/ ctx[3]);

    	function switch_props(ctx) {
    		let switch_instance_props = {};

    		for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
    			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
    		}

    		return {
    			props: switch_instance_props,
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props());
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = (dirty & /*$$restProps, tree, path, store*/ 2179)
    			? get_spread_update(switch_instance_spread_levels, [
    					dirty & /*$$restProps*/ 2048 && get_spread_object(/*$$restProps*/ ctx[11]),
    					dirty & /*tree*/ 1 && { tree: /*tree*/ ctx[0] },
    					dirty & /*path*/ 2 && { path: /*path*/ ctx[1] },
    					dirty & /*store*/ 128 && { store: /*store*/ ctx[7] }
    				])
    			: {};

    			if (switch_value !== (switch_value = /*getComponent*/ ctx[10](/*tree*/ ctx[0].rmType, /*readOnly*/ ctx[3]))) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props());
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$a.name,
    		type: "if",
    		source: "(94:8) {#if internalRender}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$e(ctx) {
    	let div;
    	let t;
    	let section;
    	let div_class_value;
    	let current;
    	let if_block0 = /*customize*/ ctx[5] && create_if_block_1$6(ctx);
    	let if_block1 = /*internalRender*/ ctx[8] && create_if_block$a(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (if_block0) if_block0.c();
    			t = space();
    			section = element("section");
    			if (if_block1) if_block1.c();
    			attr_dev(section, "class", "svelte-d1lm4h");
    			toggle_class(section, "bordered", /*customize*/ ctx[5]);
    			toggle_class(section, "is-hidden", !/*internalDisplay*/ ctx[9]);
    			add_location(section, file$d, 92, 4, 3337);
    			attr_dev(div, "class", div_class_value = "" + (null_to_empty(/*childClass*/ ctx[4]) + " svelte-d1lm4h"));
    			add_location(div, file$d, 83, 0, 3080);
    		},
    		l: function claim(nodes) {
    			throw new Error_1("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if (if_block0) if_block0.m(div, null);
    			append_dev(div, t);
    			append_dev(div, section);
    			if (if_block1) if_block1.m(section, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*customize*/ ctx[5]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_1$6(ctx);
    					if_block0.c();
    					if_block0.m(div, t);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*internalRender*/ ctx[8]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty & /*internalRender*/ 256) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block$a(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(section, null);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}

    			if (dirty & /*customize*/ 32) {
    				toggle_class(section, "bordered", /*customize*/ ctx[5]);
    			}

    			if (dirty & /*internalDisplay*/ 512) {
    				toggle_class(section, "is-hidden", !/*internalDisplay*/ ctx[9]);
    			}

    			if (!current || dirty & /*childClass*/ 16 && div_class_value !== (div_class_value = "" + (null_to_empty(/*childClass*/ ctx[4]) + " svelte-d1lm4h"))) {
    				attr_dev(div, "class", div_class_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block1);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block1);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$e.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$e($$self, $$props, $$invalidate) {
    	const omit_props_names = [
    		"tree","type","path","aqlPath","readOnly","childClass","customize","customizeFunction","render","renderFunction","display","displayFunction","store"
    	];

    	let $$restProps = compute_rest_props($$props, omit_props_names);

    	let $store,
    		$$unsubscribe_store = noop,
    		$$subscribe_store = () => ($$unsubscribe_store(), $$unsubscribe_store = subscribe(store, $$value => $$invalidate(18, $store = $$value)), store);

    	$$self.$$.on_destroy.push(() => $$unsubscribe_store());
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Leaf", slots, []);
    	
    	let { tree } = $$props;
    	let { type } = $$props;
    	let { path = "no-path" } = $$props;
    	let { aqlPath = "no-aql-path" } = $$props;
    	let { readOnly } = $$props;
    	let { childClass = "field" } = $$props;
    	let { customize = false } = $$props;
    	let { customizeFunction = params => console.log(params) } = $$props;
    	let { render = undefined } = $$props;
    	let { renderFunction = undefined } = $$props;
    	let { display = true } = $$props;
    	let { displayFunction = undefined } = $$props;
    	let { store } = $$props;
    	validate_store(store, "store");
    	$$subscribe_store();
    	let internalRender;
    	let internalDisplay;

    	const getComponent = (rmType, readOnly) => {
    		const components = {
    			DV_ORDINAL: { write: OrdinalWrite, read: OrdinalRead },
    			DV_QUANTITY: { write: QuantityWrite, read: QuantityRead },
    			DV_CODED_TEXT: {
    				write: CodedTextWrite,
    				read: CodedTextRead
    			},
    			DV_TEXT: { write: TextWrite, read: TextRead },
    			DV_COUNT: { write: CountWrite, read: CountRead }
    		};

    		let selected = components[rmType];

    		if (selected) {
    			selected = selected[readOnly ? "read" : "write"];

    			if (selected) {
    				return selected;
    			}
    		}

    		return Unknown;
    	};

    	if (type !== "Leaf") {
    		throw new Error("Leaf component got tree not of type leaf");
    	}

    	const click_handler = () => customizeFunction({ path, aqlPath, tree, type: tree.rmType });

    	$$self.$$set = $$new_props => {
    		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
    		$$invalidate(11, $$restProps = compute_rest_props($$props, omit_props_names));
    		if ("tree" in $$new_props) $$invalidate(0, tree = $$new_props.tree);
    		if ("type" in $$new_props) $$invalidate(12, type = $$new_props.type);
    		if ("path" in $$new_props) $$invalidate(1, path = $$new_props.path);
    		if ("aqlPath" in $$new_props) $$invalidate(2, aqlPath = $$new_props.aqlPath);
    		if ("readOnly" in $$new_props) $$invalidate(3, readOnly = $$new_props.readOnly);
    		if ("childClass" in $$new_props) $$invalidate(4, childClass = $$new_props.childClass);
    		if ("customize" in $$new_props) $$invalidate(5, customize = $$new_props.customize);
    		if ("customizeFunction" in $$new_props) $$invalidate(6, customizeFunction = $$new_props.customizeFunction);
    		if ("render" in $$new_props) $$invalidate(13, render = $$new_props.render);
    		if ("renderFunction" in $$new_props) $$invalidate(14, renderFunction = $$new_props.renderFunction);
    		if ("display" in $$new_props) $$invalidate(15, display = $$new_props.display);
    		if ("displayFunction" in $$new_props) $$invalidate(16, displayFunction = $$new_props.displayFunction);
    		if ("store" in $$new_props) $$subscribe_store($$invalidate(7, store = $$new_props.store));
    	};

    	$$self.$capture_state = () => ({
    		Unknown,
    		OrdinalWrite,
    		sanitizeDisplayFunction,
    		QuantityWrite,
    		OrdinalRead,
    		QuantityRead,
    		CodedTextWrite,
    		CodedTextRead,
    		TextWrite,
    		CountWrite,
    		CountRead,
    		TextRead,
    		tree,
    		type,
    		path,
    		aqlPath,
    		readOnly,
    		childClass,
    		customize,
    		customizeFunction,
    		render,
    		renderFunction,
    		display,
    		displayFunction,
    		store,
    		internalRender,
    		internalDisplay,
    		getComponent,
    		$store
    	});

    	$$self.$inject_state = $$new_props => {
    		if ("tree" in $$props) $$invalidate(0, tree = $$new_props.tree);
    		if ("type" in $$props) $$invalidate(12, type = $$new_props.type);
    		if ("path" in $$props) $$invalidate(1, path = $$new_props.path);
    		if ("aqlPath" in $$props) $$invalidate(2, aqlPath = $$new_props.aqlPath);
    		if ("readOnly" in $$props) $$invalidate(3, readOnly = $$new_props.readOnly);
    		if ("childClass" in $$props) $$invalidate(4, childClass = $$new_props.childClass);
    		if ("customize" in $$props) $$invalidate(5, customize = $$new_props.customize);
    		if ("customizeFunction" in $$props) $$invalidate(6, customizeFunction = $$new_props.customizeFunction);
    		if ("render" in $$props) $$invalidate(13, render = $$new_props.render);
    		if ("renderFunction" in $$props) $$invalidate(14, renderFunction = $$new_props.renderFunction);
    		if ("display" in $$props) $$invalidate(15, display = $$new_props.display);
    		if ("displayFunction" in $$props) $$invalidate(16, displayFunction = $$new_props.displayFunction);
    		if ("store" in $$props) $$subscribe_store($$invalidate(7, store = $$new_props.store));
    		if ("internalRender" in $$props) $$invalidate(8, internalRender = $$new_props.internalRender);
    		if ("internalDisplay" in $$props) $$invalidate(9, internalDisplay = $$new_props.internalDisplay);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*renderFunction, path, $store, render*/ 286722) {
    			 if (renderFunction) {
    				$$invalidate(8, internalRender = sanitizeDisplayFunction(path, renderFunction, $store));
    			} else {
    				$$invalidate(8, internalRender = render !== null && render !== void 0 ? render : true);
    			}
    		}

    		if ($$self.$$.dirty & /*displayFunction, path, $store, display*/ 360450) {
    			 if (displayFunction) {
    				$$invalidate(9, internalDisplay = sanitizeDisplayFunction(path, displayFunction, $store));
    			} else {
    				$$invalidate(9, internalDisplay = display !== null && display !== void 0 ? display : true);
    			}
    		}
    	};

    	return [
    		tree,
    		path,
    		aqlPath,
    		readOnly,
    		childClass,
    		customize,
    		customizeFunction,
    		store,
    		internalRender,
    		internalDisplay,
    		getComponent,
    		$$restProps,
    		type,
    		render,
    		renderFunction,
    		display,
    		displayFunction,
    		click_handler
    	];
    }

    class Leaf extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		if (!document.getElementById("svelte-d1lm4h-style")) add_css$1();

    		init(this, options, instance$e, create_fragment$e, safe_not_equal, {
    			tree: 0,
    			type: 12,
    			path: 1,
    			aqlPath: 2,
    			readOnly: 3,
    			childClass: 4,
    			customize: 5,
    			customizeFunction: 6,
    			render: 13,
    			renderFunction: 14,
    			display: 15,
    			displayFunction: 16,
    			store: 7
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Leaf",
    			options,
    			id: create_fragment$e.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*tree*/ ctx[0] === undefined && !("tree" in props)) {
    			console_1$3.warn("<Leaf> was created without expected prop 'tree'");
    		}

    		if (/*type*/ ctx[12] === undefined && !("type" in props)) {
    			console_1$3.warn("<Leaf> was created without expected prop 'type'");
    		}

    		if (/*readOnly*/ ctx[3] === undefined && !("readOnly" in props)) {
    			console_1$3.warn("<Leaf> was created without expected prop 'readOnly'");
    		}

    		if (/*store*/ ctx[7] === undefined && !("store" in props)) {
    			console_1$3.warn("<Leaf> was created without expected prop 'store'");
    		}
    	}

    	get tree() {
    		throw new Error_1("<Leaf>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set tree(value) {
    		throw new Error_1("<Leaf>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get type() {
    		throw new Error_1("<Leaf>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set type(value) {
    		throw new Error_1("<Leaf>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get path() {
    		throw new Error_1("<Leaf>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set path(value) {
    		throw new Error_1("<Leaf>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get aqlPath() {
    		throw new Error_1("<Leaf>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set aqlPath(value) {
    		throw new Error_1("<Leaf>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get readOnly() {
    		throw new Error_1("<Leaf>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set readOnly(value) {
    		throw new Error_1("<Leaf>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get childClass() {
    		throw new Error_1("<Leaf>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set childClass(value) {
    		throw new Error_1("<Leaf>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get customize() {
    		throw new Error_1("<Leaf>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set customize(value) {
    		throw new Error_1("<Leaf>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get customizeFunction() {
    		throw new Error_1("<Leaf>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set customizeFunction(value) {
    		throw new Error_1("<Leaf>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get render() {
    		throw new Error_1("<Leaf>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set render(value) {
    		throw new Error_1("<Leaf>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get renderFunction() {
    		throw new Error_1("<Leaf>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set renderFunction(value) {
    		throw new Error_1("<Leaf>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get display() {
    		throw new Error_1("<Leaf>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set display(value) {
    		throw new Error_1("<Leaf>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get displayFunction() {
    		throw new Error_1("<Leaf>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set displayFunction(value) {
    		throw new Error_1("<Leaf>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get store() {
    		throw new Error_1("<Leaf>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set store(value) {
    		throw new Error_1("<Leaf>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\rm\Context.svelte generated by Svelte v3.29.4 */

    const { Error: Error_1$1, Object: Object_1$5, console: console_1$4 } = globals;
    const file$e = "src\\rm\\Context.svelte";

    function add_css$2() {
    	var style = element("style");
    	style.id = "svelte-178q367-style";
    	style.textContent = ".tag.svelte-178q367{cursor:pointer}\n/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ29udGV4dC5zdmVsdGUiLCJzb3VyY2VzIjpbIkNvbnRleHQuc3ZlbHRlIl0sInNvdXJjZXNDb250ZW50IjpbIjxzY3JpcHQgbGFuZz1cInRzXCI+aW1wb3J0IHsgZ2V0Q29udGV4dCwgc2V0Q29udGV4dCB9IGZyb20gXCJzdmVsdGVcIjtcclxuaW1wb3J0IHsgd3JpdGFibGUgfSBmcm9tIFwic3ZlbHRlL3N0b3JlXCI7XHJcbjtcclxuO1xyXG5pbXBvcnQgeyBkZXN0cm95QWN0aW9uLCB0cmlnZ2VyRGVzdHJveSB9IGZyb20gXCIuL3V0aWxzXCI7XHJcbmV4cG9ydCBsZXQgdHJlZTtcclxuZXhwb3J0IGxldCBwYXRoO1xyXG5leHBvcnQgbGV0IHR5cGU7XHJcbmV4cG9ydCBsZXQgYXFsUGF0aDtcclxuZXhwb3J0IGxldCBjdXN0b21pemUgPSBmYWxzZTtcclxuZXhwb3J0IGxldCByZWFkT25seTtcclxuZXhwb3J0IGxldCBzdG9yZTtcclxuZXhwb3J0IGxldCBjdXN0b21pemVGdW5jdGlvbiA9IChvcHRpb25zKSA9PiBjb25zb2xlLmxvZyhvcHRpb25zKTtcclxubGV0IG90aGVyQ29udGV4dFBhdGhzID0gZ2V0Q29udGV4dChcImNvbnRleHRQYXRoc1wiKTtcclxuaWYgKHR5cGUgIT09IFwiQ29udGV4dFwiKSB7XHJcbiAgICB0aHJvdyBuZXcgRXJyb3IoYENvbnRleHQgY29tcG9uZW50IGdvdCB0eXBlICR7dHlwZX1gKTtcclxufVxyXG5sZXQgcHJvY2Vzc2VkID0gdHJ1ZTtcclxubGV0IGRhdGEgPSB7fTtcclxuLy8gVE9ETzogUmVnaXN0ZXIgYWxsIGNvbnRleHQgcGF0aHMgdG8gYSBzdG9yZSBhY2Nlc3NpYmxlIHRvIG90aGVyIENvbnRleHQgY29tcG9uZW50cy4gRXhjbHVkZSBjb250ZXh0IHBhdGhzIGZyb20gdGhpcyBjaGVja1xyXG5jb25zdCBjaGVja0lmUGF0aElzVXNlZCA9IChwYXRoLCBrZXlWYWx1ZXMsIG90aGVyQ29udGV4dHMpID0+IHtcclxuICAgIHJldHVybiBPYmplY3Qua2V5cyhrZXlWYWx1ZXMpLnNvbWUoKHApID0+IHtcclxuICAgICAgICBpZiAodHlwZW9mIGtleVZhbHVlc1twXSAhPSBcInVuZGVmaW5lZFwiICYmIGtleVZhbHVlc1twXSAhPT0gbnVsbCkge1xyXG4gICAgICAgICAgICBpZiAocC5pbmNsdWRlcyhwYXRoKSAmJiAhb3RoZXJDb250ZXh0cy5pbmNsdWRlcyhwKSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfSk7XHJcbn07XHJcbmxldCBhY3RpdmU7XHJcbmxldCBwYXJlbnRQYXRoO1xyXG4kOiBwYXJlbnRQYXRoID0gcGF0aC5yZXBsYWNlKGAvJHt0cmVlLmlkfWAsIFwiXCIpLnJlcGxhY2UoXCJjb250ZXh0XCIsIFwiXCIpO1xyXG4kOiBhY3RpdmUgPSBjaGVja0lmUGF0aElzVXNlZChwYXJlbnRQYXRoLCAkc3RvcmUsIE9iamVjdC5rZXlzKCRvdGhlckNvbnRleHRQYXRocykpO1xyXG4kOiBpZiAoYWN0aXZlKSB7XHJcbiAgICBpZiAoIXJlYWRPbmx5KSB7XHJcbiAgICAgICAgc3dpdGNoICh0cmVlLmlkKSB7XHJcbiAgICAgICAgICAgIGNhc2UgXCJzdGFydF90aW1lXCI6XHJcbiAgICAgICAgICAgIGNhc2UgXCJ0aW1lXCI6XHJcbiAgICAgICAgICAgICAgICBkYXRhID0ge1xyXG4gICAgICAgICAgICAgICAgICAgIFtwYXRoXTogbmV3IERhdGUoKS50b0lTT1N0cmluZygpLFxyXG4gICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIFwiY2F0ZWdvcnlcIjpcclxuICAgICAgICAgICAgICAgIGRhdGEgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgW3BhdGggKyBcInxjb2RlXCJdOiBcIjQzM1wiLFxyXG4gICAgICAgICAgICAgICAgICAgIFtwYXRoICsgXCJ8dmFsdWVcIl06IFwiZXZlbnRcIixcclxuICAgICAgICAgICAgICAgICAgICBbcGF0aCArIFwifHRlcm1pbm9sb2d5XCJdOiBcIm9wZW5laHJcIixcclxuICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSBcInNldHRpbmdcIjpcclxuICAgICAgICAgICAgICAgIGRhdGEgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgW3BhdGggKyBcInxjb2RlXCJdOiBcIjIzOFwiLFxyXG4gICAgICAgICAgICAgICAgICAgIFtwYXRoICsgXCJ8dmFsdWVcIl06IFwiT3RoZXIgQ2FyZVwiLFxyXG4gICAgICAgICAgICAgICAgICAgIFtwYXRoICsgXCJ8dGVybWlub2xvZ3lcIl06IFwib3BlbmVoclwiLFxyXG4gICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIFwibGFuZ3VhZ2VcIjpcclxuICAgICAgICAgICAgICAgIGRhdGEgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgW3BhdGggKyBcInxjb2RlXCJdOiBcImVuXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgW3BhdGggKyBcInx0ZXJtaW5vbG9neVwiXTogXCJJU09fNjM5LTFcIixcclxuICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSBcInRlcnJpdG9yeVwiOlxyXG4gICAgICAgICAgICAgICAgZGF0YSA9IHtcclxuICAgICAgICAgICAgICAgICAgICBbcGF0aCArIFwifGNvZGVcIl06IFwiSU5cIixcclxuICAgICAgICAgICAgICAgICAgICBbcGF0aCArIFwifHRlcm1pbm9sb2d5XCJdOiBcIklTT18zMTY2LTFcIixcclxuICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSBcImVuY29kaW5nXCI6XHJcbiAgICAgICAgICAgICAgICBkYXRhID0ge1xyXG4gICAgICAgICAgICAgICAgICAgIFtwYXRoICsgXCJ8Y29kZVwiXTogXCJVVEYtOFwiLFxyXG4gICAgICAgICAgICAgICAgICAgIFtwYXRoICsgXCJ8dGVybWlub2xvZ3lcIl06IFwiSUFOQV9jaGFyYWN0ZXItc2V0c1wiLFxyXG4gICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIFwiY29tcG9zZXJcIjpcclxuICAgICAgICAgICAgICAgIGRhdGEgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgW3BhdGggKyBcInxuYW1lXCJdOiBcIlNpZGhhcnRoIFJhbWVzaFwiLFxyXG4gICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIFwic3ViamVjdFwiOlxyXG4gICAgICAgICAgICAgICAgZGF0YSA9IHt9O1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICBwcm9jZXNzZWQgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIGRhdGEgPSB7fTtcclxuICAgICAgICB9XHJcbiAgICAgICAgbGV0IHBhdGhzID0gT2JqZWN0LmtleXMoZGF0YSk7XHJcbiAgICAgICAgY29uc3QgcGF0aHNPYmplY3QgPSBPYmplY3QuZnJvbUVudHJpZXMocGF0aHMubWFwKHAgPT4gKFtwLCB0cnVlXSkpKTtcclxuICAgICAgICBvdGhlckNvbnRleHRQYXRocy51cGRhdGUocyA9PiB7XHJcbiAgICAgICAgICAgIHJldHVybiBPYmplY3QuYXNzaWduKE9iamVjdC5hc3NpZ24oe30sIHMpLCBwYXRoc09iamVjdCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgcGF0aHMuZm9yRWFjaCgocGF0aCkgPT4ge1xyXG4gICAgICAgICAgICBpZiAoISRzdG9yZVtwYXRoXSkge1xyXG4gICAgICAgICAgICAgICAgc3RvcmUudXBkYXRlKChzKSA9PiAoT2JqZWN0LmFzc2lnbihPYmplY3QuYXNzaWduKHt9LCBzKSwgeyBbcGF0aF06IGRhdGFbcGF0aF0gfSkpKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRyaWdnZXJEZXN0cm95KE9iamVjdC5rZXlzKGRhdGEpLCBzdG9yZSk7XHJcbiAgICB9XHJcbn1cclxuZWxzZSB7XHJcbiAgICBsZXQgcGF0aHMgPSBPYmplY3Qua2V5cyhkYXRhKTtcclxuICAgIGlmIChwYXRocy5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgaWYgKE9iamVjdC5rZXlzKCRzdG9yZSkuc29tZShwID0+IHBhdGhzLmluY2x1ZGVzKHApKSkge1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIkNsZWFuaW5nIHVwIGNvbnRleHRzXCIsIHsgcGF0aHMgfSk7XHJcbiAgICAgICAgICAgIGRlc3Ryb3lBY3Rpb24ocGF0aHMsIHN0b3JlKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9Q29udGV4dC5zdmVsdGUuanMubWFwPC9zY3JpcHQ+XG5cbnsjaWYgY3VzdG9taXplfVxuICAgIDxkaXZcbiAgICAgICAgY2xhc3M9XCJ0YWcgaXMtZGFya1wiXG4gICAgICAgIG9uOmNsaWNrPXtjdXN0b21pemVGdW5jdGlvbih7IHRyZWUsIHBhdGgsIHR5cGUsIGFxbFBhdGggfSl9XG4gICAgPnt0cmVlLmlkLnRvVXBwZXJDYXNlKCl9PC9kaXY+XG57L2lmfVxueyNpZiAhcHJvY2Vzc2VkfVxuICAgIDxwIGNsYXNzPVwiaGFzLXRleHQtZGFuZ2VyXCI+Q29udGV4dCBub3QgcHJvY2Vzc2VkOiB7cGF0aH08L3A+XG4gICAgPCEtLSA8cHJlPlxuICAgIHtKU09OLnN0cmluZ2lmeSh0cmVlLCBudWxsLCAyKX1cbiAgICA8L3ByZT4gLS0+XG57L2lmfVxuXG48c3R5bGU+XG4gICAgLnRhZyB7XG4gICAgICAgIGN1cnNvcjogcG9pbnRlcjtcbiAgICB9XG48L3N0eWxlPlxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQTZISSxJQUFJLGVBQUMsQ0FBQyxBQUNGLE1BQU0sQ0FBRSxPQUFPLEFBQ25CLENBQUMifQ== */";
    	append_dev(document.head, style);
    }

    // (112:0) {#if customize}
    function create_if_block_1$7(ctx) {
    	let div;
    	let t_value = /*tree*/ ctx[0].id.toUpperCase() + "";
    	let t;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text(t_value);
    			attr_dev(div, "class", "tag is-dark svelte-178q367");
    			add_location(div, file$e, 112, 4, 3791);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t);

    			if (!mounted) {
    				dispose = listen_dev(
    					div,
    					"click",
    					function () {
    						if (is_function(/*customizeFunction*/ ctx[6]({
    							tree: /*tree*/ ctx[0],
    							path: /*path*/ ctx[1],
    							type: /*type*/ ctx[2],
    							aqlPath: /*aqlPath*/ ctx[3]
    						}))) /*customizeFunction*/ ctx[6]({
    							tree: /*tree*/ ctx[0],
    							path: /*path*/ ctx[1],
    							type: /*type*/ ctx[2],
    							aqlPath: /*aqlPath*/ ctx[3]
    						}).apply(this, arguments);
    					},
    					false,
    					false,
    					false
    				);

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*tree*/ 1 && t_value !== (t_value = /*tree*/ ctx[0].id.toUpperCase() + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$7.name,
    		type: "if",
    		source: "(112:0) {#if customize}",
    		ctx
    	});

    	return block;
    }

    // (118:0) {#if !processed}
    function create_if_block$b(ctx) {
    	let p;
    	let t0;
    	let t1;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t0 = text("Context not processed: ");
    			t1 = text(/*path*/ ctx[1]);
    			attr_dev(p, "class", "has-text-danger");
    			add_location(p, file$e, 118, 4, 3954);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t0);
    			append_dev(p, t1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*path*/ 2) set_data_dev(t1, /*path*/ ctx[1]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$b.name,
    		type: "if",
    		source: "(118:0) {#if !processed}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$f(ctx) {
    	let t;
    	let if_block1_anchor;
    	let if_block0 = /*customize*/ ctx[4] && create_if_block_1$7(ctx);
    	let if_block1 = !/*processed*/ ctx[7] && create_if_block$b(ctx);

    	const block = {
    		c: function create() {
    			if (if_block0) if_block0.c();
    			t = space();
    			if (if_block1) if_block1.c();
    			if_block1_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error_1$1("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block0) if_block0.m(target, anchor);
    			insert_dev(target, t, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, if_block1_anchor, anchor);
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*customize*/ ctx[4]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_1$7(ctx);
    					if_block0.c();
    					if_block0.m(t.parentNode, t);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (!/*processed*/ ctx[7]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block$b(ctx);
    					if_block1.c();
    					if_block1.m(if_block1_anchor.parentNode, if_block1_anchor);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (if_block0) if_block0.d(detaching);
    			if (detaching) detach_dev(t);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(if_block1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$f.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$f($$self, $$props, $$invalidate) {
    	let $store,
    		$$unsubscribe_store = noop,
    		$$subscribe_store = () => ($$unsubscribe_store(), $$unsubscribe_store = subscribe(store, $$value => $$invalidate(13, $store = $$value)), store);

    	let $otherContextPaths;
    	$$self.$$.on_destroy.push(() => $$unsubscribe_store());
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Context", slots, []);
    	
    	
    	let { tree } = $$props;
    	let { path } = $$props;
    	let { type } = $$props;
    	let { aqlPath } = $$props;
    	let { customize = false } = $$props;
    	let { readOnly } = $$props;
    	let { store } = $$props;
    	validate_store(store, "store");
    	$$subscribe_store();
    	let { customizeFunction = options => console.log(options) } = $$props;
    	let otherContextPaths = getContext("contextPaths");
    	validate_store(otherContextPaths, "otherContextPaths");
    	component_subscribe($$self, otherContextPaths, value => $$invalidate(14, $otherContextPaths = value));

    	if (type !== "Context") {
    		throw new Error(`Context component got type ${type}`);
    	}

    	let processed = true;
    	let data = {};

    	// TODO: Register all context paths to a store accessible to other Context components. Exclude context paths from this check
    	const checkIfPathIsUsed = (path, keyValues, otherContexts) => {
    		return Object.keys(keyValues).some(p => {
    			if (typeof keyValues[p] != "undefined" && keyValues[p] !== null) {
    				if (p.includes(path) && !otherContexts.includes(p)) {
    					return true;
    				}
    			}

    			return false;
    		});
    	};

    	let active;
    	let parentPath;

    	const writable_props = [
    		"tree",
    		"path",
    		"type",
    		"aqlPath",
    		"customize",
    		"readOnly",
    		"store",
    		"customizeFunction"
    	];

    	Object_1$5.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$4.warn(`<Context> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("tree" in $$props) $$invalidate(0, tree = $$props.tree);
    		if ("path" in $$props) $$invalidate(1, path = $$props.path);
    		if ("type" in $$props) $$invalidate(2, type = $$props.type);
    		if ("aqlPath" in $$props) $$invalidate(3, aqlPath = $$props.aqlPath);
    		if ("customize" in $$props) $$invalidate(4, customize = $$props.customize);
    		if ("readOnly" in $$props) $$invalidate(9, readOnly = $$props.readOnly);
    		if ("store" in $$props) $$subscribe_store($$invalidate(5, store = $$props.store));
    		if ("customizeFunction" in $$props) $$invalidate(6, customizeFunction = $$props.customizeFunction);
    	};

    	$$self.$capture_state = () => ({
    		getContext,
    		setContext,
    		writable,
    		destroyAction,
    		triggerDestroy,
    		tree,
    		path,
    		type,
    		aqlPath,
    		customize,
    		readOnly,
    		store,
    		customizeFunction,
    		otherContextPaths,
    		processed,
    		data,
    		checkIfPathIsUsed,
    		active,
    		parentPath,
    		$store,
    		$otherContextPaths
    	});

    	$$self.$inject_state = $$props => {
    		if ("tree" in $$props) $$invalidate(0, tree = $$props.tree);
    		if ("path" in $$props) $$invalidate(1, path = $$props.path);
    		if ("type" in $$props) $$invalidate(2, type = $$props.type);
    		if ("aqlPath" in $$props) $$invalidate(3, aqlPath = $$props.aqlPath);
    		if ("customize" in $$props) $$invalidate(4, customize = $$props.customize);
    		if ("readOnly" in $$props) $$invalidate(9, readOnly = $$props.readOnly);
    		if ("store" in $$props) $$subscribe_store($$invalidate(5, store = $$props.store));
    		if ("customizeFunction" in $$props) $$invalidate(6, customizeFunction = $$props.customizeFunction);
    		if ("otherContextPaths" in $$props) $$invalidate(8, otherContextPaths = $$props.otherContextPaths);
    		if ("processed" in $$props) $$invalidate(7, processed = $$props.processed);
    		if ("data" in $$props) $$invalidate(10, data = $$props.data);
    		if ("active" in $$props) $$invalidate(11, active = $$props.active);
    		if ("parentPath" in $$props) $$invalidate(12, parentPath = $$props.parentPath);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*path, tree*/ 3) {
    			 $$invalidate(12, parentPath = path.replace(`/${tree.id}`, "").replace("context", ""));
    		}

    		if ($$self.$$.dirty & /*parentPath, $store, $otherContextPaths*/ 28672) {
    			 $$invalidate(11, active = checkIfPathIsUsed(parentPath, $store, Object.keys($otherContextPaths)));
    		}

    		if ($$self.$$.dirty & /*active, readOnly, tree, path, data, $store, store*/ 11811) {
    			 if (active) {
    				if (!readOnly) {
    					switch (tree.id) {
    						case "start_time":
    						case "time":
    							$$invalidate(10, data = { [path]: new Date().toISOString() });
    							break;
    						case "category":
    							$$invalidate(10, data = {
    								[path + "|code"]: "433",
    								[path + "|value"]: "event",
    								[path + "|terminology"]: "openehr"
    							});
    							break;
    						case "setting":
    							$$invalidate(10, data = {
    								[path + "|code"]: "238",
    								[path + "|value"]: "Other Care",
    								[path + "|terminology"]: "openehr"
    							});
    							break;
    						case "language":
    							$$invalidate(10, data = {
    								[path + "|code"]: "en",
    								[path + "|terminology"]: "ISO_639-1"
    							});
    							break;
    						case "territory":
    							$$invalidate(10, data = {
    								[path + "|code"]: "IN",
    								[path + "|terminology"]: "ISO_3166-1"
    							});
    							break;
    						case "encoding":
    							$$invalidate(10, data = {
    								[path + "|code"]: "UTF-8",
    								[path + "|terminology"]: "IANA_character-sets"
    							});
    							break;
    						case "composer":
    							$$invalidate(10, data = { [path + "|name"]: "Sidharth Ramesh" });
    							break;
    						case "subject":
    							$$invalidate(10, data = {});
    							break;
    						default:
    							$$invalidate(7, processed = false);
    							$$invalidate(10, data = {});
    					}

    					let paths = Object.keys(data);
    					const pathsObject = Object.fromEntries(paths.map(p => [p, true]));

    					otherContextPaths.update(s => {
    						return Object.assign(Object.assign({}, s), pathsObject);
    					});

    					paths.forEach(path => {
    						if (!$store[path]) {
    							store.update(s => Object.assign(Object.assign({}, s), { [path]: data[path] }));
    						}
    					});

    					triggerDestroy(Object.keys(data), store);
    				}
    			} else {
    				let paths = Object.keys(data);

    				if (paths.length > 0) {
    					if (Object.keys($store).some(p => paths.includes(p))) {
    						console.log("Cleaning up contexts", { paths });
    						destroyAction(paths, store);
    					}
    				}
    			}
    		}
    	};

    	return [
    		tree,
    		path,
    		type,
    		aqlPath,
    		customize,
    		store,
    		customizeFunction,
    		processed,
    		otherContextPaths,
    		readOnly
    	];
    }

    class Context extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		if (!document.getElementById("svelte-178q367-style")) add_css$2();

    		init(this, options, instance$f, create_fragment$f, safe_not_equal, {
    			tree: 0,
    			path: 1,
    			type: 2,
    			aqlPath: 3,
    			customize: 4,
    			readOnly: 9,
    			store: 5,
    			customizeFunction: 6
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Context",
    			options,
    			id: create_fragment$f.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*tree*/ ctx[0] === undefined && !("tree" in props)) {
    			console_1$4.warn("<Context> was created without expected prop 'tree'");
    		}

    		if (/*path*/ ctx[1] === undefined && !("path" in props)) {
    			console_1$4.warn("<Context> was created without expected prop 'path'");
    		}

    		if (/*type*/ ctx[2] === undefined && !("type" in props)) {
    			console_1$4.warn("<Context> was created without expected prop 'type'");
    		}

    		if (/*aqlPath*/ ctx[3] === undefined && !("aqlPath" in props)) {
    			console_1$4.warn("<Context> was created without expected prop 'aqlPath'");
    		}

    		if (/*readOnly*/ ctx[9] === undefined && !("readOnly" in props)) {
    			console_1$4.warn("<Context> was created without expected prop 'readOnly'");
    		}

    		if (/*store*/ ctx[5] === undefined && !("store" in props)) {
    			console_1$4.warn("<Context> was created without expected prop 'store'");
    		}
    	}

    	get tree() {
    		throw new Error_1$1("<Context>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set tree(value) {
    		throw new Error_1$1("<Context>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get path() {
    		throw new Error_1$1("<Context>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set path(value) {
    		throw new Error_1$1("<Context>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get type() {
    		throw new Error_1$1("<Context>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set type(value) {
    		throw new Error_1$1("<Context>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get aqlPath() {
    		throw new Error_1$1("<Context>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set aqlPath(value) {
    		throw new Error_1$1("<Context>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get customize() {
    		throw new Error_1$1("<Context>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set customize(value) {
    		throw new Error_1$1("<Context>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get readOnly() {
    		throw new Error_1$1("<Context>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set readOnly(value) {
    		throw new Error_1$1("<Context>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get store() {
    		throw new Error_1$1("<Context>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set store(value) {
    		throw new Error_1$1("<Context>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get customizeFunction() {
    		throw new Error_1$1("<Context>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set customizeFunction(value) {
    		throw new Error_1$1("<Context>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    function cubicOut(t) {
        const f = t - 1.0;
        return f * f * f + 1.0;
    }

    function slide(node, { delay = 0, duration = 400, easing = cubicOut }) {
        const style = getComputedStyle(node);
        const opacity = +style.opacity;
        const height = parseFloat(style.height);
        const padding_top = parseFloat(style.paddingTop);
        const padding_bottom = parseFloat(style.paddingBottom);
        const margin_top = parseFloat(style.marginTop);
        const margin_bottom = parseFloat(style.marginBottom);
        const border_top_width = parseFloat(style.borderTopWidth);
        const border_bottom_width = parseFloat(style.borderBottomWidth);
        return {
            delay,
            duration,
            easing,
            css: t => 'overflow: hidden;' +
                `opacity: ${Math.min(t * 20, 1) * opacity};` +
                `height: ${t * height}px;` +
                `padding-top: ${t * padding_top}px;` +
                `padding-bottom: ${t * padding_bottom}px;` +
                `margin-top: ${t * margin_top}px;` +
                `margin-bottom: ${t * margin_bottom}px;` +
                `border-top-width: ${t * border_top_width}px;` +
                `border-bottom-width: ${t * border_bottom_width}px;`
        };
    }
    function scale(node, { delay = 0, duration = 400, easing = cubicOut, start = 0, opacity = 0 }) {
        const style = getComputedStyle(node);
        const target_opacity = +style.opacity;
        const transform = style.transform === 'none' ? '' : style.transform;
        const sd = 1 - start;
        const od = target_opacity * (1 - opacity);
        return {
            delay,
            duration,
            easing,
            css: (_t, u) => `
			transform: ${transform} scale(${1 - (sd * u)});
			opacity: ${target_opacity - (od * u)}
		`
        };
    }

    /* src\composition\special\MultiSelectCodedArrayWrite.svelte generated by Svelte v3.29.4 */

    const { Error: Error_1$2, Object: Object_1$6, console: console_1$5 } = globals;
    const file$f = "src\\composition\\special\\MultiSelectCodedArrayWrite.svelte";

    function get_each_context$4(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[13] = list[i];
    	return child_ctx;
    }

    // (80:4) {:else}
    function create_else_block$a(ctx) {
    	let p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "Tree does not have inputs/inputs does not have list";
    			add_location(p, file$f, 80, 8, 2815);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$a.name,
    		type: "else",
    		source: "(80:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (63:4) {#if tree.inputs && tree.inputs[0].list}
    function create_if_block$c(ctx) {
    	let div;
    	let t0;
    	let button;
    	let mounted;
    	let dispose;
    	let each_value = /*tree*/ ctx[1].inputs[0].list;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$4(get_each_context$4(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t0 = space();
    			button = element("button");
    			button.textContent = "Clear all";
    			attr_dev(button, "class", " button is-light is-danger");
    			attr_dev(button, "type", "button");
    			add_location(button, file$f, 73, 12, 2623);
    			attr_dev(div, "class", "buttons");
    			add_location(div, file$f, 63, 8, 2231);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			append_dev(div, t0);
    			append_dev(div, button);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*clearAll*/ ctx[4], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*selected, tree, select*/ 42) {
    				each_value = /*tree*/ ctx[1].inputs[0].list;
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$4(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$4(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div, t0);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$c.name,
    		type: "if",
    		source: "(63:4) {#if tree.inputs && tree.inputs[0].list}",
    		ctx
    	});

    	return block;
    }

    // (65:12) {#each tree.inputs[0].list as option}
    function create_each_block$4(ctx) {
    	let button;
    	let t_value = /*option*/ ctx[13].label + "";
    	let t;
    	let mounted;
    	let dispose;

    	function click_handler(...args) {
    		return /*click_handler*/ ctx[6](/*option*/ ctx[13], ...args);
    	}

    	function func(...args) {
    		return /*func*/ ctx[7](/*option*/ ctx[13], ...args);
    	}

    	const block = {
    		c: function create() {
    			button = element("button");
    			t = text(t_value);
    			attr_dev(button, "class", "button");
    			attr_dev(button, "type", "button");
    			toggle_class(button, "is-info", /*selected*/ ctx[3].some(func));
    			add_location(button, file$f, 65, 16, 2319);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			append_dev(button, t);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", click_handler, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*tree*/ 2 && t_value !== (t_value = /*option*/ ctx[13].label + "")) set_data_dev(t, t_value);

    			if (dirty & /*selected, tree*/ 10) {
    				toggle_class(button, "is-info", /*selected*/ ctx[3].some(func));
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$4.name,
    		type: "each",
    		source: "(65:12) {#each tree.inputs[0].list as option}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$g(ctx) {
    	let div;
    	let label;
    	let t0_value = /*tree*/ ctx[1].name + "";
    	let t0;
    	let t1;

    	function select_block_type(ctx, dirty) {
    		if (/*tree*/ ctx[1].inputs && /*tree*/ ctx[1].inputs[0].list) return create_if_block$c;
    		return create_else_block$a;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			label = element("label");
    			t0 = text(t0_value);
    			t1 = space();
    			if_block.c();
    			attr_dev(label, "for", /*path*/ ctx[0]);
    			attr_dev(label, "class", "label");
    			add_location(label, file$f, 61, 4, 2126);
    			attr_dev(div, "class", "field");
    			add_location(div, file$f, 60, 0, 2102);
    		},
    		l: function claim(nodes) {
    			throw new Error_1$2("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, label);
    			append_dev(label, t0);
    			append_dev(div, t1);
    			if_block.m(div, null);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*tree*/ 2 && t0_value !== (t0_value = /*tree*/ ctx[1].name + "")) set_data_dev(t0, t0_value);

    			if (dirty & /*path*/ 1) {
    				attr_dev(label, "for", /*path*/ ctx[0]);
    			}

    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(div, null);
    				}
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$g.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$g($$self, $$props, $$invalidate) {
    	let $store,
    		$$unsubscribe_store = noop,
    		$$subscribe_store = () => ($$unsubscribe_store(), $$unsubscribe_store = subscribe(store, $$value => $$invalidate(11, $store = $$value)), store);

    	$$self.$$.on_destroy.push(() => $$unsubscribe_store());
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("MultiSelectCodedArrayWrite", slots, []);
    	var _a, _b;
    	
    	let { path } = $$props;
    	let { tree } = $$props;
    	let { store } = $$props;
    	validate_store(store, "store");
    	$$subscribe_store();
    	let terminology;
    	let selected;

    	const getSelected = store => {
    		const paths = Object.keys(store).filter(p => p.includes(path)).filter(p => p.includes("|code"));

    		const result = paths.map(p => {
    			var _a;

    			const indexString = (_a = p.split(":").pop()) === null || _a === void 0
    			? void 0
    			: _a.split("|")[0];

    			if (!indexString) {
    				throw new Error(`[${p}]cannot parse index`);
    			}

    			const index = parseInt(indexString);
    			const code = store[p];

    			return {
    				index,
    				code,
    				value: store[p.replace("code", "value")]
    			};
    		});

    		return result;
    	};

    	const clearAll = () => {
    		const paths = Object.keys($store).filter(p => p.includes(path));
    		console.log("clearing", { paths });
    		destroyAction(paths, store);
    	};

    	// const deselect = (code: string): void => {
    	//     const allSelected = [...selected]
    	//     clearAll()
    	//     allSelected
    	//     .filter(s=>s.code==code)
    	//     .forEach(a=>select({label: a.value, value: a.code}))
    	// }
    	const select = option => {
    		if (selected.some(s => s.code == option.value)) ; else {
    			const i = selected.length; // TODO: Implement deselect

    			store.update(s => Object.assign(Object.assign({}, s), {
    				[`${path}:${i}|code`]: option.value,
    				[`${path}:${i}|value`]: option.label,
    				[`${path}:${i}|terminology`]: terminology
    			}));
    		}
    	};

    	onDestroy(() => {
    		const paths = Object.keys($store).filter(p => p.includes(path));
    		destroyAction(paths, store);
    	});

    	const writable_props = ["path", "tree", "store"];

    	Object_1$6.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$5.warn(`<MultiSelectCodedArrayWrite> was created with unknown prop '${key}'`);
    	});

    	const click_handler = option => select(option);
    	const func = (option, s) => s.code == option.value;

    	$$self.$$set = $$props => {
    		if ("path" in $$props) $$invalidate(0, path = $$props.path);
    		if ("tree" in $$props) $$invalidate(1, tree = $$props.tree);
    		if ("store" in $$props) $$subscribe_store($$invalidate(2, store = $$props.store));
    	};

    	$$self.$capture_state = () => ({
    		_a,
    		_b,
    		onDestroy,
    		destroyAction,
    		path,
    		tree,
    		store,
    		terminology,
    		selected,
    		getSelected,
    		clearAll,
    		select,
    		$store
    	});

    	$$self.$inject_state = $$props => {
    		if ("_a" in $$props) $$invalidate(8, _a = $$props._a);
    		if ("_b" in $$props) $$invalidate(9, _b = $$props._b);
    		if ("path" in $$props) $$invalidate(0, path = $$props.path);
    		if ("tree" in $$props) $$invalidate(1, tree = $$props.tree);
    		if ("store" in $$props) $$subscribe_store($$invalidate(2, store = $$props.store));
    		if ("terminology" in $$props) terminology = $$props.terminology;
    		if ("selected" in $$props) $$invalidate(3, selected = $$props.selected);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*tree, _a, _b*/ 770) {
    			 terminology = $$invalidate(9, _b = $$invalidate(8, _a = tree === null || tree === void 0 ? void 0 : tree.inputs) === null || _a === void 0
    			? void 0
    			: _a[0].terminology) !== null && _b !== void 0
    			? _b
    			: "local";
    		}

    		if ($$self.$$.dirty & /*$store*/ 2048) {
    			 $$invalidate(3, selected = getSelected($store));
    		}
    	};

    	return [path, tree, store, selected, clearAll, select, click_handler, func];
    }

    class MultiSelectCodedArrayWrite extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$g, create_fragment$g, safe_not_equal, { path: 0, tree: 1, store: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "MultiSelectCodedArrayWrite",
    			options,
    			id: create_fragment$g.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*path*/ ctx[0] === undefined && !("path" in props)) {
    			console_1$5.warn("<MultiSelectCodedArrayWrite> was created without expected prop 'path'");
    		}

    		if (/*tree*/ ctx[1] === undefined && !("tree" in props)) {
    			console_1$5.warn("<MultiSelectCodedArrayWrite> was created without expected prop 'tree'");
    		}

    		if (/*store*/ ctx[2] === undefined && !("store" in props)) {
    			console_1$5.warn("<MultiSelectCodedArrayWrite> was created without expected prop 'store'");
    		}
    	}

    	get path() {
    		throw new Error_1$2("<MultiSelectCodedArrayWrite>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set path(value) {
    		throw new Error_1$2("<MultiSelectCodedArrayWrite>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get tree() {
    		throw new Error_1$2("<MultiSelectCodedArrayWrite>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set tree(value) {
    		throw new Error_1$2("<MultiSelectCodedArrayWrite>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get store() {
    		throw new Error_1$2("<MultiSelectCodedArrayWrite>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set store(value) {
    		throw new Error_1$2("<MultiSelectCodedArrayWrite>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\composition\Group.svelte generated by Svelte v3.29.4 */

    const { Error: Error_1$3, Object: Object_1$7 } = globals;
    const file$g = "src\\composition\\Group.svelte";

    function add_css$3() {
    	var style = element("style");
    	style.id = "svelte-hty4ep-style";
    	style.textContent = ".is-cyan.svelte-hty4ep{background-color:lightcyan}.tag.svelte-hty4ep{cursor:pointer}.bordered.svelte-hty4ep{border-style:solid;border-width:4px;border-color:lightcyan;border-radius:5px}\n/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR3JvdXAuc3ZlbHRlIiwic291cmNlcyI6WyJHcm91cC5zdmVsdGUiXSwic291cmNlc0NvbnRlbnQiOlsiPHNjcmlwdCBsYW5nPVwidHNcIj5pbXBvcnQgTGVhZiBmcm9tIFwiLi9MZWFmLnN2ZWx0ZVwiO1xyXG5pbXBvcnQgQ29udGV4dCBmcm9tIFwiLi4vcm0vQ29udGV4dC5zdmVsdGVcIjtcclxuaW1wb3J0IHsgc2xpZGUsIHNjYWxlIH0gZnJvbSBcInN2ZWx0ZS90cmFuc2l0aW9uXCI7XHJcbjtcclxuO1xyXG5pbXBvcnQgeyBzYW5pdGl6ZURpc3BsYXlGdW5jdGlvbiB9IGZyb20gXCIuLi9ybS91dGlsc1wiO1xyXG5pbXBvcnQgTXVsdGlTZWxlY3RDb2RlZEFycmF5V3JpdGUgZnJvbSBcIi4vc3BlY2lhbC9NdWx0aVNlbGVjdENvZGVkQXJyYXlXcml0ZS5zdmVsdGVcIjtcclxuZXhwb3J0IGxldCB0eXBlO1xyXG5leHBvcnQgbGV0IHBhdGg7XHJcbmV4cG9ydCBsZXQgbGFiZWw7XHJcbmV4cG9ydCBsZXQgcmVwZWF0YWJsZTtcclxuZXhwb3J0IGxldCBjaGlsZHJlbjtcclxuZXhwb3J0IGxldCBjaGlsZENsYXNzID0gXCJmaWVsZFwiO1xyXG5leHBvcnQgbGV0IHN0b3JlO1xyXG5leHBvcnQgbGV0IHJlYWRPbmx5O1xyXG5leHBvcnQgbGV0IGFxbFBhdGg7XHJcbmV4cG9ydCBsZXQgcm1UeXBlO1xyXG5leHBvcnQgbGV0IGN1c3RvbWl6ZSA9IGZhbHNlO1xyXG5leHBvcnQgbGV0IGN1c3RvbWl6ZUZ1bmN0aW9uO1xyXG4vKipcclxuICogQHBhcmFtIHt0cnVlfGZhbHNlfSByZW5kZXIgLSBUbyByZW5kZXIgdGhlIGNvbXBvbmVudCBvciBub3QuXHJcbiAqIEBwYXJhbSB7ZnVuY3Rpb259IHJlbmRlckZ1bmN0aW9uIC0gVGhlIGZ1bmN0aW9uIHRvIHJlbmRlciB0aGUgY29tcG9uZW50IG9yIG5vdC4gVGFrZXMgcHJlY2VkZW5jZSBvdmVyIHJlbmRlciBpZiBwcm92aWRlZC4gSWYgdGhlIHZhbHVlIGlzIG5vdCB0cnVlLCB0aGVuIGl0IGlzIGNvbnNpZGVyZWQgZmFsc2UuXHJcbiAqIEBwYXJhbSB7dHJ1ZXxmYWxzZX0gZGlzcGxheVRpdGxlIC0gVG8gZGlzcGxheSB0aGUgdGl0bGUgb3Igbm90LlxyXG4gKiBAcGFyYW0ge3RydWV8ZmFsc2V9IGNhbkFkZFJlcGVhdGFibGUgLSBGb3IgcmVwZWF0YWJsZSBlbGVtZW50cywgYWxsb3cgYWRkaW5nIG5ldyBlbGVtZW50cz9cclxuICogQHBhcmFtIHt0cnVlfGZhbHNlfSBkaXZpZGVyIC0gQmV0d2VlbiByZXBlYXRhYmxlIGVsZW1lbnRzXHJcbiAqIEBwYXJhbSB7dHJ1ZXxmYWxzZX0gbXVsdGlTZWxlY3RDb2RlZEFycmF5IC0gRGlzcGxheXMgYW4gYXJyYXkgb2YgYWxsIG9wdGlvbnMgaWYgRFZfQ09ERURfVEVYVCBpcyByZXBlYXRhYmxlLlxyXG4gKi9cclxuZXhwb3J0IGxldCBtdWx0aVNlbGVjdENvZGVkQXJyYXkgPSBmYWxzZTtcclxuZXhwb3J0IGxldCBkaXZpZGVyID0gdHJ1ZTtcclxuZXhwb3J0IGxldCByZW5kZXIgPSB1bmRlZmluZWQ7XHJcbmV4cG9ydCBsZXQgcmVuZGVyRnVuY3Rpb24gPSB1bmRlZmluZWQ7XHJcbi8vIEN1cnJlbnRseSBvbmx5IHNpbXBsZSB0ZW1wbGF0ZXNcclxuZXhwb3J0IGxldCBkaXNwbGF5VGl0bGUgPSB0cnVlO1xyXG5leHBvcnQgbGV0IGNhbkFkZFJlcGVhdGFibGUgPSB0cnVlO1xyXG5leHBvcnQgbGV0IHBhc3NDdXN0b21pemUgPSBmYWxzZTtcclxubGV0IGludGVybmFsRGlzcGxheTtcclxuJDogaWYgKHJlbmRlckZ1bmN0aW9uKSB7XHJcbiAgICBpbnRlcm5hbERpc3BsYXkgPSBzYW5pdGl6ZURpc3BsYXlGdW5jdGlvbihwYXRoLCByZW5kZXJGdW5jdGlvbiwgJHN0b3JlKTtcclxufVxyXG5lbHNlIHtcclxuICAgIGludGVybmFsRGlzcGxheSA9IHJlbmRlciAhPT0gbnVsbCAmJiByZW5kZXIgIT09IHZvaWQgMCA/IHJlbmRlciA6IHRydWU7XHJcbn1cclxuY29uc3QgZ2V0Q291bnRGcm9tU3RvcmUgPSAoKSA9PiB7XHJcbiAgICBjb25zdCBwYXRocyA9IE9iamVjdC5rZXlzKCRzdG9yZSkuZmlsdGVyKChwKSA9PiBwLnN0YXJ0c1dpdGgocGF0aCkpO1xyXG4gICAgY29uc3QgcmVnRXhwID0gbmV3IFJlZ0V4cChgJHtwYXRofTooXFxcXGQrKS4qYCk7XHJcbiAgICBjb25zdCBleHRlcm5hbENvdW50ID0gcGF0aHMucmVkdWNlKChwcmV2aW91c1ZhbHVlLCBjdXJyZW50UGF0aCkgPT4ge1xyXG4gICAgICAgIGxldCBtYXRjaGVzID0gY3VycmVudFBhdGgubWF0Y2gocmVnRXhwKTtcclxuICAgICAgICBpZiAobWF0Y2hlcykge1xyXG4gICAgICAgICAgICBsZXQgaW5kZXhTdHJpbmcgPSBtYXRjaGVzWzFdO1xyXG4gICAgICAgICAgICBsZXQgaW5kZXggPSBwYXJzZUludChpbmRleFN0cmluZyk7XHJcbiAgICAgICAgICAgIGluZGV4ID0gaW5kZXggKyAxO1xyXG4gICAgICAgICAgICBpZiAoaW5kZXggPiBwcmV2aW91c1ZhbHVlKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gaW5kZXg7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHByZXZpb3VzVmFsdWU7XHJcbiAgICB9LCAxKTtcclxuICAgIHJldHVybiBleHRlcm5hbENvdW50O1xyXG59O1xyXG5sZXQgY291bnQgPSBnZXRDb3VudEZyb21TdG9yZSgpIHx8IDE7XHJcbmZ1bmN0aW9uIHJlZHVjZUNvdW50KCkge1xyXG4gICAgaWYgKGNvdW50ID4gMSkge1xyXG4gICAgICAgIGNvdW50IC09IDE7XHJcbiAgICB9XHJcbn1cclxuZnVuY3Rpb24gaW5jcmVhc2VDb3VudCgpIHtcclxuICAgIGNvdW50ICs9IDE7XHJcbn1cclxubGV0IHBhdGhzO1xyXG4kOiBwYXRocyA9IE9iamVjdC5rZXlzKCRzdG9yZSkuZmlsdGVyKChwKSA9PiBwLnN0YXJ0c1dpdGgocGF0aCkpO1xyXG4kOiBpZiAocmVhZE9ubHkgJiYgcmVwZWF0YWJsZSkge1xyXG4gICAgbGV0IHJlZ0V4cCA9IG5ldyBSZWdFeHAoYCR7cGF0aH06KFxcXFxkKykuKmApO1xyXG4gICAgbGV0IGV4dGVybmFsQ291bnQgPSBwYXRocy5yZWR1Y2UoKHByZXZpb3VzVmFsdWUsIGN1cnJlbnRQYXRoKSA9PiB7XHJcbiAgICAgICAgbGV0IG1hdGNoZXMgPSBjdXJyZW50UGF0aC5tYXRjaChyZWdFeHApO1xyXG4gICAgICAgIGlmIChtYXRjaGVzKSB7XHJcbiAgICAgICAgICAgIGxldCBpbmRleFN0cmluZyA9IG1hdGNoZXNbMV07XHJcbiAgICAgICAgICAgIGxldCBpbmRleCA9IHBhcnNlSW50KGluZGV4U3RyaW5nKTtcclxuICAgICAgICAgICAgaW5kZXggPSBpbmRleCArIDE7XHJcbiAgICAgICAgICAgIGlmIChpbmRleCA+IHByZXZpb3VzVmFsdWUpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBpbmRleDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gcHJldmlvdXNWYWx1ZTtcclxuICAgIH0sIDEpO1xyXG4gICAgY291bnQgPSBleHRlcm5hbENvdW50IHx8IGNvdW50O1xyXG59XHJcbmlmICh0eXBlICE9PSBcIkdyb3VwXCIpIHtcclxuICAgIHRocm93IG5ldyBFcnJvcihcIkdyb3VwIGNvbXBvbmVudCBnb3QgdHJlZSBub3Qgb2YgdHlwZSBncm91cFwiKTtcclxufVxyXG5jb25zdCBhcHBlbmRQYXRoID0gKHBhcmVudFBhdGgsIGNoaWxkUGF0aCkgPT4ge1xyXG4gICAgaWYgKGNoaWxkUGF0aCkge1xyXG4gICAgICAgIHJldHVybiBgJHtwYXJlbnRQYXRofS8ke2NoaWxkUGF0aH1gO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHBhcmVudFBhdGg7XHJcbn07XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPUdyb3VwLnN2ZWx0ZS5qcy5tYXA8L3NjcmlwdD5cblxueyNpZiBpbnRlcm5hbERpc3BsYXl9XG4gICAgPGRpdiBjbGFzcz17Y2hpbGRDbGFzc30gY2xhc3M6Ym9yZGVyZWQ9e2N1c3RvbWl6ZSAmJiAhcGFzc0N1c3RvbWl6ZX0+XG4gICAgICAgIHsjaWYgY3VzdG9taXplICYmICFwYXNzQ3VzdG9taXplfVxuICAgICAgICAgICAgPHNwYW5cbiAgICAgICAgICAgICAgICBjbGFzcz1cInRhZyBpcy1jeWFuXCJcbiAgICAgICAgICAgICAgICBvbjpjbGljaz17KCkgPT5cbiAgICAgICAgICAgICAgICAgICAgY3VzdG9taXplRnVuY3Rpb24oeyBwYXRoLCBhcWxQYXRoLCB0eXBlLCByZXBlYXRhYmxlIH0pfVxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIHtybVR5cGV9XG4gICAgICAgICAgICAgICAgeyNpZiByZXBlYXRhYmxlfS0gUkVQRUFUQUJMRXsvaWZ9XG4gICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgIHsvaWZ9XG5cbiAgICAgICAgeyNpZiBkaXNwbGF5VGl0bGUgJiYgbGFiZWx9XG4gICAgICAgICAgICA8aDQgY2xhc3M9XCJoYXMtdGV4dC13ZWlnaHQtYm9sZCBpcy1zaXplLTYgbWItMyBoYXMtdGV4dC1ncmV5XCI+XG4gICAgICAgICAgICAgICAge2xhYmVsfVxuICAgICAgICAgICAgPC9oND5cbiAgICAgICAgey9pZn1cbiAgICAgICAgeyNpZiByZXBlYXRhYmxlfVxuICAgICAgICAgICAgeyNpZiBybVR5cGUgPT0gXCJEVl9DT0RFRF9URVhUXCIgJiYgbXVsdGlTZWxlY3RDb2RlZEFycmF5ICYmIGNoaWxkcmVuWzBdfVxuICAgICAgICAgICAgICAgIDxNdWx0aVNlbGVjdENvZGVkQXJyYXlXcml0ZSB0cmVlPXtjaGlsZHJlblswXS50cmVlfSB7cGF0aH0ge3N0b3JlfS8+XG4gICAgICAgICAgICB7OmVsc2V9XG4gICAgICAgICAgICAgICAgeyNlYWNoIFsuLi5BcnJheShjb3VudCkua2V5cygpXSBhcyBpbmRleH1cbiAgICAgICAgICAgICAgICAgICAgPCEtLSB0cmFuc2l0aW9uOnNsaWRlPVwie3tkdXJhdGlvbjogMzAwIH19XCIgLS0+XG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJmaWVsZFwiIHN0eWxlPVwiYm94LXNpemluZzogYm9yZGVyLWJveDtcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxzdmVsdGU6c2VsZlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhdGg9e2Ake3BhdGh9OiR7aW5kZXh9YH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXBlYXRhYmxlPXtmYWxzZX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7cmVhZE9ubHl9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAge3N0b3JlfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHt0eXBlfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtsYWJlbH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7Y2hpbGRyZW59XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlzcGxheVRpdGxlPXtmYWxzZX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7Y3VzdG9taXplfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhc3NDdXN0b21pemU9e2N1c3RvbWl6ZX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7Y3VzdG9taXplRnVuY3Rpb259XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAge3JtVHlwZX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7YXFsUGF0aH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBoaWRlQ2hpbGRUaXRsZT17aW5kZXggPiAwfVxuICAgICAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICAgICAgICAgIHsjaWYgZGl2aWRlciAmJiBjb3VudCA+IDEgJiYgaW5kZXggIT09IGNvdW50IC0gMX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8aHIgLz5cbiAgICAgICAgICAgICAgICAgICAgICAgIHsvaWZ9XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIHsvZWFjaH1cbiAgICAgICAgICAgICAgICB7I2lmIGNhbkFkZFJlcGVhdGFibGV9XG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJidXR0b25zIGlzLXJpZ2h0XCI+XG4gICAgICAgICAgICAgICAgICAgICAgICB7I2lmIGNvdW50ID4gMX1cbiAgICAgICAgICAgICAgICAgICAgICAgIDwhLS0gdHJhbnNpdGlvbjpzY2FsZSAtLT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzOmlzLWhpZGRlbj17cmVhZE9ubHl9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzPVwiYnV0dG9uIGlzLXNtYWxsIGlzLWRhbmdlciBpcy1saWdodFwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uOmNsaWNrPXtyZWR1Y2VDb3VudH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgID48aSBjbGFzcz1cImljb24gaWNvbi1hcnJvdy11cFwiIC8+PC9idXR0b25cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgICAgICB7L2lmfVxuICAgICAgICAgICAgICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzOmlzLWhpZGRlbj17cmVhZE9ubHl9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3M9XCJidXR0b24gaXMtc21hIGxsIGlzLXN1Y2Nlc3MgaXMtbGlnaHRcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uOmNsaWNrPXtpbmNyZWFzZUNvdW50fVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgID48aSBjbGFzcz1cImljb24gaWNvbi1hcnJvdy1kb3duXCIgLz48L2J1dHRvblxuICAgICAgICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICB7L2lmfVxuICAgICAgICAgICAgey9pZn1cbiAgICAgICAgezplbHNlfVxuICAgICAgICAgICAgeyNlYWNoIGNoaWxkcmVuIGFzIGNoaWxkfVxuICAgICAgICAgICAgICAgIHsjaWYgY2hpbGQudHlwZSA9PT0gXCJHcm91cFwifVxuICAgICAgICAgICAgICAgICAgICA8c3ZlbHRlOnNlbGZcbiAgICAgICAgICAgICAgICAgICAgICAgIHsuLi5jaGlsZH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHBhdGg9e2FwcGVuZFBhdGgocGF0aCwgY2hpbGQucGF0aCl9XG4gICAgICAgICAgICAgICAgICAgICAgICB7Y3VzdG9taXplfVxuICAgICAgICAgICAgICAgICAgICAgICAge2N1c3RvbWl6ZUZ1bmN0aW9ufVxuICAgICAgICAgICAgICAgICAgICAgICAge3N0b3JlfVxuICAgICAgICAgICAgICAgICAgICAgICAge3JlYWRPbmx5fVxuICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgIHs6ZWxzZSBpZiBjaGlsZC50eXBlID09PSBcIkxlYWZcIn1cbiAgICAgICAgICAgICAgICAgICAgPExlYWZcbiAgICAgICAgICAgICAgICAgICAgICAgIHsuLi5jaGlsZH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHBhdGg9e2FwcGVuZFBhdGgocGF0aCwgY2hpbGQucGF0aCl9XG4gICAgICAgICAgICAgICAgICAgICAgICB7Y3VzdG9taXplfVxuICAgICAgICAgICAgICAgICAgICAgICAge2N1c3RvbWl6ZUZ1bmN0aW9ufVxuICAgICAgICAgICAgICAgICAgICAgICAge3N0b3JlfVxuICAgICAgICAgICAgICAgICAgICAgICAge3JlYWRPbmx5fVxuICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgIHs6ZWxzZSBpZiBjaGlsZC50eXBlID09PSBcIkNvbnRleHRcIn1cbiAgICAgICAgICAgICAgICAgICAgPENvbnRleHRcbiAgICAgICAgICAgICAgICAgICAgICAgIHsuLi5jaGlsZH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHBhdGg9e2FwcGVuZFBhdGgocGF0aCwgY2hpbGQucGF0aCl9XG4gICAgICAgICAgICAgICAgICAgICAgICB7Y3VzdG9taXplfVxuICAgICAgICAgICAgICAgICAgICAgICAge2N1c3RvbWl6ZUZ1bmN0aW9ufVxuICAgICAgICAgICAgICAgICAgICAgICAge3N0b3JlfVxuICAgICAgICAgICAgICAgICAgICAgICAge3JlYWRPbmx5fVxuICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgIHs6ZWxzZX1cbiAgICAgICAgICAgICAgICAgICAgPHA+Tm90IEdyb3VwIG9yIExlYWYgdHlwZToge2NoaWxkLnR5cGV9PC9wPlxuICAgICAgICAgICAgICAgICAgICA8cHJlPntKU09OLnN0cmluZ2lmeShjaGlsZCwgbnVsbCwgMil9PC9wcmU+XG4gICAgICAgICAgICAgICAgey9pZn1cbiAgICAgICAgICAgIHsvZWFjaH1cbiAgICAgICAgey9pZn1cbiAgICA8L2Rpdj5cbns6ZWxzZSBpZiBjdXN0b21pemV9XG4gICAgPGRpdiBjbGFzcz17Y2hpbGRDbGFzc30gY2xhc3M6Ym9yZGVyZWQ9e2N1c3RvbWl6ZSAmJiAhcGFzc0N1c3RvbWl6ZX0+XG4gICAgICAgIHsjaWYgY3VzdG9taXplICYmICFwYXNzQ3VzdG9taXplfVxuICAgICAgICAgICAgPHNwYW5cbiAgICAgICAgICAgICAgICBjbGFzcz1cInRhZyBpcy1jeWFuXCJcbiAgICAgICAgICAgICAgICBvbjpjbGljaz17KCkgPT5cbiAgICAgICAgICAgICAgICAgICAgY3VzdG9taXplRnVuY3Rpb24oeyBwYXRoLCBhcWxQYXRoLCB0eXBlLCByZXBlYXRhYmxlIH0pfVxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIHtybVR5cGV9XG4gICAgICAgICAgICAgICAgeyNpZiByZXBlYXRhYmxlfS0gUkVQRUFUQUJMRXsvaWZ9XG4gICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgIHsvaWZ9XG4gICAgPC9kaXY+XG57L2lmfVxuXG48c3R5bGU+XG4gICAgLmlzLWN5YW4ge1xuICAgICAgICBiYWNrZ3JvdW5kLWNvbG9yOiBsaWdodGN5YW47XG4gICAgfVxuICAgIC50YWcge1xuICAgICAgICBjdXJzb3I6IHBvaW50ZXI7XG4gICAgfVxuICAgIC5ib3JkZXJlZCB7XG4gICAgICAgIGJvcmRlci1zdHlsZTogc29saWQ7XG4gICAgICAgIGJvcmRlci13aWR0aDogNHB4O1xuICAgICAgICBib3JkZXItY29sb3I6IGxpZ2h0Y3lhbjtcbiAgICAgICAgYm9yZGVyLXJhZGl1czogNXB4O1xuICAgIH1cbjwvc3R5bGU+XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBeU5JLFFBQVEsY0FBQyxDQUFDLEFBQ04sZ0JBQWdCLENBQUUsU0FBUyxBQUMvQixDQUFDLEFBQ0QsSUFBSSxjQUFDLENBQUMsQUFDRixNQUFNLENBQUUsT0FBTyxBQUNuQixDQUFDLEFBQ0QsU0FBUyxjQUFDLENBQUMsQUFDUCxZQUFZLENBQUUsS0FBSyxDQUNuQixZQUFZLENBQUUsR0FBRyxDQUNqQixZQUFZLENBQUUsU0FBUyxDQUN2QixhQUFhLENBQUUsR0FBRyxBQUN0QixDQUFDIn0= */";
    	append_dev(document.head, style);
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[32] = list[i];
    	return child_ctx;
    }

    function get_each_context$5(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[29] = list[i];
    	return child_ctx;
    }

    // (202:20) 
    function create_if_block_12(ctx) {
    	let div;
    	let div_class_value;
    	let if_block = /*customize*/ ctx[10] && !/*passCustomize*/ ctx[16] && create_if_block_13(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (if_block) if_block.c();
    			attr_dev(div, "class", div_class_value = "" + (null_to_empty(/*childClass*/ ctx[5]) + " svelte-hty4ep"));
    			toggle_class(div, "bordered", /*customize*/ ctx[10] && !/*passCustomize*/ ctx[16]);
    			add_location(div, file$g, 202, 4, 7551);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if (if_block) if_block.m(div, null);
    		},
    		p: function update(ctx, dirty) {
    			if (/*customize*/ ctx[10] && !/*passCustomize*/ ctx[16]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_13(ctx);
    					if_block.c();
    					if_block.m(div, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty[0] & /*childClass*/ 32 && div_class_value !== (div_class_value = "" + (null_to_empty(/*childClass*/ ctx[5]) + " svelte-hty4ep"))) {
    				attr_dev(div, "class", div_class_value);
    			}

    			if (dirty[0] & /*childClass, customize, passCustomize*/ 66592) {
    				toggle_class(div, "bordered", /*customize*/ ctx[10] && !/*passCustomize*/ ctx[16]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (if_block) if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_12.name,
    		type: "if",
    		source: "(202:20) ",
    		ctx
    	});

    	return block;
    }

    // (98:0) {#if internalDisplay}
    function create_if_block$d(ctx) {
    	let div;
    	let t0;
    	let t1;
    	let current_block_type_index;
    	let if_block2;
    	let div_class_value;
    	let current;
    	let if_block0 = /*customize*/ ctx[10] && !/*passCustomize*/ ctx[16] && create_if_block_10(ctx);
    	let if_block1 = /*displayTitle*/ ctx[14] && /*label*/ ctx[2] && create_if_block_9(ctx);
    	const if_block_creators = [create_if_block_1$8, create_else_block_1$3];
    	const if_blocks = [];

    	function select_block_type_1(ctx, dirty) {
    		if (/*repeatable*/ ctx[3]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type_1(ctx);
    	if_block2 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (if_block0) if_block0.c();
    			t0 = space();
    			if (if_block1) if_block1.c();
    			t1 = space();
    			if_block2.c();
    			attr_dev(div, "class", div_class_value = "" + (null_to_empty(/*childClass*/ ctx[5]) + " svelte-hty4ep"));
    			toggle_class(div, "bordered", /*customize*/ ctx[10] && !/*passCustomize*/ ctx[16]);
    			add_location(div, file$g, 98, 4, 3382);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if (if_block0) if_block0.m(div, null);
    			append_dev(div, t0);
    			if (if_block1) if_block1.m(div, null);
    			append_dev(div, t1);
    			if_blocks[current_block_type_index].m(div, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (/*customize*/ ctx[10] && !/*passCustomize*/ ctx[16]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_10(ctx);
    					if_block0.c();
    					if_block0.m(div, t0);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*displayTitle*/ ctx[14] && /*label*/ ctx[2]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_9(ctx);
    					if_block1.c();
    					if_block1.m(div, t1);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type_1(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block2 = if_blocks[current_block_type_index];

    				if (!if_block2) {
    					if_block2 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block2.c();
    				}

    				transition_in(if_block2, 1);
    				if_block2.m(div, null);
    			}

    			if (!current || dirty[0] & /*childClass*/ 32 && div_class_value !== (div_class_value = "" + (null_to_empty(/*childClass*/ ctx[5]) + " svelte-hty4ep"))) {
    				attr_dev(div, "class", div_class_value);
    			}

    			if (dirty[0] & /*childClass, customize, passCustomize*/ 66592) {
    				toggle_class(div, "bordered", /*customize*/ ctx[10] && !/*passCustomize*/ ctx[16]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block2);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block2);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			if_blocks[current_block_type_index].d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$d.name,
    		type: "if",
    		source: "(98:0) {#if internalDisplay}",
    		ctx
    	});

    	return block;
    }

    // (204:8) {#if customize && !passCustomize}
    function create_if_block_13(ctx) {
    	let span;
    	let t0;
    	let t1;
    	let mounted;
    	let dispose;
    	let if_block = /*repeatable*/ ctx[3] && create_if_block_14(ctx);

    	const block = {
    		c: function create() {
    			span = element("span");
    			t0 = text(/*rmType*/ ctx[9]);
    			t1 = space();
    			if (if_block) if_block.c();
    			attr_dev(span, "class", "tag is-cyan svelte-hty4ep");
    			add_location(span, file$g, 204, 12, 7675);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t0);
    			append_dev(span, t1);
    			if (if_block) if_block.m(span, null);

    			if (!mounted) {
    				dispose = listen_dev(span, "click", /*click_handler_1*/ ctx[25], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*rmType*/ 512) set_data_dev(t0, /*rmType*/ ctx[9]);

    			if (/*repeatable*/ ctx[3]) {
    				if (if_block) ; else {
    					if_block = create_if_block_14(ctx);
    					if_block.c();
    					if_block.m(span, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			if (if_block) if_block.d();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_13.name,
    		type: "if",
    		source: "(204:8) {#if customize && !passCustomize}",
    		ctx
    	});

    	return block;
    }

    // (211:16) {#if repeatable}
    function create_if_block_14(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("- REPEATABLE");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_14.name,
    		type: "if",
    		source: "(211:16) {#if repeatable}",
    		ctx
    	});

    	return block;
    }

    // (100:8) {#if customize && !passCustomize}
    function create_if_block_10(ctx) {
    	let span;
    	let t0;
    	let t1;
    	let mounted;
    	let dispose;
    	let if_block = /*repeatable*/ ctx[3] && create_if_block_11(ctx);

    	const block = {
    		c: function create() {
    			span = element("span");
    			t0 = text(/*rmType*/ ctx[9]);
    			t1 = space();
    			if (if_block) if_block.c();
    			attr_dev(span, "class", "tag is-cyan svelte-hty4ep");
    			add_location(span, file$g, 100, 12, 3506);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t0);
    			append_dev(span, t1);
    			if (if_block) if_block.m(span, null);

    			if (!mounted) {
    				dispose = listen_dev(span, "click", /*click_handler*/ ctx[24], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*rmType*/ 512) set_data_dev(t0, /*rmType*/ ctx[9]);

    			if (/*repeatable*/ ctx[3]) {
    				if (if_block) ; else {
    					if_block = create_if_block_11(ctx);
    					if_block.c();
    					if_block.m(span, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			if (if_block) if_block.d();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_10.name,
    		type: "if",
    		source: "(100:8) {#if customize && !passCustomize}",
    		ctx
    	});

    	return block;
    }

    // (107:16) {#if repeatable}
    function create_if_block_11(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("- REPEATABLE");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_11.name,
    		type: "if",
    		source: "(107:16) {#if repeatable}",
    		ctx
    	});

    	return block;
    }

    // (111:8) {#if displayTitle && label}
    function create_if_block_9(ctx) {
    	let h4;
    	let t;

    	const block = {
    		c: function create() {
    			h4 = element("h4");
    			t = text(/*label*/ ctx[2]);
    			attr_dev(h4, "class", "has-text-weight-bold is-size-6 mb-3 has-text-grey");
    			add_location(h4, file$g, 111, 12, 3828);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h4, anchor);
    			append_dev(h4, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*label*/ 4) set_data_dev(t, /*label*/ ctx[2]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h4);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_9.name,
    		type: "if",
    		source: "(111:8) {#if displayTitle && label}",
    		ctx
    	});

    	return block;
    }

    // (166:8) {:else}
    function create_else_block_1$3(ctx) {
    	let each_1_anchor;
    	let current;
    	let each_value_1 = /*children*/ ctx[4];
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*children, appendPath, path, customize, customizeFunction, store, readOnly*/ 2100434) {
    				each_value_1 = /*children*/ ctx[4];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block_1(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				group_outros();

    				for (i = each_value_1.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value_1.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_1$3.name,
    		type: "else",
    		source: "(166:8) {:else}",
    		ctx
    	});

    	return block;
    }

    // (116:8) {#if repeatable}
    function create_if_block_1$8(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block_2$2, create_else_block$b];
    	const if_blocks = [];

    	function select_block_type_2(ctx, dirty) {
    		if (/*rmType*/ ctx[9] == "DV_CODED_TEXT" && /*multiSelectCodedArray*/ ctx[12] && /*children*/ ctx[4][0]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type_2(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type_2(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$8.name,
    		type: "if",
    		source: "(116:8) {#if repeatable}",
    		ctx
    	});

    	return block;
    }

    // (195:16) {:else}
    function create_else_block_2(ctx) {
    	let p;
    	let t0;
    	let t1_value = /*child*/ ctx[32].type + "";
    	let t1;
    	let t2;
    	let pre;
    	let t3_value = JSON.stringify(/*child*/ ctx[32], null, 2) + "";
    	let t3;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t0 = text("Not Group or Leaf type: ");
    			t1 = text(t1_value);
    			t2 = space();
    			pre = element("pre");
    			t3 = text(t3_value);
    			add_location(p, file$g, 195, 20, 7351);
    			add_location(pre, file$g, 196, 20, 7415);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t0);
    			append_dev(p, t1);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, pre, anchor);
    			append_dev(pre, t3);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*children*/ 16 && t1_value !== (t1_value = /*child*/ ctx[32].type + "")) set_data_dev(t1, t1_value);
    			if (dirty[0] & /*children*/ 16 && t3_value !== (t3_value = JSON.stringify(/*child*/ ctx[32], null, 2) + "")) set_data_dev(t3, t3_value);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(pre);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_2.name,
    		type: "else",
    		source: "(195:16) {:else}",
    		ctx
    	});

    	return block;
    }

    // (186:51) 
    function create_if_block_8(ctx) {
    	let context;
    	let current;

    	const context_spread_levels = [
    		/*child*/ ctx[32],
    		{
    			path: /*appendPath*/ ctx[21](/*path*/ ctx[1], /*child*/ ctx[32].path)
    		},
    		{ customize: /*customize*/ ctx[10] },
    		{
    			customizeFunction: /*customizeFunction*/ ctx[11]
    		},
    		{ store: /*store*/ ctx[6] },
    		{ readOnly: /*readOnly*/ ctx[7] }
    	];

    	let context_props = {};

    	for (let i = 0; i < context_spread_levels.length; i += 1) {
    		context_props = assign(context_props, context_spread_levels[i]);
    	}

    	context = new Context({ props: context_props, $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(context.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(context, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const context_changes = (dirty[0] & /*children, appendPath, path, customize, customizeFunction, store, readOnly*/ 2100434)
    			? get_spread_update(context_spread_levels, [
    					dirty[0] & /*children*/ 16 && get_spread_object(/*child*/ ctx[32]),
    					dirty[0] & /*appendPath, path, children*/ 2097170 && {
    						path: /*appendPath*/ ctx[21](/*path*/ ctx[1], /*child*/ ctx[32].path)
    					},
    					dirty[0] & /*customize*/ 1024 && { customize: /*customize*/ ctx[10] },
    					dirty[0] & /*customizeFunction*/ 2048 && {
    						customizeFunction: /*customizeFunction*/ ctx[11]
    					},
    					dirty[0] & /*store*/ 64 && { store: /*store*/ ctx[6] },
    					dirty[0] & /*readOnly*/ 128 && { readOnly: /*readOnly*/ ctx[7] }
    				])
    			: {};

    			context.$set(context_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(context.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(context.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(context, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_8.name,
    		type: "if",
    		source: "(186:51) ",
    		ctx
    	});

    	return block;
    }

    // (177:48) 
    function create_if_block_7(ctx) {
    	let leaf;
    	let current;

    	const leaf_spread_levels = [
    		/*child*/ ctx[32],
    		{
    			path: /*appendPath*/ ctx[21](/*path*/ ctx[1], /*child*/ ctx[32].path)
    		},
    		{ customize: /*customize*/ ctx[10] },
    		{
    			customizeFunction: /*customizeFunction*/ ctx[11]
    		},
    		{ store: /*store*/ ctx[6] },
    		{ readOnly: /*readOnly*/ ctx[7] }
    	];

    	let leaf_props = {};

    	for (let i = 0; i < leaf_spread_levels.length; i += 1) {
    		leaf_props = assign(leaf_props, leaf_spread_levels[i]);
    	}

    	leaf = new Leaf({ props: leaf_props, $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(leaf.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(leaf, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const leaf_changes = (dirty[0] & /*children, appendPath, path, customize, customizeFunction, store, readOnly*/ 2100434)
    			? get_spread_update(leaf_spread_levels, [
    					dirty[0] & /*children*/ 16 && get_spread_object(/*child*/ ctx[32]),
    					dirty[0] & /*appendPath, path, children*/ 2097170 && {
    						path: /*appendPath*/ ctx[21](/*path*/ ctx[1], /*child*/ ctx[32].path)
    					},
    					dirty[0] & /*customize*/ 1024 && { customize: /*customize*/ ctx[10] },
    					dirty[0] & /*customizeFunction*/ 2048 && {
    						customizeFunction: /*customizeFunction*/ ctx[11]
    					},
    					dirty[0] & /*store*/ 64 && { store: /*store*/ ctx[6] },
    					dirty[0] & /*readOnly*/ 128 && { readOnly: /*readOnly*/ ctx[7] }
    				])
    			: {};

    			leaf.$set(leaf_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(leaf.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(leaf.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(leaf, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_7.name,
    		type: "if",
    		source: "(177:48) ",
    		ctx
    	});

    	return block;
    }

    // (168:16) {#if child.type === "Group"}
    function create_if_block_6(ctx) {
    	let group;
    	let current;

    	const group_spread_levels = [
    		/*child*/ ctx[32],
    		{
    			path: /*appendPath*/ ctx[21](/*path*/ ctx[1], /*child*/ ctx[32].path)
    		},
    		{ customize: /*customize*/ ctx[10] },
    		{
    			customizeFunction: /*customizeFunction*/ ctx[11]
    		},
    		{ store: /*store*/ ctx[6] },
    		{ readOnly: /*readOnly*/ ctx[7] }
    	];

    	let group_props = {};

    	for (let i = 0; i < group_spread_levels.length; i += 1) {
    		group_props = assign(group_props, group_spread_levels[i]);
    	}

    	group = new Group({ props: group_props, $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(group.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(group, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const group_changes = (dirty[0] & /*children, appendPath, path, customize, customizeFunction, store, readOnly*/ 2100434)
    			? get_spread_update(group_spread_levels, [
    					dirty[0] & /*children*/ 16 && get_spread_object(/*child*/ ctx[32]),
    					dirty[0] & /*appendPath, path, children*/ 2097170 && {
    						path: /*appendPath*/ ctx[21](/*path*/ ctx[1], /*child*/ ctx[32].path)
    					},
    					dirty[0] & /*customize*/ 1024 && { customize: /*customize*/ ctx[10] },
    					dirty[0] & /*customizeFunction*/ 2048 && {
    						customizeFunction: /*customizeFunction*/ ctx[11]
    					},
    					dirty[0] & /*store*/ 64 && { store: /*store*/ ctx[6] },
    					dirty[0] & /*readOnly*/ 128 && { readOnly: /*readOnly*/ ctx[7] }
    				])
    			: {};

    			group.$set(group_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(group.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(group.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(group, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_6.name,
    		type: "if",
    		source: "(168:16) {#if child.type === \\\"Group\\\"}",
    		ctx
    	});

    	return block;
    }

    // (167:12) {#each children as child}
    function create_each_block_1(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block_6, create_if_block_7, create_if_block_8, create_else_block_2];
    	const if_blocks = [];

    	function select_block_type_3(ctx, dirty) {
    		if (/*child*/ ctx[32].type === "Group") return 0;
    		if (/*child*/ ctx[32].type === "Leaf") return 1;
    		if (/*child*/ ctx[32].type === "Context") return 2;
    		return 3;
    	}

    	current_block_type_index = select_block_type_3(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type_3(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(167:12) {#each children as child}",
    		ctx
    	});

    	return block;
    }

    // (119:12) {:else}
    function create_else_block$b(ctx) {
    	let t;
    	let if_block_anchor;
    	let current;
    	let each_value = [...Array(/*count*/ ctx[18]).keys()];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$5(get_each_context$5(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	let if_block = /*canAddRepeatable*/ ctx[15] && create_if_block_3$1(ctx);

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t = space();
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, t, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*divider, count, path, readOnly, store, type, label, children, customize, customizeFunction, rmType, aqlPath*/ 274391) {
    				each_value = [...Array(/*count*/ ctx[18]).keys()];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$5(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$5(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(t.parentNode, t);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}

    			if (/*canAddRepeatable*/ ctx[15]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_3$1(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(t);
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$b.name,
    		type: "else",
    		source: "(119:12) {:else}",
    		ctx
    	});

    	return block;
    }

    // (117:12) {#if rmType == "DV_CODED_TEXT" && multiSelectCodedArray && children[0]}
    function create_if_block_2$2(ctx) {
    	let multiselectcodedarraywrite;
    	let current;

    	multiselectcodedarraywrite = new MultiSelectCodedArrayWrite({
    			props: {
    				tree: /*children*/ ctx[4][0].tree,
    				path: /*path*/ ctx[1],
    				store: /*store*/ ctx[6]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(multiselectcodedarraywrite.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(multiselectcodedarraywrite, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const multiselectcodedarraywrite_changes = {};
    			if (dirty[0] & /*children*/ 16) multiselectcodedarraywrite_changes.tree = /*children*/ ctx[4][0].tree;
    			if (dirty[0] & /*path*/ 2) multiselectcodedarraywrite_changes.path = /*path*/ ctx[1];
    			if (dirty[0] & /*store*/ 64) multiselectcodedarraywrite_changes.store = /*store*/ ctx[6];
    			multiselectcodedarraywrite.$set(multiselectcodedarraywrite_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(multiselectcodedarraywrite.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(multiselectcodedarraywrite.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(multiselectcodedarraywrite, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$2.name,
    		type: "if",
    		source: "(117:12) {#if rmType == \\\"DV_CODED_TEXT\\\" && multiSelectCodedArray && children[0]}",
    		ctx
    	});

    	return block;
    }

    // (139:24) {#if divider && count > 1 && index !== count - 1}
    function create_if_block_5(ctx) {
    	let hr;

    	const block = {
    		c: function create() {
    			hr = element("hr");
    			add_location(hr, file$g, 139, 28, 5131);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, hr, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(hr);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5.name,
    		type: "if",
    		source: "(139:24) {#if divider && count > 1 && index !== count - 1}",
    		ctx
    	});

    	return block;
    }

    // (120:16) {#each [...Array(count).keys()] as index}
    function create_each_block$5(ctx) {
    	let div;
    	let group;
    	let t;
    	let current;

    	group = new Group({
    			props: {
    				path: `${/*path*/ ctx[1]}:${/*index*/ ctx[29]}`,
    				repeatable: false,
    				readOnly: /*readOnly*/ ctx[7],
    				store: /*store*/ ctx[6],
    				type: /*type*/ ctx[0],
    				label: /*label*/ ctx[2],
    				children: /*children*/ ctx[4],
    				displayTitle: false,
    				customize: /*customize*/ ctx[10],
    				passCustomize: /*customize*/ ctx[10],
    				customizeFunction: /*customizeFunction*/ ctx[11],
    				rmType: /*rmType*/ ctx[9],
    				aqlPath: /*aqlPath*/ ctx[8],
    				hideChildTitle: /*index*/ ctx[29] > 0
    			},
    			$$inline: true
    		});

    	let if_block = /*divider*/ ctx[13] && /*count*/ ctx[18] > 1 && /*index*/ ctx[29] !== /*count*/ ctx[18] - 1 && create_if_block_5(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(group.$$.fragment);
    			t = space();
    			if (if_block) if_block.c();
    			attr_dev(div, "class", "field");
    			set_style(div, "box-sizing", "border-box");
    			add_location(div, file$g, 121, 20, 4306);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(group, div, null);
    			append_dev(div, t);
    			if (if_block) if_block.m(div, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const group_changes = {};
    			if (dirty[0] & /*path, count*/ 262146) group_changes.path = `${/*path*/ ctx[1]}:${/*index*/ ctx[29]}`;
    			if (dirty[0] & /*readOnly*/ 128) group_changes.readOnly = /*readOnly*/ ctx[7];
    			if (dirty[0] & /*store*/ 64) group_changes.store = /*store*/ ctx[6];
    			if (dirty[0] & /*type*/ 1) group_changes.type = /*type*/ ctx[0];
    			if (dirty[0] & /*label*/ 4) group_changes.label = /*label*/ ctx[2];
    			if (dirty[0] & /*children*/ 16) group_changes.children = /*children*/ ctx[4];
    			if (dirty[0] & /*customize*/ 1024) group_changes.customize = /*customize*/ ctx[10];
    			if (dirty[0] & /*customize*/ 1024) group_changes.passCustomize = /*customize*/ ctx[10];
    			if (dirty[0] & /*customizeFunction*/ 2048) group_changes.customizeFunction = /*customizeFunction*/ ctx[11];
    			if (dirty[0] & /*rmType*/ 512) group_changes.rmType = /*rmType*/ ctx[9];
    			if (dirty[0] & /*aqlPath*/ 256) group_changes.aqlPath = /*aqlPath*/ ctx[8];
    			if (dirty[0] & /*count*/ 262144) group_changes.hideChildTitle = /*index*/ ctx[29] > 0;
    			group.$set(group_changes);

    			if (/*divider*/ ctx[13] && /*count*/ ctx[18] > 1 && /*index*/ ctx[29] !== /*count*/ ctx[18] - 1) {
    				if (if_block) ; else {
    					if_block = create_if_block_5(ctx);
    					if_block.c();
    					if_block.m(div, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(group.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(group.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(group);
    			if (if_block) if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$5.name,
    		type: "each",
    		source: "(120:16) {#each [...Array(count).keys()] as index}",
    		ctx
    	});

    	return block;
    }

    // (144:16) {#if canAddRepeatable}
    function create_if_block_3$1(ctx) {
    	let div;
    	let t;
    	let button;
    	let i;
    	let mounted;
    	let dispose;
    	let if_block = /*count*/ ctx[18] > 1 && create_if_block_4$1(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (if_block) if_block.c();
    			t = space();
    			button = element("button");
    			i = element("i");
    			attr_dev(i, "class", "icon icon-arrow-down");
    			add_location(i, file$g, 160, 29, 6088);
    			attr_dev(button, "class", "button is-sma ll is-success is-light");
    			attr_dev(button, "type", "button");
    			toggle_class(button, "is-hidden", /*readOnly*/ ctx[7]);
    			add_location(button, file$g, 155, 24, 5828);
    			attr_dev(div, "class", "buttons is-right");
    			add_location(div, file$g, 144, 20, 5278);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if (if_block) if_block.m(div, null);
    			append_dev(div, t);
    			append_dev(div, button);
    			append_dev(button, i);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*increaseCount*/ ctx[20], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (/*count*/ ctx[18] > 1) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_4$1(ctx);
    					if_block.c();
    					if_block.m(div, t);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty[0] & /*readOnly*/ 128) {
    				toggle_class(button, "is-hidden", /*readOnly*/ ctx[7]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (if_block) if_block.d();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3$1.name,
    		type: "if",
    		source: "(144:16) {#if canAddRepeatable}",
    		ctx
    	});

    	return block;
    }

    // (146:24) {#if count > 1}
    function create_if_block_4$1(ctx) {
    	let button;
    	let i;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			i = element("i");
    			attr_dev(i, "class", "icon icon-arrow-up");
    			add_location(i, file$g, 152, 33, 5703);
    			attr_dev(button, "class", "button is-small is-danger is-light");
    			attr_dev(button, "type", "button");
    			toggle_class(button, "is-hidden", /*readOnly*/ ctx[7]);
    			add_location(button, file$g, 147, 28, 5427);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			append_dev(button, i);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*reduceCount*/ ctx[19], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*readOnly*/ 128) {
    				toggle_class(button, "is-hidden", /*readOnly*/ ctx[7]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4$1.name,
    		type: "if",
    		source: "(146:24) {#if count > 1}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$h(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block$d, create_if_block_12];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*internalDisplay*/ ctx[17]) return 0;
    		if (/*customize*/ ctx[10]) return 1;
    		return -1;
    	}

    	if (~(current_block_type_index = select_block_type(ctx))) {
    		if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	}

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error_1$3("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].m(target, anchor);
    			}

    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if (~current_block_type_index) {
    					if_blocks[current_block_type_index].p(ctx, dirty);
    				}
    			} else {
    				if (if_block) {
    					group_outros();

    					transition_out(if_blocks[previous_block_index], 1, 1, () => {
    						if_blocks[previous_block_index] = null;
    					});

    					check_outros();
    				}

    				if (~current_block_type_index) {
    					if_block = if_blocks[current_block_type_index];

    					if (!if_block) {
    						if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    						if_block.c();
    					}

    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				} else {
    					if_block = null;
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].d(detaching);
    			}

    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$h.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$h($$self, $$props, $$invalidate) {
    	let $store,
    		$$unsubscribe_store = noop,
    		$$subscribe_store = () => ($$unsubscribe_store(), $$unsubscribe_store = subscribe(store, $$value => $$invalidate(27, $store = $$value)), store);

    	$$self.$$.on_destroy.push(() => $$unsubscribe_store());
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Group", slots, []);
    	
    	
    	let { type } = $$props;
    	let { path } = $$props;
    	let { label } = $$props;
    	let { repeatable } = $$props;
    	let { children } = $$props;
    	let { childClass = "field" } = $$props;
    	let { store } = $$props;
    	validate_store(store, "store");
    	$$subscribe_store();
    	let { readOnly } = $$props;
    	let { aqlPath } = $$props;
    	let { rmType } = $$props;
    	let { customize = false } = $$props;
    	let { customizeFunction } = $$props;
    	let { multiSelectCodedArray = false } = $$props;
    	let { divider = true } = $$props;
    	let { render = undefined } = $$props;
    	let { renderFunction = undefined } = $$props;
    	let { displayTitle = true } = $$props;
    	let { canAddRepeatable = true } = $$props;
    	let { passCustomize = false } = $$props;
    	let internalDisplay;

    	const getCountFromStore = () => {
    		const paths = Object.keys($store).filter(p => p.startsWith(path));
    		const regExp = new RegExp(`${path}:(\\d+).*`);

    		const externalCount = paths.reduce(
    			(previousValue, currentPath) => {
    				let matches = currentPath.match(regExp);

    				if (matches) {
    					let indexString = matches[1];
    					let index = parseInt(indexString);
    					index = index + 1;

    					if (index > previousValue) {
    						return index;
    					}
    				}

    				return previousValue;
    			},
    			1
    		);

    		return externalCount;
    	};

    	let count = getCountFromStore() || 1;

    	function reduceCount() {
    		if (count > 1) {
    			$$invalidate(18, count -= 1);
    		}
    	}

    	function increaseCount() {
    		$$invalidate(18, count += 1);
    	}

    	let paths;

    	if (type !== "Group") {
    		throw new Error("Group component got tree not of type group");
    	}

    	const appendPath = (parentPath, childPath) => {
    		if (childPath) {
    			return `${parentPath}/${childPath}`;
    		}

    		return parentPath;
    	};

    	const writable_props = [
    		"type",
    		"path",
    		"label",
    		"repeatable",
    		"children",
    		"childClass",
    		"store",
    		"readOnly",
    		"aqlPath",
    		"rmType",
    		"customize",
    		"customizeFunction",
    		"multiSelectCodedArray",
    		"divider",
    		"render",
    		"renderFunction",
    		"displayTitle",
    		"canAddRepeatable",
    		"passCustomize"
    	];

    	Object_1$7.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Group> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => customizeFunction({ path, aqlPath, type, repeatable });
    	const click_handler_1 = () => customizeFunction({ path, aqlPath, type, repeatable });

    	$$self.$$set = $$props => {
    		if ("type" in $$props) $$invalidate(0, type = $$props.type);
    		if ("path" in $$props) $$invalidate(1, path = $$props.path);
    		if ("label" in $$props) $$invalidate(2, label = $$props.label);
    		if ("repeatable" in $$props) $$invalidate(3, repeatable = $$props.repeatable);
    		if ("children" in $$props) $$invalidate(4, children = $$props.children);
    		if ("childClass" in $$props) $$invalidate(5, childClass = $$props.childClass);
    		if ("store" in $$props) $$subscribe_store($$invalidate(6, store = $$props.store));
    		if ("readOnly" in $$props) $$invalidate(7, readOnly = $$props.readOnly);
    		if ("aqlPath" in $$props) $$invalidate(8, aqlPath = $$props.aqlPath);
    		if ("rmType" in $$props) $$invalidate(9, rmType = $$props.rmType);
    		if ("customize" in $$props) $$invalidate(10, customize = $$props.customize);
    		if ("customizeFunction" in $$props) $$invalidate(11, customizeFunction = $$props.customizeFunction);
    		if ("multiSelectCodedArray" in $$props) $$invalidate(12, multiSelectCodedArray = $$props.multiSelectCodedArray);
    		if ("divider" in $$props) $$invalidate(13, divider = $$props.divider);
    		if ("render" in $$props) $$invalidate(22, render = $$props.render);
    		if ("renderFunction" in $$props) $$invalidate(23, renderFunction = $$props.renderFunction);
    		if ("displayTitle" in $$props) $$invalidate(14, displayTitle = $$props.displayTitle);
    		if ("canAddRepeatable" in $$props) $$invalidate(15, canAddRepeatable = $$props.canAddRepeatable);
    		if ("passCustomize" in $$props) $$invalidate(16, passCustomize = $$props.passCustomize);
    	};

    	$$self.$capture_state = () => ({
    		Leaf,
    		Context,
    		slide,
    		scale,
    		sanitizeDisplayFunction,
    		MultiSelectCodedArrayWrite,
    		type,
    		path,
    		label,
    		repeatable,
    		children,
    		childClass,
    		store,
    		readOnly,
    		aqlPath,
    		rmType,
    		customize,
    		customizeFunction,
    		multiSelectCodedArray,
    		divider,
    		render,
    		renderFunction,
    		displayTitle,
    		canAddRepeatable,
    		passCustomize,
    		internalDisplay,
    		getCountFromStore,
    		count,
    		reduceCount,
    		increaseCount,
    		paths,
    		appendPath,
    		$store
    	});

    	$$self.$inject_state = $$props => {
    		if ("type" in $$props) $$invalidate(0, type = $$props.type);
    		if ("path" in $$props) $$invalidate(1, path = $$props.path);
    		if ("label" in $$props) $$invalidate(2, label = $$props.label);
    		if ("repeatable" in $$props) $$invalidate(3, repeatable = $$props.repeatable);
    		if ("children" in $$props) $$invalidate(4, children = $$props.children);
    		if ("childClass" in $$props) $$invalidate(5, childClass = $$props.childClass);
    		if ("store" in $$props) $$subscribe_store($$invalidate(6, store = $$props.store));
    		if ("readOnly" in $$props) $$invalidate(7, readOnly = $$props.readOnly);
    		if ("aqlPath" in $$props) $$invalidate(8, aqlPath = $$props.aqlPath);
    		if ("rmType" in $$props) $$invalidate(9, rmType = $$props.rmType);
    		if ("customize" in $$props) $$invalidate(10, customize = $$props.customize);
    		if ("customizeFunction" in $$props) $$invalidate(11, customizeFunction = $$props.customizeFunction);
    		if ("multiSelectCodedArray" in $$props) $$invalidate(12, multiSelectCodedArray = $$props.multiSelectCodedArray);
    		if ("divider" in $$props) $$invalidate(13, divider = $$props.divider);
    		if ("render" in $$props) $$invalidate(22, render = $$props.render);
    		if ("renderFunction" in $$props) $$invalidate(23, renderFunction = $$props.renderFunction);
    		if ("displayTitle" in $$props) $$invalidate(14, displayTitle = $$props.displayTitle);
    		if ("canAddRepeatable" in $$props) $$invalidate(15, canAddRepeatable = $$props.canAddRepeatable);
    		if ("passCustomize" in $$props) $$invalidate(16, passCustomize = $$props.passCustomize);
    		if ("internalDisplay" in $$props) $$invalidate(17, internalDisplay = $$props.internalDisplay);
    		if ("count" in $$props) $$invalidate(18, count = $$props.count);
    		if ("paths" in $$props) $$invalidate(26, paths = $$props.paths);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*renderFunction, path, $store, render*/ 146800642) {
    			 if (renderFunction) {
    				$$invalidate(17, internalDisplay = sanitizeDisplayFunction(path, renderFunction, $store));
    			} else {
    				$$invalidate(17, internalDisplay = render !== null && render !== void 0 ? render : true);
    			}
    		}

    		if ($$self.$$.dirty[0] & /*$store, path*/ 134217730) {
    			 $$invalidate(26, paths = Object.keys($store).filter(p => p.startsWith(path)));
    		}

    		if ($$self.$$.dirty[0] & /*readOnly, repeatable, path, paths, count*/ 67371146) {
    			 if (readOnly && repeatable) {
    				let regExp = new RegExp(`${path}:(\\d+).*`);

    				let externalCount = paths.reduce(
    					(previousValue, currentPath) => {
    						let matches = currentPath.match(regExp);

    						if (matches) {
    							let indexString = matches[1];
    							let index = parseInt(indexString);
    							index = index + 1;

    							if (index > previousValue) {
    								return index;
    							}
    						}

    						return previousValue;
    					},
    					1
    				);

    				$$invalidate(18, count = externalCount || count);
    			}
    		}
    	};

    	return [
    		type,
    		path,
    		label,
    		repeatable,
    		children,
    		childClass,
    		store,
    		readOnly,
    		aqlPath,
    		rmType,
    		customize,
    		customizeFunction,
    		multiSelectCodedArray,
    		divider,
    		displayTitle,
    		canAddRepeatable,
    		passCustomize,
    		internalDisplay,
    		count,
    		reduceCount,
    		increaseCount,
    		appendPath,
    		render,
    		renderFunction,
    		click_handler,
    		click_handler_1
    	];
    }

    class Group extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		if (!document.getElementById("svelte-hty4ep-style")) add_css$3();

    		init(
    			this,
    			options,
    			instance$h,
    			create_fragment$h,
    			safe_not_equal,
    			{
    				type: 0,
    				path: 1,
    				label: 2,
    				repeatable: 3,
    				children: 4,
    				childClass: 5,
    				store: 6,
    				readOnly: 7,
    				aqlPath: 8,
    				rmType: 9,
    				customize: 10,
    				customizeFunction: 11,
    				multiSelectCodedArray: 12,
    				divider: 13,
    				render: 22,
    				renderFunction: 23,
    				displayTitle: 14,
    				canAddRepeatable: 15,
    				passCustomize: 16
    			},
    			[-1, -1]
    		);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Group",
    			options,
    			id: create_fragment$h.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*type*/ ctx[0] === undefined && !("type" in props)) {
    			console.warn("<Group> was created without expected prop 'type'");
    		}

    		if (/*path*/ ctx[1] === undefined && !("path" in props)) {
    			console.warn("<Group> was created without expected prop 'path'");
    		}

    		if (/*label*/ ctx[2] === undefined && !("label" in props)) {
    			console.warn("<Group> was created without expected prop 'label'");
    		}

    		if (/*repeatable*/ ctx[3] === undefined && !("repeatable" in props)) {
    			console.warn("<Group> was created without expected prop 'repeatable'");
    		}

    		if (/*children*/ ctx[4] === undefined && !("children" in props)) {
    			console.warn("<Group> was created without expected prop 'children'");
    		}

    		if (/*store*/ ctx[6] === undefined && !("store" in props)) {
    			console.warn("<Group> was created without expected prop 'store'");
    		}

    		if (/*readOnly*/ ctx[7] === undefined && !("readOnly" in props)) {
    			console.warn("<Group> was created without expected prop 'readOnly'");
    		}

    		if (/*aqlPath*/ ctx[8] === undefined && !("aqlPath" in props)) {
    			console.warn("<Group> was created without expected prop 'aqlPath'");
    		}

    		if (/*rmType*/ ctx[9] === undefined && !("rmType" in props)) {
    			console.warn("<Group> was created without expected prop 'rmType'");
    		}

    		if (/*customizeFunction*/ ctx[11] === undefined && !("customizeFunction" in props)) {
    			console.warn("<Group> was created without expected prop 'customizeFunction'");
    		}
    	}

    	get type() {
    		throw new Error_1$3("<Group>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set type(value) {
    		throw new Error_1$3("<Group>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get path() {
    		throw new Error_1$3("<Group>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set path(value) {
    		throw new Error_1$3("<Group>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get label() {
    		throw new Error_1$3("<Group>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set label(value) {
    		throw new Error_1$3("<Group>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get repeatable() {
    		throw new Error_1$3("<Group>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set repeatable(value) {
    		throw new Error_1$3("<Group>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get children() {
    		throw new Error_1$3("<Group>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set children(value) {
    		throw new Error_1$3("<Group>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get childClass() {
    		throw new Error_1$3("<Group>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set childClass(value) {
    		throw new Error_1$3("<Group>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get store() {
    		throw new Error_1$3("<Group>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set store(value) {
    		throw new Error_1$3("<Group>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get readOnly() {
    		throw new Error_1$3("<Group>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set readOnly(value) {
    		throw new Error_1$3("<Group>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get aqlPath() {
    		throw new Error_1$3("<Group>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set aqlPath(value) {
    		throw new Error_1$3("<Group>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get rmType() {
    		throw new Error_1$3("<Group>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set rmType(value) {
    		throw new Error_1$3("<Group>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get customize() {
    		throw new Error_1$3("<Group>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set customize(value) {
    		throw new Error_1$3("<Group>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get customizeFunction() {
    		throw new Error_1$3("<Group>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set customizeFunction(value) {
    		throw new Error_1$3("<Group>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get multiSelectCodedArray() {
    		throw new Error_1$3("<Group>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set multiSelectCodedArray(value) {
    		throw new Error_1$3("<Group>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get divider() {
    		throw new Error_1$3("<Group>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set divider(value) {
    		throw new Error_1$3("<Group>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get render() {
    		throw new Error_1$3("<Group>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set render(value) {
    		throw new Error_1$3("<Group>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get renderFunction() {
    		throw new Error_1$3("<Group>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set renderFunction(value) {
    		throw new Error_1$3("<Group>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get displayTitle() {
    		throw new Error_1$3("<Group>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set displayTitle(value) {
    		throw new Error_1$3("<Group>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get canAddRepeatable() {
    		throw new Error_1$3("<Group>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set canAddRepeatable(value) {
    		throw new Error_1$3("<Group>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get passCustomize() {
    		throw new Error_1$3("<Group>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set passCustomize(value) {
    		throw new Error_1$3("<Group>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    function propogateContext(tree, parentContext) {
        var _a, _b;
        if (tree.id === 'context' || parentContext) {
            if (tree.children && tree.children.length) {
                return Object.assign(Object.assign({}, tree), { children: (_a = tree.children) === null || _a === void 0 ? void 0 : _a.map(child => propogateContext(child, true)) });
            }
            else {
                return Object.assign(Object.assign({}, tree), { inContext: true });
            }
        }
        return Object.assign(Object.assign({}, tree), { children: (_b = tree.children) === null || _b === void 0 ? void 0 : _b.map(child => propogateContext(child, false)) });
    }
    function extractInputs(tree, path, parentName, config, readOnly) {
        var _a;
        let { max, children, id, inputs, name: uncleanName, rmType, annotations, inContext, localizedName, aqlPath } = tree;
        let newPath = path ? `${path}/${id}` : `${id}`;
        let options = (_a = config[aqlPath]) === null || _a === void 0 ? void 0 : _a[readOnly ? 'read' : 'write'];
        let name;
        name = uncleanName || localizedName || id;
        let inGroup = false;
        let newParentName;
        const eventTypes = ['EVENT', 'POINT_EVENT', 'INTERVAL_EVENT'];
        if (eventTypes.includes(rmType)) {
            inGroup = true;
            name = `${parentName} (${name})`;
            // name = ''
        }
        if (['OBSERVATION', 'ACTION', 'INSTRUCTION', 'CLUSTER', 'SECTION'].includes(rmType)) {
            inGroup = true;
            if (children && (children === null || children === void 0 ? void 0 : children.filter(child => eventTypes.includes(child.rmType)).length) > 0) {
                newParentName = name;
                name = '';
            }
        }
        if (max > 1 || max == -1 || inGroup) {
            let label;
            let repeatable = false;
            if (max > 1 || max == -1) {
                repeatable = true;
            }
            let extractedChildren;
            if (children && children.length) {
                extractedChildren = children
                    .map(child => extractInputs(child, path = '', parentName = newParentName || name, config, readOnly))
                    .filter(i => i)
                    .flat();
                label = name;
            }
            else {
                let extracted = extractInputs(Object.assign(Object.assign({}, tree), { max: 0, id: '' }), path = '', parentName = newParentName || name, config, readOnly);
                if (!Array.isArray(extracted)) {
                    extractedChildren = [extracted];
                }
                else {
                    throw new Error(`Unexpected error at ${newPath}. Got multiple extracted children when children.length is 0`);
                }
            }
            return Object.assign(Object.assign({ type: 'Group' }, options), { path: newPath, rmType,
                aqlPath,
                label,
                repeatable, children: extractedChildren });
        }
        if (inContext) {
            return Object.assign({ tree: Object.assign(Object.assign({}, tree), { name }), type: 'Context', path: newPath, aqlPath }, options);
        }
        if (inputs && inputs.length) {
            return Object.assign({ tree: Object.assign(Object.assign({}, tree), { name }), type: 'Leaf', path: newPath, aqlPath }, options);
        }
        if (children && children.length) {
            let extracted = children
                .map(child => extractInputs(child, newPath, name, config, readOnly))
                .filter(i => i)
                .flat();
            return extracted;
        }
        else {
            return Object.assign({ tree: Object.assign(Object.assign({}, tree), { name }), type: 'UnknownLeaf', path: newPath, aqlPath }, options);
        }
    }
    function generateSchema(template, configuration = {}, readOnly) {
        const { tree } = template;
        const contextTree = propogateContext(tree, false);
        let schema = extractInputs(contextTree, '', '', configuration, readOnly);
        if (!Array.isArray(schema)) {
            throw new Error('Top level template returned only one extracted');
        }
        const uiTemplate = {
            options: configuration.global || {},
            schema
        };
        return uiTemplate;
    }

    /* src\composition\Composition.wc.svelte generated by Svelte v3.29.4 */

    const { console: console_1$6 } = globals;
    const file$h = "src\\composition\\Composition.wc.svelte";

    function get_each_context$6(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[19] = list[i];
    	return child_ctx;
    }

    function get_each_context_1$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[19] = list[i];
    	return child_ctx;
    }

    // (101:0) {#if customize}
    function create_if_block_4$2(ctx) {
    	let div;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			div.textContent = "COMPOSITION";
    			attr_dev(div, "class", "tag");
    			add_location(div, file$h, 101, 4, 3007);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (!mounted) {
    				dispose = listen_dev(div, "click", /*click_handler*/ ctx[14], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4$2.name,
    		type: "if",
    		source: "(101:0) {#if customize}",
    		ctx
    	});

    	return block;
    }

    // (117:50) {:else}
    function create_else_block_2$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Template Error");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_2$1.name,
    		type: "else",
    		source: "(117:50) {:else}",
    		ctx
    	});

    	return block;
    }

    // (117:12) {#if !error}
    function create_if_block_3$2(ctx) {
    	let t_value = (/*template*/ ctx[0].tree.name || "") + "";
    	let t;

    	const block = {
    		c: function create() {
    			t = text(t_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*template*/ 1 && t_value !== (t_value = (/*template*/ ctx[0].tree.name || "") + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3$2.name,
    		type: "if",
    		source: "(117:12) {#if !error}",
    		ctx
    	});

    	return block;
    }

    // (158:8) {:else}
    function create_else_block_1$4(ctx) {
    	let p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "Invalid template";
    			add_location(p, file$h, 158, 12, 5032);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_1$4.name,
    		type: "else",
    		source: "(158:8) {:else}",
    		ctx
    	});

    	return block;
    }

    // (119:8) {#if !error}
    function create_if_block$e(ctx) {
    	let div0;
    	let t;
    	let div1;
    	let current;
    	let each_value_1 = /*groupLeafItems*/ ctx[9];
    	validate_each_argument(each_value_1);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks_1[i] = create_each_block_1$1(get_each_context_1$1(ctx, each_value_1, i));
    	}

    	const out = i => transition_out(each_blocks_1[i], 1, 1, () => {
    		each_blocks_1[i] = null;
    	});

    	let each_value = /*contextItems*/ ctx[8];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$6(get_each_context$6(ctx, each_value, i));
    	}

    	const out_1 = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			div0 = element("div");

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t = space();
    			div1 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div0, "class", /*parentClass*/ ctx[5]);
    			add_location(div0, file$h, 119, 12, 3503);
    			attr_dev(div1, "class", "field");
    			add_location(div1, file$h, 146, 12, 4649);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(div0, null);
    			}

    			insert_dev(target, t, anchor);
    			insert_dev(target, div1, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div1, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*groupLeafItems, childClass, customize, customizeFunction, readOnly, internalStore, JSON*/ 606) {
    				each_value_1 = /*groupLeafItems*/ ctx[9];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1$1(ctx, each_value_1, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    						transition_in(each_blocks_1[i], 1);
    					} else {
    						each_blocks_1[i] = create_each_block_1$1(child_ctx);
    						each_blocks_1[i].c();
    						transition_in(each_blocks_1[i], 1);
    						each_blocks_1[i].m(div0, null);
    					}
    				}

    				group_outros();

    				for (i = each_value_1.length; i < each_blocks_1.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}

    			if (!current || dirty & /*parentClass*/ 32) {
    				attr_dev(div0, "class", /*parentClass*/ ctx[5]);
    			}

    			if (dirty & /*contextItems, customize, customizeFunction, readOnly, internalStore*/ 286) {
    				each_value = /*contextItems*/ ctx[8];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$6(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$6(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div1, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out_1(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value_1.length; i += 1) {
    				transition_in(each_blocks_1[i]);
    			}

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks_1 = each_blocks_1.filter(Boolean);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				transition_out(each_blocks_1[i]);
    			}

    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			destroy_each(each_blocks_1, detaching);
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(div1);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$e.name,
    		type: "if",
    		source: "(119:8) {#if !error}",
    		ctx
    	});

    	return block;
    }

    // (140:24) {:else}
    function create_else_block$c(ctx) {
    	let p;
    	let t0;
    	let t1_value = /*item*/ ctx[19].type + "";
    	let t1;
    	let t2;
    	let t3;
    	let pre;
    	let t4_value = JSON.stringify(/*item*/ ctx[19], null, 2) + "";
    	let t4;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t0 = text("Type ");
    			t1 = text(t1_value);
    			t2 = text(" not recognized");
    			t3 = space();
    			pre = element("pre");
    			t4 = text(t4_value);
    			add_location(p, file$h, 140, 28, 4427);
    			add_location(pre, file$h, 141, 28, 4494);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t0);
    			append_dev(p, t1);
    			append_dev(p, t2);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, pre, anchor);
    			append_dev(pre, t4);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*groupLeafItems*/ 512 && t1_value !== (t1_value = /*item*/ ctx[19].type + "")) set_data_dev(t1, t1_value);
    			if (dirty & /*groupLeafItems*/ 512 && t4_value !== (t4_value = JSON.stringify(/*item*/ ctx[19], null, 2) + "")) set_data_dev(t4, t4_value);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(pre);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$c.name,
    		type: "else",
    		source: "(140:24) {:else}",
    		ctx
    	});

    	return block;
    }

    // (132:55) 
    function create_if_block_2$3(ctx) {
    	let leaf;
    	let current;

    	const leaf_spread_levels = [
    		/*item*/ ctx[19],
    		{ customize: /*customize*/ ctx[2] },
    		{
    			customizeFunction: /*customizeFunction*/ ctx[3]
    		},
    		{ readOnly: /*readOnly*/ ctx[1] },
    		{ store: /*internalStore*/ ctx[4] }
    	];

    	let leaf_props = {};

    	for (let i = 0; i < leaf_spread_levels.length; i += 1) {
    		leaf_props = assign(leaf_props, leaf_spread_levels[i]);
    	}

    	leaf = new Leaf({ props: leaf_props, $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(leaf.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(leaf, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const leaf_changes = (dirty & /*groupLeafItems, customize, customizeFunction, readOnly, internalStore*/ 542)
    			? get_spread_update(leaf_spread_levels, [
    					dirty & /*groupLeafItems*/ 512 && get_spread_object(/*item*/ ctx[19]),
    					dirty & /*customize*/ 4 && { customize: /*customize*/ ctx[2] },
    					dirty & /*customizeFunction*/ 8 && {
    						customizeFunction: /*customizeFunction*/ ctx[3]
    					},
    					dirty & /*readOnly*/ 2 && { readOnly: /*readOnly*/ ctx[1] },
    					dirty & /*internalStore*/ 16 && { store: /*internalStore*/ ctx[4] }
    				])
    			: {};

    			leaf.$set(leaf_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(leaf.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(leaf.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(leaf, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$3.name,
    		type: "if",
    		source: "(132:55) ",
    		ctx
    	});

    	return block;
    }

    // (123:24) {#if item.type === "Group"}
    function create_if_block_1$9(ctx) {
    	let group;
    	let current;

    	const group_spread_levels = [
    		/*item*/ ctx[19],
    		{ childClass: /*childClass*/ ctx[6] },
    		{ customize: /*customize*/ ctx[2] },
    		{
    			customizeFunction: /*customizeFunction*/ ctx[3]
    		},
    		{ readOnly: /*readOnly*/ ctx[1] },
    		{ store: /*internalStore*/ ctx[4] }
    	];

    	let group_props = {};

    	for (let i = 0; i < group_spread_levels.length; i += 1) {
    		group_props = assign(group_props, group_spread_levels[i]);
    	}

    	group = new Group({ props: group_props, $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(group.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(group, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const group_changes = (dirty & /*groupLeafItems, childClass, customize, customizeFunction, readOnly, internalStore*/ 606)
    			? get_spread_update(group_spread_levels, [
    					dirty & /*groupLeafItems*/ 512 && get_spread_object(/*item*/ ctx[19]),
    					dirty & /*childClass*/ 64 && { childClass: /*childClass*/ ctx[6] },
    					dirty & /*customize*/ 4 && { customize: /*customize*/ ctx[2] },
    					dirty & /*customizeFunction*/ 8 && {
    						customizeFunction: /*customizeFunction*/ ctx[3]
    					},
    					dirty & /*readOnly*/ 2 && { readOnly: /*readOnly*/ ctx[1] },
    					dirty & /*internalStore*/ 16 && { store: /*internalStore*/ ctx[4] }
    				])
    			: {};

    			group.$set(group_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(group.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(group.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(group, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$9.name,
    		type: "if",
    		source: "(123:24) {#if item.type === \\\"Group\\\"}",
    		ctx
    	});

    	return block;
    }

    // (122:20) {#key item.path}
    function create_key_block(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block_1$9, create_if_block_2$3, create_else_block$c];
    	const if_blocks = [];

    	function select_block_type_2(ctx, dirty) {
    		if (/*item*/ ctx[19].type === "Group") return 0;
    		if (/*item*/ ctx[19].type === "Leaf") return 1;
    		return 2;
    	}

    	current_block_type_index = select_block_type_2(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type_2(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_key_block.name,
    		type: "key",
    		source: "(122:20) {#key item.path}",
    		ctx
    	});

    	return block;
    }

    // (121:16) {#each groupLeafItems as item}
    function create_each_block_1$1(ctx) {
    	let previous_key = /*item*/ ctx[19].path;
    	let key_block_anchor;
    	let current;
    	let key_block = create_key_block(ctx);

    	const block = {
    		c: function create() {
    			key_block.c();
    			key_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			key_block.m(target, anchor);
    			insert_dev(target, key_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*groupLeafItems*/ 512 && safe_not_equal(previous_key, previous_key = /*item*/ ctx[19].path)) {
    				group_outros();
    				transition_out(key_block, 1, 1, noop);
    				check_outros();
    				key_block = create_key_block(ctx);
    				key_block.c();
    				transition_in(key_block);
    				key_block.m(key_block_anchor.parentNode, key_block_anchor);
    			} else {
    				key_block.p(ctx, dirty);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(key_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(key_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(key_block_anchor);
    			key_block.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1$1.name,
    		type: "each",
    		source: "(121:16) {#each groupLeafItems as item}",
    		ctx
    	});

    	return block;
    }

    // (148:16) {#each contextItems as item}
    function create_each_block$6(ctx) {
    	let context;
    	let current;

    	const context_spread_levels = [
    		/*item*/ ctx[19],
    		{ customize: /*customize*/ ctx[2] },
    		{
    			customizeFunction: /*customizeFunction*/ ctx[3]
    		},
    		{ readOnly: /*readOnly*/ ctx[1] },
    		{ store: /*internalStore*/ ctx[4] }
    	];

    	let context_props = {};

    	for (let i = 0; i < context_spread_levels.length; i += 1) {
    		context_props = assign(context_props, context_spread_levels[i]);
    	}

    	context = new Context({ props: context_props, $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(context.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(context, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const context_changes = (dirty & /*contextItems, customize, customizeFunction, readOnly, internalStore*/ 286)
    			? get_spread_update(context_spread_levels, [
    					dirty & /*contextItems*/ 256 && get_spread_object(/*item*/ ctx[19]),
    					dirty & /*customize*/ 4 && { customize: /*customize*/ ctx[2] },
    					dirty & /*customizeFunction*/ 8 && {
    						customizeFunction: /*customizeFunction*/ ctx[3]
    					},
    					dirty & /*readOnly*/ 2 && { readOnly: /*readOnly*/ ctx[1] },
    					dirty & /*internalStore*/ 16 && { store: /*internalStore*/ ctx[4] }
    				])
    			: {};

    			context.$set(context_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(context.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(context.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(context, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$6.name,
    		type: "each",
    		source: "(148:16) {#each contextItems as item}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$i(ctx) {
    	let t0;
    	let div2;
    	let form;
    	let h1;
    	let t1;
    	let current_block_type_index;
    	let if_block2;
    	let t2;
    	let div1;
    	let div0;
    	let button;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block0 = /*customize*/ ctx[2] && create_if_block_4$2(ctx);

    	function select_block_type(ctx, dirty) {
    		if (!/*error*/ ctx[7]) return create_if_block_3$2;
    		return create_else_block_2$1;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block1 = current_block_type(ctx);
    	const if_block_creators = [create_if_block$e, create_else_block_1$4];
    	const if_blocks = [];

    	function select_block_type_1(ctx, dirty) {
    		if (!/*error*/ ctx[7]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type_1(ctx);
    	if_block2 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if (if_block0) if_block0.c();
    			t0 = space();
    			div2 = element("div");
    			form = element("form");
    			h1 = element("h1");
    			if_block1.c();
    			t1 = space();
    			if_block2.c();
    			t2 = space();
    			div1 = element("div");
    			div0 = element("div");
    			button = element("button");
    			button.textContent = "Submit";
    			this.c = noop;
    			attr_dev(h1, "class", "subtitle");
    			add_location(h1, file$h, 115, 8, 3357);
    			attr_dev(button, "class", "button is-fullwidth is-success");
    			add_location(button, file$h, 162, 16, 5148);
    			attr_dev(div0, "class", "buttons");
    			add_location(div0, file$h, 161, 12, 5110);
    			attr_dev(div1, "class", "field");
    			add_location(div1, file$h, 160, 8, 5078);
    			add_location(form, file$h, 114, 4, 3308);
    			attr_dev(div2, "class", "box");
    			toggle_class(div2, "bordered", /*customize*/ ctx[2] == true);
    			add_location(div2, file$h, 113, 0, 3251);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block0) if_block0.m(target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div2, anchor);
    			append_dev(div2, form);
    			append_dev(form, h1);
    			if_block1.m(h1, null);
    			append_dev(form, t1);
    			if_blocks[current_block_type_index].m(form, null);
    			append_dev(form, t2);
    			append_dev(form, div1);
    			append_dev(div1, div0);
    			append_dev(div0, button);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(form, "submit", prevent_default(/*submit*/ ctx[10]), false, true, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*customize*/ ctx[2]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_4$2(ctx);
    					if_block0.c();
    					if_block0.m(t0.parentNode, t0);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block1) {
    				if_block1.p(ctx, dirty);
    			} else {
    				if_block1.d(1);
    				if_block1 = current_block_type(ctx);

    				if (if_block1) {
    					if_block1.c();
    					if_block1.m(h1, null);
    				}
    			}

    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type_1(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block2 = if_blocks[current_block_type_index];

    				if (!if_block2) {
    					if_block2 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block2.c();
    				}

    				transition_in(if_block2, 1);
    				if_block2.m(form, t2);
    			}

    			if (dirty & /*customize*/ 4) {
    				toggle_class(div2, "bordered", /*customize*/ ctx[2] == true);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block2);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block2);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block0) if_block0.d(detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div2);
    			if_block1.d();
    			if_blocks[current_block_type_index].d();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$i.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function partition(array, isValid) {
    	return array.reduce(
    		([pass, fail], elem) => {
    			return isValid(elem)
    			? [[...pass, elem], fail]
    			: [pass, [...fail, elem]];
    		},
    		[[], []]
    	);
    }

    function instance$i($$self, $$props, $$invalidate) {
    	let $internalStore,
    		$$unsubscribe_internalStore = noop,
    		$$subscribe_internalStore = () => ($$unsubscribe_internalStore(), $$unsubscribe_internalStore = subscribe(internalStore, $$value => $$invalidate(16, $internalStore = $$value)), internalStore);

    	$$self.$$.on_destroy.push(() => $$unsubscribe_internalStore());
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("mui-composition", slots, []);
    	
    	let { template } = $$props;
    	let { readOnly = false } = $$props;
    	let { store = undefined } = $$props;
    	let { configuration } = $$props;
    	let { initialData = {} } = $$props;
    	let { customize = false } = $$props;
    	let { customizeFunction = console.log } = $$props;
    	let internalStore;
    	let parentClass;
    	let childClass;
    	let error = false;
    	let uiTemplate;
    	let contextItems;
    	let groupLeafItems;
    	setContext("contextPaths", writable([]));
    	const dispatch = createEventDispatcher();

    	onMount(() => {
    		console.log({ store, from: "composition" });

    		if (store) {
    			console.log("store present");
    			$$subscribe_internalStore($$invalidate(4, internalStore = store));
    		} else //     (internalStore as writableKeyValue).update(s=>({...s, ...initialData}))
    		// }
    		{
    			console.log("initializing store"); // if (!readOnly){
    			$$subscribe_internalStore($$invalidate(4, internalStore = writable(initialData)));
    		}
    	});

    	// function emitCustomEvent(name, detail){
    	//     const event = new CustomEvent(name, {
    	//       detail: detail,
    	//       bubbles: true,
    	//       composed: true, // needed for the event to traverse beyond shadow dom
    	//   })
    	//     this.dispatchEvent(event)
    	// }
    	const el = get_current_component();

    	function submit() {
    		console.log("dispatching done");
    		dispatch("done", $internalStore);

    		const event = new CustomEvent("done",
    		{
    				detail: $internalStore,
    				bubbles: true,
    				composed: true
    			});

    		el.dispatchEvent(event);
    	}

    	const writable_props = [
    		"template",
    		"readOnly",
    		"store",
    		"configuration",
    		"initialData",
    		"customize",
    		"customizeFunction"
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$6.warn(`<mui-composition> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => customizeFunction({
    		aqlPath: "global",
    		type: "COMPOSITION",
    		path: "global"
    	});

    	$$self.$$set = $$props => {
    		if ("template" in $$props) $$invalidate(0, template = $$props.template);
    		if ("readOnly" in $$props) $$invalidate(1, readOnly = $$props.readOnly);
    		if ("store" in $$props) $$invalidate(11, store = $$props.store);
    		if ("configuration" in $$props) $$invalidate(12, configuration = $$props.configuration);
    		if ("initialData" in $$props) $$invalidate(13, initialData = $$props.initialData);
    		if ("customize" in $$props) $$invalidate(2, customize = $$props.customize);
    		if ("customizeFunction" in $$props) $$invalidate(3, customizeFunction = $$props.customizeFunction);
    	};

    	$$self.$capture_state = () => ({
    		Leaf,
    		Group,
    		writable,
    		createEventDispatcher,
    		onMount,
    		setContext,
    		generateSchema,
    		Context,
    		get_current_component,
    		template,
    		readOnly,
    		store,
    		configuration,
    		initialData,
    		customize,
    		customizeFunction,
    		internalStore,
    		parentClass,
    		childClass,
    		error,
    		uiTemplate,
    		contextItems,
    		groupLeafItems,
    		dispatch,
    		partition,
    		el,
    		submit,
    		$internalStore
    	});

    	$$self.$inject_state = $$props => {
    		if ("template" in $$props) $$invalidate(0, template = $$props.template);
    		if ("readOnly" in $$props) $$invalidate(1, readOnly = $$props.readOnly);
    		if ("store" in $$props) $$invalidate(11, store = $$props.store);
    		if ("configuration" in $$props) $$invalidate(12, configuration = $$props.configuration);
    		if ("initialData" in $$props) $$invalidate(13, initialData = $$props.initialData);
    		if ("customize" in $$props) $$invalidate(2, customize = $$props.customize);
    		if ("customizeFunction" in $$props) $$invalidate(3, customizeFunction = $$props.customizeFunction);
    		if ("internalStore" in $$props) $$subscribe_internalStore($$invalidate(4, internalStore = $$props.internalStore));
    		if ("parentClass" in $$props) $$invalidate(5, parentClass = $$props.parentClass);
    		if ("childClass" in $$props) $$invalidate(6, childClass = $$props.childClass);
    		if ("error" in $$props) $$invalidate(7, error = $$props.error);
    		if ("uiTemplate" in $$props) $$invalidate(15, uiTemplate = $$props.uiTemplate);
    		if ("contextItems" in $$props) $$invalidate(8, contextItems = $$props.contextItems);
    		if ("groupLeafItems" in $$props) $$invalidate(9, groupLeafItems = $$props.groupLeafItems);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*template, configuration, store, internalStore*/ 6161) {
    			 {
    				console.log({
    					template,
    					configuration,
    					store,
    					internalStore
    				});
    			}
    		}

    		if ($$self.$$.dirty & /*template, configuration, readOnly, uiTemplate*/ 36867) {
    			 {
    				try {
    					$$invalidate(15, uiTemplate = generateSchema(template, configuration, readOnly));
    					console.log({ uiTemplate, template, configuration });
    					$$invalidate(8, [contextItems, groupLeafItems] = partition(uiTemplate.schema, s => s.type === "Context"), contextItems, (((($$invalidate(9, groupLeafItems), $$invalidate(0, template)), $$invalidate(12, configuration)), $$invalidate(1, readOnly)), $$invalidate(15, uiTemplate)));

    					if (uiTemplate.options.horizontal) {
    						$$invalidate(5, parentClass = "columns");
    						$$invalidate(6, childClass = "column");
    					} else {
    						$$invalidate(5, parentClass = "field");
    						$$invalidate(6, childClass = "field");
    					}

    					$$invalidate(7, error = false);
    				} catch(e) {
    					$$invalidate(7, error = true);
    				}
    			}
    		}

    		if ($$self.$$.dirty & /*$internalStore*/ 65536) {
    			 {
    				console.log("Store changed");

    				const event = new CustomEvent("change",
    				{
    						detail: $internalStore,
    						bubbles: true,
    						composed: true
    					});

    				console.log("Emitting event");
    				el.dispatchEvent(event);
    			}
    		}
    	};

    	return [
    		template,
    		readOnly,
    		customize,
    		customizeFunction,
    		internalStore,
    		parentClass,
    		childClass,
    		error,
    		contextItems,
    		groupLeafItems,
    		submit,
    		store,
    		configuration,
    		initialData,
    		click_handler
    	];
    }

    class Composition_wc extends SvelteElement {
    	constructor(options) {
    		super();
    		this.shadowRoot.innerHTML = `<style>@import "../styles.css";.bordered{border-style:solid;border-width:4px;border-color:lavender;border-radius:5px}.tag{background-color:lavender;cursor:pointer}</style>`;

    		init(this, { target: this.shadowRoot }, instance$i, create_fragment$i, safe_not_equal, {
    			template: 0,
    			readOnly: 1,
    			store: 11,
    			configuration: 12,
    			initialData: 13,
    			customize: 2,
    			customizeFunction: 3
    		});

    		const { ctx } = this.$$;
    		const props = this.attributes;

    		if (/*template*/ ctx[0] === undefined && !("template" in props)) {
    			console_1$6.warn("<mui-composition> was created without expected prop 'template'");
    		}

    		if (/*configuration*/ ctx[12] === undefined && !("configuration" in props)) {
    			console_1$6.warn("<mui-composition> was created without expected prop 'configuration'");
    		}

    		if (options) {
    			if (options.target) {
    				insert_dev(options.target, this, options.anchor);
    			}

    			if (options.props) {
    				this.$set(options.props);
    				flush();
    			}
    		}
    	}

    	static get observedAttributes() {
    		return [
    			"template",
    			"readOnly",
    			"store",
    			"configuration",
    			"initialData",
    			"customize",
    			"customizeFunction"
    		];
    	}

    	get template() {
    		return this.$$.ctx[0];
    	}

    	set template(template) {
    		this.$set({ template });
    		flush();
    	}

    	get readOnly() {
    		return this.$$.ctx[1];
    	}

    	set readOnly(readOnly) {
    		this.$set({ readOnly });
    		flush();
    	}

    	get store() {
    		return this.$$.ctx[11];
    	}

    	set store(store) {
    		this.$set({ store });
    		flush();
    	}

    	get configuration() {
    		return this.$$.ctx[12];
    	}

    	set configuration(configuration) {
    		this.$set({ configuration });
    		flush();
    	}

    	get initialData() {
    		return this.$$.ctx[13];
    	}

    	set initialData(initialData) {
    		this.$set({ initialData });
    		flush();
    	}

    	get customize() {
    		return this.$$.ctx[2];
    	}

    	set customize(customize) {
    		this.$set({ customize });
    		flush();
    	}

    	get customizeFunction() {
    		return this.$$.ctx[3];
    	}

    	set customizeFunction(customizeFunction) {
    		this.$set({ customizeFunction });
    		flush();
    	}
    }

    customElements.define("mui-composition", Composition_wc);

    exports.Composition = Composition_wc;

    Object.defineProperty(exports, '__esModule', { value: true });

    return exports;

}({}));
//# sourceMappingURL=bundle.[hash].js.map
