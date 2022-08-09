/*jshint esversion: 6 */
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _Attribution_owner, _Attribution_name;
const DATA_CLONE = "clone";
const DATA_IDEN = "identical";
const DATA_UNINIT = "uninit";
const ATTR_SPLITER = '.';
const doNothing = function (...argArray) { return undefined; };
let ASN_DEF = DATA_CLONE;
let JSD_DEF = ["number", "boolean"];
export { doNothing, clamp, mirror, warp, step, SObject, Attribution, EventList, ASN_DEF, JSD_DEF, DATA_IDEN, DATA_CLONE, DATA_UNINIT };
Function.prototype["clone"] = function () {
    var cloneObj = this;
    if (this.__isClone) {
        cloneObj = this.__clonedFrom;
    }
    var temp = function () { return cloneObj.apply(this, arguments); };
    for (var key in this) {
        temp[key] = this[key];
    }
    temp["__isClone"] = true;
    temp["__clonedFrom"] = cloneObj;
    return temp;
};
function clamp(value, max, min = 0.0) {
    if (value < min)
        return min;
    if (value > max)
        return max;
    return value;
}
function mirror(value, mid) {
    value = value % (mid * 2);
    if (value <= mid)
        return value;
    else
        return 2 * mid - value;
}
function warp(value, wall) {
    return value % wall;
}
function step(value, des) {
    if (value >= des)
        return 1.0;
    else
        return 0.0;
}
class SObject {
    constructor(properties, assign = ASN_DEF) {
        if (properties)
            this.insertValues(properties, assign);
        SObject.CUM_INDEX++;
    }
    get class() {
        return this.constructor.name;
    }
    get name() {
        return this.class;
    }
    get value() {
        return this["val"];
    }
    set value(val) {
        this["val"] = val;
    }
    initialize(values, def, assign = ASN_DEF) {
        this.setValues(def, DATA_CLONE);
        return this.updateValues(values, assign);
    }
    setValues(values = {}, assign = ASN_DEF) {
        return SObject.setValues(this, values, assign);
    }
    updateValues(values = {}, assign = ASN_DEF) {
        SObject.updateValues(this, values, assign);
        this.resolveAll();
        return this;
    }
    insertValues(values = {}, assign = ASN_DEF) {
        return SObject.insertValues(this, values, assign);
    }
    copy(source) {
        return this.updateValues(source, ASN_DEF);
    }
    clone() {
        return new SObject(this);
    }
    tryGet(propName, success, fail) {
        return SObject.tryGet(this, propName, success, fail);
    }
    trySet(propName, value) {
        return this.access(propName, (attr) => (attr.set(value))) != undefined;
    }
    set(value) {
        return false;
    }
    assign(key, value, type = ASN_DEF) {
        return SObject.assign(this, key, value, type);
    }
    has(propNames) {
        return SObject.has(this, propNames);
    }
    resolve(key, cls) {
        return SObject.resolve(this, key, cls);
    }
    resolveAll(other = this) {
        return other;
    }
    access(propName, success, fail) {
        return SObject.access(this, propName, success, fail);
    }
    print(attrName, ...argArray) {
        this.printer(attrName, ...argArray)();
    }
    getter(propName) {
        let attr = this.access(propName);
        let res = doNothing;
        if (attr)
            res = attr.get.bind(attr);
        return res;
    }
    setter(propName) {
        let attr = this.access(propName);
        let res = doNothing;
        if (attr)
            res = attr.set.bind(attr);
        return res;
    }
    printer(attrName, ...argArray) {
        if (attrName) {
            const attr = this.attribution(attrName);
            const callee = (attr.type == "function") ? attr.call.bind(attr, ...argArray) : attr.get.bind(attr);
            return () => (console.log(this.name + ATTR_SPLITER + attrName + " = " + callee()));
        }
        else {
            return () => (console.log(this.toString()));
        }
    }
    log(attrName, ...argArray) {
        this.logger(attrName, ...argArray)();
    }
    logger(attrName, ...argArray) {
        if (attrName) {
            const callee = this.attribution(attrName).getter(...argArray);
            return () => (console.log(callee()));
        }
        else {
            return () => (console.log(this));
        }
    }
    attribution(propName) {
        return SObject.getAttribution(this, propName.split(ATTR_SPLITER));
    }
    add(other, types = JSD_DEF) {
        return SObject.add(this, other, types);
    }
    sub(other, types = JSD_DEF) {
        return SObject.subtract(this, other, types);
    }
    multiply(other, types = JSD_DEF) {
        return SObject.multiply(this, other, types);
    }
    traverse(callback, rootName = "", types = JSD_DEF) {
        return SObject.traverse(this, callback, rootName, types);
    }
    toString() {
        return `<${this.name}: ${this.class} = ${this.value}>`;
    }
    equals(other) {
        return SObject.equals(this, other);
    }
    static wrap(target) {
        return (target instanceof SObject) ? target : new SObject(target);
    }
    static tryGet(dest, propName, success, fail) {
        const gotCallBack = success ? (attr) => (success.call(dest, attr.get())) : doNothing;
        const failCallBack = fail ? () => (fail.call(dest, undefined)) : doNothing;
        let attr = SObject.access(dest, propName, gotCallBack, failCallBack);
        if (attr)
            return attr.get();
    }
    static trySet(dest, propName, value, assign = DATA_IDEN) {
        return SObject.access(dest, propName, (attr) => (attr.set(value, assign))) != undefined;
    }
    static access(dest, propName, success, fail) {
        const attr = SObject.getAttribution(dest, propName.split(ATTR_SPLITER));
        if (attr != undefined) {
            if (success)
                success.call(dest, attr);
        }
        else if (fail)
            fail.call(dest, undefined);
        return attr;
    }
    static add(dest, source, types = JSD_DEF) {
        const callBack = function (key, propName) {
            return SObject.tryGet(source, propName, (value) => (this[key] += value));
        };
        this.traverse(dest, callBack, "", types);
        return dest;
    }
    static subtract(dest, source, types = JSD_DEF) {
        const callBack = function (key, propName) {
            SObject.tryGet(source, propName, (value) => (this[key] -= value));
        };
        SObject.traverse(dest, callBack, "", types);
        return dest;
    }
    static multiply(dest, source, types = JSD_DEF) {
        const callBack = function (key, propName) {
            SObject.tryGet(source, propName, (value) => (this[key] *= value));
        };
        SObject.traverse(dest, callBack, "", types);
        return dest;
    }
    static traverse(target, callback, rootName = "", types = JSD_DEF) {
        for (const key in target) {
            const value = target[key];
            const curName = rootName + (rootName == "" ? "" : ".") + key;
            if (typeof value == "object")
                SObject.traverse(value, callback, curName, types);
            if (types.includes(typeof value)) {
                if (callback.call(target, key, curName) == false)
                    return target;
            }
        }
        return target;
    }
    static initialize(target, values, def, assign = ASN_DEF) {
        SObject.setValues(target, def, ASN_DEF);
        SObject.updateValues(target, values, assign);
        return target;
    }
    static setValues(target, values, assign = ASN_DEF) {
        for (const key in values) {
            SObject.assign(target, key, values[key], assign);
        }
        return target;
    }
    static updateValues(target, values, assign = ASN_DEF) {
        for (const key in values) {
            if (key in target) {
                SObject.assign(target, key, values[key], assign);
            }
            else {
                SObject.trySet(target, key, values[key], assign);
            }
        }
        return target;
    }
    static insertValues(target, values, assign = ASN_DEF) {
        for (const key in values) {
            if (!(key in target))
                SObject.assign(target, key, values[key], assign);
        }
        return target;
    }
    static assign(target, key, value, type = ASN_DEF) {
        switch (type) {
            case DATA_CLONE: {
                target[key] = SObject.clone(value);
                //console.log(key + ":" + value);
                break;
            }
            case DATA_IDEN: {
                target[key] = value;
                break;
            }
        }
        return target;
    }
    static resolve(target, key, cls) {
        if (key in target && !(target[key] instanceof cls)) {
            target[key] = new cls(target[key]);
            return target[key];
        }
        return undefined;
    }
    static copy(target, source) {
        return SObject.updateValues(target, source, ASN_DEF);
    }
    static clone(target) {
        switch (typeof target) {
            case "object": {
                if (target instanceof SObject)
                    return target.clone();
                else if (target instanceof Array) {
                    const res = [];
                    target.forEach(element => {
                        res.push(SObject.clone(element));
                    });
                    return res;
                }
                else
                    return SObject.setValues(Object.create(target.constructor.prototype), target, DATA_CLONE);
            }
            case "function": {
                const func = function (...argArray) {
                    return target.call(this, ...argArray);
                };
                Object.assign(func, target);
                return func;
            }
            default: {
                return target;
            }
        }
    }
    static getAttribution(target, propNames) {
        let curName = propNames.shift();
        if (curName == undefined)
            return undefined;
        if (curName in target) {
            if (propNames.length <= 0)
                return new Attribution(target, curName);
            return SObject.getAttribution(target[curName], propNames);
        }
        else {
            return undefined;
        }
    }
    static has(target, propNames) {
        for (let i = 0; i < propNames.length; i++) {
            if (!(propNames[i] in target))
                return false;
        }
        return true;
    }
    static equals(obj1, obj2) {
        if (obj1 == obj2)
            return true;
        let res = true;
        const cmp1 = function (k, pn) {
            const v = SObject.tryGet(obj2, pn);
            if (v == undefined || v != this[k]) {
                res = false;
                return false;
            }
        };
        const cmp2 = function (k, pn) {
            const v = SObject.tryGet(obj1, pn);
            if (v == undefined || v != this[k]) {
                res = false;
                return false;
            }
        };
        SObject.traverse(obj1, cmp1);
        if (!res)
            return false;
        SObject.traverse(obj2, cmp2);
        if (!res)
            return false;
        return true;
    }
}
SObject.CUM_INDEX = 0;
class Attribution extends SObject {
    constructor(owner, name) {
        super();
        _Attribution_owner.set(this, void 0);
        _Attribution_name.set(this, void 0);
        __classPrivateFieldSet(this, _Attribution_owner, owner, "f");
        __classPrivateFieldSet(this, _Attribution_name, name, "f");
        if (this.get() instanceof SObject) {
            this.set = function (value) {
                this.get().set(value);
                return this;
            };
            this.add = function (other) {
                this.get().add(other);
                return this;
            };
            this.sub = function (other) {
                this.get().sub(other);
                return this;
            };
            this.multiply = function (other) {
                this.get().multiply(other);
                return this;
            };
        }
    }
    get owner() {
        return __classPrivateFieldGet(this, _Attribution_owner, "f");
    }
    get name() {
        return __classPrivateFieldGet(this, _Attribution_name, "f");
    }
    get type() {
        return typeof this.get();
    }
    get value() {
        return this.get();
    }
    get() {
        return __classPrivateFieldGet(this, _Attribution_owner, "f")[__classPrivateFieldGet(this, _Attribution_name, "f")];
    }
    set(value, assign = DATA_IDEN) {
        SObject.assign(__classPrivateFieldGet(this, _Attribution_owner, "f"), __classPrivateFieldGet(this, _Attribution_name, "f"), value, assign);
        //this.#owner[this.#name] = value;
        return true;
    }
    getter(...argArray) {
        if (this.type == "function") {
            const func = this.get();
            return func.bind(__classPrivateFieldGet(this, _Attribution_owner, "f"), ...argArray);
        }
        else {
            return this.get.bind(this);
        }
    }
    call(...argArray) {
        const val = this.get();
        if (val instanceof Function)
            return val.call(__classPrivateFieldGet(this, _Attribution_owner, "f"), ...argArray);
        else
            return undefined;
    }
    add(other) {
        __classPrivateFieldGet(this, _Attribution_owner, "f")[__classPrivateFieldGet(this, _Attribution_name, "f")] += other;
        return this;
    }
    sub(other) {
        __classPrivateFieldGet(this, _Attribution_owner, "f")[__classPrivateFieldGet(this, _Attribution_name, "f")] += other;
        return this;
    }
    multiply(other) {
        __classPrivateFieldGet(this, _Attribution_owner, "f")[__classPrivateFieldGet(this, _Attribution_name, "f")] *= other;
        return this;
    }
    static attributize(data) {
        let attrs = [];
        data.forEach(elem => {
            if (typeof elem != "object" || elem instanceof Array) {
                attrs.push(new Attribution(new SObject({ val: elem }), "value"));
            }
            else if ("owner" in elem && "name" in elem) {
                attrs.push(elem);
            }
            else if ("value" in elem)
                attrs.push(new Attribution(elem, "value"));
        });
        return attrs;
    }
}
_Attribution_owner = new WeakMap(), _Attribution_name = new WeakMap();
class EventList extends SObject {
    constructor(actor = undefined) {
        super();
        this.len = 0;
        this.bind(actor);
    }
    get length() {
        return this.len;
    }
    push(elem) {
        this[this.len] = elem;
        this.len++;
        return this;
    }
    pop() {
        this.len--;
        const temp = this[this.len];
        delete this[this.len];
        return temp;
    }
    clone(actor = this.actor) {
        return new EventList(actor).copy(this);
    }
    bind(actor) {
        this.actor = actor;
    }
    copy(other) {
        for (let index = 0; index < other.len; index++) {
            this.push(SObject.clone(other[index]));
        }
        return this;
    }
    trigger(...argArray) {
        for (let index = 0; index < this.len; index++) {
            this[index].call(this.actor, ...argArray);
        }
    }
    forEach(callback) {
        for (let index = 0; index < this.len; index++) {
            callback.call(this, this[index]);
        }
    }
    filter(predicate) {
        const temp = [];
        while (this.len > 0) {
            const elem = this.pop();
            if (predicate.call(this, elem)) {
                temp.push(elem);
            }
        }
        this.clear();
        temp.forEach(elem => {
            this.push(elem);
        });
    }
    clear() {
        while (this.len > 0) {
            this.pop();
        }
    }
}
