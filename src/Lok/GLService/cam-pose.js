import * as posenet from '@tensorflow-models/posenet'

export const loadPoser = async () => {
  const net = await posenet.load()
  const imageScaleFactor = 1.0
  const flipHorizontal = false
  const outputStride = 16
  // get up to 5 poses
  const maxPoseDetections = 5
  // minimum confidence of the root part of a pose
  const scoreThreshold = 0.5
  // minimum distance in pixels between the root parts of poses
  const nmsRadius = 20
  let api = {}

  api.run = async ({ image, many = false }) => {
    const imageElement = image

    if (many) {
      const poses = await net.estimateMultiplePoses(imageElement, imageScaleFactor, flipHorizontal, outputStride, maxPoseDetections, scoreThreshold, nmsRadius)
      return poses
    } else {
      const pose = await net.estimateSinglePose(imageElement, imageScaleFactor, flipHorizontal, outputStride)
      return [pose]
    }
  }

  return api
}

export const setup = async () => {
  var api = {
    loaded: false
  }
  let posterAPI = await loadPoser()

  let video = document.createElement('video')
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
    video.play()
    video.setAttribute('playsinline', true)
  })

  api.pause = () => {
    if (video.paused) {
      video.play()
    } else {
      video.pause()
    }
  }

  api.update = async () => {
    let poses = false
    if (api.loaded) {
      poses = await posterAPI.run({ image: video })
    }

    return {
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
