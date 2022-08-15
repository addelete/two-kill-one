<template>
  <div class="nav">
    <div @click="goHome" class="leftBtn">
      <img :src="homeIcon" />
    </div>
    <div class="title">{{ title }}</div>
  </div>
</template>

<script lang="ts" setup>
import homeIcon from '../assets/home.svg';
import { useRouter } from 'vue-router';
const router = useRouter();
const props = defineProps<{
  title: string;
}>();
const goHome = () => {
  router.replace('/');
};
</script>

<style lang="scss">
.nav {
  display: flex;
  margin: 12px 0;
  display: flex;
  align-items: center;
  .leftBtn {
    
    display: flex;
    align-items: center;
    cursor: pointer;
    img {
      width: 24px;
      height: 24px;
    }
  }
  .title {
    font-size: 18px;
    margin-left: 10px;
    font-weight: bold;
  }
}
</style>