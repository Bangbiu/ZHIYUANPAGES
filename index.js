import { Vector2D } from "./tslib/Struct.js";
import * as t_SOBJ from "./tester/test_SObject.js";
import * as t_OBJ2D from "./tester/test_Object2D.js";

/**
 * @type {HTMLCanvasElement}
 */
const canvas = document.getElementById("mainCanvas");
const ctx = canvas.getContext("2d");
resize();

//t_SOBJ.run_SObject();
//t_SOBJ.run_Rotation();
//t_SOBJ.run_Vector2D();
//t_SOBJ.run_Color();
//t_SOBJ.run_Resolve();


//t_OBJ2D.run_ContextTransf();
t_OBJ2D.run_Object2D(ctx);

function resize() {
    const box = canvas.getBoundingClientRect();
    canvas.width = window.innerWidth - box.left * 2;
    canvas.height = window.innerHeight - box.top * 2;
    console.log(new Vector2D(canvas.width,canvas.height));
}