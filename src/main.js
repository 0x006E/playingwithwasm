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
