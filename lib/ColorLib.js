/*jshint esversion: 6 */
// @ts-check
export class Color {
    r=0;g=0;b=0;a=255;
    text = undefined;
    constructor() {
        if (arguments.length == 1) {
            if (typeof arguments[0] == 'string' ) 
                this.text = arguments[0];
            else if (arguments[0] instanceof Color) {
                this.copy(arguments[0]);
            }
            else if (arguments[0] instanceof Array && arguments[0].length > 3) {
                this.r = arguments[0][0];
                this.g = arguments[0][1];
                this.b = arguments[0][2];
                this.a = (arguments[0].length > 3 ? arguments[0][3] : 255);
            }
        } else if (arguments.length >= 3) {
            this.r = arguments[0];
            this.g = arguments[1];
            this.b = arguments[2];
            this.a = (arguments.length > 3 ? arguments[3] : 255);
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

    set(r=this.r,g=this.g,b=this.b,a=this.a) {
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a;
        this.text = undefined;
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
        return this;
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

    toString() {
        if (this.text != undefined) return this.text;
        let colorCode = "#";
        this.seq().forEach(cbyte => {
            let hexCode = Math.round(cbyte).toString(16)
            colorCode += Array(3 - hexCode.length).join('0') + hexCode;
        });
        return colorCode;
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
    /** @type {Map<any,Color>} */ colors = new Map();
    /** @type {number} */ state=0;

    /**
     * 
     * @param {Array<string | Color> | Map<any,Color|string>} colors 
     */
    constructor(colors) {
        super();
        
        colors.forEach((value,key=undefined) => {
            key = (key == undefined ? this.colors.keys.length : key);
            this.colors.set(key,new Color(value));
        });

        this.choose(0);
    }

    /**
     * 
     * @param {any} key 
     * @param {Color | string} color 
     */
    setPair(key,color) {
        this.colors.set(key, (typeof color == "string" ? new Color(color):color));
        return this;
    }

    /**
     * 
     * @param {Color | string} color 
     * @returns {ColorStates}
     */
    push(color) {
        this.setPair(this.colors.keys.length,color);
        return this;
    }

    /**
     * interpolate Color Betweem Color1 & 2
     * @param {number} u 
     */
    interpolate(u,withAlpha=false) {
        let color1 = this.colors.get([...this.colors.keys()][Math.floor(u)]);
        let color2 = this.colors.get([...this.colors.keys()][Math.ceil(u)]);
        
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
     * Change State of Color
     * @param {any} key 
     */
    switchTo(key) {
        if (this.colors.get(key) != undefined) this.copy(this.colors.get(key));
        return this;
    }
    
    /**
     * Change to Color of index
     * @param {number} index 
     */
    choose(index) {
        if (Number.isInteger(index)) 
            this.copy(this.colors.get([...this.colors.keys()][index]));
        else 
            this.copy(this.interpolate(index));
        return this;
    }

    /**
     * @returns {Color}
     */
    toggle() {
        this.state = (this.state + 1) % this.colors.size;
        return this.choose(this.state);
    }

    //Statics
}