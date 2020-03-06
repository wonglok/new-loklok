export default async () => {
  let env = {
    _: {
      loop: {},
      resize: {},
      clean: {}
    },
    onLoop: (fn) => {
      let key = Math.random() + ''
      env._.loop[key] = fn
      return () => {
        env._.loop[key] = () => {}
      }
    },
    onResize: (fn) => {
      env._.resize[Math.random() + ''] = fn
    },
    onClean: (fn) => {
      env._.onClean[Math.random() + ''] = fn
    },
    destroy: () => {
      for (var loopKN in env._.loop) {
        env._.loop[loopKN] = () => {}
      }
      for (var cleanKN in env._.clean) {
        env._.clean[cleanKN]()
      }
    }
  }
  let rAFID = 0
  let looper = () => {
    rAFID = requestAnimationFrame(looper)
    for (var loopKN in env._.loop) {
      env._.loop[loopKN]()
    }
  }
  rAFID = requestAnimationFrame(looper)
  env.onClean(() => {
    cancelAnimationFrame(rAFID)
  })

  let resize = () => {
    for (var resizeKN in env._.resize) {
      env._.resize[resizeKN]()
    }
  }
  window.addEventListener('resize', resize, false)
  env.onClean(() => {
    window.removeEventListener('resize', resize, false)
  })

  window.dispatchEvent(new Event('resize'))
  setTimeout(() => {
    window.dispatchEvent(new Event('resize'))
  }, 100)

  return env
}
