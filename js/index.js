// @ts-nocheck
/* jshint -W069, esversion:6 */


// External Lib
import { Vector2D } from "../lib/Vector2D.js";
import { CoordSystem } from "../lib/CoordinateSystem.js";
import { SceneObject } from "../lib/SceneObject.js";
import { Color } from "../lib/ColorLib.js";
import { Rotation2D } from "../lib/Rotation2D.js";

let canvas = /** @type {HTMLCanvasElement} */ (document.getElementById("mainCanvas"));
if (!(canvas instanceof HTMLCanvasElement))
    throw new Error("Canvas is not HTML Element");
let ctx = /** @type {CanvasRenderingContext2D} */canvas.getContext("2d");
//let context = canvas.getContext("2d");
let crdsys = new CoordSystem(canvas.width,canvas.height);
crdsys.bindMouseEvent(canvas);
// SceneObjects
/** @type {Array<SceneObject>} */ let objList = [];
let comp = new SceneObject(200,200,new Rotation2D(45),
    new Vector2D(1,1),new Color("blue"),new Color("yellow"),5,"heart");
objList.push(comp);
//Image
let backImg = new Image();
backImg.src = "https://pages.cs.wisc.edu/~zhiyuan/background.jpg";

function Render() {

    crdsys.render(ctx);
    //ctx.drawImage(backImg,0,0);
    //console.log(window.innerWidth);
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
    console.log(new Vector2D(window.innerWidth,window.innerHeight));
}

window.addEventListener("resize", resizeCanvas);
resizeCanvas();
window.requestAnimationFrame(Render);