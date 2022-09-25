/*jshint esversion: ES2020 */
import { DATA_CLONE, DATA_IDEN, DATA_UNINIT, SObject, StateMap } from "./DataUtil.js";
import { GraphicsText } from "./Graphics2D.js";
import { Object2D, StageInteractive } from "./Object2D.js";
import { Color, Vector2D } from "./Struct.js";
import BUTTONS from './Presets/Buttons.json' assert { type: 'json' };
export { CanvasDisplayComponent, CanvasInterativeComponent, CanvasLabel, CanvasButton, CanvasContainer };
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
class InteractionStates extends StateMap {
}
InteractionStates.STATE_HOVERED = "hovered";
InteractionStates.STATE_PRESSED = "pressed";
class CanvasDisplayComponent extends Object2D {
}
CanvasDisplayComponent.CUM_INDEX = 0;
class CanvasInterativeComponent extends StageInteractive {
}
CanvasInterativeComponent.CUM_INDEX = 0;
class CanvasLabel extends CanvasDisplayComponent {
    constructor(parameters = {}, assign = DATA_IDEN) {
        super({}, DATA_UNINIT);
        this.initialize(parameters, CanvasLabel.DEF_PROP, assign);
    }
    /**
     * @returns {CanvasLabel}
     */
    clone() {
        return new CanvasLabel(this, DATA_CLONE);
    }
    get text() {
        return this.graphics.text;
    }
    set text(value) {
        this.graphics.text = value;
    }
    get fontSize() {
        return this.stret.x;
    }
    set fontSize(size) {
        this.stret.moveTo(size, size);
    }
    get fontColor() {
        return this.fillColor;
    }
    set fontColor(color) {
        this.fillColor = color;
        this.resolve("fillColor", Color);
    }
}
CanvasLabel.DEF_PROP = SObject.insertValues({
    graphics: new GraphicsText("Label"),
    fontColor: new Color("black"),
}, CanvasDisplayComponent.DEF_PROP, DATA_CLONE);
CanvasLabel.CUM_INDEX = 0;
class CanvasButton extends CanvasInterativeComponent {
    constructor(parameters = {}, assign = DATA_IDEN) {
        super({}, DATA_UNINIT);
        this.captionLabel = new CanvasLabel({ text: "Button" });
        if (typeof parameters == "string") {
            parameters = BUTTONS[parameters];
        }
        parameters = parameters ?? {};
        this.initialize(parameters, CanvasButton.DEF_PROP, assign);
    }
    clone() {
        return new CanvasButton(this, DATA_CLONE);
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
    get fontSize() {
        return this.captionLabel.fontSize;
    }
    set fontSize(value) {
        this.captionLabel.fontSize = value;
    }
    onMouseEnter(event) {
        this.switchTo(InteractionStates.STATE_HOVERED);
        super.onMouseEnter(event);
    }
    onMouseLeave(event) {
        this.restore();
        super.onMouseLeave(event);
    }
    onMouseDown(event) {
        this.switchTo(InteractionStates.STATE_PRESSED);
        super.onMouseDown(event);
    }
    onMouseUp(event) {
        if (this.isMouseIn)
            this.switchTo(InteractionStates.STATE_HOVERED);
        else
            this.restore();
        super.onMouseUp(event);
    }
    refresh() {
        this.captionLabel.pos.copy(this.bound.center);
        return this;
    }
    render(ctx) {
        super.render(ctx, this.captionLabel);
    }
}
//Statics
CanvasButton.DEF_PROP = SObject.insertValues(BUTTONS.classic, CanvasInterativeComponent.DEF_PROP, DATA_CLONE);
CanvasButton.CUM_INDEX = 0;
class CanvasContainer extends CanvasInterativeComponent {
    constructor(parameters = {}, assign = DATA_IDEN) {
        super({}, DATA_UNINIT);
        this.initialize(parameters, CanvasContainer.DEF_PROP, assign);
    }
    clone() {
        return new CanvasContainer(this, DATA_CLONE);
    }
    add(comp) {
        super.add(comp);
        this.refresh();
        return this;
    }
    resizeChildren(event) {
        this.components.forEach(comp => {
            comp.resize(this.dimension.divide(this.grid), event);
        });
        return this;
    }
    refresh() {
        super.refresh();
        this.resize(this.dimension);
        return this;
    }
    resolveAll(other = this) {
        SObject.resolve(other, "grid", Vector2D);
        super.resolveAll(other);
        return this;
    }
}
CanvasContainer.LEFT = "left";
CanvasContainer.RIGHT = "right";
CanvasContainer.TOP = "top";
CanvasContainer.BOTTOM = "bottom";
CanvasContainer.CENTER = "center";
CanvasContainer.DEF_PROP = SObject.insertValues({
    fillColor: "white",
    graphics: "rect",
    grid: new Vector2D(1, 1)
}, CanvasInterativeComponent.DEF_PROP, DATA_CLONE);
CanvasContainer.CUM_INDEX = 0;
