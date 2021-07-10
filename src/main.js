const cvs = document.getElementById("canvas");
const ctx = cvs.getContext("2d");
cvs.width = window.innerWidth;
cvs.height = window.innerHeight;
canvasWidth = canvas.width;
canvasHeight = canvas.height;
var imageData = ctx.getImageData(0, 0, canvasWidth, canvasHeight);

var buf = new ArrayBuffer(imageData.data.length);
var buf8 = new Uint8ClampedArray(buf);
var data = new Uint32Array(buf);

// Determine whether Uint32 is little- or big-endian.
data[1] = 0x0a0b0c0d;

var isLittleEndian = true;
if (buf[4] === 0x0a && buf[5] === 0x0b && buf[6] === 0x0c && buf[7] === 0x0d) {
  isLittleEndian = false;
}

function draw(x, y, colors = [0, 0, 0]) {
  if (isLittleEndian) {
    data[y * canvasWidth + x] =
      (255 << 24) | // alpha
      (colors[2] << 16) | // blue
      (colors[1] << 8) | // green
      colors[0]; // red
  } else {
    data[y * canvasWidth + x] =
      (colors[0] << 24) | // red
      (colors[1] << 16) | // green
      (colors[2] << 8) | // blue
      255; // alpha
  }
}

if (isLittleEndian) {
  for (var y = 0; y < canvasHeight; ++y) {
    for (var x = 0; x < canvasWidth; ++x) {
      var value = 0;

      data[y * canvasWidth + x] =
        (255 << 24) | // alpha
        (value << 16) | // blue
        (value << 8) | // green
        value; // red
    }
  }
} else {
  for (y = 0; y < canvasHeight; ++y) {
    for (x = 0; x < canvasWidth; ++x) {
      value = 137;

      data[y * canvasWidth + x] =
        (value << 24) | // red
        (value << 16) | // green
        (value << 8) | // blue
        255; // alpha
    }
  }
}

imageData.data.set(buf8);

ctx.putImageData(imageData, 0, 0);
const offscreen = cvs.transferControlToOffscreen();

const workerCode = document.getElementById("worker").textContent;
const blob = new Blob([workerCode], { type: "text/javascript" });
const url = URL.createObjectURL(blob);
const worker = new Worker(url);

worker.postMessage({ msg: "start", isLittleEndian: isLittleEndian });

str = [];
fetch("../out/play.wasm")
  .then((response) => response.arrayBuffer())
  .then((bytes) =>
    WebAssembly.instantiate(bytes, {
      env: {
        putc_js: function (c) {
          if (c === 0) {
            console.log(str.join(""));
            str = [];
          } else str.push(String.fromCharCode(c));
        },
      },
    })
  )
  .then((results) => {
    instance = results.instance;
    instance.exports.main();
  });
