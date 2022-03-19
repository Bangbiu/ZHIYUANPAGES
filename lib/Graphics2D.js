/*jshint esversion: 6 */
// @ts-check

import { Vector2D } from "./Vector2D.js";

/*
Path Language:
    MOVETO:     M <x,y>
    LINETO:     L <x,y>
    HLINETO:    H <x>
    VLINETO:    V <y>
    ARC:        A <rx,ry>,<rot>,<startPerc>,<endPerc>,<counterclockwise>
    CBEZIER:    C <cp1x,cp1y>,<cp2x,cp2y>,<endx,endy>
    QBEZIER:    Q <cpx,cpy>,<endx,endy>

Parsed Data Structure: Array<[string,Array<number>]>
*/

/** @type {Object.<string,string>} */
export const PATH = {
    "disc" : "M 0,0 A 10,10,0,0,1"
}

/** @type {Object.<string, Array<[number,number]>>} */
export const POLY = {
    "square": [[-50,-50],[50,-50],[50,50],[-50,50]],
    "trapezoid": [[-25,-50],[50,-50],[50,50],[-50,50]],
    "bullet": [[0,-35],[20,20],[0,0],[-20,20]],
    "missle": [[0,-90],[40,-55],[30,50],[40,105],[-40,105],[-30,50],[-40,-55]],
    "heart": [[0,-35],[35,-70],[70,-30],[0,50],[-70,-30],[-35,-70]]
}

export class Graphics2D {
    /** @type {Array<[string,Array<number>]>}} */ path;
    constructor() {
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
    }

    /**
     * 
     * @param {CanvasRenderingContext2D} ctx 
     * @param {boolean} stroke 
     * @param {boolean} fill 
     */
    render(ctx,stroke=true,fill=true,scale=Graphics2D.DEF_SCALE) {
        ctx.beginPath();
        this.tracePath(ctx,scale);
        ctx.closePath();
        if (stroke) ctx.stroke();
        if (fill) ctx.fill();
    }

    /**
     * 
     * @param {CanvasRenderingContext2D} ctx 
     */
    tracePath(ctx,scale=Graphics2D.DEF_SCALE) {
        let pen = new Vector2D(0.0,0.0);
        this.path.forEach(cmd => {
            let params = cmd[1];
            switch (cmd[0]) {
                case "M": { 
                    pen.moveTo(params[0],params[1]).scale(scale);
                    ctx.moveTo(...pen.val()); 
                    break; 
                }
                case "L": { 
                    pen.moveTo(params[0],params[1]).scale(scale);
                    ctx.lineTo(...pen.val()); 
                    break; 
                }
                case "H": { 
                    pen.setX(params[0]).scaleXY(scale.x,1);
                    ctx.lineTo(...pen.val()); 
                    break; 
                }
                case "V": { 
                    pen.setY(params[0]).scaleXY(1,scale.y);
                    ctx.lineTo(...pen.val()); 
                    break; 
                }
                case "A": { 
                    /** @type {Array<any>}} */
                    let defparam = [0,0,10,10,0,0,1,0];
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
                case "C":  { 
                    // @ts-ignore
                    ctx.bezierCurveTo(...params); break; 
                }
                case "Q":  { 
                    // @ts-ignore
                    ctx.quadraticCurveTo(...params); break; 
                }
            }
        });
    }

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

    static DEF_SCALE = new Vector2D(1,1);
}