/*jshint esversion: 6 */
// @ts-check
import { DATA_CLONE, DATA_IDEN, DATA_UNINIT, SObject } from "./DataUtil.js";
import { CanvasContainer } from "./CanvasUIComponents.js";
import { Vector2D } from "./Struct.js";
import { DataAssignType, StageProperties } from "./TypeUtil";

export {
    Stage,
}

class Stage extends CanvasContainer {

    public lastTimeStamp: number;
    readonly canvas: HTMLCanvasElement;
    readonly context: CanvasRenderingContext2D;

    constructor( parameters: StageProperties, assign: DataAssignType = DATA_IDEN) {
        super({}, DATA_UNINIT);
        this.initialize(parameters, Stage.DEF_PROP, assign);
        window.addEventListener("resize", this.refresh.bind(this));
        this.context = this.canvas.getContext("2d");
        this.bindMouseEvents(this.canvas);
        this.bindKeyboardEvents();
    }

    render() {
        this.clear();
        super.render(this.context);
    }

    tick(delta: any = 1.0) {
        super.tick(this.context, delta);
    }

    resize(): this {
        const canv = this.canvas;
        const box = canv.getBoundingClientRect();
        
        canv.width = window.innerWidth - box.left * 2;
        canv.height = window.innerHeight - box.top * 2;

        super.resize(canv.width, canv.height);

        window["StageWidth"] = canv.width;
        window["StageHeight"] = canv.height;

        return this;
    }

    refresh(): this {

        this.resize();

        if (this.debug) {
            console.clear();
            console.log(new Vector2D(this.width,this.height));
        }
        
        return super.refresh();
    }

    clear(): this {
        this.context.clearRect(0,0,this.canvas.width,this.canvas.height);
        return this;
    }

    launch(eventCoRender: boolean = true): this {
        if (eventCoRender) 
            this.canvas.addEventListener("mousemove", this.render.bind(this));
        this.lastTimeStamp = window.performance.now() - Stage.RENDER_RATE * 2;
        this.load(this.lastTimeStamp);        
        return this;
    }

    launchByUpdate(): this {
        this.canvas.addEventListener("mousemove", this.tick.bind(this));
        return this;
    }

    load(timestamp: number): void {
        const delta = (timestamp - this.lastTimeStamp) / Stage.RENDER_RATE;
        // Clear Last Frame
        this.clear();
        // Updating & Rendering Current Frame
        this.tick(delta);
        // Record TimeStamp
        this.lastTimeStamp = timestamp;
        window.requestAnimationFrame(this.load.bind(this));
    }

    static DEF_PROP: StageProperties = SObject.insertValues({
        canvas: undefined,
        fillColor: "black",
        graphics: "rect",
    }, CanvasContainer.DEF_PROP, DATA_CLONE)

    static RENDER_RATE = 1000 / 60.0;

}

