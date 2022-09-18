
import SnakeGame from "./Apps/Snake.js";
import Tetris from "./Apps/Tetris.js";

const canvas = document.getElementById("mainCanvas") as HTMLCanvasElement;

//const main = new Tetris(canvas).launch();
new SnakeGame(canvas).launch();
