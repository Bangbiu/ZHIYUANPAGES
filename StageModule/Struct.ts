/*jshint esversion: ES2020 */
import { SObject } from "./DataUtil.js";
import { clamp, warp } from "./SMath.js";
import { 
    Rectizable, 
    Rotationizable, 
    Vectorizable, 
    Colorizable,
    ClipFunction,
    ColorTuple, 
} from "./TypeUtil";

import COLORS from './Presets/Colors.json' assert {type: 'json'}

export const PI: number = Math.PI;
export const DPI: number = PI * 2;
export const ROUND_OFF = 0.0001;

export {
    Rotation2D,
    Vector2D,
    Rect2D,
    Color
}

class Rotation2D extends SObject {
    rad: number = 0.0;
 
    constructor(val: Rotationizable = 0) {
        super();
        if (val instanceof Rotation2D) 
            this.copy(val);
        else if (val == undefined)
            this.rad = 0.0;
        else {
            val = Number(val);
            if (Number(val) > DPI) 
                this.deg = val;
            else
                this.rad = val;
        } 
    }

    get value(): number {
        return this.rad;
    }
    
    set value(val: number) {
        this.rad = val;
    }
    
    get deg(): number {
        return Rotation2D.toDeg(this.rad);
    }

    set deg(degree: number) {
        this.rad = Rotation2D.toRad(degree);
    }

    set(other: Rotationizable): this {
        if (other instanceof Rotation2D)
            this.rad = other.rad;
        else {
            this.rad = Number(other);
        }
        return this;
    }

    add(other: Rotationizable): this {
        if (other instanceof Rotation2D)
            return this.rotate(other.rad);
        else 
            this.rotate(Number(other));
        return this;
    }

    sub(other: Rotationizable): this {
        if (other instanceof Rotation2D)
            return this.rotate(-other.rad);
        else
            this.rotate(-other);
        return this;
    }

    rotate(radian: number): this {
        this.rad += radian;
        return this;
    }

    rotateDeg(degree: number): this {
        this.deg += degree;
        return this;
    }

    rotate90(): this {
        return this.rotateDeg(90.0);
    }

    negate(): this {
        this.rad = -this.rad;
        return this
    }

    copy(other: Rotation2D): this {
        return this.set(other);
    }

    clone(): Rotation2D {
        return new Rotation2D(this);
    }

    equals(other: Rotation2D): boolean {
        return Math.abs(this.rad - other.rad) < ROUND_OFF;
    }

    equivalent(other: Rotationizable): boolean {
        return this.equals(new Rotation2D(other));
    }

    static toRad(degree: number): number {
        return PI * degree / 180;
    }
    
    static toDeg(radian: number): number {
        return 180 * radian / PI;
    }
}

class Vector2D extends SObject {
    x: number;
    y: number;

    constructor(x: Vectorizable = 0, y: number = undefined) {
        super();

        if (x instanceof Vector2D) {
            this.copy(x);
        } else if (typeof x == "number") {
            this.x = x;
            this.y = ( y == undefined ? x : y);
        } else if (x instanceof Array) {
            this.x = x[0];
            this.y = x[1];
        } else if (typeof x == "string") {
            let text = x.split(",");
            this.x = Number(text[0]);
            this.y = (text.length > 1 ? Number(text[1]) : this.x);
        } else {
            this.x = 0;
            this.y = 0;
        }
    }

    scale(coef: number | Vector2D): this {
        if (coef instanceof Vector2D) {
            this.x = this.x * coef.x;
            this.y = this.y * coef.y;
        } else {
            this.x = this.x * coef;
            this.y = this.y * coef;
        }
        return this;
    }

    scaleXY(coefX: number, coefY: number): this {
        this.x = this.x * coefX;
        this.y = this.y * coefY;
        return this;
    }

    divide(coef: number | Vector2D): this {
        if (coef instanceof Vector2D) {
            this.x = this.x / coef.x;
            this.y = this.y / coef.y;
        } else {
            this.x = this.x / coef;
            this.y = this.y / coef;
        }
        return this;
    }

    divideXY(coefX: number, coefY: number): this {
        this.x = this.x / coefX;
        this.y = this.y / coefY;
        return this;
    }

    negate(): this {
        return this.scale(-1);
    }

    clear(): this {
        this.x = 0.0;
        this.y = 0.0;
        return this;
    }
    
    interpolater(u: number = 0.5): Vector2D {
        return this.clone().scale(u);
    }

    add(other: Vectorizable): this {
        if (other instanceof Vector2D) {
            this.x = this.x + other.x;
            this.y = this.y + other.y;
        } else {
            this.add(new Vector2D(other))
        }
        return this;
    }

    sub(other: Vector2D): this {
        this.x = this.x - other.x;
        this.y = this.y - other.y;
        return this;
    }

    moveBy(x: number, y: number): this {
        this.x = this.x + x;
        this.y = this.y + y;
        return this;
    }

    copy(other: Vector2D): this {
        this.x = other.x;
        this.y = other.y;
        return this;
    }

    clone(): Vector2D {
        return new Vector2D(this);
    }

    moveTo(x: number, y: number): this {
        this.x = x;
        this.y = y;
        return this;
    }

    warp(xMax: number | Vector2D, yMax?: number): this {
        if (xMax instanceof Vector2D) {
            this.x = warp(this.x, xMax.x);
            this.y = warp(this.y, xMax.y);
        } else {
            this.x = warp(this.x, xMax);
            this.y = warp(this.y, yMax);
        }
        return this;
    }
    
    set(value: Array<number> | Vector2D): this {
        if (value instanceof Vector2D) 
            this.copy(value);
        else
            this.moveTo(value[0], value[1]);
        return this;
    }

    normalize(): this {
        let len = this.length();
        this.x = this.x / len;
        this.y = this.y / len;
        return this;
    }

    floor(): this {
        this.x = Math.floor(this.x);
        this.y = Math.floor(this.y);
        return this;
    }

    ceil(): this {
        this.x = Math.ceil(this.x);
        this.y = Math.ceil(this.y);
        return this;
    }

    round(): this {
        this.x = Math.round(this.x);
        this.y = Math.round(this.y);
        return this;
    }

    rotate(theta: number): this {
        if (theta == 0) return this;
        this.x = this.x*Math.cos(theta) - this.y*Math.sin(theta);
        this.y = this.x*Math.sin(theta) + this.y*Math.cos(theta);
        return this;
    }

    length(): number {
        return Math.sqrt(this.sqrLen());
    }

    sqrLen(): number {
        return this.x**2 + this.y**2;
    }

    distTo(other: Vector2D): number {
        return this.to(other).length();
    }

    get value(): [number, number] {
        return [this.x, this.y];
    }

    to(other: Vector2D, u: number = 1): Vector2D {
        return this.clone().scale(-u).add(other);
    }

    from(other: Vector2D, u: number = 1): Vector2D {
        return other.clone().scale(-u).add(this);
    }

    isInRect(range: Rect2D | number, top: number = 0, right: number = 1, bottom: number = 1) {
        if (range instanceof Rect2D) 
            return this.x >= range.left && this.x <= range.right 
                && this.y >= range.top && this.y <= range.bottom;
        else
            return this.x >= range && this.x <= right 
                && this.y >= top && this.y <= bottom;
    }

    toString(): string {
        return `<${this.name}:(${this.x},${this.y})>`;
    }

    equals(other: Vector2D): boolean {
        return this.x == other.x && this.y == other.y;
    }

    equivalent(other: Vectorizable): boolean {
        return this.equals(new Vector2D(other));
    }

    static interpolate(a: Vector2D, b: Vector2D, u: number = 0.5): Vector2D {
        return a.to(b,u).add(a);
    }

}

class Rect2D extends Vector2D {
    height: number;
    width: number;

    constructor(x: Rectizable = 0, y: number = 0,width: number = 0, height: number = 0) {
        super();

        if (x instanceof Rect2D) {
            this.copy(x);
        } else if (typeof x == "number") {
            this.x = x;
            this.y = y;
            this.width = width;
            this.height = height;
        } else if (x instanceof Array) {
            this.x = (x.length > 0 ? x[0] : undefined);
            this.y = (x.length > 1 ? x[1] : undefined);
            this.width = (x.length > 2 ? x[2] : undefined);
            this.height = (x.length > 3 ? x[3] : undefined);
        } else if (typeof x == "string") {
            let text = x.split(",");
            this.x = Number(text[0]);
            this.y = (text.length > 1 ? Number(text[1]) : y);
            this.width = (text.length > 2 ? Number(text[2]) : width);
            this.height = (text.length > 3 ? Number(text[3]) : height);
        }
    }

    get left(): number {
        return this.x;
    }

    set left(val: number) {
        this.width += this.x - val;
        this.x = val;
    }

    get right(): number {
        return this.x + this.width;
    }

    set right(val: number) {
        this.width = val - this.x;
    }

    get top(): number {
        return this.y;
    }

    set top(val: number) {
        this.height += this.y - val;
        this.y = val;
    }

    get bottom(): number {
        return this.y + this.height;
    }

    set bottom(val: number) {
        this.height = val - this.y;
    }

    get center(): Vector2D {
        return new Vector2D(this.centerH,this.centerV);
    }

    get centerH(): number {
        return this.left + this.width / 2 ;
    }

    get centerV(): number {
        return this.top + this.height / 2 ;
    }

    get seq(): [number, number, number, number] {
        return [this.x, this.y, this.width, this.height];
    }

    get pos(): Vector2D {
        return new Vector2D(this);
    }

    get dimension(): Vector2D{
        return new Vector2D(this.width, this.height);
    }

    getPivot(horiz: number | Vector2D = 0, verti: number = 0): Vector2D {
        if (horiz instanceof Vector2D) {
            return new Vector2D(this.width * horiz.x,this.height * horiz.y);
        } else {
            return new Vector2D(this.width * horiz,this.height * verti);
        }
    }


    scale(vec: Vector2D): this {
        this.x *=vec.x;
        this.y *=vec.y;
        this.width *=vec.x;
        this.height *=vec.y;
        return this;
    }


    copy(other: Rect2D): this {
        super.copy(other);
        this.width = other.width;
        this.height = other.height;
        return this;
    }

    clone(): Rect2D {
        return new Rect2D(this);
    }

    expand(pt: Vector2D): this {
        return this.expandXY(pt.x,pt.y);
    }

    expandXY(x: number,y: number): this {
        if (x < this.left) 
            this.left = x;
        else if (this.right < x) 
            this.right = x;
        
        if (y < this.top)
            this.top = y;
        else if (this.bottom < y)
            this.bottom = y;     
        return this;
    }

    set(value: Array<number> | Rect2D): this {
        super.set(value);
        if (value instanceof Array) {
            this.width = value[2];
            this.height = value[3];
        } else {
            this.width = value.width;
            this.height = value.height;
        }
        return this;
    }

    add(other: Vectorizable | Rectizable): this {
        if (other instanceof Rect2D) {
            this.expand(other.getPivot(0,0));
            this.expand(other.getPivot(0,1));
            this.expand(other.getPivot(1,1));
            this.expand(other.getPivot(1,0));
        } else if (other instanceof Array && other.length == 4) {
            this.add(new Rect2D(other));
        }
        return this;
    }

    getRectPath(): Path2D {
        const res = new Path2D();
        res.moveTo(this.left, this.top);
        res.lineTo(this.right, this.top);
        res.lineTo(this.right, this.bottom);
        res.lineTo(this.left, this.bottom);
        res.closePath();
        return res;
    }

    equals(other: Rect2D ): boolean {
        return super.equals(other) && other.width == this.width && other.height == this.height; 
    }

    toString(): string {
        return `<${this.name}:(${this.x},${this.y},${this.width},${this.height})>`;
    }

    isInRect(range: number | Rect2D, top?: number, right?: number, bottom?: number): boolean {
        if (range instanceof Rect2D)
            return this.left >= range.left && this.right <= range.right
                && this.top >= range.top && this.bottom <= range.bottom;
        else 
            return this.left >= range && this.right <= right
                && this.top >= top && this.bottom <= bottom;
    }

}

class Color extends SObject {
    #r: number = -1;
    #g: number = -1;
    #b: number = -1;
    #a: number = -1;
    val: string = undefined;

    constructor(r?: Colorizable, g?: number, b?: number, a?: number) {
        super();
        let seq: ColorTuple;
        if (typeof r == "number") {
            seq = [r, g, b, a];
        } else if (typeof r == "string") {
            seq = Color.decompose(r);
        } else if (r instanceof Color) { 
            seq = r.seq;
        } else if (r instanceof Array) {
            while (r.length < 3) r.push(0);
            if (r.length < 4) r.push(255);
            seq = r as any;
        }
        this.set(seq);
    }

    get r(): number {
        return this.#r;
    }

    set r(value: number) {
        this.#r = Color.CLIP(value);
        this.updateColorText();
    }

    get g(): number {
        return this.#g;
    }

    set g(value: number) {
        this.#g = Color.CLIP(value);
        this.updateColorText();
    }

    get b(): number {
        return this.#b;
    }

    set b(value: number) {
        this.#b = Color.CLIP(value);
        this.updateColorText();
    }

    get a(): number {
        return this.#a;
    }

    set a(value: number) {
        this.#a = Color.CLIP(value);
        this.updateColorText();
    }

    copy(other: Color): this {
        this.set(other.seq);
        return this;
    }

    clone(): Color {
        return new Color(this.seq);
    }

    set(r: number | ColorTuple = this.r, g: number = this.g, b: number = this.b, a: number = this.a): this {
        if (r instanceof Array) {
            this.#r = r[0];
            this.#g = r[1];
            this.#b = r[2];
            this.#a = r[3];
        } else {
            this.#r = r;
            this.#g = g;
            this.#b = b;
            this.#a = a;
        }
        this.clip();
        this.updateColorText();
        return this;
    }

    setAlpha(a: number): this {
        if (a > 1.0) 
            this.a = a;
        else
            this.a = 255 * a;
        this.updateColorText();
        return this;
    }

    add(other: Colorizable): this {
        if (other instanceof Color) {
            this.#r += other.r;
            this.#g += other.g;
            this.#b += other.b;
        } else {
            this.#r += other[0];
            this.#g += other[1];
            this.#b += other[2];
        }
        this.updateColorText();
        return this;
    }

    clip(): this {
        this.#r = Color.CLIP(this.#r, 255);
        this.#g = Color.CLIP(this.#g, 255);
        this.#b = Color.CLIP(this.#b, 255);
        this.#a = Color.CLIP(this.#a, 255);
        return this;
    }

    get seq(): ColorTuple {
        return [this.#r, this.#g, this.#b, this.#a];
    }

    updateColorText(): this {
        let colorCode = "#";
        this.seq.forEach(cbyte => {
            let hexCode = Math.floor(cbyte).toString(16)
            colorCode += Array(3 - hexCode.length).join('0') + hexCode;
        });
        this.val = colorCode;
        return this;
    }

    static decompose(text: string): ColorTuple {
        if (text.startsWith("#")) {
            return [
                parseInt(text.slice(1,3), 16),
                parseInt(text.slice(3,5), 16),
                parseInt(text.slice(5,7), 16),
                text.length == 9 ? parseInt(text.slice(7,9), 16) : 255,
            ]
        } else if (text in COLORS) {
            return [...COLORS[text], 255] as ColorTuple;
        } else {
            return [0, 0, 0, 255];
        }
    }

    static CLIP: ClipFunction = clamp;

}

