<template>
  <button @click="showModal" v-if="gameStore.steps > 0">复盘</button>
  <Modal
    :open="modalOpen"
    :width="gameStore.boardSize * 0.8 + 40"
    @onClose="modalOpen = false"
  >
    <div class="step-boards">
      <Game
        :selfIsWhite="false"
        :boardSize="gameStore.boardSize * 0.8"
        :boardGridSize="gameStore.boardGridSize * 0.8"
        :boardEdgeSize="gameStore.boardEdgeSize * 0.8"
        :pieceRadius="gameStore.pieceRadius * 0.8"
        :piecesRedraw="gameStore.piecesRedraw * 0.8"
        :pieceDraggable="() => false"
        :pieces="pieces"
      />
      <div class="step-btns">
        <button @click="stepIndex = stepIndex - 1" :disabled="stepIndex === 0">
          上一步
        </button>
        <span>{{ stepIndex }}/{{ gameStore.steps }}</span>
        <button
          @click="stepIndex = stepIndex + 1"
          :disabled="stepIndex === gameStore.steps"
        >
          下一步
        </button>
      </div>
    </div>
  </Modal>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue';
import { PieceType } from '../stores/gameStore';
import { useGameStore } from '../stores/GameStore';
import Game from './Game.vue';
import Modal from './Modal.vue';
const gameStore = useGameStore();

const modalOpen = ref(false);
const stepIndex = ref(0);

const showModal = () => {
  modalOpen.value = true;
  stepIndex.value = 0;
};

const pieces = computed(() => {
  const board = gameStore.stepBoards[stepIndex.value];
  return board.reduce((result, piece, index) => {
    if (piece === 0) {
      return result;
    }
    const rowIndex = Math.floor(index / 4);
    const colIndex = index % 4;
    result.push({
      rowIndex,
      colIndex,
      isWhite: piece > 0,
      num: piece,
    });
    return result;
  }, [] as PieceType[]);
});
</script>

<style lang="scss">
.step-boards {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  .step-btns {
    display: flex;
    width: 300px;
    justify-content: space-between;
    align-items: center;
    margin-top: 20px;
  }
}
</style>