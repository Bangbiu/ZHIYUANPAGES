/*jshint esversion: ES2020 */
// @ts-check
import { CanvasButton, CanvasContainer } from "../StageModule/CanvasUIComponents.js";
import { DATA_CLONE } from "../StageModule/DataUtil.js";
import { Graphics2D, PATH, PATHCMD, POLY } from "../StageModule/Graphics2D.js";
import { Stage } from "../StageModule/Stage.js";
import { Color, Vector2D } from "../StageModule/Struct.js";

let ctx: CanvasRenderingContext2D;
let canv: HTMLCanvasElement;
let stage: Stage;

export function setCanvas(canvas: HTMLCanvasElement) {
    canv = canvas;
    ctx = canvas.getContext("2d");
}

export function run_Stage() {
    stage = new Stage({ canvas: canv });

    let btn1 = new CanvasButton({
        fontSize: 2,
        scale: [3,3],
        frame: [0.5, 0.5],
        caption: "Button",
        graphics: "roundSquare",
        debug: true,
        draggable: true
    });

    /*
    let angle = 0.1;
    stage.addMouseEventListener("wheel", function(e) {
        const x = 50 * Math.cos(angle);
        const y = 50 * Math.sin(angle);
        angle-=Math.sign(e.info.wheelDelta) * 0.1;
        const large = Number(angle % (Math.PI * 2) > Math.PI);
        btn1.graphics = new Graphics2D(`M 50,0 A 50,50,0,${large},1,${x},${y} L 0,0`);
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
       
    stage.launch(false);

    stage.addKeyBoardListener("keydown", function(ev) {console.log();})
    btn1.addMouseEventListener("mousedown", function(ev) {console.log("down");})
    btn1.msg("listeners");
}


export function run_Table() {
    stage = new Stage({ canvas: canv });

    let table = new CanvasContainer({
        scale: [3,3],
        frame: [0.5, 0.5, 0.5, 0.8],
        graphics: "square",
        borderColor: "grey",
        borderWidth: 5,
        draggable: true,
        clipWithin: true,
    });

    stage.add(table);
    stage.refresh();

    //table.innerTransf.trans = table.bound.dimension.clone().negate().scale(0.5);

    const panel =  new CanvasContainer({
        scale: [3,3],
        frame: [-0.5, -0.5, 1, 2],
        grid: [10,40],
        graphics: "rect",
        borderColor: "grey",
        borderWidth: 0,
        clipWithin: true,
        draggable: true,
    });

    table.addMouseEventListener("wheel", function(ev) {
        const changed = panel.pos.y + (ev.info as WheelEvent).deltaY / 10;
        if (changed <= table.bound.top && (changed + panel.height) >= table.bound.height) {
            panel.pos.y = changed;
        } 
    });

    table.add(panel);
    
    for (let x = 0; x < 10; x++) {
        for (let y = 0; y < 30; y++) {
            panel.add(new CanvasButton({
                fillColor: "white",
                borderColor: "grey",
                graphics: "rect",
                frame: [x+0.02,y+0.05,0.96,0.9],
                caption: x + "," + y,
                states: {
                    def: {
                        foreColor: new Color("white"),
                    },
                    hovered: {
                        fillColor: new Color("white"),
                        foreColor: new Color("#1d89ff"),
                        borderColor: new Color("#1d89ff")
                    },
                    pressed: {
                        fillColor: new Color("#DDDDDD"),
                        foreColor: new Color("#1d89ff"),
                        borderColor: new Color("#1d89ff")
                    }
                }
            }));
        }
    }
    

    stage.refresh();
    stage.launch(false);
    
}
