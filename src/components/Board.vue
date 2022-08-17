<template>
  <v-layer>
    <v-rect :width="boardSize" :height="boardSize" :fill="bgColor" />
    <v-group :x="boardEdgeSize" :y="boardEdgeSize">
      <v-rect
        v-for="(rect, i) of rects"
        :key="i"
        :x="rect.x"
        :y="rect.y"
        :width="rect.width"
        :height="rect.height"
        :fill="rect.fill"
      />
    </v-group>
  </v-layer>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  boardSize: number;
  boardEdgeSize: number;
  boardGridSize: number;
}>();

const bgColor = '#FFE35B';

const rects = computed(() => {
  const res = [];

  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      res.push({
        x: props.boardGridSize * i,
        y: props.boardGridSize * j,
        width: props.boardGridSize,
        height: props.boardGridSize,
        fill: i % 2 === j % 2 ? '#729b17' : '#4a7d0c',
      });
    }
  }
  return res;
});
</script>