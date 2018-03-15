float[] prevColor = {255, 255, 255};
float[] nextColor = {255, 255, 255};
float[] differenceVector = new float[3];
int frame = 0;
int changeTime = 360;


void setup() {
  frameRate(60);
  size(640,640);
  background(prevColor[0], prevColor[1], prevColor[2]);
} 

void draw() {
  if (frame == changeTime) {
    frame = 0;
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
  frame++;
}