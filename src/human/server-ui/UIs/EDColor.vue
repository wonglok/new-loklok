<template>
  <div class="p-3">
    <div>
      R
      <input type="range" step="0.01" class="m-2 border border-gray-400 bg-gray-100 rounded-lg text-gray-700" v-model="item.value.r" @input="update(item, $event, 'r')" />
      <input type="text" class="m-2 p-2 border border-gray-400 px-3 bg-gray-100 rounded-lg text-gray-700" v-model="item.value.r" @input="update(item, $event, 'r')" />
    </div>
    <div>
      G
      <input type="range" step="0.01" class="m-2 border border-gray-400 bg-gray-100 rounded-lg text-gray-700" v-model="item.value.g" @input="update(item, $event, 'g')" />
      <input type="text" class="m-2 p-2 border border-gray-400 px-3 bg-gray-100 rounded-lg text-gray-700" v-model="item.value.g" @input="update(item, $event, 'g')" />
    </div>
    <div>
      B
      <input type="range" step="0.01" class="m-2 border border-gray-400 bg-gray-100 rounded-lg text-gray-700" v-model="item.value.b" @input="update(item, $event, 'b')" />
      <input type="text" class="m-2 p-2 border border-gray-400 px-3 bg-gray-100 rounded-lg text-gray-700" v-model="item.value.b" @input="update(item, $event, 'b')" />
    </div>
    <div>
      A
      <input type="range" min="0" max="1" step="0.001" class="m-2 border border-gray-400 bg-gray-100 rounded-lg text-gray-700" v-model="item.value.a" @input="update(item, $event, 'a')" />
      <input type="text" class="m-2 p-2 border border-gray-400 px-3 bg-gray-100 rounded-lg text-gray-700" v-model="item.value.a" @input="update(item, $event, 'a')" />
    </div>
    <div>
      <Chrome ref="chrome" v-if="picker" v-model="color" @input="onUpdateColor"></Chrome>
    </div>
  </div>
</template>

<script>
import { Chrome } from 'vue-color'
export default {
  components: {
    Chrome
  },
  props: {
    app: {},
    item: {}
  },
  data () {
    return {
      picker: true,
      color: JSON.parse(JSON.stringify(this.item.value))
    }
  },
  methods: {
    onUpdateColor (evt) {
      for (let kn in evt.rgba) {
        this.item.value[kn] = evt.rgba[kn]
      }
      this.app.updateLater(this.item)
      this.$refs['chrome'].$forceUpdate()
    },
    update (item, $event, key) {
      item.value[key] = Number($event.target.value)
      this.app.updateLater(item)

      this.picker = false
      this.color = JSON.parse(JSON.stringify(this.item.value))
      this.$nextTick(() => {
        this.picker = true
      })
    }
  }
}
</script>

<style scoped>

</style>
