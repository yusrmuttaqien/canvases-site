<script setup lang="ts">
import scripts from "./scripts";
import { PAGE_TRANSITION_DURATION } from "~/constants/app";

const states = useGsapStates();
const isHMR = computed(() => states.value.hmr.last !== states.value.hmr.recent);

const d = ref(0);
const isLooping = ref(true);
const canvas = ref<HTMLCanvasElement>();
const controller = ref<AbortController>();
const sceneClear = ref<VoidFunction>();

onMounted(() => {
  sceneClear.value = scripts({ canvas, controller, d, isLooping });
});
onBeforeUnmount(() => {
  controller.value?.abort();

  if (isHMR.value) {
    isLooping.value = false;
    sceneClear.value?.();
    sceneClear.value = undefined;
  }
});
onUnmounted(() => {
  setTimeout(() => {
    isLooping.value = false;
    sceneClear.value?.();
    sceneClear.value = undefined;
  }, PAGE_TRANSITION_DURATION);
});
</script>

<template>
  <main>
    <p class="absolute top-1/2 text-white mix-blend-difference">{{ d }}</p>
    <canvas ref="canvas"></canvas>
  </main>
</template>
