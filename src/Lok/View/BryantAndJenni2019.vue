<template>
  <div class="full" ref="mounter">
  </div>
</template>

<script>
import * as BryantJenni2019 from '../GLs/BryantJenni2019'
export default {
  components: {
  },
  data () {
    return {
      rAPI: false
    }
  },
  mounted () {
    this.rAPI = BryantJenni2019.install({ mounter: this.$refs['mounter'], vm: this })
  },
  beforeDestroy () {
    this.rAPI.clean()
  }
}
</script>
