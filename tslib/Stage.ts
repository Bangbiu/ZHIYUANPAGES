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
    #canvas: HTMLCanvasElement;

    constructor( parameters: StageProperties = {canvas: undefined}, assign: DataAssignType = DATA_IDEN) {
        super({}, DATA_UNINIT);
        this.initialize(parameters, Stage.DEF_PROP, assign);
        //this.updateValues(parameters,assign);
        window.addEventListener("resize", this.refresh.bind(this));
        this.canvas = parameters.canvas;
    }
    
    get canvas(): HTMLCanvasElement {
        return this.#canvas;
    }

    set canvas(canv: HTMLCanvasElement) {
        if (canv == undefined) return;
        this.#canvas = canv;
        this.bindMouseEvents(canv);
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

    static DEF_PROP: StageProperties = SObject.insertValues({
        canvas: undefined,
        fillColor: "black",
        graphics: "rect",
    }, StageInteractive.DEF_PROP, DATA_CLONE)
}

