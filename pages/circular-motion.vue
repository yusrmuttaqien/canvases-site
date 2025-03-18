<script setup lang="ts">
import { PAGE_TRANSITION_DURATION } from "~/constants/app";
import type { Ref, UnwrapRef } from "vue";

type TParticle = {
  x: number;
  y: number;
  dx: number;
  dy: number;
  radius: number;
  radians: number;
  distance: number;
  strokeStyle: string;
  el: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  mousePos: Ref<{
    x: number | undefined;
    y: number | undefined;
  }>;
};
const canvas = ref<HTMLCanvasElement | null>(null);
const pageTransition = usePtSlideUp();

const controller = new AbortController();
let isDrawing = true;
let context: CanvasRenderingContext2D;
let particles: InstanceType<typeof Particle>[] = [];
let mousePos = ref<UnwrapRef<TParticle["mousePos"]>>({
  x: undefined,
  y: undefined,
});

class Particle {
  #y1: number = 0;
  #x1: number = 0;
  #radius: number;
  #loop: number = 0;
  #distance: number = 0;
  #yRestore: number = 0;
  #xRestore: number = 0;
  #xRadians: number = 0;
  #yRadians: number = 0;
  #el: HTMLCanvasElement;
  #ctx: CanvasRenderingContext2D;
  #mousePos: TParticle["mousePos"];

  x: number = 0;
  y: number = 0;
  dx: number = 0;
  dy: number = 0;
  strokeStyle: string = "#ff0000";

  constructor(
    configs: Pick<TParticle, "el" | "ctx" | "mousePos"> &
      Partial<Omit<TParticle, "el" | "ctx" | "mousePos">>,
  ) {
    const { el, ctx, ...rest } = configs;
    const {
      mousePos,
      radius = 5,
      strokeStyle = this.strokeStyle,
      radians = this.#getRandomRadians(),
      distance = this.#getRandomDistance(),
      dx = this.#getRandomVelocity() * this.#getRandomBaseSpeed(),
      dy = this.#getRandomVelocity() * this.#getRandomBaseSpeed(),
      ...rest1
    } = rest;

    this.#el = el;
    this.#ctx = ctx;
    this.#radius = radius;
    this.#xRadians = radians;
    this.#yRadians = radians;
    this.#mousePos = mousePos;
    this.#distance = distance;

    this.dy = dy;
    this.dx = dx;
    this.strokeStyle = strokeStyle;

    this.update = this.update.bind(this);

    const { x = this.#el.width / 2, y = this.#el.height / 2 } = rest1;

    this.#x1 = x;
    this.#y1 = y;
    this.#xRestore = x;
    this.#yRestore = y;

    this.x = x;
    this.y = y;
  }

  #getRandomDistance() {
    return Math.floor(Math.random() * (250 - 100 + 1) + 100);
  }
  #getRandomRadians() {
    return Math.random() * Math.PI * 2;
  }
  #getRandomVelocity() {
    return Math.random() < 0.5 ? 1 : -1;
  }
  #getRandomBaseSpeed() {
    return Math.max(0.03, Math.random() * 0.09);
  }
  #draw(x: number, y: number) {
    this.#ctx.beginPath();
    this.#ctx.lineWidth = this.#radius;
    this.#ctx.strokeStyle = this.strokeStyle;
    this.#ctx.lineCap = "round";
    this.#ctx.moveTo(x, y);
    this.#ctx.lineTo(this.x, this.y);
    this.#ctx.stroke();
    this.#ctx.closePath();
  }
  #updateMovement() {
    this.#xRadians += this.dx;
    this.#yRadians += this.dy;
    this.x = this.#x1 + Math.cos(this.#xRadians) * this.#distance;
    this.y = this.#y1 + Math.sin(this.#xRadians) * this.#distance;
  }
  #quickEase(current: number, target: number, easingFactor: number = 0.1) {
    // Exponential decay calculation
    const delta = (current - target) * easingFactor;
    const newRadius = current - delta;

    // Snap to target when close enough to prevent infinite micro-adjustments
    return Math.abs(newRadius - target) < 0.5 ? target : newRadius;
  }
  #updateMouseInteraction() {
    if (!this.#mousePos.value.x || !this.#mousePos.value.y) {
      this.#x1 = this.#quickEase(this.#x1, this.#xRestore, 0.03);
      this.#y1 = this.#quickEase(this.#y1, this.#yRestore, 0.03);

      return;
    }
    const posX = this.#mousePos.value.x;
    const posY = this.#mousePos.value.y;

    this.#x1 = this.#quickEase(this.#x1, posX);
    this.#y1 = this.#quickEase(this.#y1, posY);
  }

  update() {
    const { x, y } = this;
    this.#updateMouseInteraction();
    this.#updateMovement();

    this.x = Math.min(
      Math.max(this.x, this.#radius),
      this.#el.width - this.#radius,
    );
    this.y = Math.min(
      Math.max(this.y, this.#radius),
      this.#el.height - this.#radius,
    );

    if (this.#loop > 0) {
      this.#draw(x, y);
    } else {
      this.#loop++;

      this.#draw(this.x, this.y);
    }
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
function create(ctx: CanvasRenderingContext2D, el: HTMLCanvasElement) {
  const styles = getComputedStyle(document.documentElement);
  const amber = styles.getPropertyValue("--color-amber-300");
  const amberLength = amber.length;

  for (let i = 0; i < 50; i++) {
    particles.push(
      new Particle({
        el,
        ctx,
        mousePos,
        strokeStyle: `rgba(
        ${Math.random() * 255},
        ${Math.random() * 255},
        ${Math.random() * 255},
        1)`,
        radius: Math.min(Math.max(Math.random() * 20, 10), 20),
      }),
    );
  }

  function loop() {
    ctx.fillStyle = amber.substring(0, amberLength - 1) + " / 0.05)";
    ctx.fillRect(0, 0, el.width, el.height);

    particles.forEach((particle) => particle.update());

    if (isDrawing) requestAnimationFrame(loop);
  }

  loop();
}

definePageMeta({ pageTransition });
useCrStates(
  "https://github.com/yusrmuttaqien/canvases-site/blob/main/pages/circular-motion.vue",
);
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

  create(context, canvas.value);
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
