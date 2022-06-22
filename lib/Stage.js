/*jshint esversion: 6 */
// @ts-check
import * as DU from "./DataUtil.js";
import * as TU from "./TypeUtil.js";
import { SObject } from "./DataUtil.js";
import { StageInteractive } from "./Object2D.js";
import { CanvasContainer, CanvasDisplayComponent, CanvasInterativeComponent } from "./CanvasUIComponents.js";
import { Color } from "./ColorLib.js";
import { Graphics2D } from "./Graphics2D.js";
import { Vector2D } from "./Struct.js";

export {
    Stage,
}

/**
 * Data Type
 * @typedef {TU.DataAssignType} DataAssignType
 * 
 * Class Instance Property Type
 * @typedef {TU.StageProperties} StageProperties
 * 
 */

class Stage extends CanvasContainer {
    /** @type {HTMLCanvasElement} */
    #canvas;
    /**
     * 
     * @param {StageProperties} parameters 
     * @param {DataAssignType} assign
     */
    constructor( parameters = {canvas: undefined}, assign = SObject.DATA_IDEN) {
        super({},SObject.DATA_UNINIT);
        this.setValues(Stage.DEF_PROP,SObject.DATA_CLONE);
        //this.updateValues(parameters,assign);
        window.addEventListener("resize",this.refresh.bind(this));
        this.canvas = parameters.canvas;
    }
    
    get canvas() {
        return this.#canvas;
    }

    /**
     * @param {HTMLCanvasElement} canv
     */
    set canvas(canv) {
        this.#canvas = canv;
        this.bindMouseEvents(canv);
        this.refresh();
    }

    /**
     * @returns {this}
     */
    refresh() {
        const canv = this.canvas;
        const box = canv.getBoundingClientRect();
        
        canv.width = window.innerWidth - box.left * 2;
        canv.height = window.innerHeight - box.top * 2;

        
        this.width = canv.width;
        this.height = canv.height;

        super.refresh();

        window["StageWidth"] = this.width;
        window["StageHeight"] = this.height;
        
        //console.clear();
        console.log(new Vector2D(this.width,this.height));
        
        return this;
    }

    static DEF_PROP = SObject.insertValues(
        {
            fillColor: new Color("black"),
            graphics: new Graphics2D("rect"),

        },
    StageInteractive.DEF_PROP)
}

