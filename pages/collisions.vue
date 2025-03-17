<script setup lang="ts">
import { PAGE_TRANSITION_DURATION } from "~/constants/app";
import type { Ref, UnwrapRef } from "vue";

type TCircle = {
  x: number;
  y: number;
  dx: number;
  dy: number;
  mass: number;
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
const pageTransition = usePtSlideUp();

const controller = new AbortController();
let isDrawing = true;
let context: CanvasRenderingContext2D;
let circles: InstanceType<typeof Circle>[] = [];
let mousePos = ref<UnwrapRef<TCircle["mousePos"]>>({
  x: undefined,
  y: undefined,
  offset: 150,
  grow: 60,
});

class Circle {
  dx: number = 0;
  dy: number = 0;
  mass: number = 0;
  #el: HTMLCanvasElement;
  #radiusRestore: number = 0;
  #mousePos: TCircle["mousePos"];
  #ctx: CanvasRenderingContext2D;
  #fillStyleRestore: string = "#ff0000";

  x: number = 0;
  y: number = 0;
  radius: number;
  fillStyle: string = "#ff0000";

  constructor(
    configs: Pick<TCircle, "el" | "ctx" | "mousePos"> &
      Partial<Omit<TCircle, "el" | "ctx" | "mousePos">>,
  ) {
    const { el, ctx, ...rest } = configs;
    const {
      mass = 1,
      mousePos,
      radius = 100,
      fillStyle = this.fillStyle,
      dx = this.#getRandomVelocity() * this.#getRandomBaseSpeed(),
      dy = this.#getRandomVelocity() * this.#getRandomBaseSpeed(),
      ...rest1
    } = rest;

    this.#el = el;
    this.#ctx = ctx;
    this.#mousePos = mousePos;
    this.#radiusRestore = radius;
    this.#fillStyleRestore = fillStyle;

    this.dy = dy;
    this.dx = dx;
    this.mass = mass;
    this.radius = radius;
    this.fillStyle = fillStyle;

    this.update = this.update.bind(this);

    const { x = this.#el.width / 2, y = this.#el.height / 2 } = rest1;

    this.x = x;
    this.y = y;
  }

  #getRandomVelocity() {
    return Math.random() < 0.5 ? 1 : -1;
  }
  #getRandomBaseSpeed() {
    return Math.max(1, Math.random() * 3);
  }
  #draw() {
    this.#ctx.beginPath();
    this.#ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    this.#ctx.fillStyle = this.fillStyle;
    this.#ctx.fill();
  }
  #rotateCoordinate(dx: number, dy: number, angle: number) {
    const rotatedVelocities = {
      x: dx * Math.cos(angle) - dy * Math.sin(angle),
      y: dx * Math.sin(angle) + dy * Math.cos(angle),
    };

    return rotatedVelocities;
  }
  #resolveCollision(curr: Circle, other: Circle) {
    const xVelocityDiff = curr.dx - other.dx;
    const yVelocityDiff = curr.dy - other.dy;

    const xDist = other.x - curr.x;
    const yDist = other.y - curr.y;

    // Prevent accidental overlap of particles
    if (xVelocityDiff * xDist + yVelocityDiff * yDist >= 0) {
      // Grab angle between the two colliding particles
      const angle = -Math.atan2(other.y - curr.y, other.x - curr.x);

      // Store mass in var for better readability in collision equation
      const m1 = curr.mass;
      const m2 = other.mass;

      // Velocity before equation: convert velocity into 1D
      const u1 = this.#rotateCoordinate(curr.dx, curr.dy, angle);
      const u2 = this.#rotateCoordinate(other.dx, other.dy, angle);

      // Calculate 1D velocity with 1D Newtonian: https://en.wikipedia.org/wiki/Elastic_collision#One-dimensional_Newtonian
      const v1 = {
        x: (u1.x * (m1 - m2)) / (m1 + m2) + (u2.x * 2 * m2) / (m1 + m2),
        y: u1.y,
      };
      const v2 = {
        x: (u2.x * (m1 - m2)) / (m1 + m2) + (u1.x * 2 * m2) / (m1 + m2),
        y: u2.y,
      };

      // Rotate back velocity from 1D
      const vFinal1 = this.#rotateCoordinate(v1.x, v1.y, -angle);
      const vFinal2 = this.#rotateCoordinate(v2.x, v2.y, -angle);

      // Swap particle velocities
      curr.dx = vFinal1.x;
      curr.dy = vFinal1.y;

      other.dx = vFinal2.x;
      other.dy = vFinal2.y;
    }
  }
  #detectCollisions(others: typeof circles) {
    others.forEach((other) => {
      const isSelf = this === other;

      if (isSelf) return;
      const distance = getDistance(this.x, other.x, this.y, other.y);
      const isOverlapping = distance - other.radius - this.radius <= 0;

      if (isOverlapping) {
        this.#resolveCollision(this, other);
      }
    });
  }
  #updateMovement() {
    if (this.x >= this.#el.width - this.radius || this.x <= this.radius) {
      this.dx = Math.sign(this.dx) * -1 * this.#getRandomBaseSpeed();
    }
    if (this.y >= this.#el.height - this.radius || this.y <= this.radius) {
      this.dy = Math.sign(this.dy) * -1 * this.#getRandomBaseSpeed();
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
      this.fillStyle = this.#fillStyleRestore;
      this.radius = this.#quickEase(this.radius, this.#radiusRestore);

      return;
    }
    const posX = this.#mousePos.value.x;
    const posY = this.#mousePos.value.y;
    const grow = this.#mousePos.value.grow;
    const offset = this.#mousePos.value.offset;

    if (
      posX - this.x < offset &&
      posX - this.x > -offset &&
      posY - this.y < offset &&
      posY - this.y > -offset
    ) {
      this.fillStyle = `rgba(
      ${Math.random() * 255},
      ${Math.random() * 255},
      ${Math.random() * 255},
      1)`;
      this.radius = this.#quickEase(this.radius, grow);
    } else {
      this.fillStyle = this.#fillStyleRestore;
      this.radius = this.#quickEase(this.radius, this.#radiusRestore);
    }
  }

  update(others: typeof circles) {
    this.#updateMouseInteraction();
    this.#updateMovement();
    this.#detectCollisions(others);

    this.x = Math.min(
      Math.max(this.x + this.dx, this.radius),
      this.#el.width - this.radius,
    );
    this.y = Math.min(
      Math.max(this.y + this.dy, this.radius),
      this.#el.height - this.radius,
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
  function generateParams(ovRadius?: number) {
    const radius = ovRadius || Math.max(10, Math.random() * 50);
    const x = Math.max(radius, Math.random() * el.width - radius);
    const y = Math.max(radius, Math.random() * el.height - radius);

    return { x, y, radius };
  }
  function loop() {
    ctx.clearRect(0, 0, el.width, el.height);
    circles.forEach((circle) => circle.update(circles));

    if (isDrawing) requestAnimationFrame(loop);
  }
  function generateSparseCircles() {
    const maxAttpPerCircle = 150;
    const maxConsecutiveFailures = 100;
    let consecutiveFailures = 0;

    for (let i = 0; i < 800; i++) {
      let attempts = 0;
      let isAllocated = false;
      let curr: ReturnType<typeof generateParams> = { radius: 0, x: 0, y: 0 };

      if (!isAllocated && attempts < maxAttpPerCircle) {
        attempts++;
        isAllocated = true;
        curr = generateParams(20);

        if (circles.length) {
          for (let j = 0; j < circles.length; j++) {
            const distance = getDistance(
              curr.x,
              circles[j].x,
              curr.y,
              circles[j].y,
            );
            const isOverlapping =
              distance - circles[j].radius - curr.radius <= 0;

            if (isOverlapping) {
              isAllocated = false;

              break;
            }
          }
        }
      }

      if (isAllocated) {
        circles.push(
          new Circle({
            el,
            ctx,
            mousePos,
            x: curr.x,
            y: curr.y,
            radius: curr.radius,
            fillStyle: `rgba(
            ${Math.random() * 255},
            ${Math.random() * 255},
            ${Math.random() * 255},
            1)`,
          }),
        );

        consecutiveFailures = 0;
      } else {
        consecutiveFailures++;

        if (consecutiveFailures >= maxConsecutiveFailures) {
          console.error("Canvas full. Stopping early.");

          break;
        }
      }
    }
  }

  generateSparseCircles();
  loop();
}

definePageMeta({ pageTransition });
useCrStates(
  "https://github.com/yusrmuttaqien/canvases-site/blob/main/pages/collisions.vue",
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
