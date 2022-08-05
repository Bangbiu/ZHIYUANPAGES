/*jshint esversion: 6 */
// @ts-check
// External Lib
import * as TU from "../lib/TypeUtil.js";
import * as DU from "../lib/DataUtil.js";
import { SObject } from "../lib/DataUtil.js";
import { Vector2D } from "../lib/Struct.js";
import { CoordSystem } from "../lib/CoordinateSystem.js";
import { ContextTransf, MouseEventMap, Object2D, StageInteractive, StageObject } from "../lib/Object2D.js";
import { Color, ColorStates } from "../lib/ColorLib.js";
import { Rotation2D } from "../lib/Rotation2D.js";
import { Graphics2D, GraphicsText } from "../lib/Graphics2D.js";
import { CanvasButton, CanvasContainer, CanvasInterativeComponent, CanvasLabel, InteractionColors } from "../lib/CanvasUIComponents.js";
import { Test } from "../lib/Test.js";
import { Stage } from "../lib/Stage.js";

let canvas = /** @type {HTMLCanvasElement} */ (document.getElementById("mainCanvas"));
if (!(canvas instanceof HTMLCanvasElement))
    throw new Error("Canvas is not HTML Element");
let ctx = /** @type {CanvasRenderingContext2D} */canvas.getContext("2d");
const stage = new Stage({canvas: canvas});


function Render() {
    stage.render(ctx);
    window.requestAnimationFrame(Render);
}

function start() {
    stage.fillColor = new Color("grey");
    const naviButtons = [];
    const naviTitles = ["Home","Research","Projects"]
    for (let i = 0; i < 3; i++) {
        naviButtons.push(new CanvasButton({
            caption: naviTitles[i],
            graphics: "area",
            fontSize: 2,
            frame: [0.33*i,0,0.33,1],
            width: 200,
            height: 200,
            stret: [1,1],
            preset: "Warn"
        }).addMouseEventListener("mousedown",function(e){ console.log(this.name); }));
    }
    stage.add(
        new CanvasContainer({
            width : 1000,
            height : 200,
            components: naviButtons,
            draggable: true,
        })
    );

    stage.refresh();

    window.requestAnimationFrame(Render);
}

self["stage"] = stage;

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