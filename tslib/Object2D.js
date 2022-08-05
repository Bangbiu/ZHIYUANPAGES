/*jshint esversion: ES2020 */
// @ts-check
import { Vector2D, Rect2D, Rotation2D, Color } from "./Struct.js";
import { SObject, ASN_DEF, DATA_IDEN, DATA_UNINIT, DATA_CLONE } from "./DataUtil.js";
import { Graphics2D } from "./Graphics2D.js";
import { Animation } from "./Animation.js";
export { ContextTransf, ContextMouseEvent, MouseEventMap, Object2D, StageObject, StageInteractive, StageDynamic, };
class ContextTransf extends SObject {
    constructor(parameters = {}, assign = ASN_DEF) {
        super();
        if (parameters instanceof Object2D) {
            this.assign("trans", parameters.pos, assign);
            this.assign("rot", parameters.rot, assign);
            this.assign("scale", parameters.scale, assign);
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
class MouseEventMap extends SObject {
    constructor(actor) {
        super();
        this.mousedown = [];
        this.mouseup = [];
        this.mousemove = [];
        this.mouseenter = [];
        this.mouseleave = [];
        this.mousewheel = [];
        this.actor = undefined;
        this.actor = actor;
    }
    get eventActor() {
        return this.actor;
    }
    clone(actor = this.actor) {
        return new MouseEventMap(actor).updateValues(this, DATA_CLONE);
    }
    addEvent(eventType, callback) {
        this[eventType].push(callback);
    }
    addBehavior(behavior) {
        if (behavior.name in this)
            this.removeBehavior(behavior.name);
        for (const key in behavior) {
            if (key in this)
                this[key].push(behavior[key]);
        }
        this[behavior.name] = behavior;
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
    trigger(eventType, event) {
        this[eventType].forEach(e => {
            e.call(this.actor, event);
        });
    }
}
MouseEventMap.BEHAVIOR_DRAGGABLE = {
    name: "draggable",
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
        this.tickEvents = [];
        this.initialize(parameters, Object2D.DEF_PROP, assign);
        Object2D.CUM_INDEX++;
    }
    initialize(parameters = {}, def = Object2D.DEF_PROP, assign = DATA_IDEN) {
        //Prevent init
        if (assign == DATA_UNINIT)
            return this;
        super.initialize(parameters, def, assign);
        this.ID = this.constructor["CUM_INDEX"];
        return this;
    }
    updateValues(values, assign = ASN_DEF) {
        super.updateValues(values, assign);
        //Linking
        if (values.transf != undefined) {
            SObject.resolve(this, "transf", ContextTransf);
            this.pos = this.transf.trans;
            this.rot = this.transf.rot;
            this.stret = this.transf.scale;
        }
        else {
            this.transf = new ContextTransf(this, DATA_IDEN);
        }
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
        const gr = this.graphics.bound;
        if (gr == undefined) {
            return undefined;
        }
        else {
            return new Rect2D(gr.x * this.scale.x * this.stret.x, gr.y * this.scale.y * this.stret.y, this.width, this.height);
        }
    }
    get innerBound() {
        const gr = this.graphics.bound;
        return new Rect2D(gr.x * this.scale.x, gr.y * this.scale.y, gr.width * this.scale.x, gr.height * this.scale.y);
    }
    moveTo(x = 0, y = 0) {
        this.pos.moveTo(x, y);
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
    isInside(x, y, ctx) {
        ctx.save();
        this.transform(ctx);
        ctx.beginPath();
        this.graphics.tracePath(ctx, this.scale);
        ctx.closePath();
        ctx.restore();
        return ctx.isPointInPath(x, y);
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
        this.tickEvents.forEach(e => {
            if (e == undefined)
                return;
            e.prog += delta;
            if (e.prog >= e.interval) {
                e.prog = 0;
                e.repeat--;
                if (e.repeat == 0)
                    this.tickEvents.splice(this.tickEvents.indexOf(e), 1);
                e.call(this, e);
            }
        });
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
        this.graphics.render(ctx, this.borderWidth != 0 && this.borderColor != undefined, this.fillColor != undefined, this.scale);
        ctx.restore();
    }
    dispatchTickEvent(callback, settings = {}) {
        SObject.insertValues(settings, Object2D.DEF_EVENT);
        let event = Object.assign(callback, settings);
        this.tickEvents.push(event);
        return event;
    }
    temporify(life = 100) {
        this.dispatchTickEvent(this.finalize, {
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
}
//Statics
Object2D.ObjectList = undefined;
Object2D.DefaultContext = undefined;
Object2D.DEF_PROP = {
    frame: undefined,
    pos: new Vector2D(),
    scale: "1,1",
    stret: "1,1",
    rot: 0,
    transf: undefined,
    graphics: "square",
    fillColor: "white",
    borderColor: "black",
    emissiveColor: undefined,
    emissive: 0,
    borderWidth: 0,
    visible: true,
    tickEvents: []
};
Object2D.DEF_EVENT = {
    eventName: "unknown",
    repeat: 1,
    interval: 100,
    prog: 0
};
Object2D.CUM_INDEX = 0;
class StageObject extends Object2D {
    constructor(parameters = {}, assign = DATA_IDEN) {
        super({}, DATA_UNINIT);
        this.components = [];
        this.mainBody = true;
        this.initialize(parameters, StageObject.DEF_PROP, assign);
        StageObject.CUM_INDEX++;
    }
    set pivot(value) {
        this.innerTransf.trans = new Vector2D(value).scaleXY(this.width, this.height);
    }
    add(comp) {
        this.components.push(comp);
        return this;
    }
    clone() {
        return new StageObject(this);
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
    render(ctx = Object2D.DefaultContext, coInRender = []) {
        if (this.mainBody)
            super.render(ctx);
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
}, Object2D.DEF_PROP);
StageObject.CUM_INDEX = 0;
class StageInteractive extends StageObject {
    constructor(parameters = {}, assign = DATA_IDEN) {
        super({}, DATA_UNINIT);
        this.isMouseIn = false;
        this.mouseDispatches = new MouseEventMap(this);
        this.initialize(parameters, StageInteractive.DEF_PROP, assign);
        StageInteractive.CUM_INDEX++;
    }
    get draggable() {
        return "draggable" in this.mouseDispatches;
    }
    clone() {
        return new StageInteractive(this);
    }
    updateValues(values = {}, assign = DATA_CLONE) {
        super.updateValues(values, assign);
        if (values instanceof StageInteractive) {
            this.mouseDispatches = values.mouseDispatches.clone(this);
        }
        return this;
    }
    set draggable(value) {
        if (value)
            this.mouseDispatches.addBehavior(MouseEventMap.BEHAVIOR_DRAGGABLE);
        else {
            this.mouseDispatches.removeBehavior("draggable");
        }
    }
    bindMouseEvents(canv) {
        let ctx = /** @type {CanvasRenderingContext2D} */ canv.getContext("2d");
        //this.onMouseDown.bind(this) onMouseUp onMouseMove
        canv.addEventListener("mousedown", this.updateMouseInfo.bind(this, ctx));
        canv.addEventListener("mouseup", this.updateMouseInfo.bind(this, ctx));
        canv.addEventListener("mousemove", this.updateMouseInfo.bind(this, ctx));
        canv.addEventListener("wheel", this.updateMouseInfo.bind(this, ctx));
        return this;
    }
    removeMouseEvents(canv) {
        let ctx = /** @type {CanvasRenderingContext2D} */ canv.getContext("2d");
        canv.removeEventListener("mousedown", this.updateMouseInfo.bind(this, ctx));
        canv.removeEventListener("mouseup", this.updateMouseInfo.bind(this, ctx));
        canv.removeEventListener("mousemove", this.updateMouseInfo.bind(this, ctx));
        canv.removeEventListener("wheel", this.updateMouseInfo.bind(this, ctx));
        return this;
    }
    addMouseEventListener(eventType, event) {
        this.mouseDispatches.addEvent(eventType, event);
        return this;
    }
    isInsideInteracting() {
        for (let i = 0; i < this.components.length; i++) {
            const comp = this.components[i];
            //if (this.class == "CanvasContainer") console.log(comp);
            if (comp instanceof StageInteractive && comp.isMouseIn)
                return true;
        }
        return false;
    }
    onMouseEnter(event) {
        this.mouseDispatches.trigger("mouseenter", event);
    }
    onMouseLeave(event) {
        this.mouseDispatches.trigger("mouseleave", event);
    }
    onMouseMove(event) {
        this.mouseDispatches.trigger("mousemove", event);
    }
    onMouseDown(event) {
        this.mouseDispatches.trigger("mousedown", event);
    }
    onMouseUp(event) {
        this.mouseDispatches.trigger("mouseup", event);
    }
    onMouseWheel(event) {
        this.mouseDispatches.trigger("wheel", event);
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
                case "mousedown": {
                    this.onMouseDown(event);
                    break;
                }
                case "mouseup": {
                    this.onMouseUp(event);
                    break;
                }
                case "mousemove": {
                    this.onMouseMove(event);
                    break;
                }
                case "wheel": {
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
}
StageInteractive.CUM_INDEX = 0;
StageInteractive.ObjectList = [];
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
StageDynamic.DEF_GRAPHICS = new Graphics2D("square");
StageDynamic.DEF_LIFE = -100;
