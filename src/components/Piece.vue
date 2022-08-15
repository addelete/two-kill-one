<template>
  <v-group
    :x="x + redraw"
    :y="y + redraw"
    :draggable="draggable"
    @dragend="onDragEnd"
  >
    <v-image
      :image="image"
      :width="radius * 2"
      :height="radius * 2"
      :x="-radius"
      :y="-radius"
      shadowColor="#000"
      :shadowBlur="4"
      :shadowOffset="{ x: 4, y: 6 }"
      :shadowOpacity="0.2"
    />
  </v-group>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import white from '../assets/white.png';
import black from '../assets/black.png';

const props = defineProps<{
  rowIndex: number;
  colIndex: number;
  boardGridSize: number;
  radius: number;
  isWhite: boolean;
  draggable: boolean;
  num: number;
  redraw: number;
}>();

const x = computed(() => props.colIndex * props.boardGridSize);
const y = computed(() => props.rowIndex * props.boardGridSize);

const image = new Image();
image.src = props.isWhite ? white : black;

const emit = defineEmits<{
  (
    event: 'move',
    data: {
      x: number;
      y: number;
    },
  ): void;
}>();

const onDragEnd = (e: any) => {
  emit('move', {
    x: e.target.x(),
    y: e.target.y(),
  });
};
</script>

<style>
</style>