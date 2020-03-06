import { Vector3, Vector2, Color } from 'three'
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
    let hostname = location.hostname
    let socket = io(`http://${hostname}:2329`)
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

  let transformer = (obj) => {
    let val = obj.value
    if (obj.type === 'vec3') {
      return new Vector3(val.x, val.y, val.z)
    } else if (obj.type === 'vec2') {
      return new Vector2(val.x, val.y)
    } else if (obj.type === 'color') {
      return new Color(val.r / 255, val.g / 255, val.b / 255)
    } else {
      return val.value
    }
  }

  let surge = (gpkn, streamFn, auto) => {
    let obj = sdk.list.find(e => (e.group + '.' + e.key) === gpkn)
    if (auto) {
      streamFn(transformer(obj))
    }
    streamFn(obj)
  }

  sdk.pulse = (gpkn, streamFn, auto) => {
    sdk._.pulses[gpkn] = () => {
      surge(gpkn, streamFn, auto)
    }
    surge(gpkn, streamFn, auto)
  }

  sdk.get = (gpkn) => {
    let obj = sdk.list.find(e => (e.group + '.' + e.key) === gpkn)
    return obj
  }

  sdk.getGroup = (group) => {
    return {
      autoGet: (kn) => {
        let groupItems = sdk.list.filter(e => e.group === group)
        let obj = groupItems.find(t => t.key === kn)
        return transformer(obj)
      },
      get: (kn) => {
        let groupItems = sdk.list.filter(e => e.group === group)
        return groupItems.find(t => t.key === kn)
      },
      pulse: (kn, streamFn, { auto = false } = {}) => {
        return sdk.pulse(`${group}.${kn}`, streamFn, auto)
      }
    }
  }
  return sdk
}
