/*jshint esversion: 6 */
// @ts-check
import { DATA_CLONE, DATA_IDEN, DATA_UNINIT, SObject } from "./DataUtil.js";
import { StageInteractive } from "./Object2D.js";
import { CanvasContainer, CanvasDisplayComponent, CanvasInterativeComponent } from "./CanvasUIComponents.js";
import { Color } from "./Struct.js";
import { Graphics2D } from "./Graphics2D.js";
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
 
    refresh(): this {
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
        console.log(new Vector2D(this.width,this.height));
        
        return this;
    }

    clear(): void {
        this.context.clearRect(0,0,this.canvas.width,this.canvas.height);
    }

    launch(eventCoRender: boolean = true): void {
        if (eventCoRender) 
            this.canvas.addEventListener("mousemove", this.render.bind(this));
        this.lastTimeStamp = Date.now() - Stage.RENDER_RATE;
        this.load(Date.now());        
    }

    launchByUpdate(): void {
        this.canvas.addEventListener("mousemove", this.tick.bind(this));
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
    }, StageInteractive.DEF_PROP, DATA_CLONE)

    static RENDER_RATE = 1000 / 60.0;

}

