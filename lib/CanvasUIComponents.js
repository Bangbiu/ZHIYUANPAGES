/*jshint esversion: 6 */
// @ts-check

import { Color, ColorStates } from "./ColorLib.js";
import { Graphics2D, GraphicsText } from "./Graphics2D.js";
import { SceneObject, SceneInteractive } from "./SceneObject.js";

/**
 * Picture/Image
 * Label
 * TextField
 * Frame
 * Button
 * CheckBox
 * Combo
 * Grid
 * ScrollBar
 * Slide
 */
export class CanvasButton extends SceneInteractive {
    /**
     * 
     * @param {number} x 
     * @param {number} y 
     */
    constructor(x,y) {
        super(x,y);
        this.fillColor = CanvasButton.DEF_FILLCOLOR;
        this.borderColor = CanvasButton.DEF_BORDERCOLOR;
        this.graphics = new Graphics2D("button");
        let center = this.graphics.bound.getCenter();

        this.components.push(
            new SceneObject(center.x,center.y,0,"2,2",
            "white","green",0,new GraphicsText("Button"))
        );
    }

    onMouseEnter(event) {
        super.onMouseEnter(event);
        this.fillColor.toggle();
        this.borderColor.toggle();
    }

    onMouseLeave(event) {
        super.onMouseLeave(event);
        this.fillColor.toggle();
        this.borderColor.toggle();
    }

    //Statics
    static DEF_FILLCOLOR = new ColorStates(["blue","white"]);
    static DEF_BORDERCOLOR = new ColorStates(["black","white"]);
}
