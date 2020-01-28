<template>
    <v-app :style="{
        backgroundColor:' #fafafa'
    }">
      <v-content>
          <router-view></router-view>
      </v-content>
    </v-app>
</template>

<script>

export default {
  name: 'app',
}
</script>

<style>
  body{
    margin: 0;
    background-color: #fafafa;
    min-height: 100vh;
  }
  #app {
    font-family: 'Avenir', Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;
    height: 100%;
  }
</style>
