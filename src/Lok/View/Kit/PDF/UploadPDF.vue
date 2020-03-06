<template>
  <div>
    <button @click="$refs['pdf'].click()" class="px-5 py-2 text-xl bg-teal-200 text-teal-600 border-teal-600 rounded-lg">Upload PDF</button>
    <input v-show="false" type="file" ref="pdf" @change="onChangeFileSelector" multiple accept="application/pdf" name="pdf">
    <input type="text" v-model="term" class="px-5 py-2 text-xl bg-gray-200 text-gray-600 border-gray-600 rounded-lg mx-2" />
    <button @click="analyseFiles" class="px-5 py-2 text-xl bg-teal-200 text-teal-600 border-teal-600 rounded-lg mx-2">Analyse PDF</button>
    <p :key="li" v-for="(log, li) in logs">
      {{ JSON.stringify(log) }}
    </p>
    <p :key="li" v-for="(row, li) in table">
      Frequency: [{{ row.result }}]
      <a class="underline inline-block px-3 py-1" target="_blank" :href="row.pdf.url">{{ row.pdf.name.slice(0, 30) }}...</a>
    </p>
  </div>
</template>

<script>
import * as API from '../pdfAPI'
import SparkMD5 from 'spark-md5'
export default {
  data () {
    return {
      term: '',
      logs: [],
      table: false
    }
  },
  methods: {
    async onChangeFileSelector (evt) {
      let files = evt.target.files
      console.log(files)
      for (var i = 0; i < files.length; i += 1) {
        if (files[i]) {
          await this.eachUpload(files[i])
        }
      }
    },
    // async checkItem (file) {
    //   return API.checkItem(file)
    // },
    async analyseFiles () {
      let res = await API.analyseFiles({ term: this.term })
      this.table = res
    },
    async eachUpload (file) {
      return new Promise((resolve) => {
        let log = {
          file: file.name.slice(0, 20) + '...',
          state: 'ready'
        }
        this.logs.unshift(log)
        let formData = new FormData()
        // formData.append(`data`, JSON.stringify({
        //   filename: '',
        //   hash: '',
        //   info: {}
        // }))

        var reader = new FileReader()
        reader.readAsArrayBuffer(file)
        reader.onloadend = async () => {
          console.log(reader.result)
          let md5 = SparkMD5.ArrayBuffer.hash(reader.result)

          let hasDuplication = await API.checkHasMD5({ md5 })
          if (hasDuplication) {
            log.state = 'duplicated, not uploaded'
            resolve()
            return
          }

          formData.append(`files`, file)
          log.state = 'uploading pdf'
          let fileRes = await API.uploadFile({ formData })
          let filer = fileRes[0]
          log.state = 'registering paper'
          await API.createPDF({ pdf: filer, md5, text: '', meta: {} })
            .then((pdfRes) => {
              console.log('uploaded pdf entry')
              console.log(pdfRes)
              resolve()
            }, () => {
              console.log('removing file')
              return API.deleteFile({ fileID: filer._id })
                .then(() => {
                  resolve()
                })
            })
        }
      })
    }
  }
}
</script>

<style>

</style>
