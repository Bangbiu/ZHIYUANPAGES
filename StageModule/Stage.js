var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _Stage_canvas, _Stage_context, _Stage_lastTimeStamp;
/*jshint esversion: 6 */
// @ts-check
import { DATA_CLONE, DATA_IDEN, DATA_UNINIT, SObject } from "./DataUtil.js";
import { StageInteractive } from "./Object2D.js";
import { CanvasContainer } from "./CanvasUIComponents.js";
import { Vector2D } from "./Struct.js";
export { Stage, };
class Stage extends CanvasContainer {
    constructor(parameters = { canvas: undefined }, assign = DATA_IDEN) {
        super({}, DATA_UNINIT);
        _Stage_canvas.set(this, void 0);
        _Stage_context.set(this, void 0);
        _Stage_lastTimeStamp.set(this, void 0);
        this.initialize(parameters, Stage.DEF_PROP, assign);
        //this.updateValues(parameters,assign);
        window.addEventListener("resize", this.refresh.bind(this));
        this.canvas = parameters.canvas;
        __classPrivateFieldSet(this, _Stage_lastTimeStamp, 0, "f");
    }
    get canvas() {
        return __classPrivateFieldGet(this, _Stage_canvas, "f");
    }
    set canvas(canv) {
        if (canv == undefined)
            return;
        __classPrivateFieldSet(this, _Stage_canvas, canv, "f");
        __classPrivateFieldSet(this, _Stage_context, canv.getContext("2d"), "f");
        this.bindMouseEvents(canv);
    }
    refresh() {
        const canv = this.canvas;
        const box = canv.getBoundingClientRect();
        canv.width = window.innerWidth - box.left * 2;
        canv.height = window.innerHeight - box.top * 2;
        this.width = canv.width;
        this.height = canv.height;
        super.refresh();
        window["StageWidth"] = canv.width;
        window["StageHeight"] = canv.width;
        console.clear();
        console.log(new Vector2D(this.width, this.height));
        return this;
    }
    launch(timestamp = Date.now()) {
        if (__classPrivateFieldGet(this, _Stage_lastTimeStamp, "f") > 100) {
            const delta = (timestamp - __classPrivateFieldGet(this, _Stage_lastTimeStamp, "f")) / Stage.RENDER_RATE;
            __classPrivateFieldGet(this, _Stage_context, "f").clearRect(0, 0, __classPrivateFieldGet(this, _Stage_canvas, "f").width, __classPrivateFieldGet(this, _Stage_canvas, "f").height);
            // Updating & Rendering
            this.tick(__classPrivateFieldGet(this, _Stage_context, "f"), delta);
        }
        __classPrivateFieldSet(this, _Stage_lastTimeStamp, timestamp, "f");
        window.requestAnimationFrame(this.launch.bind(this));
    }
}
_Stage_canvas = new WeakMap(), _Stage_context = new WeakMap(), _Stage_lastTimeStamp = new WeakMap();
Stage.DEF_PROP = SObject.insertValues({
    canvas: undefined,
    fillColor: "black",
    graphics: "rect",
}, StageInteractive.DEF_PROP, DATA_CLONE);
Stage.RENDER_RATE = 1000 / 60.0;
