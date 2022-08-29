// @ts-check
import { Vector2D } from "./tslib/Struct.js";
import * as t_SOBJ from "./tester/test_SObject.js";
import * as t_OBJ2D from "./tester/test_Object2D.js";
import * as t_COMP from "./tester/test_UIComp.js";
import * as t_STG from "./tester/test_Stage.js"
import { SObject } from "./tslib/DataUtil.js";

const canvas = /** @type {HTMLCanvasElement} */ (document.getElementById("mainCanvas"));
const ctx = /** @type {CanvasRenderingContext2D} */ (canvas.getContext("2d"));
resize();

//t_SOBJ.run_SObject();
//t_SOBJ.run_Rotation();
//t_SOBJ.run_Vector2D();
//t_SOBJ.run_Color();
//t_SOBJ.run_Resolve();

//t_OBJ2D.setCanvas(canvas);
//t_OBJ2D.run_ContextTransf();
//t_OBJ2D.run_Object2D();
//t_OBJ2D.run_StageObject();
//t_OBJ2D.run_StageInteractive(canvas);
//t_OBJ2D.run_StateSwitching();

//t_COMP.setCanvas(canvas);
//t_COMP.run_CanvasLabel();
//t_COMP.run_CanvasButton();

t_STG.setCanvas(canvas);
t_STG.run_Stage();


function resize() {
    const box = canvas.getBoundingClientRect();
    canvas.width = window.innerWidth - box.left * 2;
    canvas.height = window.innerHeight - box.top * 2;
    console.log(new Vector2D(canvas.width,canvas.height));
}