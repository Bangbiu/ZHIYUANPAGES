import { CanvasButton } from "../tslib/CanvasUIComponents.js";
import { DATA_CLONE } from "../tslib/DataUtil.js";
import { Graphics2D, PATH, PATHCMD, POLY } from "../tslib/Graphics2D.js";
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
        fontSize: 2,
        scale: [3,3],
        frame: [0.5, 0.5],
        caption: "Button",
        graphics: "disc",
        debug: true
    });

    /*
    let angle = 0.1;
    stage.addMouseEventListener("mousewheel", function(e) {
        const x = 50 * Math.cos(angle);
        const y = 50 * Math.sin(angle);
        angle+=Math.sign(e.info.wheelDelta) * 0.1;
        const large = Number(angle % (Math.PI * 2) > Math.PI);
        btn1.graphics = new Graphics2D(`M 50,0 +A 50,20,0,${large},1,${x},${y} L 0,0`);
        btn1.refresh();
    });
    */
    

    stage.add(btn1);
    
    /*
    console.log(Graphics2D.CMD_SEPARATOR);
    "M0 -50 A 50,50,0,1,0,1,0".split(Graphics2D.CMD_SEPARATOR).forEach(cmd => {
        cmd = cmd.slice(1).trim();
        console.log(cmd.split(Graphics2D.PARAM_SEPARATOR));
    });
    */
       
    render();
    
}

function render(timestamp) {
    ctx.clearRect(0,0,2000,2000);
    stage.tick(ctx);

    window.requestAnimationFrame(render);
}
