/*jshint esversion: 6 */
// @ts-check
import { Vector2D } from "./Vector2D.js";
import { Color } from "./ColorLib.js";

export class llNode {
    /** @type {Vector2D} */ element;
    /** @type {llNode} */ prev;
    /** @type {llNode} */ next;

    /**
     * @param {Vector2D | Array<Number>} element 
     * @param {llNode} prev 
     * @param {llNode} next 
     */
    constructor(element, prev, next) {
        if (element instanceof Vector2D) 
          this.element = element;
        else
          this.element = new Vector2D(...element);
        
        this.prev = prev;
        this.next = next;
    }        
  
    getDeriv(t = 0, scale = 1/3) {
        return new Vector2D(
            (this.next.element.x - this.prev.element.x) * scale * ((1-t)/2), 
            (this.next.element.y - this.prev.element.y) * scale * ((1-t)/2));
    }
}
  
export class PointList {
    len;
    senti; 
    constructor() {
        let last = new llNode(arguments[0], undefined, undefined);
        this.senti = last;
        for (let i = 1; i < arguments.length; i++) {
            let cur = new llNode(arguments[i], last, undefined);
            last.next = cur;
            last = cur;
        }
        this.len = arguments.length;
    }

    /**
     * @returns {PointList}
     */
    cycleConnect() {
      let rear = this.get(this.len - 1);
      rear.next = this.senti;
      this.senti.prev = rear;
      return this;
    }

    /**
     * @param {Number} index 
     * @returns {llNode}
     */
    get(index) {
        let cur = this.senti;
        for (let i = 0; i < index; i++) {
            cur = cur.next;
        }
        return cur;
    }
  
    /**
     * @returns {Number}
     */
    length() {
        return this.len;
    }
}

export class llCurve {
    /** @type {llNode} */ start;
    /** @type {llNode} */ ending;
    /** @type {Array<Vector2D>} */ keyPoints = [];
    /** @type {Array<Vector2D>} */equidisPts = [];
    /** @type {Array<Number>} */ ptDists = [];
    curveLength = 0.0;
    uDelta = 0.05;
    sharedT = 0.0;
    sharedS = 1/3;
    /**
     * 
     * @param {llNode} start 
     * @param {llNode} ending 
     */
    constructor(start,ending) {
        this.start = start;
        this.ending = ending;
    }

    /**
     * Get Pre-Calculated Key Points
     * @param {Number} u : 0.0-1.0 
     * @returns {Vector2D}
     */
    getKeyPoint(u=0.0) {
        u = (u + 1.0) % 1.0;
        return this.keyPoints[Math.round(u / this.uDelta)];
    }
    /**
     * Get Pre-Calculated Arc-Length Points
     * @param {Number} u : 0.0-1.0 
     * @returns {Vector2D}
     */
    getEquDisPoint(u=0.0) { 
        u = (u + 1.0) % 1.0;
        return this.equidisPts[Math.round(u / this.uDelta)];
    }

    /**
     * Interpolating Points
     * @param {Number} t 
     * @param {Number} uDelta 
     * @returns {llCurve}
     */
    calculateInterpolation(t=this.sharedT, uDelta=this.uDelta, s=this.sharedS) {
        this.uDelta = uDelta;
        //Calculate Table
        this.keyPoints.push(this.start.element);
        for (let i = uDelta; i < 1.0; i += uDelta) {
            let pt = this.interpolate(i, t, s);
            this.ptDists.push(pt.distTo(this.keyPoints[this.keyPoints.length - 1]));
            this.curveLength += this.ptDists[this.ptDists.length - 1];
            this.keyPoints.push(pt);
        }
        return this;
    }

    /**
     * Interpolating Points using Arc-Length
     * @param {Number} uLen 
     * @returns {llCurve}
     */
    calculateArcLenItpl(uLen=-1,t=this.sharedT,uDelta=this.uDelta) {
        if (this.curveLength <= 0.0) this.calculateInterpolation(t, uDelta);

        let delta = (uLen==-1? this.uDelta * this.curveLength : uLen);

        let curIndex = 0;
        let sumLen = 0.0;
        this.equidisPts.push(this.start.element);
        for (let u = delta; u < this.curveLength; u += delta) {
            //this.equidisPts.push(this.interpolate_arcLen(i, true));
            while (u > sumLen + this.ptDists[curIndex]) {
                sumLen += this.ptDists[curIndex];
                curIndex++;
            }
            this.equidisPts.push(Vector2D.interpolate(
                this.keyPoints[curIndex], 
                this.keyPoints[curIndex+1], 
                (u - sumLen) / this.ptDists[curIndex]
            ));
        }

        return this;
    }
    /**
     * 
     * @param {Number} u 
     * @param {Boolean} lenItpl 
     * @returns {Vector2D}
     */
    interpolate_arcLen(u=0.0,lenItpl = false,t=this.sharedT,uDelta=this.uDelta) {
        if (this.curveLength <= 0.0) this.calculateInterpolation(t, uDelta);

        if (lenItpl) {
            u = (u + this.curveLength) % this.curveLength;
        } else {
            u = (u + 1.0) % 1.0;
            u *= this.curveLength;
        }

        for (let i = 0; i < this.ptDists.length; i++) {
            if (u >= this.ptDists[i]) {
                u-= this.ptDists[i];
            } else {
                return Vector2D.interpolate(
                    this.keyPoints[i], 
                    this.keyPoints[i+1], 
                    u / this.ptDists[i]
                );
            }
        }

        return undefined;
    }

    /**
     * 
     * @param {Number} u 
     * @param {Number} t 
     * @returns {Vector2D}
     */

    interpolate(u=0.0, t=this.sharedT,s=this.sharedS) {
        u = (u + 1.0) % 1.0;
        let /** @type {any} */ p0 = this.start;
        let /** @type {any} */ p1 = p0.next;
        let p0_ = p0.getDeriv(t, s);
        let p1_ = p1.getDeriv(t, s);
        p0 = p0.element;
        p1 = p1.element;
        u -= Math.floor(u);
        let fx = this.b0(u) * p0[0] + 
                    this.b1(u) * p0_[0] +
                    this.b2(u) * p1[0] + 
                    this.b3(u) * p1_[0];
        
        let fy = this.b0(u) * p0[1] + 
                    this.b1(u) * p0_[1] +
                    this.b2(u) * p1[1] + 
                    this.b3(u) * p1_[1];
        return new Vector2D(fx, fy);
    }

    b0(u) { return (1 - 3 * u**2 + 2 * u**3); }

    b1(u) { return (u - 2 * u**2 + u**3); }

    b2(u) { return (3 * u**2 - 2 * u**3); }

    b3(u) { return (-(u**2) + u**3); }

    /**
     * 
     * @param {CanvasRenderingContext2D} ctx 
     * @param {Number} t 
     * @param {Number} s 
     * @returns {llCurve}
     */
    drawCurve(ctx,t=this.sharedT,s=this.sharedS) {
        ctx.moveTo(...this.start.element.val());
        let start = this.start.element.copy();
        let ending = this.ending.element.copy();
        let /** @type {Vector2D} */ cp1 = start.add(this.start.getDeriv(t, s));
        let /** @type {Vector2D} */ cp2 = ending.add(this.ending.getDeriv(t, s).reverse());
        ctx.bezierCurveTo(cp1.x, cp1.y, cp2.x, cp2.y, ending.x, ending.y);
        return this;
    }
    /**
     * 
     * @param {CanvasRenderingContext2D} ctx 
     * @param {String | Array<Number>} color 
     * @param {Number} width 
     * @param {Number} t 
     * @param {Number} s 
     */
    drawSingleCurve(ctx,color="black",width=3,t=this.sharedT,s=this.sharedS) {
        ctx.save();
        ctx.lineWidth = width;
        ctx.strokeStyle = Color.parseColor(color);
        ctx.beginPath();
        this.drawCurve(ctx, t, s);
        ctx.stroke();
        ctx.closePath();
        ctx.restore();
    }
}

export class llCurveList extends PointList {

}