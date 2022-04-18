// @ts-nocheck
/* jshint -W069, esversion:6 */


// External Lib
import * as TU from "../lib/TypeUtil.js";
import * as DU from "../lib/DataUtil.js";
import { Vector2D } from "../lib/Vector2D.js";
import { CoordSystem } from "../lib/CoordinateSystem.js";
import { ContextTransf, Object2D, StageObject } from "../lib/Object2D.js";
import { Color } from "../lib/ColorLib.js";
import { Rotation2D } from "../lib/Rotation2D.js";
import { Graphics2D, GraphicsText } from "../lib/Graphics2D.js";
import { CanvasButton, CanvasLabel } from "../lib/CanvasUIComponents.js";
import { Test } from "../lib/Test.js";

let canvas = /** @type {HTMLCanvasElement} */ (document.getElementById("mainCanvas"));
if (!(canvas instanceof HTMLCanvasElement))
    throw new Error("Canvas is not HTML Element");
let ctx = /** @type {CanvasRenderingContext2D} */canvas.getContext("2d");
//let context = canvas.getContext("2d");
//let crdsys = new CoordSystem(canvas.width,canvas.height).bindMouseEvent(canvas);
/** @type {Array<Object2D>} */ let objList = [];

let a = {value: 1};

function Render() {
    /*
    crdsys.update(ctx);
    crdsys.render(ctx);
    */
    
    ctx.clearRect(0,0,canvas.width,canvas.height);
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
    //crdsys.resize(canvas.width,canvas.height);
    console.clear();
    console.log(new Vector2D(window.innerWidth,window.innerHeight));
}

function start() {
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    //crdsys.components.push(new CanvasButton(200,100,"Nope").
    //addMouseEventListener("mouseup", function () {this.draggable = true;}));

    let testObj = new Object2D({x:100,y:120, fillColor:"blue", borderWidth:0});
    
    testObj.dispatchTickEvent(function(ev) {
        console.log(ev.repeat);
    },
    {repeat:-1});

    //testObj.animate("fillColor",10,[new Color("blue"),new Color("red")],"toggle");
    testObj.animate("pos.x",[1,1]);
    objList.push(testObj);

    //Image
    let backImg = new Image();
    backImg.src = "https://pages.cs.wisc.edu/~zhiyuan/background.jpg";

    window.requestAnimationFrame(Render);
}



start();
