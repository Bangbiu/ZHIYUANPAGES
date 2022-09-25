import * as STG from "../StageModule/exporter.js";
var DIRECTION;
(function (DIRECTION) {
    DIRECTION["UP"] = "ArrowUp";
    DIRECTION["LEFT"] = "ArrowLeft";
    DIRECTION["RIGHT"] = "ArrowRight";
    DIRECTION["DOWN"] = "ArrowDown";
})(DIRECTION || (DIRECTION = {}));
var MOVEMENT;
(function (MOVEMENT) {
    MOVEMENT["ArrowUp"] = "0,-1";
    MOVEMENT["ArrowLeft"] = "-1,0";
    MOVEMENT["ArrowRight"] = "1,0";
    MOVEMENT["ArrowDown"] = "0,1";
})(MOVEMENT || (MOVEMENT = {}));
export default class SnakeGame extends STG.Stage {
    constructor(canvas) {
        super({ canvas: canvas });
        this.board = new Board();
        this.snake = new Snake();
        this.speed = 1;
        this.add(this.board);
        //DIRECTION
        this.addKeyBoardListener("keydown", this.keyBoardOperate.bind(this));
        this.addResizeListener(function (dim, ev) {
            const blockSize = Math.floor(this.height / SnakeGame.SIZE.y);
            const boardSize = SnakeGame.SIZE.clone().scale(blockSize);
            this.board.pos.copy(this.bound.dimension).sub(boardSize).scale(0.5);
            this.board.width = boardSize.x;
            this.board.height = boardSize.y;
        });
        this.refresh();
    }
    launch() {
        this.ticker = this.addTickEventListener(this.proceed.bind(this), {
            eventName: "proceeding",
            interval: 10 / this.speed
        });
        this.showSnake();
        this.genScoreBlock();
        super.launch();
        return this;
    }
    keyBoardOperate(event) {
        if (STG.isInObject(DIRECTION, event.key)) {
            const direc = event.key;
            if (direc != this.snake.blocked) {
                this.snake.direction = event.key;
            }
        }
    }
    proceed() {
        this.hideSnake();
        if (this.snake.nextHead.equals(this.scoreBlock)) {
            this.board.getScore();
            this.snake.grow();
            this.genScoreBlock();
        }
        else {
            this.snake.move();
        }
        this.showSnake();
        if (this.snake.checkCollision()) {
            this.gameOver();
        }
        return this;
    }
    hideSnake() {
        this.board.getEntities(this.snake).forEach((block => block.visible = false));
    }
    showSnake() {
        this.board.getEntities(this.snake).forEach((block => {
            block.copy({
                fillColor: this.snake.color,
                graphics: "roundArea",
                visible: true
            });
        }));
    }
    showScoreBlock() {
        this.board.blocks[this.scoreBlock.x][this.scoreBlock.y].copy({
            fillColor: "red",
            graphics: "apple",
            visible: true
        });
    }
    genScoreBlock() {
        this.scoreBlock = SnakeGame.SIZE.clone().scaleXY(Math.random(), Math.random()).floor();
        while (this.snake.isBlockInside(this.scoreBlock)) {
            this.scoreBlock.x++;
            if (this.scoreBlock.x >= SnakeGame.SIZE.x) {
                this.scoreBlock.x = 0;
                this.scoreBlock.y++;
            }
        }
        this.showScoreBlock();
    }
    gameOver() {
        this.listeners.tick.clear();
        this.board.updateAll({ fillColor: "red" });
        return this;
    }
}
SnakeGame.SIZE = new STG.Vector2D(20, 20);
class Board extends STG.CanvasContainer {
    constructor(column = SnakeGame.SIZE, row = SnakeGame.SIZE.y) {
        super({ fillColor: "white" });
        this.blocks = [];
        this.score = 0;
        if (column instanceof STG.Vector2D) {
            this.grid = column.clone();
        }
        else {
            this.grid = new STG.Vector2D(column, row);
        }
        for (let x = 0; x < SnakeGame.SIZE.x; x++) {
            this.blocks[x] = [];
            for (let y = 0; y < SnakeGame.SIZE.y; y++) {
                this.blocks[x][y] = new Block(x, y);
                this.add(this.blocks[x][y]);
            }
        }
        this.scoreBoard = new STG.CanvasLabel({
            text: "0",
            fontColor: "red",
            fontSize: 5,
            frame: [SnakeGame.SIZE.x - 1, 1]
        });
        this.add(this.scoreBoard);
    }
    getScore(score = 1) {
        this.score += score;
        this.scoreBoard.text = String(this.score);
    }
    updateAll(values) {
        this.blocks.forEach(cols => {
            cols.forEach(block => {
                block.updateValues(values);
            });
        });
    }
    getEntities(snake) {
        const toRet = [];
        snake.secs.forEach(sec => {
            if (sec.isInRect(0, 0, SnakeGame.SIZE.x - 1, SnakeGame.SIZE.y - 1))
                toRet.push(this.blocks[sec.x][sec.y]);
        });
        return toRet;
    }
}
class Snake {
    constructor(len = 3, posX = SnakeGame.SIZE.x / 2, posY = SnakeGame.SIZE.y / 2) {
        this.direction = DIRECTION.UP;
        this.secs = [];
        this.secs.push(new STG.Vector2D(posX, posY));
        for (let i = 1; i < len; i++) {
            this.secs.push(this.head.clone().moveBy(i, 0));
        }
        this.color = new STG.Color("green");
    }
    get head() {
        return this.secs[0];
    }
    get neck() {
        return this.secs[1];
    }
    get nextHead() {
        return this.head.clone().add(MOVEMENT[this.direction]);
    }
    get blocked() {
        const rel = this.head.to(this.neck);
        if (rel.x == -1)
            return DIRECTION.LEFT;
        if (rel.x == 1)
            return DIRECTION.RIGHT;
        if (rel.y == -1)
            return DIRECTION.UP;
        if (rel.y == 1)
            return DIRECTION.DOWN;
        return undefined;
    }
    move(direc = this.direction) {
        for (let i = this.secs.length - 1; i > 0; i--) {
            this.secs[i].copy(this.secs[i - 1]);
        }
        this.head.add(MOVEMENT[direc]).warp(SnakeGame.SIZE);
    }
    grow() {
        this.secs.unshift(this.nextHead);
    }
    checkCollision() {
        for (let i = 1; i < this.secs.length; i++) {
            if (this.head.equals(this.secs[i]))
                return true;
        }
        console.log("s");
        return false;
    }
    isBlockInside(pos) {
        let res = false;
        this.secs.forEach(sec => {
            if (pos.equals(sec))
                res = true;
        });
        return res;
    }
    clone() {
        return this;
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
