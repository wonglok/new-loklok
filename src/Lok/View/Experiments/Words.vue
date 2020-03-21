<template>
  <div class="full" ref="mounter">
  </div>
</template>

<script>
import * as Words from '../../GLs/Words'
export default {
  components: {
  },
  data () {
    return {
      rAPI: false
    }
  },
  mounted () {
    this.rAPI = Words.install({ mounter: this.$refs['mounter'], vm: this })
  },
  beforeDestroy () {
    this.rAPI.clean()
  }
}
</script>
