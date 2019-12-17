import * as THREE from 'three'

export const setup = ({ url }) => {
  var api = {}
  var fftSize = 512 // up to 2048 with pow2
  var listener = new THREE.AudioListener()
  listener.setMasterVolume(0.5)
  var audio = new THREE.Audio(listener)

  var mediaElement = new Audio(url)
  mediaElement.loop = true
  mediaElement.volume = 1.0

  audio.setMediaElementSource(mediaElement)
  var dataPerScan = fftSize / 2.0
  var maxHistory = 60 * 5
  var savedBits = new Uint8Array(new Array(dataPerScan * maxHistory))
  // var bitsArr = new Array(dataPerScan * maxHistory * 3)
  var historyArr = [
  ]

  for (var i = 0; i < maxHistory; i++) {
    historyArr.push(new Uint8Array(new Array(dataPerScan)))
  }

  var analyser = new THREE.AudioAnalyser(audio, fftSize)

  console.log(analyser.data)

  let texture = new THREE.DataTexture(savedBits, dataPerScan, maxHistory, THREE.LuminanceFormat)
  api.audio = mediaElement
  api.play = () => {
    mediaElement.play()
  }
  api.pause = () => {
    mediaElement.pause()
  }
  api.stop = () => {
    mediaElement.pause()
  }

  api.update = () => {
    analyser.getFrequencyData()

    historyArr.pop()
    historyArr.unshift(analyser.data.slice())

    // savedBits = new Uint8Array(dataPerScan * maxHistory)

    for (let ai = 0; ai < historyArr.length; ai++) {
      let currnetAI = historyArr[ai]
      for (let bi = 0; bi < currnetAI.length; bi++) {
        let v = currnetAI[bi]
        let idx = ai * dataPerScan + bi
        savedBits[idx] = v
        // bitsArr[idx + 0] = v2
        // bitsArr[idx + 1] = v2
        // bitsArr[idx + 2] = v2
      }
    }

    // analyser.getFrequencyData()
    // analyser.getAverageFrequency()
    texture.needsUpdate = true

    return {
      dimension: {
        x: dataPerScan,
        y: maxHistory
      },
      texture
    }
  }

  // api.credit = {
  //   author: 'skullbeatz',
  //   link: 'http://www.newgrounds.com/audio/listen/376737'
  // }

  return api
}
