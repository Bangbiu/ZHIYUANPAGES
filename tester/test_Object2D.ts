import { Graphics2D } from "../StageModule/Graphics2D.js";
import { Color, Vector2D } from "../StageModule/Struct.js";
import { Animation } from "../StageModule/Animation.js";
import { ContextTransf, Object2D, StageInteractive, StageObject, PassiveListeners } from "../StageModule/Object2D.js";
import { Renderable } from "../StageModule/TypeUtil.js";

const renderList: Renderable[] = [];
let ctx: CanvasRenderingContext2D;
let canv: HTMLCanvasElement;

export function setCanvas(canvas: HTMLCanvasElement) {
    canv = canvas;
    ctx = (canvas.getContext("2d"));
}

export function run_Graphics2D() {
    
    let g = new Graphics2D([[100,100],[200,200],[100,200]]);
    ctx.fillStyle = new Color(255,0,0).value;
    g.render(ctx,new Vector2D(1,1),false,true);
    
}

export function run_ContextTransf() {
    
    
    let ctxtf = new ContextTransf("1,1|2|3,3");
    
    ctxtf.print();
    console.log(ctxtf.clone().trans == ctxtf.trans);

    ctxtf.add(ctxtf).print();
    //ctxtf.traverse(function(k,v){console.log(v);});
}


export function run_Object2D() {


    let obj1 = new Object2D({
        pos: [100,100], 
        fillColor: "black", 
        borderColor: "red", 
        borderWidth: 1,
        stret: [2,1],
        scale: [1,2]
    });

    

    obj1.addTickEventListener(
        function(ev){this.rot.rad+=0.1;},
        {interval: 10, repeat: -1}
    );

    let obj2 = obj1.clone();

    //obj1.log("tickEvents");

    console.log(obj1.pos == obj1.transf.trans);
    console.log(obj2.pos == obj1.pos);

    obj2.moveTo(200,200);
    
    obj2.updateValues({
        pos: "200,200",
        transf: "300,300|45|1,1",
        graphics: "roundArea",
        fillColor: "red",
        borderColor: "black",
        borderWidth: 5,
    });
    
    
    obj1.msg();
    obj2.msg();


    renderList.push(obj1);
    renderList.push(obj2);

    render();
    
}

export function run_StageObject() {
    let obj1 = new StageObject({
        pos: [100,100], 
        fillColor: "black", 
        borderColor: "red", 
        borderWidth: 1
    });

    obj1.addTickEventListener(
        function(ev){this.rot.rad+=0.1;},
        {interval: 10, repeat: -1}
    );

    let obj2 = obj1.clone();

    //obj1.log("tickEvents");

    console.log(obj1.pos == obj1.transf.trans);
    console.log(obj2.pos == obj1.pos);

    //obj2.moveTo(200,200);
    obj2.updateValues({
        pos: "200,200",
        transf: "300,300|45|1,1",
        graphics: "roundArea",
        fillColor: "red",
        borderColor: "black",
        borderWidth: 5,
        scale: "1.5,1.5",
        "tickEvents.0.interval": 1
    });

    obj2.add(obj1);
    //obj1.trySet("tickEvents.0.interval", 1);
    
    obj1.msg();
    obj2.msg();

    //renderList.push(obj1);
    renderList.push(obj2);

    render();
    
}

/**
 * 
 * @param {HTMLCanvasElement} canv 
 */
export function run_StageInteractive(canv) {
    let obj1 = new StageInteractive({
        pos: [100,100], 
        fillColor: "black", 
        borderColor: "red", 
        borderWidth: 1,
    });

    obj1.bindMouseEvents(canv);
    obj1.addState("press", {fillColor: new Color("blue")});
    obj1.addMouseEventListener("mousedown", function(){this.switchTo("press")});
    obj1.addMouseEventListener("mouseup", function(){this.restore()});
    
    obj1.draggable = true;
    
    let obj2 = obj1.clone();

    //obj2.moveTo(200,200);
    obj2.updateValues({
        pos: "200,200",
        transf: "300,300|45|1,1",
        graphics: "roundArea",
        fillColor: "red",
        borderColor: "black",
        borderWidth: 5,
        scale: "1.5,1.5",
    });

    obj2.bindMouseEvents(canv);

    obj2.add(obj1);

    obj1.addTickEventListener(
        function(ev) { this.rot.rad+=0.1; },
        {interval: 5, repeat: -1}
    );
    obj1.msg();
    obj2.msg();

    renderList.push(obj1);
    renderList.push(obj2);

    render();
}

export function run_StateSwitching() {
    let obj1 = new Object2D({
        pos: [100,100], 
        fillColor: "black", 
        borderColor: "red", 
        borderWidth: 1,
    });

    obj1.addState("nope", {fillColor: "red", borderColor: "purple", graphics: "heart"});
    obj1.switchTo("nope");

    let obj2 = obj1.clone();
    obj2.updateValues({
        pos: [300,300],
    })

    obj2.restore();
    obj2.addState("state3", {graphics: "disc", fillColor: "yellow"});

    obj2.addTickEventListener(
        function(ev){this.toggle()}, {interval: 50, repeat: -1}
    );

    //obj2.switchTo(0);

    obj1.msg();
    obj2.msg();
    
    renderList.push(obj1);
    renderList.push(obj2);

    render();
}


function render() {
    ctx.clearRect(0,0,2000,2000);
    renderList.forEach(obj => {
        obj.update(1);
        obj.render(ctx);
    });
    window.requestAnimationFrame(render);
}