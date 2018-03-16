float[] prevColor = {255, 255, 255}; //<>// //<>//
float[] nextColor = {255, 255, 255};
float[] newColor = new float[3];
float[] differenceVector = new float[3];

int frame;
int changeTime = 120;
int newChangeTime = changeTime;

int tileSize = 20;
ArrayList tiles;

class ColorTime {
  color c1;
  color c2;
  int ticks;
  
  ColorTime(float[] l1, float[] l2, int t) {
    c1 = color(l1[0], l1[1], l1[2]);
    c2 = color(l2[0], l2[1], l2[2]);
    ticks = t;
  }
  
}

PFont light;

boolean paused = false;

int Y_AXIS = 1;
int X_AXIS = 2;

void setup() {
  frameRate(60);
  frame = 0;
  
  size(window.innerWidth, window.innerHeight);
  // size(400, 400);
  
  for (int i = 0; i < nextColor.length; i++) {
      prevColor[i] = 0;
      nextColor[i] = 0;
  }
  background(prevColor[0], prevColor[1], prevColor[2]);
  
  tiles = new ArrayList();
  
  light = loadFont("Helvetica-18.vlw");
  textFont(light);
  
}

void drawTiles() {
  int x = 0;
  int y = 0;
  for (int i = 0; i < tiles.size(); i++) {
    if (x + tileSize > width) {
      x = 0;
      y += tileSize;
    }
    float[] c = (float[]) tiles.get(i);
    noStroke();
    fill(c[0], c[1], c[2]);
    rect(x, y, tileSize, tileSize);
    x += tileSize;
  }
}

void drawDirections() {
  int x = 20;
  int y = height - 100;
  fill(10, 50);
  noStroke();
  rect(x, y, 170, 80, 10, 10, 10, 10);
  fill(255);
  text("r\ns\n1-9", x + 10, y + 10, 170, 80);
  text(" - restart\n - start / stop\n - set speed", x + 40, y + 10, 170, 80);
}

void drawScore() {
  for (int i = 0; i < tiles.size(); i++) {
    ColorTime ct = (ColorTime) tiles.get(i);
    println(ct.c1);
  }
  println(tiles);
  if (tiles.size() < 2) {
    return;
  }
  int x = 0;
  int y = 0;
  int sum = 0;
  for (int i = 0; i < tiles.size(); i++) {
    ColorTime ct = (ColorTime) tiles.get(i);
    sum += ct.ticks;
  }
  int unitWidth = width / sum;
  for (int i = 0; i < tiles.size(); i++) {
    ColorTime ct = (ColorTime) tiles.get(i);
    int gradientWidth = unitWidth * ct.ticks;
    // println(ct.c1);
    println(ct.c2);
    setGradient(x, y, gradientWidth, 40, ct.c1, ct.c2, X_AXIS);
    x += gradientWidth;
  }
  
}

//void drawScore() {
//  if (tiles.size() < 2) {
//    return;
//  }
//  int x = 0;
//  int y = 0;
//  int gradientHeight = 40;
//  float gradientWidth = width / (float) (tiles.size() - 1);
//  for (int i = 1; i < tiles.size(); i++) {
//    float[] tile1 = (float[]) tiles.get(i-1);
//    float[] tile2 = (float[]) tiles.get(i);
//    color c1 = color(tile1[0], tile1[1], tile1[2]);
//    color c2 = color(tile2[0], tile2[1], tile2[2]);
//    setGradient(x, y, gradientWidth, gradientHeight, c1, c2, X_AXIS);
    
//    if (x + gradientWidth >= width) {
//      x = 0;
//      y += gradientHeight;
//    } else {
//      x += gradientWidth;
//    }
//  }
//}

void hideScore() {
  fill(0);
  rect(0, 0, width, 40);
}

void setGradient(int x, int y, float w, float h, color c1, color c2, int axis ) {
  noFill();
  if (axis == Y_AXIS) {  
    // Top to bottom gradient
    for (int i = y; i <= y+h; i++) {
      float inter = map(i, y, y+h, 0, 1);
      color c = lerpColor(c1, c2, inter);
      stroke(c);
      line(x, i, x+w, i);
    }
  }  
  else if (axis == X_AXIS) {  
    // Left to right gradient
    for (int i = x; i <= x+w; i++) {
      float inter = map(i, x, x+w, 0, 1);
      color c = lerpColor(c1, c2, inter);
      stroke(c);
      line(i, y, i, y+h);
    }
  }
}

void draw() {
  background(0);
  if (frame > changeTime) {
    if (newChangeTime != changeTime) {
      changeTime = newChangeTime;
    }
    frame = 1;
    float[] c1 = {prevColor[0], prevColor[1], prevColor[2]};
    float[] c2 = {nextColor[0], nextColor[1], nextColor[2]};
    tiles.add(new ColorTime(c1, c2, changeTime / 60));
  }
  if (frame == 1) {
    for (int i = 0; i < nextColor.length; i++) {
      prevColor[i] = nextColor[i];
      nextColor[i] = random(255);
      differenceVector[i] = nextColor[i] - prevColor[i];
    }
  }
  
  for (int i = 0; i < prevColor.length; i++) {
    newColor[i] = prevColor[i] + (differenceVector[i] * (frame / (float) changeTime));
    // println((differenceVector[i] * (frame * (float) changeTime)));
  }
  noStroke();
  fill(newColor[0], newColor[1], newColor[2]);
  rect(0, 40, width, height - 40);
  drawDirections();
  frame++;
}

void keyPressed() {
  if (key == 'r' || key == 'R') {
    setup();
  } else if (key == 's' || key == 'S') {
    if (paused) {
      loop();
      paused = false;
      hideScore();
    } else {
      noLoop();
      paused = true;
      drawScore();
    }
  } else if (key == 'd' || key == 'D') {
    
  } else if (key >= '1' && key <= '9') {
    int num = key - '0'; 
    newChangeTime = num * 60;
  }
}