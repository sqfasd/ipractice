module.exports = {
  entry: "./app.js",
  output: {
    filename: "./build/bundle.js"
  },
  module: {
    loaders: [
      { test: /\.styl$/, loader: "style!css!stylus" },
      { test: /\.html$/, loader: "html" }
    ]
  }
}
