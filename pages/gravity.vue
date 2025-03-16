<script setup lang="ts">
import { PAGE_TRANSITION_DURATION } from "~/constants/app";

type TBall = {
  x: number;
  y: number;
  dx: number;
  dy: number;
  speed: number;
  radius: number;
  friction: number;
  fillStyle: string;
  el: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
};
const canvas = ref<HTMLCanvasElement | null>(null);
const pageTransition = usePtSlideUp();

let balls: InstanceType<typeof Ball>[] = [];
const controller = new AbortController();
let context: CanvasRenderingContext2D;
let isDrawing = true;

class Ball {
  #x: number = 0;
  #y: number = 0;
  #dy: number = 0;
  #speed: number = 0;
  #radius: number = 0;
  #friction: number = 0;
  #el: HTMLCanvasElement;
  #ctx: CanvasRenderingContext2D;
  #fillStyle: string = "#ff0000";

  constructor(
    configs: Pick<TBall, "el" | "ctx"> & Partial<Omit<TBall, "el" | "ctx">>,
  ) {
    const { el, ctx, ...rest } = configs;
    const {
      radius = 100,
      fillStyle = this.#fillStyle,
      dy = this.#getRandomVelocity(),
      speed = this.#getRandomBaseSpeed(),
      friction = this.#getRandomFriction(),
      ...rest1
    } = rest;

    this.#dy = dy;
    this.#el = el;
    this.#ctx = ctx;
    this.#speed = speed;
    this.#radius = radius;
    this.#friction = friction;
    this.#fillStyle = fillStyle;
    this.update = this.update.bind(this);

    const { x = this.#getRandomPoint("x"), y = this.#getRandomPoint("y") } =
      rest1;

    this.#x = x;
    this.#y = y;
  }

  #getRandomVelocity() {
    return Math.random() < 0.5 ? 1 : -1;
  }
  #getRandomBaseSpeed() {
    return Math.round(Math.max(1, Math.random() * 3));
  }
  #getRandomFriction() {
    return Math.max(0.5, Math.random() * 0.7);
  }
  #getRandomPoint(type: "x" | "y") {
    if (type === "x")
      return Math.max(
        this.#radius,
        Math.random() * this.#el.width - this.#radius,
      );
    else
      return Math.max(
        this.#radius * 2,
        Math.random() * this.#el.height - this.#radius,
      );
  }
  #updateMovement() {
    if (this.#y >= this.#el.height - this.#radius || this.#y <= this.#radius) {
      this.#dy *= -1 * this.#friction;
    } else {
      this.#dy += 1;
    }

    this.#dy = Math.round(this.#dy);
  }
  #draw(y?: number) {
    this.#ctx.beginPath();
    this.#ctx.arc(this.#x, y || this.#y, this.#radius, 0, Math.PI * 2, false);
    this.#ctx.fillStyle = this.#fillStyle;
    this.#ctx.fill();
  }

  update() {
    this.#updateMovement();

    this.#y = Math.min(
      Math.max(this.#y + this.#dy * this.#speed, this.#radius),
      this.#el.height - this.#radius,
    );

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
function createBalls(ctx: CanvasRenderingContext2D, el: HTMLCanvasElement) {
  for (let i = 0; i < 1000; i++) {
    balls.push(
      new Ball({
        el,
        ctx,
        fillStyle: `rgba(
        ${Math.random() * 255},
        ${Math.random() * 255},
        ${Math.random() * 255},
        1)`,
        radius: Math.min(Math.max(Math.random() * 20, 10), 20),
      }),
    );
  }

  function loop() {
    ctx.clearRect(0, 0, el.width, el.height);
    balls.forEach((ball) => ball.update());

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

  createBalls(context, canvas.value);
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
