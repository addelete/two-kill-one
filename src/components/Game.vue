<template>
  <v-stage :width="boardSize" :height="boardSize">
    <Board
      :boardSize="boardSize"
      :boardGridSize="boardGridSize"
      :boardEdgeSize="boardEdgeSize"
    />
    <v-layer
      :x="boardGridSize / 2 + boardEdgeSize"
      :y="boardGridSize / 2 + boardEdgeSize"
    >
      <Piece
        v-for="piece in pieces"
        :key="piece.num"
        :isWhite="piece.isWhite"
        :rowIndex="selfIsWhite ? 3-piece.rowIndex: piece.rowIndex"
        :colIndex="selfIsWhite ? 3-piece.colIndex: piece.colIndex"
        :boardGridSize="boardGridSize"
        :radius="pieceRadius"
        :draggable="pieceDraggable(piece)"
        :num="piece.num"
        @move="(data) => onPieceMove({ ...data, num: piece.num })"
        :redraw="piecesRedraw"
      />
    </v-layer>
  </v-stage>
</template>

<script setup lang="ts">
import { PieceMoveData, PieceType } from '../stores/gameStore';
import Piece from './Piece.vue';
import Board from './Board.vue';

const props = defineProps<{
  pieces: PieceType[];
  selfIsWhite: boolean;
  boardSize: number;
  boardGridSize: number;
  boardEdgeSize: number;
  pieceRadius: number;
  piecesRedraw: number;
  pieceDraggable: (piece: PieceType) => boolean;
}>();


const emit = defineEmits<{
  (event: 'pieceMove', data: PieceMoveData): void;
}>();

const onPieceMove = (data: PieceMoveData): void => {
  emit('pieceMove', data);
};
</script>

<style>
</style>