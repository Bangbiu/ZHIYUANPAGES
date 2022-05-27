/*jshint esversion: 6 */
// @ts-check
import * as DU from "./DataUtil.js";

export class Vector2D extends DU.SObject {
    /** @type {number} */ x;
    /** @type {number} */y;

    constructor() {
        super();
        if (arguments.length == 0) {
            this.x = 0;
            this.y = 0;
            return;
        }
        const argType = typeof arguments[0];
        if (argType == "number") {
            this.x = arguments[0];
            this.y = (arguments.length > 1 ? arguments[1] : 0.0);
        } else if (argType == "object" && arguments[0] instanceof Array) {
            this.x = arguments[0][0];
            this.y = (arguments[0].length > 1 ? arguments[0][1] : 0.0);
        } //else if (argType == "object" && arguments[0] instanceof Vector2D) this.copy(arguments[0]);
         else if (argType == "string") {
            let text = arguments[0].split(",");
            this.x = Number(text[0]);
            this.y = (text.length > 1 ? Number(text[1]) : 0.0);
        } else {
            this.x = 0;
            this.y = 0;
        }
    }

    /**
     * @param {number | Vector2D} coef 
     * @returns {Vector2D}
     */
    scale(coef) {
        if (coef instanceof Vector2D) {
            this.x *= coef.x;
            this.y *= coef.y;
        } else {
            this.x *= coef;
            this.y *= coef;
        }
        return this;
    }

    /**
     * @param {number} coefX 
     * @param {number} coefY 
     * @returns 
     */
    scaleXY(coefX, coefY) {
        this.x *= coefX;
        this.y *= coefY;
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
        return this.copy().scale(u);
    }

    /**
     * @param {Vector2D | [number, number]} other 
     * @returns {Vector2D}
     */
    add(other) {
        if (other instanceof Vector2D) {
            this.x += other.x;
            this.y += other.y;
        } else {
            this.x += other[0];
            this.y += other[1];
        }
        return undefined;
    }

    /**
     * @param {Vector2D} other 
     * @returns {Vector2D}
     */
    sub(other) {
        this.x -= other.x;
        this.y -= other.y;
        return this;
    }

    /**
     * @param {number} x 
     * @param {number} y 
     * @returns {Vector2D}
     */
    moveBy(x,y) {
        this.x += x;
        this.y += y;
        return this;
    }

    /**
     * @param {Vector2D} other 
     * @returns {Vector2D}
     */
    copy(other=undefined) {
        if (other == undefined) {
            return new Vector2D(this.x, this.y);
        } else {
            this.x = other.x;
            this.y = other.y;
            return this;
        }
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
     * 
     * @param {string | number} id 
     * @returns {number}
     */
    get(id) {
        if (id == 0 || id == "x") 
            return this.x;
        else if (id == 1 || id == "y")
            return this.y;
        else return undefined;
    }

    /**
     * @returns {Vector2D}
     */
    normalize() {
        let len = this.length();
        this.x /= len;
        this.y /= len;
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
        return this.copy().scale(-u).add(other);
    }

    /**
     * @param {Vector2D} other 
     * @returns {Vector2D}
     */
    from(other,u=1) {
        return other.copy().scale(-u).add(this);
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