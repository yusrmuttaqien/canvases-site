<script setup lang="ts">
import { animate } from "motion";
import { PAGE_TRANSITION_DURATION } from "~/constants/app";
import type { Ref, UnwrapRef } from "vue";

type TSquare = {
  x: number;
  y: number;
  width: number;
  height: number;
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
const pageTransition = usePtSlideUp();

const controller = new AbortController();
let isDrawing = true;
let context: CanvasRenderingContext2D;
let mousePos = ref<UnwrapRef<TSquare["mousePos"]>>({
  x: undefined,
  y: undefined,
  offset: 100,
  grow: 120,
});

class Square {
  #el: HTMLCanvasElement;
  #ctx: CanvasRenderingContext2D;

  x: number = 0;
  y: number = 0;
  width: number;
  height: number;
  fillStyle: string = "#ff0000";

  constructor(
    configs: Pick<TSquare, "el" | "ctx"> & Partial<Omit<TSquare, "el" | "ctx">>,
  ) {
    const { el, ctx, ...rest } = configs;
    const {
      fillStyle = this.fillStyle,
      width = 100,
      height = 100,
      ...rest1
    } = rest;

    this.#el = el;
    this.#ctx = ctx;

    this.width = width;
    this.height = height;
    this.fillStyle = fillStyle;

    this.update = this.update.bind(this);

    const { x = this.#el.width / 2, y = this.#el.height / 2 } = rest1;

    this.x = x - this.width / 2;
    this.y = y - this.height / 2;
  }

  #draw() {
    this.#ctx.beginPath();
    this.#ctx.fillStyle = this.fillStyle;
    this.#ctx.fillRect(this.x, this.y, this.width, this.height);
    this.#ctx.fill();
  }

  update() {
    this.x = Math.min(Math.max(this.x, 0), this.#el.width - this.width);
    this.y = Math.min(Math.max(this.y, 0), this.#el.height);

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
function isCollide(e1: Square, e2: Square) {
  const { x: x1, y: y1, width: w1, height: h1 } = e1;
  const { x: x2, y: y2, width: w2, height: h2 } = e2;

  if (x1 + w1 > x2 && x1 < x2 + w2 && y1 + h1 > y2 && y1 < y2 + h2) {
    return true;
  } else {
    return false;
  }
}
function createSquare(ctx: CanvasRenderingContext2D, el: HTMLCanvasElement) {
  const centerDimension = getDimension(1.5);
  const moveDimension = getDimension(8);

  const squareCenter = new Square({
    ctx,
    el,
    width: centerDimension,
    height: centerDimension,
  });
  const squareMove = new Square({
    ctx,
    el,
    y: el.height,
    fillStyle: "black",
    width: moveDimension,
    height: moveDimension,
  });

  function getDimension(factor: number) {
    return Math.min(el.width / factor, el.height / factor);
  }
  function modifySquare() {
    const { x: x2, y: y2 } = squareMove;
    const centerDimension = getDimension(1.5);
    const moveDimension = getDimension(8);

    squareCenter.width = centerDimension;
    squareCenter.height = centerDimension;
    squareCenter.x = el.width / 2 - squareCenter.width / 2;
    squareCenter.y = el.height / 2 - squareCenter.height / 2;

    squareMove.width = moveDimension;
    squareMove.height = moveDimension;

    if (mousePos.value.x && mousePos.value.y) {
      animate(x2, mousePos.value.x - squareMove.width / 2, {
        onUpdate(e) {
          squareMove.x = e;
        },
      });
      animate(y2, mousePos.value.y - squareMove.height / 2, {
        onUpdate(e) {
          squareMove.y = e;
        },
      });
    } else {
      animate(x2, el.width / 2 - squareMove.width / 2, {
        onUpdate(e) {
          squareMove.x = e;
        },
      });
      animate(y2, el.height - squareMove.height / 2, {
        onUpdate(e) {
          squareMove.y = e;
        },
      });
    }
    const isColliding = isCollide(squareCenter, squareMove);

    if (isColliding) {
      squareCenter.fillStyle = "black";
      squareMove.fillStyle = "red";
    } else {
      squareCenter.fillStyle = "red";
      squareMove.fillStyle = "black";
    }
  }
  function loop() {
    ctx.clearRect(0, 0, el.width, el.height);
    modifySquare();
    squareCenter.update();
    squareMove.update();

    if (isDrawing) requestAnimationFrame(loop);
  }

  loop();
}

definePageMeta({ pageTransition });
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

  createSquare(context, canvas.value);
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
