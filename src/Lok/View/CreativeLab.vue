<template>
  <div class="full" ref="mounter">
  </div>
</template>

<script>
import * as CreativeLab from '../GLs/CreativeLab'
export default {
  components: {
  },
  data () {
    return {
      rAPI: false
    }
  },
  mounted () {
    this.rAPI = CreativeLab.install({ mounter: this.$refs['mounter'], vm: this })
  },
  beforeDestroy () {
    this.rAPI.clean()
  }
}
</script>
