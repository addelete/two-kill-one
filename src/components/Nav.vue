<template>
  <div class="nav">
    <div class="actions">
      <div @click="goHome" class="leftBtn">
        <img :src="homeIcon" />
      </div>
      <div class="title">{{ title }}</div>
      <div class="show-settings" @click="showSettings = true">📖 棋盘规则</div>
    </div>
    <div class="setting-str">
      <div>{{ gameStore.boardType }}</div>
      <div>{{ gameStore.ruleStr }}</div>
    </div>

    <Modal :open="showSettings" @on-close="showSettings = false">
      <Setting />
    </Modal>
  </div>
</template>

<script lang="ts" setup>
import homeIcon from '../assets/home.svg';
import { useRouter } from 'vue-router';
import Modal from './Modal.vue';
import Setting from './Setting.vue';
import { ref } from 'vue';
import { useGameStore } from '../stores/gameStore';
const gameStore = useGameStore();
const router = useRouter();
const props = defineProps<{
  title: string;
}>();
const goHome = () => {
  router.replace('/');
};

const showSettings = ref(false);
</script>

<style lang="scss">
.nav {
  margin-bottom: 20px;
  .actions {
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
    .show-settings {
      margin-left: auto;
      cursor: pointer;
    }
  }
  .setting-str {
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: #aaa;
  }
}
</style>