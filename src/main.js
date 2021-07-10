const cvs = document.getElementById("canvas");
cvs.width = window.innerWidth;
cvs.height = window.innerHeight;
const offscreen = cvs.transferControlToOffscreen();

const workerCode = document.getElementById("worker").textContent;
const blob = new Blob([workerCode], { type: "text/javascript" });
const url = URL.createObjectURL(blob);
const worker = new Worker(url);
worker.postMessage({ msg: "init", isLittleEndian: isLittleEndian });
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
