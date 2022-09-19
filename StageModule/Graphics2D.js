/*jshint esversion: ES2020 */
import * as SMath from "./SMath.js";
import { Vector2D, Rect2D, Rotation2D } from "./Struct.js";
import PATH from './Presets/Paths.json' assert { type: 'json' };
export { PATHCMD, POLY, PATH, Graphics2D, GraphicsText, };
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
var PATHCMD;
(function (PATHCMD) {
    PATHCMD["MOVETO"] = "M";
    PATHCMD["LINETO"] = "L";
    PATHCMD["HLINETO"] = "H";
    PATHCMD["VLINETO"] = "V";
    PATHCMD["ARC"] = "A";
    PATHCMD["ELLIPSE"] = "E";
    PATHCMD["QCURVE"] = "Q";
    PATHCMD["CURVE"] = "C";
    PATHCMD["CLOSE"] = "Z";
})(PATHCMD || (PATHCMD = {}));
const POLY = {
    square: [[-50, -50], [50, -50], [50, 50], [-50, 50]],
    area: [[0, 0], [100, 0], [100, 100], [0, 100]],
    rect: [[0, 0], [200, 0], [200, 100], [0, 100]],
    bar: [[-100, -50], [100, -50], [100, 50], [-100, 50]],
    raster: [[0, 0], [1, 0], [1, 1], [0, 1]],
    trapezoid: [[-25, -50], [50, -50], [50, 50], [-50, 50]],
    bullet: [[0, -35], [20, 20], [0, 0], [-20, 20]],
    missle: [[0, -90], [40, -55], [30, 50], [40, 105], [-40, 105], [-30, 50], [-40, -55]],
    heart: [[0, -35], [35, -70], [70, -30], [0, 50], [-70, -30], [-35, -70]]
};
class Graphics2D extends Path2D {
    constructor(starter) {
        if (starter == undefined) {
            super();
            this.bound = new Rect2D(0, 0, 0, 0);
            this.boundPath = new Path2D();
            return;
        }
        if (starter instanceof Array) //Polygon
            starter = Graphics2D.polyToPathString(starter);
        if (typeof starter == "string") {
            if (PATH[starter] != undefined)
                starter = PATH[starter];
            else if (POLY[starter] != undefined) {
                starter = Graphics2D.polyToPathString(POLY[starter]);
            }
            super(starter);
            //console.log(starter);
            this.bound = Graphics2D.calculateBoundary(Graphics2D.parsePath(starter));
            this.boundPath = this.bound.getRectPath();
        }
        else if (starter instanceof Graphics2D) {
            super(starter);
            this.bound = starter.bound.clone();
            this.boundPath = new Path2D(starter.boundPath);
        }
    }
    addPath(path) {
        super.addPath(path);
        this.bound.add(path.bound);
        this.update();
    }
    update() {
        this.boundPath = this.bound.getRectPath();
    }
    clone() {
        return new Graphics2D(this);
    }
    copy(other) {
        return this;
    }
    scaledPath(scale) {
        return Graphics2D.getScaledPath(this, scale);
    }
    renderBound(ctx, scale = Graphics2D.DEF_SCALE, stroke = Graphics2D.DEF_STROKE, fill = Graphics2D.DEF_FILL) {
        Graphics2D.drawPath(ctx, this.boundPath, scale, stroke, fill);
    }
    render(ctx, scale = Graphics2D.DEF_SCALE, stroke = Graphics2D.DEF_STROKE, fill = Graphics2D.DEF_FILL) {
        Graphics2D.drawPath(ctx, this, scale, stroke, fill);
    }
    static drawPath(ctx, path, scale, stroke, fill) {
        const scaledpath = Graphics2D.getScaledPath(path, scale);
        if (stroke)
            ctx.stroke(scaledpath);
        if (fill)
            ctx.fill(scaledpath);
    }
    static getScaledPath(path, scale) {
        const res = new Path2D();
        res.addPath(path, { a: scale.x, d: scale.y });
        return res;
    }
    static polyToPathString(pts) {
        let res = "M ";
        res += `${pts[0][0]},${pts[0][1]} `;
        for (let i = 1; i < pts.length; i++)
            res += `L ${pts[i][0]},${pts[i][1]} `;
        return res + "Z";
    }
    static parsePath(path) {
        const cmds = [];
        path.split(Graphics2D.CMD_SEPARATOR).forEach(cmd => {
            const args = [];
            cmd.slice(1).trim().split(Graphics2D.PARAM_SEPARATOR).forEach(arg => args.push(Number(arg)));
            cmds.push({
                type: cmd.charAt(0),
                args: args
            });
        });
        return cmds;
    }
    static calculateBoundary(path) {
        const pen = new Vector2D(0.0, 0.0);
        const bound = new Rect2D();
        //Parse Path String
        path.forEach(cmd => {
            const args = cmd.args;
            switch (cmd.type) {
                case PATHCMD.MOVETO: {
                    pen.moveTo(args[0], args[1]);
                    break;
                }
                case PATHCMD.LINETO: {
                    pen.moveTo(args[0], args[1]);
                    break;
                }
                case PATHCMD.HLINETO: {
                    pen.x = args[0];
                    break;
                }
                case PATHCMD.VLINETO: {
                    pen.y = args[0];
                    break;
                }
                case PATHCMD.QCURVE: {
                    bound.expandXY(args[0], args[1]);
                    bound.expandXY(args[2], args[3]);
                    pen.moveTo(args[2], args[3]);
                    break;
                }
                case PATHCMD.CURVE: {
                    bound.expandXY(args[0], args[1]);
                    bound.expandXY(args[2], args[3]);
                    bound.expandXY(args[4], args[5]);
                    pen.moveTo(args[4], args[5]);
                    break;
                }
                case PATHCMD.ARC: {
                    const eps = Graphics2D.endpointToCenterArgs(pen, args);
                    const sampDelta = (eps.endAngle - eps.startAngle) / Graphics2D.SAMPLING_RESOLUTION;
                    for (let t = 0; t < Graphics2D.SAMPLING_RESOLUTION; t++) {
                        const ang = eps.startAngle + sampDelta * t;
                        bound.expandXY(eps.cx + eps.rx * Math.cos(ang), eps.cy + eps.ry * Math.sin(ang));
                    }
                    pen.moveTo(args[5], args[6]);
                    break;
                }
            }
            bound.expand(pen);
        });
        return bound;
    }
    static endpointToCenterArgs(startpt, args) {
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
        const [x1p, y1p] = SMath.mat2DotVec2([cosphi, sinphi, -sinphi, cosphi], [(x1 - x2) / 2, (y1 - y2) / 2]);
        const [rx, ry] = SMath.correctRadii(srx, sry, x1p, y1p);
        const sign = largeArcFlag !== sweepFlag ? 1 : -1;
        const n = rx ** 2 * ry ** 2 - rx ** 2 * y1p ** 2 - ry ** 2 * x1p ** 2;
        const d = rx ** 2 * y1p ** 2 + ry ** 2 * x1p ** 2;
        const [cxp, cyp] = SMath.vec2Scale([(rx * y1p) / ry, (-ry * x1p) / rx], sign * Math.sqrt(Math.abs(n / d)));
        const [cx, cy] = SMath.vec2Add(SMath.mat2DotVec2([cosphi, -sinphi, sinphi, cosphi], [cxp, cyp]), [(x1 + x2) / 2, (y1 + y2) / 2]);
        const a = [(x1p - cxp) / rx, (y1p - cyp) / ry];
        const b = [(-x1p - cxp) / rx, (-y1p - cyp) / ry];
        const startAngle = SMath.vec2Angle([1, 0], a);
        const deltaAngle0 = SMath.vec2Angle(a, b) % (2 * Math.PI);
        const deltaAngle = !sweepFlag && deltaAngle0 > 0
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
}
Graphics2D.CMD_SEPARATOR = new RegExp(/(?=M|L|H|V|A|Q|C|Z|z)/g);
Graphics2D.PARAM_SEPARATOR = new RegExp(",| ");
Graphics2D.SAMPLING_RESOLUTION = 24;
Graphics2D.DEF_FILL = true;
Graphics2D.DEF_STROKE = true;
Graphics2D.DEF_SCALE = new Vector2D(1, 1);
class GraphicsText extends Graphics2D {
    constructor(text) {
        super();
        this.text = text;
    }
    clone() {
        return new GraphicsText(this.text);
    }
    render(ctx, scale, stroke = Graphics2D.DEF_STROKE, fill = Graphics2D.DEF_FILL) {
        ctx.save();
        ctx.scale(...scale.value);
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        if (stroke)
            ctx.strokeText(this.text, 0, 0);
        if (fill)
            ctx.fillText(this.text, 0, 0);
        ctx.restore();
    }
    calculateBoundary(ctx = undefined) {
        if (ctx == undefined) {
            this.bound = new Rect2D(0, 0, 0, 0);
            return this.bound;
        }
        let mat = ctx.measureText(this.text);
        let width = mat.width;
        let height = (mat.actualBoundingBoxAscent + mat.actualBoundingBoxDescent);
        this.bound = new Rect2D(-width / 2, -height / 2, width, height);
        return this.bound;
    }
}
