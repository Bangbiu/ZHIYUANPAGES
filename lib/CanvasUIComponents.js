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
 * @typedef {TU.ButtonStyle} ButtonStyle
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
    /**
     * @abstract
     * @returns {this}
     */
    refresh() {
        return this;
    }

    static CUM_INDEX = 0;
}

class CanvasInterativeComponent extends StageInteractive {
    /**
     * @abstract
     * @returns {this}
     */
    refresh() {
        this.components.forEach(comp => {
            if (comp instanceof CanvasInterativeComponent)
                comp.refresh();
        });
        return this;
    }
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
    /** @type {number} */ #presetIndex = 0;
    /**
     * 
     * @param {CanvasButtonProperties} parameters 
     * @param {DataAssignType} assign
     */
    constructor( parameters = {} , assign = SObject.DATA_IDEN) {
        super({},SObject.DATA_UNINIT);
        this.captionLabel = new CanvasLabel({text: "Button"});
        this.initialize(parameters,CanvasButton.DEF_PROP,assign);
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

    get preset() {
        return this.#presetIndex;
    }

    set preset(index) {
        this.#presetIndex = index;
        this.setStyle(CanvasButton.PRESET[index]);
    }

    /**
     * 
     * @param {ButtonStyle} style 
     * @returns {this}
     */
    setStyle(style) {
        if ("fillColor" in style)
            this.fillColor = new InteractionColors(style.fillColor);
        if ("foreColor" in style)
            this.foreColor = new InteractionColors(style.foreColor);
        if ("borderColor" in style)
            this.borderColor = new InteractionColors(style.borderColor);
        return this;
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
            fillColor: undefined,
            borderColor: undefined,
            preset: 0,
            borderWidth: 3,
        },
        CanvasInterativeComponent.DEF_PROP
    );
    
    /** @type {Array<ButtonStyle>} */
    static PRESET = [
        {
            fillColor: "#1d89ff|white|white",
            foreColor: "white|#1d89ff|#1d89ff",
            borderColor:"transparent|white|white",
        },
        {
            fillColor: "#1d89ff|white|white",
            foreColor: "white|#1d89ff|#1d89ff",
            borderColor:"transparent|white|white",
        },
    ];

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
            fillColor: new Color("white"),
            graphics: new Graphics2D("rect"),
        },
    CanvasInterativeComponent.DEF_PROP);

    static CUM_INDEX = 0;
}

class CanvasGrid extends CanvasContainer {
    constructor() {
        super();
    }
}