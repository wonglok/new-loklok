<template>
  <div>
    {{ loading ? 'Loading....' : '' }}
    <button class="disable-dbl-tap-zoom p-2 border m-1" @click="makeAlbum">makeAlbum</button>
    <button class="disable-dbl-tap-zoom p-2 border m-1" @click="login">login</button>
    <button class="disable-dbl-tap-zoom p-2 border m-1" @click="getAlbumBySlug">getAlbumBySlug</button>
    <button class="disable-dbl-tap-zoom p-2 border m-1" @click="getPhotosBySlug">getPhotosBySlug</button>
    <button class="disable-dbl-tap-zoom p-2 border m-1" @click="openCamera">openCamera</button>
    <button class="disable-dbl-tap-zoom p-2 border m-1" v-if="takePhoto" @click="takePhoto">takePhoto</button>

    <div class="">
      <button class="disable-dbl-tap-zoom p-2 m-2 border" v-if="mode === 'normal'" @click="startSelect()">Select</button>
      <button class="disable-dbl-tap-zoom p-2 m-2 border" v-if="mode === 'selecting'" @click="cancelSelect()">Cancel Select</button>
      <button class="disable-dbl-tap-zoom p-2 m-2 border" v-if="mode === 'selecting'" @click="removeSelected()">Remove Selected</button>
      <div :key="photo._id" v-for="(photo) in photos" class="flex items-center">
        <img class="h-32" v-if="photo.photo && photo.type !== 'fake'" :src="`${apiURL}${photo.photo.url}`" alt="">
        <img class="h-32" v-if="photo.type === 'fake'" :src="`${photo.fakeurl}`" alt="">

        <div v-if="photo.type !== 'fake'">
          <button class="disable-dbl-tap-zoom p-2 m-2 border" v-if="mode === 'normal'" @click="removePhoto({ photo, photos })">Delete</button>
          <input type="checkbox" v-model="photo.selected" v-if="mode === 'selecting'" @input="$nextTick($forceUpdate)">
        </div>
      </div>
    </div>
    <video playsinline ref="video"></video>
    <canvas ref="canvas" style="display: none"></canvas>
  </div>
</template>

<script>
import * as API from '../../api/quickcam.js'
export default {
  data () {
    return {
      loading: false,
      apiURL: API.apiURL,
      photos: [],
      takePhoto: false,
      mode: 'normal'
    }
  },
  mounted () {
    this.getPhotosBySlug()
  },
  methods: {
    async startSelect () {
      this.mode = 'selecting'
      this.photos.forEach((data) => {
        data.selected = false
      })
      this.$forceUpdate()
    },
    async cancelSelect () {
      this.mode = 'normal'
      this.photos.forEach((data) => {
        data.selected = false
      })
      this.$forceUpdate()
    },
    async removeSelected () {
      let photoSelected = this.photos.filter(e => e.selected).slice()
      this.photos.filter(e => e.selected).forEach((photo) => {
        let idx = this.photos.find(e => e._id === photo._id)
        this.photos.splice(idx, 1)
      })

      let data = await API.removePhotosIn({
        photoIDs: photoSelected,
        slug: 'wonglok831',
        viewPassword: '123bbb'
      })

      console.log(data)
      this.cancelSelect()
    },
    async removePhoto ({ photo, photos }) {
      let idx = photos.find(e => e._id === photo._id)
      photos.splice(idx, 1)

      let data = await API.removePhotosIn({
        photoIDs: [photo._id],
        slug: 'wonglok831',
        viewPassword: '123bbb'
      })

      return data
    },
    async makeAlbum () {
      let data = await API.makeAlbum({
        slug: 'wonglok831',
        adminPassword: 'wonglok',
        enableViewPassword: true,
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
    async getPhotosBySlug () {
      let data = await API.getPhotosBySlug({
        slug: 'wonglok831',
        viewPassword: '123bbb'
      })
      this.photos = data
      console.log(data)
    },
    async getAlbumBySlug () {
      let data = await API.getAlbumBySlug({
        slug: 'wonglok831'
      })
      this.albumID = data._id
      console.log(data)
    },
    async openCamera () {
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
          this.takePhoto = takePhoto
        }
      }, false)
      let album = await API.getAlbumBySlug({ slug: 'wonglok831' })
      let takePhoto = async () => {
        var context = canvas.getContext('2d')
        context.fillStyle = '#AAA'
        context.fillRect(0, 0, canvas.width, canvas.height)
        if (width && height) {
          canvas.width = width
          canvas.height = height
          context.drawImage(video, 0, 0, width, height)

          canvas.toBlob(async (blob) => {
            let obj = {
              type: 'fake',
              _id: Math.random(),
              fakeurl: URL.createObjectURL(new Blob([blob], { type: 'image/jpeg' }))
            }
            this.photos.push(obj)

            let data = await API.uploadPhoto({ name: 'lok lok', blob, albumID: album._id })
            this.loading = true
            let idx = this.photos.findIndex(p => p._id === obj._id)
            this.photos[idx] = data
            // await this.getPhotosBySlug()
            this.loading = false
          }, 'image/jpeg', 1)
        }

        console.log('123')
      }
      this.takePhoto = takePhoto
    }
  }
}
</script>

<style scoped>
.disable-dbl-tap-zoom {
  touch-action: manipulation;
}
</style>
