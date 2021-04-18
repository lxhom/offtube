
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    function is_promise(value) {
        return value && typeof value === 'object' && typeof value.then === 'function';
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

    const is_client = typeof window !== 'undefined';
    let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

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
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
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
    function onDestroy(fn) {
        get_current_component().$$.on_destroy.push(fn);
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

    function handle_promise(promise, info) {
        const token = info.token = {};
        function update(type, index, key, value) {
            if (info.token !== token)
                return;
            info.resolved = value;
            let child_ctx = info.ctx;
            if (key !== undefined) {
                child_ctx = child_ctx.slice();
                child_ctx[key] = value;
            }
            const block = type && (info.current = type)(child_ctx);
            let needs_flush = false;
            if (info.block) {
                if (info.blocks) {
                    info.blocks.forEach((block, i) => {
                        if (i !== index && block) {
                            group_outros();
                            transition_out(block, 1, 1, () => {
                                if (info.blocks[i] === block) {
                                    info.blocks[i] = null;
                                }
                            });
                            check_outros();
                        }
                    });
                }
                else {
                    info.block.d(1);
                }
                block.c();
                transition_in(block, 1);
                block.m(info.mount(), info.anchor);
                needs_flush = true;
            }
            info.block = block;
            if (info.blocks)
                info.blocks[index] = block;
            if (needs_flush) {
                flush();
            }
        }
        if (is_promise(promise)) {
            const current_component = get_current_component();
            promise.then(value => {
                set_current_component(current_component);
                update(info.then, 1, info.value, value);
                set_current_component(null);
            }, error => {
                set_current_component(current_component);
                update(info.catch, 2, info.error, error);
                set_current_component(null);
                if (!info.hasCatch) {
                    throw error;
                }
            });
            // if we previously had a then/catch block, destroy it
            if (info.current !== info.pending) {
                update(info.pending, 0);
                return true;
            }
        }
        else {
            if (info.current !== info.then) {
                update(info.then, 1, info.value, promise);
                return true;
            }
            info.resolved = promise;
        }
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
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
        }
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
            on_disconnect: [],
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
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
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
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
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
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.35.0' }, detail)));
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
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
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

    /* src\VideoInfo.svelte generated by Svelte v3.35.0 */

    let secondsParser = seconds => new Date(seconds * 1000).toISOString().substr(11, 8).replace(/^00:/, "");
    let dateDifInDays = (a, b) => Math.floor((Date.UTC(b.getFullYear(), b.getMonth(), b.getDate()) - Date.UTC(a.getFullYear(), a.getMonth(), a.getDate())) / 86400000);

    const parseVideoData = video => {
    	let fileEnding = video.thumbnail.substring(video.thumbnail.lastIndexOf("."));
    	let thumbnail = "/content/" + video.id + fileEnding;
    	let views = "";

    	String(video.view_count).split("").reverse().forEach((n, i) => {
    		if (i % 3 === 0 && i !== 0) views = "," + views;
    		views = n + views;
    	});

    	let time = secondsParser(video.duration);
    	let dateArr = String(video.upload_date).split("");
    	dateArr.splice(4, 0, "-");
    	dateArr.splice(7, 0, "-");
    	let videoAgeInDays = dateDifInDays(new Date(dateArr.join("")), new Date());
    	let age;

    	if (videoAgeInDays <= 0) {
    		age = "Today";
    	} else if (videoAgeInDays <= 7) {
    		age = `${videoAgeInDays} day${videoAgeInDays === 1 ? "" : "s"} ago`;
    	} else if (Math.round(videoAgeInDays / 7) <= 4) {
    		age = `${Math.round(videoAgeInDays / 7)} week${Math.round(videoAgeInDays / 7) === 1 ? "" : "s"} ago`;
    	} else if (Math.round(videoAgeInDays / (365.25 / 12)) <= 12) {
    		age = `${Math.round(videoAgeInDays / (365.25 / 12))} month${Math.round(videoAgeInDays / (365.25 / 12)) === 1
		? ""
		: "s"} ago`;
    	} else {
    		age = `${Math.round(videoAgeInDays / 365.25)} year${Math.round(videoAgeInDays / 365.25) === 1 ? "" : "s"} ago`;
    	}

    	let format = video.height + "p" + (video.fps === 30 ? "" : video.fps);
    	return { thumbnail, views, time, age, format };
    };

    /* src\Thumbnail.svelte generated by Svelte v3.35.0 */
    const file$4 = "src\\Thumbnail.svelte";

    // (1:0) <!--suppress JSUnresolvedVariable, HtmlUnknownTarget, ES6CheckImport -->  <script>    import { parseVideoData }
    function create_catch_block$2(ctx) {
    	const block = { c: noop, m: noop, p: noop, d: noop };

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_catch_block$2.name,
    		type: "catch",
    		source: "(1:0) <!--suppress JSUnresolvedVariable, HtmlUnknownTarget, ES6CheckImport -->  <script>    import { parseVideoData }",
    		ctx
    	});

    	return block;
    }

    // (71:2) {:then _res}
    function create_then_block$2(ctx) {
    	let div6;
    	let div2;
    	let div0;
    	let img0;
    	let img0_src_value;
    	let t0;
    	let img1;
    	let img1_alt_value;
    	let t1;
    	let div1;
    	let t2;
    	let t3;
    	let t4;
    	let t5;
    	let div5;
    	let div3;
    	let t6_value = /*video*/ ctx[0].title + "";
    	let t6;
    	let t7;
    	let div4;
    	let t8_value = /*video*/ ctx[0].uploader + "";
    	let t8;
    	let t9;
    	let t10;
    	let t11;
    	let t12;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div6 = element("div");
    			div2 = element("div");
    			div0 = element("div");
    			img0 = element("img");
    			t0 = space();
    			img1 = element("img");
    			t1 = space();
    			div1 = element("div");
    			t2 = text(/*format*/ ctx[6]);
    			t3 = text(" • ");
    			t4 = text(/*time*/ ctx[4]);
    			t5 = space();
    			div5 = element("div");
    			div3 = element("div");
    			t6 = text(t6_value);
    			t7 = space();
    			div4 = element("div");
    			t8 = text(t8_value);
    			t9 = text(" • ");
    			t10 = text(/*views*/ ctx[3]);
    			t11 = text(" views • Uploaded ");
    			t12 = text(/*age*/ ctx[5]);
    			attr_dev(img0, "id", "placeholder");
    			if (img0.src !== (img0_src_value = "/16x9_Transparent.png")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", "Placeholder");
    			attr_dev(img0, "class", "svelte-18pk8y3");
    			add_location(img0, file$4, 74, 10, 1655);
    			attr_dev(img1, "id", "thumbnail");
    			attr_dev(img1, "data-src", /*thumbnail*/ ctx[2]);
    			attr_dev(img1, "alt", img1_alt_value = /*video*/ ctx[0].title);
    			attr_dev(img1, "class", "svelte-18pk8y3");
    			add_location(img1, file$4, 75, 10, 1735);
    			attr_dev(div0, "id", "image-container");
    			add_location(div0, file$4, 73, 8, 1617);
    			attr_dev(div1, "id", "timestamp");
    			attr_dev(div1, "class", "svelte-18pk8y3");
    			add_location(div1, file$4, 77, 8, 1820);
    			attr_dev(div2, "id", "thumb-container");
    			attr_dev(div2, "class", "svelte-18pk8y3");
    			add_location(div2, file$4, 72, 6, 1581);
    			attr_dev(div3, "id", "title");
    			attr_dev(div3, "class", "svelte-18pk8y3");
    			add_location(div3, file$4, 80, 8, 1900);
    			attr_dev(div4, "id", "video-info");
    			attr_dev(div4, "class", "svelte-18pk8y3");
    			add_location(div4, file$4, 83, 8, 1967);
    			add_location(div5, file$4, 79, 6, 1885);
    			add_location(div6, file$4, 71, 4, 1522);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div6, anchor);
    			append_dev(div6, div2);
    			append_dev(div2, div0);
    			append_dev(div0, img0);
    			append_dev(div0, t0);
    			append_dev(div0, img1);
    			append_dev(div2, t1);
    			append_dev(div2, div1);
    			append_dev(div1, t2);
    			append_dev(div1, t3);
    			append_dev(div1, t4);
    			append_dev(div6, t5);
    			append_dev(div6, div5);
    			append_dev(div5, div3);
    			append_dev(div3, t6);
    			append_dev(div5, t7);
    			append_dev(div5, div4);
    			append_dev(div4, t8);
    			append_dev(div4, t9);
    			append_dev(div4, t10);
    			append_dev(div4, t11);
    			append_dev(div4, t12);

    			if (!mounted) {
    				dispose = listen_dev(div6, "click", /*click_handler*/ ctx[8], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*thumbnail*/ 4) {
    				attr_dev(img1, "data-src", /*thumbnail*/ ctx[2]);
    			}

    			if (dirty & /*video*/ 1 && img1_alt_value !== (img1_alt_value = /*video*/ ctx[0].title)) {
    				attr_dev(img1, "alt", img1_alt_value);
    			}

    			if (dirty & /*format*/ 64) set_data_dev(t2, /*format*/ ctx[6]);
    			if (dirty & /*time*/ 16) set_data_dev(t4, /*time*/ ctx[4]);
    			if (dirty & /*video*/ 1 && t6_value !== (t6_value = /*video*/ ctx[0].title + "")) set_data_dev(t6, t6_value);
    			if (dirty & /*video*/ 1 && t8_value !== (t8_value = /*video*/ ctx[0].uploader + "")) set_data_dev(t8, t8_value);
    			if (dirty & /*views*/ 8) set_data_dev(t10, /*views*/ ctx[3]);
    			if (dirty & /*age*/ 32) set_data_dev(t12, /*age*/ ctx[5]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div6);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_then_block$2.name,
    		type: "then",
    		source: "(71:2) {:then _res}",
    		ctx
    	});

    	return block;
    }

    // (69:20)       Loading...    {:then _res}
    function create_pending_block$2(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Loading...");
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
    		id: create_pending_block$2.name,
    		type: "pending",
    		source: "(69:20)       Loading...    {:then _res}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$6(ctx) {
    	let div;

    	let info = {
    		ctx,
    		current: null,
    		token: null,
    		hasCatch: false,
    		pending: create_pending_block$2,
    		then: create_then_block$2,
    		catch: create_catch_block$2,
    		value: 10
    	};

    	handle_promise(/*updater*/ ctx[7](), info);

    	const block = {
    		c: function create() {
    			div = element("div");
    			info.block.c();
    			attr_dev(div, "id", "container");
    			attr_dev(div, "class", "svelte-18pk8y3");
    			add_location(div, file$4, 67, 0, 1442);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			info.block.m(div, info.anchor = null);
    			info.mount = () => div;
    			info.anchor = null;
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;

    			{
    				const child_ctx = ctx.slice();
    				child_ctx[10] = info.resolved;
    				info.block.p(child_ctx, dirty);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			info.block.d();
    			info.token = null;
    			info = null;
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
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Thumbnail", slots, []);
    	let { id } = $$props;
    	let { video } = $$props;
    	let thumbnail, views, time, age, format, lazyElement;

    	let updater = async () => {
    		let res = await fetch(`/content/${id}.info.json`);
    		let text = await res.text();
    		$$invalidate(0, video = JSON.parse(text));
    		let data = parseVideoData(video);
    		$$invalidate(2, thumbnail = data.thumbnail);
    		$$invalidate(3, views = data.views);
    		$$invalidate(4, time = data.time);
    		$$invalidate(5, age = data.age);
    		$$invalidate(6, format = data.format);
    	};

    	const writable_props = ["id", "video"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Thumbnail> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => location.set(`?watch=${id}`);

    	$$self.$$set = $$props => {
    		if ("id" in $$props) $$invalidate(1, id = $$props.id);
    		if ("video" in $$props) $$invalidate(0, video = $$props.video);
    	};

    	$$self.$capture_state = () => ({
    		parseVideoData,
    		id,
    		video,
    		thumbnail,
    		views,
    		time,
    		age,
    		format,
    		lazyElement,
    		updater
    	});

    	$$self.$inject_state = $$props => {
    		if ("id" in $$props) $$invalidate(1, id = $$props.id);
    		if ("video" in $$props) $$invalidate(0, video = $$props.video);
    		if ("thumbnail" in $$props) $$invalidate(2, thumbnail = $$props.thumbnail);
    		if ("views" in $$props) $$invalidate(3, views = $$props.views);
    		if ("time" in $$props) $$invalidate(4, time = $$props.time);
    		if ("age" in $$props) $$invalidate(5, age = $$props.age);
    		if ("format" in $$props) $$invalidate(6, format = $$props.format);
    		if ("lazyElement" in $$props) lazyElement = $$props.lazyElement;
    		if ("updater" in $$props) $$invalidate(7, updater = $$props.updater);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [video, id, thumbnail, views, time, age, format, updater, click_handler];
    }

    class Thumbnail extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, { id: 1, video: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Thumbnail",
    			options,
    			id: create_fragment$6.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*id*/ ctx[1] === undefined && !("id" in props)) {
    			console.warn("<Thumbnail> was created without expected prop 'id'");
    		}

    		if (/*video*/ ctx[0] === undefined && !("video" in props)) {
    			console.warn("<Thumbnail> was created without expected prop 'video'");
    		}
    	}

    	get id() {
    		throw new Error("<Thumbnail>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set id(value) {
    		throw new Error("<Thumbnail>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get video() {
    		throw new Error("<Thumbnail>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set video(value) {
    		throw new Error("<Thumbnail>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\Home.svelte generated by Svelte v3.35.0 */
    const file$3 = "src\\Home.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[2] = list[i];
    	return child_ctx;
    }

    // (1:0) <script>    import Thumbnail from "./Thumbnail.svelte";    let getVideos = async () => {      let res = await fetch("/api/videos");      let text = await res.text();      text = JSON.stringify(JSON.parse(text).sort(() => Math.floor(Math.random() * 2) - 1))      let res2 = await fetch("/api/bulkVideos", {method: "POST", body: text}
    function create_catch_block$1(ctx) {
    	const block = {
    		c: noop,
    		m: noop,
    		p: noop,
    		i: noop,
    		o: noop,
    		d: noop
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_catch_block$1.name,
    		type: "catch",
    		source: "(1:0) <script>    import Thumbnail from \\\"./Thumbnail.svelte\\\";    let getVideos = async () => {      let res = await fetch(\\\"/api/videos\\\");      let text = await res.text();      text = JSON.stringify(JSON.parse(text).sort(() => Math.floor(Math.random() * 2) - 1))      let res2 = await fetch(\\\"/api/bulkVideos\\\", {method: \\\"POST\\\", body: text}",
    		ctx
    	});

    	return block;
    }

    // (14:0) {:then results}
    function create_then_block$1(ctx) {
    	let div;
    	let current;
    	let each_value = /*results*/ ctx[1];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			set_style(div, "width", "100%");
    			add_location(div, file$3, 14, 2, 472);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*getVideos*/ 1) {
    				each_value = /*results*/ ctx[1];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
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
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_then_block$1.name,
    		type: "then",
    		source: "(14:0) {:then results}",
    		ctx
    	});

    	return block;
    }

    // (16:4) {#each results as video}
    function create_each_block$1(ctx) {
    	let thumbnail;
    	let current;

    	thumbnail = new Thumbnail({
    			props: {
    				id: /*video*/ ctx[2].id,
    				video: /*video*/ ctx[2]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(thumbnail.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(thumbnail, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(thumbnail.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(thumbnail.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(thumbnail, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(16:4) {#each results as video}",
    		ctx
    	});

    	return block;
    }

    // (12:20)     Loading...  {:then results}
    function create_pending_block$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Loading...");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_pending_block$1.name,
    		type: "pending",
    		source: "(12:20)     Loading...  {:then results}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let await_block_anchor;
    	let current;

    	let info = {
    		ctx,
    		current: null,
    		token: null,
    		hasCatch: false,
    		pending: create_pending_block$1,
    		then: create_then_block$1,
    		catch: create_catch_block$1,
    		value: 1,
    		blocks: [,,,]
    	};

    	handle_promise(/*getVideos*/ ctx[0](), info);

    	const block = {
    		c: function create() {
    			await_block_anchor = empty();
    			info.block.c();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, await_block_anchor, anchor);
    			info.block.m(target, info.anchor = anchor);
    			info.mount = () => await_block_anchor.parentNode;
    			info.anchor = await_block_anchor;
    			current = true;
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;

    			{
    				const child_ctx = ctx.slice();
    				child_ctx[1] = info.resolved;
    				info.block.p(child_ctx, dirty);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(info.block);
    			current = true;
    		},
    		o: function outro(local) {
    			for (let i = 0; i < 3; i += 1) {
    				const block = info.blocks[i];
    				transition_out(block);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(await_block_anchor);
    			info.block.d(detaching);
    			info.token = null;
    			info = null;
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
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Home", slots, []);

    	let getVideos = async () => {
    		let res = await fetch("/api/videos");
    		let text = await res.text();
    		text = JSON.stringify(JSON.parse(text).sort(() => Math.floor(Math.random() * 2) - 1));
    		let res2 = await fetch("/api/bulkVideos", { method: "POST", body: text });
    		let text2 = await res2.text();
    		return JSON.parse(text2);
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Home> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ Thumbnail, getVideos });

    	$$self.$inject_state = $$props => {
    		if ("getVideos" in $$props) $$invalidate(0, getVideos = $$props.getVideos);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [getVideos];
    }

    class Home extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Home",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    /* src\Watch.svelte generated by Svelte v3.35.0 */

    const { console: console_1$1 } = globals;
    const file$2 = "src\\Watch.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[17] = list[i];
    	return child_ctx;
    }

    // (1:0) <!--suppress HtmlUnknownTarget, JSUnusedGlobalSymbols -->  <script>    import {onDestroy}
    function create_catch_block(ctx) {
    	const block = { c: noop, m: noop, p: noop, d: noop };

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_catch_block.name,
    		type: "catch",
    		source: "(1:0) <!--suppress HtmlUnknownTarget, JSUnusedGlobalSymbols -->  <script>    import {onDestroy}",
    		ctx
    	});

    	return block;
    }

    // (62:45)         {#each subtitles as subtitle}
    function create_then_block(ctx) {
    	let each_1_anchor;
    	let each_value = /*subtitles*/ ctx[16];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
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
    			if (dirty & /*subtitleFetcher*/ 16) {
    				each_value = /*subtitles*/ ctx[16];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
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
    		id: create_then_block.name,
    		type: "then",
    		source: "(62:45)         {#each subtitles as subtitle}",
    		ctx
    	});

    	return block;
    }

    // (63:6) {#each subtitles as subtitle}
    function create_each_block(ctx) {
    	let track;
    	let track_src_value;

    	const block = {
    		c: function create() {
    			track = element("track");
    			attr_dev(track, "kind", "captions");
    			if (track.src !== (track_src_value = "/content/" + /*subtitle*/ ctx[17])) attr_dev(track, "src", track_src_value);
    			attr_dev(track, "srclang", /*subtitle*/ ctx[17].split(".")[1]);
    			add_location(track, file$2, 63, 8, 2018);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, track, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(track);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(63:6) {#each subtitles as subtitle}",
    		ctx
    	});

    	return block;
    }

    // (1:0) <!--suppress HtmlUnknownTarget, JSUnusedGlobalSymbols -->  <script>    import {onDestroy}
    function create_pending_block(ctx) {
    	const block = { c: noop, m: noop, p: noop, d: noop };

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_pending_block.name,
    		type: "pending",
    		source: "(1:0) <!--suppress HtmlUnknownTarget, JSUnusedGlobalSymbols -->  <script>    import {onDestroy}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let div;
    	let video;
    	let source;
    	let source_src_value;
    	let video_updating = false;
    	let video_animationframe;
    	let video_is_paused = true;
    	let mounted;
    	let dispose;

    	let info = {
    		ctx,
    		current: null,
    		token: null,
    		hasCatch: false,
    		pending: create_pending_block,
    		then: create_then_block,
    		catch: create_catch_block,
    		value: 16
    	};

    	handle_promise(/*subtitleFetcher*/ ctx[4](), info);

    	function video_timeupdate_handler() {
    		cancelAnimationFrame(video_animationframe);

    		if (!video.paused) {
    			video_animationframe = raf(video_timeupdate_handler);
    			video_updating = true;
    		}

    		/*video_timeupdate_handler*/ ctx[5].call(video);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			video = element("video");
    			source = element("source");
    			info.block.c();
    			if (source.src !== (source_src_value = /*src*/ ctx[3])) attr_dev(source, "src", source_src_value);
    			attr_dev(source, "type", "video/mp4");
    			add_location(source, file$2, 60, 4, 1893);
    			attr_dev(video, "id", "videoPlayer");
    			video.controls = true;
    			video.autoplay = true;
    			attr_dev(video, "class", "svelte-m28tuk");
    			if (/*duration*/ ctx[2] === void 0) add_render_callback(() => /*video_durationchange_handler*/ ctx[7].call(video));
    			add_location(video, file$2, 59, 2, 1802);
    			attr_dev(div, "class", "wrapper svelte-m28tuk");
    			add_location(div, file$2, 58, 0, 1777);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, video);
    			append_dev(video, source);
    			info.block.m(video, info.anchor = null);
    			info.mount = () => video;
    			info.anchor = null;

    			if (!mounted) {
    				dispose = [
    					listen_dev(video, "timeupdate", video_timeupdate_handler),
    					listen_dev(video, "play", /*video_play_pause_handler*/ ctx[6]),
    					listen_dev(video, "pause", /*video_play_pause_handler*/ ctx[6]),
    					listen_dev(video, "durationchange", /*video_durationchange_handler*/ ctx[7])
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;

    			{
    				const child_ctx = ctx.slice();
    				child_ctx[16] = info.resolved;
    				info.block.p(child_ctx, dirty);
    			}

    			if (!video_updating && dirty & /*currentTime*/ 1 && !isNaN(/*currentTime*/ ctx[0])) {
    				video.currentTime = /*currentTime*/ ctx[0];
    			}

    			video_updating = false;

    			if (dirty & /*paused*/ 2 && video_is_paused !== (video_is_paused = /*paused*/ ctx[1])) {
    				video[video_is_paused ? "pause" : "play"]();
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			info.block.d();
    			info.token = null;
    			info = null;
    			mounted = false;
    			run_all(dispose);
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
    	validate_slots("Watch", slots, []);
    	let uidGen = () => ("######").replace(/#/g, () => ("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ01234567890_=")[Math.floor(Math.random() * 65)]); // 69 billion possibilities should be enough :lennyface:
    	let watchUID = uidGen();
    	let currentTime, paused, duration;
    	let id = new URLSearchParams(location.search).get("watch");
    	let src = "/stream/" + id;

    	let subtitleFetcher = async () => {
    		let res = await fetch("/api/subtitles/" + id);
    		return JSON.parse(await res.text());
    	};

    	let lastPosition = -1;
    	let reWatchOnPlay = false;

    	let checkReWatch = curTime => {
    		if (curTime === undefined) return;

    		if (reWatchOnPlay && curTime !== duration) {
    			watchUID = uidGen();
    			console.log("Rewatch detected");
    			reWatchOnPlay = false;
    		}

    		if (duration === curTime) {
    			reWatchOnPlay = true;
    		}

    		lastPosition = curTime;
    	};

    	let reWatchInterval = setInterval(() => checkReWatch(currentTime), 500);

    	let postInterval = setInterval(
    		() => {
    			if (!paused && currentTime) {
    				fetch("/api/watching", {
    					method: "POST",
    					body: JSON.stringify({
    						id,
    						watches: [watchUID],
    						time: currentTime
    					})
    				});
    			}
    		},
    		2500
    	);

    	onDestroy(() => {
    		clearInterval(reWatchInterval);
    		clearInterval(postInterval);
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$1.warn(`<Watch> was created with unknown prop '${key}'`);
    	});

    	function video_timeupdate_handler() {
    		currentTime = this.currentTime;
    		$$invalidate(0, currentTime);
    	}

    	function video_play_pause_handler() {
    		paused = this.paused;
    		$$invalidate(1, paused);
    	}

    	function video_durationchange_handler() {
    		duration = this.duration;
    		$$invalidate(2, duration);
    	}

    	$$self.$capture_state = () => ({
    		onDestroy,
    		uidGen,
    		watchUID,
    		currentTime,
    		paused,
    		duration,
    		id,
    		src,
    		subtitleFetcher,
    		lastPosition,
    		reWatchOnPlay,
    		checkReWatch,
    		reWatchInterval,
    		postInterval
    	});

    	$$self.$inject_state = $$props => {
    		if ("uidGen" in $$props) uidGen = $$props.uidGen;
    		if ("watchUID" in $$props) watchUID = $$props.watchUID;
    		if ("currentTime" in $$props) $$invalidate(0, currentTime = $$props.currentTime);
    		if ("paused" in $$props) $$invalidate(1, paused = $$props.paused);
    		if ("duration" in $$props) $$invalidate(2, duration = $$props.duration);
    		if ("id" in $$props) id = $$props.id;
    		if ("src" in $$props) $$invalidate(3, src = $$props.src);
    		if ("subtitleFetcher" in $$props) $$invalidate(4, subtitleFetcher = $$props.subtitleFetcher);
    		if ("lastPosition" in $$props) lastPosition = $$props.lastPosition;
    		if ("reWatchOnPlay" in $$props) reWatchOnPlay = $$props.reWatchOnPlay;
    		if ("checkReWatch" in $$props) checkReWatch = $$props.checkReWatch;
    		if ("reWatchInterval" in $$props) reWatchInterval = $$props.reWatchInterval;
    		if ("postInterval" in $$props) postInterval = $$props.postInterval;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		currentTime,
    		paused,
    		duration,
    		src,
    		subtitleFetcher,
    		video_timeupdate_handler,
    		video_play_pause_handler,
    		video_durationchange_handler
    	];
    }

    class Watch extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Watch",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    /* src\Loading.svelte generated by Svelte v3.35.0 */

    function create_fragment$3(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Loading...");
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
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

    function instance$3($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Loading", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Loading> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Loading extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Loading",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src\Reloader.svelte generated by Svelte v3.35.0 */

    const { console: console_1 } = globals;

    function create_fragment$2(ctx) {
    	const block = {
    		c: noop,
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: noop,
    		p: noop,
    		i: noop,
    		o: noop,
    		d: noop
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
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Reloader", slots, []);
    	console.log("BRUHHHHHHHHHHHHH");
    	let url = `http://${location.hostname}:${64027}/`;

    	setInterval(
    		async () => {
    			try {
    				let res = await fetch(url + "api/status");
    				let text = await res.text();

    				// noinspection EqualityComparisonWithCoercionJS
    				if (text != "false") {
    					location.href = url + "error"; // FUCK YOU
    				}
    			} catch(e) {
    				
    			}
    		},
    		1000
    	);

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<Reloader> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ url });

    	$$self.$inject_state = $$props => {
    		if ("url" in $$props) url = $$props.url;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [];
    }

    class Reloader extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Reloader",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src\Test.svelte generated by Svelte v3.35.0 */

    const file$1 = "src\\Test.svelte";

    function create_fragment$1(ctx) {
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "YEET THE SERVER";
    			add_location(button, file$1, 6, 0, 81);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*yeet*/ ctx[0], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
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
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Test", slots, []);

    	let yeet = () => {
    		fetch("/api/crash");
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Test> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ yeet });

    	$$self.$inject_state = $$props => {
    		if ("yeet" in $$props) $$invalidate(0, yeet = $$props.yeet);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [yeet];
    }

    class Test extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Test",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src\App.svelte generated by Svelte v3.35.0 */

    const file = "src\\App.svelte";

    function create_fragment(ctx) {
    	let script;
    	let t1;
    	let reloader;
    	let t2;
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;
    	reloader = new Reloader({ $$inline: true });
    	var switch_value = /*route*/ ctx[0];

    	function switch_props(ctx) {
    		return { $$inline: true };
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props());
    	}

    	const block = {
    		c: function create() {
    			script = element("script");
    			script.textContent = "location.set = url => {\n      history.pushState({}, \"\", url);\n      window.scrollTo(0,0)\n      window.onpopstate(new PopStateEvent(\"\"))\n    }";
    			t1 = space();
    			create_component(reloader.$$.fragment);
    			t2 = space();
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    			add_location(script, file, 2, 2, 51);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			append_dev(document.head, script);
    			insert_dev(target, t1, anchor);
    			mount_component(reloader, target, anchor);
    			insert_dev(target, t2, anchor);

    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (switch_value !== (switch_value = /*route*/ ctx[0])) {
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
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(reloader.$$.fragment, local);
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(reloader.$$.fragment, local);
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			detach_dev(script);
    			if (detaching) detach_dev(t1);
    			destroy_component(reloader, detaching);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
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
    	validate_slots("App", slots, []);
    	let route = Loading;

    	window.onpopstate = window.onload = () => {
    		let getParams = () => {
    			let params = [];

    			location.search.substr(1).split("&").forEach(str => {
    				params.push(str.split("="));
    			});

    			return params;
    		};

    		if (getParams()[0][0] === "") {
    			$$invalidate(0, route = Home);
    		} else {
    			let aliases = { w: "watch", h: "home" };

    			if (aliases[getParams()[0][0]]) {
    				history.pushState({}, "", location.search.replace(getParams()[0][0], aliases[getParams()[0][0]]));
    			}

    			let componentMap = { watch: Watch, home: Home, test: Test };
    			$$invalidate(0, route = componentMap[getParams()[0][0]]);
    		}
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		Home,
    		Watch,
    		Loading,
    		Reloader,
    		Test,
    		route
    	});

    	$$self.$inject_state = $$props => {
    		if ("route" in $$props) $$invalidate(0, route = $$props.route);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [route];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
    	target: document.body,
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
