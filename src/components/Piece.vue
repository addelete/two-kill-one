<template>
  <v-group
    ref="nodeRef"
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
import { ref, watch } from 'vue';
import Konva from 'konva';
import white from '../assets/white.png';
import black from '../assets/black.png';

const props = defineProps<{
  rowIndex: number;
  colIndex: number;
  boardGridSize: number;
  radius: number;
  isWhite: boolean;
  selfIsWhite: boolean;
  draggable: boolean;
  num: number;
  redraw: number;
}>();

const x = ref(props.colIndex * props.boardGridSize);
const y = ref(props.rowIndex * props.boardGridSize);

const image = new Image();
image.src = props.isWhite ? white : black;

const nodeRef = ref<any>(null);

watch(
  () => ({
    x: props.colIndex * props.boardGridSize,
    y: props.rowIndex * props.boardGridSize,
  }),
  (newPosition) => {
    if (nodeRef.value && props.selfIsWhite !== props.isWhite) {
      const duration = 0.2
      const tween = new Konva.Tween({
        node: nodeRef.value.getNode() as Konva.Node,
        duration,
        x: newPosition.x,
        y: newPosition.y,
      });
      tween.play();
      setTimeout(() => {
        x.value = newPosition.x;
        y.value = newPosition.y;
      }, duration * 1000);
    } else {
      x.value = newPosition.x;
      y.value = newPosition.y;
    }
  },
);

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