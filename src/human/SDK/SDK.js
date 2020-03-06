let waitGet = ({ getter }) => {
  return new Promise((resolve) => {
    let tout = setInterval(() => {
      let res = getter()
      if (res) {
        clearInterval(tout)
        resolve(res)
      }
    })
  })
}

export const makeSDK = async () => {
  // let getID = () => '_' + (Math.random() * 1000000).toFixed(0) + ''
  let sdk = {
    ready: false,
    _: {
      pulses: {}
    },
    data: {
      objects: []
    },
    get list () {
      return sdk.data.objects
    },
    get root () {
      return sdk.data
    },
    // editor: getID(),
    sendPulse: (gp, kn) => {
      let all = sdk._.pulses
      let fn = all[gp + '.' + kn] || (() => {})
      fn()
    }
  }
  // code shake
  if (process.env.NODE_ENV === 'development') {
    let io = require('socket.io-client')
    let socket = io('http://localhost:2329')
    sdk.socket = socket

    socket.emit('init-request', {}, (data) => {
      for (var kn in data) {
        sdk.data[kn] = data[kn]
      }
      sdk.ready = true
    })

    socket.on('down-add', (adder) => {
      sdk.data.objects.push(adder)
      sdk.sendPulse(adder.group, adder.key)
    })

    socket.on('down-remove', (remover) => {
      let arr = sdk.data.objects
      arr.splice(arr.findIndex(e => e.id === remover.id, 1), 1)
      sdk.sendPulse(remover.group, remover.key)
    })

    // UPDATE
    socket.on('down-update', ({ editor, updater }) => {
      // if this isn't myself then update it
      let arr = sdk.data.objects
      let idx = arr.findIndex(e => e.id === updater.id, 1)
      arr[idx] = updater
      sdk.sendPulse(updater.group, updater.key)
    })

    // make sure data is ready so that APIs are correct
    await waitGet({
      getter: () => {
        return sdk.ready
      }
    })
  }

  if (process.env.NODE_ENV === 'production') {
    sdk.data = require('../data/db.json')
    sdk.ready = true
  }

  let surge = (gpkn, streamFn) => {
    let obj = sdk.list.find(e => (e.group + '.' + e.key) === gpkn)
    streamFn(obj)
  }

  sdk.pulse = (gpkn, streamFn) => {
    sdk._.pulses[gpkn] = () => {
      surge(gpkn, streamFn)
    }
    surge(gpkn, streamFn)
  }

  return sdk
}
