/*jshint esversion: 6 */
// @ts-check
import { Vector2D } from "./Vector2D.js";
import { SceneInteractive, SceneObject } from "./SceneObject.js";
import { llCurveList } from "./CurvePointList.js";
import { ContextTransf } from "./SceneObject.js";
import { Rotation2D } from "./Rotation2D.js";
import { Color, ColorStates } from "./ColorLib.js";
import { Graphics2D } from "./Graphics2D.js";
// Constants


export class CoordSystem {
    yup;
    /** @type {Vector2D} */ dispRect;
    /** @type {ContextTransf} */ transf;
    color_background;
    color_axis;
    context;

    /** @type {Array<SceneInteractive>} */ points = [];
    /** @type {Array<llCurveList>} */ curves = [];
    constructor(dispW,dispH,bkcolor="grey",axiscolor="white",yup=true) {
        this.yup = yup;
        this.color_background = bkcolor;
        this.color_axis = axiscolor;
        this.resize(dispW, dispH);
    }

    addPoint(x,y,draggable=false) {
        SceneInteractive.DEF_GRAPHICS = new Graphics2D("disc");
        SceneInteractive.DEF_DRAGGABLE = draggable;
        let pt = new SceneInteractive(x, y);
        pt.bColor = ColorStates.of(pt.bColor, new Color("red"));
        this.points.push(pt);
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
    render(ctx=this.context) {
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

    /**
     * 
     * @param {HTMLCanvasElement} canv 
     */
    bindMouseEvent(canv) {
        let ctx = /** @type {CanvasRenderingContext2D} */canv.getContext("2d");
        this.context = ctx;
        canv.addEventListener("mousedown", this.onMouseEvent.bind(this));
        canv.addEventListener("mouseup", this.onMouseEvent.bind(this));
        canv.addEventListener("mousemove", this.onMouseEvent.bind(this));
        canv.addEventListener("wheel",this.onMouseEvent.bind(this));
    }

    /**
     * @param {CanvasRenderingContext2D} ctx
     * @param {MouseEvent | WheelEvent} event 
     */
    onMouseEvent(event,ctx = this.context) {
        ctx.save();
        this.transf.transform(ctx);
        let evt = SceneInteractive.parseMouseEvent(event);
        //console.log(mpos);
        let mousePos = this.transf.apply(evt[1].copy());
        switch (event.type) {
            case "mousedown": {
                if (event.shiftKey) {
                    this.addPoint(mousePos.x, mousePos.y, true);
                }
                this.points.every(pt => {
                    pt.onMouseDown(evt, mousePos.copy(), ctx);
                    //if (pt.ctrlPt != undefined) return false;
                    if (event.ctrlKey && pt.isMouseIn) {
                        pt.bColor.toggle();
                    }
                    return true;
                });
                break;
            }

            case "mouseup" : {
                this.points.forEach(pt => {
                    pt.onMouseUp(evt, mousePos, ctx);
                });
                break;
            }

            case "mousemove" : {
                this.points.forEach(pt => {
                    pt.onMouseMove(evt, mousePos, ctx);
                });
                break;
            }

            case "wheel" : {
                this.points.every(pt => {
                    if (event.altKey && pt.isMouseIn) {
                        // @ts-ignore
                        let coef = 1 - event.deltaY / 500;
                        pt.stret.scale(coef);
                        //pt.scale.scale(coef);
                        //pt.bWidth *= coef; 
                    }
                    return true;
                });
                break;
            }
        }
        ctx.restore();
    }
}