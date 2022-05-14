const SQUARE_SIZE = 20;
const WIDTH = window.innerWidth;
const HEIGHT = window.innerHeight;
const SQUARES_VERT = Math.floor(HEIGHT/SQUARE_SIZE);
const SQUARES_HOR = Math.floor(WIDTH/SQUARE_SIZE);
const SQUARE_AMOUNT = SQUARES_VERT * SQUARES_HOR;
const STARTING_SNAKE_LEN = 5;
const GAME_SPEED = 100;
var canvas = document.getElementById("canv");
canvas.width = WIDTH;
canvas.height = HEIGHT;
var game;

class GridSquare{
    constructor(x, y, type, id){
        /*
        List of types of squares:
        0 = empty
        1 = tail
        2 = head
        3 = food
        List of turn directions:
        -1: none
        0: north
        1: east
        2: west
        3: south
        */
        this.x = x;
        this.y = y;
        this.id = id;
        this.trueX = x * SQUARE_SIZE;
        this.trueY = y * SQUARE_SIZE;
        this.type = type;
        this.color = "black";
        this.turnDir = -1;
    }

    chooseColor(){
        if(this.type==0) this.color = "black";
        else if(this.type==1 || this.type==2) this.color = "green";
        else this.color = "red";
    }

    draw(){
        var ctx = canvas.getContext("2d");
        ctx.clearRect(this.trueX, this.trueY, SQUARE_SIZE, SQUARE_SIZE);
        ctx.fillStyle = this.color;
        ctx.fillRect(this.trueX, this.trueY, SQUARE_SIZE, SQUARE_SIZE);
    }

    setEmpty(){
        this.type = 0;
    }

    setTail(){
        this.type = 1;
    }

    setHead(){
        this.type = 2;
    }

    setFood(){
        this.type = 3;
    }

    getNorth(){
        if(this.y==0) return -1;
        return this.id - SQUARES_HOR;
    }

    getEast(){
        if(this.x==SQUARES_HOR-1) return -1;
        return this.id + 1;
    }

    getSouth(){
        if(this.y==SQUARES_VERT-1) return -1;
        return this.id+SQUARES_HOR;
    }

    getWest(){
        if(this.x==0) return -1;
        return this.id-1;
    }

    getOppositeDir(){
        if(this.turnDir<2) return this.turnDir+2;
        else return this.turnDir-2;
    }
}

class Game {
    constructor(drawn){
        this.grid = [];
        this.snakeDir = 0;
        this.oldSnakeDir = 0;
        this.dirChanged = false;
        this.isDead = false;
        this.head =null;
        this.tail = [];
        this.drawn = drawn;
    }

    setupGrid(){
        for(var i=0; i<SQUARES_VERT; i++){
            for(var j=0; j<SQUARES_HOR; j++){
                var sqId = this.convertToId(j, i);
                var sq = new GridSquare(j, i, 0, sqId);
                this.grid.push(sq);
            }
        }
    }

    setupGridDebug(){
        for(var i=0; i<this.grid.length; i++){
            if(i%2==0) this.grid[i].setFood();
        }
    }

    drawGrid(){
        for(var i=0; i<this.grid.length; i++){
            this.grid[i].chooseColor();
            this.grid[i].draw();
        }
    }

    placeSnake(){
        var headX = Math.floor(SQUARES_HOR / 2);
        var headY = Math.floor(SQUARES_VERT / 2);
        var headId = this.convertToId(headX, headY);
        this.head = this.grid[headId];
        this.head.setHead();
        var lastTail = this.grid[this.head.getSouth()];
        for(var i=0; i<STARTING_SNAKE_LEN; i++){
            lastTail.setTail();
            this.tail.push(lastTail);
            lastTail = this.grid[lastTail.getSouth()];
        }
    }

    getNextSquare(loc, dir){
        if(dir==0) return this.grid[loc].getNorth();
        else if(dir==1) return this.grid[loc].getEast();
        else if(dir==2) return this.grid[loc].getSouth();
        else if(dir==3) return this.grid[loc].getWest();
    }

    deathCheck(){
        for(var i=0; i<this.tail.length; i++){
            if(this.tail[i].id == this.head.id){ 
                console.log("death by tail");
                return true;
            }
            else return false;
        }
    }

    moveSnake(){
        if(headNextPos==-1){
            this.isDead = true;
            console.log("died by wall");
            return;
        }
        if(this.dirChanged){
            for(var i=0; i<this.tail.length; i++){
                if(this.tail[i].turnDir==-1) this.tail[i].turnDir = this.oldSnakeDir;
            }
            this.dirChanged = false;
        }
        for(var i=0; i<this.grid.length; i++){
            if(this.grid[i].type==0){
                this.grid[i].turnDir = -1;
                //console.log(`Returned square ${i} to direction -1`);
            }
        }
        var headNextPos = this.getNextSquare(this.head.id, this.snakeDir);
        this.head.setEmpty();
        this.head = this.grid[headNextPos];
        this.head.setHead();
        for(var i=0; i<this.tail.length; i++){
            var dir=this.tail[i].turnDir;
            if(dir==-1) dir=this.snakeDir;
            var next = this.getNextSquare(this.tail[i].id, dir);
            this.tail[i].setEmpty();
            this.tail[i] = this.grid[next];
            this.tail[i].setTail();
        }
        this.isDead = this.deathCheck();
    }

    turn(dir){
        this.dirChanged = true;
        this.oldSnakeDir = this.snakeDir;
        this.snakeDir = dir;
    }

    update(){
        if(!this.isDead) this.moveSnake();
        if(this.drawn) this.drawGrid();
    }

    getHeadLoc(){
        for(var i=0; i<this.grid.length; i++){
            if(this.grid[i].type==2) return i;
        }
    }

    getHeadNorth(){
        var s = this.grid[this.getHeadLoc()];
        return s.getNorth();
    }

    getHeadEast(){
        var s = this.grid[this.getHeadLoc()];
        return s.getEast();
    }

    getHeadSouth(){
        var s = this.grid[this.getHeadLoc()];
        return s.getSouth();
    }

    getHeadWest(){
        var s = this.grid[this.getHeadLoc()];
        return s.getWest();
    }

    convertToId(x, y){
        return (y*SQUARES_HOR)+x;
    }
}

function debugSetup(){
    game = new Game(true);
    game.setupGrid();
    game.setupGridDebug();
    game.drawGrid();
}

function normalSetup(){
    game = new Game(true);
    game.setupGrid();
    game.placeSnake();
    game.drawGrid();
    setInterval(function(){
        game.update();
    }, GAME_SPEED);
}

//debugSetup();
normalSetup();
document.addEventListener("keydown", (evt) => {
    if(evt.key=="w") game.turn(0);
    else if(evt.key=="d") game.turn(1);
    else if(evt.key=="s") game.turn(2);
    else if(evt.key=="a") game.turn(3);
});