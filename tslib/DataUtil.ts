/*jshint esversion: 6 */

import { 
    DataAssignType, 
    GetAttemptCallBack, 
    Setter, 
    Getter, 
    JSDataType, 
    TraverseCallBack,
    Numerizable,
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
    clamp,
    mirror,
    warp,
    step,

    SObject,
    Attribution,
    EventList,
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


function clamp(value: number, max: number, min: number = 0.0): number {
    if (value < min) return min;
    if (value > max) return max;
    return value;
}

function mirror(value: number, mid: number): number {
    value = value % (mid * 2);
    if (value <= mid) return value;
    else return 2 * mid - value;
}

function warp(value: number, wall: number): number {
    return value % wall;
}

function step(value: number,des: number): number {
    if (value >= des) return 1.0;
    else return 0.0;
}

class SObject {

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

    printer(attrName?: string, ...argArray: any[]): Function {
        if (attrName) {
            const attr = this.attribution(attrName);
            const callee = (attr.type == "function") ? attr.call.bind(attr,...argArray) : attr.get.bind(attr);
            return ()=>(console.log(this.name + ATTR_SPLITER + attrName + " = " + callee()));
        } else {
            return ()=>(console.log(this.toString()));
        }
    }

    log(attrName?: string, ...argArray: any[]): void {
        this.logger(attrName, ...argArray)();
    }

    logger(attrName?: string, ...argArray: any[]): Function {
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
                SObject.assign(target,key,values[key],assign);
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
        if (key in target && !(target[key] instanceof cls)){
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
                if (target instanceof SObject) 
                    return target.clone() as unknown as T;
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

class EventList<A extends Object, T extends Function> extends SObject implements ArrayLike<T> {

    protected actor: A;
    protected len = 0;

    [n: number]: T

    constructor(actor: A = undefined) {
        super();
        this.bind(actor);
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

    clone(actor: A = this.actor): EventList<A,T> {
        return new EventList<A,T>(actor).copy(this);
    }

    bind(actor: A) {
        this.actor = actor;
    }

    copy(other: EventList<A,T>): this {
        for (let index = 0; index < other.len; index++) {
            this.push(SObject.clone(other[index]));
        }
        return this;
    }
    
    trigger(...argArray: any[]): void {
        for (let index = 0; index < this.len; index++) {
            this[index].call(this.actor,...argArray);
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

class StateMap<T> extends SObject implements ArrayLike<T> {
    #len = 0;
    def: T;
    [n: number]: T

    constructor(defst: T, states: StateMap<T> = undefined) {
        super();
        this.def = Object.assign({}, defst);
        if (states != undefined) {
            for (const key in states) {
                if (key != "def") {
                    this[key] = SObject.clone(states[key]);
                }
            }
        }
    }

    push(state: T) {
        this[this.#len] = state;
        this.#len++;
        return state;
    }

    put(key: Numerizable, state: T) {
        this[key] = this.push(state);
    }

    clone(other: T = this.def): StateMap<T> {
        return new StateMap<T>(other, this);
    }

    bind(defst: T): this {
        this.def = Object.assign({}, defst); 
        return this;
    }

    get length() {
        return this.#len;
    }
}
