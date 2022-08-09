/*jshint esversion: ES2020 */
// @ts-check

import { Graphics2D } from "../tslib/Graphics2D.js";
import { Color, Vector2D } from "../tslib/Struct.js";
import { Animation } from "../tslib/Animation.js";
import { ContextTransf, Object2D, StageInteractive, StageObject } from "../tslib/Object2D.js";

/** @type {import("../tslib/TypeUtil.js").Renderable[]} */
const renderList = [];
/** @type {CanvasRenderingContext2D} */
let ctx;

/**
 * 
 * @param {CanvasRenderingContext2D} context 
 */
export function setContext(context) {
    ctx = context;
}

export function run_Graphics2D() {
    
    let g = new Graphics2D([[100,100],[200,200],[100,200]]);
    g.log();
    ctx.fillStyle = new Color(255,0,0).value;
    g.render(ctx,false,true);
    
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
        borderWidth: 1
    });

    obj1.dispatchTickEvent(
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
        scale: "1.5,1.5"
    });
    
    obj1.log();
    obj2.log();


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

    obj1.dispatchTickEvent(
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
    
    obj1.log();
    obj2.log();

    //renderList.push(obj1);
    renderList.push(obj2);

    render();
    
}

export function run_StageInteractive() {
    let obj1 = new StageInteractive({
        pos: [100,100], 
        fillColor: "black", 
        borderColor: "red", 
        borderWidth: 1
    });

    

    obj1.dispatchTickEvent(
        function(ev){this.rot.rad+=0.1;},
        {interval: 10, repeat: -1}
    );

    console.log("gen");
    console.log("gen");
    console.log("gen");
    
    
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
    
    obj1.log();
    obj2.log();

    //renderList.push(obj1);
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