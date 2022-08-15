<template>
  <div class="home">
    <img class="logo" src="/logo.png" alt="">
    <h1>六子冲棋</h1>
    <button><router-link to="/play-with-local-people">本地与人对战</router-link></button>
    <button><router-link to="/play-with-online-people">线上与人对战</router-link></button>
    <button><router-link to="/play-with-ai">与机器对战</router-link></button>
  </div>
</template>

<script setup lang="ts">

</script>

<style lang="scss" scoped>
  .home {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100vh;
    .logo {
      width: 96px;
      height: 96px;
    }
    h1 {
      margin: 30px 0 80px 0;
    }
    button {
      margin: 10px;
    }
  }
</style>