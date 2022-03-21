/*jshint esversion: 6 */
// @ts-check
import { Color, ColorStates } from "./ColorLib.js";
import { Vector2D } from "./Vector2D.js";
import { Rotation2D } from "./Rotation2D.js";
import { Graphics2D, GraphicsText } from "./Graphics2D.js";

export class ContextTransf {
    /** @type {Vector2D} */ trans;
    /** @type {Vector2D} */ scale;
    /** @type {Rotation2D}   */ rot;

    /**
     * Translation
     * @param {Vector2D} trans 
     * Rotation
     * @param {Rotation2D} rot 
     * Scale
     * @param {Vector2D} scale 
     */
    constructor(trans=new Vector2D(0.0,0.0),rot=new Rotation2D(0.0),scale=new Vector2D(1.0,1.0)) {
        this.trans = trans;
        this.rot = rot;
        this.scale = scale;
    }

    /**
     * 
     * @param {ContextTransf} other 
     * @returns 
     */
    copy(other=undefined) {
        if (other == undefined) {
            return new ContextTransf(this.trans.copy(), this.rot.copy(), this.scale.copy());
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
}

export class ContextMouseEvent {
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


export const DEF_TRANSF = new ContextTransf();

export class SceneObject {
    /** @type {Vector2D} Postion*/ pos;
    /** @type {Vector2D} Scale */  scale;
    /** @type {Vector2D} Stretch*/ stret;
    /** @type {Rotation2D} Rotation*/  rot;
    /** @type {ContextTransf} Transf*/ transf;
    /** @type {ContextTransf} Transf*/ innerTransf = DEF_TRANSF;
    /** @type {Graphics2D | GraphicsText} Graphics */ graphics; 
    /** @type {Number} Life Span*/ life; 
    
    /** @type {Color | ColorStates} Fill Color*/     fillColor;
    /** @type {Color | ColorStates} Border Color*/   borderColor; 
    /** @type {Color | ColorStates} Emission Color*/ emissiveColor; 

    /** @type {Number} Emi Strength*/ emissive = 0.0;
    /** @type {Number} Border Width*/ borderWidth;
    /** @type {boolean} If Fill*/     fillGraphics = true;
    /** @type {boolean} Visibility*/  visible = true;

    /** @type {Array<SceneObject>} */ components = [];

    /**
     * Scene Object Constructor
     * -Position
     * @param {Number} x 
     * @param {Number} y 
     * -Rotation
     * @param {Rotation2D | number} rot 
     * -Scaling
     * @param {Vector2D | string} scale 
     * -fill Color
     * @param {Color | string} fillColor 
     * -Border Color
     * @param {Color | string} borderColor 
     * -Border Width
     * @param {number} borderWidth 
     * -graphics
     * @param {Graphics2D | string} graphics 
     * -Life Span
     * @param {number} life 
     */
    constructor(x=0,y=0,rot=SceneObject.DEF_ROTATION,
        scale=SceneObject.DEF_SCALE.copy(),
        fillColor=SceneObject.DEF_FILLCOLOR.copy(),
        borderColor=SceneObject.DEF_BORDEDR_COLOR.copy(),
        borderWidth=SceneObject.DEF_BORDER_WIDTH,
        graphics=SceneObject.DEF_GRAPHICS,life=SceneObject.DEF_LIFE) 
    {
        this.pos = new Vector2D(x,y);
        this.rot = (rot instanceof Rotation2D ? rot : new Rotation2D(rot))  ;
        this.scale = (scale instanceof Vector2D ? scale : new Vector2D(scale));
        this.stret = new Vector2D(1.0,1.0);
        //Refering T R S
        this.transf = new ContextTransf(this.pos,this.rot,this.stret);
        this.graphics = (graphics instanceof Graphics2D ? graphics : new Graphics2D(graphics));
        this.borderWidth = borderWidth;
        this.life = life;
        this.fillColor = (typeof fillColor == "object" ? fillColor : new Color(fillColor));
        this.borderColor = (typeof borderColor == "object" ? borderColor : new Color(borderColor));
    }

    /**
     * Test if point is inside Object
     * @param {number} x 
     * @param {number} y 
     * @param {CanvasRenderingContext2D} ctx 
     * @returns {boolean}
     */
    isInGroup(x,y,ctx=SceneObject.DefaultContext) {
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

    /**
     * Test if point is inside Object
     * @param {number} x 
     * @param {number} y 
     * @param {CanvasRenderingContext2D} ctx 
     * @returns {boolean}
     */
    isInside(x,y,ctx=SceneObject.DefaultContext) {
        ctx.save();
        this.transform(ctx);
        ctx.beginPath();
        this.graphics.tracePath(ctx,this.scale);
        ctx.closePath();
        ctx.restore();
        return ctx.isPointInPath(x, y);
    }

    //Rendering
    transform(ctx) {
        this.transf.transform(ctx);
    }

    /**
     * 
     * @param {CanvasRenderingContext2D} ctx 
     */
    toInternal(ctx) {
        this.innerTransf.transform(ctx);
    }
    
    /**
     * Rendering Object to Canvas
     * @param {CanvasRenderingContext2D} ctx 
     * @returns 
     */
    render(ctx=SceneObject.DefaultContext) {
        if (!this.visible) return;
        ctx.save();
        this.transform(ctx);

        //Render Self
        //if (this.graphics != "group" && this.graphics != "text") 
        if (this.emissive > 0) {
            ctx.shadowBlur = this.emissive;
            ctx.shadowColor = this.emissiveColor.toString();
        }

        ctx.fillStyle = this.fillColor.toString();
        ctx.strokeStyle = this.borderColor.toString();
        ctx.lineWidth = this.borderWidth;
        this.graphics.render(ctx,this.borderWidth!=0, this.fillGraphics,this.scale);
        
        //Render Components
        this.toInternal(ctx);
        this.components.forEach(comp => {
            comp.render(ctx);
        });
        
        ctx.restore();
    }
    
    /**
     * Update Data in Object
     * @param {Number} delta 
     * @returns {void}
     */
    update(delta=1) {
        this.life -= 1 * delta;
        if (this.life <= 0 && this.life > -50) {
            this.finalize();
            return;
        }
        // Components Update
        this.components.forEach(comp => {
            comp.update(delta);
        });
    } 

    finalize() {
        if (SceneObject.ObjectList != undefined)
            SceneObject.ObjectList.splice(SceneObject.ObjectList.indexOf(this), 1);
    }

    //Statics
    static ObjectList = undefined;
    static DefaultContext = undefined;

    static DEF_ROTATION = new Rotation2D(0.0);
    static DEF_SCALE = new Vector2D(1,1);
    static DEF_FILLCOLOR = new Color("white");
    static DEF_BORDEDR_COLOR = new Color("black");
    static DEF_BORDER_WIDTH = 3;
    static DEF_GRAPHICS = new Graphics2D("square");
    static DEF_LIFE = -100;

}

export class SceneInteractive extends SceneObject {
    /** @type {boolean} Mouse Event State flag*/ isMouseIn = false;

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
    constructor(x=0,y=0,rot=SceneInteractive.DEF_ROTATION.copy(),
        scale=SceneInteractive.DEF_SCALE.copy(),
        fillColor=SceneInteractive.DEF_FILLCOLOR.copy(),
        borderColor=SceneInteractive.DEF_BORDEDR_COLOR.copy(),
        borderWidth=SceneInteractive.DEF_BORDER_WIDTH,
        graphics=SceneInteractive.DEF_GRAPHICS,life=SceneInteractive.DEF_LIFE) 
    {
        super(x,y,rot,scale,fillColor,borderColor,borderWidth,graphics,life);
    }

    //Binding Canvas
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
    updateMouseInfo(ctx=SceneObject.DefaultContext,event) {
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
            this.toInternal(ctx);
            this.components.forEach(comp => {
                if (comp instanceof SceneInteractive)
                    comp.updateMouseInfo(ctx,event);
            });
        }
        ctx.restore();
    }

    //Statics

    /** @type {[MouseEvent,Vector2D,Vector2D]} */
    static MouseInfo = undefined;

    static DEF_ROTATION = new Rotation2D(0.0);
    static DEF_SCALE = new Vector2D(1,1);
    static DEF_FILLCOLOR = new Color("white");
    static DEF_BORDEDR_COLOR = new Color("black");
    static DEF_BORDER_WIDTH = 3;
    static DEF_GRAPHICS = new Graphics2D("square");
    static DEF_LIFE = -100;
}

export class SceneDraggable extends SceneInteractive {
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
    constructor(x=0,y=0,rot=SceneInteractive.DEF_ROTATION.copy(),
        scale=SceneDraggable.DEF_SCALE.copy(),
        fillColor=SceneDraggable.DEF_FILLCOLOR.copy(),
        borderColor=SceneDraggable.DEF_BORDEDR_COLOR.copy(),
        borderWidth=SceneDraggable.DEF_BORDER_WIDTH,
        graphics=SceneDraggable.DEF_GRAPHICS,life=SceneDraggable.DEF_LIFE) 
    {
        super(x,y,rot,scale,fillColor,borderColor,borderWidth,graphics,life);
        this.draggable = SceneDraggable.DEF_DRAGGABLE;
        this.dragLevel = SceneDraggable.dragLevelIndex;
        SceneDraggable.dragLevelIndex++;
    }

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

export class SceneDynamic extends SceneInteractive {
    /** @type {Vector2D} */ vel;
    /** @type {Color} */ tColor;

    //Debug
    velRay = false;
    rotRay = false;
    traceOn = false; traceLmt = 100;
    tracePts = [];
    mass = 1;

    constructor(x=0,y=0,rot=SceneDynamic.DEF_ROTATION.copy(),
        velX=SceneDynamic.DEF_VELOCITY.x,velY=SceneDynamic.DEF_VELOCITY.y,
        scale=SceneDynamic.DEF_SCALE.copy(),
        fillColor=SceneDynamic.DEF_FILLCOLOR.copy(),
        borderColor=SceneDynamic.DEF_BORDEDR_COLOR.copy(),
        borderWidth=SceneDynamic.DEF_BORDER_WIDTH,
        graphics=SceneDynamic.DEF_GRAPHICS,life=SceneDynamic.DEF_LIFE) 
    {
        super(x,y,rot,scale,fillColor,borderColor,borderWidth,graphics,life);
        this.vel = new Vector2D(velX,velY);
    }

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