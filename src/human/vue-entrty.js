/**
  npm i nodemon socket.io express
  */

var nodemon = require('nodemon')
nodemon({
  script: './src/human/server/server.js',
  watch: './src/human/server',
  ext: 'js'
})
nodemon.on('start', async function () {
  console.log('App has started')
}).on('quit', function () {
  console.log('App has quit')
  // process.exit()
}).on('restart', function (files) {
  console.log('App restarted due to: ', files)
})
