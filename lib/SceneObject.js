/*jshint esversion: 6 */
// @ts-check
import { Color } from "./ColorLib.js";
import { Vector2D } from "./Vector2D.js";
import { Rotation2D } from "./Rotation2D.js";

const shapePath = {
    "square": [[-50,-50],[50,-50],[50,50],[-50,50]],
    "trapezoid": [[-25,-50],[50,-50],[50,50],[-50,50]],
    "bullet": [[0,-35],[20,20],[0,0],[-20,20]],
    "missle": [[0,-90],[40,-55],[30,50],[40,105],[-40,105],[-30,50],[-40,-55]],
    "heart": [[0,-35],[35,-70],[70,-30],[0,50],[-70,-30],[-35,-70]]
}


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

export class CanvMouseEvt {
    button;buttons;
    /** @type {Vector2D} */ mousePos;
    /** @type {Vector2D} */ movement;
    /** @type {boolean} */  shiftKey;
    /** @type {boolean} */  altKey;
    /** @type {boolean} */  ctrlKey;

    /**
     * 
     * @param {MouseEvent} event 
     * @param {ContextTransf} transf 
     */
    constructor(event, transf) {
        let box = /** @type {HTMLCanvasElement} */ (event.target).getBoundingClientRect();
        this.button = event.button;
        this.buttons = event.buttons;
        this.mousePos = transf.apply(new Vector2D(event.clientX-box.left, event.clientY-box.top));
        this.movement = transf.apply(new Vector2D(event.movementX, event.movementY));
        this.shiftKey = event.shiftKey;
        this.altKey = event.altKey;
        this.ctrlKey = event.ctrlKey;
    }

    /**
     * @param {MouseEvent | CanvMouseEvt} event 
     * @returns {CanvMouseEvt}
     */
    static parseEvent(event, transf=new ContextTransf()) {
        if (event instanceof MouseEvent)
            return new CanvMouseEvt(event, transf);
        else 
            return event;
    } 
}

export class SceneObject {
    /** @type {Vector2D} Postion*/ pos;
    /** @type {Vector2D} Scale */  scale;
    /** @type {Vector2D} Stretch*/ stret;
    /** @type {Rotation2D} Rotation*/  rot;
    /** @type {ContextTransf} Transf*/ transf;
    /** @type {string} Shape */    shape; 
    /** @type {Number} Life Span*/ life; 
    
    /** @type {Color} Fill Color*/     fColor;
    /** @type {Color} Border Color*/   bColor; 
    /** @type {Color} Emission Color*/ eColor; 

    /** @type {Number} Emi Strength*/ emis = 0.0;
    /** @type {Number} Border Width*/ bWidth;
    /** @type {boolean} If Fill*/     fillShape = true;
    /** @type {boolean} If Border*/   strokeShape = true;
    /** @type {boolean} Visibility*/  visible = true;

    /** @type {boolean} Mouse Event State flag*/ isMouseIn

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
     * -Shape
     * @param {string} shape 
     * -Life Span
     * @param {Number} life 
     */
    constructor(x=0,y=0,rot=SceneObject.DEF_ROTATION,
        scale=SceneObject.DEF_SCALE.copy(),
        fillColor=SceneObject.DEF_FILLCOLOR.copy(),
        bColor=SceneObject.DEF_BORDEDR_COLOR.copy(),
        bWidth=SceneObject.DEF_BORDER_WIDTH,
        shape=SceneObject.DEF_SHAPE,life=SceneObject.DEF_LIFE) 
    {
        this.pos = new Vector2D(x,y);
        this.rot = rot;
        this.scale = scale;
        this.stret = new Vector2D(1.0,1.0);
        //Refering T R S
        this.transf = new ContextTransf(this.pos,this.rot,this.stret);
        this.shape = shape;
        this.bWidth = bWidth;
        this.life = life;
        this.fColor = fillColor;
        this.bColor = bColor;
    }

    //Events
    isInside(x,y,ctx) {
        ctx.save();
        this.transform(ctx);

        this.makePath(ctx);
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

    //EventPlaceHolder

    /**
     * MouseEnter Event Handler
     * @param {CanvMouseEvt} event 
     */
    onMouseEnter(event){}

    /**
     * MouseLeave Event Handler
     * @param {CanvMouseEvt} event 
     */
    onMouseLeave(event){}

    /**
     * MouseMove Event Handler
     * @param {CanvMouseEvt} event
     * @param {CanvasRenderingContext2D} ctx 
     */
    onMouseMove(event,ctx) {
        event = CanvMouseEvt.parseEvent(event);
        let mtest = this.isInside(event.mousePos.x,event.mousePos.y, ctx);
        if (mtest && !this.isMouseIn) this.onMouseEnter(event);
        else if (!mtest && this.isMouseIn) this.onMouseLeave(event);
        this.isMouseIn = mtest;
    }

    /**
     * MouseMove Event Handler
     * @param {CanvMouseEvt} event 
     */
    onMouseDown(event,ctx){}

    /**
     * MouseMove Event Handler
     * @param {CanvMouseEvt} event 
     */
    onMouseUp(event,ctx){}

    /**
     * Click Event Handler
     * @param {MouseEvent | CanvMouseEvt} event 
     */
    onClick(event,ctx){}

    //Rendering
    transform(ctx) {
        this.transf.transform(ctx);
    }

    makePath(ctx) {
        ctx.beginPath();
        switch (this.shape) {
            case "disc": {
                //Followed
            }
            case "ring": {
                ctx.arc(0, 0, 100, 0, Math.PI * 2);
                ctx.stroke();
                break;
            }
            default: {
                let path = shapePath[this.shape];
                //console.log(this.shape);
                path.forEach(pt => {
                    ctx.lineTo(pt[0] * this.scale.x, pt[1] * this.scale.y);
                });
            }
        } 
        ctx.closePath();
    }
    
    /**
     * Rendering Object to Canvas
     * @param {CanvasRenderingContext2D} ctx 
     * @returns 
     */
    render(ctx) {
        if (!this.visible) return;
        ctx.save();
        this.transform(ctx);

        //Render Components
        this.components.forEach(comp => {
            comp.render(ctx);
        });

        //Render Self
        //if (this.shape != "group" && this.shape != "text") 
        if (this.emis > 0) {
            ctx.shadowBlur = this.emis;
            ctx.shadowColor = this.eColor.toString();
        }
        this.makePath(ctx);
        if (this.strokeShape) {
            ctx.lineWidth = this.bWidth;
            ctx.strokeStyle = this.bColor.toString();
            ctx.stroke();
        }
        if (this.fillShape) {
            ctx.fillStyle = this.fColor.toString();
            ctx.fill();
        }

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

    static DEF_ROTATION = new Rotation2D(0.0);
    static DEF_SCALE = new Vector2D(1,1);
    static DEF_FILLCOLOR = new Color("white");
    static DEF_BORDEDR_COLOR = new Color("black");
    static DEF_BORDER_WIDTH = 3;
    static DEF_SHAPE = "square";
    static DEF_LIFE = -100;
}

export class SceneDynamic extends SceneObject {
    /** @type {Vector2D} */ vel;
    /** @type {Color} */ tColor;

    //Debug
    velRay = false;
    rotRay = false;
    traceOn = false; traceLmt = 100;
    tracePts = [];
    mass = 1;

    constructor(x=0,y=0,rot=SceneDynamic.DEF_ROTATION,
        velX=SceneDynamic.DEF_VELOCITY.x,velY=SceneDynamic.DEF_VELOCITY.y,
        scale=SceneDynamic.DEF_SCALE.copy(),
        fillColor=SceneDynamic.DEF_FILLCOLOR.copy(),
        bColor=SceneDynamic.DEF_BORDEDR_COLOR.copy(),
        bWidth=SceneDynamic.DEF_BORDER_WIDTH,
        shape=SceneDynamic.DEF_SHAPE,life=SceneDynamic.DEF_LIFE) 
    {
        super(x,y,rot,scale,fillColor,bColor,bWidth,shape,life);
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
    static DEF_SHAPE = "square";
    static DEF_LIFE = -100;
}