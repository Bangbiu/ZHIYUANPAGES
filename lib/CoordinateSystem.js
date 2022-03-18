/*jshint esversion: 6 */
// @ts-check
import { Vector2D } from "./Vector2D.js";
import { draggablePoint } from "./draggalePoint.js";
import { llCurveList } from "./CurvePointList.js";
import { ContextTransf } from "./SceneObject.js";
import { CanvMouseEvt } from "./SceneObject.js";
import { Rotation2D } from "./Rotation2D.js";
// Constants


export class CoordSystem {
    yup;
    /** @type {Vector2D} */ dispRect;
    /** @type {ContextTransf} */ transf;
    color_background;
    color_axis;

    /** @type {Array<draggablePoint>} */ points = [];
    /** @type {Array<llCurveList>} */ curves = [];
    constructor(dispW,dispH,bkcolor="black",axiscolor="white",yup=true) {
        this.yup = yup;
        this.color_background = bkcolor;
        this.color_axis = axiscolor;
        this.resize(dispW, dispH);
    }

    addPoint(x,y,draggable=false) {
        this.points.push(new draggablePoint(x, y, 10,undefined));
        this.points[this.points.length - 1].disabled = !draggable;
    }

    resize(width, height) {
        this.dispRect = new Vector2D(width, height);
        this.transf = new ContextTransf(
            new Vector2D(width / 2, height / 2),
            new Rotation2D(0.0),
            this.yup ? new Vector2D(1,-1) : new Vector2D(1,1)
        );
    }

    /**
     * 
     * @param {CanvasRenderingContext2D} ctx
     */
    render(ctx) {
        //let ctx = /** @type {CanvasRenderingContext2D} */canv.getContext("2d");
        ctx.save();
        //Draw Background
        ctx.fillStyle = this.color_background;
        ctx.fillRect(0,0,this.dispRect.x,this.dispRect.y);

        //Transform Context
        this.transf.transform(ctx);

        let centY = this.dispRect.y / 2;
        let centX = this.dispRect.x / 2;
        //Draw Y Axis
        ctx.strokeStyle = this.color_axis;
        ctx.beginPath();
        ctx.moveTo(0, -centY);
        ctx.lineTo(0, centY);
        ctx.stroke();
        ctx.closePath();
        //Draw X Axis
        ctx.beginPath();
        ctx.moveTo(-centX, 0);
        ctx.lineTo(centX, 0);
        ctx.stroke();
        ctx.closePath();
        //Draw Points
        this.points.forEach(pt => {
            pt.render(ctx);
        });

        ctx.restore();

    }

    bindMouseEvent(canv) {
        canv.addEventListener("mousedown", this.onMouseDown.bind(this));
        canv.addEventListener("mouseup", this.onMouseUp.bind(this));
        canv.addEventListener("mousemove", this.onMouseMove.bind(this));
    }

    /**
     * 
     * @param {MouseEvent} event 
     */
    onMouseDown(event) {
        let evt = CanvMouseEvt.parseEvent(event, this.transf);
        //console.log(evt.mousePos);
        if (evt.shiftKey) {
            this.addPoint(evt.mousePos.x, evt.mousePos.y, true);
        }
        this.points.forEach(pt => {
            pt.onMouseDown(evt);
        });
    }

    onMouseUp(event) {
        let evt = CanvMouseEvt.parseEvent(event, this.transf);
        this.points.forEach(pt => {
            pt.onMouseUp(evt);
        });
    }

    onMouseMove(event) {
        let evt = CanvMouseEvt.parseEvent(event, this.transf);
        this.points.forEach(pt => {
            pt.onMouseMove(evt);
        });
    }
}