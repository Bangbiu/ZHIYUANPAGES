/*jshint esversion: ES2020 */
import { SObject } from "./DataUtil.js";
import { Vector2D, Rect2D, Rotation2D } from "./Struct.js";
import { Graphizable, ParsedPath, PathCommand, Polygon, Renderable } from "./TypeUtil";

export {
    PATHCMD,
    Graphics2D,
    GraphicsText,
    POLY,
    PATH
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

const PATH = {
    oval: "M 0,50 A 50,50,0,1,0,0,-50 Z",
    disc : "M 0,-50 A 50,50,0,1,0,0,50 A 50,50,0,1,0,0,-50 Z",
    roundArea: "M 10,0 H 90 Q 100,0,100,10 V 90 Q 100,100,90,100 H 10 Q 0,100,0,90 V 10 Q 0,0,10,0",
    roundSquare: "",
}

interface PolygonPreset {
    readonly [propName: string]: Polygon;
}

interface PathPreset {
    readonly [propName: string]: string;
}

function correctRadii(signedRx, signedRy, x1p, y1p) {
    const prx = Math.abs(signedRx);
    const pry = Math.abs(signedRy);
  
    const A = x1p**2 / prx**2 + y1p**2 / pry**2;
  
    const rx = A > 1 ? Math.sqrt(A) * prx : prx;
    const ry = A > 1 ? Math.sqrt(A) * pry : pry;
  
    return [rx, ry];
}

function pow(n) {
    return Math.pow(n, 2);
}

function mat2DotVec2([m00, m01, m10, m11], [vx, vy]) {
    return [m00 * vx + m01 * vy, m10 * vx + m11 * vy];
}

function vec2Scale([a0, a1], scalar) {
    return [a0 * scalar, a1 * scalar];
}

function vec2Dot([ux, uy], [vx, vy]) {
    return ux * vx + uy * vy;
}

function vec2Mag([ux, uy]) {
    return Math.sqrt(ux ** 2 + uy ** 2);
}

function vec2Add([ux, uy], [vx, vy]) {
    return [ux + vx, uy + vy];
}

function vec2Angle(u, v) {
    const [ux, uy] = u;
    const [vx, vy] = v;
    const sign = ux * vy - uy * vx >= 0 ? 1 : -1;
    return sign * Math.acos(vec2Dot(u, v) / (vec2Mag(u) * vec2Mag(v)));
}


class Graphics2D extends Path2D implements Renderable {
    bound: Rect2D;
    boundPath: Path2D;

    constructor(starter?: Graphizable) {
        if (starter == undefined) {
            super();
            this.bound = new Rect2D(0,0,0,0);
            this.boundPath = new Path2D();
            return;
        }

        if (starter instanceof Array)   //Polygon
            starter = Graphics2D.polyToPathString(starter);

        if (typeof starter == "string") {
            if (PATH[starter] != undefined)
                starter = PATH[starter];
            else if (POLY[starter] != undefined) {
                starter = Graphics2D.polyToPathString(POLY[starter]);
            }
                
            super(starter as string);
            //console.log(starter);
            
            this.bound = Graphics2D.calculateBoundary(Graphics2D.parsePath(starter as string));
            this.boundPath = this.bound.getRectPath();
        } else if (starter instanceof Graphics2D) {
            super(starter);
            this.bound = starter.bound.clone();
            this.boundPath = new Path2D(starter.boundPath);
        }
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

    scaledPath(scale: Vector2D): Path2D {
        return Graphics2D.getScaledPath(this, scale);
    }

    renderBound(ctx: CanvasRenderingContext2D, scale: Vector2D = Graphics2D.DEF_SCALE, 
        stroke: boolean = Graphics2D.DEF_STROKE, fill: boolean=Graphics2D.DEF_FILL): void 
    {
        Graphics2D.drawPath(ctx, this.boundPath, scale, stroke, fill);    
    }

    render(ctx: CanvasRenderingContext2D, scale: Vector2D = Graphics2D.DEF_SCALE, 
        stroke: boolean = Graphics2D.DEF_STROKE, fill: boolean = Graphics2D.DEF_FILL): void 
    {   
        Graphics2D.drawPath(ctx, this, scale, stroke, fill);
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

    static polyToPathString(pts: Polygon): string {
        let res = "M ";
        res += `${pts[0][0]},${pts[0][1]} `;
        for (let i = 1; i < pts.length; i++)
            res += `L ${pts[i][0]},${pts[i][1]} `;
        return res + "Z";
    }

    static parsePath(path: string): PathCommand[] {
        const cmds: PathCommand[] = [];

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

        const [x1p, y1p] = mat2DotVec2(
            [cosphi, sinphi, -sinphi, cosphi],
            [(x1 - x2) / 2, (y1 - y2) / 2]
        );

        const [rx, ry] = correctRadii(srx, sry, x1p, y1p);

        const sign = largeArcFlag !== sweepFlag ? 1 : -1;
        const n = pow(rx) * pow(ry) - pow(rx) * pow(y1p) - pow(ry) * pow(x1p);
        const d = pow(rx) * pow(y1p) + pow(ry) * pow(x1p);
        

        const [cxp, cyp] = vec2Scale(
            [(rx * y1p) / ry, (-ry * x1p) / rx],
            sign * Math.sqrt(Math.abs(n / d))
        );

        const [cx, cy] = vec2Add(
            mat2DotVec2([cosphi, -sinphi, sinphi, cosphi], [cxp, cyp]) as [any, any],
            [(x1 + x2) / 2, (y1 + y2) / 2]
        );

        const a = [(x1p - cxp) / rx, (y1p - cyp) / ry];
        const b = [(-x1p - cxp) / rx, (-y1p - cyp) / ry];
        const startAngle = vec2Angle([1, 0], a);
        const deltaAngle0 = vec2Angle(a, b) % (2 * Math.PI);

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