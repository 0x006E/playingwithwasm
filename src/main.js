var instance;
var str = [];
var imageData;
onmessage = function (e) {
  switch (e.data.EVENT) {
    case "INITIALIZE":
      const memory = new WebAssembly.Memory({ initial: 500, maximum: 500 });
      imageData = e.data.imageData;
      const canvasWorker = new Worker("canvasWorker.js");
      fetch("../out/play.wasm")
        .then((response) => response.arrayBuffer())
        .then((bytes) =>
          WebAssembly.instantiate(bytes, {
            env: {
              memory: memory,
              putc_js: function (c) {
                postMessage({ log: String.fromCharCode(c) });
              },
            },
          }).then((results) => {
            instance = results.instance;
            instance.exports.main();
            const screenPointer = instance.exports.init(
              imageData.width,
              imageData.height
            );
            const screen = new Uint8ClampedArray(
              memory.buffer,
              screenPointer,
              imageData.width * imageData.height * 4
            );
            const img = new ImageData(
              screen,
              imageData.width,
              imageData.height
            );

            instance.exports.loop(
              screenPointer,
              imageData.width * imageData.height
            );
            const render = () => {
              postMessage({ imageData: img });
              requestAnimationFrame(render);
            };
            requestAnimationFrame(render);
          })
        );

      break;
  }
};
