/*                                */
/*   Seb's amazing Tetris clone   */
/*   Learnin' to use js, bitches  */
/*                                */

var touchable = 'createTouch' in document;

var GAMEBOARD = document.getElementById("tetrisboard");
var NEXTPIECE = document.getElementById("nextpiece");
var SCOREBOARD = document.getElementById("scoreboard");

var TILE = 30; //the size of a single tile

var ctx = GAMEBOARD.getContext("2d");
var nextcontext = NEXTPIECE.getContext("2d");
var scorecontext = SCOREBOARD.getContext("2d");

var t_Xstart;  //captures starting coordinates of a person using touch interaction
var t_Ystart;
var t_Xend;  //captures end coordinates of touch
var t_Yend;

var count = 0; //counts how many times the main loop happens, moves block down

var score; //stores the score, ya dummy!
var level;
var nextLevel; //score to reach next level

var gameState = "title";  //determines whether game is on the title screen, or paused, and whatnot

var gamespeed; //this is the rate that the Tetris blocks fall

var dropFlag = false; //flashes the screen when you drop a brick
var dropCount = 0; //stores time you dropped the piece, based on count variable above, in order to animate shiz

var clearFlag = false;



var solidBlocks = []; //two-dimensional array for storing solidity of blocks
for (var x = 0; x < 10; x++) {
    solidBlocks[x] = [];
}

var colourMap = []; //two-dimensional array for storing colour of blocks
for (var x = 0; x < 10; x++) {
    colourMap[x] = [];
}





// collection of sounds that are playing
var playing={};
// collection of sounds
var sounds={drop:"drop.wav", move:"move.wav", count:"down.wav", slot:"slotted.wav", theme:"Sebtris.wav", clear:"Clear.wav" };

// function that is used to play sounds
function playsound(x)
{
    var a,b;
    b=new Date();
    a=x+b.getTime();
    playing[a]=new Audio(sounds[x]);
    // with this we prevent playing-object from becoming a memory-monster:
    playing[a].onended=function(){delete playing[a]};
    playing[a].play();
}

function getRandomInt (min, max) {  //random number generator for random pieces
    return Math.floor(Math.random() * (max - min + 1)) + min;
}


function piece() {

    this.generatePiece = function generatePiece(shapeNumber) {  //generates a random piece
        this.init(TILE*5, - TILE, shapeNumber);
        
    };
    
    this.init = function(x, y, shapeNumber) { //creates a piece at coordinates x and y
        this.x = x;
        this.y = y;
        this.shape = shapeNumber;
        this.nextShape = getRandomInt(0,6);
        this.rotation = 0; //initializes rotation of piece
        
        game.piece.displayNext();
    };

    
    this.makeSolid = function makeSolid() {   //indicates that the shape is solid
        var xcoord = this.x / TILE;
        var ycoord = this.y / TILE;

        for (var y = -2; y <= 2; y++) {
            for (var x = -2; x <= 2; x++) {
                if (this.shapeMap(x,y,this.shape,this.rotation) === true) {
                    solidBlocks[xcoord+x][ycoord+y] = 1;
                    colourMap[xcoord+x][ycoord+y] = this.shape;
                    this.block(ctx,(xcoord+x)*TILE,(ycoord+y)*TILE,colourMap[xcoord+x][ycoord+y]);
                }
            }
        }

    };
    
    this.clearShape = function clearShape() {  //clears shape before drawing a new shape
        var xcoord = this.x / TILE;
        var ycoord = this.y / TILE;

        for (var y = -2; y <= 2; y++) {
            for (var x = -2; x <= 2; x++) {
                if (this.shapeMap(x,y, this.shape,this.rotation) === true) {
                    solidBlocks[xcoord+x][ycoord+y] = 0;
                    ctx.clearRect(((xcoord+x)*TILE)-2,((ycoord+y)*TILE)-2, TILE+4, TILE+4);
                    ctx.lineWidth = 1;                          //draws grid
                    ctx.strokeStyle = "rgba(0, 0, 0, 0.05)";    
                    ctx.beginPath(); 
                    ctx.moveTo(((xcoord+x)*TILE),((ycoord+y)*TILE));
                    ctx.lineTo(((xcoord+x)*TILE)+TILE,((ycoord+y)*TILE));
                    ctx.moveTo(((xcoord+x)*TILE),((ycoord+y)*TILE));
                    ctx.lineTo(((xcoord+x)*TILE),((ycoord+y)*TILE)+TILE);
                    ctx.moveTo(((xcoord+x)*TILE)+TILE,((ycoord+y)*TILE));
                    ctx.lineTo(((xcoord+x)*TILE)+TILE,((ycoord+y)*TILE)+TILE);
                    ctx.moveTo(((xcoord+x)*TILE),((ycoord+y)*TILE)+TILE);
                    ctx.lineTo(((xcoord+x)*TILE)+TILE,((ycoord+y)*TILE)+TILE);
                    ctx.stroke();
                }

            }
        }
        
        for (var y = -2; y <= 2; y++) {
            for (var x = -2; x <= 2; x++) {   
                        if (this.shapeMap(x,y, this.shape,this.rotation) === false ) {
                    if (xcoord+x > 0 && xcoord+x <= 9) {
                        if (solidBlocks[xcoord+x][ycoord+y] === 1) {
                            this.block(ctx,(xcoord+x)*TILE,(ycoord+y)*TILE,colourMap[xcoord+x][ycoord+y]);
                        }
                    }
                }
                
            }
        }
    };
    
    this.checkSolid = function checkSolid(valx, valy) {   //collision detection function
        var xcoord = valx / TILE;
        var ycoord = valy / TILE;

        for (var x = -2; x <= 2; x++) {
            for (var y = -2; y <= 2; y++) {
                //alert("Now testing "+(x+xcoord)+","+(y+ycoord));
                if (this.shapeMap(x,y,this.shape,this.rotation) === true) {
                    if (ycoord+y >= 20) {
                        //alert("You hit the bottom.");
                        return true;
                    }
                    else if (xcoord+x >= 10) {
                        //alert("You hit the right hand side.");
                        return true;
                    }
                    else if (xcoord+x < 0) {
                        //alert("You hit the left hand side.");
                        return true;
                    }
                    else if (solidBlocks[xcoord+x][ycoord+y] === 1) {
                        //alert("You hit a solid block.");
                        return true;
                    }
                }
            }
        }
    };

    this.rotate = function move(kcode) { 
        
        this.clearShape();
        this.rotation += 1;
        if (this.rotation > 3) {
            this.rotation = 0;
        }

        if (this.checkSolid(this.x, this.y) === true) { //makes sure you can't rotate into a solid piece or wall
                this.x -= TILE;
                if (this.checkSolid(this.x, this.y) === true) {   //wall kick
                    this.x += TILE*2;
                    if (this.checkSolid(this.x, this.y) === true) {
                        this.x -= TILE;
                        this.rotation -= 1;
                        if (this.rotation < 0) {
                            this.rotation = 3;
                        }
                    }   
                }
        }
        this.makeSolid();
    };

    this.moveRight = function move(kcode) {
        
        this.clearShape();
        this.x += TILE;
        
        if (this.checkSolid(this.x, this.y) === true) {
              this.x -= TILE;
        }
        this.makeSolid();
    };

    this.moveLeft = function move(kcode) {
        
        this.clearShape();
        this.x -= TILE;
        
        if (this.checkSolid(this.x, this.y) === true) {
            this.x += TILE;
        }
        this.makeSolid();
    };
    
    this.moveDown = function move(kcode) {
        
        this.clearShape();
        this.y += TILE;

        if (this.checkSolid(this.x, this.y) === true) {
            this.y -= TILE;
            
            if (count >= gamespeed) {
                this.makeSolid();
                game.checkLines();
                    
                this.checkLose(this.y);
                this.generatePiece(this.nextShape);
                
                game.drawBoxes();
                playsound("slot");
            }
        }
        else {
            count = 0;
        }
        this.makeSolid();
    };
    

    this.drop = function drop(kcode) {
        this.clearShape();
        
        for (var i = 0; i < 20; i++) {
            this.y += TILE;

            if (this.checkSolid(this.x, this.y) === true) {
                this.y -= TILE;
                
                score += i*level;  //gives score bonus for hard drop
                game.updateScore();
                
                this.makeSolid();
                game.checkLines();
                
                this.checkLose(this.y);
                
                this.generatePiece(this.nextShape);
                dropFlag = true;
                
                game.drawBoxes();
                return;
            }
        }

    };
    
    this.checkLose = function checkLose(y) { //checks if you went over the top... if so, you lose!
        if (y < 0) { 
            gameState = "gameover";
        }
    };
    
    this.displayNext = function displayNext() {
        
        nextcontext.clearRect(TILE-15,TILE,TILE*5,TILE*3);
        
        nextcontext.strokeStyle="black";
        nextcontext.fillStyle = "ivory";
        nextcontext.lineWidth = 2;
        nextcontext.fillRect(TILE-15,TILE,TILE*5,TILE*3);
        nextcontext.strokeRect(TILE-15,TILE,TILE*5,TILE*3);

        
        for (var y = -2; y <= 2; y++) {
            for (var x = -2; x <= 2; x++) {
                if (this.shapeMap(x,y,this.nextShape,0) === true) {
                    if (this.nextShape === 0) {
                        this.block(nextcontext,TILE*2+(x*TILE),15+TILE+(y*TILE),this.nextShape); 
                    }
                    else if (this.nextShape === 1) {
                        this.block(nextcontext,TILE*2+(x*TILE),30+TILE+(y*TILE),this.nextShape); 
                    }
                    else {
                        this.block(nextcontext,15+(TILE*2)+(x*TILE),15+TILE+(y*TILE),this.nextShape);
                    }
                    
                }
            }
        }
    };
    
        
    this.shapeMap = function shapeMap(x,y,shape,rotation) {  //basically a map of each shape, for collision detection, etc.

        // O block
        if(shape === 0) {
            if ((x === 1 && y === 1) ||
                (x === 0 && y === 1) ||
                (x === 1 && y === 0) ||
                (x === 0 && y === 0))
                return true;
            else {
                return false;
            }
        }
        
        //I block
        if (shape === 1 && (rotation === 0 || rotation === 2)) {
            if ((x === 2 && y === 0) ||
                (x === 1 && y === 0) ||
                (x === 0 && y === 0) ||
                (x === -1 && y === 0))
                return true;
            else {
                return false;
            }
        }
        else if (shape === 1 && (rotation === 1 || rotation === 3)) {
            if ((x === 0 && y === 2) ||
                (x === 0 && y === 1) ||
                (x === 0 && y === 0) ||
                (x === 0 && y === -1))
                return true;
            else {
                return false;
            }  
        }
        
        //Z block
        if (shape === 2 && (rotation === 0 || rotation === 2)) {
            if ((x === 1 && y === 1) ||
                (x === 0 && y === 1) ||
                (x === 0 && y === 0) ||
                (x === -1 && y === 0))
                return true;
            else {
                return false;
            }
        }
        else if (shape === 2 && (rotation === 1 || rotation === 3)) {
            if ((x === 0 && y === 1) ||
                (x === 0 && y === 0) ||
                (x === 1 && y === 0) ||
                (x === 1 && y === -1))
                return true;
            else {
                return false;
            }  
        }
        
        //S block
        if (shape === 3 && (rotation === 0 || rotation === 2)) {
            if ((x === 1 && y === 0) ||
                (x === 0 && y === 0) ||
                (x === 0 && y === 1) ||
                (x === -1 && y === 1))
                return true;
            else {
                return false;
            }
        }
        else if (shape === 3 && (rotation === 1 || rotation === 3)) {
            if ((x === -1 && y === -1) ||
                (x === -1 && y === 0) ||
                (x === 0 && y === 0) ||
                (x === 0 && y === 1))
                return true;
            else {
                return false;
            }  
        }
        
        //J block
        if (shape === 4 && rotation === 0) {
            if ((x === 1 && y === 1) ||
                (x === 1 && y === 0) ||
                (x === 0 && y === 0) ||
                (x === -1 && y === 0))
                return true;
            else {
                return false;
            }
        }
        else if (shape  === 4 && rotation === 1) {
            if ((x === 0 && y === -1) ||
                (x === 0 && y === 0) ||
                (x === 0 && y === 1) ||
                (x === -1 && y === 1))
                return true;
            else {
                return false;
            }
        }
        else if (shape === 4 && rotation === 2) {
            if ((x === 1 && y === 0) ||
                (x === 0 && y === 0) ||
                (x === -1 && y === 0) ||
                (x === -1 && y === -1))
                return true;
            else {
                return false;
            }
        }
        else if (shape === 4 && rotation === 3) {
            if ((x === 1 && y === -1) ||
                (x === 0 && y === -1) ||
                (x === 0 && y === 0) ||
                (x === 0 && y === 1))
                return true;
            else {
                return false;
            }
        }
        
        //L block
        if (shape === 5 && rotation === 0) {
            if ((x === 1 && y === 0) ||
                (x === 0 && y === 0) ||
                (x === -1 && y === 0) ||
                (x === -1 && y === 1))
                return true;
            else {
                return false;
            }
        }
        else if (shape === 5 && rotation === 1) {
            if ((x === -1 && y === -1) ||
                (x === 0 && y === -1) ||
                (x === 0 && y === 0) ||
                (x === 0 && y === 1))
                return true;
            else {
                return false;
            }
        }
        else if (shape === 5 && rotation === 2) {
            if ((x === 1 && y === -1) ||
                (x === 1 && y === 0) ||
                (x === 0 && y === 0) ||
                (x === -1 && y === 0))
                return true;
            else {
                return false;
            }
        }
        else if (shape === 5 && rotation === 3) {
            if ((x === 1 && y === 1) ||
                (x === 0 && y === 1) ||
                (x === 0 && y === 0) ||
                (x === 0 && y === -1))
                return true;
            else {
                return false;
            }
        }
        
        //T block
        if (shape === 6 && rotation === 0) {
            if ((x === 1 && y === 0) ||
                (x === 0 && y === 1) ||
                (x === 0 && y === 0) ||
                (x === -1 && y === 0))
                return true;
            else {
                return false;
            }
        }
        else if (shape === 6 && rotation === 1) {
            if ((x === 0 && y === -1) ||
                (x === 0 && y === 0) ||
                (x === 0 && y === 1) ||
                (x === -1 && y === 0))
                return true;
            else {
                return false;
            }
        }
        else if (shape === 6 && rotation === 2) {
            if ((x === 1 && y === 0) ||
                (x === 0 && y === 0) ||
                (x === 0 && y === -1) ||
                (x === -1 && y === 0))
                return true;
            else {
                return false;
            }
        }
        else if (shape === 6 && rotation === 3) {
            if ((x === 1 && y === 0) ||
                (x === 0 && y === -1) ||
                (x === 0 && y === 0) ||
                (x === 0 && y === 1))
                return true;
            else {
                return false;
            }
        }
    };

        
    this.block = function block(context,x,y,colour) {   //draws block tiles
        var mainblock;
        
        if (colour === 0) {       //define colours of shapes
            mainblock="gold";     // o shape
        }
        else if (colour == 1) {
            mainblock="darkturquoise";      // i shape
        }
        else if (colour == 2) {
            mainblock="firebrick";     // z shape
        }
        else if (colour == 3) {
            mainblock="greenyellow";    // s shape
        }
        else if (colour == 4) {
            mainblock="blue";   // j shape
        }
        else if (colour == 5) {
            mainblock="darkorange";   // l shape
        }
        else if (colour == 6) {
            mainblock="blueviolet";     // t shape
        }
        else {
            mainblock="black";
        }
        
        //tile colour
        context.fillStyle = mainblock;
        context.fillRect(x,y,TILE,TILE);
        
        
        //left shadow
        context.beginPath();
        context.moveTo(x,y);
        context.lineTo(x+15, y+15);
        context.lineTo(x, y+TILE);
        context.closePath();
        
        context.fillStyle ="rgba(0, 0, 0, 0.15)";
        context.fill();

        
        //right shadow
        context.beginPath();
        context.moveTo(x+TILE,y);
        context.lineTo(x+15, y+15);
        context.lineTo(x+TILE, y+TILE);
        context.closePath();
        
        context.fillStyle ="rgba(0, 0, 0, 0.05)";
        context.fill();

        
        //bottom shadow
        context.beginPath();
        context.moveTo(x,y+TILE);
        context.lineTo(x+15, y+15);
        context.lineTo(x+TILE, y+TILE);
        context.closePath();
        
        context.fillStyle ="rgba(0, 0, 0, 0.25)";
        context.fill();

        
        //black border
        context.strokeStyle="black";
        context.lineWidth = 2;
        context.strokeRect(x-1,y-1,TILE,TILE);
        
        
    };

}


function Game() {
    
    
    this.title = function() {    //display title screen
        ctx.clearRect(0,0,GAMEBOARD.width,GAMEBOARD.height);
        
        
        
        //draw an 's' in blocks
        this.piece.block(ctx,1*TILE,(5-1)*TILE,0);
        this.piece.block(ctx,2*TILE,(5-1)*TILE,0);
        this.piece.block(ctx,0*TILE,(6-1)*TILE,0);
        this.piece.block(ctx,1*TILE,(7-1)*TILE,0);
        this.piece.block(ctx,2*TILE,(8-1)*TILE,0);
        this.piece.block(ctx,0*TILE,(9-1)*TILE,0);
        this.piece.block(ctx,1*TILE,(9-1)*TILE,0);

        
        //draws an 'e' in blocks
        this.piece.block(ctx,4*TILE,(5-1)*TILE,1);
        this.piece.block(ctx,5*TILE,(5-1)*TILE,1);
        this.piece.block(ctx,3*TILE,(6-1)*TILE,1);
        this.piece.block(ctx,6*TILE,(6-1)*TILE,1);
        this.piece.block(ctx,3*TILE,(7-1)*TILE,1);
        this.piece.block(ctx,4*TILE,(7-1)*TILE,1);
        this.piece.block(ctx,5*TILE,(7-1)*TILE,1);
        this.piece.block(ctx,6*TILE,(7-1)*TILE,1);
        this.piece.block(ctx,3*TILE,(8-1)*TILE,1);
        this.piece.block(ctx,4*TILE,(9-1)*TILE,1);
        this.piece.block(ctx,5*TILE,(9-1)*TILE,1);

        //draws a 'b'
        this.piece.block(ctx,7*TILE,(5-1)*TILE,2);
        this.piece.block(ctx,7*TILE,(6-1)*TILE,2);
        this.piece.block(ctx,7*TILE,(7-1)*TILE,2);
        this.piece.block(ctx,7*TILE,(8-1)*TILE,2);
        this.piece.block(ctx,7*TILE,(9-1)*TILE,2);
        this.piece.block(ctx,8*TILE,(5-1)*TILE,2);
        this.piece.block(ctx,9*TILE,(6-1)*TILE,2);
        this.piece.block(ctx,8*TILE,(7-1)*TILE,2);
        this.piece.block(ctx,9*TILE,(8-1)*TILE,2);
        this.piece.block(ctx,8*TILE,(9-1)*TILE,2);

        //draws a 't'
        this.piece.block(ctx,0*TILE,(-1+11)*TILE,3);
        this.piece.block(ctx,1*TILE,(-1+10)*TILE,3);
        this.piece.block(ctx,1*TILE,(-1+11)*TILE,3);
        this.piece.block(ctx,1*TILE,(-1+12)*TILE,3);
        this.piece.block(ctx,1*TILE,(-1+13)*TILE,3);
        this.piece.block(ctx,1*TILE,(-1+14)*TILE,3);
        this.piece.block(ctx,2*TILE,(-1+11)*TILE,3);

        //draws a 'r'
        this.piece.block(ctx,3*TILE,(-1+10)*TILE,5);
        this.piece.block(ctx,3*TILE,(-1+11)*TILE,5);
        this.piece.block(ctx,3*TILE,(-1+12)*TILE,5);
        this.piece.block(ctx,3*TILE,(-1+13)*TILE,5);
        this.piece.block(ctx,3*TILE,(-1+14)*TILE,5);
        this.piece.block(ctx,4*TILE,(-1+10)*TILE,5);
        this.piece.block(ctx,4*TILE,(-1+12)*TILE,5);
        this.piece.block(ctx,5*TILE,(-1+11)*TILE,5);
        this.piece.block(ctx,5*TILE,(-1+13)*TILE,5);
        this.piece.block(ctx,5*TILE,(-1+14)*TILE,5);
        
        //draws an 'i'
        this.piece.block(ctx,6*TILE,(-1+10)*TILE,4);
        this.piece.block(ctx,6*TILE,(-1+12)*TILE,4);
        this.piece.block(ctx,6*TILE,(-1+13)*TILE,4);
        this.piece.block(ctx,6*TILE,(-1+14)*TILE,4);
        
        //draws an 's'
        this.piece.block(ctx,7*TILE,(-1+11)*TILE,6);
        this.piece.block(ctx,7*TILE,(-1+14)*TILE,6);
        this.piece.block(ctx,8*TILE,(-1+10)*TILE,6);
        this.piece.block(ctx,8*TILE,(-1+12)*TILE,6);
        this.piece.block(ctx,8*TILE,(-1+14)*TILE,6);
        this.piece.block(ctx,9*TILE,(-1+10)*TILE,6);
        this.piece.block(ctx,9*TILE,(-1+13)*TILE,6);
        
        ctx.font="72px 'Lucida Console', Monaco, monospace";       
        ctx.textAlign="center";
        ctx.fillStyle = "white";
        ctx.strokeStyle = "black";
        ctx.fillText("SEBTRIS",GAMEBOARD.width/2,(GAMEBOARD.height/2)-8);

        ctx.strokeStyle = "black";
        ctx.lineWidth = 2;
        ctx.strokeText("SEBTRIS",GAMEBOARD.width/2,(GAMEBOARD.height/2)-8);

        ctx.font="18px 'Lucida Console', Monaco, monospace";       
        ctx.textAlign="center";
        ctx.fillStyle = "firebrick";
        ctx.fillText("Press any key to start",GAMEBOARD.width/2,GAMEBOARD.height-TILE);
        
        nextcontext.clearRect(0,0,NEXTPIECE.width,NEXTPIECE.height);
        scorecontext.clearRect(0,0,SCOREBOARD.width,SCOREBOARD.height);
        
        document.onkeydown=function(){      //functions when exiting title screen
            if (gameState != "game") {
                game.init();  
                nextcontext.font="18px 'Lucida Console', Monaco, monospace";       
                nextcontext.textAlign="center";
                nextcontext.fillStyle = "black";
                nextcontext.fillText("Next piece",NEXTPIECE.width/2,18);
                game.piece.displayNext();
                game.updateScore();
                game.drawBoxes();              
            }
            
            gameState = "game";

        };
        document.ontouchstart=function(){
            if (gameState != "game") {
                game.init();
                nextcontext.font="18px 'Lucida Console', Monaco, monospace";       
                nextcontext.textAlign="center";
                nextcontext.fillStyle = "black";
                nextcontext.fillText("Next piece",NEXTPIECE.width/2,18);
                game.piece.displayNext();
                game.updateScore();
                game.drawBoxes();              
            }
            
            gameState = "game";
        };
    };
    
    this.pause = function() {
        ctx.fillStyle ="rgba(0, 0, 0, 0.005)";
        ctx.fillRect(0,0,GAMEBOARD.width,GAMEBOARD.height);
        
        ctx.font="18px 'Lucida Console', Monaco, monospace";       //display game paused message
        ctx.textAlign="center";
        ctx.fillStyle = "red";
        ctx.fillText("PAUSED",GAMEBOARD.width/2,GAMEBOARD.height/2);
        
        document.onkeydown=function(){gameState = "game"; game.drawBoxes()};
        document.ontouchstart=function(){gameState = "game"; game.drawBoxes()};
    };
    
    this.gameOver = function() {
        ctx.fillStyle ="rgba(0, 0, 0, 0.005)";
        ctx.fillRect(0,0,GAMEBOARD.width,GAMEBOARD.height);
        
        ctx.font="64px 'Lucida Console', Monaco, monospace";       //display game paused message
        ctx.textAlign="center";
        ctx.fillStyle = "red";
        ctx.fillText("GAME",GAMEBOARD.width/2,GAMEBOARD.height/2);
        ctx.fillText("OVER",GAMEBOARD.width/2,(GAMEBOARD.height/2)+66);
        document.onkeydown=function(){
            gameState = "title"; playsound("theme");
            
            };
        document.ontouchstart=function(){
            gameState = "title"; playsound("theme");
             };
    };

    this.clearGameboard = function() {
        for (var x = 0; x < 10; x++) { //initiatilze map of solid blocks
            for (var y = -4; y < 20; y++) {
                    solidBlocks[x][y] = 0;
            }
        }
    };


    this.init = function() {
        this.clearGameboard();
        
        this.piece = new piece();
        score = 0;
        level = 1;
        nextLevel = 1000;
        
        var randomPiece;
        randomPiece=getRandomInt (0, 6);
        this.piece.generatePiece(randomPiece);
        
        nextcontext.clearRect(0,0,NEXTPIECE.width,NEXTPIECE.height);
        scorecontext.clearRect(0,0,SCOREBOARD.width,SCOREBOARD.height);
            
    };

    this.checkLines = function() { //function to check if a line has been filled up
        var line = 0;
        var combo = 0; //multiplier for combos

        for (var y = 0; y < 20; y++) {
            for (var x = 0; x < 10; x++) {
                    line += solidBlocks[x][y];
                    if (line == 10) {
                        line = 0;
                        combo += 1;
                        
                        
                        this.clearLine(y);
                        this.copyLines(y);
                        score += 100 * combo;  //to the power of COMBO!
                        game.updateScore();
                        clearFlag = true;
                    }
            }
            line = 0;
        }
        combo = 0;
        
        if (score >= nextLevel) {
            if (level <= 8) {
                level++;
                nextLevel += level*1000;
            }
        }

    };

    this.clearLine = function clearLine(lineNumber) {
            
            for (var x = 0; x < 10; x++) {
                solidBlocks[x][lineNumber] = 0; //clears line
            }
        };
        
    this.copyLines = function copyLines(lineNumber) {
        for (var x = 0; x < 10; x++) {
            for (var y = lineNumber; y >= 0; y--) { //moves lines above down
                solidBlocks[x][y] = solidBlocks[x][y - 1];
                colourMap[x][y] = colourMap[x][y-1];
            }
        }
    };


    this.drawBoxes = function() // function to draw all the solid areas of the game board
    { 
        ctx.clearRect(0, 0, GAMEBOARD.width, GAMEBOARD.height);  //clears board
        
        ctx.lineWidth = 1;                          //draws grid
        ctx.strokeStyle = "rgba(0, 0, 0, 0.05)";    
        ctx.beginPath(); 
        ctx.moveTo(0,TILE);
        for (var y = 1; y < 20; y++) {
            ctx.lineTo(GAMEBOARD.width, TILE*y);
            ctx.moveTo(0, TILE*y+TILE);
        }
        ctx.moveTo(TILE,0);
        for (var x = 1; x < 10; x++) {
            ctx.lineTo(TILE*x,GAMEBOARD.height);
            ctx.moveTo(TILE*x+TILE,0);        
        }
        ctx.stroke();
        
        for (y = 0; y < 20; y++) {
            for (x = 0; x < 10; x++) {
                if (solidBlocks[x][y] === 1) {    //draws tiles
                    this.piece.block(ctx,x*TILE,y*TILE,colourMap[x][y]);
                }
            }
        }
    };
    

    
    this.start = function() { 
          requestAnimFrame( animate );
    };
    
    this.updateScore = function updateScore() {
      
        scorecontext.clearRect(0,0,SCOREBOARD.width,SCOREBOARD.height);
        
        scorecontext.font="18px 'Lucida Console', Monaco, monospace";       
        scorecontext.textAlign="center";
        scorecontext.fillStyle = "black";
        scorecontext.fillText("Score",SCOREBOARD.width/2,18);
        
        scorecontext.fillStyle = "red";
        scorecontext.fillText(score,SCOREBOARD.width/2,36);
        
        scorecontext.fillStyle = "black";
        scorecontext.fillText("Level",SCOREBOARD.width/2,62);
        
        scorecontext.fillStyle = "red";
        scorecontext.fillText(level,SCOREBOARD.width/2,80);

    };
    
}


function animate() {  //main game loop
    requestAnimFrame( animate );

    switch (gameState) {
        case "title": 
            game.title();
            break;
            
        case "pause":
            game.pause();
            break;
            
        case "gameover": 
            game.gameOver();
            break;
        
        case "game":

                if (level === 1) {
                    gamespeed = 56;
                }
                else if (level === 2) {
                    gamespeed = 48;
                }
                else if (level === 3) {
                    gamespeed = 40;
                }
                else if (level === 4) {
                    gamespeed = 32;
                }
                else if (level === 5) {
                    gamespeed = 24;
                }
                else if (level === 6) {
                    gamespeed = 16;
                }
                else if (level === 7) {
                    gamespeed = 8;
                }
                else if (level === 8) {
                    gamespeed = 1;
                }
            
            
            game.piece.checkLose(piece.y);
            
            // Moves tetris block down the screen  
            count++;
            if (count >= gamespeed) {
                game.piece.moveDown();
                playsound("count");
                count = 0;
            }

            
            if (dropFlag === true) {  //makes board shake when you drop a piece
                dropCount++;
                if (dropCount <= 2) {
                    //drop.play();
                    GAMEBOARD.style.top = 2 +'px';
                }
                else {
                    GAMEBOARD.style.top = 0 +'px';
                }
                
                if (dropCount >= 3) {
                    dropFlag = false;
                    dropCount = 0;
                }
            } 
            
            if (clearFlag === true) {
                playsound("clear");
                clearFlag = false;
            }

            break;
        
    }
    
}


window.requestAnimFrame = (function(){
  return   window.requestAnimationFrame   ||
      window.webkitRequestAnimationFrame ||
      window.mozRequestAnimationFrame    ||
      window.oRequestAnimationFrame      ||
      window.msRequestAnimationFrame     ||
      function(/* function */ callback, /* DOMElement */ element){
        window.setTimeout(callback, 1000 / 60);
      };
})();




/**
 * Start game
 */
var game = new Game();

game.start();
game.init();
playsound("theme");



if(touchable) {
    document.addEventListener( 'touchstart', onTouchStart, false );
	document.addEventListener( 'touchmove', onTouchMove, false );
	document.addEventListener( 'touchend', onTouchEnd, false );
}

function onTouchStart(event) {
    event.preventDefault();
    
    var touch = event.touches[0]; 
        
    t_Xstart = touch.pageX;
    t_Ystart = touch.pageY;
    
}

function onTouchMove(event) {
     // Prevent the browser from doing its default thing (scroll, zoom)
	event.preventDefault(); 
    
    var touch = event.touches[0]; 
    
    t_Xend = touch.pageX;
    t_Yend = touch.pageY;
    
} 



function onTouchEnd(event) { 
    if (t_Yend > t_Ystart+150) {
        game.piece.drop();
    }
    else if (t_Yend < t_Ystart-150) {
        game.piece.rotate();
    }
    
    if (t_Xend > t_Xstart+100) {
        game.piece.moveRight();
    }
    else if (t_Xend < t_Xstart-100) {
        game.piece.moveLeft();
    }
    
}


document.addEventListener('keydown', function(event) {
    
    
    
    if (gameState === "game") {
        if (event.keyCode == 37) {
            // Left
            playsound("move");
            game.piece.moveLeft();
            
        }
    
        else if (event.keyCode == 39) {
            // Right
            playsound("move");
            game.piece.moveRight();
        }
    
        else if (event.keyCode == 40) {
            // Down
            playsound("move");
            game.piece.moveDown();
        }
    
        else if (event.keyCode == 38) {
            // Up
            playsound("move");
            game.piece.rotate();
        }
            
        if (event.keyCode == 32) {
            // Spacebar
            playsound("drop");
            game.piece.drop();
        }
            
        if (event.keyCode == 90) {
            // 'Z' key
            gameState="pause";
            game.pause();
        }
    }
        
}, false);



