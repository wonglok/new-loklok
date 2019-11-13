<template>
  <div class="full" ref="mounter">
  </div>
</template>

<script>
import * as WordsGlowing from '../GLs/WordsGlowing'
export default {
  components: {
  },
  data () {
    return {
      rAPI: false
    }
  },
  mounted () {
    this.rAPI = WordsGlowing.install({ mounter: this.$refs['mounter'], vm: this })
  },
  beforeDestroy () {
    this.rAPI.clean()
  }
}
</script>
