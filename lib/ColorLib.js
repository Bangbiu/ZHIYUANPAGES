/*jshint esversion: 6 */
// @ts-check
export class Color {
    r=0;g=0;b=0;a=255;
    text = undefined;
    constructor() {
        if (arguments.length == 1) {
            if (typeof arguments[0] == 'string' ) 
                this.text = arguments[0];
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

    copy(other=undefined) {
        if (other == undefined) {
            return new Color(this.text==undefined ? this.seq() : this.text);
        } else {
            if (other.text == undefined) {
                this.r = other.r;
                this.g = other.g;
                this.b = other.b;
                this.a = other.a;
            } else {
                this.text = other.text;
            }
        }
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
     * @param {undefined | string | Array<Number>} color 
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