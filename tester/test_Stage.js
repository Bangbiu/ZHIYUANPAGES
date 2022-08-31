import { CanvasButton } from "../tslib/CanvasUIComponents.js";
import { Graphics2D, PATH, POLY } from "../tslib/Graphics2D.js";
import { Stage } from "../tslib/Stage.js";

/** @type {CanvasRenderingContext2D} */
let ctx;
/** @type {HTMLCanvasElement} */
let canv;
/** @type {Stage} */
let stage;

/**
 * 
 * @param {HTMLCanvasElement} canvas
 */
 export function setCanvas(canvas) {
    canv = canvas;
    ctx = /** @type {CanvasRenderingContext2D} */ (canvas.getContext("2d"));
}

export function run_Stage() {

    stage = new Stage({ canvas: canv });

    let btn1 = new CanvasButton({
        draggable: true,
        fontSize: 2,
        scale: [3,3],
        frame: [0.5, 0.5],
        caption: "Nope",
        graphics: "roundArea",
        //debug: true
    });

    stage.add(btn1);

    console.log(btn1);
    
    render();
    
}

function render(timestamp) {
    ctx.clearRect(0,0,2000,2000);
    stage.render(ctx);


    let path = new Path2D();

    path.moveTo(0,0);
    path.lineTo(100,100);
    path.lineTo(500,100);
    path.closePath();

    ctx.fillStyle = "blue";
    ctx.fill(path);
    ctx.fillStyle = "red";
    let transed = new Path2D(undefined);
    transed.addPath(path, {a: 0.5, d: 1});
    
    ctx.fill(transed);



    window.requestAnimationFrame(render);
}