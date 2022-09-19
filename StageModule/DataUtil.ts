/*jshint esversion: 6 */

import { 
    DataAssignType, 
    GetAttemptCallBack, 
    Setter, 
    Getter, 
    JSDataType, 
    TraverseCallBack,
    Numerizable,
    Reproducable,
} from "./TypeUtil";

const DATA_CLONE: DataAssignType = "clone";
const DATA_IDEN: DataAssignType = "identical";
const DATA_UNINIT: DataAssignType = "uninit";
const ATTR_SPLITER: string = '.';

const doNothing: Function = function(...argArray: any[]): any {return undefined};

let ASN_DEF: DataAssignType = DATA_CLONE;
let JSD_DEF: JSDataType[] = ["number","boolean"];

export {
    doNothing,

    SObject,
    Attribution,
    
    ListenerList,
    ListenerMap,

    StateMap,
    ASN_DEF,
    JSD_DEF,

    DATA_IDEN,
    DATA_CLONE,
    DATA_UNINIT
};

Function.prototype["clone"] = function() {
    var cloneObj = this;
    if(this.__isClone) {
      cloneObj = this.__clonedFrom;
    }

    var temp = function() { return cloneObj.apply(this, arguments); };
    for(var key in this) {
        temp[key] = this[key];
    }

    temp["__isClone"] = true;
    temp["__clonedFrom"] = cloneObj;

    return temp;
};


class SObject implements Reproducable {

    constructor( properties?: Object, assign: DataAssignType = ASN_DEF) {
        if (properties) this.insertValues(properties, assign);
        SObject.CUM_INDEX++;
    }

    get class(): string {
        return this.constructor.name;
    }

    get name(): string {
        return this.class;
    }

    get value(): any {
        return this["val"];
    }

    set value(val: any) {
        this["val"] = val;
    }

    initialize( values: Object, def: Object, assign: DataAssignType = ASN_DEF ): this {
        this.setValues(def, DATA_CLONE);
        return this.updateValues(values, assign);
    }

    setValues( values: Object = {}, assign: DataAssignType = ASN_DEF ): this {
        return SObject.setValues(this, values, assign);
    }

    updateValues( values: Object = {}, assign: DataAssignType = ASN_DEF ): this {
        SObject.updateValues(this, values, assign);
        this.resolveAll();
        return this;
    }

    insertValues( values: Object = {}, assign: DataAssignType =ASN_DEF ): this {
        return SObject.insertValues(this,values,assign);
    }

    copy(source: Object): this {
        return this.updateValues(source, ASN_DEF);
    }

    clone(): SObject {
        return new SObject(this);
    }

    tryGet(propName: string, success?: GetAttemptCallBack, fail?: GetAttemptCallBack): any {
        return SObject.tryGet(this, propName, success, fail);
    }

    trySet(propName: string, value: any): boolean {
        return this.access(propName, (attr)=>(attr.set(value))) != undefined;
    }

    set(value: any): any {
        return false;
    }

    assign(key: string, value: any, type: DataAssignType = ASN_DEF): this {
        return SObject.assign(this, key, value, type);
    }

    has(propNames: string[]): boolean {
        return SObject.has(this,propNames);
    }

    resolve(key: string, cls: any): any {
        return SObject.resolve(this,key,cls);
    }

    resolveAll(other: Object = this): Object {
        return other;
    }
    
    access(propName: string, success?: GetAttemptCallBack, fail?: GetAttemptCallBack): Attribution | undefined {
        return SObject.access(this, propName, success, fail);
    }

    print(attrName?: string, ...argArray: any[]): void {
        this.printer(attrName, ...argArray)();
    }

    getter(propName: string): Getter {
        let attr = this.access(propName);
        let res = doNothing as Getter;
        if (attr) res = attr.get.bind(attr);
        return res;
    }
    
    setter(propName: string): Setter {
        let attr = this.access(propName);
        let res = doNothing as Setter;
        if (attr) res = attr.set.bind(attr);
        return res;
    }

    subset(propNames: string[]): Object {
        return SObject.subset(this, propNames);
    }

    printer(attrName?: string, ...argArray: any[]): Function {
        if (attrName) {
            const attr = this.attribution(attrName);
            const callee = (attr.type == "function") ? attr.call.bind(attr,...argArray) : attr.get.bind(attr);
            return ()=>(console.log(this.name + ATTR_SPLITER + attrName + " = " + callee()));
        } else {
            return ()=>(console.log(this.toString()));
        }
    }

    msg(attrName?: string, ...argArray: any[]): void {
        this.msgr(attrName, ...argArray)();
    }

    msgr(attrName?: string, ...argArray: any[]): Function {
        if (attrName) {
            const callee = this.attribution(attrName).getter(...argArray);
            return ()=>(console.log(callee()));
        } else {
            return ()=>(console.log(this));
        }
    }

    attribution(propName: string): Attribution | undefined {
        return SObject.getAttribution(this, propName.split(ATTR_SPLITER));
    }

    add(other: Object, types: JSDataType[] = JSD_DEF): this {
        return SObject.add(this, other, types) as this;
    }

    sub(other: Object, types: JSDataType[] = JSD_DEF): this {
        return SObject.subtract(this, other, types) as this;
    }

    multiply(other: Object, types: JSDataType[] = JSD_DEF): this {
        return SObject.multiply(this,other,types) as this;
    }

    traverse(callback: TraverseCallBack, rootName: string = "", types: JSDataType[] = JSD_DEF): this {
        return SObject.traverse(this, callback, rootName, types) as this;
    }

    toString(): string {
        return `<${this.name}: ${this.class} = ${this.value}>`;
    }

    equals(other: Object): boolean {
        return SObject.equals(this, other);
    }

    equivalent(other: any): boolean {
        return false;
    }

    static wrap(target: Object): SObject {
        return (target instanceof SObject) ? target : new SObject(target);
    }

    static tryGet(dest: Object, propName: string, success?: GetAttemptCallBack, fail?: GetAttemptCallBack): any {
        const gotCallBack = success? (attr)=>(success.call(dest, attr.get())) : doNothing as GetAttemptCallBack;
        const failCallBack = fail? ()=>(fail.call(dest, undefined)) : doNothing as GetAttemptCallBack;
        let attr = SObject.access(dest, propName, gotCallBack, failCallBack);
        if (attr) return attr.get();
    }

    static trySet(dest: Object, propName: string, value: any, assign: DataAssignType = DATA_IDEN): boolean {
        return SObject.access(dest, propName, (attr)=>(attr.set(value, assign))) != undefined;
    }

    static access(dest: Object, propName: string, success?: GetAttemptCallBack, fail?: GetAttemptCallBack): Attribution | undefined {
        const attr = SObject.getAttribution(dest, propName.split(ATTR_SPLITER));
        if (attr != undefined) {
            if (success) success.call(dest, attr)
        } else if (fail) 
            fail.call(dest, undefined);
        return attr;
    }

    static add<T>(dest: T,source: Object, types: JSDataType[] = JSD_DEF): T {
        const callBack: TraverseCallBack = function(key, propName) {
            return SObject.tryGet(source, propName,(value)=>(this[key] += value));
        };
        this.traverse(dest, callBack, "", types);
        return dest;
    }

    static subtract<T>(dest: T, source: Object, types: JSDataType[] = JSD_DEF): T {
        const callBack = function(key, propName) {
            SObject.tryGet(source, propName,(value)=>(this[key] -= value));
        };
        SObject.traverse(dest, callBack,"", types);
        return dest;
    }

    static multiply<T>(dest: T, source: Object, types: JSDataType[] = JSD_DEF): T {
        const callBack = function(key, propName) {
            SObject.tryGet(source, propName, (value)=>(this[key] *= value));
        };
        SObject.traverse(dest, callBack,"", types);
        return dest;
    }

    static traverse<T>(target: T, callback: TraverseCallBack, rootName: string = "", types: JSDataType[] = JSD_DEF): T {
        for (const key in target) {
            const value = target[key];
            const curName = rootName + (rootName==""?"":".") + key;
            if (typeof value == "object") 
                SObject.traverse(value, callback, curName, types);
            if (types.includes(typeof value)) {
                if (callback.call(target, key, curName) == false) return target;
            }
        }
        return target;
    }    

    static initialize<T>(target: T, values: Object, def: Object, assign: DataAssignType = ASN_DEF): T {
        SObject.setValues(target,def,ASN_DEF);
        SObject.updateValues(target,values,assign);
        return target;
    }

    static setValues<T>(target: T, values: Object, assign: DataAssignType = ASN_DEF): T {
        for (const key in values) {
            SObject.assign(target,key,values[key],assign);
        }
        return target;
    }

    static updateValues<T>(target: T, values: Object, assign: DataAssignType = ASN_DEF): T {
        for (const key in values) {  
            if (key in target) {
                SObject.assign(target, key, values[key], assign);
            } else {
                SObject.trySet(target, key, values[key], assign);
            }
        }
        return target;
    }

    static insertValues<T>(target: T, values: Object, assign: DataAssignType = ASN_DEF): T {
        for (const key in values) {
            if (!(key in target)) 
                SObject.assign(target,key,values[key],assign);
        }
        return target;
    }

    static assign<T>(target: T, key: string, value: any, type: DataAssignType = ASN_DEF): T {
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

    static resolve(target: Object, key: string, cls: any): any {
        if (key in target && !(target[key] instanceof cls) && target[key] != undefined) {
            target[key] = new cls(target[key]);
            return target[key];
        }
        return undefined;
    }

    static copy<T>(target: T, source: Object): T {
        return SObject.updateValues(target, source, DATA_CLONE);  
    }

    static clone<T>(target: T): T {
        switch (typeof target) {
            case "object": {
                if ("clone" in target) 
                    return (target["clone"] as Function)() as T;
                else if (target instanceof Array) {
                    const res = [];
                    target.forEach(element => {
                        res.push(SObject.clone(element));
                    });
                    return res as unknown as T;
                } else
                    return SObject.setValues(Object.create(target.constructor.prototype), target, DATA_CLONE);
            }
            case "function": {
                const func = function(...argArray: any[]) {
                    return target.call(this, ...argArray);
                };
                Object.assign(func, target);
                return func as unknown as T;
            }
            default: { return target; }
        }
    }

    static getAttribution(target: Object, propNames: string[]): Attribution | undefined {
        let curName = propNames.shift();
        if (curName == undefined) return undefined;
        if (curName in target) {
            if (propNames.length <= 0) 
                return new Attribution(target, curName);
            return SObject.getAttribution(target[curName], propNames);
        } else {
            return undefined;
        }
    }

    static has(target: Object, propNames: string[]): boolean {
        for (let i = 0; i < propNames.length; i++) {
            if (!(propNames[i] in target)) return false;
        }
        return true;
    }

    static equals(obj1: Object, obj2: Object): boolean {
        if (obj1 == obj2) return true;
        let res: boolean = true;
        const cmp1: TraverseCallBack = function(k,pn) {
            const v = SObject.tryGet(obj2, pn);
            if (v == undefined || v != this[k]) {
                res = false;
                return false;
            }
        }
        const cmp2: TraverseCallBack = function(k,pn) {
            const v = SObject.tryGet(obj1, pn);
            if (v == undefined || v != this[k]) {
                res = false;
                return false;
            }
        }
        SObject.traverse(obj1, cmp1);
        if (!res) return false;
        SObject.traverse(obj2, cmp2);
        if (!res) return false;
        return true;
    }

    static subset(target: Object, propNames: string[]): Object {
        const res = {};
        propNames.forEach(prop => {
            SObject.tryGet(target, prop, function(value) {
                res[prop] = value;
            });
        });
        return res;
    }

    static CUM_INDEX: number = 0;

}


class Attribution extends SObject {
    #owner: Object;
    #name: string;

    constructor(owner: Object, name: string) {
        super();
        this.#owner = owner;
        this.#name = name;

        if (this.get() instanceof SObject) {
            this.set = function(value) {
                this.get().set(value);
                return this;
            };

            this.add = function(other) {
                this.get().add(other);
                return this;
            };

            this.sub = function(other) {
                this.get().sub(other);
                return this;
            };

            this.multiply = function(other) {
                this.get().multiply(other);
                return this;
            };
        }
            
    }

    get owner(): Object {
        return this.#owner;
    }

    get name(): string {
        return this.#name
    }

    get type(): JSDataType {
        return typeof this.get();
    }

    get value(): any {
        return this.get();
    }

    get(): any {
        return this.#owner[this.#name];
    }

    set(value: any, assign: DataAssignType = DATA_IDEN): boolean {
        SObject.assign(this.#owner, this.#name, value, assign);
        //this.#owner[this.#name] = value;
        return true;
    }

    getter(...argArray: any[]): Getter {
        if (this.type == "function") {
            const func = this.get() as Function;
            return func.bind(this.#owner, ...argArray);
        } else {
            return this.get.bind(this);
        }
    }

    call(...argArray: any[]): any {
        const val = this.get();
        if (val instanceof Function)
            return (val as Function).call(this.#owner, ...argArray);
        else 
            return undefined;
    }

    add(other: any): this {
        this.#owner[this.#name] += other;
        return this;
    }

    sub(other: any): this {
        this.#owner[this.#name] += other;
        return this;
    }    

    multiply(other: any): this {
        this.#owner[this.#name] *= other;
        return this;
    }

    static attributize(data: any[]): Attribution[] {
        let attrs: any[] = [];
        data.forEach(elem => {
            if (typeof elem != "object" || elem instanceof Array) {
                attrs.push(new Attribution(
                    new SObject({val: elem}), 
                    "value"
                ));
            } else if ("owner" in elem && "name" in elem) {
                attrs.push(elem);
            } else if ("value" in elem) 
                attrs.push(new Attribution(elem, "value"));
        });
        return attrs;
    }
}

class ListenerList<T extends Function> extends SObject implements ArrayLike<T> {
    protected len = 0;

    [n: number]: T

    constructor(list?: ListenerList<T>) {
        super();
        if (list != undefined) this.copy(list);
    }

    get length() {
        return this.len;
    }

    push(elem: T): this {
        this[this.len] = elem;
        this.len++;
        return this;
    }

    pop(): T {
        this.len--;
        const temp = this[this.len]
        delete this[this.len];
        return temp;
    }

    clone(): ListenerList<T> {
        return new ListenerList<T>(this);
    }

    copy(other: ListenerList<T>): this {
        for (let index = 0; index < other.len; index++) {
            this.push(SObject.clone(other[index]));
        }
        return this;
    }
    
    trigger(thisArg: any, ...argArray: any[]): void {
        for (let index = 0; index < this.len; index++) {
            this[index].call(thisArg,...argArray);
        }
    }

    forEach(callback: (elem: T) => void) {
        for (let index = 0; index < this.len; index++) {
            callback.call(this, this[index]);
        }
    }

    filter(predicate: (elem: T) => boolean) {
        const temp: Array<T> = [];
        while(this.len > 0) {
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

    clear():void {
        while(this.len > 0) {
            this.pop();
        }
    }

}

class ListenerMap extends SObject {

    //[list: symbol]: ListenerList<Function>;
    
    constructor(map?: ListenerMap) {
        super();
        if (map != undefined) this.copy(map);
    }

    clone(): ListenerMap {
        return new ListenerMap(this);
    }

    copy(other: ListenerMap): this {
        this.setValues(other, DATA_CLONE);
        return this;
    }

    addEventListener(eventType: string, callback: Function) {
        this[eventType].push(callback);
    }

    trigger(actor: any, eventType: string, eventArgs: Object) {
        (this[eventType] as ListenerList<any>)?.trigger(actor, eventArgs);
    }

}


class StateMap<T> extends SObject implements ArrayLike<T> {
    #len = 0;
    #target: T = undefined;
    #curState: Numerizable = 0;
    [n: number]: T

    constructor(states: Object = {}, initInd: Numerizable = 0) {
        super();
        this.push({} as T);                 //Default State
        if (states instanceof StateMap) {
            for (const key in states) {
                this[key] = SObject.clone(states[key]);
            }
            this.#len = states.#len;
        } else if (states instanceof Object) {
            for (const key in states) {
                if (key == "def") 
                    this[0] = SObject.clone(states[key]);
                else
                    this.put(key, SObject.clone(states[key]));
            }
        }
        this.#curState = initInd;
    }

    push(state: T): number {
        this[this.#len] = state;
        if (this.#target != undefined) {
            for (const key in state) {
                this[0][key] = this.#target[key];
            }
        }
        this.#len++;
        return this.#len - 1;
    }

    put(key: Numerizable, state: T) {
        if (key in this)
            this[key] = state;
        else 
            this[key] = this.push(state);
    }

    get(key: Numerizable): T {
        if (typeof key == "number") {
            return this[key];
        } else {
            return this[this[key]];
        }
    }

    fetch(): T {
        return this[this.#curState];
    }

    swtichTo(key: Numerizable): T {
        const state = this.get(key);
        if (state != undefined) this.#curState = key;
        return state;
    }

    toggle(): T {
        if (typeof this.#curState != "number") {
            this.#curState = this[this.#curState];
        }
        this.#curState = (this.#curState as number + 1) % this.#len;
        return this.fetch();
    }

    clone(other: T = this.#target): StateMap<T> {
        return new StateMap<T>(this, this.#curState).bind(other);
    }

    bind(target: T): this {
        if (target == undefined) return this;
        this.#target = target;
        
        for (let index = 1; index < this.#len; index++) {
            for (const key in this[index]) {
                this[0][key] = this.#target[key];
            }
        }
        
        return this;
    }

    get currentState(): Numerizable {
        return this.#curState;
    }

    get length(): number {
        return this.#len;
    }
}
