<template>
  <div
    class="main"
    :style="{
      width: `${gameStore.boardSize}px`,
    }"
  >
    <Nav title="与机器对战" />
    <div class="header">
      <div class="color-piece">
        <img
          class="piece-img"
          :src="!gameStore.selfIsWhite ? whitePiece : blackPiece"
        />
        <span>对方</span>
      </div>
    </div>

    <div class="board">
      <div class="board-header">
        <button @click="handleRestart">重开</button>
        <div class="color-piece" v-if="!gameStore.gameIsEnd">
          <img
            class="piece-img"
            :src="gameStore.stepIsWhite ? whitePiece : blackPiece"
          />
          <span
            >轮到{{
              gameStore.stepIsWhite === gameStore.selfIsWhite ? '己' : '对'
            }}方走棋</span
          >
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
          @pieceMove="handlePieceMove"
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

    <div class="footer">
      <div class="color-piece">
        <img
          class="piece-img"
          :src="gameStore.selfIsWhite ? whitePiece : blackPiece"
        />
        <span>己方执{{ gameStore.selfIsWhite ? '白' : '黑' }}</span>
      </div>
      <div class="btns">
        <button
          @click="changeSelfColor"
          v-if="gameStore.steps === 0 || gameStore.selfIsWhite"
        >
          {{ gameStore.steps > 0 ? '重开并换手' : '换手' }}
        </button>
        <button @click="gameStore.handleUndo" v-if="gameStore.canUndo">
          悔棋
        </button>
        <StepBoards />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Game from '../components/Game.vue';
import Nav from '../components/Nav.vue';
import whitePiece from '../assets/white.png';
import blackPiece from '../assets/black.png';
import { useGameStore, PieceType, PieceMoveData } from '../stores/gameStore';

import { GameUtils } from '../utils/game';
import StepBoards from '../components/StepBoards.vue';
import { onMounted } from 'vue';

const gameStore = useGameStore();

gameStore.handleRestart();

const pieceDraggable = (piece: PieceType) => {
  if (gameStore.gameIsEnd) {
    return false;
  }
  return (
    piece.isWhite === gameStore.stepIsWhite &&
    gameStore.selfIsWhite === gameStore.stepIsWhite
  );
};

const aiStep = () => {
  if (gameStore.gameIsEnd) {
    return;
  }
  if (gameStore.selfIsWhite === gameStore.stepIsWhite) {
    return;
  }
  // 延时执行，避免操作太快看不清
  setTimeout(() => {
    const nextStep = GameUtils.aiNextStep(
      [...gameStore.board],
      gameStore.stepIsWhite,
      !gameStore.selfIsWhite,
      gameStore.rule,
    );
    if (nextStep) {
      if (gameStore.selfIsWhite) {
        nextStep.rowIndex = 3 - nextStep.rowIndex;
        nextStep.colIndex = 3 - nextStep.colIndex;
      }
      gameStore.handlePieceMove({
        num: nextStep.num,
        x:
          gameStore.boardEdgeSize + gameStore.boardGridSize * nextStep.colIndex,
        y:
          gameStore.boardEdgeSize + gameStore.boardGridSize * nextStep.rowIndex,
      });
    }
  }, 500);
};

const changeSelfColor = () => {
  // 重开并换手，进适用于玩的过程中白切黑
  if (gameStore.selfIsWhite && gameStore.steps > 0) {
    gameStore.handleRestart();
    gameStore.changeSelfColor();
    return;
  }
  // 黑换手到白，ai走一步
  if (!gameStore.selfIsWhite) {
    gameStore.changeSelfColor();
    aiStep();
    return;
  }
  // 白换手到黑，仅换手
  gameStore.changeSelfColor();

};

const handleRestart = () => {
  gameStore.handleRestart();
  if (gameStore.selfIsWhite) {
    aiStep();
  }
};

const handlePieceMove = (data: PieceMoveData) => {
  gameStore.handlePieceMove(data);
  aiStep();
};

onMounted(() => {
  if (gameStore.selfIsWhite) {
    aiStep();
  }
});
</script>

<style lang="scss" scoped>
.main {
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  .color-piece {
    display: flex;
    align-items: center;
    gap: 8px;
    .piece-img {
      width: 24px;
      height: 24px;
    }
  }

  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 8px;
    .channel {
      display: flex;
      align-items: center;
      gap: 8px;
    }
  }

  .board {
    display: flex;
    flex-direction: column;

    .board-header {
      margin-top: 8px;
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
      margin-top: 8px;
      border-radius: 6px;
      overflow: hidden;
      box-shadow: 0 10px #d6ab1d;
      transform: translateZ(0);
    }
    .board-footer {
      margin-top: 16px;
      height: 2em;
    }
  }
  .footer {
    margin-top: 8px;
    display: flex;
    align-items: center;
    display: flex;
    align-items: center;
    gap: 8px;
    .btns {
      margin-left: auto;
      display: flex;
      gap: 8px;
      align-items: center;
    }
  }
}
</style>