/*jshint esversion: 6 */
// @ts-check
import * as TU from "./TypeUtil.js";

export {
    doNothing,
    clamp,
    mirror,
    warp,
    step,
    SObject,
    Renderable,
    Attribution
};
const doNothing = function(){};

/**
 * @param {number} value 
 * @param {number} min 
 * @param {number} max 
 * @returns {number}
 */
function clamp(value,max,min=0.0) {
    if (value < min) return min;
    if (value > max) return max;
    return value;
}
/**
 * @param {number} value 
 * @param {number} mid 
 * @returns {number}
 */
function mirror(value,mid) {
    value = value % (mid * 2);
    if (value <= mid) return value;
    else return 2 * mid - value;
}

/**
 * @param {number} value 
 * @param {number} wall 
 * @returns {number}
 */
 function warp(value,wall) {
    return value % wall;
}


/**
 * 
 * @param {number} value 
 * @param {number} des 
 * @returns 
 */
function step(value,des) {
    if (value >= des) return 1.0;
    else return 0.0;
}

class SObject {

    /**
     * 
     * @param {Object} properties 
     */
    constructor( properties ) {
        if (properties) this.insertValues(properties);
        SObject.CUM_INDEX++;
    }

    get class() {
        return this.constructor.name;
    }

    /**
     * @returns {any}
     */
    get value() {
        return this["val"];
    }

    set value(val) {
        this["val"] = val;
    }

    /**
     * 
     * @param {Object} values 
     * @param {Object} def 
     * @param {TU.DataAssignType} assign 
     * @returns {this}
     */
    initialize( values, def, assign=SObject.DATA_CLONE ) {
        return SObject.initialize(this,values,def,assign);
    }

    /**
     * 
     * @param {Object} values
     * @param {TU.DataAssignType} assign
     * @returns {this}
     */
    setValues( values = {}, assign = SObject.DATA_CLONE ) {
        return SObject.setValues(this,values,assign);
    }

    /**
     * 
     * @param {Object} values
     * @param {TU.DataAssignType} assign
     * @returns {this}
     */
    updateValues( values = {}, assign = SObject.DATA_CLONE ) {
        return SObject.updateValues(this,values,assign);
    }

    /**
     * 
     * @param {Object} values
     * @param {TU.DataAssignType} assign
     * @returns {this}
     */
    insertValues( values = {}, assign = SObject.DATA_CLONE ) {
        return SObject.insertValues(this,values,assign);
    }

    /**
     * Update Values
     * @param {Object} source 
     * @returns {this}
     */
    copy(source) {
        return this.updateValues(source,SObject.DATA_CLONE);
    }

    /**
     * Deep Clone
     * @returns {SObject}
     */
    clone() {
        return SObject.clone(this);
    }

    /**
     * 
     * @param {string} propName
     * @param {TU.GetAttemptCallBack} success
     * @param {TU.GetAttemptCallBack} fail
     * @returns {any}
     */
    tryGet(propName, success=doNothing, fail=doNothing) {
        const gotCallBack = (attr)=>(success.call(this,attr.get()));
        const failCallBack = ()=>(fail.call(this,undefined));
        this.access(propName, gotCallBack, failCallBack);
    }

    /**
     * 
     * @param {string} propName 
     * @param {any} value
     * @returns {boolean}
     */
    trySet(propName, value) {
        return this.access(propName, (attr)=>(attr.set(value))) != undefined;
    }

    /**
     * 
     * @param {any} value 
     * @returns {any}
     */
    set(value) {
        return false;
    }

    /**
     * 
     * @param {string} key 
     * @param {any} value 
     * @param {TU.DataAssignType} type 
     * @returns {this}
     */
    assign(key,value,type=SObject.DATA_CLONE) {
        return SObject.assign(this,key,value,type);
    }

    /**
     * 
     * @param {Array<string>} propNames 
     */
    has(propNames) {
        SObject.has(this,propNames);
    }

    /**
     * 
     * @param {string} key 
     * @param {typeof SObject} cls 
     * @returns {this[key]} 
     */
    resolve(key,cls) {
        return SObject.resolve(this,key,cls);
    }
    
    /**
     * 
     * @param {string} propName
     * @param {TU.AccessAttemptCallBack} success
     * @param {TU.AccessAttemptCallBack} fail
     * @returns {Attribution}
     */
    access(propName, success=doNothing, fail=doNothing) {
        const attr = this.attribution(propName);
        if (attr != undefined) {
            success.call(this,attr)
            return attr;
        } else {
            fail.call(this,undefined);
            return undefined;
        }
    }

    /**
     * 
     * @param {string} propName 
     * @returns {()=>any}
     */
    getter(propName) {
        let res = undefined;
        this.access(propName, (attr)=>(res = attr.get));
        return res;
    }
    
    /**
     * 
     * @param {string} propName 
     * @returns {(v)=>any}
     */
    setter(propName) {
        let res = undefined;
        this.access(propName, (attr)=>(res = attr.set));
        return res;
    }

    /**
     * 
     * @param {string} propName 
     * @returns {Attribution}
     */
    attribution(propName) {
        return SObject.getAttribution(this,propName.split("."));
    }

    /**
     * 
     * @param {object} other
     * @param {Array<TU.JSDataType>} types
     * @returns {object} 
     */
    add(other,types=SObject.DEF_TYPE) {
        if (other instanceof SObject)
            return SObject.add(this,other,types);
    }

    /**
     * 
     * @param {object} other 
     * @param {Array<TU.JSDataType>} types 
     * @returns {object}
     */
    sub(other,types=SObject.DEF_TYPE) {
        if (other instanceof SObject)
            return SObject.subtract(this,other,types);
    }

    /**
     * 
     * @param {object} other 
     * @param {Array<TU.JSDataType>} types 
     * @returns {object}
     */
    multiply(other,types=SObject.DEF_TYPE) {
        if (other instanceof SObject)
            return SObject.multiply(this,other,types);
    }

    /**
     * 
     * @param {TU.TraverseCallBack} callback
     * @param {string} rootName
     * @param {Array<TU.JSDataType>} types
     * @returns {SObject}
     */
    traverse(callback, rootName="", types=SObject.DEF_TYPE) {
        return SObject.traverse(this, callback, rootName, types);
    }

    /**
     * 
     * @returns {string}
     */
    toString() {
        // @ts-ignore
        return `<SObject: ID_${this.name}>`;
    }

    /**
     * 
     * @param {SObject} dest 
     * @param {SObject} source 
     * @param {Array<TU.JSDataType>} types
     * @returns {SObject}
     */
    static add(dest,source,types=SObject.DEF_TYPE) {
        const callBack = function(key, propName) {
            source.tryGet(propName,(value)=>(this[key] += value));
        };
        this.traverse(dest, callBack, "", types);
        return dest;
    }

    /**
     * 
     * @param {SObject} dest 
     * @param {SObject} source 
     * @param {Array<TU.JSDataType>} types
     * @returns {SObject}
     */
    static subtract(dest,source,types=SObject.DEF_TYPE) {
        const callBack = function(key, propName) {
            source.tryGet(propName,(value)=>(this[key] -= value));
        };
        this.traverse(dest, callBack,"", types);
        return dest;
    }
    /**
     * 
     * @param {*} dest 
     * @param {SObject} source 
     * @param {Array<TU.JSDataType>} types
     * @returns {SObject}
     */
    static multiply(dest,source,types=SObject.DEF_TYPE) {
        const callBack = function(key, propName) {
            source.tryGet(propName,(value)=>(this[key] *= value));
        };
        this.traverse(dest, callBack,"", types);
        return dest;
    }

    /**
     * 
     * @param {SObject} target 
     * @param {TU.TraverseCallBack} callback
     * @param {string} rootName
     * @param {Array<TU.JSDataType>} types
     * @returns {SObject}
     */
    static traverse(target, callback, rootName="", types=SObject.DEF_TYPE) {
        for (let key in target) {
            const value = target[key];
            const curName = rootName + (rootName==""?"":".") + key;
            if (value instanceof SObject) 
                this.traverse(value, callback, curName, types);
            if (types.includes(typeof value))
                callback.call(target, key, curName);
        }
        return target;
    }    

    /**
     * 
     * @param {Object} target 
     * @param {Object} values 
     * @param {Object} def 
     * @param {TU.DataAssignType} assign 
     */
    static initialize(target,values,def,assign = SObject.DATA_IDEN) {
        if (target instanceof SObject) {
            //DefaultValue
            target.setValues(def,SObject.DATA_CLONE);
            target.updateValues(values,assign);
        } else {
            SObject.setValues(target,def,SObject.DATA_CLONE);
            SObject.updateValues(target,values,assign);
        }

        return target;
    }
    /**
     * @param {Object} target
     * @param {Object} values
     * @param {TU.DataAssignType} assign
     * @returns {Object}
     */
    static setValues(target,values,assign = SObject.DATA_CLONE) {
        for (const key in values) {
            SObject.assign(target,key,values[key],assign);
        }
        return target;
    }

    /**
     * @param {Object} target
     * @param {Object} values
     * @param {TU.DataAssignType} assign
     * @returns {Object}
     */
    static updateValues(target,values,assign = SObject.DATA_CLONE) {
        for (const key in values) {
            if (key in target)
                SObject.assign(target,key,values[key],assign);
        }
        return target;
    }

    /**
     * @param {Object} target
     * @param {Object} values
     * @param {TU.DataAssignType} assign
     * @returns {Object}
     */
    static insertValues(target, values, assign = SObject.DATA_CLONE) {
        for (const key in values) {
            if (!(key in target)) 
                SObject.assign(target,key,values[key],assign);
        }
        return target;
    }

    /**
     * @template T
     * @param {T} target
     * @param {string} key 
     * @param {any} value 
     * @param {TU.DataAssignType} type 
     * @returns {T}
     */
    static assign(target,key,value,type=SObject.DATA_CLONE) {
        switch (type) {
            case SObject.DATA_CLONE: {
                target[key] = SObject.clone(value);
                break;
            }
            case SObject.DATA_IDEN: {
                target[key] = value;
                break;
            }
        }
        return target;
    }

    /**
     * 
     * @param {Object} target 
     * @param {string} key 
     * @param {typeof SObject} cls 
     * @returns {target[key]}
     */
    static resolve(target,key,cls) {
        if (key in target && !(target[key] instanceof cls)){
            target[key] = new cls(target[key]);
        }
        return target[key];
    }

    /**
     * @template T
     * @param {T} target 
     * @param {Object} source 
     * @returns {T}
     */
    static copy(target,source) {
        return SObject.updateValues(target,source,SObject.DATA_CLONE);  
    }
    /**
     * @param {any} target
     * @returns {any}
     */
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
                } else
                    return SObject.setValues(Object.create(target.constructor.prototype),target);
            }
            default: { return target; }
        }
    }

    /**
     * 
     * @param {Object} target 
     * @param {Array<string>} propNames 
     * @returns {Attribution}
     */
    static getAttribution(target, propNames) {
        let curName = propNames.shift();
        if (curName in target) {
            if (propNames.length <= 0) 
                return new Attribution(target, curName);
            return this.getAttribution(target[curName],propNames);
        } else {
            return undefined;
        }
    }

    /**
     * 
     * @param {Object} target 
     * @param {Array<string>} propNames 
     * @returns {boolean}
     */
    static has(target, propNames) {
        for (let i = 0; i < propNames.length; i++) {
            if (!(propNames[i] in target)) return false;
        }
        return true;
    }

    /** @type {TU.DataAssignType} */
    static DATA_IDEN = "identical";
    /** @type {TU.DataAssignType} */
    static DATA_CLONE = "clone";
    /** @type {TU.DataAssignType} */
    static DATA_UNINIT = "uninit";
    /** @type {Array<TU.JSDataType>} */
    static DEF_TYPE = ["number","boolean"];
    /** @type {number} */
    static CUM_INDEX = 0;

}

class Renderable extends SObject {

    /**
     * @abstract
     * @param {number} delta 
     */
    update(delta) {}

    /**
     * @abstract
     * @param {CanvasRenderingContext2D} ctx 
     */
    render(ctx) {}

}


class Attribution extends SObject {
    /** @type {SObject} */ owner;
    /** @type {string} */  name;
    
    /**
     * 
     * @param {any} owner 
     * @param {string} name 
     */
    constructor(owner,name) {
        super();
        this.owner = owner;
        this.name = name;

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

    /**
     * 
     * @returns {any}
     */
    get() {
        return this.owner[this.name];
    }

    /**
     * 
     * @param {any} value 
     * @returns {Attribution}
     */
    set(value) {
        this.owner[this.name] = value;
        return this;
    }

    /**
     * 
     * @param {any} other 
     * @returns {Attribution}
     */
    add(other) {
        this.owner[this.name] += other;
        return this;
    }

    /**
     * 
     * @param {any} other 
     * @returns {Attribution}
     */
    sub(other) {
        this.owner[this.name] += other;
        return this;
    }    

    /**
     * 
     * @param {any} other 
     * @returns {Attribution}
     */
    multiply(other) {
        this.owner[this.name] *= other;
        return this;
    }

    /**
     * 
     * @param {Array<TU.Referrable>} data 
     * @returns {Array<Attribution>}
     */
    static attributize(data) {
        let attrs = [];
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