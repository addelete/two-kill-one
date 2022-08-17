<template>
  <div class="rule-setting">
    <div class="rule-item" v-for="ruleItem in rules" :key="ruleItem.title">
      <div class="rule-item-check">
        <input
          type="checkbox"
          :checked="ruleItem.enabled"
          :disabled="gameStore.steps > 0"
          @change="toggleRuleItem(ruleItem.title)"
        />
      </div>
      <div class="rule-item-info">
        <div class="rule-item-title">{{ ruleItem.title }}</div>
        <div class="rule-item-desc">{{ ruleItem.desc }}</div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { useGameStore } from '../stores/gameStore';

const gameStore = useGameStore();

const rules = computed(() => {
  const ruleDesc: {
    [key: string]: string;
  } = {
    二打一: 'A走棋后在行/列形成AAB的棋形，且剩余一格为空，此行/列的B棋子被杀掉',
    二打二: 'A走棋后在行/列形成AABB的棋形，此行/列的两个B棋子被杀掉',
    二夹一: 'A走棋后在行/列形成ABA的棋形，且剩余一格为空，此行/列的B棋子被杀掉',
    二夹二: 'A走棋后在行/列形成ABBA的棋形，此行/列的两个B棋子被杀掉',
    二挑二: 'A走棋后在行/列形成BAAB的棋形，此行/列的两个B棋子被杀掉',
    一挑二:
      'A走棋后在行/列形成BAB的棋形，且剩余一格为空，此行/列的两个B棋子被杀掉',
  };
  return Object.keys(gameStore.rule).map((ruleKey) => {
    return {
      title: ruleKey,
      desc: ruleDesc[ruleKey],
      enabled: gameStore.rule[ruleKey],
    };
  });
});

const toggleRuleItem = (ruleTitle: string) => {
  gameStore.toggleRuleItem(ruleTitle);
};
</script>

<style lang="scss">
.rule-setting {
  .rule-item {
    display: flex;
    align-items: flex-start;
    & + .rule-item {
      margin-top: 12px;
    }
    .rule-item-info {
      margin-left: 16px;
      .rule-item-title {
        font-weight: bold;
      }
      .rule-item-desc {
        font-size: 12px;
        line-height: 1.4em;
        margin-top: 6px;
        color: #aaa;
      }
    }
  }
}
</style>