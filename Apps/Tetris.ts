import * as STG from "../StageModule/exporter.js";
import * as Types from "../StageModule/TypeUtil.js";

enum TETRO_TYPE {
    S   = "0,0|0,-1|1,-1|-1,0",
    Z   = "0,0|0,-1|-1,-1|1,0",
    L   = "0,0|0,-1|0,1|1,1",
    J   = "0,0|0,-1|0,1|-1,1",
    I   = "0,0|0,-1|0,-2|0,1",
    O   = "0,0|-1,0|-1,-1|0,-1",
    T   = "0,0|-1,0|0,-1|1,0"
}

enum TETRO_COLOR {
    BLUE = "blue",
    YELLOW = "yellow",
    PURPLE = "purple",
}

enum OPERATION {
    ROTATION = "ArrowUp",
    MOVE_L = "ArrowLeft",
    MOVE_R = "ArrowRight",
    FALL = "ArrowDown"
}

export default class Tetris extends STG.Stage {

    board: Board = new Board();
    speed: number = 1;
    falling: Tetromino;
    ticker: Types.TickEvent;
    
    constructor(canvas: HTMLCanvasElement) {
        super({canvas: canvas});
        this.add(this.board);
        this.falling = new Tetromino();
        //Operation
        this.addKeyBoardListener("keydown", this.keyBoardOperate.bind(this));
    }

    refresh(): this {
        this.resize();

        const blockSize = Math.floor(this.height / Tetris.SIZE.y);
        const boardSize = Tetris.SIZE.clone().scale(blockSize);

        this.board.pos.copy(this.bound.dimension).sub(boardSize).scale(0.5);
        this.board.resize(boardSize);

        return super.refresh();
    }

    launch(): this {
        this.ticker = this.addTickEventListener(this.step.bind(this), {
            eventName: "falling",
            interval: 30 / this.speed
        })
        super.launch(false);
        return this;
    }

    step(): this {
        return this.operate(OPERATION.FALL);
    }

    fallOnGround(): void {
        this.hideTetro();
        while(!this.collisionCheck(this.falling)[0]) {
            this.falling.fall();
        }
        this.falling.pos.y--;
        this.showTetro();
        //Reset timer
        this.ticker.prog = 0;
    }

    keyBoardOperate(event: KeyboardEvent): void {
        if (!STG.isInObject(OPERATION, event.key)) return;
        
        if (event.key == OPERATION.FALL) {
            this.fallOnGround();
        } else {
            this.operate(event.key as OPERATION);
        }
    }

    operate(option: OPERATION): this {

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
                } else {
                    this.falling = new Tetromino();
                    this.eliminate();
                }
            }
        } else {
            this.falling = next;
            this.showTetro();
        }

        return this;
        
    }

    collisionCheck(tetro: Tetromino): [boolean, Block[]] {
        const entities = this.board.getEntities(tetro);
        let res = false;
        entities.forEach(block => {
            if (block == undefined || block.visible) 
                res = true;     // Collide On Ground
        });

        return [res, entities];
    }

    hideTetro(tetro: Tetromino = this.falling) {
        this.board.getEntities(tetro).forEach((block => block.visible = false));
    }

    showTetro(tetro: Tetromino = this.falling) {
        this.board.getEntities(tetro).forEach((block => {
            block.fillColor.copy(tetro.color);
            block.visible = true;
        }));
    }

    gameOver(): this {
        this.listeners.ontick.clear();
        this.board.updateAll({fillColor: "red"});
        return this;
    }

    eliminate(): this {
        for (let y = 0; y < Tetris.SIZE.y; y++) {
            let full: boolean = true;
            for (let x = 0; x < Tetris.SIZE.x; x++) {
                if (!this.board.blocks[x][y].visible) full = false;
            }
            if (full) this.collapseFrom(y);
        }
        return this;
    }

    collapseFrom(layer: number): this {
        for (let y = layer; y > 0; y--) {
            for (let x = 0; x < Tetris.SIZE.x; x++) {
                this.board.blocks[x][y].copy(
                    this.board.blocks[x][y-1].subset(["visible", "fillColor"])
                );
            }
        }
        return this;
    }

    static SIZE: STG.Vector2D = new STG.Vector2D(10, 20);

}

class Board extends STG.CanvasContainer {
    blocks: Block[][] = [];
    

    constructor(column: number | STG.Vector2D = Tetris.SIZE, row: number = Tetris.SIZE.y) {
        super({fillColor: "white"});

        if (column instanceof STG.Vector2D) {
            this.grid = column.clone();
        } else {
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

    updateAll(values: Types.Object2DProperties): void {
        this.blocks.forEach(cols => {
            cols.forEach(block => {
                block.updateValues(values);
            });
        });
    }

    getEntities(tetro: Tetromino): Block[] {
        const toRet: Block[] = [];
        tetro.cells.forEach(cell => {
            const bpos = tetro.pos.clone().add(cell);
            bpos.x = STG.warp(bpos.x, Tetris.SIZE.x);
            if (bpos.isInRect(0,0,Tetris.SIZE.x - 1, Tetris.SIZE.y - 1))
                toRet.push(this.blocks[bpos.x][bpos.y]);
            else if (bpos.y >= Tetris.SIZE.y)
                toRet.push(undefined);
        });
        return toRet;
    }
}

class Tetromino {
    pos: STG.Vector2D;
    cells: STG.Vector2D[] = [];
    color: STG.Color;
    constructor(code: string | Tetromino = STG.arbittr(TETRO_TYPE), posX: number = Tetris.SIZE.x / 2, posY: number = -1) {
        if (code instanceof Tetromino) {
            this.copy(code);
        } else {
            this.pos = new STG.Vector2D(posX, posY);
            this.color = new STG.Color(STG.arbittr(TETRO_COLOR));
            const positions = code.split("|");
            for (let i = 0; i < positions.length; i++) {
                this.cells.push(new STG.Vector2D(positions[i]));
            }
        }
    }

    fall(): this {
        this.pos.y++;
        return this;
    }

    rotate(): this {
        this.cells.forEach(cell => {
            const temp = cell.x;
            cell.x = cell.y;
            cell.y = -temp;
        });
        return this;
    }

    clone(): Tetromino {
        return new Tetromino(this);
    }

    copy(other: Tetromino) {
        this.pos = other.pos.clone();
        this.cells = STG.SObject.clone(other.cells);
        this.color = other.color.clone();
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
