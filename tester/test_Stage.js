import { CanvasButton } from "../tslib/CanvasUIComponents.js";
import { Graphics2D } from "../tslib/Graphics2D.js";
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
        frame: [0.5,0.5,0.5,0.5],
        fontSize: 5,
        caption: "Nope",
        graphics: "heart",
        debug: true
    });

    stage.add(btn1);

    console.log(btn1);

    render();
    
}

function render(timestamp) {
    ctx.clearRect(0,0,2000,2000);
    stage.render(ctx);
    window.requestAnimationFrame(render);
}