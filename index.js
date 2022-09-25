import Tetris from "./Apps/Tetris.js";
const canvas = document.getElementById("mainCanvas");
new Tetris(canvas).launch();
//new SnakeGame(canvas).launch();
resize();
//t_COMP.setCanvas(canvas);
//t_COMP.run_CanvasContainer();
//t_STG.setCanvas(canvas);
//t_STG.run_Stage();
//t_STG.run_Table();
//t_OBJ2D.setCanvas(canvas);
//t_OBJ2D.run_StageObject();
function resize() {
    const box = canvas.getBoundingClientRect();
    canvas.width = window.innerWidth - box.left * 2;
    canvas.height = window.innerHeight - box.top * 2;
    //console.log(new Vector2D(canvas.width,canvas.height));
}
