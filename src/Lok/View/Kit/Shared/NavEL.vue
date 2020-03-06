<template>
  <div>
    <router-link active-class="bg-blue-300" class="bg-gray-200 inline-block p-2 m-1" to="/pdf/home"><div class="inline-block cursor-pointer">Home</div></router-link>
    <router-link active-class="bg-blue-300" class="bg-gray-200 inline-block p-2 m-1" v-if="API.Token.JWT" to="/pdf/dash"><div class="inline-block cursor-pointer">Dashbaord</div></router-link>
    <router-link active-class="bg-blue-300" class="bg-gray-200 inline-block p-2 m-1" v-if="!API.Token.JWT" to="/pdf/login"><div class="inline-block cursor-pointer">Login</div></router-link>
    <div class="inline-block" v-if="API.Token.JWT" @click="logout()"><div class="inline-block p-2 m-1 border bg-gray-200 cursor-pointer">Logout</div></div>
  </div>
</template>

<script>
import * as API from '../pdfAPI'
export default {
  data () {
    return {
      API
    }
  },
  computed: {
  },
  methods: {
    logout () {
      API.logout()
      this.$router.push('/pdf')
    }
  }
}
</script>

<style>

</style>
