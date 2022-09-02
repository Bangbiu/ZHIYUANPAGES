import { Vector2D, Rect2D, Rotation2D } from "./Struct.js";
export { PATHCMD, Graphics2D, GraphicsText, POLY, PATH };
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
const PATH = {
    oval: "M 0,50 A 50,50,0,1,0,0,-50 Z",
    disc: "M 0,-50 A 50,50,0,1,0,0,50 A 50,50,0,1,0,0,-50 Z",
    roundArea: "M 10,0 H 90 Q 100,0,100,10 V 90 Q 100,100,90,100 H 10 Q 0,100,0,90 V 10 Q 0,0,10,0",
    roundSquare: "",
    thumb: "M 63.9 -9.9 C 63.9 -17.9 57.4 -24.4 49.4 -24.4 C 49.4 -24.4 48.3 -24.4 46.6 -24.4 C 38.6 -24.4 16 -25 16.1 -31.3 C 16.1 -33.2 16.2 -35.3 16.4 -37.6 C 16.7 -40.3 17.2 -43 17.4 -45.3 C 18.8 -61.9 13 -71 8 -71 C 6.8 -71 -2.3 -70.4 -1.7 -65.5 C -1.5 -63.2 -0.5 -51.6 -3.5 -41.7 C -8.3 -32.9 -23 -16.8 -31.9 -9.5 C -32.1 -10.2 -32.4 -11 -32.6 -11.7 C -33.2 -13.8 -33.8 -15.9 -34.4 -18 C -36.6 -17.4 -38.7 -16.8 -40.8 -16.1 C -49.2 -13.7 -57.5 -11.2 -65.9 -8.7 C -68 -8.1 -70.1 -7.5 -72.2 -6.9 C -71.6 -4.7 -71 -2.6 -70.4 -0.5 C -64.2 20.4 -58.1 41.3 -51.9 62.3 C -51.3 64.4 -50.6 66.5 -50 68.6 C -47.9 68 -45.8 67.4 -43.6 66.8 C -35.3 64.3 -26.9 61.8 -18.6 59.4 C -16.4 58.7 -14.3 58.1 -12.2 57.5 C -12.8 55.4 -13.4 53.2 -14.1 51.1 C -15.5 46.3 -16.9 41.5 -18.3 36.7 C -16 36.1 -12.3 35.6 -6.7 35.6 C -4 35.6 -0.9 35.7 2.6 36 C 13.2 37 23.2 37.7 28.8 38.4 C 30.1 38.6 31.6 38.7 33.1 38.7 C 38.1 38.7 43.6 37.5 45.1 33.3 C 45.6 32.1 45.8 31 46 29.9 C 50.5 28.2 54 24.1 54.2 19 C 54.3 18 54.2 17.1 54.1 16.2 C 57.5 14.2 59.9 10.6 60.1 6.4 C 60.2 4.4 59.8 2.5 59.1 0.8 C 62 -1.9 63.9 -5.6 63.9 -9.9 M -45.5 60.4 C -51.7 39.5 -57.8 18.5 -64 -2.4 C -55.6 -4.8 -47.3 -7.3 -38.9 -9.8 C -32.8 11.1 -26.6 32.1 -20.4 53 C -28.8 55.4 -37.2 57.9 -45.5 60.4 z",
    rocket: "M 1.2 22.1 C 10 16.5 18.6 10.1 25.7 3 C 49.9 -21.2 52.6 -42.5 50.1 -50.1 C 53.7 -53.7 57.3 -57.3 60.9 -60.9 C 61.9 -61.9 61.9 -63.5 60.9 -64.5 C 59.9 -65.5 58.3 -65.5 57.3 -64.5 C 53.7 -60.9 50.1 -57.3 46.5 -53.7 C 38.9 -56.2 17.6 -53.5 -6.6 -29.3 C -13.7 -22.2 -20.1 -13.6 -25.7 -4.8 C -33.8 -6.8 -47.9 -6.8 -57.7 4.1 C -68.9 16.4 -62.3 28.1 -59.8 25.7 C -57.8 23.6 -54.4 11.3 -39.6 20.8 C -42 25.8 -41.9 28.9 -40.3 30.4 C -38.2 32.5 -36.1 34.6 -34 36.7 C -32.4 38.3 -29.4 38.5 -24.3 36 C -14.9 50.8 -27.2 54.2 -29.2 56.3 C -31.7 58.7 -20 65.3 -7.7 54.1 C 3.2 44.3 3.2 30.2 1.2 22.1 M 16.5 -20.1 C 12.9 -23.7 12.9 -29.7 16.5 -33.3 C 20.2 -37 26.1 -37 29.7 -33.3 C 33.4 -29.6 33.4 -23.8 29.7 -20.1 C 26.1 -16.5 20.2 -16.5 16.5 -20.1 M -43.6 33.5 C -43.6 33.5 -53.6 35.3 -57.3 53.7 C -38.9 50.1 -37.1 40 -37.1 40 C -39.2 37.8 -41.4 35.7 -43.6 33.5 z"
};
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
function correctRadii(signedRx, signedRy, x1p, y1p) {
    const prx = Math.abs(signedRx);
    const pry = Math.abs(signedRy);
    const A = x1p ** 2 / prx ** 2 + y1p ** 2 / pry ** 2;
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
            else if (POLY[starter] != undefined)
                starter = Graphics2D.polyToPathString(POLY[starter]);
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
        const [x1p, y1p] = mat2DotVec2([cosphi, sinphi, -sinphi, cosphi], [(x1 - x2) / 2, (y1 - y2) / 2]);
        const [rx, ry] = correctRadii(srx, sry, x1p, y1p);
        const sign = largeArcFlag !== sweepFlag ? 1 : -1;
        const n = pow(rx) * pow(ry) - pow(rx) * pow(y1p) - pow(ry) * pow(x1p);
        const d = pow(rx) * pow(y1p) + pow(ry) * pow(x1p);
        const [cxp, cyp] = vec2Scale([(rx * y1p) / ry, (-ry * x1p) / rx], sign * Math.sqrt(Math.abs(n / d)));
        const [cx, cy] = vec2Add(mat2DotVec2([cosphi, -sinphi, sinphi, cosphi], [cxp, cyp]), [(x1 + x2) / 2, (y1 + y2) / 2]);
        const a = [(x1p - cxp) / rx, (y1p - cyp) / ry];
        const b = [(-x1p - cxp) / rx, (-y1p - cyp) / ry];
        const startAngle = vec2Angle([1, 0], a);
        const deltaAngle0 = vec2Angle(a, b) % (2 * Math.PI);
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
