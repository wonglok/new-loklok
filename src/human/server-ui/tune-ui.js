// Controllers
let io = require('socket.io-client')
function uniq (value, index, arr) {
  return arr.indexOf(value) === index
}
let getID = () => '_' + (Math.random() * 1000000).toFixed(0) + ''
export const makeAPI = async ({ ui }) => {
  let app = {
    _: {
      space: {},
      selected: {
        groupItem: false,
        group: false
      }
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
    editor: (Math.random() * 1000000).toFixed(0) + '',
    selected: {
      get group () {
        if (app._.selected.group) {
          return app._.selected.group
        } else {
          return false
        }
      },
      get groupItem () {
        if (app._.selected.groupItem) {
          return app.list.find(e => e.id === app._.selected.groupItem)
        } else {
          return false
        }
      },
      get groupItems () {
        if (app._.selected.group) {
          return app.list.filter(e => e.group === app._.selected.group)
        } else {
          return false
        }
      }
    },
    get groupNames () {
      return app.list.map(e => e.group).filter(uniq)
    }
  }

  let hostname = location.hostname
  let socket = io(`http://${hostname}:2329`)
  app.socket = socket

  socket.emit('init-request', {}, (data) => {
    for (var kn in data) {
      app.data[kn] = data[kn]
    }
    ui.$forceUpdate()
    if (app.groupNames[0]) {
      app.select(app.groupNames[0])
    }
    if (app.selected.groupItems[0]) {
      app.selectGroupItem(app.selected.groupItems[0].id)
    }
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

    if (!app.groupNames.includes(remover.group)) {
      app.select(false)
      app.selectGroupItem(false)
    }
  })

  // UPDATE
  let tout = 0
  app.updateLater = (updater) => {
    socket.emit('up-update-nosave', { editor: app.editor, updater })
    clearTimeout(tout)
    tout = setTimeout(() => {
      socket.emit('up-update-saveonly', { editor: app.editor, updater })
    }, 100)
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

  app.changeGroupName = (oldname, newname) => {
    let items = app.list.filter(e => e.group === oldname)
    items.forEach((item) => {
      item.group = newname
      app.updateNow(item)
    })
  }

  app.cloneGroupAndRename = (oldname, newname) => {
    let items = app.list.filter(e => e.group === oldname)
    let cloned = JSON.parse(JSON.stringify(items))
    cloned.forEach((item) => {
      item.id = getID()
      item.group = newname
      app.add(item)
    })
  }

  app.removeGroup = (gp) => {
    let items = app.list.filter(e => e.group === gp)
    items.forEach((item) => {
      app.remove(item)
    })
    app.select(false)
    app.selectGroupItem(false)
  }

  app.select = (gp) => {
    app._.selected.group = gp
    app._.selected.groupItem = false
  }
  app.isSelected = (gp) => {
    return app._.selected.group === gp
  }

  app.selectGroupItem = (gid) => {
    app._.selected.groupItem = gid
  }
  app.isSelectedGroupItem = (gid) => {
    return app._.selected.groupItem === gid
  }
  return app
}
