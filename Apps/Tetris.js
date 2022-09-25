import * as STG from "../StageModule/exporter.js";
var TETRO_TYPE;
(function (TETRO_TYPE) {
    TETRO_TYPE["S"] = "0,0|0,-1|1,-1|-1,0";
    TETRO_TYPE["Z"] = "0,0|0,-1|-1,-1|1,0";
    TETRO_TYPE["L"] = "0,0|0,-1|0,1|1,1";
    TETRO_TYPE["J"] = "0,0|0,-1|0,1|-1,1";
    TETRO_TYPE["I"] = "0,0|0,-1|0,-2|0,1";
    TETRO_TYPE["O"] = "0,0|-1,0|-1,-1|0,-1";
    TETRO_TYPE["T"] = "0,0|-1,0|0,-1|1,0";
})(TETRO_TYPE || (TETRO_TYPE = {}));
var TETRO_COLOR;
(function (TETRO_COLOR) {
    TETRO_COLOR["BLUE"] = "blue";
    TETRO_COLOR["YELLOW"] = "yellow";
    TETRO_COLOR["PURPLE"] = "purple";
})(TETRO_COLOR || (TETRO_COLOR = {}));
var OPERATION;
(function (OPERATION) {
    OPERATION["ROTATION"] = "ArrowUp";
    OPERATION["MOVE_L"] = "ArrowLeft";
    OPERATION["MOVE_R"] = "ArrowRight";
    OPERATION["FALL"] = "ArrowDown";
    OPERATION["PAUSE"] = "Space";
})(OPERATION || (OPERATION = {}));
export default class Tetris extends STG.Stage {
    constructor(canvas) {
        super({ canvas: canvas });
        this.board = new Board();
        this.speed = 1;
        this.add(this.board);
        this.falling = new Tetromino();
        //Operation
        this.addKeyBoardListener("keydown", this.keyBoardOperate.bind(this));
        console.log(this.board);
    }
    resizeChildren() {
        const blockSize = Math.floor(this.height / Tetris.SIZE.y);
        const boardSize = Tetris.SIZE.clone().scale(blockSize);
        this.board.pos.copy(this.bound.dimension).sub(boardSize).scale(0.5);
        this.board.width = boardSize.x;
        this.board.height = boardSize.y;
        super.resizeChildren();
        return this;
    }
    launch() {
        this.ticker = this.addTickEventListener(this.step.bind(this), {
            eventName: "falling",
            interval: 30 / this.speed
        });
        super.launch();
        return this;
    }
    step() {
        return this.operate(OPERATION.FALL);
    }
    fallOnGround() {
        this.hideTetro();
        while (!this.collisionCheck(this.falling)[0]) {
            this.falling.fall();
        }
        this.falling.pos.y--;
        this.showTetro();
        //Reset timer
        this.ticker.prog = 0;
    }
    keyBoardOperate(event) {
        if (!STG.isInObject(OPERATION, event.code))
            return;
        switch (event.code) {
            case OPERATION.FALL:
                this.fallOnGround();
                break;
            case OPERATION.PAUSE:
                this.ticker.enable = !this.ticker.enable;
                break;
            default:
                this.operate(event.key);
        }
    }
    operate(option) {
        this.hideTetro();
        const next = this.falling.clone();
        switch (option) {
            case OPERATION.ROTATION:
                next.rotate();
                break;
            case OPERATION.MOVE_L:
                next.pos.x--;
                break;
            case OPERATION.MOVE_R:
                next.pos.x++;
                break;
            case OPERATION.FALL:
                next.fall();
        }
        const collision = this.collisionCheck(next);
        if (collision[0]) {
            this.showTetro();
            if (option == OPERATION.FALL) {
                if (collision[1].length < next.cells.length) {
                    this.gameOver();
                }
                else {
                    this.falling = new Tetromino();
                    this.eliminate();
                }
            }
        }
        else {
            this.falling = next;
            this.showTetro();
        }
        return this;
    }
    collisionCheck(tetro) {
        const entities = this.board.getEntities(tetro);
        let res = false;
        entities.forEach(block => {
            if (block == undefined || block.visible)
                res = true; // Collide On Ground
        });
        return [res, entities];
    }
    hideTetro(tetro = this.falling) {
        this.board.getEntities(tetro).forEach((block => block.visible = false));
    }
    showTetro(tetro = this.falling) {
        this.board.getEntities(tetro).forEach((block => {
            block.fillColor.copy(tetro.color);
            block.visible = true;
        }));
    }
    gameOver() {
        this.listeners.tick.clear();
        this.board.updateAll({ fillColor: "red" });
        return this;
    }
    eliminate() {
        for (let y = 0; y < Tetris.SIZE.y; y++) {
            let full = true;
            for (let x = 0; x < Tetris.SIZE.x; x++) {
                if (!this.board.blocks[x][y].visible)
                    full = false;
            }
            if (full)
                this.collapseFrom(y);
        }
        return this;
    }
    collapseFrom(layer) {
        for (let y = layer; y > 0; y--) {
            for (let x = 0; x < Tetris.SIZE.x; x++) {
                this.board.blocks[x][y].copy(this.board.blocks[x][y - 1].subset(["visible", "fillColor"]));
            }
        }
        return this;
    }
}
Tetris.SIZE = new STG.Vector2D(10, 20);
class Board extends STG.CanvasContainer {
    constructor(column = Tetris.SIZE, row = Tetris.SIZE.y) {
        super({ fillColor: "white" });
        this.blocks = [];
        if (column instanceof STG.Vector2D) {
            this.grid = column.clone();
        }
        else {
            this.grid = new STG.Vector2D(column, row);
        }
        for (let x = 0; x < Tetris.SIZE.x; x++) {
            this.blocks[x] = [];
            for (let y = 0; y < Tetris.SIZE.y; y++) {
                this.blocks[x][y] = new Block(x, y);
                this.add(this.blocks[x][y]);
            }
        }
    }
    updateAll(values) {
        this.blocks.forEach(cols => {
            cols.forEach(block => {
                block.updateValues(values);
            });
        });
    }
    getEntities(tetro) {
        const toRet = [];
        tetro.cells.forEach(cell => {
            const bpos = tetro.pos.clone().add(cell);
            bpos.x = STG.warp(bpos.x, Tetris.SIZE.x);
            if (bpos.isInRect(0, 0, Tetris.SIZE.x - 1, Tetris.SIZE.y - 1))
                toRet.push(this.blocks[bpos.x][bpos.y]);
            else if (bpos.y >= Tetris.SIZE.y)
                toRet.push(undefined);
        });
        return toRet;
    }
}
class Tetromino {
    constructor(code = STG.arbittr(TETRO_TYPE), posX = Tetris.SIZE.x / 2, posY = -1) {
        this.cells = [];
        if (code instanceof Tetromino) {
            this.copy(code);
        }
        else {
            this.pos = new STG.Vector2D(posX, posY);
            this.color = new STG.Color(STG.arbittr(TETRO_COLOR));
            const positions = code.split("|");
            for (let i = 0; i < positions.length; i++) {
                this.cells.push(new STG.Vector2D(positions[i]));
            }
        }
    }
    fall() {
        this.pos.y++;
        return this;
    }
    rotate() {
        this.cells.forEach(cell => {
            const temp = cell.x;
            cell.x = cell.y;
            cell.y = -temp;
        });
        return this;
    }
    clone() {
        return new Tetromino(this);
    }
    copy(other) {
        this.pos = other.pos.clone();
        this.cells = STG.SObject.clone(other.cells);
        this.color = other.color.clone();
    }
}
class Block extends STG.Object2D {
    constructor(x, y) {
        super({
            graphics: "area",
            borderWidth: 1,
            borderColor: "black",
            frame: [x + 0.05, y + 0.05, 0.90, 0.90],
            visible: false
        });
    }
}
