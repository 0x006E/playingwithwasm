var instance;
var str = [];
var imageData;
onmessage = function (e) {
  switch (e.data.EVENT) {
    case "INITIALIZE":
      const memory = new WebAssembly.Memory({ initial: 1000, maximum: 1000 });
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
              imageData.width * 2,
              imageData.height * 2
            );
            const screen = new Uint8ClampedArray(
              memory.buffer,
              screenPointer,
              imageData.width * imageData.height * 4 * 4
            );
            const img = new ImageData(
              screen,
              imageData.width * 2,
              imageData.height * 2
            );
            instance.exports.loop(screenPointer, imageData.width);
            console.log(instance.exports.sin_test(3.14));
            console.log(Math.sin(3.14));

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
