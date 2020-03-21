<template>
  <div class="full" ref="mounter">
    <button ref="change-name" class="btn btn-outline  absolute top-0 left-0">Change Name</button>
  </div>
</template>

<script>
import * as Cascade from '../../GLs/Cascade'
export default {
  components: {
  },
  data () {
    return {
      rAPI: false
    }
  },
  mounted () {
    this.rAPI = Cascade.install({ mounter: this.$refs['mounter'], vm: this })
  },
  beforeDestroy () {
    this.rAPI.clean()
  }
}
</script>
