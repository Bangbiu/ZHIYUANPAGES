import * as TU from "./TypeUtil.js";

export {
    getDescriptors,
    toPropDescriptor,
    Object
};

/**
 * @typedef {TU.Attribution} Attribution
 * @typedef {TU.Reference} Reference
 * @typedef {TU.TickFunction} TickFunction
 */


/**
 * 
 * @param {!object | TU.Attribution | TU.Reference | PropertyDescriptor} data 
 */
function toPropDescriptor(data) {
    //!object Convert To Reference
    if (!(typeof data == "object")) {
        data = {value: data};
    }
    //PropertyDescriptpr
    if ("getter" in data) return data;
    //Reference
    if ("value" in data) 
        return {
            get: ()=>(data.value),
            set: (v)=>(data.value=v)
        }
    else 
    //Attribution
        return {
            get: ()=>(data.owner[data.prop]),
            set: (v)=>(data.owner[data.prop] = v)
        }
}

/**
 * 
 * @param {Array<!object|Attribution|Reference|PropertyDescriptor>} data 
 * @returns {Array<PropertyDescriptor>}
 */
function getDescriptors(data) {
    /** @type {Array<PropertyDescriptor>} */
    let res = [];
    for (let i = 0; i < data.length; i++) {
        res.push(toPropDescriptor(data[i]));
    }
    return res;
}



class Object {
    /**
     * 
     * @param {Object} values
     * @param {Object} def 
     */
    setValues(values,def) {
        Object.setValues(this,values,def);
    }

    /**
     * 
     * @param {Object} values
     */
    insertValues(values) {
        Object.insertValues(this,values);
    }

    /**
     * 
     * @param {Object} target 
     */
    copy(target=undefined) {
        if (target == undefined) {
            return Object.assign({},this);
        } else {
            this.setValues(target,{});
        }
    }

    /**
     * 
     * @param {string} propName 
     * @returns {()=>any}
     */
    getter(propName) {
        const attr = Object.getAttribution(this,propName);
        if (attr != undefined) 
            return ()=>(attr.owner[attr.name]);  
        return undefined; 
    }
    
    /**
     * 
     * @param {string} propName 
     * @returns {(v)=>any}
     */
    setter(propName) {
        const attr = Object.getAttribution(this,propName);
        if (attr != undefined)  
            return (v)=>(attr.owner[attr.name]=v);   
        return undefined;
    }
    
    /**
     * 
     * @param {string} propName 
     * @returns {PropertyDescriptor}
     */
    referer(propName) {
        const attr = this.attribution(propName);
        if (attr != undefined)  
            return {
                get: ()=>(attr.owner[attr.name]),
                set: (v)=>(attr.owner[attr.name]=v)
            }    
        return undefined;
    }

    /**
     * 
     * @param {string} propName 
     * @returns {Attribution}
     */
    attribution(propName) {
        return Object.getAttribution(this,propName.split("."));
    }

    /**
     * @param {Object} target
     * @param {Object} values
     * @param {Object} def 
     */
    static setValues(target,values,def) {
        for (const key in target) {
            if (key in values) 
                target[key] = values[key];
            else 
                target[key] = def[key];
        }
    }


    /**
     * 
     * @param {Object} target 
     * @param {Object} values
     */
    static insertValues(target, values) {
        for (const key in values) {
            if (!(key in target)) 
                target[key] = values[key];
        }
    }

    /**
     * 
     * @param {Object} target 
     * @param {TU.TraverseCallBack} callback
     */
    static traverse(target, TraverseCallBack) {

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
                return {
                    owner: target,
                    name: curName
                } 
            return this.getAttribution(target[curName],propNames);
        } else {
            return undefined;
        }
    }
}

class Data extends Object {

    /**
     * 
     * @param {Data} other 
     */
    add(other,types=Data.DEF_TYPE) {
        Data.add(this,other,types);
    }

    /**
     * 
     * @param {Data} other 
     */
    sub(other,types=Data.DEF_TYPE) {
        Data.sub(this,other,types);
    }

    /**
     * 
     * @param {Data} dest 
     * @param {Data} source 
     * @param {Array<TU.JSDataType>} types
     */
    static add(dest,source,types=Data.DEF_TYPE) {
        for (const key in dest) {
            if (key in source) {
                if (source[key] instanceof Data)
                    dest[key].add(source[key]);
                else if (types.find(typeof source[key]))
                    dest[key] += source[key];
            }
        }
    }

    /**
     * 
     * @param {Data} dest 
     * @param {Data} source 
     * @param {Array<TU.JSDataType>} types
     */
    static subtract(dest,source,types=Data.DEF_TYPE) {
        for (const key in dest) {
            if (key in source) {
                if (source[key] instanceof Data)
                    dest[key].sub(source[key]);
                else if (types.find(typeof source[key]))
                    dest[key] -= source[key];
            }
        }
    }
    /**
     * 
     * @param {*} dest 
     * @param {Data} source 
     * @param {Array<TU.JSDataType>} types
     */
    static multiply(dest,source,types) {

    }

    



    /** @type {Array<TU.JSDataType>} */
    static DEF_TYPE = ["number","boolean"];
}


class DataBag {
    /** @typeof {any} */
    value;

    /**
     * 
     * @returns {any}
     */
    get() {
        return this.value;
    }

    /**
     * 
     * @param {any} value 
     */
    set(value) {
        this.value = value;
    }
}