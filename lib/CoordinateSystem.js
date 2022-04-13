/*jshint esversion: 6 */
// @ts-check
import { Vector2D } from "./Vector2D.js";
import { ContextMouseEvent, SceneDraggable, SceneInteractive, Object2D } from "./Object2D.js";
import { llCurveList } from "./CurvePointList.js";
import { ContextTransf } from "./Object2D.js";
import { Rotation2D } from "./Rotation2D.js";
import { Color, ColorStates } from "./ColorLib.js";
import { Graphics2D } from "./Graphics2D.js";
// Constants


export class CoordPoint extends SceneDraggable {
    constructor(x,y,draggable) {
        super(x,y,0,"2,2","white",new ColorStates(["black", "red"]),5);
        this.draggable = draggable;
        this.graphics = new Graphics2D("disc");
    }

    /**
     * 
     * @param {ContextMouseEvent} event 
     */
    onMouseDown(event) {
        super.onMouseDown(event);
        if (event.info.ctrlKey) {
            this.borderColor.toggle();
        }
    }

    /**
     * 
     * @param {ContextMouseEvent} event 
     */
    onMouseWheel(event) {
        super.onMouseWheel(event);
        if (event.info.altKey) {
            // @ts-ignore
            let coef = 1 - event.info.deltaY / 500;
            this.stret.scale(coef);
        }
    }
}

export class CoordSystem extends SceneInteractive {
    yup;
    color_axis;
    context;

    /** @type {Array<SceneInteractive>} */ points = [];
    /** @type {Array<llCurveList>} */ curves = [];
    constructor(dispW,dispH,bkcolor="black",axiscolor="white",yup=false) {
        super(0,0,0.0,"1,1",bkcolor,"black",0,"area");
        this.yup = yup;
        this.color_axis = axiscolor;
        this.resize(dispW, dispH);
        this.draggable = false;
    }

    addPoint(x,y,draggable=false) {
        let pt = new CoordPoint(x, y, draggable);
        this.components.push(pt);
    }

    resize(width, height) {
        this.scale = new Vector2D(width/100,height/100);
        this.innerTransf = new ContextTransf(
            new Vector2D(width / 2, height / 2),
            new Rotation2D(0.0),
            this.yup ? new Vector2D(1,-1) : new Vector2D(1,1)
        );
        //console.log((this.innerTransf));
    }

    /**
     * 
     * @param {CanvasRenderingContext2D} ctx
     */
    render(ctx=this.context) {
        //let ctx = /** @type {CanvasRenderingContext2D} */canv.getContext("2d");
        super.render(ctx);
        ctx.save();
        //Transform Context
        this.innerTransf.transform(ctx);

        let centX = this.innerTransf.trans.x;
        let centY = this.innerTransf.trans.y;

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

        ctx.strokeText("O",0,0);
        
        ctx.restore();

    }
    
    /**
     * 
     * @param {ContextMouseEvent} event 
     */
    onMouseDown(event) {
        super.onMouseDown(event);
        if (event.info.shiftKey) {
            this.addPoint(event.mCtxPos.x,event.mCtxPos.y,true);
        }
    }
}