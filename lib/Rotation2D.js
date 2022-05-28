/*jshint esversion: 6 */
// @ts-check
import * as DU from "./DataUtil.js";

export class Rotation2D extends DU.SObject {
    /** @type {Number} */ rad=0.0;

    /**
     * @param {Number | Rotation2D} val 
     */
    constructor(val=0) {
        super();
        if (val instanceof Rotation2D) 
            this.copy(val);
        else if (val == undefined)
            this.rad = 0.0;
        else if (val > Math.PI * 2) 
            this.rad = Rotation2D.toRad(val);
        else
            this.rad = val;
    }

    /**
     * return {number}
     */
    get value() {
        return this.rad;
    }
    
    set value(val) {
        this.rad = val;
    }
    
    get deg() {
        return Rotation2D.toDeg(this.rad);
    }

    set deg(degree) {
        this.rad = Rotation2D.toRad(degree);
    }

    /**
     * @param {Rotation2D | number} other 
     * @return {Rotation2D}
     */
    set(other) {
        if (other instanceof Rotation2D)
            this.rad = other.rad;
        else
            this.rad = other;
        return this;
    }

    /**
     * @param {Rotation2D | number} other 
     * @returns {Rotation2D}
     */
    add(other) {
        if (other instanceof Rotation2D)
            return this.rotate(other.rad);
        else
            this.rotate(other);
        return this;
    }

    /**
     * @param {Number} radian 
     * @return {Rotation2D}
     */
    rotate(radian) {
        this.rad += radian;
        return this;
    }

    /**
     * @param {Number} degree 
     * @return {Rotation2D}
     */
    rotateDeg(degree) {
        this.deg += degree;
        return this;
    }

    /**
     * @return {Rotation2D}
     */
    rotate90() {
        return this.rotateDeg(90.0);
    }

    negate() {
        this.rad = -this.rad;
        return this
    }

    /**
     * 
     * @param {Rotation2D} other 
     * @returns {Rotation2D}
     */
    copy(other=undefined) {
        if (other == undefined) 
            return new Rotation2D(this.rad);
        else 
            return this.set(other.rad);
    }

    /**
     * 
     * @param {Rotation2D} other 
     * @returns {Rotation2D}
     */
    clone(other=undefined) {
        return this.copy(other);
    }

    toString() {
        return `<Rotation2D:${this.rad}>`;
    }

    
    static toRad(degree) {
        return Math.PI * degree / 180;
    }
    
    static toDeg(radian) {
        return 180 * radian / Math.PI;
    }
}