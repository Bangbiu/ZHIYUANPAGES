/*jshint esversion: 6 */
// @ts-check
import * as DU from "./DataUtil.js";
import * as TU from "./TypeUtil.js";

export {
    Vector2D,
    Rect2D
}

/**
 * Data Type
 * @typedef {TU.Vectorizable} Vectorizable
 * @typedef {TU.Rectizable} Rectizable
 */

class Vector2D extends DU.SObject {
    /** @type {number} */ #x;
    /** @type {number} */ #y;

    /**
     * 
     * @param {Vectorizable} x 
     * @param {number} y 
     * @returns 
     */
    constructor(x = 0, y = undefined) {
        super();

        if (x instanceof Vector2D) {
            this.copy(x);
        } else if (typeof x == "number") {
            this.x = x;
            this.y = ( y == undefined ? x : y);
        } else if (x instanceof Array) {
            this.x = x[0];
            this.y = x[1];
        } else if (typeof x == "string") {
            let text = x.split(",");
            this.x = Number(text[0]);
            this.y = (text.length > 1 ? Number(text[1]) : this.x);
        } else {
            this.x = 0;
            this.y = 0;
        }
    }

    /**
     * @returns {number}
     */
    get x() {
        return this.#x;
    }

    /**
     * @returns {number}
     */
    get y() {
        return this.#y;
    }

    /**
     * @param {number} value
     */
    set x(value) {
        this.#x = value;
    }

    /**
     * @param {number} value
     */
    set y(value) {
        this.#y = value;
    }

    /**
     * @param {number | Vector2D} coef 
     * @returns {this}
     */
    scale(coef) {
        if (coef instanceof Vector2D) {
            this.x = this.x * coef.x;
            this.y = this.y * coef.y;
        } else {
            this.x = this.x * coef;
            this.y = this.y * coef;
        }
        return this;
    }

    /**
     * @param {number} coefX 
     * @param {number} coefY 
     * @returns 
     */
    scaleXY(coefX, coefY) {
        this.x = this.x * coefX;
        this.y = this.y * coefY;
        return this;
    }

    /**
     * @returns {Vector2D}
     */
    negate() {
        return this.scale(-1);
    }

    /**
     * @returns {Vector2D}
     */
    clear() {
        this.x = 0.0;
        this.y = 0.0;
        return this;
    }
    
    /**
     * @param {number} u 
     */
    interpolater(u=0.5) {
        return this.clone().scale(u);
    }

    /**
     * @param {Vectorizable} other 
     * @returns {this}
     */
    add(other) {
        if (other instanceof Vector2D) {
            this.x = this.x + other.x;
            this.y = this.y + other.y;
        } else {
            this.add(new Vector2D(other))
        }
        return this;
    }

    /**
     * @param {Vector2D} other 
     * @returns {Vector2D}
     */
    sub(other) {
        this.x = this.x - other.x;
        this.y = this.y - other.y;
        return this;
    }

    /**
     * @param {number} x 
     * @param {number} y 
     * @returns {Vector2D}
     */
    moveBy(x,y) {
        this.x = this.x + x;
        this.y = this.y + y;
        return this;
    }

    /**
     * @param {Vector2D} other 
     * @returns {this}
     */
    copy(other=undefined) {
        this.x = other.x;
        this.y = other.y;
        return this;
    }

    /**
     * 
     * @returns {Vector2D}
     */
    clone() {
        return new Vector2D(this);
    }

    /**
     * @param {number} x 
     * @param {number} y 
     * @returns {Vector2D}
     */
    moveTo(x,y) {
        this.x = x;
        this.y = y;
        return this;
    }
    
    /**
     * 
     * @param {Vector2D | [number,number]} value 
     * @returns {Vector2D}
     */
    set(value) {
        if (value instanceof Vector2D) 
            this.copy(value);
        else
            this.moveTo(value[0], value[1]);
        return this;
    }


    /**
     * @returns {Vector2D}
     */
    normalize() {
        let len = this.length();
        this.x = this.x / len;
        this.y = this.y / len;
        return this;
    }

    /**
     * @param {number} theta 
     * @returns {Vector2D}
     */
    rotate(theta){
        if (theta == 0) return this;
        this.x = this.x*Math.cos(theta) - this.y*Math.sin(theta);
        this.y = this.x*Math.sin(theta) + this.y*Math.cos(theta);
        return this;
    }

    /**
     * @returns {number}
     */
    length() {
        return Math.sqrt(this.sqrLen());
    }

    /**
     * @returns {number}
     */
    sqrLen() {
        return this.x**2 + this.y**2;
    }

    /**
     * @param {Vector2D} other 
     * @returns {number}
     */
    distTo(other) {
        return this.to(other).length();
    }

    /**
     * @returns {[number, number]}
     */
    get value() {
        return [this.x, this.y];
    }

    /**
     * @param {Vector2D} other 
     * @returns {Vector2D}
     */
    to(other,u=1) {
        return this.clone().scale(-u).add(other);
    }

    /**
     * @param {Vector2D} other 
     * @returns {Vector2D}
     */
    from(other,u=1) {
        return other.clone().scale(-u).add(this);
    }

    toString() {
        return `<Vecter2D:(${this.x},${this.y})>`;
    }

    /**
     * 
     * @param {Vector2D} a 
     * @param {Vector2D} b 
     * @param {number} u 
     * @returns 
     */
     static interpolate(a,b,u=0.5) {
        return a.to(b,u).add(a);
    }

}

 

class Rect2D extends Vector2D {
    /** @type {number} */ height;
    /** @type {number} */ width;

    /**
     * 
     * @param {Rectizable} x 
     * @param {number} y 
     * @param {number} width 
     * @param {number} height 
     */
    constructor(x=0,y=0,width=1,height=1) {
        super();
        
        if (x instanceof Rect2D) {
            this.copy(x);
        } else if (typeof x == "number") {
            this.x = x;
            this.y = y;
            this.width = width;
            this.height = height;
        } else if (x instanceof Array) {
            this.x = (x.length > 0 ? x[0] : undefined);
            this.y = (x.length > 1 ? x[1] : undefined);
            this.width = (x.length > 2 ? x[2] : undefined);
            this.height = (x.length > 3 ? x[3] : undefined);
        } else if (typeof x == "string") {
            let text = x.split(",");
            this.x = Number(text[0]);
            this.y = (text.length > 1 ? Number(text[1]) : y);
            this.width = (text.length > 2 ? Number(text[2]) : width);
            this.height = (text.length > 3 ? Number(text[3]) : height);
        }
    }

    get left() {
        return this.x;
    }

    get right() {
        return this.x + this.width;
    }

    get top() {
        return this.y;
    }

    get bottom() {
        return this.y + this.height;
    }

    /**
     * Return the Position of Graphical Center
     * @returns {Vector2D}
     */

    get center() {
        return new Vector2D(this.centerH,this.centerV);
    }

    get centerH() {
        return this.left + this.width / 2 ;
    }

    get centerV() {
        return this.top + this.height / 2 ;
    }

    /**
     * 
     * @param {number | Vector2D} horiz 
     * @param {number} verti 
     * @returns {Vector2D}
     */
    getPivot(horiz=0,verti=0) {
        if (horiz instanceof Vector2D) {
            return new Vector2D(this.width * horiz.x,this.height * horiz.y);
        } else {
            return new Vector2D(this.width * horiz,this.height * verti);
        }
    }

    /**
     * 
     * @param {Vector2D} vec 
     * @returns {this}
     */
    scale(vec) {
        this.x *=vec.x;
        this.y *=vec.y;
        this.width *=vec.x;
        this.height *=vec.y;
        return this;
    }

    /**
     * 
     * @param {Rect2D} other 
     * @returns {this}
     */
    copy(other) {
        super.copy(other);
        this.width = other.width;
        this.height = other.height;
        return this;
    }

    /**
     * 
     * @returns {Rect2D}
     */
    clone() {
        return new Rect2D(this);
    }

    /**
     * Expend The bound to Include the point
     * @param {Vector2D} pt
     */
    expand(pt) {
        this.expandXY(pt.x,pt.y);
    }

    /**
     * 
     * @param {Rect2D} other 
     * @returns {this}
     */
    add(other) {
        if (other instanceof Rect2D) {
            this.expand(other.getPivot(0,0));
            this.expand(other.getPivot(0,1));
            this.expand(other.getPivot(1,1));
            this.expand(other.getPivot(1,0));
        } else {
            this.add(new Rect2D(other));
        }
        return this;
    }

    /**
     * 
     * @param {number} x 
     * @param {number} y 
     */
    expandXY(x,y) {
        if (this.left > x)
            this.x = x;
        else if (this.right < x) 
            this.width = x - this.left;
        
        if (this.top > y) 
            this.y = y;
        else if (this.bottom < y)
            this.height = y - this.top;
    }
}