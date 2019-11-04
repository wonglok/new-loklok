<template>
  <div class="full" ref="mounter">
  </div>
</template>

<script>
import * as VoyageBear from '../GLs/VoyageBear'
export default {
  components: {
  },
  data () {
    return {
      rAPI: false
    }
  },
  mounted () {
    this.rAPI = VoyageBear.install({ mounter: this.$refs['mounter'], vm: this })
  },
  beforeDestroy () {
    this.rAPI.clean()
  }
}
</script>
