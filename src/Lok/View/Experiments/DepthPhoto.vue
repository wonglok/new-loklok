<template>
  <div class="full" ref="mounter">
  </div>
</template>

<script>
import * as DepthPhoto from '../../GLs/DepthPhoto'
export default {
  components: {
  },
  data () {
    return {
      rAPI: false
    }
  },
  mounted () {
    this.rAPI = DepthPhoto.install({ mounter: this.$refs['mounter'], vm: this })
  },
  beforeDestroy () {
    this.rAPI.clean()
  }
}
</script>
