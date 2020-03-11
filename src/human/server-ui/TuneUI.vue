<template>
  <div class="full" v-if="app">
    <div class="full flex">
      <div class="group-col w-56 border-r h-full">
        <div class="group p-2 bg-gray-100 border-b text-lg justify-center flex items-ceneter cursor-pointer" @click="addGroup">
          ➕ Add Group
        </div>
        <div class="group p-2 border-b text-sm flex items-ceneter justify-between cursor-pointer hover:bg-gray-200" :class="{ 'bg-green-200': app.isSelected(gp) }" @click="app.select(gp)" :key="gpi" v-for="(gp, gpi) in app.groupNames.slice().sort(byAlphabet)">
          <span>💎 {{ gp }}</span>
          <div>
            <span class="" @click="clone(gp)">🐑</span>
          </div>
        </div>
        <!-- {{ app.groupNames }} -->
      </div>
      <div class="main-col full">
        <div v-if="app.selected.groupItems" class="full flex flex-col">
          <div class="p-2 border-b bg-gray-200 flex justify-between items-center">
            <div class="text-4xl pl-1 cursor-pointer" @click="changeName(app.selected.group)">👑 {{ app.selected.group }}</div>
            <div class="pr-2">
              <div v-if="alt" class="mx-1 p-2 inline-block rounded-lg text-teal-600 bg-blue-100 select-none">Quick Remove ⚡️</div>
              <button class="mx-1 p-2 rounded-lg text-teal-600 bg-yellow-100"  @click="clone(app.selected.group)">🐑 Clone</button>
              <button class="mx-1 p-2 rounded-lg text-teal-600 bg-teal-100"  @click="changeName(app.selected.group)">✍🏼 Rename</button>
              <button class="mx-1 p-2 roundd-lg text-red-600 bg-red-100" @click="removeGroup(app.selected.group)">🗑 Remove</button>
            </div>
          </div>
          <div class="w-full flex flex-row">
            <div class="key-col w-56 border-r">
              <div class="group p-2 border-b text-sm flex items-ceneter justify-center cursor-pointer bg-gray-100 hover:bg-gray-200" @click="add({ groupName: app.selected.group })">
                <span class="p-1">➕ Add Item</span>
                <!-- <span class="p-1 rounded-lg text-red-600 bg-red-100" @click="remove(gi)">❌</span> -->
              </div>
              <div class="group p-2 border-b text-sm flex items-ceneter justify-between cursor-pointer hover:bg-gray-200" :class="{ 'bg-green-200': app.isSelectedGroupItem(gi.id), 'hover:bg-green-300': app.isSelectedGroupItem(gi.id) }" @click="app.selectGroupItem(gi.id)" :key="gix" v-for="(gi, gix) in app.selected.groupItems">
                <span class="p-1"><span @click="copyItem({ item: gi })"> 🧪 </span><input type="text" class="bg-transparent" v-model="gi.key" @input="updateNow(gi)"></span>
                <span class="p-1 rounded-lg text-red-600 bg-red-100 inline-flex justify-center items-center" @click="remove(gi)">❌</span>
              </div>
            </div>
            <keep-alive>
              <div class="details h-full inputsarea overflow-x-hidden" v-if="app.selected.groupItem" :key="app.selected.groupItem.id">
                <Chooser :app="app" :item="app.selected.groupItem" v-if="app.selected.groupItem.type === 'unknown'"></Chooser>
                <UndoChooser :app="app" :item="app.selected.groupItem" v-if="app.selected.groupItem.type !== 'unknown'"></UndoChooser>
                <EDNumber :app="app" :item="app.selected.groupItem" v-if="app.selected.groupItem.type === 'number'"></EDNumber>
                <EDVector3 :app="app" :item="app.selected.groupItem" v-if="app.selected.groupItem.type === 'vec3'"></EDVector3>
                <EDVector2 :app="app" :item="app.selected.groupItem" v-if="app.selected.groupItem.type === 'vec2'"></EDVector2>
                <EDColor :app="app" :item="app.selected.groupItem" v-if="app.selected.groupItem.type === 'color'"></EDColor>
                <EDBoolean :app="app" :item="app.selected.groupItem" v-if="app.selected.groupItem.type === 'boolean'"></EDBoolean>
                <EDString :app="app" :item="app.selected.groupItem" v-if="app.selected.groupItem.type === 'string'"></EDString>
                <EDLayout :app="app" :item="app.selected.groupItem" v-if="app.selected.groupItem.type === 'layout'"></EDLayout>
                <!-- <pre>{{ app.selected.groupItem }}</pre> -->
              </div>
            </keep-alive>
          </div>
        </div>
        <div v-if="!app.selected.groupItems" class="full text-lg bg-gray-100 flex items-center justify-center">
          Please select a group
        </div>
      </div>
    </div>

    <!-- <button class="p-2 m-2 border bg-gray-300" @click="add">Add</button>
    <div :key="item.id" v-for="item in app.list">
      Group:
      <input type="text" v-model="item.group" @input="updateNow(item)">
      Key:
      <input type="text" v-model="item.key" @input="updateNow(item)">
      Later:
      <input type="range" v-model="item.notHappy" @input="updateLater(item)">
      <button class="p-2 m-2 border bg-gray-300 bg-red-200" @click="remove(item)">X</button>
    </div>
    <pre>{{ app.data }}</pre> -->
  </div>
</template>

<script>
import { makeAPI } from './tune-ui'
// import { makeSDK } from '../index'
export default {
  components: {
    ...require('./uis').default
  },
  data () {
    return {
      alt: false,
      app: false
    }
  },
  computed: {
  },
  async mounted () {
    this.app = await makeAPI({ ui: this })
    window.addEventListener('keydown', (evt) => {
      if (evt.altKey) {
        this.alt = true
      }
    })
    window.addEventListener('keyup', (evt) => {
      this.alt = false
    })
  },
  methods: {
    byAlphabet (a, b) {
      if (a > b) {
        return 1
      } else if (a < b) {
        return -1
      } else {
        return 0
      }
    },
    addGroup () {
      let name = window.prompt('new group name')
      if (this.app.groupNames.includes(name)) {
        window.alert('Duplicated group name')
        return
      }
      if (name) {
        this.app.add({
          group: name,
          key: 'newkey',
          type: 'unknown',
          value: null
        })
      }
    },
    updateNow (item) {
      this.app.updateNow(item)
    },
    updateLater (item) {
      this.app.updateLater(item)
    },
    copyItem ({ item }) {
      let name = window.prompt('new name?')
      if (name) {
        if (this.app.selected.groupItems.map(e => e.key).includes(name)) {
          window.alert('Duplicated group name')
          return
        }
        this.app.add({
          group: item.group,
          key: name,
          type: item.type,
          value: item.value
        })
      }
    },
    add ({ groupName }) {
      if (this.alt) {
        this.app.add({
          group: groupName,
          key: 'newkey',
          type: 'unknown',
          value: null
        })
        return
      }
      let name = window.prompt('keyname for inpput?')
      if (name) {
        this.app.add({
          group: groupName,
          key: name,
          type: 'unknown',
          value: null
        })
      }
    },
    clone (gp) {
      let name = window.prompt('new cloned group name?')
      if (this.app.groupNames.includes(name)) {
        window.alert('Duplicated group name')
        return
      }
      if (name) {
        this.app.cloneGroupAndRename(gp, name)
        this.app.select(name)
      }
      // this.app.clone
    },
    changeName (gp) {
      let name = window.prompt('new group name?')
      if (this.app.groupNames.includes(name)) {
        window.alert('Duplicated group name')
        return
      }
      if (name) {
        this.app.changeGroupName(gp, name)
        this.app.select(name)
      }
    },
    removeGroup (gp) {
      if (this.alt) {
        if (window.confirm('remove')) {
          this.app.removeGroup(gp)
        }
        return
      }
      let name = window.prompt('type this group name to remove it: ' + gp)
      if (name === gp) {
        this.app.removeGroup(gp)
      }
    },
    remove (item) {
      if (this.alt || window.confirm('remove?')) {
        this.app.remove(item)
        this.app.selectGroupItem(false)
      }
    }
  }
}
</script>

<style scoped>
@import url(./tailwind.css);

.inputsarea{
  width: calc(100% - 400px);
}
</style>
