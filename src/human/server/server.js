var app = require('express')()
var server = require('http').Server(app)
var io = require('socket.io')(server)
var path = require('path')
server.listen(2329)
// WARNING: app.listen(80) will NOT work here!

// app.get('/', function (req, res) {
//   res.sendFile(__dirname + '/index.html')
// })

const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')

// const uuid = require('uuid').v4

const adapter = new FileSync(path.join(__dirname, '../data/db.json'))
const db = low(adapter)

// Set some defaults (required if your JSON file is empty)
db.defaults({ objects: [] })
  .write()

// const EventEmitter = require('events').EventEmitter
// const BUS = new EventEmitter()
let NOOP = () => {}

// let getID = () => {
//   return uuid()
// }

let getID = () => '_' + (Math.random() * 1000000).toFixed(0) + ''

io.on('connection', function (socket) {
  // socket.emit('news', { hello: 'world' })
  // socket.on('my other event', function (data) {
  //   console.log(data)
  // })

  socket.on('up-add', (src) => {
    try {
      let id = getID()
      let adder = {
        ...src,
        group: src.group || getID(),
        id
      }
      db.get('objects').push(adder).write()

      io.emit('down-add', adder)
    } catch (e) {

    }
  })

  socket.on('up-remove', (obj) => {
    try {
      db.get('objects')
        .remove({ id: obj.id })
        .write()

      io.emit('down-remove', obj)
    } catch (e) {

    }
  })

  socket.on('up-update', ({ updater, editor }) => {
    try {
      console.log('on update', editor)
      db.get('objects')
        .find({ id: updater.id })
        .assign(updater)
        .write()

      io.emit('down-update', { updater, editor })
    } catch (e) {

    }
  })

  socket.on('up-update-saveonly', ({ updater, editor }) => {
    try {
      console.log('on update', editor)
      db.get('objects')
        .find({ id: updater.id })
        .assign(updater)
        .write()
    } catch (e) {

    }
  })

  socket.on('up-update-nosave', ({ updater, editor }) => {
    io.emit('down-update', { updater, editor })
  })

  socket.on('init-request', (req, fn = NOOP) => {
    let data = db.read().getState()
    fn(data)
  })
})

// // Add a post
// db.get('posts')
//   .push({ id: 1, title: 'lowdb is awesome' })
//   .write()

// // Set a user using Lodash shorthand syntax
// db.set('user.name', 'typicode')
//   .write()

// // Increment count
// db.update('count', n => n + 1)
//   .write()
