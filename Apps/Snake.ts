import * as STG from "../StageModule/exporter.js";
import * as Types from "../StageModule/TypeUtil.js";

enum DIRECTION {
    UP = "ArrowUp",
    LEFT = "ArrowLeft",
    RIGHT = "ArrowRight",
    DOWN = "ArrowDown"
}

enum MOVEMENT {
    ArrowUp = "0,-1",
    ArrowLeft = "-1,0",
    ArrowRight = "1,0",
    ArrowDown = "0,1"
}

export default class SnakeGame extends STG.Stage {

    board: Board = new Board();
    snake: Snake = new Snake();
    scoreBlock: STG.Vector2D;
    speed: number = 1;
    ticker: Types.TickEvent;
    
    constructor(canvas: HTMLCanvasElement) {
        super({canvas: canvas});
        this.add(this.board);
        //DIRECTION
        this.addKeyBoardListener("keydown", this.keyBoardOperate.bind(this));
    }

    refresh(): this {
        this.resize();

        const blockSize = Math.floor(this.height / SnakeGame.SIZE.y);
        const boardSize = SnakeGame.SIZE.clone().scale(blockSize);

        this.board.pos.copy(this.bound.dimension).sub(boardSize).scale(0.5);
        this.board.width = boardSize.x;
        this.board.height = boardSize.y;

        return super.refresh();
    }

    launch(): this {
        this.ticker = this.addTickEventListener(
            this.proceed.bind(this), 
            {
                eventName: "proceeding",
                interval: 10 / this.speed
            }
        );

        this.showSnake();
        this.genScoreBlock();

        super.launch();
        return this;
    }

    keyBoardOperate(event: KeyboardEvent): void {
        if (STG.isInObject(DIRECTION, event.key)) {
            const direc = event.key as DIRECTION;
            if (direc != this.snake.blocked) {
                this.snake.direction = event.key as DIRECTION;
            }
        }
    }

    proceed(): this {

        this.hideSnake();
        
        if (this.snake.nextHead.equals(this.scoreBlock)) {
            this.board.getScore();
            this.snake.grow();
            this.genScoreBlock();
        } else {
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
            })
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

    gameOver(): this {
        this.listeners.tick.clear();
        this.board.updateAll({fillColor: "red"});
        return this;
    }

    static SIZE: STG.Vector2D = new STG.Vector2D(20, 20);

}

class Board extends STG.CanvasContainer {
    blocks: Block[][] = [];
    scoreBoard: STG.CanvasLabel;
    score: number = 0;

    constructor(column: number | STG.Vector2D = SnakeGame.SIZE, row: number = SnakeGame.SIZE.y) {
        super({fillColor: "white"});

        if (column instanceof STG.Vector2D) {
            this.grid = column.clone();
        } else {
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
        })

        this.add(this.scoreBoard);
    }

    getScore(score: number = 1) {
        this.score += score;
        this.scoreBoard.text = String(this.score);
    }

    updateAll(values: Types.Object2DProperties): void {
        this.blocks.forEach(cols => {
            cols.forEach(block => {
                block.updateValues(values);
            });
        });
    }

    getEntities(snake: Snake): Block[] {
        const toRet: Block[] = [];
        snake.secs.forEach(sec => {
            if (sec.isInRect(0,0,SnakeGame.SIZE.x - 1, SnakeGame.SIZE.y - 1))
                toRet.push(this.blocks[sec.x][sec.y]);
        });
        return toRet;
    }
}

class Snake {
    direction: DIRECTION = DIRECTION.UP;
    secs: STG.Vector2D[] = [];
    color: STG.Color;
    constructor(len: number = 3, posX: number = SnakeGame.SIZE.x / 2, posY: number = SnakeGame.SIZE.y / 2) {
        this.secs.push(new STG.Vector2D(posX, posY));
        for (let i = 1; i < len; i++) {
            this.secs.push(this.head.clone().moveBy(i,0));
        }
        this.color = new STG.Color("green");
    }

    get head(): STG.Vector2D {
        return this.secs[0];
    }

    get neck(): STG.Vector2D {
        return this.secs[1];
    }

    get nextHead(): STG.Vector2D {
        return this.head.clone().add(MOVEMENT[this.direction]);
    }

    get blocked(): DIRECTION {
        const rel = this.head.to(this.neck);
        if (rel.x == -1) return DIRECTION.LEFT;
        if (rel.x == 1) return DIRECTION.RIGHT;
        if (rel.y == -1) return DIRECTION.UP;
        if (rel.y == 1) return DIRECTION.DOWN;
        return undefined;
    }

    move(direc: DIRECTION = this.direction) {
        for (let i = this.secs.length - 1; i > 0; i--) {
            this.secs[i].copy(this.secs[i-1]);
        }
        this.head.add(MOVEMENT[direc]).warp(SnakeGame.SIZE);
    }

    grow() {
        this.secs.unshift(this.nextHead);
    }

    checkCollision(): boolean {
        
        
        for (let i = 1; i < this.secs.length; i++) {
            if (this.head.equals(this.secs[i])) return true;
        }
        console.log("s");
        return false;
    }

    isBlockInside(pos: STG.Vector2D): boolean {
        let res = false;
        this.secs.forEach(sec => {
            if (pos.equals(sec)) res = true;
        });
        return res;
    }

    clone(): Snake {
        return this;
    }
}

class Block extends STG.Object2D {
    constructor(x: number, y: number) {
        super({
            graphics: "area",
            borderWidth: 1,
            borderColor: "black",
            frame: [x + 0.05,y + 0.05,0.90,0.90],
            visible: false
        })
    }
}
