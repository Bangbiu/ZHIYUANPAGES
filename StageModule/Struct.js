var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var _Color_r, _Color_g, _Color_b, _Color_a;
/*jshint esversion: ES2020 */
import { SObject } from "./DataUtil.js";
import { clamp, warp } from "./SMath.js";
import COLORS from './Presets/Colors.json' assert { type: 'json' };
export const PI = Math.PI;
export const DPI = PI * 2;
export const ROUND_OFF = 0.0001;
export { Rotation2D, Vector2D, Rect2D, Color };
class Rotation2D extends SObject {
    constructor(val = 0) {
        super();
        this.rad = 0.0;
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
    get value() {
        return this.rad;
    }
    set value(val) {
        this.rad = val;
    }
    get deg() {
        return Rotation2D.toDeg(this.rad);
    }
    set deg(degree) {
        this.rad = Rotation2D.toRad(degree);
    }
    set(other) {
        if (other instanceof Rotation2D)
            this.rad = other.rad;
        else {
            this.rad = Number(other);
        }
        return this;
    }
    add(other) {
        if (other instanceof Rotation2D)
            return this.rotate(other.rad);
        else
            this.rotate(Number(other));
        return this;
    }
    sub(other) {
        if (other instanceof Rotation2D)
            return this.rotate(-other.rad);
        else
            this.rotate(-other);
        return this;
    }
    rotate(radian) {
        this.rad += radian;
        return this;
    }
    rotateDeg(degree) {
        this.deg += degree;
        return this;
    }
    rotate90() {
        return this.rotateDeg(90.0);
    }
    negate() {
        this.rad = -this.rad;
        return this;
    }
    copy(other) {
        return this.set(other);
    }
    clone() {
        return new Rotation2D(this);
    }
    equals(other) {
        return Math.abs(this.rad - other.rad) < ROUND_OFF;
    }
    equivalent(other) {
        return this.equals(new Rotation2D(other));
    }
    static toRad(degree) {
        return PI * degree / 180;
    }
    static toDeg(radian) {
        return 180 * radian / PI;
    }
}
class Vector2D extends SObject {
    constructor(x = 0, y = undefined) {
        super();
        if (x instanceof Vector2D) {
            this.copy(x);
        }
        else if (typeof x == "number") {
            this.x = x;
            this.y = (y == undefined ? x : y);
        }
        else if (x instanceof Array) {
            this.x = x[0];
            this.y = x[1];
        }
        else if (typeof x == "string") {
            let text = x.split(",");
            this.x = Number(text[0]);
            this.y = (text.length > 1 ? Number(text[1]) : this.x);
        }
        else {
            this.x = 0;
            this.y = 0;
        }
    }
    scale(coef) {
        if (coef instanceof Vector2D) {
            this.x = this.x * coef.x;
            this.y = this.y * coef.y;
        }
        else {
            this.x = this.x * coef;
            this.y = this.y * coef;
        }
        return this;
    }
    scaleXY(coefX, coefY) {
        this.x = this.x * coefX;
        this.y = this.y * coefY;
        return this;
    }
    divide(coef) {
        if (coef instanceof Vector2D) {
            this.x = this.x / coef.x;
            this.y = this.y / coef.y;
        }
        else {
            this.x = this.x / coef;
            this.y = this.y / coef;
        }
        return this;
    }
    divideXY(coefX, coefY) {
        this.x = this.x / coefX;
        this.y = this.y / coefY;
        return this;
    }
    negate() {
        return this.scale(-1);
    }
    clear() {
        this.x = 0.0;
        this.y = 0.0;
        return this;
    }
    interpolater(u = 0.5) {
        return this.clone().scale(u);
    }
    add(other) {
        if (other instanceof Vector2D) {
            this.x = this.x + other.x;
            this.y = this.y + other.y;
        }
        else {
            this.add(new Vector2D(other));
        }
        return this;
    }
    sub(other) {
        this.x = this.x - other.x;
        this.y = this.y - other.y;
        return this;
    }
    moveBy(x, y) {
        this.x = this.x + x;
        this.y = this.y + y;
        return this;
    }
    copy(other) {
        this.x = other.x;
        this.y = other.y;
        return this;
    }
    clone() {
        return new Vector2D(this);
    }
    moveTo(x, y) {
        this.x = x;
        this.y = y;
        return this;
    }
    warp(xMax, yMax) {
        if (xMax instanceof Vector2D) {
            this.x = warp(this.x, xMax.x);
            this.y = warp(this.y, xMax.y);
        }
        else {
            this.x = warp(this.x, xMax);
            this.y = warp(this.y, yMax);
        }
        return this;
    }
    set(value) {
        if (value instanceof Vector2D)
            this.copy(value);
        else
            this.moveTo(value[0], value[1]);
        return this;
    }
    normalize() {
        let len = this.length();
        this.x = this.x / len;
        this.y = this.y / len;
        return this;
    }
    floor() {
        this.x = Math.floor(this.x);
        this.y = Math.floor(this.y);
        return this;
    }
    ceil() {
        this.x = Math.ceil(this.x);
        this.y = Math.ceil(this.y);
        return this;
    }
    round() {
        this.x = Math.round(this.x);
        this.y = Math.round(this.y);
        return this;
    }
    rotate(theta) {
        if (theta == 0)
            return this;
        this.x = this.x * Math.cos(theta) - this.y * Math.sin(theta);
        this.y = this.x * Math.sin(theta) + this.y * Math.cos(theta);
        return this;
    }
    length() {
        return Math.sqrt(this.sqrLen());
    }
    sqrLen() {
        return this.x ** 2 + this.y ** 2;
    }
    distTo(other) {
        return this.to(other).length();
    }
    get value() {
        return [this.x, this.y];
    }
    to(other, u = 1) {
        return this.clone().scale(-u).add(other);
    }
    from(other, u = 1) {
        return other.clone().scale(-u).add(this);
    }
    isInRect(range, top = 0, right = 1, bottom = 1) {
        if (range instanceof Rect2D)
            return this.x >= range.left && this.x <= range.right
                && this.y >= range.top && this.y <= range.bottom;
        else
            return this.x >= range && this.x <= right
                && this.y >= top && this.y <= bottom;
    }
    toString() {
        return `<${this.name}:(${this.x},${this.y})>`;
    }
    equals(other) {
        return this.x == other.x && this.y == other.y;
    }
    equivalent(other) {
        return this.equals(new Vector2D(other));
    }
    static interpolate(a, b, u = 0.5) {
        return a.to(b, u).add(a);
    }
}
class Rect2D extends Vector2D {
    constructor(x = 0, y = 0, width = 0, height = 0) {
        super();
        if (x instanceof Rect2D) {
            this.copy(x);
        }
        else if (typeof x == "number") {
            this.x = x;
            this.y = y;
            this.width = width;
            this.height = height;
        }
        else if (x instanceof Array) {
            this.x = (x.length > 0 ? x[0] : undefined);
            this.y = (x.length > 1 ? x[1] : undefined);
            this.width = (x.length > 2 ? x[2] : undefined);
            this.height = (x.length > 3 ? x[3] : undefined);
        }
        else if (typeof x == "string") {
            let text = x.split(",");
            this.x = Number(text[0]);
            this.y = (text.length > 1 ? Number(text[1]) : y);
            this.width = (text.length > 2 ? Number(text[2]) : width);
            this.height = (text.length > 3 ? Number(text[3]) : height);
        }
    }
    get left() {
        return this.x;
    }
    set left(val) {
        this.width += this.x - val;
        this.x = val;
    }
    get right() {
        return this.x + this.width;
    }
    set right(val) {
        this.width = val - this.x;
    }
    get top() {
        return this.y;
    }
    set top(val) {
        this.height += this.y - val;
        this.y = val;
    }
    get bottom() {
        return this.y + this.height;
    }
    set bottom(val) {
        this.height = val - this.y;
    }
    get center() {
        return new Vector2D(this.centerH, this.centerV);
    }
    get centerH() {
        return this.left + this.width / 2;
    }
    get centerV() {
        return this.top + this.height / 2;
    }
    get seq() {
        return [this.x, this.y, this.width, this.height];
    }
    get pos() {
        return new Vector2D(this);
    }
    get dimension() {
        return new Vector2D(this.width, this.height);
    }
    getPivot(horiz = 0, verti = 0) {
        if (horiz instanceof Vector2D) {
            return new Vector2D(this.width * horiz.x, this.height * horiz.y);
        }
        else {
            return new Vector2D(this.width * horiz, this.height * verti);
        }
    }
    scale(vec) {
        this.x *= vec.x;
        this.y *= vec.y;
        this.width *= vec.x;
        this.height *= vec.y;
        return this;
    }
    copy(other) {
        super.copy(other);
        this.width = other.width;
        this.height = other.height;
        return this;
    }
    clone() {
        return new Rect2D(this);
    }
    expand(pt) {
        return this.expandXY(pt.x, pt.y);
    }
    expandXY(x, y) {
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
    set(value) {
        super.set(value);
        if (value instanceof Array) {
            this.width = value[2];
            this.height = value[3];
        }
        else {
            this.width = value.width;
            this.height = value.height;
        }
        return this;
    }
    add(other) {
        if (other instanceof Rect2D) {
            this.expand(other.getPivot(0, 0));
            this.expand(other.getPivot(0, 1));
            this.expand(other.getPivot(1, 1));
            this.expand(other.getPivot(1, 0));
        }
        else if (other instanceof Array && other.length == 4) {
            this.add(new Rect2D(other));
        }
        return this;
    }
    getRectPath() {
        const res = new Path2D();
        res.moveTo(this.left, this.top);
        res.lineTo(this.right, this.top);
        res.lineTo(this.right, this.bottom);
        res.lineTo(this.left, this.bottom);
        res.closePath();
        return res;
    }
    equals(other) {
        return super.equals(other) && other.width == this.width && other.height == this.height;
    }
    toString() {
        return `<${this.name}:(${this.x},${this.y},${this.width},${this.height})>`;
    }
    isInRect(range, top, right, bottom) {
        if (range instanceof Rect2D)
            return this.left >= range.left && this.right <= range.right
                && this.top >= range.top && this.bottom <= range.bottom;
        else
            return this.left >= range && this.right <= right
                && this.top >= top && this.bottom <= bottom;
    }
}
class Color extends SObject {
    constructor(r, g, b, a) {
        super();
        _Color_r.set(this, -1);
        _Color_g.set(this, -1);
        _Color_b.set(this, -1);
        _Color_a.set(this, -1);
        this.val = undefined;
        let seq;
        if (typeof r == "number") {
            seq = [r, g, b, a];
        }
        else if (typeof r == "string") {
            seq = Color.decompose(r);
        }
        else if (r instanceof Color) {
            seq = r.seq;
        }
        else if (r instanceof Array) {
            while (r.length < 3)
                r.push(0);
            if (r.length < 4)
                r.push(255);
            seq = r;
        }
        this.set(seq);
    }
    get r() {
        return __classPrivateFieldGet(this, _Color_r, "f");
    }
    set r(value) {
        __classPrivateFieldSet(this, _Color_r, Color.CLIP(value), "f");
        this.updateColorText();
    }
    get g() {
        return __classPrivateFieldGet(this, _Color_g, "f");
    }
    set g(value) {
        __classPrivateFieldSet(this, _Color_g, Color.CLIP(value), "f");
        this.updateColorText();
    }
    get b() {
        return __classPrivateFieldGet(this, _Color_b, "f");
    }
    set b(value) {
        __classPrivateFieldSet(this, _Color_b, Color.CLIP(value), "f");
        this.updateColorText();
    }
    get a() {
        return __classPrivateFieldGet(this, _Color_a, "f");
    }
    set a(value) {
        __classPrivateFieldSet(this, _Color_a, Color.CLIP(value), "f");
        this.updateColorText();
    }
    copy(other) {
        this.set(other.seq);
        return this;
    }
    clone() {
        return new Color(this.seq);
    }
    set(r = this.r, g = this.g, b = this.b, a = this.a) {
        if (r instanceof Array) {
            __classPrivateFieldSet(this, _Color_r, r[0], "f");
            __classPrivateFieldSet(this, _Color_g, r[1], "f");
            __classPrivateFieldSet(this, _Color_b, r[2], "f");
            __classPrivateFieldSet(this, _Color_a, r[3], "f");
        }
        else {
            __classPrivateFieldSet(this, _Color_r, r, "f");
            __classPrivateFieldSet(this, _Color_g, g, "f");
            __classPrivateFieldSet(this, _Color_b, b, "f");
            __classPrivateFieldSet(this, _Color_a, a, "f");
        }
        this.clip();
        this.updateColorText();
        return this;
    }
    setAlpha(a) {
        if (a > 1.0)
            this.a = a;
        else
            this.a = 255 * a;
        this.updateColorText();
        return this;
    }
    add(other) {
        if (other instanceof Color) {
            __classPrivateFieldSet(this, _Color_r, __classPrivateFieldGet(this, _Color_r, "f") + other.r, "f");
            __classPrivateFieldSet(this, _Color_g, __classPrivateFieldGet(this, _Color_g, "f") + other.g, "f");
            __classPrivateFieldSet(this, _Color_b, __classPrivateFieldGet(this, _Color_b, "f") + other.b, "f");
        }
        else {
            __classPrivateFieldSet(this, _Color_r, __classPrivateFieldGet(this, _Color_r, "f") + other[0], "f");
            __classPrivateFieldSet(this, _Color_g, __classPrivateFieldGet(this, _Color_g, "f") + other[1], "f");
            __classPrivateFieldSet(this, _Color_b, __classPrivateFieldGet(this, _Color_b, "f") + other[2], "f");
        }
        this.updateColorText();
        return this;
    }
    clip() {
        __classPrivateFieldSet(this, _Color_r, Color.CLIP(__classPrivateFieldGet(this, _Color_r, "f"), 255), "f");
        __classPrivateFieldSet(this, _Color_g, Color.CLIP(__classPrivateFieldGet(this, _Color_g, "f"), 255), "f");
        __classPrivateFieldSet(this, _Color_b, Color.CLIP(__classPrivateFieldGet(this, _Color_b, "f"), 255), "f");
        __classPrivateFieldSet(this, _Color_a, Color.CLIP(__classPrivateFieldGet(this, _Color_a, "f"), 255), "f");
        return this;
    }
    get seq() {
        return [__classPrivateFieldGet(this, _Color_r, "f"), __classPrivateFieldGet(this, _Color_g, "f"), __classPrivateFieldGet(this, _Color_b, "f"), __classPrivateFieldGet(this, _Color_a, "f")];
    }
    updateColorText() {
        let colorCode = "#";
        this.seq.forEach(cbyte => {
            let hexCode = Math.floor(cbyte).toString(16);
            colorCode += Array(3 - hexCode.length).join('0') + hexCode;
        });
        this.val = colorCode;
        return this;
    }
    static decompose(text) {
        if (text.startsWith("#")) {
            return [
                parseInt(text.slice(1, 3), 16),
                parseInt(text.slice(3, 5), 16),
                parseInt(text.slice(5, 7), 16),
                text.length == 9 ? parseInt(text.slice(7, 9), 16) : 255,
            ];
        }
        else if (text in COLORS) {
            return [...COLORS[text], 255];
        }
        else {
            return [0, 0, 0, 255];
        }
    }
}
_Color_r = new WeakMap(), _Color_g = new WeakMap(), _Color_b = new WeakMap(), _Color_a = new WeakMap();
Color.CLIP = clamp;
