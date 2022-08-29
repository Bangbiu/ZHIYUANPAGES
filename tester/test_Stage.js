import { CanvasButton } from "../tslib/CanvasUIComponents.js";
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
    console.log(stage);

    let btn1 = new CanvasButton({
        draggable: true,
        frame: [0.5,0.5,0.2,0.5]
    });

    stage.add(btn1);

    render();
}

function render(timestamp) {
    ctx.clearRect(0,0,2000,2000);
    stage.render(ctx);
    window.requestAnimationFrame(render);
}