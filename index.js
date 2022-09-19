import * as t_COMP from "./tester/test_UIComp.js";
const canvas = document.getElementById("mainCanvas");
//new Tetris(canvas).launch();
//new SnakeGame(canvas).launch();
resize();
t_COMP.setCanvas(canvas);
t_COMP.run_Matrix();
function resize() {
    const box = canvas.getBoundingClientRect();
    canvas.width = window.innerWidth - box.left * 2;
    canvas.height = window.innerHeight - box.top * 2;
    //console.log(new Vector2D(canvas.width,canvas.height));
}
