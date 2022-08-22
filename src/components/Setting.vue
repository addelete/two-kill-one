<template>
  <div class="setting">
    <div class="setting__group-title">棋盘设置</div>
    <div class="setting__items row">
      <div
        class="setting__item"
        v-for="(board, bi) in boards"
        :key="board.title"
      >
        <input
          :id="`board-${bi}`"
          type="radio"
          name="board"
          :checked="board.enabled"
          :disabled="gameStore.steps > 0"
          @change="changeBoardType(board.title)"
        />
        <label :for="`board-${bi}`">{{ board.title }}</label>
      </div>
    </div>
    <div class="setting__group-title">吃子规则</div>
    <div class="setting__items">
      <div
        class="setting__item"
        v-for="(ruleItem, ri) in rules"
        :key="ruleItem.title"
      >
        <div class="setting__item__check">
          <input
            :id="`rule-${ri}`"
            type="checkbox"
            :checked="ruleItem.enabled"
            :disabled="gameStore.steps > 0"
            @change="toggleRuleItem(ruleItem.title)"
          />
        </div>
        <div class="setting__item__info">
          <label :for="`rule-${ri}`">{{ ruleItem.title }}</label>
          <div class="setting__item__desc">{{ ruleItem.desc }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { useGameStore } from '../stores/gameStore';
import { defaultBoards } from '../utils/game';

const gameStore = useGameStore();

const boards = computed(() => {
  return Object.keys(defaultBoards).map((key) => ({
    title: key,
    enabled: gameStore.boardType === key,
  }));
});

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
  gameStore.setSettingUpdatedAt();
};

const changeBoardType = (boardType: string) => {
  gameStore.changeBoardType(boardType);
  gameStore.setSettingUpdatedAt();
};
</script>

<style lang="scss" scoped>
.setting {
  &__group-title {
    font-size: 1.2rem;
    font-weight: bold;
    margin-bottom: 1em;
  }
  &__items {
    margin-bottom: 1em;
    &.row {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
  }
  &__item {
    display: flex;
    align-items: flex-start;
    margin-bottom: 0.8em;

    &__info {
      margin-left: 16px;
    }
    &__desc {
      font-size: 12px;
      line-height: 1.4em;
      margin-top: 6px;
      color: #aaa;
    }
  }
}
</style>