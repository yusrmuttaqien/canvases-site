<script setup lang="ts">
import * as THREE from "three";
import GLSLFragmentShader from "~/assets/glsl/glsl-three.frag";
import GLSLVertexShader from "~/assets/glsl/glsl-three.vert";

const container = ref<HTMLElement | null>(null);
const controller = new AbortController();

let clock: THREE.Clock;
let scene: THREE.Scene;
let camera: THREE.Camera;
let renderer: THREE.WebGLRenderer;
let uniforms: Record<string, THREE.IUniform> = {};

function init() {
  const geometry = new THREE.PlaneGeometry(2, 2);

  let material: THREE.ShaderMaterial;
  clock = new THREE.Clock();
  scene = new THREE.Scene();
  camera = new THREE.Camera();
  renderer = new THREE.WebGLRenderer();

  camera.position.z = 1;
  uniforms = {
    u_time: { value: 1.0 },
    u_resolution: { value: new THREE.Vector2() },
    u_mouse: { value: new THREE.Vector2() },
  };
  material = new THREE.ShaderMaterial({
    uniforms: uniforms,
    vertexShader: GLSLVertexShader,
    fragmentShader: GLSLFragmentShader,
  });

  const mesh = new THREE.Mesh(geometry, material);

  scene.add(mesh);
  container.value?.appendChild(renderer.domElement);

  resize();
  window.addEventListener("resize", resize, { signal: controller.signal });
  window.addEventListener("mousemove", mouseMove, {
    signal: controller.signal,
  });
}
function resize() {
  renderer.setSize(window.innerWidth, window.innerHeight);
  uniforms.u_resolution.value.x = renderer.domElement.width;
  uniforms.u_resolution.value.y = renderer.domElement.height;
}
function mouseMove(e: MouseEvent) {
  uniforms.u_mouse.value.x = e.pageX;
  uniforms.u_mouse.value.y = e.pageY;
}
function loop() {
  requestAnimationFrame(loop);
  render();
}
function render() {
  uniforms.u_time.value += clock.getDelta();
  renderer.render(scene, camera);
}

useCodeRepo("/pages/glsl-three.page.vue");
onMounted(async () => {
  await nextTick(() => {
    init();
    loop();
  });
});
</script>

<template>
  <main ref="container"></main>
</template>
