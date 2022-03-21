// @ts-nocheck
/* jshint -W069, esversion:6 */


// External Lib
import { Vector2D } from "../lib/Vector2D.js";
import { CoordSystem } from "../lib/CoordinateSystem.js";
import { SceneObject } from "../lib/SceneObject.js";
import { Color } from "../lib/ColorLib.js";
import { Rotation2D } from "../lib/Rotation2D.js";
import { Graphics2D, GraphicsText } from "../lib/Graphics2D.js";
import { CanvasButton, CanvasLabel } from "../lib/CanvasUIComponents.js";

let canvas = /** @type {HTMLCanvasElement} */ (document.getElementById("mainCanvas"));
if (!(canvas instanceof HTMLCanvasElement))
    throw new Error("Canvas is not HTML Element");
let ctx = /** @type {CanvasRenderingContext2D} */canvas.getContext("2d");
//let context = canvas.getContext("2d");
let crdsys = new CoordSystem(canvas.width,canvas.height).bindMouseEvent(canvas);
/** @type {Array<SceneObject>} */ let objList = [];

function Render() {
    
    crdsys.update(ctx);
    crdsys.render(ctx);
    objList.forEach(obj => {
        obj.update();
        obj.render(ctx);
    });

    window.requestAnimationFrame(Render);
}

function resizeCanvas() {
    let box = canvas.getBoundingClientRect();
    canvas.width = window.innerWidth - box.left * 2;
    canvas.height = window.innerHeight - box.top * 2;
    crdsys.resize(canvas.width,canvas.height);
    console.clear();
    console.log(new Vector2D(window.innerWidth,window.innerHeight));
}

function start() {
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    //objList.push(new SceneObject(200,200,45,"1,1","blue","yellow",5,"heart"));
    crdsys.components.push(new CanvasButton(200,100,"Nope").
    addMouseEventListener("mouseup", function () {this.draggable = true;}));
    //crdsys.components.push(new CanvasLabel(300,300));
    //console.log(objList[1].borderColor);
    //Image
    let backImg = new Image();
    backImg.src = "https://pages.cs.wisc.edu/~zhiyuan/background.jpg";

    window.requestAnimationFrame(Render);
}

start();
