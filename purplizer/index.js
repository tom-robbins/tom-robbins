var DEFAULT_TEMPO = 120;
var DEFAULT_SLOW_RATIO = 0.7333;

var RECORD_SCENE_INCR = 0;
var CURRENT_RECORD_SCENE;

var MOBILE_FILE = undefined;

function incrRecordScene() {
  RECORD_SCENE_INCR += 1;
  CURRENT_RECORD_SCENE = `record ${RECORD_SCENE_INCR}`;
}

var PADDING = 40;
var FONT_FAMILY = ["Arial", "Helvetica", "sans-serif"];

var AudioContext =
  window.AudioContext || // Default
  window.webkitAudioContext || // Safari and old versions of Chrome
  false;

class TextButton extends Phaser.GameObjects.Text {
  constructor(scene, x, y, text, style, callback) {
    style = {
      color: "#ffffff",
      padding: {
        x: 5,
        y: 5,
      },
      fontSize: "64px",
      fontFamily: FONT_FAMILY,
      ...style,
    };
    super(scene, x, y, text, style);
    this.setScale(0.5);
    this.setInteractive({ useHandCursor: true })
      .on("pointerover", () => {
        this.setTint(0xe0e0e0);
      })
      .on("pointerout", () => {
        this.setTint(0xffffff);
      })
      .on("pointerup", () => {
        callback();
      });
  }
}

class TextInput extends Phaser.GameObjects.Text {
  constructor(scene, x, y, text, style, callback) {
    style = {
      backgroundColor: "#ffffff",
      color: "#000000",
      fontFamily: FONT_FAMILY,
      ...style,
    };
    super(scene, x, y, text, style);

    this.setInteractive({ cursor: "text" }).on("pointerdown", () => {
      this.select();
    });
    this.callback = callback;
  }

  select() {
    this.setText("");
    this.scene.input.keyboard.off("keydown").off("keyup");
    this.scene.input.keyboard.on("keydown", (event) =>
      this.keyboardInput(event)
    );
  }

  keyboardInput(event) {
    // JANK lol
    event.stopImmediatePropagation();
    event.stopPropagation();
    if (event.type === "keydown") {
      if (event.key === "Backspace") {
        this.setText(this.text.slice(0, -1));
      } else if (event.key.match(/^[a-z0-9.]$/i)) {
        this.setText(this.text + event.key);
      }
    }
    this.callback(this.text);
  }
}

class BaseScene extends Phaser.Scene {
  constructor(key) {
    super(key);
  }
  preload() {}
  create() {
    // Background
    this.add
      .rectangle(0, 0, this.scale.width, this.scale.height, 0x9932cc)
      .setOrigin(0);
  }
  update() {}
}

class FileDropScene extends BaseScene {
  constructor(key) {
    super(key);
  }

  create() {
    super.create();

    // Upload File Overlay
    var text = this.add
      .text(this.scale.width / 2, this.scale.height / 2, "Upload File")
      .setOrigin(0.5);
    var overlay = this.add
      .rectangle(0, 0, this.scale.width, this.scale.height, 0xffffff, 0.5)
      .setOrigin(0);
    var uploadFileLayer = this.add.layer();
    uploadFileLayer.add([overlay, text]);
    uploadFileLayer.setAlpha(0);

    // File Drag & Drop
    this.dropFile = document.getElementById("drop-file");

    // Event Listeners - use arrow functions to maintain 'this'
    var preventDefaults = (e) => {
      e.preventDefault();
      e.stopPropagation();
    };

    var dragEnterHandler = () => {
      uploadFileLayer.setAlpha(1);
    };

    var dragLeaveHandler = () => {
      uploadFileLayer.setAlpha(0);
    };

    var handleAudioFile = (file) => {
      if (!file.type.startsWith("audio/")) {
        alert(`${file.name} is not an audio file`);
        return;
      }
      incrRecordScene();
      this.game.scene.add(
        CURRENT_RECORD_SCENE,
        new RecordScene(CURRENT_RECORD_SCENE)
      );
      this.dropFile.removeEventListener("dragenter", dragEnterHandler);
      this.dropFile.removeEventListener("dragover", dragEnterHandler);
      this.dropFile.removeEventListener("dragleave", dragLeaveHandler);
      this.dropFile.removeEventListener("drop", dragLeaveHandler);
      this.dropFile.removeEventListener("drop", dropHandler);
      this.scene.start(CURRENT_RECORD_SCENE, { file });
    };

    var dropHandler = (e) => {
      handleAudioFile(e.dataTransfer.files[0]);
    };

    // Add Event Listeners
    ["dragenter", "dragover", "dragleave", "drop"].forEach((eventName) => {
      this.dropFile.addEventListener(eventName, preventDefaults, false);
    });

    this.dropFile.addEventListener("dragenter", dragEnterHandler, false);
    this.dropFile.addEventListener("dragover", dragEnterHandler, false);

    this.dropFile.addEventListener("dragleave", dragLeaveHandler, false);
    this.dropFile.addEventListener("drop", dragLeaveHandler, false);

    this.dropFile.addEventListener("drop", dropHandler, false);

    // JANK way to handle files from mobile?
    if (MOBILE_FILE !== undefined) {
      var f = MOBILE_FILE;
      MOBILE_FILE = undefined;
      handleAudioFile(f);
    }
  }
}

class OpeningScene extends FileDropScene {
  constructor() {
    super({ key: "opening" });
  }

  create() {
    super.create();
    var dragAFileToBeginText = this.add
      .text(
        this.scale.width / 2,
        this.scale.height / 2 - 100,
        "Drag and drop a song to chop and screw"
      )
      .setFontFamily(FONT_FAMILY)
      .setFontSize("32px")
      .setOrigin(0.5);
  }
}

class RecordScene extends FileDropScene {
  constructor(key) {
    super(key);
  }

  preload() {
    super.preload();
    this.load.image("record", "public/images/record.svg");
    this.load.image("redCircle", "public/images/redCircle.png");
  }

  init(data) {
    var fileLoader = document.getElementById("upload-file-container");
    if (fileLoader) {
      fileLoader.remove();
    }

    this.isRecording = false;
    DOWNLOAD_ANCHOR.download =
      (data.file.name.replace(/\.[^/.]+$/, "") || "recording") +
      " [Chopped and Screwed]";

    this.scene.remove(`record ${RECORD_SCENE_INCR - 1}`);

    var songName = `song ${RECORD_SCENE_INCR}`;
    this.load.audio(songName, URL.createObjectURL(data.file));
    this.load.start();

    Analyzer.generate(data.file, {
      canvasWidth: this.scale.width * 0.75,
      canvasHeight: this.scale.height * 0.05,
      waveColor: "#ffffff",
      callbackWaveform: (canvas) => {
        this.waveform = this.textures.addCanvas("waveform", canvas);

        // waveform left of playhead
        this.waveformPlayedTop = this.add
          .image(this.scale.width * 0.125, this.scale.height * 0.1, "waveform")
          .setOrigin(0)
          .setTint(0x4d1966);
        this.waveformPlayedBottom = this.add
          .image(this.scale.width * 0.125, this.scale.height * 0.15, "waveform")
          .setOrigin(0)
          .setFlipY(true)
          .setScale(1, 0.5)
          .setTint(0x3d1452);
        this.waveformPlayedLayer = this.add.container();
        this.waveformPlayedLayer.add([
          this.waveformPlayedTop,
          this.waveformPlayedBottom,
        ]);
        this.waveformPlayedLayer.setDepth(1);

        // waveform right of playhead
        this.waveformUnplayedTop = this.add
          .image(this.scale.width * 0.125, this.scale.height * 0.1, "waveform")
          .setOrigin(0);
        this.waveformUnplayedBottom = this.add
          .image(this.scale.width * 0.125, this.scale.height * 0.15, "waveform")
          .setOrigin(0)
          .setFlipY(true)
          .setScale(1, 0.5)
          .setTint(0xe6e6e6);
        this.waveformUnplayedLayer = this.add.container();
        this.waveformUnplayedLayer.add([
          this.waveformUnplayedTop,
          this.waveformUnplayedBottom,
        ]);
        this.waveformUnplayedLayer.setDepth(1);

        // Make waveform clickable to move playhead
        this.waveformClickRectangle = this.add
          .rectangle(
            this.scale.width * 0.125,
            this.scale.height * 0.1,
            this.scale.width * 0.75,
            this.scale.height * 0.075
          )
          .setOrigin(0)
          .setInteractive({ useHandCursor: true })
          .on("pointerdown", (pointer) => {
            this.initSong();
            this.song.seek =
              ((pointer.x - this.scale.width * 0.125) /
                (this.scale.width * 0.75)) *
              this.song.totalDuration;
            this.playAnimations();
            this.song.resume();
            this.playOrPauseButton.setText("⏸");
          });
      },
      callbackTempo: (topTempos) => {
        this.tempoInput.setText(topTempos[0].tempo);
        this.setTempo(topTempos[0].tempo);
      },
    });
  }

  toggleRecording() {
    if (this.isRecording) {
      this.finishRecording();
    } else {
      this.startRecording();
    }
  }

  updateRecordingText(seconds) {
    if (this.recordingText && AUDIO_RECORDER) {
      var time = AUDIO_RECORDER.startTime
        ? seconds || Date.now() - AUDIO_RECORDER.startTime
        : 0;
      this.recordingText.setText(new Date(time).toISOString().substr(11, 8));
    }
  }

  startRecording() {
    if (AUDIO_RECORDER) {
      this.isRecording = true;
      AUDIO_RECORDER.startRecording();
      this.recordButtonTween.play();
      this.updateRecordingText(0);
    } else {
      alert("Your browser does not support recording audio, sorry 😅");
    }
  }

  finishRecording() {
    if (AUDIO_RECORDER) {
      this.isRecording = false;
      AUDIO_RECORDER.finishRecording();
      this.recordButtonTween.stop(0);
    }
  }

  initSong() {
    if (this.song === undefined) {
      this.song = this.sound
        .add(`song ${RECORD_SCENE_INCR}`)
        .on("complete", () => this.stopSong());
      this.playOrPauseButton.setText("▶️");
      this.song.play();
      this.song.pause();
    }
  }

  stopSong() {
    this.playOrPauseButton.setText("▶️");
    this.song.stop();
    this.pauseAnimations();
  }

  playOrPause() {
    this.initSong();
    if (this.song.isPaused) {
      this.song.resume();
      this.playOrPauseButton.setText("⏸");
      this.playAnimations();
    } else if (this.song.isPlaying) {
      this.song.pause();
      this.playOrPauseButton.setText("▶️");
      this.pauseAnimations();
    } else {
      this.song.play();
      this.playOrPauseButton.setText("⏸");
      this.playAnimations();
    }
  }

  skipToStart() {
    if (this.song) {
      this.song.seek = 0;
    }
    if (this.recordAnimation) {
      this.recordAnimation.seek(0);
    }
  }

  create() {
    super.create();

    // Record Player Interface
    var recordY = this.scale.height * 0.35;
    this.record = this.add
      .image(this.scale.width / 2, recordY, "record")
      .setDisplaySize(this.scale.height / 6, this.scale.height / 6)
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on("pointerdown", () => {
        this.togglePhaser();
      });
    this.recordAnimationDuration = (60 * 1000) / 45; // 45 RPM
    this.recordAnimation = this.tweens.add({
      targets: this.record,
      duration: this.recordAnimationDuration,
      ease: "Linear",
      loop: -1, // Infinite
      angle: {
        getEnd: (target) => target.angle + 360,
        getStart: (target) => target.angle,
      },
      paused: true,
    });
    this.phaserAnimation = this.tweens.add({
      targets: this.record,
      displayWidth: this.scale.height / 5,
      displayHeight: this.scale.height / 5,
      ease: "Quad.easeIn",
      duration: 3000,
      yoyo: true,
      loop: -1,
      paused: true,
    });

    var recordPlayer = this.add.layer();
    recordPlayer.add([this.record]);

    this.setTempo(DEFAULT_TEMPO);
    this.setSlowRatio(DEFAULT_SLOW_RATIO);

    // Transport Controls
    var transportY = recordY;
    var skipToStartButtonX = this.scale.width * 0.25;
    var playOrPauseButtonX = this.scale.width * 0.75;
    var buttonStyle = { fontSize: "256px", padding: { x: 20, y: 20 } };
    this.skipToStartButton = new TextButton(
      this,
      skipToStartButtonX,
      transportY,
      "⏮",
      buttonStyle,
      () => {
        this.skipToStart();
      }
    ).setOrigin(0.5);
    this.playOrPauseButton = new TextButton(
      this,
      playOrPauseButtonX,
      transportY,
      "▶️",
      buttonStyle,
      () => {
        this.playOrPause();
      }
    ).setOrigin(0.5);

    this.add.existing(this.skipToStartButton);
    this.add.existing(this.playOrPauseButton);

    // Tempo Input
    var tempoHeight =
      this.skipToStartButton.y +
      this.skipToStartButton.displayHeight / 2 +
      PADDING;
    this.tempoLabel = this.add
      .text(0, tempoHeight, "Tempo:")
      .setFontFamily(FONT_FAMILY);
    this.tempoInput = new TextInput(
      this,
      0,
      tempoHeight,
      DEFAULT_TEMPO.toString(),
      {
        fixedWidth: this.tempoLabel.displayWidth,
        align: "center",
      },
      (text) => this.setTempo(parseFloat(text))
    );
    this.add.existing(this.tempoInput);
    this.tempoExplanation = this.add
      .text(
        0,
        tempoHeight + this.tempoLabel.displayHeight + PADDING / 2,
        `detected: ${this.tempo}`
      )
      .setFontFamily(FONT_FAMILY);

    this.tempoLabel
      .setX(
        skipToStartButtonX - (PADDING / 4 + this.tempoLabel.displayWidth / 2)
      )
      .setOrigin(0.5);
    this.tempoExplanation.setX(skipToStartButtonX).setOrigin(0.5);
    this.tempoInput
      .setX(
        skipToStartButtonX + (PADDING / 4 + this.tempoLabel.displayWidth / 2)
      )
      .setOrigin(0.5);

    // Slow Input
    var slowHeight = tempoHeight;
    this.slowLabel = this.add
      .text(0, slowHeight, "Slow:")
      .setFontFamily(FONT_FAMILY);
    this.slowInput = new TextInput(
      this,
      0,
      slowHeight,
      DEFAULT_SLOW_RATIO.toString(),
      {
        fixedWidth: this.tempoLabel.displayWidth,
        align: "center",
      },
      (text) => this.setSlowRatio(parseFloat(text))
    );
    this.add.existing(this.slowInput);

    this.slowLabel
      .setX(
        playOrPauseButtonX - (PADDING / 4 + this.slowLabel.displayWidth / 2)
      )
      .setOrigin(0.5);
    this.slowInput
      .setX(
        playOrPauseButtonX + (PADDING / 4 + this.slowInput.displayWidth / 2)
      )
      .setOrigin(0.5);

    // chops
    var baseChopHeight = this.scale.height * (9 / 16);
    this.chopBeats = [0.5, 1, 2, 4];
    this.chops = this.chopBeats.map((chopBeats, i) => {
      var chopHeight =
        baseChopHeight + (this.tempoLabel.displayHeight + PADDING * 2) * i;
      var chop = new TextButton(
        this,
        this.scale.width / 2,
        chopHeight,
        `Chop ${chopBeats} Beat${chopBeats === 1 ? "" : "s"}`,
        {},
        () => {
          if (this.song && this.song.isPlaying) {
            var chopLength = (chopBeats * 60) / this.tempo;
            var chopPosition = this.song.seek + chopLength;
            this.song.seek = chopPosition;
            this.recordScratch();
            this.time.addEvent({
              delay: chopLength * 1000,
              timeScale: this.sound.rate,
              callback: () => {
                this.song.seek = chopPosition;
                this.recordScratch();
              },
            });
          }
        }
      );
      this.add.existing(chop).setOrigin(0.5).setDepth(1);
      var rect = this.add
        .rectangle(
          this.scale.width / 2,
          chopHeight,
          chop.displayWidth + PADDING,
          chop.displayHeight + PADDING / 2,
          0x4d1966
        )
        .setStrokeStyle(2, 0xffffff);

      return chop;
    });

    // recording interface
    // var minWidthOrHeight = Math.min(this.scale.width, this.scale.height);
    // var recordButtonCircleDimensions = [
    //   this.scale.width * 0.8,
    //   this.scale.height * 0.8,
    //   minWidthOrHeight / 20,
    // ];
    // this.recordButtonCircle = this.add
    //   .circle(...recordButtonCircleDimensions)
    //   .setInteractive({ useHandCursor: true })
    //   .on("pointerdown", () => {
    //     this.toggleRecording();
    //   });
    // this.recordButton = this.add
    //   .graphics()
    //   .fillStyle(0xff0000)
    //   .fillCircleShape(this.recordButtonCircle);
    var minWidthOrHeight = Math.min(this.scale.width, this.scale.height);
    this.recordButton = this.add
      .image(
        this.scale.width - minWidthOrHeight * 0.2,
        this.scale.height - minWidthOrHeight * 0.2,
        "redCircle"
      )
      .setOrigin(0.5)
      .setDisplaySize(minWidthOrHeight / 10, minWidthOrHeight / 10)
      .setInteractive({ useHandCursor: true })
      .on("pointerdown", () => {
        this.toggleRecording();
      });

    this.recordButtonTween = this.tweens.add({
      targets: this.recordButton,
      alpha: 0,
      ease: "Cubic.easeIn",
      duration: 500,
      yoyo: true,
      loop: -1,
      paused: true,
    });
    this.recordingText = this.add
      .text(
        this.recordButton.x,
        this.recordButton.y + this.recordButton.displayHeight * 0.75,
        "00:00:00"
      )
      .setOrigin(0.5)
      .setStyle({
        color: "#ffffff",
      });
  }

  recordScratch() {
    this.recordAnimation.stop();
    var currentAngle = this.record.angle;
    this.recordAnimation = this.tweens
      .add({
        targets: this.record,
        duration: this.recordAnimationDuration,
        ease: "Linear",
        loop: -1, // Infinite
        angle: {
          getEnd: (target) => currentAngle + 360 - 30,
          getStart: (target) => currentAngle - 30,
        },
        paused: false,
      })
      .setTimeScale(this.slowRatio);
  }

  setTempo(tempo) {
    var f = parseFloat(tempo);
    if (f) {
      this.tempo = f;
      if (this.tempoExplanation) {
        this.tempoExplanation.setText(`detected: ${f}`);
      }
    }
  }

  setSlowRatio(slowRatio) {
    var f = parseFloat(slowRatio);
    if (f) {
      this.slowRatio = f;
      this.sound.setRate(f);
      this.recordAnimation.setTimeScale(f);
    }
  }

  controlAnimation(animation, playOrPause) {
    if (animation) {
      if (animation.isPlaying()) {
        if (playOrPause === "pause") {
          animation.pause();
        }
      } else if (animation.isPaused()) {
        if (playOrPause === "play") {
          animation.resume();
        }
      } else {
        if (playOrPause === "play") {
          animation.play();
        } else {
          animation.play();
          animation.pause();
        }
      }
    }
  }

  playAnimations() {
    this.controlAnimation(this.recordAnimation, "play");
    if (PHASER.param("mix") !== 0) {
      this.controlAnimation(this.phaserAnimation, "play");
    }
  }

  pauseAnimations() {
    this.controlAnimation(this.recordAnimation, "pause");
    this.controlAnimation(this.phaserAnimation, "pause");
  }

  togglePhaser() {
    if (PHASER.param("mix") === 0) {
      PHASER.param("mix", 0.5);
      if (this.song && this.song.isPlaying) {
        this.controlAnimation(this.phaserAnimation, "play");
      }
    } else {
      PHASER.param("mix", 0);
      this.controlAnimation(this.phaserAnimation, "pause");
    }
  }

  update() {
    super.update();
    this.updateWaveform();
    this.updateRecordingText();
  }

  updateWaveform() {
    if (this.waveform && this.song) {
      var percentComplete = this.song.seek / this.song.totalDuration;

      var shape = this.make.graphics();
      shape.fillStyle(0xffffff);
      shape.beginPath();
      shape.fillRect(
        this.scale.width * 0.125,
        this.scale.height * 0.1,
        this.scale.width * 0.75 * percentComplete,
        this.scale.height * 0.15
      );
      var unplayedMask = shape.createGeometryMask();
      unplayedMask.invertAlpha = true;
      this.waveformUnplayedLayer.setMask(unplayedMask);

      var playedMask = shape.createGeometryMask();
      this.waveformPlayedLayer.setMask(playedMask);
    }
  }

  cleanup() {
    super.cleanup();
    if (this.hasOwnProperty("song")) {
      this.song.destroy();
    }
  }
}

var Analyzer = {
  settings: {
    canvasWidth: 453,
    canvasHeight: 66,
    barWidth: 2,
    barGap: 0.1,
    waveColor: "#666666",
    download: false,
    callbackWaveform: function (canvas) {},
    callbackTempo: function (topTempos) {},
  },

  audioContext: new AudioContext(),

  generate: function (file, options) {
    // preparing canvas
    this.settings.canvas = document.createElement("canvas");
    this.settings.context = this.settings.canvas.getContext("2d");

    this.settings.canvas.width =
      options.canvasWidth !== undefined
        ? parseInt(options.canvasWidth)
        : this.settings.canvasWidth;
    this.settings.canvas.height =
      options.canvasHeight !== undefined
        ? parseInt(options.canvasHeight)
        : this.settings.canvasHeight;

    // setting fill color
    this.settings.waveColor =
      options.waveColor !== undefined
        ? options.waveColor
        : this.settings.waveColor;

    // setting bars width and gap
    this.settings.barWidth =
      options.barWidth !== undefined
        ? parseInt(options.barWidth)
        : this.settings.barWidth;
    this.settings.barGap =
      options.barGap !== undefined
        ? parseFloat(options.barGap)
        : this.settings.barGap;

    this.settings.download =
      options.download !== undefined
        ? options.download
        : this.settings.download;

    this.settings.callbackWaveform =
      options.callbackWaveform !== undefined
        ? options.callbackWaveform
        : this.settings.callbackWaveform;

    this.settings.callbackTempo =
      options.callbackTempo !== undefined
        ? options.callbackTempo
        : this.settings.callbackTempo;

    // read file buffer
    var reader = new FileReader();
    reader.onload = (event) => {
      Analyzer.audioContext.decodeAudioData(event.target.result, (buffer) => {
        Analyzer.extractBuffer(buffer);
        analyzeTempo(buffer, this.settings.callbackTempo);
      });
    };
    reader.readAsArrayBuffer(file);
  },

  extractBuffer: function (buffer) {
    buffer = buffer.getChannelData(0);
    var sections = this.settings.canvas.width;
    var len = Math.floor(buffer.length / sections);
    var maxHeight = this.settings.canvas.height;
    var vals = [];
    for (var i = 0; i < sections; i += this.settings.barWidth) {
      vals.push(this.bufferMeasure(i * len, len, buffer) * 10000);
    }

    for (var j = 0; j < sections; j += this.settings.barWidth) {
      var scale = maxHeight / Math.max.apply(null, vals);
      var val = this.bufferMeasure(j * len, len, buffer) * 10000;
      val *= scale;
      val += 1;
      this.drawBar(j, val);
    }

    this.settings.callbackWaveform(this.settings.canvas);
    // clear canvas for redrawing
    this.settings.context.clearRect(
      0,
      0,
      this.settings.canvas.width,
      this.settings.canvas.height
    );
  },

  bufferMeasure: function (position, length, data) {
    var sum = 0.0;
    for (var i = position; i <= position + length - 1; i++) {
      sum += Math.pow(data[i], 2);
    }
    return Math.sqrt(sum / data.length);
  },

  drawBar: function (i, h) {
    this.settings.context.fillStyle = this.settings.waveColor;

    var w = this.settings.barWidth;
    if (this.settings.barGap !== 0) {
      w *= Math.abs(1 - this.settings.barGap);
    }
    var x = i + w / 2,
      y = this.settings.canvas.height - h;

    this.settings.context.fillRect(x, y, w, h);
  },

  generateImage: function () {
    var image = this.settings.canvas.toDataURL("image/png");

    var link = document.createElement("a");
    link.href = image;
    link.setAttribute("download", "");
    link.click();
  },
};

// JANK way to handle a file from mobile?
if (
  new URLSearchParams(window.location.search).get("mobile") ||
  /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
) {
  document.body.insertAdjacentHTML(
    "beforeend",
    `<div id="upload-file-container">
        <label id="upload-file-label" for="file-loader"> tap to upload a song </label>
        <input id="file-loader" type="file" accept="audio/*" />
    </div>`
  );

  document.getElementById("file-loader").addEventListener("change", (e) => {
    MOBILE_FILE = e.target.files[0];
    document.getElementById("upload-file-container").remove();
    makeGame();
  });
} else {
  makeGame();
}

var GAME;
var PHASER;
var DOWNLOAD_ANCHOR = document.getElementById("download-anchor");
var AUDIO_RECORDER;
try {
  AUDIO_RECORDER = new WebAudioRecorder(PHASER.OUTPUT, {
    workerDir: "webAudioRecorder/",
    encoding: "wav",
    options: {
      timeLimit: 3600,
      encodeAfterRecord: true,
    },
    onComplete: (rec, blob) => {
      DOWNLOAD_ANCHOR.href = URL.createObjectURL(blob);
      DOWNLOAD_ANCHOR.click();
    },
  });
} catch (e) {
  console.log(e);
}

function makeGame() {
  GAME = new Phaser.Game({
    type: Phaser.AUTO,
    scale: {
      parent: "game-container",
      mode: Phaser.Scale.FIT,
      width: "100%",
      height: "100%",
    },
    scene: [new OpeningScene()],
  });
  GAME.sound.pauseOnBlur = false;

  // XAudio
  var context = GAME.sound.context;
  GAME.sound.masterVolumeNode.disconnect();

  PHASER = new X.Phaser(context, 0);
  PHASER.param("stage", 24);
  PHASER.param("frequency", 1200);
  PHASER.param("resonance", 200);
  PHASER.param("depth", 0.3);
  PHASER.param("rate", 0.1);
  PHASER.param("mix", 0); // a good val is 0.5
  PHASER.param("feedback", 0.5);
  PHASER.state(true);
  GAME.sound.masterVolumeNode.connect(PHASER.INPUT);
  PHASER.OUTPUT.connect(context.destination);

  // FLANGER = new X.Flanger(context, 0);
  // FLANGER.param("time", 0.003);
  // FLANGER.param("depth", 0.8);
  // FLANGER.param("rate", 0.05);
  // FLANGER.param("mix", 0.7);
  // FLANGER.param("tone", 1500);
  // FLANGER.param("feedback", 0.3);
  // FLANGER.state(true);
  // GAME.sound.destination.connect(FLANGER.INPUT);
  // FLANGER.OUTPUT.connect(context.destination);
}
