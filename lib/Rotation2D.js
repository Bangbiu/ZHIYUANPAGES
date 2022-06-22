/*jshint esversion: 6 */
// @ts-check
import * as DU from "./DataUtil.js";
import * as TU from "./TypeUtil.js";

/**
 * Data Type
 * @typedef {TU.Rotationizable} Rotationizable
 */

export class Rotation2D extends DU.SObject {
    /** @type {number} */ rad=0.0;

    /**
     * @param {Rotationizable} val 
     */
    constructor(val=0) {
        super();
        if (val instanceof Rotation2D) 
            this.copy(val);
        else if (val == undefined)
            this.rad = 0.0;
        else if (val > Math.PI * 2) 
            this.deg = val;
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
     * @param {Rotationizable} other 
     * @return {this}
     */
    set(other) {
        if (other instanceof Rotation2D)
            this.rad = other.rad;
        else
            this.rad = other;
        return this;
    }

    /**
     * @param {Rotationizable} other 
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
     * @param {number} radian 
     * @return {this}
     */
    rotate(radian) {
        this.rad += radian;
        return this;
    }

    /**
     * @param {number} degree 
     * @return {this}
     */
    rotateDeg(degree) {
        this.deg += degree;
        return this;
    }

    /**
     * @return {this}
     */
    rotate90() {
        return this.rotateDeg(90.0);
    }

    /**
     * 
     * @returns {this}
     */
    negate() {
        this.rad = -this.rad;
        return this
    }

    /**
     * 
     * @param {Rotation2D} other 
     * @returns {this}
     */
    copy(other=undefined) {
        return this.set(other);
    }

    /**
     * 
     * @returns {Rotation2D}
     */
    clone() {
        return new Rotation2D(this);
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