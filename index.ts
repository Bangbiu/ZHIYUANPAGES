
import Tetris from "./Apps/Tetris.js";

const canvas = document.getElementById("mainCanvas") as HTMLCanvasElement;

const main = new Tetris(canvas).launch();
console.log(main);

