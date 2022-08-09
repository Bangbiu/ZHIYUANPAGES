/*jshint esversion: 6 */
// @ts-check

import * as TU from "./TypeUtil.js";
import { Color, ColorStates } from "./ColorLib.js";
import { Graphics2D, GraphicsText } from "./Graphics2D.js";
import { Object2D, StageInteractive, ContextMouseEvent, StageObject } from "./Object2D.js";
import { SObject } from "./DataUtil.js";
import { Vector2D } from "./Struct.js";
import { PRESETS } from "./Preset.js";

export {
    InteractionColors,
    CanvasDisplayComponent,
    CanvasInterativeComponent,
    CanvasLabel,
    CanvasButton,
    CanvasContainer
}

/**
 * Data Type
 * @typedef {TU.DataAssignType} DataAssignType
 * @typedef {TU.PivotSetting} PivotSetting
 * @typedef {TU.ButtonStyle} ButtonStyle
 * 
 * Class Instance Property Type
 * @typedef {TU.CanvasLabelProperties} CanvasLabelProperties
 * @typedef {TU.CanvasButtonProperties} CanvasButtonProperties
 * @typedef {TU.CanvasContainerProperties} CanvasContainerProperties
 * 
 * /

/**
 * Display Comp:
 *  * Picture/Image
 *  * Grid
 *  * Label 
 * Interative Comp:
 *  * TextField
 *  * Button
 *  * CheckBox
 *  * Combo
 *  * Container
 *  * ScrollBar
 *  * Slide
 */

class InteractionColors extends ColorStates {
    /**
     * 
     * @param {TU.IntColorizable} colors 
     */
    constructor(colors=InteractionColors.DEF_PROP) {
        if (typeof colors == "string") {
            const texts = colors.split("|");
            colors = [texts[0],texts[1],texts[2]];
        } 
        super({
            defaultColor: colors[0],
            hoverColor: colors[1],
            pressedColor: colors[2]
        });
    }

    get defaultColor() {
        return this.palette.defaultColor;
    }

    set defaultColor(color) {
        this.palette.defaultColor = color;
    }

    get hoverColor() {
        return this.palette.hoverColor;
    }

    set hoverColor(color) {
        this.palette.hoverColor = color;
    }

    get pressedColor() {
        return this.palette.pressedColor;
    }

    set pressedColor(color) {
        this.palette.pressedColor = color;
    }

    /**
     * 
     * @param {InteractionColors} other 
     * @returns {this}
     */
    copy(other) {
        super.copy(other);
        return this;
    }

    /**
     * 
     * @returns {InteractionColors}
     */
    clone() {
        return new InteractionColors([
            this.defaultColor,
            this.hoverColor,
            this.pressedColor
        ]);
    }

    //Statics
    /** @type {TU.IntColorizable} */
    static DEF_PROP = [new Color("1d89ff"),new Color("#0061D7"),new Color("1d89ff")];
}

class CanvasDisplayComponent extends Object2D {
    static CUM_INDEX = 0;
}

class CanvasInterativeComponent extends StageInteractive {
    static CUM_INDEX = 0;
}

class CanvasLabel extends CanvasDisplayComponent {
    /** @type {GraphicsText} */
    graphics;
    /**
     * 
     * @param {CanvasLabelProperties} parameters 
     */
    constructor( parameters = {},assign = SObject.DATA_IDEN) {
         super({},SObject.DATA_UNINIT);
         this.initialize(parameters,CanvasLabel.DEF_PROP,assign);
         CanvasLabel.CUM_INDEX++;
    }

    /**
     * @returns {CanvasLabel}
     */
    clone() {
        return new CanvasLabel(this,SObject.DATA_CLONE);
    }

    get text() {
        return this.graphics.text;
    }

    set text(value) {
        this.graphics.text = value;
    }

    /**
     * @returns {number}
     */
    get fontSize() {
        return this.stret.x;
    }

    /**
     * @param {number} size
     */
    set fontSize(size) {
        this.stret.moveTo(size,size);
    }

    get fontColor() {
        return this.fillColor;
    }

    set fontColor(color) {
        this.fillColor = color;
    }

    /** @type {CanvasLabelProperties} */
    static DEF_PROP = SObject.insertValues(
        {
            graphics: new GraphicsText("Label"),
            fontColor: new Color("black"),
        },
    CanvasDisplayComponent.DEF_PROP);
    static CUM_INDEX = 0;
}

class CanvasButton extends CanvasInterativeComponent {
    /** @type {CanvasLabel} */ captionLabel;
    /** @type {InteractionColors} */fillColor;
    /** @type {InteractionColors} */borderColor;
    /** @type {InteractionColors} */emissiveColor;
    /**
     * 
     * @param {CanvasButtonProperties} parameters 
     * @param {DataAssignType} assign
     */
    constructor( parameters = {} , assign = SObject.DATA_IDEN) {
        super({},SObject.DATA_UNINIT);
        this.captionLabel = new CanvasLabel({text: "Button"});
        if ("preset" in parameters) {
            SObject.setValues(
                parameters,
                PRESETS.Button[parameters["preset"]],
                SObject.DATA_CLONE
            )
        }
        this.initialize(parameters,CanvasButton.DEF_PROP,assign);
        this.refresh();
        CanvasButton.CUM_INDEX++;
    }

    /**
     * 
     * @param {Object} values 
     * @param {DataAssignType} assign 
     * @returns 
     */
     updateValues(values = {}, assign = SObject.DATA_CLONE) {
        SObject.resolve(values,"fillColor",InteractionColors);
        SObject.resolve(values,"foreColor",InteractionColors);
        SObject.resolve(values,"borderColor",InteractionColors);
        super.updateValues(values,assign);
        return this;
    }

    /**
     * @returns {CanvasButton}
     */
    clone() {
        return new CanvasButton(this,SObject.DATA_CLONE);
    }

    get caption() {
        return this.captionLabel.text;
    }

    set caption(text) {
        this.captionLabel.text = text;
    }

    /**
     * @returns {InteractionColors}
     */
    get foreColor() {
        return this.captionLabel.fontColor;
    }

    set foreColor(value) {
        this.captionLabel.fontColor = value;
    }

    /**
     * @returns {number}
     */
    get fontSize() {
        return this.captionLabel.fontSize;
    }

    /**
     * @param {number} value
     */
    set fontSize(value) {
        this.captionLabel.fontSize = value;
    }

    /**
     * 
     * @param {TU.InteractiveColorType} state 
     */
    switchColorTo(state) {
        this.fillColor.switchTo(state);
        this.borderColor.switchTo(state);
        this.captionLabel.fillColor.switchTo(state);
    }
    /**
     * 
     * @param {ContextMouseEvent} event 
     */
    onMouseEnter(event) {
        this.switchColorTo("hoverColor");
        super.onMouseEnter(event);
    }
    /**
     * 
     * @param {ContextMouseEvent} event 
     */
    onMouseLeave(event) {
        this.switchColorTo("defaultColor");
        super.onMouseLeave(event);
    }
    /**
     * 
     * @param {ContextMouseEvent} event 
     */
    onMouseDown(event) {
        this.switchColorTo("pressedColor");
        super.onMouseDown(event);
    }

    /**
     * 
     * @param {ContextMouseEvent} event 
     */
    onMouseUp(event) {
        this.switchColorTo("hoverColor");
        super.onMouseUp(event);
    }

    /**
     * 
     */
    refresh() {
        this.captionLabel.pos.copy(this.innerBound.center);
        return this;
    }

    /**
     * 
     * @param {CanvasRenderingContext2D} ctx 
     */
    render(ctx) {
        super.render(ctx,[this.captionLabel]);
    }

    //Statics
    /** @type {CanvasButtonProperties} */
    static DEF_PROP = SObject.insertValues(
        {
            fillColor: new InteractionColors("#1d89ff|white|white"),
            foreColor: new InteractionColors("white|#1d89ff|#1d89ff"),
            borderColor:new InteractionColors("transparent|white|white"),
            borderWidth: 3,
        },
        CanvasInterativeComponent.DEF_PROP
    );
    

    static CUM_INDEX = 0;
}

class CanvasContainer extends CanvasInterativeComponent {
    /**
     * 
     * @param {CanvasContainerProperties} parameters 
     * @param {DataAssignType} assign
     */
     constructor( parameters = {}, assign = SObject.DATA_IDEN) {
        super({},SObject.DATA_UNINIT);
        this.initialize(parameters,CanvasContainer.DEF_PROP,assign);
    }

    /**
     * @returns {CanvasContainer}
     */
    clone() {
        return new CanvasContainer(this,SObject.DATA_CLONE);
    }

    static LEFT = "left";
    static RIGHT = "right";
    static TOP = "top";
    static BOTTOM = "bottom";
    static CENTER = "center";

    static DEF_PROP = SObject.insertValues(
        {
            fillColor: new Color("white"),
            graphics: new Graphics2D("rect"),
        },
    CanvasInterativeComponent.DEF_PROP);

    static CUM_INDEX = 0;
}