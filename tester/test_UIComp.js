/*jshint esversion: ES2020 */
// @ts-check

import { Graphics2D } from "../tslib/Graphics2D.js";
import { Color, Vector2D } from "../tslib/Struct.js";
import { Animation } from "../tslib/Animation.js";
import { ContextTransf, Object2D, StageInteractive, StageObject } from "../tslib/Object2D.js";
import { CanvasButton, CanvasLabel } from "../tslib/CanvasUIComponents.js";
import { SObject } from "../tslib/DataUtil.js";

/** @type {import("../tslib/TypeUtil.js").Renderable[]} */
const renderList = [];
/** @type {CanvasRenderingContext2D} */
let ctx;
/** @type {HTMLCanvasElement} */
let canv;

/**
 * 
 * @param {HTMLCanvasElement} canvas
 */
export function setCanvas(canvas) {
    canv = canvas;
    ctx = /** @type {CanvasRenderingContext2D} */ (canvas.getContext("2d"));
}

export function run_CanvasLabel() {
    let obj1 = new CanvasLabel({
        text: "nope",
        pos: [100,100], 
        fontColor: "blue", 
        borderColor: "red", 
        scale: [5,5],
        debug: true
    });
    
    let obj2 = obj1.clone();

    obj2.updateValues({
        pos: "200,200",
        transf: "300,300|45|1,1",
        fillColor: "red",
        borderColor: "black",
        borderWidth: 5,
        scale: "2.5,2.5",
    });

    obj2.add(obj1);

    obj1.dispatchTickEvent(
        function(ev) { this.rot.rad+=0.1; },
        {interval: 5, repeat: -1}
    );
    obj1.log();
    obj2.log();

    renderList.push(obj1);
    renderList.push(obj2);

    render();
}

 export function run_CanvasButton() {

    CanvasButton.ObjectList = /** @type {CanvasButton[]} */ (renderList);
    StageInteractive.CanvasDOM = canv;

    let obj1 = new CanvasButton({
        pos: [100,100], 
    });

    //obj1.bindMouseEvents(canv);
    //obj1.addMouseEventListener("mouseleave", function(){this.log("states.def")});
    
    obj1.draggable = true;
    
    let obj2 = obj1.clone();

    obj2.moveTo(200,200);
    
    obj2.updateValues({
        pos: "200,200",
        transf: "300,300|45|1,1",
        graphics: "roundArea",
        fillColor: "red",
        borderColor: "black",
        borderWidth: 5,
        scale: "1.5,1.5",
        draggable: true
    });
    

    //obj2.bindMouseEvents(canv);


    obj1.dispatchTickEvent(
        function(ev) { this.rot.deg += 30; },
        {interval: 50, repeat: -1}
    );
    obj1.log();
    obj2.log();
    
    //renderList.push(obj1);
    //renderList.push(obj2);
    //console.log(renderList);
    renderList.forEach(element => {
        element["log"]("name");
    });

    render();
    
}



function render(timestamp) {
    ctx.clearRect(0,0,2000,2000);
    renderList.forEach(obj => {
        obj.update(1);
        obj.render(ctx);
    });
    window.requestAnimationFrame(render);
}