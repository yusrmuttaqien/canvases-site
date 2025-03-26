<script setup lang="ts">
import GLSLFragmentShader from "~/assets/glsl/glsl.frag";
import GLSLVertexShader from "~/assets/glsl/glsl.vert";

const canvas = ref<HTMLCanvasElement | null>(null);
const controller = new AbortController();

function resizeCanvas() {
  if (!canvas.value) return;

  canvas.value.width = window.innerWidth;
  canvas.value.height = window.innerHeight;
}
function reRun() {
  if (!canvas.value) return;
  resizeCanvas();
}

useCodeRepo("/pages/glsl.page.vue");
onMounted(async () => {
  resizeCanvas();
  window.addEventListener("resize", reRun, {
    signal: controller.signal,
  });

  const { default: GlslCanvas } = await import("glslCanvas");
  const glsl = new GlslCanvas(canvas.value!);

  glsl.load(GLSLFragmentShader, GLSLVertexShader);
});
</script>

<template>
  <main>
    <canvas ref="canvas"></canvas>
  </main>
</template>
