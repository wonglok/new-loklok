require('./diff-cam-adapter.js')

function isAndroid () {
  return /Android/i.test(navigator.userAgent)
}

function isiOS () {
  return /iPhone|iPad|iPod/i.test(navigator.userAgent)
}

function isMobile () {
  return isAndroid() || isiOS()
}

const maxVideoSize = 530

var DiffCamEngine = require('./diff-cam').default
export const setup = async () => {
  var api = {
    loaded: false
  }

  // var $motionBox = {
  //   css: (obj) => {
  //     // console.log(obj)
  //   }
  // }

  function initSuccess () {
    DiffCamEngine.start()
  }

  function initError () {
    console.log('Something went wrong.')
  }

  function startComplete () {
  }

  let vars = {
    bw: 640,
    bh: 480,
    left: 0,
    top: 0,
    right: 0,
    width: 0,
    height: 0,

    lt: 0,
    lr: 0,
    lw: 0,
    lh: 0,

    vt: 0,
    vr: 0,
    vw: 0,
    vh: 0,

    cx: 0,
    cy: 0,

    active: false
  }

  var output = false

  // let show = () => {
  //   $motionBox.css({
  //     display: 'block'
  //   })
  // }

  // let hide = () => {
  //   $motionBox.css({
  //     display: 'none'
  //   })
  // }

  setInterval(() => {
    vars.vt += (vars.top - vars.vt) * 0.15
    vars.vr += (vars.right - vars.vr) * 0.15
    vars.vw += (vars.width - vars.vw) * 0.15
    vars.vh += (vars.height - vars.vh) * 0.15

    output = {
      ...vars
    }

    output.x = (vars.bw - vars.vr) / vars.bw
    output.y = (vars.bh - vars.vt) / vars.bh

    output.x = output.cx * 2.0 - 1
    output.y = output.cy * 2.0 - 1
  }, 1000 / 120)

  function capture (payload) {
    var scale = 10 // capture resolution over motion resolution
    var box = payload.motionBox
    if (box) {
      let o = {}
      // video is flipped, so we're positioning from right instead of left
      o.right = box.x.min * scale + 1
      o.top = box.y.min * scale + 1
      o.width = (box.x.max - box.x.min) * scale
      o.height = (box.y.max - box.y.min) * scale

      if (vars.top === o.top && vars.right === o.right) {
        vars.active = false
        // hide()
      } else {
        vars.active = true
        // show()
      }
      vars.right = box.x.min * scale + 1
      vars.top = box.y.min * scale + 1
      vars.width = (box.x.max - box.x.min) * scale
      vars.height = (box.y.max - box.y.min) * scale
    } else {
      // if (vars.lt === vars.top && vars.lr === vars.right) {
      //   vars.active = false
      //   // hide()
      // }
      vars.lt = vars.top
      vars.lr = vars.right
    }
  }

  async function setupCamera () {
    let video = document.createElement('video')
    // const video = document.getElementById('video')
    video.width = maxVideoSize
    video.height = maxVideoSize

    document.body.appendChild(video)
    video.style.position = 'fixed'
    video.style.top = '0px'
    video.style.right = '0px'
    video.style.zIndex = '-1'
    video.style.opacity = 0.00001

    if (process.env.NODE_ENV === 'development') {
      video.style.zIndex = '100'
      video.style.opacity = 0.5
      video.style.width = '150px'
      video.style.height = '150px'
      video.style.transform = 'scaleX(-1)'
    } else {
    }

    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      const mobile = isMobile()
      const stream = await navigator.mediaDevices.getUserMedia({
        'audio': false,
        'video': {
          facingMode: 'user',
          width: mobile ? undefined : maxVideoSize,
          height: mobile ? undefined : maxVideoSize
        }
      })
      video.srcObject = stream

      return new Promise(resolve => {
        video.onloadedmetadata = () => {
          resolve(video)
        }
      })
    } else {
      const errorMessage = 'This browser does not support video capture, or this device does not have a camera'
      alert(errorMessage)
      return Promise.reject(errorMessage)
    }
  }

  async function loadVideo () {
    const video = await setupCamera()
    video.play()

    return video
  }
  let video = await loadVideo()

  api.video = video

  window.addEventListener('touchstart', () => {
    if (video.paused) {
      video.play()
    }
  })
  window.addEventListener('click', () => {
    if (video.paused) {
      video.play()
    }
  })

  video.addEventListener('loadeddata', () => {
    api.loaded = true
  })

  navigator.mediaDevices.getUserMedia({ audio: false, video: true }).then((stream) => {
    video.autoplay = true
    video.muted = true
    video.srcObject = stream
    // video.play()
    video.setAttribute('playsinline', true)
  })

  api.pause = () => {
    if (video.paused) {
      video.play()
    } else {
      video.pause()
    }
  }

  api.update = () => {
    return {
      video,
      output
    }
  }

  DiffCamEngine.init({
    video,
    captureIntervalTime: 50,
    includeMotionBox: true,
    includeMotionPixels: false,
    captureWidth: 640,
    captureHeight: 480,
    initSuccessCallback: initSuccess,
    initErrorCallback: initError,
    startCompleteCallback: startComplete,
    captureCallback: capture
  })
  return api
}

/*
var listener = new THREE.AudioListener();
camera.add( listener );

navigator.mediaDevices.getUserMedia( { sound: true, video: false } ).then( handleSuccess );

function handleSuccess( stream ) {

    var sound = new THREE.Audio( listener );
}
*/
