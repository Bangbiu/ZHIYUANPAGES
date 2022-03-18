/*jshint esversion: 6 */
// @ts-check
export class Vector2D {
    x;y;

    /**
     * 
     * @param {Vector2D} a 
     * @param {Vector2D} b 
     * @param {Number} u 
     * @returns 
     */
    static interpolate(a,b,u=0.5) {
        return a.to(b,u).add(a);
    }

    constructor(x,y) {
        this.x = x;
        this.y = y;
    }

    /**
     * @param {Number | Vector2D} coef 
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
     * @param {Number} coefX 
     * @param {Number} coefY 
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
    reverse() {
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
     * @param {Number} u 
     */
    interpolate(u=0.5) {
        return this.copy().scale(u);
    }

    /**
     * @param {Vector2D} other 
     * @returns {Vector2D}
     */
    add(other) {
        this.x += other.x;
        this.y += other.y;
        return this;
    }

    /**
     * @param {Vector2D} other 
     * @returns {Vector2D}
     */
    minus(other) {
        this.x -= other.x;
        this.y -= other.y;
        return this;
    }

    /**
     * @param {Number} x 
     * @param {Number} y 
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
     * @param {Number} x 
     * @param {Number} y 
     * @returns {Vector2D}
     */
    moveTo(x,y) {
        this.x = x;
        this.y = y;
        return this;
    }

    /**
     * @returns {Vector2D}
     */
    unify() {
        let len = this.length();
        this.x /= len;
        this.y /= len;
        return this;
    }

    /**
     * @param {Number} theta 
     * @returns {Vector2D}
     */
    rotate(theta){
        if (theta == 0) return this;
        this.x = this.x*Math.cos(theta) - this.y*Math.sin(theta);
        this.y = this.x*Math.sin(theta) + this.y*Math.cos(theta);
        return this;
    }

    /**
     * @returns {Number}
     */
    length() {
        return Math.sqrt(this.sqrLen());
    }

    /**
     * @returns {Number}
     */
    sqrLen() {
        return this.x**2 + this.y**2;
    }

    /**
     * @param {Vector2D} other 
     * @returns {Number}
     */
    distTo(other) {
        return this.to(other).length();
    }

    /**
     * @returns {[Number, Number]}
     */
    val() {
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

}