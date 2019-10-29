const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin')

// const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin')

module.exports = {
  devServer: {
    // proxy: {
    //   // netlify dev with functions
    //   '/.netlify/functions/': {
    //     target: 'http://localhost:8888'
    //   }
    // }
  },
  css: {
    extract: false
  },
  configureWebpack: {
    plugins: [
      new MonacoWebpackPlugin()
    ]
  }
}
