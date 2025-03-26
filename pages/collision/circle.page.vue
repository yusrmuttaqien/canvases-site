<script setup lang="ts">
import { animate } from "motion";
import { PAGE_TRANSITION_DURATION } from "~/constants/app";
import type { Ref, UnwrapRef } from "vue";

type TCircle = {
  x: number;
  y: number;
  radius: number;
  fillStyle: string;
  el: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  mousePos: Ref<{
    x: number | undefined;
    y: number | undefined;
    offset: number;
    grow: number;
  }>;
};
const canvas = ref<HTMLCanvasElement | null>(null);

const controller = new AbortController();
let isDrawing = true;
let context: CanvasRenderingContext2D;
let mousePos = ref<UnwrapRef<TCircle["mousePos"]>>({
  x: undefined,
  y: undefined,
  offset: 100,
  grow: 120,
});

class Circle {
  #el: HTMLCanvasElement;
  #ctx: CanvasRenderingContext2D;

  x: number = 0;
  y: number = 0;
  radius: number;
  fillStyle: string = "#ff0000";

  constructor(
    configs: Pick<TCircle, "el" | "ctx"> & Partial<Omit<TCircle, "el" | "ctx">>,
  ) {
    const { el, ctx, ...rest } = configs;
    const { fillStyle = this.fillStyle, radius = 100, ...rest1 } = rest;

    this.#el = el;
    this.#ctx = ctx;

    this.radius = radius;
    this.fillStyle = fillStyle;

    this.update = this.update.bind(this);

    const { x = this.#el.width / 2, y = this.#el.height / 2 } = rest1;

    this.x = x;
    this.y = y;
  }

  #draw() {
    this.#ctx.beginPath();
    this.#ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    this.#ctx.fillStyle = this.fillStyle;
    this.#ctx.fill();
  }

  update() {
    this.x = Math.min(
      Math.max(this.x, this.radius),
      this.#el.width - this.radius,
    );
    this.y = Math.min(Math.max(this.y, this.radius), this.#el.height);

    this.#draw();
  }
}

function reRun() {
  if (!canvas.value) return;
  resizeCanvas();
}
function resizeCanvas() {
  if (!canvas.value) return;

  canvas.value.width = window.innerWidth;
  canvas.value.height = window.innerHeight;
}
function trackMouse(e: MouseEvent) {
  mousePos.value.x = e.x;
  mousePos.value.y = e.y;
}
function untrackMouse() {
  mousePos.value.x = undefined;
  mousePos.value.y = undefined;
}
function getDistance(x1: number, x2: number, y1: number, y2: number) {
  const xDist = x2 - x1;
  const yDist = y2 - y1;

  return Math.sqrt(Math.pow(xDist, 2) + Math.pow(yDist, 2));
}
function createCircles(ctx: CanvasRenderingContext2D, el: HTMLCanvasElement) {
  const circleCenter = new Circle({
    el,
    ctx,
    radius: Math.min(el.width / 3, el.height / 3),
  });
  const circleMove = new Circle({
    ctx,
    el,
    radius: Math.min(el.width / 15, el.height / 15),
    fillStyle: "black",
    y: el.height,
  });

  function modifyCircles() {
    const { x: x1, y: y1, radius: r1 } = circleCenter;
    const { x: x2, y: y2, radius: r2 } = circleMove;

    circleCenter.x = el.width / 2;
    circleCenter.y = el.height / 2;
    circleCenter.radius = Math.min(el.width / 3, el.height / 3);

    circleMove.radius = Math.min(el.width / 15, el.height / 15);

    if (mousePos.value.x && mousePos.value.y) {
      animate(x2, mousePos.value.x, {
        onUpdate(e) {
          circleMove.x = e;
        },
      });
      animate(y2, mousePos.value.y, {
        onUpdate(e) {
          circleMove.y = e;
        },
      });
    } else {
      animate(x2, el.width / 2, {
        onUpdate(e) {
          circleMove.x = e;
        },
      });
      animate(y2, el.height, {
        onUpdate(e) {
          circleMove.y = e;
        },
      });
    }
    const distance = getDistance(x1, x2, y1, y2);
    const isTouching = distance - r1 - r2 <= 0;

    if (isTouching) {
      circleCenter.fillStyle = "black";
      circleMove.fillStyle = "red";
    } else {
      circleCenter.fillStyle = "red";
      circleMove.fillStyle = "black";
    }
  }
  function loop() {
    ctx.clearRect(0, 0, el.width, el.height);
    modifyCircles();
    circleCenter.update();
    circleMove.update();

    if (isDrawing) requestAnimationFrame(loop);
  }

  loop();
}

onMounted(() => {
  if (!canvas.value) return;
  context = canvas.value.getContext("2d") as CanvasRenderingContext2D;

  resizeCanvas();
  window.addEventListener("resize", reRun, {
    signal: controller.signal,
  });
  window.addEventListener("mousemove", trackMouse, {
    signal: controller.signal,
  });
  window.addEventListener("mouseout", untrackMouse, {
    signal: controller.signal,
  });

  createCircles(context, canvas.value);
});
onUnmounted(() => {
  setTimeout(() => {
    isDrawing = false;
  }, PAGE_TRANSITION_DURATION);
  controller.abort();
});
</script>

<template>
  <main>
    <canvas ref="canvas" class="pointer-events-none"></canvas>
  </main>
</template>

<style scoped>
@reference "~/assets/styles/main.css";

canvas {
  @apply size-full;
}
</style>
