/*jshint esversion: 6 */
// @ts-check
export class Rotation2D {
    /** @type {Number} */ rad=0.0;

    /**
     * @param {Number} val 
     */
    constructor(val=0) {
        if (val > Math.PI * 2) 
            this.rad = Rotation2D.toRad(val);
        else
            this.rad = this.rad;
    }
    
    /**
     * @param {Number} rad 
     * @return {Rotation2D}
     */
    set(rad) {
        this.rad = rad;
        return this;
    }

    /**
     * @param {Number} degree 
     * @return {Rotation2D}
     */
    setDeg(degree) {
        return this.set(Rotation2D.toRad(degree));
    }

    /**
     * @param {Rotation2D} other 
     */
    add(other) {
        return this.rotate(other.rad);
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
        return this.rotate(Rotation2D.toRad(degree));
    }

    /**
     * @return {Rotation2D}
     */
    rotate90() {
        return this.rotateDeg(90);
    }

    reverse() {
        this.rad = -this.rad;
        return this
    }

    copy(other=undefined) {
        if (other == undefined) 
            return new Rotation2D(this.rad);
        else 
            return this.set(other.rad);
    }

    
    static toRad(degree) {
        return Math.PI * degree / 180;
    }
    
    static toDeg(radian) {
        return 180 * radian / Math.PI;
    }
}