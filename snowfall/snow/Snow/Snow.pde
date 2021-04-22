SnowFlake[] snow = new SnowFlake[width*5];

void setup() {
  frameRate(30);
  fullScreen();
  for (int i = 0; i < snow.length; i++) {
    snow[i] = new SnowFlake();
  }
}

void draw() {
  background(0);
  for (int i = 0; i < snow.length; i++) {
    snow[i].fall();
    snow[i].show();
  }
}


class SnowFlake {
  float x, y, z, r;
  float speed;
  int direction;

  SnowFlake() {
    x = random(width);
    y = random(height);
    z = random(0, 10);
    r = random(5, 15);
    speed = map(r, 5, 15, 0.5, 1);
    
    float rand = random(3);
    if (rand < 1)
      direction = 0;
    else if (rand < 2)
      direction = 1;
    else if (rand < 3)
      direction = 3;
  }

  void fall() {
    y += speed;
    if (direction == 0)
      x += map(15 - r, 0, 5, 0.1, 0.2);
    else if (direction == 2)
      x -= map(15 - r, 0, 5, 0.1, 0.2);
    
    if (y > height) {
      y = 0;
    }
    if (random(1) < 0.005)
      if (direction == 0 || direction == 2)
        direction = 1;
      else if (direction == 1)
        if (random(1) < 0.5)
          direction = 0;
        else
          direction = 2;
  }

  void show() {
    noStroke();
    float size = map(r, 5, 15, 1, z);
    ellipse(x, y, size, size);
  }
}

void star(float x, float y, float radius1, float radius2, int npoints) {
  float angle = TWO_PI / npoints;
  float halfAngle = angle/2.0;
  beginShape();
  for (float a = 0; a < TWO_PI; a += angle) {
    float sx = x + cos(a) * radius2;
    float sy = y + sin(a) * radius2;
    vertex(sx, sy);
    sx = x + cos(a+halfAngle) * radius1;
    sy = y + sin(a+halfAngle) * radius1;
    vertex(sx, sy);
  }
  endShape(CLOSE);
}