<template>
  <div>
    <h1 class=" text-4xl m-1 p-1">
      Login Page
    </h1>
    <div>
      <input type="text" v-model="auth.username" class="m-1 p-2 bg-gray-200" placeholder="email / username" />
      <input type="password" v-model="auth.password" class="m-1 p-2 bg-gray-200" placeholder="password" />
      <button @click="login" class="m-1 p-2 bg-gray-200">Login</button>
      <p>{{ msg }}</p>
    </div>
  </div>
</template>

<script>
import * as API from '../pdfAPI'
export default {
  data () {
    return {
      auth: {
        username: '',
        password: ''
      },
      msg: ''
    }
  },
  methods: {
    login () {
      this.msg = ''
      API.login({ identifier: this.auth.username, password: this.auth.password })
        .then(() => {
          this.$router.push('/pdf/dash')
        }, () => {
          this.msg = 'bad login'
        })
    }
  }
}
</script>

<style>

</style>
