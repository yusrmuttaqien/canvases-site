<script setup lang="ts">
import { transform } from "motion";
import type { Ref, UnwrapRef } from "vue";

type TCircle = {
  x: number;
  y: number;
  dx: number;
  dy: number;
  speed: number;
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
let mousePos = ref<UnwrapRef<TCircle["mousePos"]>>({
  x: undefined,
  y: undefined,
  offset: 100,
  grow: 120,
});

let circles: InstanceType<typeof Circle>[] = [];
const controller = new AbortController();
let context: CanvasRenderingContext2D;
let isDrawing = true;

class Circle {
  #x: number = 0;
  #y: number = 0;
  #dx: number = 0;
  #dy: number = 0;
  #speed: number = 0;
  #radius: number = 0;
  #radiusRestore: number = 0;
  #el: HTMLCanvasElement;
  #ctx: CanvasRenderingContext2D;
  #mousePos: TCircle["mousePos"];
  #fillStyle: string = "#ff0000";
  #trails: { x: number; y: number; fillStyle: string }[] = [];

  constructor(
    configs: Pick<TCircle, "el" | "ctx" | "mousePos"> &
      Partial<Omit<TCircle, "el" | "ctx" | "mousePos">>,
  ) {
    const { el, ctx, ...rest } = configs;
    const {
      mousePos,
      radius = 100,
      x = el.width / 2,
      y = el.height / 2,
      fillStyle = this.#fillStyle,
      dx = this.#getRandomVelocity(),
      dy = this.#getRandomVelocity(),
      speed = this.#getRandomBaseSpeed(),
    } = rest;

    this.#x = x;
    this.#y = y;
    this.#dx = dx;
    this.#dy = dy;
    this.#el = el;
    this.#ctx = ctx;
    this.#speed = speed;
    this.#radius = radius;
    this.#mousePos = mousePos;
    this.#fillStyle = fillStyle;
    this.#radiusRestore = radius;
    this.update = this.update.bind(this);
  }

  #getRandomVelocity() {
    return Math.random() < 0.5 ? 1 : -1;
  }
  #getRandomBaseSpeed() {
    return Math.random() * 10 + 1;
  }
  #updateMovement() {
    if (this.#x >= this.#el.width - this.#radius || this.#x <= this.#radius) {
      this.#speed = this.#getRandomBaseSpeed();
      this.#dx *= -1;
    }
    if (this.#y >= this.#el.height - this.#radius || this.#y <= this.#radius) {
      this.#speed = this.#getRandomBaseSpeed();
      this.#dy *= -1;
    }
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
      this.#radius = this.#quickEase(this.#radius, this.#radiusRestore);

      return;
    }
    const posX = this.#mousePos.value.x;
    const posY = this.#mousePos.value.y;
    const grow = this.#mousePos.value.grow;
    const offset = this.#mousePos.value.offset;

    if (
      posX - this.#x < offset &&
      posX - this.#x > -offset &&
      posY - this.#y < offset &&
      posY - this.#y > -offset
    ) {
      this.#radius = this.#quickEase(this.#radius, grow);
    } else {
      this.#radius = this.#quickEase(this.#radius, this.#radiusRestore);
    }
  }
  #updateRGBAlpha(rgba: string, alpha: number) {
    const idx = rgba.lastIndexOf(",");
    let newRGBA = rgba.substring(0, idx);
    newRGBA += `,${alpha})`;

    return newRGBA.replaceAll(" ", "").replaceAll("\n", "");
  }
  #updateTrails() {
    this.#trails.unshift({
      x: this.#x,
      y: this.#y,
      fillStyle: this.#fillStyle,
    });
    this.#trails = this.#trails.slice(0, 20);
    this.#trails = this.#trails.map(({ fillStyle, ...rest }, idx, arr) => {
      const opacity = transform(idx, [0, arr.length - 1], [0.8, 0]);
      const newFillStyle = this.#updateRGBAlpha(fillStyle, opacity);

      return { ...rest, fillStyle: newFillStyle };
    });
  }
  #draw(x?: number, y?: number, radius?: number, fillStyle?: string) {
    this.#ctx.beginPath();
    this.#ctx.arc(
      x || this.#x,
      y || this.#y,
      radius || this.#radius,
      0,
      Math.PI * 2,
      false,
    );
    this.#ctx.fillStyle = fillStyle || this.#fillStyle;
    this.#ctx.fill();
  }

  update() {
    this.#updateTrails();
    this.#updateMovement();
    this.#updateMouseInteraction();

    this.#x = Math.min(
      Math.max(this.#x + this.#dx * this.#speed, this.#radius),
      this.#el.width - this.#radius,
    );
    this.#y = Math.min(
      Math.max(this.#y + this.#dy * this.#speed, this.#radius),
      this.#el.height - this.#radius,
    );

    this.#draw();
    this.#trails.forEach(({ x, y, fillStyle }) => {
      this.#draw(x, y, this.#radius, fillStyle);
    });
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
function createCircles(ctx: CanvasRenderingContext2D, el: HTMLCanvasElement) {
  for (let i = 0; i < 1000; i++) {
    circles.push(
      new Circle({
        el,
        ctx,
        mousePos,
        radius: Math.min(Math.max(Math.random() * 20, 10), 20),
        fillStyle: `rgba(
        ${Math.random() * 255},
        ${Math.random() * 255},
        ${Math.random() * 255},
        1)`,
      }),
    );
  }

  function loop() {
    ctx.clearRect(0, 0, el.width, el.height);
    circles.forEach((circle) => circle.update());

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
  }, 400);
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
