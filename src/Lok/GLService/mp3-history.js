import { AudioListener, Audio, AudioAnalyser, DataTexture, LuminanceFormat } from 'three'

export const setup = ({ url }) => {
  var api = {}

  // var mediaElement = new Audio(url)
  // mediaElement.autoplay = true
  // mediaElement.loop = true

  var listener = new AudioListener()
  var audio = new Audio(listener)
  // audio.setMediaElementSource(mediaElement)
  // listener.setMasterVolume(1.0)

  api.updateAudio = ({ url }) => {
    api.mediaElement = new Audio(url)
    api.mediaElement.autoplay = true
    api.mediaElement.loop = true
    audio.setMediaElementSource(api.mediaElement)
  }

  var fftSize = 256 // up to 2048 with pow2
  var dataPerScan = fftSize / 2.0
  var maxHistory = 60 * 5
  var savedBits = new Uint8Array(new Array(dataPerScan * maxHistory))
  // var bitsArr = new Array(dataPerScan * maxHistory * 3)
  var historyArr = [
  ]

  for (var i = 0; i < maxHistory; i++) {
    historyArr.push(new Uint8Array(new Array(dataPerScan)))
  }

  var analyser = new AudioAnalyser(audio, fftSize)
  let texture = new DataTexture(savedBits, dataPerScan, maxHistory, LuminanceFormat)

  api.play = () => {
    api.mediaElement.play()
  }
  api.pause = () => {
    api.mediaElement.pause()
  }
  api.stop = () => {
    api.mediaElement.pause()
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
