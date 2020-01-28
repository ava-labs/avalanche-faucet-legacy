<template>
    <v-app :style="{
        backgroundColor:' #fafafa',
        backgroundImage: '@/assets/dots_bg.svg'
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
  .v-app{
      background-size: 10px;
      background-repeat: repeat;
  }
  #app {
    font-family: 'Avenir', Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;
    height: 100%;

      background-image: url("/dots_bg.svg");
      background-size: 15px;
      background-repeat: repeat;
  }
</style>
