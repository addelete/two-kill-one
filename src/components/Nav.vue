<template>
  <div class="nav">
    <div class="actions">
      <div @click="goHome" class="leftBtn">
        <img :src="homeIcon" />
      </div>
      <div class="title">{{ title }}</div>
      <div class="show-rules" @click="showRules = true">📖 规则</div>
    </div>
    <div class="rule">{{ gameStore.ruleStr }}</div>

    <Modal :open="showRules" @on-close="showRules = false">
      <RuleSetting />
    </Modal>
  </div>
</template>

<script lang="ts" setup>
import homeIcon from '../assets/home.svg';
import { useRouter } from 'vue-router';
import Modal from './Modal.vue';
import RuleSetting from './RuleSetting.vue';
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

const showRules = ref(false);
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
    .show-rules {
      margin-left: auto;
      cursor: pointer;
    }
  }
  .rule {
    color: #aaa;
    font-size: 12px;
    text-align: right;
  }
}
</style>