<template>
  <div>
    <span>Count: {{ logs.length }}
    </span>
    <span>
      <input type="file" ref="file" style="display: none;" />
      <button @click="readCSVFile()">Run</button>
    </span>
    <pre :key="li" v-for="(log, li) in logs">{{ log }}</pre>
  </div>
</template>

<script>
import axios from 'axios'
const csv = require('csvtojson')

let bankBaseURL = `https://bank.yoteach.cloud/`
let getDOI = (v) => `https://doi.org/api/handles/${v}`
export default {
  data () {
    return {
      logs: []
    }
  },
  async mounted () {
  },
  methods: {
    sleep: (v = 100) => new Promise(resolve => setTimeout(resolve, v)),
    async readCSVFile () {
      this.$refs['file'].onchange = (ev) => {
        let files = ev.target.files
        if (files && files[0]) {
          let file = files[0]
          if (file) {
            let reader = new FileReader()
            reader.onload = () => {
              let str = reader.result
              csv().fromString(str)
                .then(async (datas) => {
                  let dois = datas.map(e => e.DOI).filter(e => e)

                  for (var idx = 0; idx < dois.length; idx += 3) {
                    let doi0 = dois[idx + 0]
                    let doi1 = dois[idx + 1]
                    let doi2 = dois[idx + 2]
                    await Promise.all([
                      this.grabToYo(doi0),
                      this.grabToYo(doi1),
                      this.grabToYo(doi2)
                    ]).catch(e => console.log(e))
                  }
                })
            }
            reader.readAsText(file)
          }
        }
      }
      this.$refs['file'].click()
    },
    // async goBatch () {
    //   await Promise.all([
    //     this.grabToYo(`10.1063/1.5141669`)
    //   ])
    // },
    async grabToYo (doi) {
      let log = {
        doi,
        state: 'ready'
      }
      this.logs.unshift(log)
      log.state = '1-checking'
      if (await this.shouldDownloadThenUpload(doi)) {
        log.state = '2-downloading-doi-meta-data'
        let submit = await this.obtain(doi)
        log.state = '3-uploading-to-yoteach-bank'
        await this.upload(submit)
        log.state = '4-successfully-saved'
      } else {
        log.state = '4-already-successfully-saved'
      }
      // await this.sleep(100)
    },

    async shouldDownloadThenUpload (doi) {
      if (await this.hasLocal(doi)) {
        return false
      }
      if (await this.removeDontHave(doi)) {
        return true
      } else {
        return false
      }
    },
    async hasLocal (doi) {
      let NS = 'DOI-'
      let localData = localStorage.getItem(NS + doi)
      if (localData === 'haslocal') {
        return true
      } else {
        localStorage.setItem(NS + doi, 'haslocal')
        return false
      }
    },
    async removeDontHave (doi) {
      let data = (await axios({
        method: 'GET',
        url: `${bankBaseURL}dois?doi=${encodeURIComponent(doi)}`
      })).data
      console.log('is unique', data.length === 0, data)

      return data.length === 0
    },
    async upload (send) {
      let data = (await axios({
        method: 'POST',
        url: `${bankBaseURL}dois`,
        data: send
      })).data
      console.log('uploadeed', data)
    },
    async obtain (doi) {
      let submit = {
        doi
      }
      let data = (await axios({
        method: 'GET',
        url: getDOI(doi)
      })).data

      try {
        let url = data.values.find(e => e.type === 'URL').data.value
        submit.url = url
        submit.meta = data
      } catch (e) {
        console.log(e)
      }

      console.log(submit)

      return submit
    }
  }
}
</script>

<style scoped>

</style>
