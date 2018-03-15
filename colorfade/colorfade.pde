float[] prevColor = {255, 255, 255};
float[] nextColor = {255, 255, 255};
float[] differenceVector = new float[3];

int frame;
int changeTime = 10;

int tileSize = 20;
ArrayList tiles;

PFont light;

boolean paused = false;

void setup() {
  frameRate(60);
  frame = 0;
  
  size(window.innerWidth, window.innerHeight);
  //size(640, 640);
  
  for (int i = 0; i < nextColor.length; i++) {
      prevColor[i] = 255;
      nextColor[i] = 255;
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
  rect(x, y, 170, 80, 10, 10, 10, 10);
  fill(255);
  text("r\ns\nd", x + 10, y + 10, 170, 80); //<>//
  text(" - restart\n - start / stop\n - download score", x + 20, y + 10, 170, 80);
}

void draw() {
  background(255);
  if (frame == changeTime) {
    frame = 0;
    tiles.add(new float[]{nextColor[0], nextColor[1], nextColor[2]}); //<>//
  }
  if (frame == 0) {
    for (int i = 0; i < nextColor.length; i++) {
      prevColor[i] = nextColor[i];
      nextColor[i] = random(255);
      differenceVector[i] = nextColor[i] - prevColor[i];
    }
  }
  for (int i = 0; i < prevColor.length; i++) {
    prevColor[i] += (differenceVector[i] / (float) changeTime);
  }
  background(prevColor[0], prevColor[1], prevColor[2]);
  drawTiles();
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
    } else {
      noLoop();
      paused = true;
    }
  } else if (key == 'd' || key == 'D') {
    
  }
}