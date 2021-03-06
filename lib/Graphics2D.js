/*jshint esversion: 6 */
// @ts-check
import * as TU from "./TypeUtil.js";

import { SObject } from "./DataUtil.js";
import { Vector2D, Rect2D } from "./Struct.js";

/*
Path Language:
    MOVETO:     M <x,y>
    LINETO:     L <x,y>
    HLINETO:    H <x>
    VLINETO:    V <y>
    ARC:        A <rx,ry>,<rot>,<startPerc>,<endPerc>,<counterclockwise>
    QBEZIER:    Q <cpx,cpy>,<endx,endy>
    CBEZIER:    C <cp1x,cp1y>,<cp2x,cp2y>,<endx,endy>

Parsed Data Structure: 
    Array<[string,Array<number>]>
*/

/** @type {Object.<string,string>} */
export const PATH = {
    "disc" : "M 0,0 A 50,50",
    "roundArea": 
        "M 10,0 H 90 Q 100,0,100,10 V 90 Q 100,100,90,100 H 10 Q 0,100,0,90 V 10 Q 0,0,10,0",
    "roundSquare": ""
}

/** @type {Object.<string, Array<[number,number]>>} */
export const POLY = {
    "square": [[-50,-50],[50,-50],[50,50],[-50,50]],
    "area" : [[0,0],[100,0],[100,100],[0,100]],
    "rect": [[0,0],[200,0],[200,100],[0,100]],
    "bar": [[-100,-50],[100,-50],[100,50],[-100,50]],
    "raster": [[0,0],[1,0],[1,1],[0,1]],
    "trapezoid": [[-25,-50],[50,-50],[50,50],[-50,50]],
    "bullet": [[0,-35],[20,20],[0,0],[-20,20]],
    "missle": [[0,-90],[40,-55],[30,50],[40,105],[-40,105],[-30,50],[-40,-55]],
    "heart": [[0,-35],[35,-70],[70,-30],[0,50],[-70,-30],[-35,-70]]
}

export class Graphics2D extends SObject {
    /** @type {Array<[string,Array<number>]>}} */ path = undefined;
    /** @type {Rect2D} */ bound;
    constructor() {
        super();
        if (arguments.length < 1) return;
        if (arguments.length == 1 && typeof arguments[0] == "string") {
            let text = arguments[0];
            if (PATH[text] != undefined) {
                this.path = Graphics2D.parsePath(PATH[text]);
            } else if (POLY[text] != undefined) {
                this.path = Graphics2D.parsePoly(POLY[text]);
            } else {
                this.path = Graphics2D.parsePath(text);
            }
        } else if (arguments[0] instanceof Array &&
                        typeof arguments[0][0] == "number") {
            // @ts-ignore
            this.path = Graphics2D.parsePoly(arguments);
        }
        this.calculateBound();
        
    }
    
    /**
     * 
     * @returns {this}
     */
    copy(other) {
        return this;
    }

    /**
     * 
     * @returns {Graphics2D}
     */
    clone() {
        return this;
    }

    /**
     * @param {CanvasRenderingContext2D} ctx
     * @returns {Rect2D}
     */
    calculateBound(ctx=undefined) {
        let pen = new Vector2D(0.0,0.0);
        this.bound = new Rect2D(0,0,0,0);
        if (this.path == undefined) return;
        this.path.forEach(cmd => {
            let params = cmd[1];
            switch (cmd[0]) {
                case "M": { pen.moveTo(params[0],params[1]);break; }
                case "L": { pen.moveTo(params[0],params[1]);break; } 
                case "H": { pen["x"] = params[0];break; }
                case "V": { pen["y"] = params[0];break; }
                case "Q":  { 
                    this.bound.expandXY(params[0],params[1]);
                    this.bound.expandXY(params[2],params[3]);
                }
                case "C":  { 
                    this.bound.expandXY(params[4],params[5]);
                    break;
                }
                case "A": { 
                    break;
                }
            }
            this.bound.expand(pen);
        });
        return this.bound;
    }

    /**
     * 
     * @param {CanvasRenderingContext2D} ctx 
     * @param {Vector2D} scale
     */
    traceBound(ctx,scale=Graphics2D.DEF_SCALE) {
        if(this.bound == undefined) this.calculateBound(ctx);
        let bound = this.bound.clone().scale(scale);
        ctx.moveTo(bound.left,bound.top);
        ctx.lineTo(bound.right,bound.top);
        ctx.lineTo(bound.right,bound.bottom);
        ctx.lineTo(bound.left,bound.bottom);
        ctx.lineTo(bound.left,bound.top);
    }

    /**
     * 
     * @param {CanvasRenderingContext2D} ctx 
     * @param {boolean} stroke 
     * @param {boolean} fill 
     */
    renderBound(ctx,stroke=Graphics2D.DEF_STROKE,fill=Graphics2D.DEF_FILL,
        scale=Graphics2D.DEF_SCALE) 
    {
        ctx.beginPath();
        this.traceBound(ctx, scale);
        ctx.closePath();
        if (fill) ctx.fill();
        if (stroke) ctx.stroke();
    }

    /**
     * 
     * @param {CanvasRenderingContext2D} ctx 
     * @param {Vector2D} scale
     */
    tracePath(ctx,scale=Graphics2D.DEF_SCALE) {
        let pen = new Vector2D(0.0,0.0);
        this.path.forEach(cmd => {
            let params = cmd[1];
            switch (cmd[0]) {
                case "M": { 
                    pen.moveTo(params[0],params[1]).scale(scale);
                    ctx.moveTo(...pen.value); 
                    break; 
                }
                case "L": { 
                    pen.moveTo(params[0],params[1]).scale(scale);
                    ctx.lineTo(...pen.value); 
                    break; 
                }
                case "H": { 
                    pen.x = params[0];
                    pen.scaleXY(scale.x,1);
                    ctx.lineTo(...pen.value); 
                    break; 
                }
                case "V": { 
                    pen.y = params[0];
                    pen.scaleXY(1,scale.y);
                    ctx.lineTo(...pen.value); 
                    break; 
                }
                case "A": { 
                    /** @type {Array<any>}} */
                    let defparam = [pen.x,pen.y,10,10,0,0,1,0];
                    for (let i = 0; i < params.length; i++) {
                        defparam[i+2] = params[i];
                    }
                    defparam[2] *= scale.x;
                    defparam[3] *= scale.y;
                    defparam[4] *= Math.PI * 2;
                    defparam[5] *= Math.PI * 2;
                    defparam[6] *= Math.PI * 2;
                    defparam[7] = (defparam[7] == 1 ? true : false);
                    // @ts-ignore
                    ctx.ellipse(...defparam); break; 
                }
                case "Q":  { 
                    pen.moveTo(params[2] * scale.x,params[3] * scale.y);
                    ctx.quadraticCurveTo(
                        params[0] * scale.x,
                        params[1] * scale.y,
                        pen.x,
                        pen.y   
                    );
                    break; 
                }
                case "C":  { 
                    pen.moveTo(params[4] * scale.x,params[5] * scale.y);
                    ctx.bezierCurveTo(
                        params[0] * scale.x,
                        params[1] * scale.y,
                        params[2] * scale.x,
                        params[3] * scale.y, 
                        pen.x,
                        pen.y,     
                    ); 
                    break; 
                }
            }
        });
    }

    /**
     * 
     * @param {CanvasRenderingContext2D} ctx 
     * @param {boolean} stroke 
     * @param {boolean} fill 
     */
    render(ctx,stroke=Graphics2D.DEF_STROKE,fill=Graphics2D.DEF_FILL,
        scale=Graphics2D.DEF_SCALE) 
    {
        ctx.beginPath();
        this.tracePath(ctx,scale);
        ctx.closePath();
        if (stroke) ctx.stroke();
        if (fill) ctx.fill();
    }

    //calculateGeometryCenter

    /**
     * 
     * @param {Array<[number,number]>} pts 
     * @returns {Array<[string,Array<number>]>}
     */
    static parsePoly(pts) {
        /** @type {Array<[string,Array<number>]>} */
        let data = [];
        data.push(["M",pts[0]]);
        for (let i = 1; i < pts.length; i++) {
            data.push(["L",pts[i]]);
        }
        return data;
    }

    /**
     * 
     * @param {string} script 
     * @returns {Array<[string,Array<number>]>}
     */
    static parsePath(script) {
        /** @type {Array<[string,Array<number>]>} */
        let data = [];
        /** @type {Array<string>} */
        let pairs = script.split(" ");
        for (let i = 0; i < pairs.length; i+=2) {
            /** @type {Array<number>} */
            let params = [];
            pairs[i+1].split(",").forEach(text => {
                params.push(Number(text));
            })
            data.push([pairs[i],params]);
        }
        return data;
    }

    static DEF_FILL = true;
    static DEF_STROKE = true;
    static DEF_SCALE = new Vector2D(1,1);
}

export class GraphicsText extends Graphics2D {
    /** @type {string} */ text;
    /** */
    
    constructor(text) {
        super();
        this.text = text;
    }

    /**
     * 
     * @returns {GraphicsText}
     */
    clone() {
        return new GraphicsText(this.text);
    }

    /**
     * 
     * @param {CanvasRenderingContext2D} ctx 
     * @param {boolean} stroke 
     * @param {boolean} fill 
     */
    render(ctx,stroke=Graphics2D.DEF_STROKE,fill=Graphics2D.DEF_FILL,
        scale=Graphics2D.DEF_SCALE) 
    {
        ctx.save();
        ctx.scale(...scale.value);
        ctx.textAlign = "center";
        ctx.textBaseline = "middle"
        if (stroke) {
            ctx.strokeText(this.text,0,0);
        } 
        if (fill) {
            ctx.fillText(this.text,0,0);
        }
        ctx.restore();
    }

    /**
     * 
     * @param {CanvasRenderingContext2D} ctx 
     * @param {Vector2D} scale
     */
    tracePath(ctx,scale=Graphics2D.DEF_SCALE) {
        return undefined;
    }


    /**
     * @param {CanvasRenderingContext2D} ctx
     * @returns {Rect2D}
     */
    calculateBound(ctx=undefined) {
        if (ctx == undefined) return new Rect2D(0,0,0,0);
        let mat = ctx.measureText(this.text);
        let width = mat.width;
        let height = (mat.actualBoundingBoxAscent + mat.actualBoundingBoxDescent);
        this.bound = new Rect2D(-width/2,-height/2,width,height);
        return this.bound;
    }
}