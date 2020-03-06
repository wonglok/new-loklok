<template>
  <div class="p-3">
    <div>
      X
      <input type="range" class="m-2 border border-gray-400 bg-gray-100 rounded-lg text-gray-700" v-model="item.value.x" @input="update(item, $event, 'x')" />
      <input type="text" class="m-2 p-2 border border-gray-400 px-3 bg-gray-100 rounded-lg text-gray-700" v-model="item.value.x" @input="update(item, $event, 'x')" />
    </div>
    <div>
      Y
      <input type="range" class="m-2 border border-gray-400 bg-gray-100 rounded-lg text-gray-700" v-model="item.value.y" @input="update(item, $event, 'y')" />
      <input type="text" class="m-2 p-2 border border-gray-400 px-3 bg-gray-100 rounded-lg text-gray-700" v-model="item.value.y" @input="update(item, $event, 'y')" />
    </div>
  </div>
</template>

<script>
export default {
  props: {
    app: {},
    item: {}
  },
  methods: {
    update (item, $event, key) {
      item.value[key] = Number($event.target.value)
      this.app.updateLater(item)
    }
  }
}
</script>

<style scoped>

</style>
