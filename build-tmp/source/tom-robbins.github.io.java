import processing.core.*; 
import processing.data.*; 
import processing.event.*; 
import processing.opengl.*; 

import java.util.HashMap; 
import java.util.ArrayList; 
import java.io.File; 
import java.io.BufferedReader; 
import java.io.PrintWriter; 
import java.io.InputStream; 
import java.io.OutputStream; 
import java.io.IOException; 

public class tom-robbins.github.io extends PApplet {

/* ArrayList<TriangleClass> triangles;
final float side = 75;
final color COLOR1 = 255, COLOR2 = #ff8025, COLOR3 = 100, COLOR4 = 0;
final float altitude = side * (sqrt(3) / 2);

void setup()
{
  size(820, 640);
  stroke(220);
  smooth();

  triangles = new ArrayList<TriangleClass>();

  for (int y1 = 0; y1 < height + side; y1 += side) {
    // Left-pointing, even columns
    for (int x1 = 0; x1 < width; x1 += 2 * altitude) {
      color MyC1 = color(random (255), random (255), random (255));
      triangles.add(new TriangleClass(false, x1, y1, 255));
    }
    // Right-pointing, odd columns
    for (int x1 = (int) altitude; x1 < width; x1 += 2 * altitude) {
      color MyC1 = color(random (255), random (255), random (255));
      triangles.add(new TriangleClass(true, x1, y1 - (side / 2), 255));
    }
  }

  for (int y1 = 0; y1 < height + side; y1+= side) {
    // Right-pointing, even columns
    for (int x1 = 0; x1 < width; x1+= 2 * altitude) {
      color MyC1 = color(random (255), random (255), random (255));
      triangles.add(new TriangleClass(true, x1, y1, 255));
    }
    // Left-pointing, odd columns
    for (int x1 = (int) altitude; x1 < width; x1+= 2 * altitude) {
      color MyC1 = color(random (255), random (255), random (255));
      triangles.add(new TriangleClass(false, x1, y1 + (side / 2), 255));
    }
  }
}

void draw()
{
  for (int i = 0; i < triangles.size(); i++)
    triangles.get(i).display();
}

void mouseClicked () {
  TriangleClass myCurrentTriangle ;
  for (int i = 0; i < triangles.size(); i++) {
    myCurrentTriangle = triangles.get(i);
    myCurrentTriangle.mouseOver();
  }
}

class TriangleClass {
  float x1, y1, x2, y2, x3, y3;
  color myColor;
  float centerX, centerY;
  boolean isRight;

  TriangleClass(boolean isR, float x, float y, color tempmyColor1) {
    x1 = x;
    y1 = y;
    centerX = x + 21.6;
    isRight = isR;

    if (isRight) {
      x2 = x + altitude;
      y2 = y + side/2;
      x3 = x;
      y3 = y + side;
      centerY = y + side/2;
    } else
    {
      x2 = x + altitude;
      y2 = y - side/2;
      x3 = x + altitude;
      y3 = y + side/2;
      centerY = y;
    }

    myColor=tempmyColor1;
  }

  void mouseOver() {
    boolean isY;
    if (isRight)
      isY = abs(mouseY - centerY) < (side/2 - ((mouseX - x1) / sqrt(3)));
    else
      isY = abs(mouseY - centerY) < (side/2 - ((x2 - mouseX) / sqrt(3)));

    if (mouseX < x2 && mouseX > x1 && isY)
      changeColor();
  }

  void changeColor() {
    if (myColor == COLOR1)
      myColor = COLOR2;
    else if (myColor == COLOR2)
      myColor = COLOR3;
    else if (myColor == COLOR3)
      myColor = COLOR4;
    else
      myColor = COLOR1;
  }

  void display() {
    fill(myColor);
    if (myColor == COLOR1)
      stroke(240);
    else
      noStroke();

    triangle(x1, y1, x2, y2, x3, y3);
  }
} */

public void setup() {
  
  textSize(48);
  textAlign(CENTER);
}


public void draw() {
  background(0xff122389);
  fill(0xffEEDFDF);
  text("Hello World!", width/2, height/2);
}

  public void settings() {  size(400, 200); }
  static public void main(String[] passedArgs) {
    String[] appletArgs = new String[] { "tom-robbins.github.io" };
    if (passedArgs != null) {
      PApplet.main(concat(appletArgs, passedArgs));
    } else {
      PApplet.main(appletArgs);
    }
  }
}
