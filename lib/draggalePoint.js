/*jshint esversion: 6 */
// @ts-check

import { Vector2D } from "./Vector2D.js";
import { CanvMouseEvt } from "./SceneObject.js";

export class draggablePoint {
    /** @type {Vector2D} */ pos;
    rad;
    canv; transf; 
    color; selColor = "red";
    disabled = false;
    /** @type {boolean} */  selected = false;
    /** @type {Vector2D} */ ctrlPt;
    /**
     * 
     * @param {Number} x 
     * @param {Number} y 
     * @param {HTMLCanvasElement} canv 
     */
    constructor(x=0,y=0,rad=10,canv=undefined,transf,color="white") {
        this.pos = new Vector2D(x, y);
        this.rad = rad;
        this.canv = canv;
        this.transf = transf;
        this.color = color;
        if (canv != undefined) this.bindMouseEvent(canv);
    }

    bindMouseEvent(canv) {
        canv.addEventListener("mousedown", this.onMouseDown.bind(this));
        canv.addEventListener("mouseup", this.onMouseUp.bind(this));
        canv.addEventListener("mousemove", this.onMouseMove.bind(this));
    }
    
    /**
     * 
     * @param {MouseEvent | CanvMouseEvt} event 
     */
    onMouseDown(event) {
        event = CanvMouseEvt.parseEvent(event, this.transf);
        //console.log(event.mousePos);
        if (this.pos.distTo(event.mousePos) <= this.rad) {
            if (event.ctrlKey) this.selected = !this.selected;
            this.ctrlPt = event.mousePos.moveBy(-this.pos.x, -this.pos.y);
        }
    }

    /**
     * 
     * @param {MouseEvent | CanvMouseEvt} event 
     */
    onMouseUp(event) {
        event = CanvMouseEvt.parseEvent(event, this.transf);
        if (event.button == 0) {
            this.ctrlPt = undefined;
        }
    }
    
    /**
     * 
     * @param {MouseEvent | CanvMouseEvt} event 
     */
    onMouseMove(event) {
        event = CanvMouseEvt.parseEvent(event, this.transf);
        if (this.ctrlPt != undefined && event.buttons > 0) {
            this.pos.copy(this.ctrlPt).reverse().add(event.mousePos);
        }
    }

    /**
     * 
     * @param {MouseEvent} event 
     */
    update(event) {
        
    }
    /**
     * 
     * @param {CanvasRenderingContext2D} ctx 
    */
    render(ctx) {
        ctx.save();
        ctx.fillStyle = this.color;
        ctx.strokeStyle = this.selColor;
        ctx.lineWidth = 5;
        ctx.translate(...this.pos.val());
        ctx.beginPath();
        ctx.arc(0, 0, this.rad, 0, Math.PI * 2);
        if (this.selected) ctx.stroke();
        ctx.fill();
        ctx.closePath();
        ctx.restore();
        //console.log("s");
    }
}

  