/*jshint esversion: 6 */
// @ts-check

import * as TU from "./TypeUtil.js";
import { Color, ColorStates } from "./ColorLib.js";
import { Graphics2D, GraphicsText } from "./Graphics2D.js";
import { Object2D, StageInteractive, ContextMouseEvent, StageObject } from "./Object2D.js";
import { SObject } from "./DataUtil.js";


/**
 * Data Type
 * @typedef {TU.CanvasLabelProperties} CanvasLabelProperties
 * @typedef {TU.CanvasButtonProperties} CanvasButtonProperties
 * /

/**
 * Display Comp:
 *  * Picture/Image
 *  * Container
 *  * Grid
 * Interative Comp:
 *  * Label
 *  * TextField
 *  * Button
 *  * CheckBox
 *  * Combo
 *  * ScrollBar
 *  * Slide
 */

export class InteractionColors extends ColorStates {
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
     * @returns {InteractionColors}
     */
    copy(other = undefined) {
        if (other == undefined) {
            return new InteractionColors(
                this.defaultColor,
                this.hoverColor,
                this.pressedColor
            );
        } else {
            super.copy(other);
            return this;
        }
    }

    //Statics
    static DEF_COLOR = new Color("1d89ff");
    static DEF_PRESSED_COLOR = new Color("#0061D7");
    static DEF_HOVER_COLOR = new Color("1d89ff");
}

export class CanvasDisplayComponent extends Object2D {

}

export class CanvasInterativeCompnent extends StageInteractive {
    /**
     * 
     * @param {number} width 
     * @param {number} height 
     */
    rescale(width,height) {
        this.scale.moveTo(width, height);
    }
}

export class CanvasLabel extends CanvasDisplayComponent {
    /**
     * 
     * @param {CanvasLabelProperties} parameters 
     */
    constructor( parameters = { text: CanvasLabel.DEF_TEXT } ) {
         super(parameters);
         this.graphics = new GraphicsText(parameters.text);
         CanvasLabel.CUM_INDEX++;
    }

    get text() {
        return this.graphics.text;
    }

    set text(value) {
        this.graphics.text = value;
    }

    get fontSize() {
        return this.stret;
    }

    set fontSize(size) {
        this.stret = size;
    }

    get fontColor() {
        return this.fillColor;
    }

    set fontColor(color) {
        this.fillColor = color;
    }

    static DEF_TEXT = "Label";
    static CUM_INDEX = 0;
}

export class CanvasButton extends CanvasInterativeCompnent {
    /** @type {CanvasLabel} */ 
    captionLabel;
    /**
     * 
     * @param {CanvasButtonProperties} parameters 
     */
    constructor( parameters = {} ) {
        super({uninitialized: true});
        this.captionLabel = new CanvasLabel();
        this.setValues(parameters);
        this.graphics = new Graphics2D("square");
        this.rescale(1,1);
        this.components.push(this.captionLabel);
        CanvasButton.CUM_INDEX++;
    }
    
    /**
     * 
     * @param {CanvasButtonProperties} parameters 
     */
    setValues( parameters = {} , def = CanvasButton.DEF_PROP) {
        super.setValues(parameters,def);
        return this;
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
     * @param {number} width 
     * @param {number} height 
     */
    rescale(width,height) {
        super.rescale(width,height);
        this.captionLabel.pos.copy(this.graphics.bound.getCenter());
    }

    //Statics
    /** @type {CanvasButtonProperties} */
    static DEF_PROP = SObject.insertValues(
        {
            caption: "Button",
            foreColor: new InteractionColors("white","white","#1d89ff"),
            fillColor: new InteractionColors("#1d89ff","#1d89ff","white"),
            borderColor: new InteractionColors("transparent","white","white"),
            borderWidth: 3
        },
        StageInteractive.DEF_PROP
    );
    static CUM_INDEX = 0;
}
