<template>
  <div
    class="main"
    :style="{
      width: `${gameStore.boardSize}px`,
    }"
  >
    <Nav title="线上与人对战" />
    <div class="header">
      <div class="color-piece">
        <img
          class="piece-img"
          :src="!gameStore.selfIsWhite ? whitePiece : blackPiece"
        />
        <span>对方{{ otherSideOnline ? '在线' : '离线或无人' }}</span>
      </div>
      <div class="channel" v-if="!otherSideOnline">
        <span>房间：{{ channelId }}</span>
        <button @click="copyLink">邀请</button>
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
      <button @click="changeSelfColor" v-if="gameStore.steps === 0">
        换手
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import Game from '../components/Game.vue';
import Nav from '../components/Nav.vue';
import whitePiece from '../assets/white.png';
import blackPiece from '../assets/black.png';
import { onMounted, onUnmounted, ref } from 'vue';
import { RtmChannel, RtmMessage, RtmTextMessage } from 'agora-rtm-sdk';
import {
  useGameStore,
  PieceType,
  GameFrameData,
  PieceMoveData,
} from '../stores/gameStore';
import { useLogStore } from '../stores/logStore';
import { createRtmChannel } from '../utils/rtm';
import { useRouter } from 'vue-router';
import { Rule } from '../utils/game';
import { MessageUtils } from '../utils/message';

const router = useRouter();

const gameStore = useGameStore();
const logStore = useLogStore();
const otherSideOnline = ref(false);

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

const channelId = ref('');

let channel: RtmChannel;

onMounted(async () => {
  channel = await createRtmChannel();
  const members = await channel.getMembers();
  if (members.length > 2) {
    alert('房间已满');
    router.replace('/');
    return;
  }
  channelId.value = channel.channelId.slice(0, 4).toUpperCase();
  channel.on('MemberJoined', () => {
    logStore.append({ message: 'MemberJoined' });
    otherSideOnline.value = true;
    sendGameFrameData();
  });

  channel.on('MemberLeft', () => {
    logStore.append({ message: 'MemberLeft' });
    channel.getMembers().then((members) => {
      if (members.length === 1) {
        otherSideOnline.value = false;
      }
    });
  });

  gameStore.setRuleChangeListener((rule: Rule) => {
    channel.sendMessage({
      text: JSON.stringify({
        type: 'changeRule',
        data: rule,
      }),
    });
  });

  channel.on('ChannelMessage', (message: RtmMessage) => {
    try {
      otherSideOnline.value = true;
      const messageObj = JSON.parse((message as RtmTextMessage).text);
      switch (messageObj.type) {
        case 'sync':
          gameStore.syncByFrameData(messageObj.data as GameFrameData);
          break;
        case 'changeRule':
          gameStore.syncByRule(messageObj.data as Rule);
          if (messageObj.data) {
            MessageUtils.open(`游戏规则变更为：${gameStore.ruleStr}`);
          }
          break;
      }
    } catch (e) {}
  });
});

onUnmounted(() => {
  gameStore.removeRuleChangeListener();
  channel.leave();
});

const sendGameFrameData = () => {
  channel.sendMessage({
    text: JSON.stringify({
      type: 'sync',
      data: {
        rule: gameStore.rule,
        board: gameStore.board,
        steps: gameStore.steps,
        selfIsWhite: !gameStore.selfIsWhite,
        stepIsWhite: gameStore.stepIsWhite,
        onlyOnePieceStep: gameStore.onlyOnePieceStep,
        gameIsEnd: gameStore.gameIsEnd,
        gameEndBecause: gameStore.gameEndBecause,
      } as GameFrameData,
    }),
  });
};

const changeSelfColor = () => {
  gameStore.changeSelfColor();
  sendGameFrameData();
};

const handleRestart = () => {
  gameStore.handleRestart();

  sendGameFrameData();
};

const handlePieceMove = (data: PieceMoveData) => {
  gameStore.handlePieceMove(data);
  sendGameFrameData();
};

const copyLink = () => {
  let input = document.createElement('input');
  input.style.position = 'fixed';
  input.style.top = '-10000px';
  input.style.zIndex = '-999';
  document.body.appendChild(input);
  input.value = window.location.href;
  input.focus();
  input.select();
  try {
    let result = document.execCommand('copy');
    document.body.removeChild(input);
    if (result) {
      MessageUtils.open('邀请链接已复制，可以粘贴发给好友或直接分享本页面给好友');
    } else {
      MessageUtils.open(
        '当前浏览器不支持复制功能，请手动复制页面链接或直接分享本页面给好友',
      );
    }
  } catch (e) {
    document.body.removeChild(input);
    MessageUtils.open('当前浏览器不支持复制功能，请手动复制页面链接或直接分享本页面给好友');
  }
};
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
  }
}
</style>