/*jshint esversion: ES2020 */
import * as SMath from "./SMath.js";
import { Vector2D, Rect2D, Rotation2D } from "./Struct.js";
import { Graphizable, ParsedPath, Polygon, Renderable, Reproducable } from "./TypeUtil";
import PATH from './Presets/Paths.json' assert {type: 'json'}

export {
    PATHCMD,
    POLY,
    PATH,
    Graphics2D,
    GraphicsText,
}

/** 
 * COMMAND LETTER
 * 
 *      MOVETO:     M <x,y>
 *      LINETO:     L <x,y>
 *      HLINETO:    H <x>
 *      VLINETO:    V <y>
 *      ELLIPSE:    E <x,y>,<rx,ry>,<rot>,<startAng>,<endAng>,<cntClock>
 *      ARC:        A <rx,ry>,<x-rot>,<large-arc>,<sweep>,<x,y>
 *      QCURVE:     Q <cpx,cpy>,<endx,endy>
 *      CURVE:      C <cp1x,cp1y>,<cp2x,cp2y>,<endx,endy>
 *      CLOSEPATH:  Z
 * 
 */

enum PATHCMD {
    MOVETO  = "M",
    LINETO  = "L",
    HLINETO = "H",
    VLINETO = "V",
    ARC     = "A",
    ELLIPSE = "E",
    QCURVE  = "Q",
    CURVE   = "C",
    CLOSE   = "Z",
}


const POLY: PolygonPreset = {
    square: [[-50,-50],[50,-50],[50,50],[-50,50]],
    area : [[0,0],[100,0],[100,100],[0,100]],
    rect: [[0,0],[200,0],[200,100],[0,100]],
    bar: [[-100,-50],[100,-50],[100,50],[-100,50]],
    raster: [[0,0],[1,0],[1,1],[0,1]],
    trapezoid: [[-25,-50],[50,-50],[50,50],[-50,50]],
    bullet: [[0,-35],[20,20],[0,0],[-20,20]],
    missle: [[0,-90],[40,-55],[30,50],[40,105],[-40,105],[-30,50],[-40,-55]],
    heart: [[0,-35],[35,-70],[70,-30],[0,50],[-70,-30],[-35,-70]]
}

interface PolygonPreset {
    readonly [propName: string]: Polygon;
}

interface PathPreset {
    readonly [propName: string]: string;
}

class Graphics2D extends Path2D implements Renderable, Reproducable {
    clipper: Path2D;
    bound: Rect2D;
    boundPath: Path2D;

    constructor(starter?: Graphizable, clipper?: Graphizable) {
        const [path, bound] = Graphics2D.parseGraphizable(starter);
        super(path);
        this.bound = bound;
        this.boundPath = bound.getRectPath();

        const [clipPath, clipBound] = Graphics2D.parseGraphizable(clipper);
        this.clipper = clipPath;
    }

    addPath(path: Graphics2D): void {
        super.addPath(path);
        this.bound.add(path.bound);
        this.update();
    }

    update() {
        this.boundPath = this.bound.getRectPath();
    }

    clone(): Graphics2D {
        return new Graphics2D(this);
    }

    copy(other: Reproducable): this {
        return this;
    }

    scaledPath(scale: Vector2D): Path2D {
        return Graphics2D.getScaledPath(this, scale);
    }

    scaledClip(scale: Vector2D): Path2D {
        return Graphics2D.getScaledPath(this.clipper, scale);
    }

    renderBound(ctx: CanvasRenderingContext2D, scale: Vector2D = Graphics2D.DEF_SCALE, 
        stroke: boolean = Graphics2D.DEF_STROKE, fill: boolean=Graphics2D.DEF_FILL): void 
    {
        Graphics2D.drawPath(ctx, this.boundPath, scale, stroke, fill);    
    }

    render(ctx: CanvasRenderingContext2D, scale: Vector2D = Graphics2D.DEF_SCALE, 
        stroke: boolean = Graphics2D.DEF_STROKE, fill: boolean = Graphics2D.DEF_FILL): void 
    {   
        ctx.save();
        
        if (this.clipper != undefined) {
            ctx.clip(this.scaledClip(scale));
        }
        Graphics2D.drawPath(ctx, this, scale, stroke, fill);
        
        ctx.restore();
    }

    static drawPath(ctx: CanvasRenderingContext2D, path: Path2D, scale: Vector2D, stroke: boolean, fill: boolean) {
        const scaledpath = Graphics2D.getScaledPath(path, scale);
        if (stroke) ctx.stroke(scaledpath);
        if (fill) ctx.fill(scaledpath);
    }

    static getScaledPath(path: Path2D, scale: Vector2D): Path2D {
        const res = new Path2D();
        res.addPath(path, { a: scale.x, d: scale.y });
        return res;
    }

    static parseGraphizable(graphizable: Graphizable): [Path2D, Rect2D] {
        if (graphizable == undefined) {
            return [undefined, new Rect2D(0,0,0,0)];
        }

        let pathStr: string

        if (graphizable instanceof Array)   //Polygon
            pathStr = Graphics2D.polyToPathString(graphizable);

        if (typeof graphizable == "string") {
            if (PATH[graphizable] != undefined)
                pathStr = PATH[graphizable];
            else if (POLY[graphizable] != undefined) {
                pathStr = Graphics2D.polyToPathString(POLY[graphizable]);
            }

            const bound = Graphics2D.calculateBoundary(
                Graphics2D.parsePath(pathStr)
            );

            return [new Path2D(pathStr), bound]

        } else if (graphizable instanceof Graphics2D) {
            return [graphizable, graphizable.bound.clone()];
        }
    }

    static polyToPathString(pts: Polygon): string {
        let res = "M ";
        res += `${pts[0][0]},${pts[0][1]} `;
        for (let i = 1; i < pts.length; i++)
            res += `L ${pts[i][0]},${pts[i][1]} `;
        return res + "Z";
    }

    static parsePath(path: string): ParsedPath {
        const cmds: ParsedPath = [];

        path.split(Graphics2D.CMD_SEPARATOR).forEach(cmd => {
            const args: number[] = [];
            
            cmd.slice(1).trim().split(Graphics2D.PARAM_SEPARATOR).forEach(
                arg => args.push(Number(arg))
            );

            cmds.push({
                type: cmd.charAt(0) as PATHCMD,
                args: args
            })
        });

        return cmds;
    }

    static calculateBoundary(path: ParsedPath): Rect2D {
        const pen = new Vector2D(0.0, 0.0);
        const bound = new Rect2D();
        //Parse Path String
        path.forEach(cmd => {
            const args = cmd.args;
            switch (cmd.type) {
                case PATHCMD.MOVETO:    { pen.moveTo(args[0], args[1]); break; }
                case PATHCMD.LINETO:    { pen.moveTo(args[0], args[1]); break; } 
                case PATHCMD.HLINETO:   { pen.x = args[0]; break; }
                case PATHCMD.VLINETO:   { pen.y = args[0]; break; }
                case PATHCMD.QCURVE:    {
                    bound.expandXY(args[0],args[1]);
                    bound.expandXY(args[2],args[3]);
                    pen.moveTo(args[2],args[3]);
                    break;
                }
                case PATHCMD.CURVE:     {
                    bound.expandXY(args[0],args[1]);
                    bound.expandXY(args[2],args[3]);
                    bound.expandXY(args[4],args[5]);
                    pen.moveTo(args[4],args[5]);
                    break;
                }
                case PATHCMD.ARC:       { 
                    const eps = Graphics2D.endpointToCenterArgs(pen, args);
                    const sampDelta = (eps.endAngle - eps.startAngle) / Graphics2D.SAMPLING_RESOLUTION
                    for (let t = 0; t < Graphics2D.SAMPLING_RESOLUTION; t++) {
                        const ang = eps.startAngle + sampDelta * t;
                        bound.expandXY(
                            eps.cx + eps.rx * Math.cos(ang), 
                            eps.cy + eps.ry * Math.sin(ang)
                        );
                    }
                    pen.moveTo(args[5], args[6]);
                    break;
                }
            }
            bound.expand(pen);
        });
        return bound;
    }


    static endpointToCenterArgs(startpt: Vector2D, args: number[]) {

        const srx = args[0];
        const sry = args[1];
        const xAxisRotationDeg = args[2];
        const largeArcFlag = args[3];
        const sweepFlag = args[4];
    
        const x1 = startpt.x;
        const y1 = startpt.y;
        const x2 = args[5];
        const y2 = args[6];

        const xAxisRotation = Rotation2D.toRad(xAxisRotationDeg);

        const cosphi = Math.cos(xAxisRotation);
        const sinphi = Math.sin(xAxisRotation);

        const [x1p, y1p] = SMath.mat2DotVec2(
            [cosphi, sinphi, -sinphi, cosphi],
            [(x1 - x2) / 2, (y1 - y2) / 2]
        );

        const [rx, ry] = SMath.correctRadii(srx, sry, x1p, y1p);

        const sign = largeArcFlag !== sweepFlag ? 1 : -1;
        const n = rx**2 * ry**2 - rx**2 * y1p**2 - ry**2 * x1p**2;
        const d = rx**2 * y1p**2 + ry**2 * x1p**2;
        

        const [cxp, cyp] = SMath.vec2Scale(
            [(rx * y1p) / ry, (-ry * x1p) / rx],
            sign * Math.sqrt(Math.abs(n / d))
        );

        const [cx, cy] = SMath.vec2Add(
            SMath.mat2DotVec2([cosphi, -sinphi, sinphi, cosphi], [cxp, cyp]) as [any, any],
            [(x1 + x2) / 2, (y1 + y2) / 2]
        );

        const a = [(x1p - cxp) / rx, (y1p - cyp) / ry];
        const b = [(-x1p - cxp) / rx, (-y1p - cyp) / ry];
        const startAngle = SMath.vec2Angle([1, 0], a);
        const deltaAngle0 = SMath.vec2Angle(a, b) % (2 * Math.PI);

        const deltaAngle =
            !sweepFlag && deltaAngle0 > 0
            ? deltaAngle0 - 2 * Math.PI
            : sweepFlag && deltaAngle0 < 0
            ? deltaAngle0 + 2 * Math.PI
            : deltaAngle0;

        const endAngle = startAngle + deltaAngle;

        return {
            cx,
            cy,
            rx,
            ry,
            startAngle,
            endAngle,
            xAxisRotation,
            anticlockwise: deltaAngle < 0
        };
    }

    static CMD_SEPARATOR = new RegExp(/(?=M|L|H|V|A|Q|C|Z|z)/g);
    static PARAM_SEPARATOR = new RegExp(",| ");

    static SAMPLING_RESOLUTION = 24;

    static DEF_FILL = true;
    static DEF_STROKE = true;
    static DEF_SCALE = new Vector2D(1,1);
}

class GraphicsText extends Graphics2D {
    text: string;

    constructor(text) {
        super();
        this.text = text;
    }

    clone(): GraphicsText {
        return new GraphicsText(this.text);
    }

    render(ctx: CanvasRenderingContext2D, scale: Vector2D, stroke: boolean = Graphics2D.DEF_STROKE, fill: boolean = Graphics2D.DEF_FILL): void {
        ctx.save();
        ctx.scale(...scale.value);
        ctx.textAlign = "center";
        ctx.textBaseline = "middle"
        if (stroke) ctx.strokeText(this.text,0,0);
        if (fill) ctx.fillText(this.text,0,0);
        ctx.restore();
    }

    calculateBoundary(ctx: CanvasRenderingContext2D = undefined): Rect2D {
        if (ctx == undefined) {
            this.bound = new Rect2D(0,0,0,0);
            return this.bound;
        }
        let mat = ctx.measureText(this.text);
        let width = mat.width;
        let height = (mat.actualBoundingBoxAscent + mat.actualBoundingBoxDescent);
        this.bound = new Rect2D(-width/2,-height/2,width,height);
        return this.bound;
    }
}