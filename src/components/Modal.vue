

<template>
  <Teleport to="body">
    <div
      class="modal"
      v-if="open"
      :style="{
        width: `${width}px`,
        height: `${height}px`,
        marginLeft: `${-(width / 2)}px`,
        marginTop: `${-(height / 2)}px`,
      }"
    >
      <div class="modal-mask" @click="close"></div>
      <div class="modal-close" @click="close">X</div>
      <div class="modal-body">
        <slot />
      </div>
    </div>
  </Teleport>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue';

const props = withDefaults(
  defineProps<{
    open: boolean;
    width?: number;
    height?: number;
  }>(),
  {
    open: false,
    width: Math.min(600, document.documentElement.clientWidth - 40),
    height: 400,
  },
);





const emit = defineEmits<{
  (event: 'onClose'): void;
}>();

const close = () => {
  emit('onClose');
};
</script>

<style lang="scss">
.modal {
  position: fixed;
  left: 50%;
  top: 50%;
  z-index: 999;
  .modal-mask {
    position: fixed;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    left: 0;
    top: 0;
  }

  .modal-close {
    position: absolute;
    bottom: -42px;
    left: 50%;
    margin-left: -15px;
    cursor: pointer;
    width: 30px;
    height: 30px;
    background: #ffef00;
    border-radius: 50%;
    color: #000;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .modal-body {
    position: relative;
    width: 100%;
    height: 100%;
    background: #444;
    border-radius: 12px;
    padding: 20px;
    overflow: auto;
  }
}
</style>