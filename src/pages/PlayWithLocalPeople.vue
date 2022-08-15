<template>
  <div
    class="main"
    :style="{
      width: `${gameStore.boardSize}px`,
    }"
  >
    <Nav title="本地与人对战" />
    <div class="board">
      <div class="board-header">
        <button @click="gameStore.handleRestart">重开</button>
        <div class="color-piece" v-if="!gameStore.gameIsEnd">
          <img
            class="piece-img"
            :src="gameStore.stepIsWhite ? whitePiece : blackPiece"
          />
          <span>{{ gameStore.stepIsWhite ? '白' : '黑' }}方走棋</span>
        </div>
      </div>
      <div class="board-body" :style="{ height: `${gameStore.boardSize}px` }">
        <Game
          :selfIsWhite="gameStore.selfIsWhite"
          :boardSize="gameStore.boardSize"
          :boardGridSize="gameStore.boardGridSize"
          :boardEdgeSize="gameStore.boardEdgeSize"
          :pieceRadius="gameStore.pieceRadius"
          :piecesRedraw="gameStore.piecesRedraw"
          :pieceDraggable="pieceDraggable"
          :pieces="gameStore.pieces"
          @pieceMove="gameStore.handlePieceMove"
        />
      </div>
      <div class="board-footer">
        <div v-if="gameStore.gameIsEnd">{{ gameStore.gameEndBecause }}</div>
        <div v-if="!gameStore.gameIsEnd && gameStore.onlyOnePieceStep != 0">
          {{ gameStore.onlyOnePieceStep > 0 ? '白' : '黑' }}仅剩一枚棋子，逃脱{{
            11 -
            (gameStore.onlyOnePieceStep > 0
              ? gameStore.onlyOnePieceStep
              : -gameStore.onlyOnePieceStep)
          }}步后和棋
        </div>
      </div>
    </div>
    <div></div>
  </div>
</template>

<script setup lang="ts">
import Game from '../components/Game.vue';
import whitePiece from '../assets/white.png';
import blackPiece from '../assets/black.png';
import { PieceType, useGameStore } from '../stores/gameStore';
import Nav from '../components/Nav.vue';

const gameStore = useGameStore();
gameStore.handleRestart();

const pieceDraggable = (piece: PieceType) => {
  if (gameStore.gameIsEnd) {
    return false;
  }
  return piece.isWhite === gameStore.stepIsWhite;
};
</script>

<style lang="scss" scoped>
.main {
  min-height: 100vh;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 8px;
  .color-piece {
    display: flex;
    align-items: center;
    gap: 8px;
    .piece-img {
      width: 32px;
      height: 32px;
    }
  }

  .header {
    margin: 20px 0 auto 0;
  }

  .board {
    display: flex;
    flex-direction: column;
    gap: 8px;
    .board-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      .step {
        display: flex;
        align-items: center;
        gap: 8px;
      }
    }
    .board-body {
      border-radius: 6px;
      overflow: hidden;
      box-shadow: 0 10px #d6ab1d;
      transform: translateZ(0);
    }
    .board-footer {
       margin-top: 8px;
      height: 2em;
    }
  }
  .footer {
    margin: auto 0 40px 0;
    display: flex;
    align-items: center;
    gap: 8px;
  }
}
</style>