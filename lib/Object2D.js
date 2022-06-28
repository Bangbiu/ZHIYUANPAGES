/*jshint esversion: 6 */
// @ts-check
import * as DU from "./DataUtil.js";
import * as TU from "./TypeUtil.js";
import { SObject,Renderable } from "./DataUtil.js";
import { Color, ColorStates } from "./ColorLib.js";
import { Rect2D, Vector2D } from "./Struct.js";
import { Rotation2D } from "./Rotation2D.js";
import { Graphics2D, GraphicsText } from "./Graphics2D.js";
import { Animation } from "./Animation.js";

export {
     ContextMouseEvent,
     ContextTransf,
     MouseEventMap,
     Object2D,
     StageObject,
     StageInteractive,
     StageDynamic,
}

/**
 * Data Type
 * @typedef {TU.TickEventProperty} TickEventProperty
 * @typedef {TU.TickCallBack} TickCallBack
 * @typedef {TU.TickEvent} TickEvent
 * @typedef {DU.Attribution} Attribution
 * @typedef {TU.AnimationType} AnimationType
 * @typedef {TU.MouseEventType} MouseEventType
 * @typedef {TU.MouseDispatchedEvent} MouseDispatchedEvent
 * @typedef {TU.MouseEventBehavior} MouseEventBehavior
 * @typedef {TU.DataAssignType} DataAssignType
 * @typedef {TU.PivotSetting} PivotSetting
 * @typedef {TU.Vectorizable} Vectorizable
 * 
 * Class Instance Property Type
 * @typedef {TU.ContextTransformationProperties} ContextTransfProperties
 * @typedef {TU.Object2DProperties} Object2DProperties
 * @typedef {TU.StageObjectProperties} StageObjectProperties
 * @typedef {TU.StageInteractiveProperties} StageInteractiveProperties
 * 
 */


class ContextTransf extends SObject {
    /** @type {Vector2D} */ trans;
    /** @type {Vector2D} */ scale;
    /** @type {Rotation2D} */ rot;

    /**
     * 
     * @param {ContextTransfProperties | Object2D} parameters 
     * @param {DataAssignType} assign
     */
    constructor( parameters = {} , assign = SObject.DATA_CLONE) {
        super();
        if (SObject.has(parameters,["pos","rot","stret"])) {
            this.assign("trans",parameters["pos"],assign);
            this.assign("rot",parameters["rot"],assign);
            this.assign("scale",parameters["stret"],assign);
        } else {
            this.initialize(parameters, ContextTransf.DEF_PROP, assign);
        }
    }

    /**
     * 
     * @param {ContextTransfProperties} values 
     * @param {DataAssignType} assign 
     * @returns {this}
     */
    updateValues( values = {}, assign = SObject.DATA_CLONE) {
        SObject.resolve(values,"trans",Vector2D);
        SObject.resolve(values,"rot",Rotation2D);
        SObject.resolve(values,"scale",Vector2D);
        super.updateValues(values,assign);
        return this;
    }

    /**
     * 
     * @param {ContextTransf | ContextTransfProperties} other 
     * @returns 
     */
    copy(other){
        super.copy(other);
        return this;
    }

    /**
     * 
     * @returns {ContextTransf}
     */
    clone() {
        return new ContextTransf({ 
            trans: this.trans.clone(), 
            rot: this.rot.clone(), 
            scale: this.scale.clone() 
        });
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
        return vec.sub(this.trans).rotate(-this.rot.value).scale(this.scale);
    }

    /**
     * Undo Position Transform
     * @param {Vector2D} vec 
     * @returns {Vector2D}
     */
    restore(vec) {
        return vec.scale(this.scale).rotate(this.rot.value).add(this.trans);
    }

    /**
     * Transform Context
     * @param {CanvasRenderingContext2D} ctx 
     * @returns {CanvasRenderingContext2D}
     */
    transform(ctx) {
        ctx.translate(this.trans.x, this.trans.y);
        ctx.rotate(this.rot.value);
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
    /**
     * 
     * @param {MouseEvent | WheelEvent} event 
     */
    constructor(event) {
        this.info = event;
        let box = /** @type {HTMLCanvasElement} */ (event.target).getBoundingClientRect();
        this.mousePos = new Vector2D(event.clientX-box.left, event.clientY-box.top);
        this.mCtxPos = this.mousePos.clone();
    }
}


class Object2D extends Renderable {
    /** @type {string} Name*/ name;

    /** @type {Rect2D} frame*/ frame;

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
    /** @type {number} Border Width*/ borderWidth = 0.0;
    /** @type {boolean} Visibility*/  visible = true;

    /** @type {Array<TickEvent>} */ tickEvents = [];

    /**
     * 
     * @param {Object2DProperties} parameters 
     * @param {DataAssignType} assign
     */
    constructor( parameters = {} , assign = SObject.DATA_IDEN) {
        super();
        this.initialize(parameters,Object2D.DEF_PROP,assign);
        Object2D.CUM_INDEX++;
    }
    /**
     * 
     * @param {Object2DProperties} parameters 
     * @param {Object} def
     * @returns {this}
     */
    initialize( parameters = {} , def = Object2D.DEF_PROP, assign = SObject.DATA_IDEN) {
        //Prevent init
        if (assign == SObject.DATA_UNINIT) return this;
        //Copy
        else if (parameters instanceof Object2D) {
            this.copy(parameters);
            this.name = this.constructor.name + "_" +this.constructor["CUM_INDEX"];
            return this;
        }

        super.initialize(parameters,def,assign);

        if (!("name" in parameters) || assign == SObject.DATA_CLONE) {
            this.name = this.constructor.name + "_" +this.constructor["CUM_INDEX"];
        }
    
        return this;
    }

    get x() {
        return this.pos.x;
    }


    set x(value) {
        this.pos.x = value;
    }

    get y() {
        return this.pos.y;
    }

    set y(value) {
        this.pos.y = value;
    }

    /**
     * @returns {number}
     */
    get width() {
        return this.graphics.bound.width * this.scale.x * this.stret.x;
    }

    /**
     * @param {number} value
     */
    set width(value) {
        this.scale.x = value / this.graphics.bound.width / this.stret.x;
    }

    /**
     * @returns {number}
     */
    get height() {
        return this.graphics.bound.height * this.scale.y * this.stret.y;
    }

    /**
     * @param {number} value
     */
    set height(value) {
        this.scale.y = value / this.graphics.bound.height / this.stret.y;
    }


    get bound() {
        const gr = this.graphics.bound;
        return new Rect2D(
            gr.x * this.scale.x * this.stret.x,
            gr.y * this.scale.y * this.stret.y,
            this.width,
            this.height,
        );
    }

    get innerBound() {
        const gr = this.graphics.bound;
        return new Rect2D(
            gr.x * this.scale.x,
            gr.y * this.scale.y,
            gr.width * this.scale.x,
            gr.height * this.scale.y,
        );
    }

    set preset(index) {
        
    }

    /**
     * 
     * @param {number} x 
     * @param {number} y 
     * @returns {this}
     */
    moveTo(x=0,y=0) {
        this.pos.moveTo(x,y);
        return this;
    }

    /**
     * 
     * @param {Object} values 
     * @param {DataAssignType} assign 
     */
    updateValues( values = {}, assign = SObject.DATA_CLONE) {
        //Parse Values
        SObject.resolve(values,"frame",Rect2D);
        SObject.resolve(values,"pos",Vector2D);
        SObject.resolve(values,"rot",Rotation2D);
        SObject.resolve(values,"scale",Vector2D);
        SObject.resolve(values,"stret",Vector2D);
        SObject.resolve(values,"graphics",Graphics2D);

        SObject.resolve(values,"fillColor",Color);
        SObject.resolve(values,"borderColor",Color);
        SObject.resolve(values,"emissiveColor",Color);

        super.updateValues(values,assign);
        //Change Transformation Reference
        if ("transf" in values) {
            this.pos = this.transf.trans;
            this.rot = this.transf.rot;
            this.stret = this.transf.scale;
        } else {
            this.transf = new ContextTransf(this,SObject.DATA_IDEN);
        }
        return this;
    }

    /**
     * @returns {Object2D}
     */
    clone() {
        return new Object2D(this);
    }

    /**
     * Test if point is inside Object
     * @param {number} x 
     * @param {number} y 
     * @param {CanvasRenderingContext2D} ctx 
     * @returns {boolean | undefined}
     */
    isInside(x,y,ctx) {
        ctx.save();
        this.transform(ctx);
        ctx.beginPath();
        this.graphics.tracePath(ctx,this.scale);
        ctx.closePath();
        ctx.restore();
        return ctx.isPointInPath(x, y);
    }

    /**
     * @template T
     * @param {T} ctxOrPos 
     * @returns {T}
     */
    transform(ctxOrPos) {
        if (ctxOrPos instanceof Vector2D) {
            this.transf.apply(ctxOrPos);
        } else if (ctxOrPos instanceof CanvasRenderingContext2D) {
            this.transf.transform(ctxOrPos);
        }
        return ctxOrPos;
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
            if (e == undefined) return;
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

        //Render Emissive
        if (this.emissive > 0) {
            ctx.shadowBlur = this.emissive;
            ctx.shadowColor = this.emissiveColor.value;
        }

        ctx.fillStyle = this.fillColor.value;
        ctx.strokeStyle = this.borderColor.value;
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
        SObject.insertValues(settings, Object2D.DEF_EVENT);
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
     * @param {Array<TU.Referrable>} data 
     * @param {AnimationType} type
     * @returns {TickEvent | undefined}
     */
    animate(propText,data,interval=1,type="derive") {
        let attr = this.access(propText);
        if (attr == undefined) return undefined;
        let tickfunc = Animation[type](attr,data);
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

    toString() {
        return `<Object2D:${this.name}>`;
    }

    //Statics
    /** @type {Array<Object2D> | undefined} */
    static ObjectList = undefined;
    /** @type {CanvasRenderingContext2D | undefined} */
    static DefaultContext = undefined;

    /** @type {Object2DProperties} */
    static DEF_PROP = {
        name: undefined,
        frame: undefined,
        pos: new Vector2D(),
        scale: new Vector2D(1,1),
        stret: new Vector2D(1,1),
        rot: new Rotation2D(0),
        transf: new ContextTransf(),
        graphics: new Graphics2D("square"),

        fillColor: new Color("white"),
        borderColor: new Color("black"),
        emissiveColor: undefined,

        emissive: 0,
        borderWidth: 0,
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
    /** @type {boolean} */         mainBody = true;

    /**
     * 
     * @param {StageObjectProperties} parameters 
     * @param {DataAssignType} assign
     */
    constructor( parameters = {} , assign = SObject.DATA_IDEN) {
        super({},SObject.DATA_UNINIT);
        this.initialize(parameters,StageObject.DEF_PROP,assign);
        StageObject.CUM_INDEX++;
    }

    /**
     * @param {Vectorizable} value
     */
    set pivot(value) {
        this.innerTransf.trans =  new Vector2D(value).scaleXY(this.width,this.height);
    }

    /**
     * 
     * @param {Object2D} comp 
     */
    add(comp) {
        this.components.push(comp);
        return this;
    }

    /**
     * @returns {StageObject}
     */
    clone() {
        return new StageObject(this);
    }

    /**
     * @template T
     * @param {T} ctxOrPos 
     * @returns {T}
     */
    toInternal(ctxOrPos) {
        if (ctxOrPos instanceof Vector2D) {
            this.transf.apply(ctxOrPos);
            this.innerTransf.apply(ctxOrPos);
        } else if (ctxOrPos instanceof CanvasRenderingContext2D) {
            this.transf.transform(ctxOrPos);
            this.innerTransf.transform(ctxOrPos);
        }
        return ctxOrPos;
    }

    /**
     * @returns {this}
     */
    refresh() {
        this.components.forEach(comp => {
            if (comp.frame instanceof Rect2D) {
                if (comp.frame.x != undefined)
                    comp.pos.x = this.width * comp.frame.x;
                if (comp.frame.y != undefined)
                    comp.pos.y = this.height * comp.frame.y;
                if (comp.frame.width != undefined)
                    comp.width = this.width * comp.frame.width;
                if (comp.frame.height != undefined)
                    comp.height = this.height * comp.frame.height;
            }
            if (comp instanceof StageObject) {
                comp.refresh();
            }
        });
        return this;
    }

     /**
     * Update Data in Object
     * @param {number} delta 
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
     * @param {Array<Renderable>} coInRender
     * @returns 
     */
    render(ctx=Object2D.DefaultContext, coInRender=[]) {
        if (this.mainBody) super.render(ctx);

        //Render Components
        ctx.save();
        this.toInternal(ctx);
        this.components.forEach(comp => {
            comp.render(ctx);
        });
        coInRender.forEach(renderee => {
            renderee.render(ctx);
        });
        ctx.restore();
    }

    /**
     * Test if point is inside Group
     * @param {number} x 
     * @param {number} y 
     * @param {CanvasRenderingContext2D} ctx 
     * @returns {boolean}
     */
    isInGroup(x,y,ctx=Object2D.DefaultContext) {
        if (this.mainBody && this.isInside(x,y,ctx)) return true;
        let res = false;
        ctx.save();
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
    static DEF_PROP = SObject.insertValues({
        mainBody: true,
        innerTransf: new ContextTransf(),
    }, Object2D.DEF_PROP);

    /** @type {number} */
    static CUM_INDEX = 0;
}

class MouseEventMap extends SObject {
    /** @type {Array<MouseDispatchedEvent>} */ mousedown = [];
    /** @type {Array<MouseDispatchedEvent>} */ mouseup = [];
    /** @type {Array<MouseDispatchedEvent>} */ mousemove = [];
    /** @type {Array<MouseDispatchedEvent>} */ mouseenter = [];
    /** @type {Array<MouseDispatchedEvent>} */ mouseleave = [];
    /** @type {Array<MouseDispatchedEvent>} */ mousewheel = [];
    /** @type {StageInteractive} */            #actor = undefined;
    
    /**
     * @param {StageInteractive} actor 
     */
    constructor(actor) {
        super();
        this.#actor = actor;
    }

    get actor() {
        return this.#actor;
    }

    /**
     * @param {StageInteractive} actor
     * @returns {MouseEventMap}
     */
    clone(actor=this.#actor) {
        return new MouseEventMap(actor).updateValues(this,SObject.DATA_CLONE);
    }

    /**
     * 
     * @param {MouseEventType} eventType 
     * @param {MouseDispatchedEvent} callback 
     */
    addEvent(eventType,callback) {
        this[eventType].push(callback);
    }

    /**
     * 
     * @param {MouseEventBehavior} behavior 
     */
    addBehavior(behavior) {
        if (behavior.name in this) this.removeBehavior(behavior.name);
        for (const key in behavior) {
            if (key in this) this[key].push(behavior[key]);
        }
        this[behavior.name] = behavior;
    }

    /**
     * 
     * @param {string} behvrName 
     */
    removeBehavior(behvrName) {
        if (behvrName in this) {
            const behvr = this[behvrName];
            for (const key in behvr) {
                if (key in this) 
                    this[key] = this[key].filter((elem)=>(elem != behvr[key]));
            }
            delete this[behvrName];
        }
    }

    /**
     * 
     * @param {MouseEventType} eventType 
     * @param {ContextMouseEvent} event 
     */
    trigger(eventType,event) {
        this[eventType].forEach(e => {
            e.call(this.#actor, event);
        });
    }

    /** @type {MouseEventBehavior} */
    static BEHAVIOR_DRAGGABLE = {
        name: "draggable",
        mousedown: function(event) {
            if (!this.isInsideInteracting())
                this["ctrlPt"] = event.mCtxPos.clone().sub(this.pos);
        },
        mouseup: function(event) {
            delete this["ctrlPt"];
        },
        mousemove: function(event) {
            if (this["ctrlPt"] != undefined) {
                this.pos.copy(event.mCtxPos).sub(this["ctrlPt"]);
            }
        }
    }
}

class StageInteractive extends StageObject {
    /** @type {boolean} Mouse Event State flag*/ isMouseIn = false;
    /** @type {MouseEventMap} */ mouseDispatches;
    
    /**
     * 
     * @param {StageInteractiveProperties} parameters 
     * @param {DataAssignType} assign
     */
    constructor( parameters = {}, assign = SObject.DATA_IDEN) {
        super({},SObject.DATA_UNINIT);
        this.mouseDispatches = new MouseEventMap(this);
        this.initialize(parameters,StageInteractive.DEF_PROP,assign);
        StageInteractive.CUM_INDEX++;
    }

    get draggable() {
        return "draggable" in this.mouseDispatches;
    }

    /**
     * @returns {StageInteractive}
     */
    clone() {
        return new StageInteractive(this);
    }

    /**
     * 
     * @param {Object} values 
     * @param {DataAssignType} assign 
     * @returns 
     */
    updateValues(values = {}, assign = SObject.DATA_CLONE) {
        super.updateValues(values,assign);
        if (values instanceof StageInteractive) {
            this.mouseDispatches = values.mouseDispatches.clone(this);
        }
        return this;
    }

    /**
     * @param {boolean} value
     */
    set draggable(value) {
        if (value) 
            this.mouseDispatches.addBehavior(MouseEventMap.BEHAVIOR_DRAGGABLE);
        else {
            this.mouseDispatches.removeBehavior("draggable");
        }
    }

    /**
     * 
     * @param {HTMLCanvasElement} canv 
     */
    bindMouseEvents(canv) {
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
     * @param {HTMLCanvasElement} canv 
     */
    removeMouseEvents(canv) {
        let ctx = /** @type {CanvasRenderingContext2D} */canv.getContext("2d");
        canv.removeEventListener("mousedown", this.updateMouseInfo.bind(this,ctx));
        canv.removeEventListener("mouseup", this.updateMouseInfo.bind(this,ctx));
        canv.removeEventListener("mousemove", this.updateMouseInfo.bind(this,ctx));
        canv.removeEventListener("wheel",this.updateMouseInfo.bind(this,ctx));
        return this;
    }
    
    /**
     * 
     * @param {MouseEventType} eventType
     * @param {MouseDispatchedEvent} event 
     */
    addMouseEventListener(eventType,event) {
        this.mouseDispatches.addEvent(eventType,event);
        return this;
    }

    /**
     * 
     * @returns {boolean}
     */
    isInsideInteracting() {
        for(let i = 0; i < this.components.length; i++) {
            const comp = this.components[i];
            //if (this.class == "CanvasContainer") console.log(comp);
            if (comp instanceof StageInteractive && comp.isMouseIn) 
                return true;
        }
        return false;
    }
    
    /**
     * MouseEnter Event Handler
     * @param {ContextMouseEvent} event 
     */
    onMouseEnter(event){
        this.mouseDispatches.trigger("mouseenter",event);
    }

    /**
     * MouseLeave Event Handler
     * @param {ContextMouseEvent} event 
     */
    onMouseLeave(event){
        this.mouseDispatches.trigger("mouseleave",event);
    }

    /**
     * MouseMove Event Handler
     * @param {ContextMouseEvent} event
     */
    onMouseMove(event) {
        this.mouseDispatches.trigger("mousemove",event);
    }

    /**
     * MouseDown Event Handler
     * @param {ContextMouseEvent} event 
     */
    onMouseDown(event){
        this.mouseDispatches.trigger("mousedown",event);
    }

    /**
     * MouseUp Event Handler
     * @param {ContextMouseEvent} event 
     */
    onMouseUp(event){
        this.mouseDispatches.trigger("mouseup",event);
    }

    /**
     * 
     * @param {ContextMouseEvent} event 
     */
    onMouseWheel(event){
        this.mouseDispatches.trigger("wheel",event);
    }

    /**
     * MouseTrack Event Handler
     * @param {ContextMouseEvent | MouseEvent | WheelEvent} event 
     * @param {CanvasRenderingContext2D} ctx 
     */
    updateMouseInfo(ctx=Object2D.DefaultContext,event) {
        if (!(event instanceof ContextMouseEvent)) 
            event = new ContextMouseEvent(event);
        ctx.save();
        //Update Inside State
        let mtest = this.isInside(event.mousePos.x,event.mousePos.y, ctx);
        if (mtest && !this.isMouseIn) {
            this.isMouseIn = true;
            this.onMouseEnter(event);
        } else if (!mtest && this.isMouseIn) {
            this.isMouseIn = false;
            this.onMouseLeave(event);
        }
        //Trigger Event
        if (this.isMouseIn) {
            switch (event.info.type) {
                case "mousedown": { this.onMouseDown(event); break; }
                case "mouseup" : { this.onMouseUp(event); break;}
                case "mousemove" : { this.onMouseMove(event); break;} 
                case "wheel" : { this.onMouseWheel(event); break;}
            }
            this.toInternal(ctx);
            this.toInternal(event.mCtxPos);
            this.components.forEach(comp => {
                if (comp instanceof StageInteractive) {
                    comp.updateMouseInfo(ctx,event);
                    if (comp.isMouseIn) return;
                }
            });
        }
        ctx.restore();
    }

    static CUM_INDEX = 0;
    /** @type {Array<StageInteractive>} */
    static ObjectList = [];
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
        this.pos.moveBy(...new Vector2D(offX, offY).rotate(this.rot.value).value);
    }

    still() {
        this.vel.clear();
    }

    exertForce(outerFX, outerFY=0) {
        this.vel.moveBy(outerFX / this.mass, outerFY / this.mass)
    }

    exertForce_R(outerFX, outerFY=0) {
        this.exertForce(...new Vector2D(outerFX, outerFY).rotate(this.rot.value).value);
    }

    traceCurPos() {
        this.tracePts.push(this.pos.value);
        if (this.tracePts.length > this.traceLmt) this.tracePts.splice(0,1);
    }

    drawTrace(ctx) {
        ctx.save();
        ctx.strokeStyle = this.tColor.value;
        ctx.shadowBlur = this.emissive;
        ctx.shadowColor = this.emissiveColor.value;
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