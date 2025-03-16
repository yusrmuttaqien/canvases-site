<script setup lang="ts">
const canvas = ref<HTMLCanvasElement | null>(null);
const pageTransition = usePtSlideUp();

const controller = new AbortController();
let context: CanvasRenderingContext2D;
let cacheRandom: number[][];
let timeout: NodeJS.Timeout;

function reRun() {
  if (!canvas.value) return;
  resizeCanvas();
  drawBasic(context, canvas.value);
}
function resizeCanvas() {
  if (!canvas.value) return;

  canvas.value.width = window.innerWidth;
  canvas.value.height = window.innerHeight;
}
function getRandomNumbers(
  i0: number,
  i1: number,
  modifier?: (e: number) => number,
) {
  if (cacheRandom && cacheRandom[i0] && cacheRandom[i0][i1])
    return cacheRandom[i0][i1];
  let randomNumbers = Math.random();
  randomNumbers = modifier ? modifier(randomNumbers) : randomNumbers;

  if (!cacheRandom) cacheRandom = [];
  if (!cacheRandom[i0]) cacheRandom[i0] = [];

  cacheRandom[i0].push(randomNumbers);

  return randomNumbers;
}
function drawBasic(ctx: CanvasRenderingContext2D, el: HTMLCanvasElement) {
  // draw rects
  ctx.fillStyle = "rgba(50, 239, 28, 0.95)";
  ctx.fillRect(0, 0, 100, 100);
  ctx.fillStyle = "rgba(225, 239, 28, 0.95)";
  ctx.fillRect(100, 100, 200, 200);
  ctx.fillStyle = "rgba(28, 56, 239, 0.95)";
  ctx.fillRect(300, 300, 300, 300);
  ctx.fillStyle = "rgba(239, 77, 28, 0.95)";
  ctx.fillRect(600, 600, 400, 400);

  // draw line
  ctx.beginPath();
  ctx.moveTo(100, 200);
  ctx.lineTo(100, 400);
  ctx.lineTo(200, 400);
  ctx.strokeStyle = "#ff0000";
  ctx.stroke();

  // draw arc
  ctx.beginPath();
  ctx.arc(400, 100, 50, 0, Math.PI * 2, false);
  ctx.strokeStyle = "#ff00e6";
  ctx.stroke();

  for (let i = 0; i < 50; i++) {
    ctx.beginPath();
    ctx.arc(
      getRandomNumbers(i, 0, (e) => e * el.width),
      getRandomNumbers(i, 1, (e) => e * el.height),
      50,
      0,
      Math.PI * 2,
      false,
    );
    ctx.fillStyle = `rgba(
    ${getRandomNumbers(i, 2, (e) => e * 255)}, 
    ${getRandomNumbers(i, 3, (e) => e * 255)}, 
    ${getRandomNumbers(i, 4, (e) => e * 255)}, 1)`;
    ctx.fill();
  }
}
function reDraw(e: MouseEvent) {
  const id = (e.target as HTMLElement).id;

  if (!canvas.value || id !== "shuffle") return;

  clearTimeout(timeout);
  context.clearRect(0, 0, canvas.value.width, canvas.value.height);
  cacheRandom = [];
  drawBasic(context, canvas.value);

  canvas.value.style.transform = "scale(0.95)";

  timeout = setTimeout(() => {
    if (!canvas.value) return;
    canvas.value.removeAttribute("style");
  }, 300);
}

definePageMeta({ pageTransition });
onMounted(() => {
  if (!canvas.value) return;
  context = canvas.value.getContext("2d") as CanvasRenderingContext2D;

  resizeCanvas();
  window.addEventListener("resize", reRun, {
    signal: controller.signal,
  });

  drawBasic(context, canvas.value);
});
onUnmounted(() => {
  controller.abort();
});
</script>

<template>
  <main class="relative isolate">
    <canvas ref="canvas"></canvas>
    <button
      id="shuffle"
      @click="reDraw"
      class="absolute inset-0 z-10 cursor-pointer"
    />
  </main>
</template>

<style scoped>
@reference "~/assets/styles/main.css";

canvas {
  @apply pointer-events-none relative z-0 size-full transition-transform;
}
</style>
