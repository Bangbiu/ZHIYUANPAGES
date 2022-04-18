/*jshint esversion: 6 */
// @ts-check
import * as DU from "./DataUtil.js";
import * as TU from "./TypeUtil.js";
import { Color, ColorStates } from "./ColorLib.js";
import { Vector2D } from "./Vector2D.js";
import { Rotation2D } from "./Rotation2D.js";
import { Graphics2D, GraphicsText } from "./Graphics2D.js";
import { Animation } from "./Animation.js";

export {
     ContextMouseEvent,
     ContextTransf,
     Object2D,
     StageObject,
     StageInteractive,
     StageDraggable,
     StageDynamic,
}

/**
 * Data Type
 * @typedef {TU.TickEventProperty} TickEventProperty
 * @typedef {TU.TickCallBack} TickCallBack
 * @typedef {TU.TickEvent} TickEvent
 * @typedef {TU.Attribution} Attribution
 * @typedef {TU.Reference} Reference
 * @typedef {TU.AnimationType} AnimationType
 * 
 * Class Instance Property Type
 * @typedef {TU.ContextTransformationProperties} ContextTransfProperties
 * @typedef {TU.Object2DProperties} Object2DProperties
 * @typedef {TU.StageObjectProperties} StageObjectProperties
 * 
 */


class ContextTransf extends DU.Object {
    /** @type {Vector2D} */ trans;
    /** @type {Vector2D} */ scale;
    /** @type {Rotation2D} */ rot;

    /**
     * 
     * @param {ContextTransfProperties | Object2D} parameters 
     */
    constructor( parameters = {}) {
        super();
        this.setValues(parameters,ContextTransf.DEF_PROP);
        if ("pos" in parameters) this.trans = parameters.pos;
    }

    /**
     * 
     * @param {ContextTransf} other 
     * @returns 
     */
    copy(other=undefined) {
        if (other == undefined) {
            return new ContextTransf({ 
                trans: this.trans.copy(), 
                rot: this.rot.copy(), 
                scale: this.scale.copy() 
            });
        } else {
            this.trans = other.trans.copy();
            this.rot = other.rot.copy();
            this.scale = other.scale.copy();
        }
    }
    /**
     * @param {ContextTransf} other 
     * @returns {ContextTransf}
     */
    add(other) {
        this.trans.add(other.trans);
        this.rot.add(other.rot);
        this.scale.scale(other.scale);
        return this;
    }
    
    /**
     * Transform Position
     * @param {Vector2D} vec 
     * @returns {Vector2D}
     */
    apply(vec) {
        return vec.minus(this.trans).rotate(-this.rot.rad).scale(this.scale);
    }

    /**
     * Undo Position Transform
     * @param {Vector2D} vec 
     * @returns {Vector2D}
     */
    restore(vec) {
        return vec.scale(this.scale).rotate(this.rot.rad).add(this.trans);
    }

    /**
     * Transform Context
     * @param {CanvasRenderingContext2D} ctx 
     * @returns {CanvasRenderingContext2D}
     */
    transform(ctx) {
        ctx.translate(this.trans.x, this.trans.y);
        ctx.rotate(this.rot.rad);
        ctx.scale(this.scale.x, this.scale.y);
        return ctx;
    } 

    /** @type {ContextTransfProperties} */
    static DEF_PROP = {
        trans: new Vector2D(),
        rot: new Rotation2D(),
        scale: new Vector2D(1,1)
    }
}

class ContextMouseEvent {
    /** @type {MouseEvent | WheelEvent} Event Arguments*/ info;
    /** @type {Vector2D} Absolute Mouse Position*/        mousePos;
    /** @type {Vector2D} Relative Mouse Position*/        mCtxPos;
    constructor(event,transf=DEF_TRANSF) {
        this.info = event;
        let box = /** @type {HTMLCanvasElement} */ (event.target).getBoundingClientRect();
        this.mousePos = new Vector2D(event.clientX-box.left, event.clientY-box.top);
        this.mCtxPos = transf.apply(this.mousePos.copy());
    }
}

const DEF_TRANSF = new ContextTransf();

class Object2D extends DU.Object {
    /** @type {string} Name*/ name;

    /** @type {Vector2D} Postion*/ pos;
    /** @type {Vector2D} Scale */  scale;
    /** @type {Vector2D} Stretch*/ stret;
    /** @type {Rotation2D} Rotation*/  rot;
    /** @type {ContextTransf} Transf*/ transf;
    /** @type {Graphics2D} Graphics */ graphics; 

    /** @type {Color} Fill Color*/     fillColor;
    /** @type {Color} Border Color*/   borderColor; 
    /** @type {Color} Emission Color*/ emissiveColor; 

    /** @type {number} Emi Strength*/ emissive = 0.0;
    /** @type {number} Border Width*/ borderWidth;
    /** @type {boolean} Visibility*/  visible = true;

    /** @type {Array<TickEvent>} */ tickEvents = [];

    /**
     * 
     * @param {Object2DProperties} parameters 
     */
    constructor( parameters = {} ) {
        super();
        this.setValues(parameters);
        Object2D.CUM_INDEX++;
    }
    /**
     * 
     * @param {Object2DProperties} parameters 
     * @param {Object2DProperties} def
     */
    setValues( parameters = {}, def = Object2D.DEF_PROP ) {
        super.setValues(parameters,def);
        //Parse Parameter
        if (this.transf != undefined) {
            if (!(this.transf instanceof ContextTransf)) 
                this.transf = new ContextTransf(this.transf);
            this.pos = this.transf.trans;
            this.rot = this.rot;
            this.scale = this.stret;
        }

        if (this.name == undefined && this.constructor["CUM_INDEX"] != undefined) {
            this.name = this.constructor.name + "_" +this.constructor["CUM_INDEX"];
        }

        if (parameters.pos == undefined) {
            this.pos = new Vector2D(
                "x" in parameters ? parameters["x"] : Object2D.DEF_PROP.x,
                "y" in parameters ? parameters["y"] : Object2D.DEF_PROP.y
            );
        } else if (!(this.pos instanceof Vector2D)) {
            this.pos = new Vector2D(this.pos);
        }

        if (!(this.rot instanceof Rotation2D))
            this.rot = new Rotation2D(this.rot);

        if (!(this.scale instanceof Vector2D))
            this.scale = new Vector2D(this.scale);

        if (!(this.stret instanceof Vector2D))
            this.stret = new Vector2D(this.stret);

        if (!(this.graphics instanceof Graphics2D))
            this.graphics = new Graphics2D(this.graphics);

        ["fillColor","borderColor","emissiveColor"].forEach(colorKey => {
            if (!(this[colorKey] instanceof Color)) 
                this[colorKey] = new Color(this[colorKey]);
        });

        if (this.transf == undefined)
            this.transf = new ContextTransf(this);
        
        console.log(this.transf);
    }


    /**
     * Test if point is inside Object
     * @param {number} x 
     * @param {number} y 
     * @param {CanvasRenderingContext2D} ctx 
     * @returns {boolean}
     */
    isInside(x,y,ctx=Object2D.DefaultContext) {
        ctx.save();
        this.transform(ctx);
        ctx.beginPath();
        this.graphics.tracePath(ctx,this.scale);
        ctx.closePath();
        ctx.restore();
        return ctx.isPointInPath(x, y);
    }

    transform(ctx) {
        this.transf.transform(ctx);
    }

    /**
     * 
     * @param {CanvasRenderingContext2D} ctx 
     * @param {number} delta 
     */
    tick(ctx,delta=1) {
        this.update(delta);
        this.render(ctx);
    }
    
    /**
     * Update Data in Object
     * @param {number} delta 
     * @returns {void}
     */
    update(delta=1) {
        this.tickEvents.forEach(e => {
            e.prog += delta;
            if (e.prog >= e.interval) {
                e.prog = 0;
                e.repeat--;
                if (e.repeat == 0) 
                    this.tickEvents.splice(this.tickEvents.indexOf(e), 1);
                e.call(this,e);
            }
        });
    } 

    /**
     * Rendering Object to Canvas
     * @param {CanvasRenderingContext2D} ctx 
     * @returns 
     */
    render(ctx=Object2D.DefaultContext) {
        if (!this.visible) return;
        ctx.save();
        this.transform(ctx);

        //Render Self
        if (this.emissive > 0) {
            ctx.shadowBlur = this.emissive;
            ctx.shadowColor = this.emissiveColor.toString();
        }

        ctx.fillStyle = this.fillColor.toString();
        ctx.strokeStyle = this.borderColor.toString();
        ctx.lineWidth = this.borderWidth;
        this.graphics.render(ctx,
            this.borderWidth!=0 && this.borderColor!=undefined, 
            this.fillColor!=undefined, 
            this.scale
        );
        
        ctx.restore();
    }

    /**
     * @param {TickCallBack} callback
     * @param {TickEventProperty} settings
     * @returns {TickEvent}
     */
    dispatchTickEvent(callback,settings = {}) {
        DU.Object.insertValues(settings, Object2D.DEF_EVENT);
        /** @type {TickEvent} */
        let event = Object.assign(callback, settings);
        this.tickEvents.push(event);
        return event;
    }

    temporify(life=100) {
        this.dispatchTickEvent(this.finalize, {
            eventName: "finalizeCountDown",
            interval: life
        });
    }

    /**
     * 
     * @param {string} propText 
     * @param {number} interval 
     * @param {Array<number|Attribution|Reference|PropertyDescriptor>} data 
     * @param {AnimationType} type
     * @returns {TickEvent}
     */
     animate(propText,data,interval=1,type="derive") {

        let tickfunc = Animation[type](
            this.referer(propText),data
        );
        if (tickfunc == undefined) {
            console.warn("Property to animate does not exist!");
            return undefined;
        }

        return this.dispatchTickEvent(tickfunc, {
            eventName: "animationOn_" + propText,
            interval: interval,
            repeat: -1
        });
    }


    finalize() {
        if (Object2D.ObjectList != undefined)
            Object2D.ObjectList.splice(Object2D.ObjectList.indexOf(this), 1);
    }

    //Statics
    static ObjectList = undefined;
    static DefaultContext = undefined;

    /** @type {Object2DProperties} */
    static DEF_PROP = {
        name: undefined,
        x: 0,
        y: 0,
        pos: undefined,
        scale: new Vector2D(1,1),
        stret: new Vector2D(1,1),
        rot: new Rotation2D(0),
        transf: undefined,
        graphics: new Graphics2D("square"),

        fillColor: new Color("white"),
        borderColor: new Color("black"),
        emissiveColor: undefined,

        emissive: 0,
        borderWidth: 3,
        visible: true,

        tickEvents: []
    }

    /** @type {TickEventProperty} */
    static DEF_EVENT = {
        eventName: "unknown",
        repeat: 1,
        interval: 100,
        prog: 0
    }

    /** @type {number} */
    static CUM_INDEX = 0;
}



class StageObject extends Object2D {

    /** @type {Array<Object2D>} */ components = [];
    /** @type {ContextTransf} */   innerTransf;
    /** @type {boolean} */         mainBody;

    /**
     * 
     * @param {StageObjectProperties} parameters 
     */
    constructor( parameters = {}) {
        super(parameters);
    }

    /**
     * 
     * @param {StageObjectProperties} parameters 
     */
    setValues( parameters = {}, def = StageObject.DEF_PROP) {
        super.setValues(parameters, def);
        StageObject.CUM_INDEX++;
    }

    /**
     * 
     * @param {CanvasRenderingContext2D} ctx 
     */
     toInternal(ctx) {
        this.innerTransf.transform(ctx);
    }

     /**
     * Update Data in Object
     * @param {Number} delta 
     * @returns {void}
     */   
    update(delta=1) {
        super.update(delta);
        // Components Update
        this.components.forEach(comp => {
            comp.update(delta);
        });
    }

    /**
     * Rendering Object to Canvas
     * @param {CanvasRenderingContext2D} ctx 
     * @returns 
     */
    render(ctx=Object2D.DefaultContext) {
        if (this.mainBody) super.render(ctx);

        //Render Components
        this.transform(ctx);
        this.toInternal(ctx);
        this.components.forEach(comp => {
            comp.render(ctx);
        });
    }

    /**
     * Test if point is inside Group
     * @param {number} x 
     * @param {number} y 
     * @param {CanvasRenderingContext2D} ctx 
     * @returns {boolean}
     */
    isInGroup(x,y,ctx=Object2D.DefaultContext) {
        if (this.isInside(x,y,ctx)) return true;
        let res = false;
        ctx.save();
        this.transform(ctx);
        this.toInternal(ctx);
        this.components.every(comp => {
            if (comp.isInside(x, y, ctx)) {
                res = true;
                return false;
            } 
            return true;
        });

        ctx.restore();
        return res;
    }
    /** @type {StageObjectProperties} */
    static DEF_PROP = Object.assign({
        mainBody: true,
        innerTransf: DEF_TRANSF,
    }, Object2D.DEF_PROP);

    /** @type {number} */
    static CUM_INDEX = 0;
}

/**
 * @typedef {("mousedown"|"mouseup"|"mousemove"|"mouseenter"|"mouseleave"|"wheel")} MouseEventType
 * @typedef {MouseEventType} ObjectEventType
 * @typedef {Object.<MouseEventType,Array<MouseDispatchedEvent>>} MouseDispatchList 
 * 
 * @callback MouseDispatchedEvent
 * @param {ContextMouseEvent} event
 * 
 */
class StageInteractive extends StageObject {
    /** @type {boolean} Mouse Event State flag*/ isMouseIn = false;

    /** @type {MouseDispatchList} */ mouseDispatches = {
        "mousedown":[],
        "mouseup":[],
        "mousemove":[],
        "mouseenter":[],
        "mouseleave":[],
        "wheel":[]
    }

    /**
     * 
     * @param {HTMLCanvasElement} canv 
     */
    bindMouseEvent(canv) {
        let ctx = /** @type {CanvasRenderingContext2D} */canv.getContext("2d");
        //this.onMouseDown.bind(this) onMouseUp onMouseMove
        canv.addEventListener("mousedown", this.updateMouseInfo.bind(this,ctx));
        canv.addEventListener("mouseup", this.updateMouseInfo.bind(this,ctx));
        canv.addEventListener("mousemove", this.updateMouseInfo.bind(this,ctx));
        canv.addEventListener("wheel",this.updateMouseInfo.bind(this,ctx));
        return this;
    }
    
    /**
     * 
     * @param {MouseEventType} eventType
     * @param {MouseDispatchedEvent} event 
     */
    dispatchMouseEvent(eventType,event) {
        this.mouseDispatches[eventType].push(event);
    }
    //Event Place Holders
    /**
     * MouseEnter Event Handler
     * @param {ContextMouseEvent} event 
     */
    onMouseEnter(event){
        this.isMouseIn = true;
    }

    /**
     * MouseLeave Event Handler
     * @param {ContextMouseEvent} event 
     */
    onMouseLeave(event){
        this.isMouseIn = false;
        
    }

    /**
     * MouseMove Event Handler
     * @param {ContextMouseEvent} event
     */
    onMouseMove(event) {}

    /**
     * MouseDown Event Handler
     * @param {ContextMouseEvent} event 
     */
    onMouseDown(event){}

    /**
     * MouseUp Event Handler
     * @param {ContextMouseEvent} event 
     */
    onMouseUp(event){}

    /**
     * 
     * @param {ContextMouseEvent} event 
     */
    onMouseWheel(event){}

    /**
     * MouseTrack Event Handler
     * @param {ContextMouseEvent | MouseEvent | WheelEvent} event 
     * @param {CanvasRenderingContext2D} ctx 
     */
    updateMouseInfo(ctx=Object2D.DefaultContext,event) {
        //console.log(ctx.getTransform());
        if (event instanceof MouseEvent) 
            event = new ContextMouseEvent(event,this.innerTransf);
        ctx.save();
        //Update Inside State
        let mtest = this.isInside(event.mousePos.x,event.mousePos.y, ctx);
        if (mtest && !this.isMouseIn) this.onMouseEnter(event);
        else if (!mtest && this.isMouseIn) this.onMouseLeave(event);
        //Dispatch Event
        if (this.isMouseIn) {
            switch (event.info.type) {
                case "mousedown": { this.onMouseDown(event); break; }
                case "mouseup" : { this.onMouseUp(event); break;}
                case "mousemove" : { this.onMouseMove(event); break;} 
                case "wheel" : { this.onMouseWheel(event); break;}
            }
            this.mouseDispatches[event.info.type].forEach(e => {
                e.apply(this);
            });
            this.toInternal(ctx);
            this.components.forEach(comp => {
                if (comp instanceof StageInteractive)
                    comp.updateMouseInfo(ctx,event);
            });
        }
        ctx.restore();
    }

    //Statics
}

class StageDraggable extends StageInteractive {
    /** @type {boolean} Draggable flag*/         draggable;
    /** @type {boolean} Co-Dragging flag*/       coDrag = false;
    /** @type {number} Dragging Level*/          dragLevel = 0; 
    /** @type {Vector2D} */ ctrlPt = undefined;

    /**
     * 
     * @param {number} x 
     * @param {number} y 
     * @param {Rotation2D | number} rot 
     * @param {Vector2D | string} scale 
     * @param {Color | ColorStates | string} fillColor 
     * @param {Color | ColorStates | string} borderColor 
     * @param {number} borderWidth 
     * @param {Graphics2D | string} graphics 
     * @param {number} life 
     */

    /**
     * MouseMove Event Handler
     * @param {ContextMouseEvent} event
     */
    onMouseMove(event) {
        super.onMouseMove(event);
        if (this.ctrlPt != undefined && event.info.buttons > 0 && this.draggable) {
            this.pos.copy(event.mCtxPos).minus(this.ctrlPt);
        }
    }

    /**
     * MouseDown Event Handler
     * @param {ContextMouseEvent} event 
     */
    onMouseDown(event){
        super.onMouseDown(event);
        if (this.isMouseIn) {
            this.ctrlPt = event.mCtxPos.copy().minus(this.pos);
        }
    }

    /**
     * MouseUp Event Handler
     * @param {ContextMouseEvent} event 
     */
    onMouseUp(event){
        super.onMouseUp(event);
        if (event.info.button == 0) {
            this.ctrlPt = undefined;
        }
    }

    static dragLevelIndex = 0;
    static DEF_DRAGGABLE = true;

    static DEF_ROTATION = new Rotation2D(0.0);
    static DEF_SCALE = new Vector2D(1,1);
    static DEF_FILLCOLOR = new Color("white");
    static DEF_BORDEDR_COLOR = new Color("black");
    static DEF_BORDER_WIDTH = 3;
    static DEF_GRAPHICS = new Graphics2D("square");
    static DEF_LIFE = -100;
}

 class StageDynamic extends StageInteractive {
    /** @type {Vector2D} */ vel;
    /** @type {Color} */ tColor;

    //Debug
    velRay = false;
    rotRay = false;
    traceOn = false; traceLmt = 100;
    tracePts = [];
    mass = 1;

    //Data Processing
    moveBy(offX, offY=0) {
        this.pos.moveBy(offX, offY);
    }

    moveBy_R(offX, offY=0) {
        this.pos.moveBy(...new Vector2D(offX, offY).rotate(this.rot.rad).val());
    }

    still() {
        this.vel.clear();
    }

    exertForce(outerFX, outerFY=0) {
        this.vel.moveBy(outerFX / this.mass, outerFY / this.mass)
    }

    exertForce_R(outerFX, outerFY=0) {
        this.exertForce(...new Vector2D(outerFX, outerFY).rotate(this.rot.rad).val());
    }

    traceCurPos() {
        this.tracePts.push(this.pos.val());
        if (this.tracePts.length > this.traceLmt) this.tracePts.splice(0,1);
    }

    drawTrace(ctx) {
        ctx.save();
        ctx.strokeStyle = this.tColor.toString();
        ctx.shadowBlur = this.emissive;
        ctx.shadowColor = this.emissiveColor.toString();
        ctx.lineWidth = 3;
        ctx.moveTo(...this.tracePts[0]);
        this.tracePts.forEach(pt => {
            ctx.lineTo(...pt);
        });
        
        ctx.lineTo(this.pos.x,this.pos.y);
        ctx.stroke();
        ctx.restore();
    }

    /**
     * 
     * @param {Number} delta 
     * @returns {void}
     */
    update(delta) {
        super.update(delta);
        // Update Position
        this.pos.moveBy(this.vel.x * delta, this.vel.y * delta);
        return;
    }

    render(ctx) {
        super.render(ctx);
        if (this.traceOn) {
            this.traceCurPos();
            this.drawTrace(ctx);
        }
        //Debug Rays
        if (this.velRay || this.rotRay) {
            ctx.beginPath();
            if (this.velRay) {
                ctx.moveTo(0,0);
                ctx.lineTo(this.vel.x * 100, this.vel.y * 100);
            }
            ctx.closePath();
            ctx.stroke();
        }
    }

    //Statics
    static DEF_VELOCITY = new Vector2D(0.0,0.0);
    static DEF_ROTATION = new Rotation2D(0.0);
    static DEF_SCALE = new Vector2D(1,1);
    static DEF_FILLCOLOR = new Color("white");
    static DEF_BORDEDR_COLOR = new Color("black");
    static DEF_BORDER_WIDTH = 3;
    static DEF_GRAPHICS = new Graphics2D("square");
    static DEF_LIFE = -100;
}