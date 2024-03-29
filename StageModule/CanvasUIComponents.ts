/*jshint esversion: ES2020 */

import { ASN_DEF, DATA_CLONE, DATA_IDEN, DATA_UNINIT, SObject, StateMap } from "./DataUtil.js";
import { Graphics2D, GraphicsText } from "./Graphics2D.js";
import { ContextMouseEvent, Object2D, StageInteractive, StageObject } from "./Object2D.js";
import { Color, Rect2D, Vector2D } from "./Struct.js";
import { CanvasButtonProperties, CanvasContainerProperties, CanvasLabelProperties, DataAssignType } from "./TypeUtil";
import BUTTONS from './Presets/Buttons.json' assert {type: 'json'}

export {
    CanvasDisplayComponent,
    CanvasInterativeComponent,
    CanvasLabel,
    CanvasButton,
    CanvasContainer
}

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

//[new Color("1d89ff"),new Color("#0061D7"),new Color("1d89ff")];

class InteractionStates<T> extends StateMap<T> {
    pressed: T;
    hovered: T;

    static STATE_HOVERED: string = "hovered";
    static STATE_PRESSED: string = "pressed";
}

class CanvasDisplayComponent extends Object2D {
    static CUM_INDEX = 0;
}

class CanvasInterativeComponent extends StageInteractive {
    static CUM_INDEX = 0;
}

class CanvasLabel extends CanvasDisplayComponent {
    declare graphics: GraphicsText;

    constructor( parameters: CanvasLabelProperties = {}, assign: DataAssignType = DATA_IDEN) {
         super({}, DATA_UNINIT);
         this.initialize(parameters, CanvasLabel.DEF_PROP, assign);
    }

    /**
     * @returns {CanvasLabel}
     */
    clone(): CanvasLabel {
        return new CanvasLabel(this, DATA_CLONE);
    }

    get text(): string {
        return this.graphics.text;
    }

    set text(value: string) {
        this.graphics.text = value;
    }

    get fontSize(): number {
        return this.stret.x;
    }

    set fontSize(size: number) {
        this.stret.moveTo(size, size);
    }

    get fontColor(): Color {
        return this.fillColor;
    }

    set fontColor(color: Color) {
        this.fillColor = color;
        this.resolve("fillColor", Color);
    }

    static DEF_PROP: CanvasLabelProperties = SObject.insertValues({
        graphics: new GraphicsText("Label"),
        fontColor: new Color("black"),
    }, CanvasDisplayComponent.DEF_PROP, DATA_CLONE);

    static CUM_INDEX: number = 0;
    static ObjectList: CanvasLabel[];
}

class CanvasButton extends CanvasInterativeComponent {
    captionLabel: CanvasLabel;
    declare states: InteractionStates<CanvasButtonProperties>

    constructor( parameters: CanvasButtonProperties | keyof typeof BUTTONS = {} , assign: DataAssignType = DATA_IDEN) {
        super({}, DATA_UNINIT);
        this.captionLabel = new CanvasLabel({text: "Button"});
        if (typeof parameters == "string") {
            parameters = BUTTONS[parameters] as Object;
        } 
        parameters = parameters ?? {};
        this.initialize(parameters, CanvasButton.DEF_PROP, assign);
    }

    clone(): CanvasButton {
        return new CanvasButton(this, DATA_CLONE);
    }

    get caption(): string {
        return this.captionLabel.text;
    }

    set caption(text: string) {
        this.captionLabel.text = text;
    }

    get foreColor(): Color {
        return this.captionLabel.fontColor;
    }

    set foreColor(value: Color) {
        this.captionLabel.fontColor = value;
    }

    get fontSize(): number {
        return this.captionLabel.fontSize;
    }

    set fontSize(value: number) {
        this.captionLabel.fontSize = value;
    }

    onMouseEnter(event: ContextMouseEvent) {
        this.switchTo(InteractionStates.STATE_HOVERED);
        super.onMouseEnter(event);
    }

    onMouseLeave(event: ContextMouseEvent) {
        this.restore();
        super.onMouseLeave(event);
    }

    onMouseDown(event: ContextMouseEvent) {
        this.switchTo(InteractionStates.STATE_PRESSED);
        super.onMouseDown(event);
    }

    onMouseUp(event: ContextMouseEvent) {
        if (this.isMouseIn) 
            this.switchTo(InteractionStates.STATE_HOVERED);
        else
            this.restore();
        super.onMouseUp(event);
    }

    refresh(): this {
        this.captionLabel.pos.copy(this.bound.center);
        return this;
    }

    render(ctx: CanvasRenderingContext2D): void {
        super.render(ctx,this.captionLabel);
    }

    //Statics
    static DEF_PROP: CanvasButtonProperties = SObject.insertValues(
    BUTTONS.classic, CanvasInterativeComponent.DEF_PROP, DATA_CLONE);

    static ObjectList: CanvasButton[];
    static CUM_INDEX = 0;
}

class CanvasContainer extends CanvasInterativeComponent {

    grid: Vector2D;
    padding: Rect2D;

    constructor( parameters: CanvasContainerProperties = {}, assign: DataAssignType = DATA_IDEN) {
        super({}, DATA_UNINIT);
        this.initialize(parameters, CanvasContainer.DEF_PROP, assign);
    }

    clone(): CanvasContainer {
        return new CanvasContainer(this, DATA_CLONE);
    }

    add(comp: Object2D): this {
        super.add(comp);
        this.refresh();
        return this;
    }

    resizeChildren(event?: UIEvent) {
        this.components.forEach(comp => {
            comp.resize(this.dimension.divide(this.grid), event);
        });
        return this;
    }

    refresh(): this {
        super.refresh();
        this.resize(this.dimension);
        return this;
    }

    resolveAll(other: CanvasContainer = this): this {

        SObject.resolve(other, "grid", Vector2D);
        super.resolveAll(other);
        return this;
    }

    static LEFT = "left";
    static RIGHT = "right";
    static TOP = "top";
    static BOTTOM = "bottom";
    static CENTER = "center";

    static DEF_PROP: CanvasContainerProperties = SObject.insertValues({
        fillColor: "white",
        graphics: "rect",
        grid: new Vector2D(1,1)
    }, CanvasInterativeComponent.DEF_PROP, DATA_CLONE);

    static CUM_INDEX = 0;
    static ObjectList: CanvasContainer[];
}