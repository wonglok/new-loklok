<template>
  <div>
    home
    <button class="p-2 border m-1" @click="makeAlbum">makeAlbum</button>
    <button class="p-2 border m-1" @click="login">login</button>
    <button class="p-2 border m-1" @click="getAlbumBySlug">getAlbumBySlug</button>
    <button class="p-2 border m-1" @click="setup">setup</button>
    <button class="p-2 border m-1" v-if="takePhoto" @click="takePhoto">takePhoto</button>

    <video playsinline ref="video"></video>
    <canvas ref="canvas" style="display: none"></canvas>
  </div>
</template>

<script>
import * as API from '../../api/quickcam.js'
export default {
  data () {
    return {
      takePhoto: false
    }
  },
  mounted () {
  },
  methods: {
    async makeAlbum () {
      let data = await API.makeAlbum({
        slug: 'wonglok831',
        adminPassword: 'wonglok',
        viewPassword: '123bbb',
        description: 'lok lok'
      })
      console.log(data)
    },
    async login () {
      let data = await API.login({
        album: 'wonglok831',
        password: 'wonglok'
      })
      console.log(data)
    },
    async getAlbumBySlug () {
      let data = await API.getAlbumBySlug({
        slug: 'wonglok831'
      })
      this.albumID = data._id
      console.log(data)
    },
    async setup () {
      let height = 1024
      let width = 1024
      let canvas = this.$refs['canvas']
      let video = this.$refs['video']

      let streaming = false
      navigator.mediaDevices.getUserMedia({ video: { width: { ideal: 1920 }, height: { ideal: 1920 } }, audio: false })
        .then((stream) => {
          video.srcObject = stream
          video.play()
        })
        .catch((err) => {
          console.log('An error occurred: ' + err)
        })
      video.addEventListener('canplay', (ev) => {
        if (!streaming) {
          height = video.videoHeight / (video.videoWidth / width)

          video.setAttribute('width', width)
          video.setAttribute('height', height)

          canvas.setAttribute('width', width)
          canvas.setAttribute('height', height)
          streaming = true
        }
      }, false)
      function clearphoto () {
        var context = canvas.getContext('2d')
        context.fillStyle = '#AAA'
        context.fillRect(0, 0, canvas.width, canvas.height)
      }
      this.takePhoto = async () => {
        var context = canvas.getContext('2d')
        if (width && height) {
          canvas.width = width
          canvas.height = height
          context.drawImage(video, 0, 0, width, height)
          let album = await API.getAlbumBySlug({ slug: 'wonglok831' })
          canvas.toBlob(async (blob) => {
            let data = await API.uploadPhoto({ name: 'lok lok', blob, albumID: album._id })
            console.log(data)
          }, 'image/jpeg', 1)
        } else {
          clearphoto()
        }
        console.log('123')
      }
    }
  }
}
</script>

<style>

</style>
