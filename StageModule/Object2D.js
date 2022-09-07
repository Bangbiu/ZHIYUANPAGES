/*jshint esversion: ES2020 */
import { Vector2D, Rect2D, Rotation2D, Color } from "./Struct.js";
import { SObject, ASN_DEF, DATA_IDEN, DATA_UNINIT, DATA_CLONE, StateMap, ListenerList, ListenerMap } from "./DataUtil.js";
import { Graphics2D } from "./Graphics2D.js";
import { Animation } from "./Animation.js";
export { ContextTransf, ContextMouseEvent, TickListeners, InteractiveListeners, Object2D, StageObject, StageInteractive, StageDynamic, };
var EVENTYPE;
(function (EVENTYPE) {
    EVENTYPE["ONTICK"] = "ontick";
    EVENTYPE["MOUSEMOVE"] = "mousemove";
    EVENTYPE["MOUSEENTER"] = "mouseenter";
    EVENTYPE["MOUSLEAVE"] = "mouseleave";
    EVENTYPE["MOUSEDOWN"] = "mousedown";
    EVENTYPE["MOUSEUP"] = "mouseup";
    EVENTYPE["MOUSEWHEEL"] = "wheel";
    EVENTYPE["KEYDOWN"] = "keydown";
    EVENTYPE["KEYPRESS"] = "keypress";
    EVENTYPE["KEYUP"] = "keyup";
})(EVENTYPE || (EVENTYPE = {}));
class ContextTransf extends SObject {
    constructor(parameters = {}, assign = ASN_DEF) {
        super();
        if (parameters instanceof Object2D) {
            this.assign("trans", parameters.pos, assign);
            this.assign("rot", parameters.rot, assign);
            this.assign("scale", parameters.stret, assign);
        }
        else if (parameters instanceof ContextTransf) {
            this.copy(parameters);
        }
        else {
            if (typeof parameters == "string") {
                const text = parameters.split("|");
                parameters = {
                    trans: text[0],
                    rot: text[1],
                    scale: text[2]
                };
            }
            this.initialize(parameters, ContextTransf.DEF_PROP, assign);
        }
        this.resolveAll();
    }
    resolveAll(other = this) {
        SObject.resolve(other, "trans", Vector2D);
        SObject.resolve(other, "rot", Rotation2D);
        SObject.resolve(other, "scale", Vector2D);
        return other;
    }
    copy(other) {
        super.copy(other);
        return this;
    }
    clone() {
        return new ContextTransf({
            trans: this.trans,
            rot: this.rot,
            scale: this.scale
        }, DATA_CLONE);
    }
    add(other) {
        this.trans.add(other.trans);
        this.rot.add(other.rot);
        this.scale.scale(other.scale);
        return this;
    }
    apply(vec) {
        return vec.sub(this.trans).rotate(-this.rot.value).scale(this.scale);
    }
    restore(vec) {
        return vec.scale(this.scale).rotate(this.rot.value).add(this.trans);
    }
    transform(ctx) {
        ctx.translate(this.trans.x, this.trans.y);
        ctx.rotate(this.rot.value);
        ctx.scale(this.scale.x, this.scale.y);
        return ctx;
    }
    toString() {
        return `<${this.name}:<(${this.trans.value}),${this.rot.value},(${this.scale.value})>`;
    }
}
ContextTransf.DEF_PROP = {
    trans: new Vector2D(),
    rot: new Rotation2D(),
    scale: new Vector2D(1, 1)
};
class ContextMouseEvent {
    /**
     *
     * @param {MouseEvent | WheelEvent} event
     */
    constructor(event) {
        this.info = event;
        let box = /** @type {HTMLCanvasElement} */ (event.target).getBoundingClientRect();
        this.mousePos = new Vector2D(event.clientX - box.left, event.clientY - box.top);
        this.mCtxPos = this.mousePos.clone();
    }
}
class TickListeners extends ListenerMap {
    constructor(map) {
        super();
        this.ontick = new ListenerList();
        if (map != undefined)
            this.copy(map);
    }
    clone() {
        return new TickListeners(this);
    }
    copy(other) {
        this.ontick = other.ontick.clone();
        return this;
    }
    addEventListener(eventType, callback) {
        this.ontick.push(callback);
    }
    trigger(actor, eventType, ...argArray) {
        const delta = argArray.length >= 1 ? argArray[0] : 1.0;
        this.ontick.forEach(event => {
            event.prog += delta;
            if (event.prog >= event.interval) {
                event.prog = 0;
                event.repeat--;
                event.call(actor, event);
            }
        });
        this.ontick.filter((event) => (event.repeat != 0));
    }
}
class InteractiveListeners extends TickListeners {
    constructor() {
        super(...arguments);
        this.mousedown = new ListenerList();
        this.mouseup = new ListenerList();
        this.mousemove = new ListenerList();
        this.mouseenter = new ListenerList();
        this.mouseleave = new ListenerList();
        this.wheel = new ListenerList();
        this.keydown = new ListenerList();
        this.keypress = new ListenerList();
        this.keyup = new ListenerList();
    }
    clone() {
        return new InteractiveListeners(this);
    }
    addEventListener(eventType, listener) {
        this[eventType].push(listener);
    }
    trigger(actor, eventType, ...argArray) {
        if (eventType == "ontick") {
            super.trigger(actor, EVENTYPE.ONTICK, ...argArray);
        }
        else {
            this[eventType].trigger(actor, ...argArray);
        }
    }
    addBehavior(behavior) {
        if (behavior.bhvname in this)
            this.removeBehavior(behavior.bhvname);
        for (const key in behavior) {
            if (key in this) {
                this[key].push(behavior[key]);
            }
        }
        this[behavior.bhvname] = behavior;
    }
    removeBehavior(behvrName) {
        if (behvrName in this) {
            const behvr = this[behvrName];
            for (const key in behvr) {
                if (key in this)
                    this[key] = this[key].filter((elem) => (elem != behvr[key]));
            }
            delete this[behvrName];
        }
    }
}
InteractiveListeners.BEHAVIOR_DRAGGABLE = {
    bhvname: "draggable",
    mousedown: function (event) {
        if (!this.isInsideInteracting())
            this["ctrlPt"] = event.mCtxPos.clone().sub(this.pos);
    },
    mouseup: function (event) {
        delete this["ctrlPt"];
    },
    mousemove: function (event) {
        if (this["ctrlPt"] != undefined) {
            this.pos.copy(event.mCtxPos).sub(this["ctrlPt"]);
        }
    }
};
class Object2D extends SObject {
    constructor(parameters = {}, assign = DATA_IDEN) {
        super();
        this.emissive = 0.0;
        this.borderWidth = 0.0;
        this.visible = true;
        this.debug = false;
        this.initialize(parameters, Object2D.DEF_PROP, assign);
    }
    initialize(parameters = {}, def = Object2D.DEF_PROP, assign = DATA_IDEN) {
        //Prevent init
        if (assign == DATA_UNINIT)
            return this;
        Object2D.ObjectList?.push(this);
        if (this.class != "Object2D") {
            this.constructor["ObjectList"]?.push(this);
        }
        super.initialize(parameters, def, assign);
        this.ID = this.constructor["CUM_INDEX"];
        this.constructor["CUM_INDEX"]++;
        return this;
    }
    updateValues(values, assign = ASN_DEF) {
        super.updateValues(values, assign);
        //Linking
        if (values.transf != undefined) {
            this.resolve("transf", ContextTransf);
            this.pos = this.transf.trans;
            this.rot = this.transf.rot;
            this.stret = this.transf.scale;
        }
        else {
            this.transf = new ContextTransf(this, DATA_IDEN);
        }
        if (this.states?.currentState == 0)
            this.states.bind(this);
        this.refresh();
        return this;
    }
    resolveAll(other = this) {
        SObject.resolve(other, "pos", Vector2D);
        SObject.resolve(other, "rot", Rotation2D);
        SObject.resolve(other, "stret", Vector2D);
        SObject.resolve(other, "frame", Rect2D);
        SObject.resolve(other, "scale", Vector2D);
        SObject.resolve(other, "graphics", Graphics2D);
        SObject.resolve(other, "fillColor", Color);
        SObject.resolve(other, "borderColor", Color);
        SObject.resolve(other, "emissiveColor", Color);
        SObject.resolve(other, "states", StateMap);
        return this;
    }
    get name() {
        return this.class + "_" + this.ID;
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
    get width() {
        return this.graphics.bound.width * this.scale.x * this.stret.x;
    }
    set width(value) {
        this.scale.x = value / this.graphics.bound.width / this.stret.x;
    }
    get height() {
        return this.graphics.bound.height * this.scale.y * this.stret.y;
    }
    set height(value) {
        this.scale.y = value / this.graphics.bound.height / this.stret.y;
    }
    get bound() {
        return this.graphics.bound.clone().scale(this.scale);
    }
    get innerBound() {
        return this.graphics.bound;
    }
    moveTo(x = 0, y = 0) {
        this.pos.moveTo(x, y);
        return this;
    }
    reframe(x = this.x, y = this.y, width = this.width, height = this.height) {
        this.pos.moveTo(x, y);
        this.width = this.width;
        this.height = this.height;
        return this;
    }
    copy(other) {
        const ID = this.ID;
        super.copy(other);
        this.ID = ID;
        return this;
    }
    clone() {
        return new Object2D(this, DATA_CLONE);
    }
    addState(stateOrKey, state) {
        if (this.states == undefined)
            this.states = new StateMap().bind(this);
        if (typeof stateOrKey == "object")
            this.states.push(stateOrKey);
        else
            this.states.put(stateOrKey, state);
    }
    refresh() {
        if (this.states != undefined)
            this.updateValues(this.states.fetch(), DATA_IDEN);
        return this;
    }
    switchTo(key) {
        if (key != undefined && this.states != undefined && key in this.states)
            this.updateValues(this.states.swtichTo(key), DATA_IDEN);
    }
    toggle() {
        if (this.states != undefined) {
            this.updateValues(this.states.toggle(), DATA_IDEN);
        }
        return this;
    }
    restore() {
        this.updateValues(this.states[0], DATA_IDEN);
    }
    isInside(x, y, ctx) {
        let res;
        ctx.save();
        this.transform(ctx);
        res = ctx.isPointInPath(this.graphics.scaledPath(this.scale), x, y);
        ctx.restore();
        return res;
    }
    isInBound(x, y, ctx) {
        let res;
        ctx.save();
        this.transform(ctx);
        res = ctx.isPointInPath(this.graphics.boundPath, x, y);
        ctx.restore();
        return res;
    }
    transform(ctxOrPos) {
        if (ctxOrPos instanceof Vector2D) {
            this.transf.apply(ctxOrPos);
        }
        else if (ctxOrPos instanceof CanvasRenderingContext2D) {
            this.transf.transform(ctxOrPos);
        }
        return ctxOrPos;
    }
    tick(ctx, delta = 1) {
        this.update(delta);
        this.render(ctx);
    }
    update(delta = 1) {
        this.listeners?.trigger(this, EVENTYPE.ONTICK, delta);
    }
    render(ctx = Object2D.DefaultContext) {
        if (!this.visible)
            return;
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
        this.graphics.render(ctx, this.scale, this.borderWidth != 0 && this.borderColor != undefined, this.fillColor != undefined);
        if (this.debug) {
            ctx.strokeStyle = "red";
            ctx.lineWidth = 2;
            this.graphics.renderBound(ctx, this.scale, true, false);
        }
        ctx.restore();
    }
    addTickEventListener(listener, settings = {}) {
        const event = Object.assign(listener, Object2D.DEF_TICKEVENTPROP);
        this.listeners.addEventListener(EVENTYPE.ONTICK, Object.assign(event, settings));
        return listener;
    }
    temporify(life = 100) {
        this.addTickEventListener(this.finalize, {
            eventName: "finalizeCountDown",
            interval: life
        });
    }
    animate(propText, data, interval = 1, type = "derive") {
        let attr = this.access(propText);
        if (attr == undefined)
            return undefined;
        let tickfunc = Animation[type](attr, data);
        if (tickfunc == undefined) {
            console.warn("Property to animate does not exist!");
            return undefined;
        }
        return this.addTickEventListener(tickfunc, {
            eventName: "animationOn_" + propText,
            interval: interval,
            repeat: -1
        });
    }
    finalize() {
        Object2D.ObjectList?.splice(Object2D.ObjectList.indexOf(this), 1);
        if (this.class != "Object2D") {
            const clsObjList = this.constructor["ObjectList"];
            clsObjList?.splice(clsObjList.indexOf(this), 1);
        }
    }
    toString() {
        return `<Object2D:${this.name}>`;
    }
}
//Statics
Object2D.ObjectList = undefined;
Object2D.DefaultContext = undefined;
Object2D.CUM_INDEX = 0;
Object2D.DEF_PROP = {
    frame: undefined,
    pos: new Vector2D(),
    scale: new Vector2D(1, 1),
    stret: new Vector2D(1, 1),
    rot: 0,
    transf: undefined,
    graphics: "square",
    fillColor: new Color("white"),
    borderColor: new Color("black"),
    emissiveColor: undefined,
    emissive: 0,
    borderWidth: 0,
    visible: true,
    listeners: new TickListeners(),
    states: undefined,
    debug: false
};
Object2D.DEF_TICKEVENTPROP = {
    eventName: "unknow",
    prog: 0,
    interval: 100,
    repeat: -1,
};
class StageObject extends Object2D {
    constructor(parameters = {}, assign = DATA_IDEN) {
        super({}, DATA_UNINIT);
        this.components = [];
        this.mainBody = true;
        this.initialize(parameters, StageObject.DEF_PROP, assign);
    }
    set pivot(value) {
        this.innerTransf.trans = new Vector2D(value).scaleXY(this.width, this.height);
    }
    add(comp) {
        this.components.push(comp);
        return this;
    }
    clone() {
        return new StageObject(this, DATA_CLONE);
    }
    toInternal(ctxOrPos) {
        if (ctxOrPos instanceof Vector2D) {
            this.transf.apply(ctxOrPos);
            this.innerTransf.apply(ctxOrPos);
        }
        else if (ctxOrPos instanceof CanvasRenderingContext2D) {
            this.transf.transform(ctxOrPos);
            this.innerTransf.transform(ctxOrPos);
        }
        return ctxOrPos;
    }
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
    update(delta = 1) {
        super.update(delta);
        // Components Update
        this.components.forEach(comp => {
            comp.update(delta);
        });
    }
    render(ctx = Object2D.DefaultContext, ...coRender) {
        if (this.mainBody)
            super.render(ctx);
        //Render Components
        ctx.save();
        this.toInternal(ctx);
        this.components.forEach(comp => {
            comp.render(ctx);
        });
        coRender.forEach(renderee => {
            renderee.render(ctx);
        });
        ctx.restore();
    }
    isInGroup(x, y, ctx = Object2D.DefaultContext) {
        if (this.mainBody && this.isInside(x, y, ctx))
            return true;
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
}
StageObject.DEF_PROP = SObject.insertValues({
    mainBody: true,
    innerTransf: new ContextTransf(),
    states: undefined
}, Object2D.DEF_PROP, DATA_CLONE);
StageObject.ObjectList = undefined;
StageObject.CUM_INDEX = 0;
class StageInteractive extends StageObject {
    constructor(parameters = {}, assign = DATA_IDEN) {
        super({}, DATA_UNINIT);
        this.isMouseIn = false;
        this.initialize(parameters, StageInteractive.DEF_PROP, assign);
        if (StageInteractive.CanvasDOM != undefined)
            this.bindMouseEvents(StageInteractive.CanvasDOM);
    }
    get draggable() {
        return "draggable" in this.listeners;
    }
    clone() {
        return new StageInteractive(this, DATA_CLONE);
    }
    resolveAll(other = this) {
        super.resolveAll(other);
        return this;
    }
    set draggable(value) {
        if (value)
            this.listeners.addBehavior(InteractiveListeners.BEHAVIOR_DRAGGABLE);
        else {
            this.listeners.removeBehavior("draggable");
        }
    }
    bindKeyboardEvents() {
        window.addEventListener(EVENTYPE.KEYDOWN, this.updateKeyBoardInfo.bind(this));
        window.addEventListener(EVENTYPE.KEYPRESS, this.updateKeyBoardInfo.bind(this));
        window.addEventListener(EVENTYPE.KEYUP, this.updateKeyBoardInfo.bind(this));
        return this;
    }
    bindMouseEvents(canv) {
        let ctx = /** @type {CanvasRenderingContext2D} */ canv.getContext("2d");
        canv.addEventListener(EVENTYPE.MOUSEDOWN, this.updateMouseInfo.bind(this, ctx));
        canv.addEventListener(EVENTYPE.MOUSEUP, this.updateMouseInfo.bind(this, ctx));
        canv.addEventListener(EVENTYPE.MOUSEMOVE, this.updateMouseInfo.bind(this, ctx));
        canv.addEventListener(EVENTYPE.MOUSEWHEEL, this.updateMouseInfo.bind(this, ctx));
        return this;
    }
    addMouseEventListener(eventType, listener) {
        this.listeners.addEventListener(eventType, listener);
        return this;
    }
    addKeyBoardListener(eventType, listener) {
        this.listeners.addEventListener(eventType, listener);
        return this;
    }
    isInsideInteracting() {
        for (let i = 0; i < this.components.length; i++) {
            const comp = this.components[i];
            if (comp instanceof StageInteractive && comp.isMouseIn)
                return true;
        }
        return false;
    }
    onKeyDown(event) {
        this.listeners.trigger(this, EVENTYPE.KEYDOWN, event);
    }
    onKeyPress(event) {
        this.listeners.trigger(this, EVENTYPE.KEYPRESS, event);
    }
    onKeyUp(event) {
        this.listeners.trigger(this, EVENTYPE.KEYUP, event);
    }
    onMouseEnter(event) {
        this.listeners.trigger(this, EVENTYPE.MOUSEENTER, event);
    }
    onMouseLeave(event) {
        this.listeners.trigger(this, EVENTYPE.MOUSLEAVE, event);
    }
    onMouseMove(event) {
        this.listeners.trigger(this, EVENTYPE.MOUSEMOVE, event);
    }
    onMouseDown(event) {
        this.listeners.trigger(this, EVENTYPE.MOUSEDOWN, event);
    }
    onMouseUp(event) {
        this.listeners.trigger(this, EVENTYPE.MOUSEUP, event);
    }
    onMouseWheel(event) {
        this.listeners.trigger(this, EVENTYPE.MOUSEWHEEL, event);
    }
    updateMouseInfo(ctx = Object2D.DefaultContext, event) {
        if (!(event instanceof ContextMouseEvent))
            event = new ContextMouseEvent(event);
        ctx.save();
        //Update Inside State
        let mtest = this.isInside(event.mousePos.x, event.mousePos.y, ctx);
        if (mtest && !this.isMouseIn) {
            this.isMouseIn = true;
            this.onMouseEnter(event);
        }
        else if (!mtest && this.isMouseIn) {
            this.isMouseIn = false;
            this.onMouseLeave(event);
        }
        //Trigger Event
        if (this.isMouseIn) {
            switch (event.info.type) {
                case EVENTYPE.MOUSEDOWN: {
                    this.onMouseDown(event);
                    //console.log(this.name + " " + event.info.type);
                    break;
                }
                case EVENTYPE.MOUSEUP: {
                    this.onMouseUp(event);
                    break;
                }
                case EVENTYPE.MOUSEMOVE: {
                    this.onMouseMove(event);
                    break;
                }
                case EVENTYPE.MOUSEWHEEL: {
                    this.onMouseWheel(event);
                    break;
                }
            }
            this.toInternal(ctx);
            this.toInternal(event.mCtxPos);
            this.components.forEach(comp => {
                if (comp instanceof StageInteractive) {
                    comp.updateMouseInfo(ctx, event);
                    if (comp.isMouseIn)
                        return;
                }
            });
        }
        ctx.restore();
    }
    updateKeyBoardInfo(event) {
        switch (event.type) {
            case EVENTYPE.KEYDOWN: {
                this.onKeyDown(event);
                break;
            }
            case EVENTYPE.KEYPRESS: {
                this.onKeyPress(event);
                break;
            }
            case EVENTYPE.KEYUP: {
                this.onKeyUp(event);
                break;
            }
        }
        this.components.forEach(comp => {
            if (comp instanceof StageInteractive) {
                comp.updateKeyBoardInfo(event);
            }
        });
    }
}
StageInteractive.CUM_INDEX = 0;
StageInteractive.ObjectList = [];
StageInteractive.CanvasDOM = undefined;
StageInteractive.DEF_PROP = SObject.insertValues({
    listeners: new InteractiveListeners(),
    states: undefined
}, StageObject.DEF_PROP, DATA_CLONE);
class StageDynamic extends StageInteractive {
    constructor() {
        super(...arguments);
        //Debug
        this.velRay = false;
        this.rotRay = false;
        this.traceOn = false;
        this.traceLmt = 100;
        this.tracePts = [];
        this.mass = 1;
    }
    //Data Processing
    moveBy(offX, offY = 0) {
        this.pos.moveBy(offX, offY);
    }
    moveBy_R(offX, offY = 0) {
        this.pos.moveBy(...new Vector2D(offX, offY).rotate(this.rot.value).value);
    }
    still() {
        this.vel.clear();
    }
    exertForce(outerFX, outerFY = 0) {
        this.vel.moveBy(outerFX / this.mass, outerFY / this.mass);
    }
    exertForce_R(outerFX, outerFY = 0) {
        this.exertForce(...new Vector2D(outerFX, outerFY).rotate(this.rot.value).value);
    }
    traceCurPos() {
        this.tracePts.push(this.pos.value);
        if (this.tracePts.length > this.traceLmt)
            this.tracePts.splice(0, 1);
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
        ctx.lineTo(this.pos.x, this.pos.y);
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
                ctx.moveTo(0, 0);
                ctx.lineTo(this.vel.x * 100, this.vel.y * 100);
            }
            ctx.closePath();
            ctx.stroke();
        }
    }
}
//Statics
StageDynamic.DEF_VELOCITY = new Vector2D(0.0, 0.0);
StageDynamic.DEF_ROTATION = new Rotation2D(0.0);
StageDynamic.DEF_SCALE = new Vector2D(1, 1);
StageDynamic.DEF_FILLCOLOR = new Color("white");
StageDynamic.DEF_BORDEDR_COLOR = new Color("black");
StageDynamic.DEF_BORDER_WIDTH = 3;
//static DEF_GRAPHICS = new Graphics2D("square");
StageDynamic.DEF_LIFE = -100;
