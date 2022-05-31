/*jshint esversion: 6 */
// @ts-check

import * as TU from "./TypeUtil.js";
import { Color, ColorStates } from "./ColorLib.js";
import { Graphics2D, GraphicsText } from "./Graphics2D.js";
import { Object2D, StageInteractive, ContextMouseEvent, StageObject } from "./Object2D.js";
import { SObject } from "./DataUtil.js";
import { Vector2D } from "./Vector2D.js";

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
 * @typedef {TU.CanvasLabelProperties} CanvasLabelProperties
 * @typedef {TU.CanvasButtonProperties} CanvasButtonProperties
 * @typedef {TU.DataAssignType} DataAssignType
 * @typedef {TU.PivotSetting} PivotSetting
 * 
 * Class Instance Property Type
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
     * @param {TU.Colorizable} defaultColor 
     * @param {TU.Colorizable} hover 
     * @param {TU.Colorizable} pressed 
     */
    constructor(defaultColor=InteractionColors.DEF_COLOR,
            hover=InteractionColors.DEF_HOVER_COLOR,
                    pressed=InteractionColors.DEF_PRESSED_COLOR) {
        super({
            defaultColor: defaultColor,
            hoverColor: hover,
            pressedColor: pressed
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
        return new InteractionColors(
            this.defaultColor,
            this.hoverColor,
            this.pressedColor
        );
    }

    //Statics
    static DEF_COLOR = new Color("1d89ff");
    static DEF_PRESSED_COLOR = new Color("#0061D7");
    static DEF_HOVER_COLOR = new Color("1d89ff");
}

class CanvasDisplayComponent extends Object2D {

}

class CanvasInterativeComponent extends StageInteractive {
    /**
     * @abstract
     */
    refresh() {}
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
    Object2D.DEF_PROP);
    static CUM_INDEX = 0;
}

class CanvasButton extends CanvasInterativeComponent {
    /** @type {CanvasLabel} */ 
    captionLabel;
    /**
     * 
     * @param {CanvasButtonProperties} parameters 
     * @param {DataAssignType} assign
     */
    constructor( parameters = {} , assign = SObject.DATA_IDEN) {
        super({},SObject.DATA_UNINIT);
        this.initialize(parameters,CanvasButton.DEF_PROP,assign);
        this.components.push(this.captionLabel);
        this.refresh();
        CanvasButton.CUM_INDEX++;
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
        super.onMouseEnter(event);
        this.switchColorTo("hoverColor");
    }
    /**
     * 
     * @param {ContextMouseEvent} event 
     */
    onMouseLeave(event) {
        super.onMouseLeave(event);
        this.switchColorTo("defaultColor");
    }
    /**
     * 
     * @param {ContextMouseEvent} event 
     */
    onMouseDown(event) {
        super.onMouseDown(event);
        this.switchColorTo("pressedColor");
    }

    /**
     * 
     * @param {ContextMouseEvent} event 
     */
    onMouseUp(event) {
        super.onMouseUp(event);
        this.switchColorTo("hoverColor");
    }

    /**
     * 
     */
    refresh() {
        this.captionLabel.pos.copy(this.bound.center);
    }

    //Statics
    /** @type {CanvasButtonProperties} */
    static DEF_PROP = SObject.insertValues(
        {
            captionLabel: new CanvasLabel({text: "Button"}),
            foreColor: new InteractionColors("white","white","#1d89ff"),
            fillColor: new InteractionColors("#1d89ff","#1d89ff","white"),
            borderColor: new InteractionColors("transparent","white","white"),
            borderWidth: 3,
        },
        StageInteractive.DEF_PROP
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

    get pivot() {
        return this.innerTransf.trans;
    }

    /**
     * @param { Vector2D | PivotSetting } pos
     */
    set pivot(pos) {
        if (pos instanceof Vector2D)
            this.innerTransf.trans = pos;
        else 
            this.innerTransf.trans = this.graphics.bound.getPivot(pos[0],pos[1]);
    }

    static LEFT = "left";
    static RIGHT = "right";
    static TOP = "top";
    static BOTTOM = "bottom";
    static CENTER = "center";

    static DEF_PROP = SObject.insertValues(
        {
            fillColor: new Color("yellow"),
            graphics: new Graphics2D("roundArea"),
            scale: [2,2]
        },
    CanvasInterativeComponent.DEF_PROP);

    static CUM_INDEX = 0;
}
