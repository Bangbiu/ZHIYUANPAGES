/*jshint esversion: 6 */
// @ts-check

import { Color, ColorStates } from "./ColorLib.js";
import { Graphics2D, GraphicsText } from "./Graphics2D.js";
import { Object2D, StageInteractive, ContextMouseEvent } from "./Object2D.js";

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

const MOUSE_EVENT_TYPE = new Map([   
        ["mousedown" , []],
        ["mouseup" , []],
        ["mousemove" , []],
        ["mouseenter" , []],
        ["mouseleave" , []],
        ["wheel" , []]
    ]);

class InteractColors extends ColorStates {
        /**
         * 
         * @param {Color | string} idle 
         * @param {Color | string} entered 
         * @param {Color | string} pressed 
         */
        constructor(idle=InteractColors.DEF_IDLE_COLOR,
                    entered=InteractColors.DEF_ENTERED_COLOR,
                    pressed=InteractColors.DEF_PRESSED_COLOR) {
            super(new Map([
                ["idle", idle],
                ["entered", entered],
                ["pressed", pressed]
            ]))
        }

        //Statics
        static DEF_IDLE_COLOR = new Color("1d89ff");
        static DEF_PRESSED_COLOR = new Color("#0061D7");
        static DEF_ENTERED_COLOR = new Color("1d89ff");
}

export class CanvasDisplayComponent extends Object2D {

}

export class CanvasInterativeCompnent extends StageInteractive {
    /** @type {Map<string,Array<Function>>} */
    mouseEventListeners = new Map(MOUSE_EVENT_TYPE);

    //(this: HTMLCanvasElement, ev: Event) => (func, options)
    /**
     * @param {string} type
     * @param {Function} func 
     * @returns {CanvasInterativeCompnent}
     */
    addMouseEventListener(type,func) {
        this.mouseEventListeners.get(type).push(func);
        return this;
    }

        //Event Place Holders
    /**
     * MouseEnter Event Handler
     * @param {ContextMouseEvent} event 
     */
     onMouseEnter(event){
        super.onMouseEnter(event);
        this.mouseEventListeners.get("mouseenter").forEach(func => {
            func.apply(this);
        })
    }

    /**
     * MouseLeave Event Handler
     * @param {ContextMouseEvent} event 
     */
    onMouseLeave(event){
        super.onMouseLeave(event);
        this.mouseEventListeners.get("mouseleave").forEach(func => {
            func.apply(this);
        })
    }

    /**
     * MouseMove Event Handler
     * @param {ContextMouseEvent} event
     */
    onMouseMove(event) {
        super.onMouseMove(event);
        this.mouseEventListeners.get("mousemove").forEach(func => {
            func.apply(this);
        })
    }

    /**
     * MouseDown Event Handler
     * @param {ContextMouseEvent} event 
     */
    onMouseDown(event){
        super.onMouseDown(event);
        this.mouseEventListeners.get("mousedown").forEach(func => {
            func.apply(this);
        })
    }

    /**
     * MouseUp Event Handler
     * @param {ContextMouseEvent} event 
     */
    onMouseUp(event){
        super.onMouseUp(event);
        this.mouseEventListeners.get("mouseup").forEach(func => {
            func.apply(this);
        })
    }

    /**
     * 
     * @param {ContextMouseEvent} event 
     */
    onMouseWheel(event){
        super.onMouseWheel(event);
        this.mouseEventListeners.get("wheel").forEach(func => {
            func.apply(this);
        })
    }

    /**
     * 
     * @param {number} width 
     * @param {number} height 
     */
    rescale(width,height) {
        this.scale.moveTo(width, height);
    }

    //Statics
}

export class CanvasLabel extends CanvasDisplayComponent {
    /**
     * 
     * @param {number} x 
     * @param {number} y 
     */
     /** @type {string} */ text;
     /** @type {Color | ColorStates} */ backColor;

     /**
      * @param {string} text
      * @param {number} x 
      * @param {number} y 
      * @param {Color | ColorStates | string} backColor 
      * @param {Color | ColorStates | string} captionColor 
      */
     constructor(text,x,y,backColor=CanvasLabel.DEF_BACKCOLOR,
        captionColor=CanvasLabel.DEF_CAPTIONCOLOR) {
         super(x,y,0,"2,2",captionColor,"white",0,new GraphicsText(text));
         this.backColor=(typeof backColor == "string" ? new Color(backColor):backColor);
     }

     /**
      * 
      * @param {CanvasRenderingContext2D} ctx 
      */
     render(ctx) {
        ctx.save();
        this.transform(ctx);
        ctx.fillStyle = this.backColor.toString();
        ctx.strokeStyle = this.backColor.toString();
        this.graphics.renderBound(ctx,true,true,this.scale);
        ctx.restore();
        super.render(ctx);
     }
 
     //Statics
     static DEF_BACKCOLOR = new Color("grey");
     static DEF_BORDERCOLOR = new Color("black");
     static DEF_CAPTIONCOLOR = new Color("black");
}

export class CanvasButton extends CanvasInterativeCompnent {
    /**
     * 
     * @param {number} x 
     * @param {number} y 
     */
    caption;
    constructor(x,y,caption=CanvasButton.DEF_CAPTION) {
        super(x,y);
        this.fillColor = CanvasButton.DEF_FILLCOLOR;
        this.borderColor = CanvasButton.DEF_BORDERCOLOR;
        this.graphics = new Graphics2D("trapezoid");
        this.caption = new CanvasLabel(
                caption,0,0,
                "transparent",
                CanvasButton.DEF_CAPTIONCOLOR
            );
        this.rescale(1,1);
        this.components.push(this.caption);
    }

    /**
     * 
     * @param {ContextMouseEvent} event 
     */
    onMouseEnter(event) {
        super.onMouseEnter(event);
        this.fillColor.switchTo("entered");
        this.borderColor.switchTo("entered");
        this.caption.fillColor.switchTo("entered");
    }
    /**
     * 
     * @param {ContextMouseEvent} event 
     */
    onMouseLeave(event) {
        super.onMouseLeave(event);
        this.fillColor.switchTo("idle");
        this.borderColor.switchTo("idle");
        this.caption.fillColor.switchTo("idle");
    }
    /**
     * 
     * @param {ContextMouseEvent} event 
     */
    onMouseDown(event) {
        super.onMouseDown(event);
        this.fillColor.switchTo("pressed");
        this.borderColor.switchTo("pressed");
        this.caption.fillColor.switchTo("pressed");
    }

    /**
     * 
     * @param {ContextMouseEvent} event 
     */
    onMouseUp(event) {
        super.onMouseUp(event);
        this.fillColor.switchTo("entered");
        this.borderColor.switchTo("entered");
        this.caption.fillColor.switchTo("entered");
    }

    /**
     * 
     * @param {number} width 
     * @param {number} height 
     */
    rescale(width,height) {
        super.rescale(width,height);
        let center = this.graphics.bound.getCenter();
        this.caption.pos.copy(center);
    }

    //Statics
    static DEF_FILLCOLOR = new InteractColors("#1d89ff","#1d89ff","white");
    static DEF_BORDERCOLOR = new InteractColors("transparent","white","white");
    static DEF_CAPTIONCOLOR = new InteractColors("white","white","#1d89ff");

    static DEF_CAPTION = "Button"
}
