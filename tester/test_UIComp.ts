/*jshint esversion: ES2020 */
// @ts-check

import * as STG from "../StageModule/exporter.js";
import * as Types from "../StageModule/TypeUtil.js";


const renderList: Types.Renderable[] = [];
let ctx: CanvasRenderingContext2D;
let canv: HTMLCanvasElement;

/**
 * 
 * @param {HTMLCanvasElement} canvas
 */
export function setCanvas(canvas) {
    canv = canvas;
    ctx = /** @type {CanvasRenderingContext2D} */ (canvas.getContext("2d"));
}

export function run_CanvasLabel() {
    let obj1 = new STG.CanvasLabel({
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

export function run_CanvasButton() {

    STG.CanvasButton.ObjectList = (renderList as STG.CanvasButton[]);
    STG.StageInteractive.CanvasDOM = canv;

    let obj1 = new STG.CanvasButton({
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
        draggable: true,
        debug: true
    });

    obj2.msg("captionLabel.pos");

    obj1.addTickEventListener(
        function(ev) { this.rot.deg += 30; },
        {interval: 50, repeat: -1}
    );
    
    obj1.msg();
    obj2.msg();
    
    //renderList.push(obj1);
    //renderList.push(obj2);
    //console.log(renderList);
    renderList.forEach(element => {
        element["msg"]("name");
    });

    render();
    
}

export function run_Matrix() {
    STG.CanvasButton.ObjectList = (renderList as STG.CanvasButton[]);
    STG.StageInteractive.CanvasDOM = canv;

    let obj1 = new STG.CanvasButton({
        pos: [100,100], 
    });

    obj1.draggable = true;
    
    let obj2 = obj1.clone();
    //obj2.traverse(function(key,propName){console.log(propName);});
    obj1.listeners.clone().msg();

    obj2.moveTo(200,200);
    
    obj2.updateValues({
        pos: "200,200",
        transf: "300,300|45|1,1",
        fillColor: "red",
        borderColor: "black",
        borderWidth: 5,
        scale: "1.5,1.5",
    });
    
    
    //obj1.msg();
    //obj2.msg();
    
    /* renderList.forEach(element => {
        element["msg"]("name");
    }); */

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