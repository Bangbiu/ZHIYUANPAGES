/*jshint esversion: 6 */
// @ts-check
import { DATA_CLONE, DATA_IDEN, DATA_UNINIT, SObject } from "./DataUtil.js";
import { StageInteractive } from "./Object2D.js";
import { CanvasContainer } from "./CanvasUIComponents.js";
import { Vector2D } from "./Struct.js";
export { Stage, };
class Stage extends CanvasContainer {
    constructor(parameters, assign = DATA_IDEN) {
        super({}, DATA_UNINIT);
        this.initialize(parameters, Stage.DEF_PROP, assign);
        window.addEventListener("resize", this.refresh.bind(this));
        this.context = this.canvas.getContext("2d");
        this.bindMouseEvents(this.canvas);
        this.bindKeyboardEvents();
        this.lastTimeStamp = 0;
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
        if (this.lastTimeStamp > 100) {
            const delta = (timestamp - this.lastTimeStamp) / Stage.RENDER_RATE;
            this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
            // Updating & Rendering
            this.tick(this.context, delta);
        }
        this.lastTimeStamp = timestamp;
        window.requestAnimationFrame(this.launch.bind(this));
    }
}
Stage.DEF_PROP = SObject.insertValues({
    canvas: undefined,
    fillColor: "black",
    graphics: "rect",
}, StageInteractive.DEF_PROP, DATA_CLONE);
Stage.RENDER_RATE = 1000 / 60.0;
