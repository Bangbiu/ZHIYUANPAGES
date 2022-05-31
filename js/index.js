/*jshint esversion: 6 */
// @ts-check
// External Lib
import * as TU from "../lib/TypeUtil.js";
import * as DU from "../lib/DataUtil.js";
import { SObject } from "../lib/DataUtil.js";
import { Vector2D } from "../lib/Vector2D.js";
import { CoordSystem } from "../lib/CoordinateSystem.js";
import { ContextTransf, MouseEventMap, Object2D, StageInteractive, StageObject } from "../lib/Object2D.js";
import { Color, ColorStates } from "../lib/ColorLib.js";
import { Rotation2D } from "../lib/Rotation2D.js";
import { Graphics2D, GraphicsText } from "../lib/Graphics2D.js";
import { CanvasButton, CanvasContainer, CanvasInterativeComponent, CanvasLabel, InteractionColors } from "../lib/CanvasUIComponents.js";
import { Test } from "../lib/Test.js";

let canvas = /** @type {HTMLCanvasElement} */ (document.getElementById("mainCanvas"));
if (!(canvas instanceof HTMLCanvasElement))
    throw new Error("Canvas is not HTML Element");
let ctx = /** @type {CanvasRenderingContext2D} */canvas.getContext("2d");
//let context = canvas.getContext("2d");
//let crdsys = new CoordSystem(canvas.width,canvas.height).bindMouseEvent(canvas);
/** @type {Array<Object2D>} */ var objList = [];

function Render() {
    /*
    crdsys.update(ctx);
    crdsys.render(ctx);
    */
    //ctx.clearRect(0,0,canvas.width,canvas.height);
    ctx.fillRect(0,0,canvas.width,canvas.height);
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

    //console.log(SObject.clone(Object2D.DEF_PROP.graphics));

    let testObj = new CanvasButton({
        caption: "IDK",
        graphics: "roundArea",
        fontSize: 2,
        width: 200
    })
    //testObj.bindMouseEvent(canvas);
    //objList.push(testObj);

    let a = testObj.clone().copy({x:200}).bindMouseEvent(canvas);
    //console.log(testObj.mouseDispatches.actor);
    //console.log(a.mouseDispatches.actor);
    objList.push(a);

    objList.push(
        new CanvasContainer({
            x:300,y:300,
            width : 400,
            height : 400,
            components: [testObj,testObj.clone().copy({x:100})],
            draggable: true
        })
        .bindMouseEvent(canvas)
        .addMouseEventListener("mousedown",function(e){console.log(this.height);})
    );
    window.requestAnimationFrame(Render);
}

self["objList"] = objList;

//Image
let backImg = new Image();
backImg.src = "https://pages.cs.wisc.edu/~zhiyuan/background.jpg";

start();


    //testObj.animate("scale",[[0.01,0.01]],1);
    //new Object2D({x:100,y:120, fillColor:[0,0,0], borderWidth:0});
    
    //testObj.fillColor.setCuttingFunction("warp");
    //testObj.animate("fillColor",[[5,0,0]],1);
    //testObj.animate("pos",[[10,10]],10,"derive");
    /*
    testObj.traverse(function(key,propName) {
        console.log(this.class + " " + key + "=" + this[key]);
    },"testObject",["object","boolean","string","number"]);

    let testObj = new SObject({
        s: 1,
        idk: new SObject({c:1}),
        ddd: {cs: 12354},
        dw: [new Rotation2D(), new Vector2D(4,0)]
    });
    */