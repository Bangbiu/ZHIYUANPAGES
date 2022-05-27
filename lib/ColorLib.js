/*jshint esversion: 6 */
// @ts-check
import * as DU from "./DataUtil.js";
import * as TU from "./TypeUtil.js";

export class Color extends DU.SObject {
    
    /** @type {number} */ r=0;
    /** @type {number} */ g=0;
    /** @type {number} */ b=0;
    /** @type {number} */ a=255;
    /** @type {string} */text = undefined;
    /** @type {(value: number,max: number)=>(number)} */#cutFunc = DU.clamp;
    constructor() {
        super();
        if (arguments.length == 1) {
            if (typeof arguments[0] == 'string' ) 
                this.text = arguments[0];
            else if (arguments[0] instanceof Color) {
                this.copy(arguments[0]);
            }
            else if (arguments[0] instanceof Array && arguments[0].length >= 3) {
                this.r = arguments[0][0];
                this.g = arguments[0][1];
                this.b = arguments[0][2];
                this.a = (arguments[0].length > 3 ? arguments[0][3] : 255);
            }
        } else if (arguments.length >= 3) {
            this.set(
                arguments[0],
                arguments[1],
                arguments[2],
                (arguments.length > 3 ? arguments[3] : 255)
            );
        }
    }

    /**
     * 
     * @param {Color} other 
     * @returns {Color}
     */
    copy(other=undefined) {
        if (other == undefined) {
            return new Color(this.text==undefined ? this.seq() : this.text);
        } else {
            if (other.text == undefined) {
                this.set(other.r,other.g,other.b,other.a);
            } else {
                this.text = other.text;
            }
            return this;
        }
    }

    /**
     * 
     * @param {number | Color | string | [number,number,number,number]} r 
     * @param {number} g 
     * @param {number} b 
     * @param {number} a 
     * @returns {Color}
     */
    set(r=this.r,g=this.g,b=this.b,a=this.a) {
        if (typeof r == "number") {
            this.r = r;
            this.g = g;
            this.b = b;
            this.a = a;
            this.text = undefined;
        } else if (typeof r == "string") {
            this.text = r;
        } else if (r instanceof Color) {
            this.copy(r);
        } else if (r instanceof Array) {
            this.set(r[0],r[1],r[2],r.length > 3 ? r[3] : 255);
        }
        return this;
    }

    /**
     * 
     * @param {number} a 
     * @returns {Color}
     */
    setAlpha(a) {
        if (a > 1.0) 
            this.a = a;
        else
            this.a = 255 * a;
        this.text = undefined;
        return this;
    }

    /**
     * @param {TU.CuttingFunctionType} type
     */
    setCuttingFunction(type) {
        this.#cutFunc = DU[type];
        return this;
    }

    /**
     * 
     * @param {Color | [number,number,number]} other 
     * @returns 
     */
    add(other) {
        if (other instanceof Color) {
            this.r += other.r;
            this.g += other.g;
            this.b += other.b;
        } else {
            this.r += other[0];
            this.g += other[1];
            this.b += other[2];
        }
        this.text = undefined;
        return this;
    }

    cut() {
        if (this.text == undefined || this.text.startsWith("#")) {
            this.r = this.#cutFunc(this.r,255.4);
            this.g = this.#cutFunc(this.g,255.4);
            this.b = this.#cutFunc(this.b,255.4);
            this.a = this.#cutFunc(this.a,255.4);
            this.text = undefined;
        }
    }

    /**
     * @abstract
     */
    switchTo(u) {
        return undefined;
    }

    /**
     * @abstract
     */
    toggle() {
        return undefined;
    }

    seq() {
        return [this.r,this.g,this.b,this.a];
    }

    get value() {
        if (this.text != undefined) return this.text;
        let colorCode = "#";
        this.seq().forEach(cbyte => {
            let hexCode = Math.round(this.#cutFunc(cbyte,255.4)).toString(16)
            colorCode += Array(3 - hexCode.length).join('0') + hexCode;
        });
        this.text = colorCode;
        return colorCode;
    }

    toString() {
        return `<Color:${this.value}>`;
    }

    /**
     * 
     * @param {undefined | string | Array<Number> | object} color 
     * @returns 
     */
    static parseColor(color) {
        if (typeof color == 'undefined') return "black";
        if (typeof color == 'string' ) return color;
        if (!(color instanceof Array)) return "black";
        for (let i = color.length; i < 4; i++) color.push(255);
        let colorCode = "#";
        color.forEach(cbyte => {
            let hexCode = Math.round(cbyte).toString(16)
            colorCode += Array(3 - hexCode.length).join('0') + hexCode;
        });
        return colorCode;
    }
}

export class ColorStates extends Color {
    /** @type {number | string} */ state = 0;
    /** @type {Object.<string,Color>} */palette = {};
    /**
     * 
     * @param { Object.<string,TU.Colorizable> | Array<TU.Colorizable> } colorMap 
     */
    constructor( colorMap = { defaultColor : "white" } ) {
        super();
        if (colorMap instanceof Array) {
            colorMap.forEach(elem => {
                this.push(elem);
            });
        } else {
            for (const key in colorMap) {
                this.put(key,colorMap[key]);
            }
        }
        this.select(0);
    }

    get size() {
        return Object.keys(this.palette).length;
    }

    /**
     * 
     * @param {number | string} key 
     * @param {TU.Colorizable} color 
     * @returns {ColorStates}
     */
    put(key,color) {
        this.palette[key] = new Color(color);
        return this;
    }

    /**
     * 
     * @param {TU.Colorizable} color 
     * @returns {ColorStates}
     */
    push(color) {
        this.put(this.size, color);
        return this;
    }

    /**
     * interpolate Color Betweem Color1 & 2
     * @param {number} u 
     */
    interpolate(u,withAlpha=false) {
        let color1 = this.palette[this.getKey(Math.floor(u))];
        let color2 = this.palette[this.getKey(Math.ceil(u))];
        
        if (color2.text != undefined || color1.text != undefined) {
            if (u == Math.ceil(u)) return color2.copy();
            else return color1.copy();
        }
        return new Color(
            color1.r + (color2.r - color1.r) * u,
            color1.g + (color2.g - color1.g) * u,
            color1.b + (color2.b - color1.b) * u,
            withAlpha ? 
            color1.a + (color2.a - color1.a) * u : 255
        );
    }   

    /**
     * 
     * @param {number} index 
     * @returns {string}
     */
    getKey(index) {
        return Object.keys(this.palette)[index % this.size];
    }

    /**
     * Change State of Color
     * @param { number | string } key 
     * @returns {ColorStates}
     */
    switchTo(key) {
        this.state = key;
        super.copy(this.palette[key]);
        return this;
    }
    
    /**
     * Change to Color of index
     * @param {number} index 
     * @returns {ColorStates}
     */
     select(index) {
        if (Number.isInteger(index))
            this.switchTo(this.getKey(index));
        else {
            this.state = index;
            super.copy(this.interpolate(index));
        }
        return this;
    }

    /**
     * @returns {Color}
     */
    toggle() {
        if (typeof this.state == "number") {
            return this.select((this.state + 1)) ;
        }
    }

    /**
     * 
     * @param {ColorStates} other 
     * @returns {ColorStates}
     */
    copy(other = undefined) {
        if (other == undefined) {
            return new ColorStates(this.palette);
        } else {
            super.copy(other);
            this.palette = {};
            for (const key in other.palette) this.put(key,other.palette[key]);
            return this;
        }
    }

    //Statics
}