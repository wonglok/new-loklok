// Controllers
let io = require('socket.io-client')
export const makeAPI = async ({ ui }) => {
  let app = {
    _: {
      space: {}
    },
    data: {
      objects: []
    },
    get list () {
      return app.data.objects
    },
    get root () {
      return app.data
    },
    editor: (Math.random() * 1000000).toFixed(0) + ''
  }

  let socket = io('http://localhost:2329')
  app.socket = socket

  socket.emit('init-request', {}, (data) => {
    for (var kn in data) {
      app.data[kn] = data[kn]
    }
    ui.$forceUpdate()
  })

  // ADD
  app.add = (adder) => {
    socket.emit('up-add', adder)
  }
  socket.on('down-add', (adder) => {
    app.data.objects.push(adder)
  })

  // REMOVE
  app.remove = (remover) => {
    socket.emit('up-remove', remover)
  }
  socket.on('down-remove', (remover) => {
    let arr = app.data.objects
    arr.splice(arr.findIndex(e => e.id === remover.id, 1), 1)
  })

  // UPDATE
  let tout = 0
  app.updateLater = (updater) => {
    clearTimeout(tout)
    tout = setTimeout(() => {
      socket.emit('up-update', { editor: app.editor, updater })
    }, 50)
  }
  app.updateNow = (updater) => {
    socket.emit('up-update', { editor: app.editor, updater })
  }

  socket.on('down-update', ({ editor, updater }) => {
    // if this isn't myself then update it
    if (app.editor !== editor) {
      console.log('updating')
      let arr = app.data.objects
      let idx = arr.findIndex(e => e.id === updater.id, 1)
      arr[idx] = updater
      ui.$forceUpdate()
    }
  })

  return app
}
