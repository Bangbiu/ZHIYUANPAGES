/*jshint esversion: 6 */
// @ts-check
import { Color, ColorStates } from "./ColorLib.js";
import { Vector2D } from "./Vector2D.js";
import { Rotation2D } from "./Rotation2D.js";
import { Graphics2D } from "./Graphics2D.js";

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

    //Statics
    static DEF_TRANSF = new ContextTransf();
}



export class SceneObject {
    /** @type {Vector2D} Postion*/ pos;
    /** @type {Vector2D} Scale */  scale;
    /** @type {Vector2D} Stretch*/ stret;
    /** @type {Rotation2D} Rotation*/  rot;
    /** @type {ContextTransf} Transf*/ transf;
    /** @type {Graphics2D} Graphics */ graphics; 
    /** @type {Number} Life Span*/ life; 
    
    /** @type {Color | ColorStates} Fill Color*/     fColor;
    /** @type {Color | ColorStates} Border Color*/   bColor; 
    /** @type {Color | ColorStates} Emission Color*/ eColor; 

    /** @type {Number} Emi Strength*/ emis = 0.0;
    /** @type {Number} Border Width*/ bWidth;
    /** @type {boolean} If Fill*/     fillGraphics = true;
    /** @type {boolean} If Border*/   borderVisible = true;
    /** @type {boolean} Visibility*/  visible = true;

    /** @type {Array<SceneObject>} */ components = [];

    /**
     * Scene Object Constructor
     * -Position
     * @param {Number} x 
     * @param {Number} y 
     * -Rotation
     * @param {Rotation2D} rot 
     * -Scaling
     * @param {Vector2D} scale 
     * -fill Color
     * @param {Color} fillColor 
     * -Border Color
     * @param {Color} bColor 
     * -Border Width
     * @param {Number} bWidth 
     * -graphics
     * @param {Graphics2D} graphics 
     * -Life Span
     * @param {Number} life 
     */
    constructor(x=0,y=0,rot=SceneObject.DEF_ROTATION,
        scale=SceneObject.DEF_SCALE.copy(),
        fillColor=SceneObject.DEF_FILLCOLOR.copy(),
        bColor=SceneObject.DEF_BORDEDR_COLOR.copy(),
        bWidth=SceneObject.DEF_BORDER_WIDTH,
        graphics=SceneObject.DEF_GRAPHICS,life=SceneObject.DEF_LIFE) 
    {
        this.pos = new Vector2D(x,y);
        this.rot = rot;
        this.scale = scale;
        this.stret = new Vector2D(1.0,1.0);
        //Refering T R S
        this.transf = new ContextTransf(this.pos,this.rot,this.stret);
        this.graphics = graphics;
        this.bWidth = bWidth;
        this.life = life;
        this.fColor = fillColor;
        this.bColor = bColor;
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
        if (ctx.isPointInPath(x, y)) {
            ctx.restore();
            return true;
        }

        let res = false;
        this.components.forEach(comp => {
            if (comp.isInside(x, y, ctx)) {
                res = true;
                return;
            }
        });
        ctx.restore();
        return res;
    }

    //Rendering
    transform(ctx) {
        this.transf.transform(ctx);
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

        //Render Components
        this.components.forEach(comp => {
            comp.render(ctx);
        });

        //Render Self
        //if (this.graphics != "group" && this.graphics != "text") 
        if (this.emis > 0) {
            ctx.shadowBlur = this.emis;
            ctx.shadowColor = this.eColor.toString();
        }
        ctx.fillStyle = this.fColor.toString();
        ctx.strokeStyle = this.bColor.toString();
        ctx.lineWidth = this.bWidth;
        this.graphics.render(ctx,this.borderVisible, this.fillGraphics,this.scale);
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
    /** @type {Vector2D} */ ctrlPt = undefined;

    /** @type {boolean} Mouse Event State flag*/ isMouseIn = false;
    /** @type {boolean} Draggable flag*/         draggable;
    /** @type {boolean} Co-Dragging flag*/       coDrag = true;

    constructor(x=0,y=0,rot=SceneInteractive.DEF_ROTATION.copy(),
        scale=SceneInteractive.DEF_SCALE.copy(),
        fillColor=SceneInteractive.DEF_FILLCOLOR.copy(),
        bColor=SceneInteractive.DEF_BORDEDR_COLOR.copy(),
        bWidth=SceneInteractive.DEF_BORDER_WIDTH,
        graphics=SceneInteractive.DEF_GRAPHICS,life=SceneInteractive.DEF_LIFE) 
    {
        super(x,y,rot,scale,fillColor,bColor,bWidth,graphics,life);
        this.draggable = SceneInteractive.DEF_DRAGGABLE;
    }

    //EventPlaceHolder
    /**
     * MouseEnter Event Handler
     * @param {[MouseEvent,Vector2D]} event 
     */
    onMouseEnter(event){
        this.isMouseIn = true;
    }

    /**
     * MouseLeave Event Handler
     * @param {[MouseEvent,Vector2D]} event 
     */
    onMouseLeave(event){
        this.isMouseIn = false;
    }

    /**
     * MouseMove Event Handler
     * @param {[MouseEvent,Vector2D]} event
     * @param {CanvasRenderingContext2D} ctx 
     * @returns {boolean}
     */
    onMouseMove(event,mousePos,ctx=SceneObject.DefaultContext) {
        let mtest = this.isInside(event[1].x,event[1].y, ctx);
        if (mtest && !this.isMouseIn) this.onMouseEnter(event);
        else if (!mtest && this.isMouseIn) this.onMouseLeave(event);
        if (this.ctrlPt != undefined && event[0].buttons > 0) {
            this.pos.copy(this.ctrlPt).reverse().add(mousePos);
        }
        return this.isMouseIn;
    }

    /**
     * MouseMove Event Handler
     * @param {[MouseEvent,Vector2D]} event 
     * @param {CanvasRenderingContext2D} ctx 
     */
    onMouseDown(event,mousePos,ctx=SceneObject.DefaultContext){
        this.onMouseMove(event,mousePos,ctx);
        if (this.isMouseIn) {
            this.ctrlPt = mousePos.minus(this.pos);
        }
    }

    /**
     * MouseMove Event Handler
     * @param {[MouseEvent,Vector2D]} event 
     * @param {CanvasRenderingContext2D} ctx 
     */
    onMouseUp(event,mousePos,ctx=SceneObject.DefaultContext){
        this.onMouseMove(event,mousePos,ctx);
        if (event[0].button == 0) {
            this.ctrlPt = undefined;
        }
    }

    /**
     * 
     * @param {CanvasRenderingContext2D} ctx 
     
    render(ctx=SceneObject.DefaultContext) {

    }
    */

    /**
     * 
     * @param {MouseEvent} event 
     * @returns {[MouseEvent,Vector2D]}
     */
     static parseMouseEvent(event) {
        let box = /** @type {HTMLCanvasElement} */ (event.target).getBoundingClientRect();
        let pos = new Vector2D(event.clientX-box.left, event.clientY-box.top);
        return [event,pos];
    }

    //Statics
    /** @type {[MouseEvent,Vector2D,Vector2D]} */
    static MouseTrack = undefined;

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
        bColor=SceneDynamic.DEF_BORDEDR_COLOR.copy(),
        bWidth=SceneDynamic.DEF_BORDER_WIDTH,
        graphics=SceneDynamic.DEF_GRAPHICS,life=SceneDynamic.DEF_LIFE) 
    {
        super(x,y,rot,scale,fillColor,bColor,bWidth,graphics,life);
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
        ctx.shadowBlur = this.emis;
        ctx.shadowColor = this.eColor.toString();
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