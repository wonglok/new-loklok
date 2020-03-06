if (process.env.NODE_ENV === 'development') {
  require('./src/human/vue-entrty')
}

module.exports = {
  devServer: {
    // proxy: {
    //   // netlify dev with functions
    //   '/.netlify/functions/': {
    //     target: 'http://localhost:8888'
    //   }
    // }
    // proxy: 'http://tunnel.wonglok.com:8080'
  },
  css: {
    extract: false
  },
  configureWebpack: {
    plugins: [
      // new MonacoWebpackPlugin()
    ]
  }
}
