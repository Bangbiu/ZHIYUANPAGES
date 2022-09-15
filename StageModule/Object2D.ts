/*jshint esversion: ES2020 */
import { Vector2D, Rect2D, Rotation2D, Color } from "./Struct.js";
import { Graphics2D } from "./Graphics2D.js";
import { Animation } from "./Animation.js";
import { 
    SObject, 
    ASN_DEF, 
    DATA_IDEN, 
    DATA_UNINIT, 
    DATA_CLONE, 
    StateMap, 
    ListenerList, 
    ListenerMap
} from "./DataUtil.js";
import { 
    AnimationType, 
    ContextTransfProperties, 
    DataAssignType, 
    MouseCallBack, 
    MouseEventBehavior, 
    MouseEventInfo, 
    Object2DProperties, 
    Renderable, 
    StageInteractiveProperties, 
    StageObjectProperties, 
    TickCallBack, 
    TickEventProperties, 
    TickEvent,
    Transfizable, 
    Vectorizable, 
    Numerizable,
    Polymorphistic,
    KBCallBack,
    StageIntEventType,
    TickEventType,
    MouseEventType,
    KeyBoardEventType,
    RenderableProperties
} from "./TypeUtil.js";

export {
    ContextTransf,
    ContextMouseEvent,
    TickListeners,
    InteractiveListeners,

    Object2D,
    StageObject,
    StageInteractive,
    StageDynamic,
}

enum EVENTYPE {
    ONTICK = "ontick",
    
    MOUSEMOVE = "mousemove",
    MOUSEENTER = "mouseenter",
    MOUSLEAVE = "mouseleave",
    MOUSEDOWN = "mousedown",
    MOUSEUP = "mouseup",
    MOUSEWHEEL = "wheel",

    KEYDOWN = "keydown",
    KEYPRESS = "keypress",
    KEYUP = "keyup",
}

class ContextTransf extends SObject implements ContextTransfProperties {
    trans: Vector2D;
    scale: Vector2D;
    rot: Rotation2D;

    constructor( parameters: Transfizable = {} , assign: DataAssignType = ASN_DEF) {
        super();
        if (parameters instanceof Object2D) {
            this.assign("trans", parameters.pos, assign);
            this.assign("rot", parameters.rot, assign);
            this.assign("scale", parameters.stret, assign);
        } else if (parameters instanceof ContextTransf) {
            this.copy(parameters);
        } else {
            if (typeof parameters == "string") {
                const text = parameters.split("|");
                parameters= {
                    trans: text[0],
                    rot: text[1],
                    scale: text[2]
                } as ContextTransfProperties;
            }
            this.initialize(parameters, ContextTransf.DEF_PROP, assign);
        }
        this.resolveAll();
    }

    resolveAll(other: ContextTransfProperties = this): ContextTransfProperties {
        SObject.resolve(other, "trans", Vector2D);
        SObject.resolve(other, "rot", Rotation2D);
        SObject.resolve(other, "scale", Vector2D);
        return other;
    }

    copy(other: ContextTransfProperties): this {
        super.copy(other);
        return this;
    }

    clone(): ContextTransf {
        return new ContextTransf({ 
            trans: this.trans, 
            rot: this.rot, 
            scale: this.scale 
        }, DATA_CLONE);
    }

    add(other: ContextTransf): this {
        this.trans.add(other.trans);
        this.rot.add(other.rot);
        this.scale.scale(other.scale);
        return this;
    }
    
    apply(vec: Vector2D): Vector2D {
        return vec.sub(this.trans).rotate(-this.rot.value).scale(this.scale);
    }

    restore(vec: Vector2D): Vector2D {
        return vec.scale(this.scale).rotate(this.rot.value).add(this.trans);
    }

    transform(ctx: CanvasRenderingContext2D): CanvasRenderingContext2D {
        ctx.translate(this.trans.x, this.trans.y);
        ctx.rotate(this.rot.value);
        ctx.scale(this.scale.x, this.scale.y);
        return ctx;
    } 

    toString(): string {
        return `<${this.name}:<(${this.trans.value}),${this.rot.value},(${this.scale.value})>`;
    }

    static DEF_PROP: ContextTransfProperties = {
        trans: new Vector2D(),
        rot: new Rotation2D(),
        scale: new Vector2D(1,1)
    }
}

class ContextMouseEvent {
    /** @type {MouseEvent | WheelEvent} Event Arguments*/ info: MouseEventInfo;
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

class TickListeners extends ListenerMap {
    ontick: ListenerList<TickEvent> = new ListenerList();

    constructor(map?: TickListeners) {
        super();
        if (map != undefined)
            this.copy(map);
    }

    clone(): TickListeners {
        return new TickListeners(this);
    }

    copy(other: TickListeners): this {
        this.ontick = other.ontick.clone();
        return this;
    }

    addEventListener(eventType: TickEventType, callback: TickEvent) {
        this.ontick.push(callback);
    }

    trigger(actor: any, eventType: TickEventType, ...argArray: any[]) {
        const delta = argArray.length >= 1 ? argArray[0] : 1.0;
        this.ontick.forEach(event => {
            event.prog += delta;
            if (event.prog >= event.interval) {
                event.prog = 0;
                event.repeat--;
                event.call(actor, event);
                
            }
        });
        this.ontick.filter((event)=>(event.repeat != 0));
    }
}

class InteractiveListeners extends TickListeners {

    mousedown:  ListenerList<MouseCallBack> = new ListenerList();
    mouseup:    ListenerList<MouseCallBack> = new ListenerList();
    mousemove:  ListenerList<MouseCallBack> = new ListenerList();
    mouseenter: ListenerList<MouseCallBack> = new ListenerList();
    mouseleave: ListenerList<MouseCallBack> = new ListenerList();
    wheel: ListenerList<MouseCallBack> = new ListenerList();

    keydown: ListenerList<KBCallBack> = new ListenerList();
    keypress: ListenerList<KBCallBack> = new ListenerList();
    keyup: ListenerList<KBCallBack> = new ListenerList();

    clone(): InteractiveListeners {
        return new InteractiveListeners(this);
    }

    addEventListener(eventType: StageIntEventType, listener: any) {
        this[eventType].push(listener);
    }

    trigger(actor: any, eventType: StageIntEventType, ...argArray: any[]) {
        if (eventType == "ontick") {
            super.trigger(actor, EVENTYPE.ONTICK, ...argArray);
        } else {
            (this[eventType] as ListenerList<MouseCallBack>).trigger(actor,...argArray);
        }
    }

    addBehavior(behavior: MouseEventBehavior) {
        if (behavior.bhvname in this) this.removeBehavior(behavior.bhvname);
        for (const key in behavior) {
            if (key in this) {
                
                this[key].push(behavior[key]);
            }
        }
        this[behavior.bhvname] = behavior;
    }

    removeBehavior(behvrName: string) {
        if (behvrName in this) {
            const behvr = this[behvrName];
            for (const key in behvr) {
                if (key in this) 
                    this[key] = this[key].filter((elem)=>(elem != behvr[key]));
            }
            delete this[behvrName];
        }
    }

    static BEHAVIOR_DRAGGABLE: MouseEventBehavior = {
        bhvname: "draggable",
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

class Object2D extends SObject implements Renderable, Object2DProperties, Polymorphistic {
    ID: number;

    frame: Rect2D;

    pos: Vector2D;
    scale: Vector2D;
    stret: Vector2D;
    rot: Rotation2D;
    transf: ContextTransf;
    graphics: Graphics2D; 

    fillColor: Color;
    borderColor: Color; 
    emissiveColor: Color; 

    emissive: number = 0.0;
    borderWidth: number = 0.0;
    visible: boolean = true;

    listeners: TickListeners;
    states: StateMap<Object2DProperties> | undefined;

    debug: boolean = false;

    constructor( parameters: Object2DProperties = {} , assign = DATA_IDEN) {
        super();
        this.initialize(parameters, Object2D.DEF_PROP, assign);
    }

    initialize( parameters: Object2DProperties = {}, 
        def: Object2DProperties = Object2D.DEF_PROP, 
        assign: DataAssignType = DATA_IDEN): this 
    {
        //Prevent init
        if (assign == DATA_UNINIT) return this;
        Object2D.ObjectList?.push(this);
        if (this.class != "Object2D") {
            this.constructor["ObjectList"]?.push(this);
        }

        super.initialize(parameters, def, assign);

        this.ID = this.constructor["CUM_INDEX"];
        this.constructor["CUM_INDEX"]++;
        return this;
    }

    updateValues(values: Object2DProperties, assign: DataAssignType = ASN_DEF): this {
        super.updateValues(values, assign);
        //Linking
        if (values.transf != undefined) {
            this.resolve("transf", ContextTransf);
            this.pos = this.transf.trans;
            this.rot = this.transf.rot;
            this.stret = this.transf.scale;
        } else {
            this.transf = new ContextTransf(this, DATA_IDEN);
        }
        if (this.states?.currentState == 0) this.states.bind(this);
        return this;
    }

    resolveAll(other: Object2DProperties = this): this {
        SObject.resolve(other,"pos", Vector2D);
        SObject.resolve(other,"rot", Rotation2D);
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

    get name(): string {
        return this.class + "_" + this.ID;
    }

    get x(): number {
        return this.pos.x;
    }

    set x(value: number) {
        this.pos.x = value;
    }

    get y(): number {
        return this.pos.y;
    }

    set y(value: number) {
        this.pos.y = value;
    }

    get width(): number {
        return this.graphics.bound.width * this.scale.x * this.stret.x;
    }

    set width(value: number) {
        this.scale.x = value / this.graphics.bound.width / this.stret.x;
    }

    get height(): number {
        return this.graphics.bound.height * this.scale.y * this.stret.y;
    }

    set height(value: number) {
        this.scale.y = value / this.graphics.bound.height / this.stret.y;
    }


    get bound(): Rect2D {
        return this.graphics.bound.clone().scale(this.scale);
    }

    get innerBound(): Rect2D {
        return this.graphics.bound;
    }

    moveTo(x: number = 0, y: number = 0): this {
        this.pos.moveTo(x,y);
        return this;
    }

    resize(width: number | Vector2D = this.width, height: number = this.height): this {
        if (width instanceof Vector2D) {
            this.width = width.x;
            this.height = width.y;
        } else {
            this.width = width;
            this.height = height;
        }
        return this;
    }

    reframe(frame: Rect2D): this {
        if (frame == undefined) return this;

        return this;
    }

    copy(other: Object2DProperties): this {
        const ID = this.ID;
        super.copy(other);
        this.ID = ID;
        return this;
    }

    copyStyle(other: RenderableProperties) {
        this.copy(SObject.subset(other,
            ["graphics", "fillColor", "borderColor", "emissiveColor", 
            "emissive", "borderWidth", "visible"]
        ));
    }

    clone(): Object2D {
        return new Object2D(this, DATA_CLONE);
    }

    addState(stateOrKey: Object2DProperties | Numerizable, state?: Object2DProperties): void {
        if (this.states == undefined) this.states = new StateMap().bind(this);
        if (typeof stateOrKey == "object") 
            this.states.push(stateOrKey);
        else 
            this.states.put(stateOrKey, state);
    }

    refresh(): this {
        if (this.states != undefined) 
            this.updateValues(this.states.fetch(), DATA_IDEN);
        return this;
    }

    switchTo(key: Numerizable) {
        if (key != undefined && this.states != undefined && key in this.states) 
            this.updateValues(this.states.swtichTo(key), DATA_IDEN);
    }

    toggle(): this {
        if (this.states != undefined) {
            this.updateValues(this.states.toggle(), DATA_IDEN);
        }
        return this;
    }

    restore() {
        this.updateValues(this.states[0], DATA_IDEN);
    }

    isInside(x: number, y: number, ctx: CanvasRenderingContext2D): boolean {
        let res;
        ctx.save();
        this.transform(ctx);
        res = ctx.isPointInPath(this.graphics.scaledPath(this.scale), x, y);
        ctx.restore();
        return res;
    }

    isInBound(x: number, y: number, ctx: CanvasRenderingContext2D): boolean {
        let res;
        ctx.save();
        this.transform(ctx);
        res = ctx.isPointInPath(this.graphics.boundPath, x, y);
        ctx.restore();
        return res;
    }

    transform<T>(ctxOrPos: T): T {
        if (ctxOrPos instanceof Vector2D) {
            this.transf.apply(ctxOrPos);
        } else if (ctxOrPos instanceof CanvasRenderingContext2D) {
            this.transf.transform(ctxOrPos);
        }
        return ctxOrPos;
    }

    tick(ctx: CanvasRenderingContext2D, delta: number = 1) {
        this.update(delta);
        this.render(ctx);
    }
    
    update(delta: number = 1.0) {
        this.listeners?.trigger(this, EVENTYPE.ONTICK, delta);
    } 

    render(ctx: CanvasRenderingContext2D = Object2D.DefaultContext) {
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
            this.scale,
            this.borderWidth != 0 && this.borderColor != undefined, 
            this.fillColor != undefined, 
        );

        if (this.debug) {
            ctx.strokeStyle = "red";
            ctx.lineWidth = 2;
            this.graphics.renderBound(ctx, this.scale, true, false);
        }
        
        ctx.restore();
    }

    addTickEventListener(listener: TickCallBack, settings: TickEventProperties = {}): TickEvent {
        const event = Object.assign(listener, Object2D.DEF_TICKEVENTPROP);
        this.listeners.addEventListener(EVENTYPE.ONTICK, Object.assign(event, settings));
        return event;  
    }

    temporify(life: number = 100): void {
        this.addTickEventListener(this.finalize, {
            eventName: "finalizeCountDown",
            interval: life
        });
    }

    animate(propText: string, data: any[], interval: number=1, type: AnimationType = "derive"): TickEvent {
        let attr = this.access(propText);
        if (attr == undefined) return undefined;
        let tickfunc = Animation[type](attr,data);
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


    finalize(): void {
        Object2D.ObjectList?.splice(Object2D.ObjectList.indexOf(this), 1);
        if (this.class != "Object2D") {
            const clsObjList: Array<typeof this> = this.constructor["ObjectList"];
            clsObjList?.splice(clsObjList.indexOf(this), 1);
        }
    }

    toString(): string {
        return `<Object2D:${this.name}>`;
    }

    //Statics
    static ObjectList: Object2D[] = undefined;
    static DefaultContext: CanvasRenderingContext2D = undefined;
    static CUM_INDEX: number = 0;

    static DEF_PROP: Object2DProperties = {
        frame: undefined,
        pos: new Vector2D(),
        scale: new Vector2D(1,1),
        stret: new Vector2D(1,1),
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

    static DEF_TICKEVENTPROP: TickEventProperties = {
        eventName: "unknow",
        prog: 0,
        interval: 100,
        repeat: -1,
    }

}

class StageObject extends Object2D implements StageObjectProperties {

    components: Object2D[] = [];
    innerTransf: ContextTransf;
    mainBody: boolean = true;
    declare states: StateMap<StageObjectProperties>;

    constructor( parameters: StageObjectProperties = {} , assign: DataAssignType = DATA_IDEN) {
        super({}, DATA_UNINIT);
        this.initialize(parameters, StageObject.DEF_PROP, assign);
    }

    set pivot(value: Vectorizable) {
        this.innerTransf.trans =  new Vector2D(value).scaleXY(this.width, this.height);
    }

    add(comp: Object2D): this {
        this.components.push(comp);
        return this;
    }

    clone(): StageObject {
        return new StageObject(this, DATA_CLONE);
    }

    toInternal<T>(ctxOrPos: T): T {
        if (ctxOrPos instanceof Vector2D) {
            this.transf.apply(ctxOrPos);
            this.innerTransf.apply(ctxOrPos);
        } else if (ctxOrPos instanceof CanvasRenderingContext2D) {
            this.transf.transform(ctxOrPos);
            this.innerTransf.transform(ctxOrPos);
        }
        return ctxOrPos;
    }

    refresh(): this {
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
        super.refresh();
        return this;
    }

    update(delta: number = 1): void {
        super.update(delta);
        // Components Update
        this.components.forEach(comp => {
            comp.update(delta);
        });
    }

    render(ctx: CanvasRenderingContext2D = Object2D.DefaultContext, ...coRender: Renderable[]) {
        if (this.mainBody) super.render(ctx);

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

    isInGroup(x: number, y: number, ctx: CanvasRenderingContext2D = Object2D.DefaultContext): boolean {
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

    static DEF_PROP: StageObjectProperties = SObject.insertValues({
        mainBody: true,
        innerTransf: new ContextTransf(),
        states: undefined
    }, Object2D.DEF_PROP, DATA_CLONE);

    static ObjectList: StageObject[] = undefined;
    static CUM_INDEX: number = 0;
}


class StageInteractive extends StageObject implements StageInteractiveProperties {
    isMouseIn: boolean = false;
    listeners: InteractiveListeners;
    declare states: StateMap<StageInteractiveProperties>;
    
    constructor( parameters: StageInteractiveProperties = {}, assign: DataAssignType = DATA_IDEN) {
        super({}, DATA_UNINIT);
        this.initialize(parameters, StageInteractive.DEF_PROP, assign);
        if (StageInteractive.CanvasDOM != undefined) 
            this.bindMouseEvents(StageInteractive.CanvasDOM);
    }

    get draggable(): boolean {
        return "draggable" in this.listeners;
    }

    clone(): StageInteractive {
        return new StageInteractive(this, DATA_CLONE);
    }

    resolveAll(other: StageInteractiveProperties = this): this {
        super.resolveAll(other);
        return this;
    }

    set draggable(value: boolean) {
        if (value) 
            this.listeners.addBehavior(InteractiveListeners.BEHAVIOR_DRAGGABLE);
        else {
            this.listeners.removeBehavior("draggable");
        }
    }

    bindKeyboardEvents(): this {
        window.addEventListener(EVENTYPE.KEYDOWN, this.updateKeyBoardInfo.bind(this));
        window.addEventListener(EVENTYPE.KEYPRESS, this.updateKeyBoardInfo.bind(this));
        window.addEventListener(EVENTYPE.KEYUP, this.updateKeyBoardInfo.bind(this));
        return this;
    }

    bindMouseEvents(canv: HTMLCanvasElement): this {
        let ctx = /** @type {CanvasRenderingContext2D} */canv.getContext("2d");
        canv.addEventListener(EVENTYPE.MOUSEDOWN, this.updateMouseInfo.bind(this,ctx));
        canv.addEventListener(EVENTYPE.MOUSEUP, this.updateMouseInfo.bind(this,ctx));
        canv.addEventListener(EVENTYPE.MOUSEMOVE, this.updateMouseInfo.bind(this,ctx));
        canv.addEventListener(EVENTYPE.MOUSEWHEEL,this.updateMouseInfo.bind(this,ctx));
        return this;
    }

    addMouseEventListener(eventType: MouseEventType, listener: MouseCallBack): this {
        this.listeners.addEventListener(eventType, listener);  
        return this;
    }

    addKeyBoardListener(eventType: KeyBoardEventType, listener: KBCallBack): this {
        this.listeners.addEventListener(eventType, listener);
        return this;
    }

    isInsideInteracting(): boolean {
        for(let i = 0; i < this.components.length; i++) {
            const comp = this.components[i];
            if (comp instanceof StageInteractive && comp.isMouseIn) 
                return true;
        }
        return false;
    }

    onKeyDown(event: KeyboardEvent) {
        this.listeners.trigger(this, EVENTYPE.KEYDOWN, event);
    }

    onKeyPress(event: KeyboardEvent) {
        this.listeners.trigger(this, EVENTYPE.KEYPRESS, event);
    }

    onKeyUp(event: KeyboardEvent) {
        this.listeners.trigger(this, EVENTYPE.KEYUP, event)
    }
    
    onMouseEnter(event: ContextMouseEvent) {
        this.listeners.trigger(this, EVENTYPE.MOUSEENTER, event);
    }

    onMouseLeave(event: ContextMouseEvent){
        this.listeners.trigger(this, EVENTYPE.MOUSLEAVE, event);
    }

    onMouseMove(event: ContextMouseEvent) {
        this.listeners.trigger(this, EVENTYPE.MOUSEMOVE, event);
    }

    onMouseDown(event: ContextMouseEvent) {
        this.listeners.trigger(this, EVENTYPE.MOUSEDOWN, event);
    }

    onMouseUp(event: ContextMouseEvent) {
        this.listeners.trigger(this, EVENTYPE.MOUSEUP, event);
    }

    onMouseWheel(event: ContextMouseEvent) {
        this.listeners.trigger(this, EVENTYPE.MOUSEWHEEL, event);
    }

    updateMouseInfo(ctx: CanvasRenderingContext2D = Object2D.DefaultContext, event: ContextMouseEvent | MouseEventInfo) {
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
                case EVENTYPE.MOUSEDOWN: { 
                    this.onMouseDown(event); 
                    //console.log(this.name + " " + event.info.type);
                    break; 
                    
                }
                case EVENTYPE.MOUSEUP : { this.onMouseUp(event); break;}
                case EVENTYPE.MOUSEMOVE : { this.onMouseMove(event); break;} 
                case EVENTYPE.MOUSEWHEEL : { this.onMouseWheel(event); break;}
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

    updateKeyBoardInfo(event: KeyboardEvent) {
        switch (event.type) {
            case EVENTYPE.KEYDOWN: { this.onKeyDown(event); break; }
            case EVENTYPE.KEYPRESS : { this.onKeyPress(event); break;}
            case EVENTYPE.KEYUP : { this.onKeyUp(event); break;} 
        }
        this.components.forEach(comp => {
            if (comp instanceof StageInteractive) {
                comp.updateKeyBoardInfo(event);
            }
        });
    }

    static CUM_INDEX: number = 0;
    static ObjectList: StageInteractive[] = [];
    static CanvasDOM: HTMLCanvasElement = undefined;
    static DEF_PROP: StageInteractiveProperties = SObject.insertValues({
        listeners: new InteractiveListeners(),
        states: undefined
    }, StageObject.DEF_PROP, DATA_CLONE);
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
    //static DEF_GRAPHICS = new Graphics2D("square");
    static DEF_LIFE = -100;
}