function touch2Mouse(e) {
  var theTouch = e.changedTouches[0];
  var mouseEv;

  switch (e.type) {
    case "touchstart":
      mouseEv = "mousedown";
      break;
    case "touchend":
      mouseEv = "mouseup";
      break;
    case "touchmove":
      mouseEv = "mousemove";
      break;
    default:
      return;
  }

  var mouseEvent = document.createEvent("MouseEvent");
  mouseEvent.initMouseEvent(
    mouseEv,
    true,
    true,
    window,
    1,
    theTouch.screenX,
    theTouch.screenY,
    theTouch.clientX,
    theTouch.clientY,
    false,
    false,
    false,
    false,
    0,
    null
  );
  theTouch.target.dispatchEvent(mouseEvent);

  e.preventDefault();
}

var touchOpts = { capture: false, passive: false };
document.addEventListener("touchstart", touch2Mouse, true, touchOpts);
document.addEventListener("touchmove", touch2Mouse, true, touchOpts);
document.addEventListener("touchend", touch2Mouse, true, touchOpts);

kaboom.global();
loadSprite("sky", "assets/sky.png");
loadSprite("road", "assets/road.png");
loadSprite("grammy", "assets/grammy.png");
loadSprite("car", "assets/car.png", {
  sliceX: 1,
  sliceY: 2,
  anims: {
    move: [0, 1],
    idle: [0],
  },
});

loadSound("ha", "assets/ha.ogg");
loadSound("lets_go", "assets/lets_go.ogg");
loadSound("yeah_yeah", "assets/yeah_yeah.ogg");
loadSound("levitating", "assets/levitating.mp3");

var HEIGHT = 120;
var WIDTH = 160;
init({
  width: 160,
  height: 120,
  scale: 6,
});

scene("start", () => {
  var size = 8;
  var title = "PRESS SPACE\n  TO PLAY";
  var play = add([
    text(title, size, { width: 88 }),
    pos(WIDTH / 2 - 44, HEIGHT / 2 - 4),
    //   pos(WIDTH / 2 - (title.length / 2) * size, HEIGHT / 2 - size / 2),
    layer("ui"),
  ]);
  keyPress("space", () => {
    go("main");
  });
  mouseClick(() => {
    go("main");
  });
});

scene("main", () => {
  layers(["bg", "game", "ui"], "game");

  const upBound = 40;
  const lowBound = height() - 12;
  const speed = 90;
  let speedMod = 1;

  add([sprite("sky"), layer("bg")]);

  // TODO: make helper for inf scroll backgrounds
  // scrolling road (2 sprites cycling)
  add([sprite("road"), pos(0, 0), layer("bg"), "road"]);

  add([sprite("road"), pos(width() * 2, 0), layer("bg"), "road"]);

  action("road", (r) => {
    r.move(-speed * speedMod, 0);
    if (r.pos.x <= -width() * 2) {
      r.pos.x += width() * 4;
    }
  });

  var levitating = play("levitating", { volume: 0.5 });

  // player
  const car = add([
    sprite("car", { animSpeed: 0.2 }),
    pos(24, height() / 2),
    color(),
    origin("center"),
    area(vec2(-12, -6), vec2(12, 8)),
    {
      speed: 120,
      scale: 0.75,
    },
  ]);

  car.play("move");

  // obj spawn
  loop(rand(1, 3), () => {
    const obj = randl(["grammy"]);
    add([
      sprite(obj),
      "obj",
      obj,
      pos(width(), rand(lowBound, upBound)),
      { scale: 0.5 },
    ]);
  });

  action("obj", (o) => {
    o.move(-speed * speedMod, 0);
    if (o.pos.x <= -width()) {
      destroy(o);
    }
  });

  // collision resolution
  car.collides("grammy", (a) => {
    destroy(a);
    const sound = randl(["ha", "lets_go", "yeah_yeah"]);
    play(sound, {
      speed: (speedMod - 1) / 2 + 1,
    });
    grammys.value += 1;
  });

  // grammys counter
  const grammys = add([
    text("0", 4),
    pos(4, 4),
    layer("ui"),
    {
      value: 0,
    },
  ]);

  grammys.action(() => {
    grammys.text = `grammys: ${grammys.value}`;
  });

  var mouseIsDown = false;
  // input
  keyDown("up", () => {
    if (car.pos.y > upBound) {
      car.move(0, -car.speed);
    }
  });

  keyDown("down", () => {
    if (car.pos.y < lowBound) {
      car.move(0, car.speed);
    }
  });

  keyDown("left", () => {
    speedMod = 0.5;
    car.animSpeed = 0.2 / speedMod;
    levitating.srcNode.playbackRate.value = 0.7;
  });

  keyDown("right", () => {
    speedMod = 2;
    car.animSpeed = 0.2 / speedMod;
    levitating.srcNode.playbackRate.value = 1.3;
  });

  keyRelease(["left", "right"], () => {
    speedMod = 1;
    car.animSpeed = 0.2 / speedMod;
    levitating.srcNode.playbackRate.value = speedMod;
  });

  mouseDown(() => {
    if ((car.pos.y < lowBound) & (car.pos.y < mousePos().y)) {
      car.move(0, car.speed);
    }
    if ((car.pos.y > upBound) & (car.pos.y > mousePos().y)) {
      car.move(0, -car.speed);
    }
  });

  keyPress("f1", () => {
    kaboom.debug.showArea = !kaboom.debug.showArea;
    kaboom.debug.showInfo = !kaboom.debug.showInfo;
  });
});

scene("death", (score) => {
  add([text(score, 24)]);

  add([text("press spacebar to play again", 5), pos(0, -20)]);

  keyPress("space", () => {
    reload("main");
    go("main");
  });
});

start("start");
