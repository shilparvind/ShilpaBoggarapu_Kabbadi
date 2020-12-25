//3 gameStates, Serve,Play, Start
//store the toss in database
//Display score
//When the red cross the red line, then yellow gets score

var player1, player1Img;
var player2, player2Img;
var gameStateP = 0;
var player1Count = 0;
var player2Count = 0;
var database;
var player1Ref, player2Ref;
var player1P, player2P;
var gameStateRef;
var reset, rand;
var edges;
var redS = 0;
var yellowS = 0;
var toss;
var p1_red, p2_yellow;

function preload() {
  player1Img = loadAnimation("images/player1a.png", "images/player1b.png");
  player1Img = loadImage("images/player1a.png");
  player2Img = loadAnimation("images/player2a.png", "images/player2b.png");
  player2Img = loadImage("images/player2a.png");
}

function setup() {
  createCanvas(500, 500);
  database = firebase.database();

  player1 = createSprite(100, 100, 20, 20);
  player1.addAnimation("p1", player1Img);
  player1.scale = 0.3;

  player1Ref = database.ref("player1");
  player1Ref.on("value", readPosition1);

  player2 = createSprite(400, 100, 20, 20);
  player2.addAnimation("p2", player2Img);
  player2.scale = 0.3;
  player2.rotation = 180;

  player2Ref = database.ref("player2");
  player2Ref.on("value", readPosition2);

  //Reading the score of Player1,player2 from database
  database.ref("player1Score").on("value", function (data) {
    redS = data.val();
  });

  database.ref("player2Score").on("value", function (data) {
    yellowS = data.val();
  });

  reset = createButton("Reset");
  reset.position(690, 120);

  rand = Math.round(random(1, 2));
  edges = createEdgeSprites();

  player1.debug = true;
  player2.debug = true;
  player1.setCollider("circle", 10, 0, 40);
  player2.setCollider("circle", 10, 0, 40);
}

function draw() {
  background(0);
  text(mouseX + "," + mouseY, mouseX, mouseY);

  fill("red");
  text("RedScore: " + redS, 155, 20);

  fill("yellow");
  text("YellowScore: " + yellowS, 280, 20);

  if (gameStateP === 0) {
    fill("lightblue");
    database.ref("player1/position").update({
      x: 175,
      y: 250,
    });

    database.ref("player2/position").update({
      x: 340,
      y: 250,
    });
    textSize(15);
    text("Press SPACE to start the game", 175, 150);
    setTimeout(toss, 1000);
  }

  if (keyDown("SPACE")) {
    gameStateP = 1;
    gameStateUpdate(1);
  }

  if (gameStateP === 1) {
    if (rand === 1) {
      player1Movement();
    }
    if (rand === 2) {
      player2Movement();
    }
  }

  if (player1.x > 450) {
    gameStateUpdate(0);
    gameStateP = 0;
    database.ref("/").update({
      player1Score: redS + 5,
    });
  } else if (player2.x < 50) {
    gameStateUpdate(0);
    gameStateP = 0;
    database.ref("/").update({
      player2Score: yellowS + 5,
    });
  }

  if (player2.isTouching(player1) && player2.x < 250) {
    // setTimeout(winsY, 4000);
    text("!!YELLOW WINS!!", 180, 352);
    // setTimeout(touchesFun, 3000);
    gameStateUpdate(0);
    gameStateP = 0;
    database.ref("/").update({
      player2Score: yellowS + 5,
    });
    console.log(yellowS);
  }

  if (player1.isTouching(player2) && player1.x > 250) {
    //setTimeout(winsR, 2000);
    text("!!RED WINS!!", 180, 352);
    //setTimeout(touchesFun, 3000);
    gameStateUpdate(0);
    gameStateP = 0;
    database.ref("/").update({
      player1Score: redS + 5,
    });
    console.log(redS);
  }

  //Middle Line
  strokeWeight(3);
  stroke("white");

  for (var y = 0; y < 500; y = y + 20) {
    line(250, y, 250, y + 10);
  }

  //Player1 Line
  strokeWeight(1.5);
  stroke("yellow");

  for (var y = 0; y < 500; y = y + 20) {
    line(125, y, 125, y + 10);
  }

  //Player2 Line
  strokeWeight(1.5);
  stroke("red");

  for (var y = 0; y < 500; y = y + 20) {
    line(375, y, 375, y + 10);
  }

  reset.mousePressed(resetFun);

  player1.collide(edges);
  player1.collide(edges);

  player2.collide(edges);
  player2.collide(edges);
  drawSprites();
}

/*******************************************************************************************/
//Reading gameState from database
function readState() {
  gameStateRef = database.ref("gameState");
  gameStateRef.on("value", function (data) {
    gameStateP = data.val();
  });
}

//Writing gameState value to the database
function gameStateUpdate(state) {
  database.ref("/").update({
    gameState: state,
  });
}

//Writing Player1 values to the database
function writePosition1(x, y) {
  database.ref("player1/position").update({
    x: player1.x + x,
    y: player1.y + y,
  });
}

//Writing PLayer2 values to the database
function writePosition2(x, y) {
  database.ref("player2/position").update({
    x: player2.x + x,
    y: player2.y + y,
  });
}

//Reading Player1 values from database
function readPosition1(data) {
  player1P = data.val();
  player1.x = player1P.position.x;
  player1.y = player1P.position.y;
}

//Reading Player2 values from database
function readPosition2(data) {
  player2P = data.val();
  player2.x = player2P.position.x;
  player2.y = player2P.position.y;
}

//Resetting the database to original values
function resetFun() {
  database.ref("player1/position").update({
    x: 175,
    y: 250,
  });

  database.ref("player2/position").update({
    x: 340,
    y: 250,
  });

  database.ref("/").update({
    player1Score: 0,
    player2Score: 0,
  });
  gameStateUpdate(0);
}

function player1Movement() {
  //Movement of Player1
  if (keyDown(UP_ARROW)) {
    writePosition1(5, 0);
  } else if (keyDown(DOWN_ARROW)) {
    writePosition1(-5, 0);
  } else if (keyDown(LEFT_ARROW)) {
    writePosition1(0, 5);
  } else if (keyDown(RIGHT_ARROW)) {
    writePosition1(0, -5);
  }

  //Movement of Player2 (left and right)
  if (keyDown("a")) {
    writePosition2(0, 5);
  } else if (keyDown("d")) {
    writePosition2(0, -5);
  }
}

function player2Movement() {
  //Movement of Player2
  if (keyDown("w")) {
    writePosition2(-5, 0);
  } else if (keyDown("x")) {
    writePosition2(5, 0);
  } else if (keyDown("a")) {
    writePosition2(0, 5);
  } else if (keyDown("d")) {
    writePosition2(0, -5);
  }

  //Movement of Player1 (left and right)
  if (keyDown(LEFT_ARROW)) {
    writePosition1(0, 5);
  } else if (keyDown(RIGHT_ARROW)) {
    writePosition1(0, -5);
  }
}

function toss() {
  fill("lightblue");
  strokeWeight(6);
  textSize(20);
  if (rand === 1) {
    text("Red Player Plays ", 195, 109);
  }
  if (rand === 2) {
    text("Yellow Player Plays", 195, 109);
  }
}

function touchesFun() {
  database.ref("player1/position").update({
    x: 175,
    y: 250,
  });

  database.ref("player2/position").update({
    x: 340,
    y: 250,
  });
}

function winsY() {
  // fill("lightblue");
  // strokeWeight(6);
  // textSize(20);

  text("!!YELLOW WINS!!", 180, 352);
  console.log("inside winsY  ");
}

function winsR() {
  // fill("lightblue");
  // strokeWeight(6);
  // textSize(20);

  text("!!RED WINS!!", 180, 352);
  console.log("inside winsR ");
}
