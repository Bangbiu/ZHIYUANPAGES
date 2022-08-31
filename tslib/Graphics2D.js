import { Vector2D, Rect2D } from "./Struct.js";
export { Graphics2D, GraphicsText, POLY, PATH };
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
const PATH = {
    disc: "M 0,0 A 50,50",
    roundArea: "M 10,0 H 90 Q 100,0,100,10 V 90 Q 100,100,90,100 H 10 Q 0,100,0,90 V 10 Q 0,0,10,0",
    roundSquare: ""
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
class Graphics2D extends Path2D {
    constructor(starter) {
        if (starter == undefined) {
            super();
            return;
        }
        if (typeof starter == "string") {
            if (PATH[starter] != undefined)
                starter = PATH[starter];
            else if (POLY[starter] != undefined)
                starter = Graphics2D.polyToPathString(POLY[starter]);
            super(starter);
        }
        else if (starter instanceof Graphics2D) {
            super(starter);
            this.scale = starter.scale.clone();
            this.path = new Path2D(starter.path);
            this.innerBound = starter.innerBound.clone();
            this.bound = starter.bound.clone();
        }
        else { // Polygon
            starter = Graphics2D.polyToPathString(starter);
            super(starter);
        }
        //CalculateBoundary
        if (typeof starter == "string")
            this.innerBound = Graphics2D.calculateBoundary(starter);
        else if (starter instanceof Graphics2D)
            this.innerBound = starter.bound.clone();
        //Initialize
        this.scale = new Vector2D(1.0, 1.0);
        this.bound = this.innerBound.clone();
        this.path = new Path2D(this);
        this.boundPath = this.innerBound.getRectPath();
    }
    update(scale) {
        if (!scale.equals(this.scale)) {
            this.scale.copy(scale);
            this.path = Graphics2D.scalePath(this, scale);
            this.boundPath = this.innerBound.clone().scale(scale).getRectPath();
        }
    }
    clone() {
        return new Graphics2D(this);
    }
    renderBound(ctx, stroke = Graphics2D.DEF_STROKE, fill = Graphics2D.DEF_FILL) {
        if (fill)
            ctx.fill(this.boundPath);
        if (stroke)
            ctx.stroke(this.boundPath);
    }
    render(ctx, stroke = Graphics2D.DEF_STROKE, fill = Graphics2D.DEF_FILL) {
        if (stroke)
            ctx.stroke(this.path);
        if (fill)
            ctx.fill(this.path);
    }
    static scalePath(path, scale) {
        const matrix = { a: scale.x, d: scale.y };
        const res = new Path2D();
        res.addPath(path, matrix);
        return res;
    }
    static polyToPathString(pts) {
        let res = "M ";
        res += `${pts[0][0]},${pts[0][1]} `;
        for (let i = 1; i < pts.length; i++)
            res += `L ${pts[i][0]},${pts[i][1]} `;
        return res + "Z";
    }
    static calculateBoundary(path) {
        const pen = new Vector2D(0.0, 0.0);
        const bound = new Rect2D(0, 0, 0, 0);
        const cmds = path.split(Graphics2D.CMD_SEPARATOR);
        cmds.forEach(cmd => {
            const args = [];
            const cmdType = cmd.charAt(0);
            cmd.slice(1).split(Graphics2D.PARAM_SEPARATOR).forEach(arg => args.push(Number(arg)));
            switch (cmdType) {
                case "M": {
                    pen.moveTo(args[0], args[1]);
                    break;
                }
                case "L": {
                    pen.moveTo(args[0], args[1]);
                    break;
                }
                case "H": {
                    pen.x = args[0];
                    break;
                }
                case "V": {
                    pen.y = args[0];
                    break;
                }
                case "Q": {
                    bound.expandXY(args[0], args[1]);
                    bound.expandXY(args[2], args[3]);
                }
                case "C": {
                    bound.expandXY(args[4], args[5]);
                    break;
                }
                case "A": {
                    break;
                }
            }
            bound.expand(pen);
        });
        return bound;
    }
}
Graphics2D.CMD_SEPARATOR = new RegExp(/(?=M|L|H|V|A|Q|C|Z)/g);
Graphics2D.PARAM_SEPARATOR = ",";
Graphics2D.DEF_FILL = true;
Graphics2D.DEF_STROKE = true;
Graphics2D.DEF_SCALE = new Vector2D(1, 1);
class GraphicsText extends Graphics2D {
    constructor(text) {
        super();
        this.scale = new Vector2D(1.0, 1.0);
        this.text = text;
    }
    update(scale) {
        if (!scale.equals(this.scale)) {
            this.scale.copy(scale);
        }
    }
    clone() {
        return new GraphicsText(this.text);
    }
    render(ctx, stroke = Graphics2D.DEF_STROKE, fill = Graphics2D.DEF_FILL) {
        ctx.save();
        ctx.scale(...this.scale.value);
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
