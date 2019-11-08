import * as posenet from '@tensorflow-models/posenet'
function isAndroid () {
  return /Android/i.test(navigator.userAgent)
}

function isiOS () {
  return /iPhone|iPad|iPod/i.test(navigator.userAgent)
}

function isMobile () {
  return isAndroid() || isiOS()
}

export const loadPoser = async () => {
  // 0.50, 0.75, 1.00, or 1.01
  const net = await posenet.load()

  // const maxVideoSize = 513
  // const canvasSize = 400

  const state = {
    algorithm: 'multi-pose',
    input: {
      mobileNetArchitecture: isMobile() ? '0.50' : '1.01',
      outputStride: 16,
      imageScaleFactor: 0.5
    },
    singlePoseDetection: {
      minPoseConfidence: 0.1,
      minPartConfidence: 0.5
    },
    multiPoseDetection: {
      maxPoseDetections: 2,
      minPoseConfidence: 0.1,
      minPartConfidence: 0.3,
      nmsRadius: 20.0
    },
    output: {
      showVideo: true,
      showSkeleton: true,
      showPoints: true
    },
    net
  }

  const flipHorizontal = false
  let api = {}

  async function poseDetectionFrame ({ video }) {
    // if (state.changeToArchitecture) {
    //   // Important to purge variables and free up GPU memory
    //   state.net.dispose()

    //   // Load the PoseNet model weights for either the 0.50, 0.75, 1.00, or 1.01 version
    //   state.net = await posenet.load(Number(state.changeToArchitecture))

    //   state.changeToArchitecture = null
    // }

    // Scale an image down to a certain factor. Too large of an image will slow down
    // the GPU
    const imageScaleFactor = state.input.imageScaleFactor
    const outputStride = Number(state.input.outputStride)

    let poses = []
    // var minPoseConfidence = 0
    // var minPartConfidence = 0
    switch (state.algorithm) {
      case 'single-pose':
        const pose = await state.net.estimateSinglePose(video, imageScaleFactor, flipHorizontal, outputStride)
        poses.push(pose)

        // minPoseConfidence = Number(
        //   state.singlePoseDetection.minPoseConfidence)
        // minPartConfidence = Number(
        //   state.singlePoseDetection.minPartConfidence)
        break
      case 'multi-pose':
        poses = await state.net.estimateMultiplePoses(video, imageScaleFactor, flipHorizontal, outputStride,
          state.multiPoseDetection.maxPoseDetections,
          state.multiPoseDetection.minPartConfidence,
          state.multiPoseDetection.nmsRadius)

        // minPoseConfidence = Number(state.multiPoseDetection.minPoseConfidence)
        // minPartConfidence = Number(state.multiPoseDetection.minPartConfidence)
        break
    }

    return poses

    // ctx.clearRect(0, 0, canvasSize, canvasSize)

    // if (state.output.showVideo) {
    //   ctx.save()
    //   ctx.scale(-1, 1)
    //   ctx.translate(-canvasSize, 0)
    //   ctx.drawImage(video, 0, 0, canvasSize, canvasSize)
    //   ctx.restore()
    // }

    // const scale = canvasSize / video.width

    // For each pose (i.e. person) detected in an image, loop through the poses
    // and draw the resulting skeleton and keypoints if over certain confidence
    // scores

    // poses.forEach(({ score, keypoints }) => {
    //   if (score >= minPoseConfidence) {
    //     if (state.output.showPoints) {
    //       drawKeypoints(keypoints, minPartConfidence, ctx, scale)
    //     }
    //     if (state.output.showSkeleton) {
    //       drawSkeleton(keypoints, minPartConfidence, ctx, scale)
    //     }
    //   }
    // })
  }

  api.run = async ({ video }) => {
    return poseDetectionFrame({ video })
  }

  return api
}

export const setup = async ({ showPreview = true } = {}) => {
  let maxVideoSize = 513

  var api = {
    loaded: false
  }

  let posterAPI = await loadPoser()

  async function setupCamera () {
    let video = document.createElement('video')
    // const video = document.getElementById('video')
    video.width = maxVideoSize
    video.height = maxVideoSize

    document.body.appendChild(video)
    video.style.position = 'fixed'
    video.style.top = '20px'
    video.style.right = '20px'
    video.style.zIndex = '-1'
    video.style.opacity = 0.00001
    video.style.borderRadius = '50%'

    if (process.env.NODE_ENV === 'development' || showPreview) {
      video.style.zIndex = '100'
      video.style.opacity = 1.0
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
  video.addEventListener('loadeddata', () => {
    api.loaded = true
  })

  api.update = async () => {
    let poses = false
    if (api.loaded) {
      poses = await posterAPI.run({ video })
    }

    return {
      maxVideoSize,
      video,
      poses
    }
  }
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
