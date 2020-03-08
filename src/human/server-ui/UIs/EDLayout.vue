<template>
  <div class="p-3">
    <div class="">
      Position X
      <!-- <input type="range" class="m-2 border border-gray-400 bg-gray-100 rounded-lg text-gray-700" v-model="item.value.x" @input="update(item, $event, 'x')" /> -->
      <textarea  cols="80" rows="1" class=" text-sm m-2 p-2 block border border-gray-400 px-3 bg-gray-100 rounded-lg text-gray-700" v-model="item.value.fpx" @input="update(item, $event, 'fpx')"></textarea>
    </div>
    <div class="">
      Position Y
      <!-- <input type="range" class="m-2 border border-gray-400 bg-gray-100 rounded-lg text-gray-700" v-model="item.value.y" @input="update(item, $event, 'y')" /> -->
      <textarea  cols="80" rows="1" class=" text-sm m-2 p-2 block border border-gray-400 px-3 bg-gray-100 rounded-lg text-gray-700" v-model="item.value.fpy" @input="update(item, $event, 'fpy')"></textarea>
    </div>
    <div class="">
      Position Z
      <!-- <input type="range" class="m-2 border border-gray-400 bg-gray-100 rounded-lg text-gray-700" v-model="item.value.z" @input="update(item, $event, 'z')" /> -->
      <textarea  cols="80" rows="1" class=" text-sm m-2 p-2 block border border-gray-400 px-3 bg-gray-100 rounded-lg text-gray-700" v-model="item.value.fpz" @input="update(item, $event, 'fpz')"></textarea>
    </div>

    <div class="">
      Scale X
      <!-- <input type="range" class="m-2 border border-gray-400 bg-gray-100 rounded-lg text-gray-700" v-model="item.value.x" @input="update(item, $event, 'x')" /> -->
      <textarea  cols="80" rows="1" class=" text-sm m-2 p-2 block border border-gray-400 px-3 bg-gray-100 rounded-lg text-gray-700" v-model="item.value.fsx" @input="update(item, $event, 'fsx')"></textarea>
    </div>
    <div class="">
      Scale Y
      <!-- <input type="range" class="m-2 border border-gray-400 bg-gray-100 rounded-lg text-gray-700" v-model="item.value.y" @input="update(item, $event, 'y')" /> -->
      <textarea  cols="80" rows="1" class=" text-sm m-2 p-2 block border border-gray-400 px-3 bg-gray-100 rounded-lg text-gray-700" v-model="item.value.fsy" @input="update(item, $event, 'fsy')"></textarea>
    </div>
    <div class="">
      Scale Z
      <!-- <input type="range" class="m-2 border border-gray-400 bg-gray-100 rounded-lg text-gray-700" v-model="item.value.z" @input="update(item, $event, 'z')" /> -->
      <textarea  cols="80" rows="1" class=" text-sm m-2 p-2 block border border-gray-400 px-3 bg-gray-100 rounded-lg text-gray-700" v-model="item.value.fsz" @input="update(item, $event, 'fsz')"></textarea>
    </div>

    <div class="">
      Rotate X
      <!-- <input type="range" class="m-2 border border-gray-400 bg-gray-100 rounded-lg text-gray-700" v-model="item.value.x" @input="update(item, $event, 'x')" /> -->
      <textarea  cols="80" rows="1" class=" text-sm m-2 p-2 block border border-gray-400 px-3 bg-gray-100 rounded-lg text-gray-700" v-model="item.value.frx" @input="update(item, $event, 'frx')"></textarea>
    </div>
    <div class="">
      Rotate Y
      <!-- <input type="range" class="m-2 border border-gray-400 bg-gray-100 rounded-lg text-gray-700" v-model="item.value.y" @input="update(item, $event, 'y')" /> -->
      <textarea  cols="80" rows="1" class=" text-sm m-2 p-2 block border border-gray-400 px-3 bg-gray-100 rounded-lg text-gray-700" v-model="item.value.fry" @input="update(item, $event, 'fry')"></textarea>
    </div>
    <div class="">
      Rotate Z
      <!-- <input type="range" class="m-2 border border-gray-400 bg-gray-100 rounded-lg text-gray-700" v-model="item.value.z" @input="update(item, $event, 'z')" /> -->
      <textarea  cols="80" rows="1" class=" text-sm m-2 p-2 block border border-gray-400 px-3 bg-gray-100 rounded-lg text-gray-700" v-model="item.value.frz" @input="update(item, $event, 'frz')"></textarea>
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
      item.value[key] = String($event.target.value)
      this.app.updateLater(item)
    }
  }
}
</script>

<style scoped>

</style>
