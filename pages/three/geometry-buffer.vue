<script setup lang="ts">
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/Addons.js";

const d = ref(0);
const canvas = ref<HTMLCanvasElement>();
let controller: AbortController;

onMounted(() => {
  const scene = new THREE.Scene();

  const triangleGeometry = new THREE.BufferGeometry();
  const vertecies = new Float32Array([
    0.0, 0.0, 0.0, 0.0, 2.0, 0.0, 2.0, 0.0, 0.0,
  ]);

  triangleGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(vertecies, 3),
  );

  const triangleMaterial = new THREE.MeshBasicMaterial({ color: "red" });
  const triangleMesh = new THREE.Mesh(triangleGeometry, triangleMaterial);

  const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
  const cubeMaterial = new THREE.MeshBasicMaterial({
    color: "blue",
    wireframe: true,
  });
  const cubeMesh = new THREE.Mesh(cubeGeometry, cubeMaterial);
  const cubeMeshAxesHelper = new THREE.AxesHelper(5);

  const renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true,
    canvas: canvas.value,
  });
  const camera = new THREE.PerspectiveCamera(
    75,
    innerWidth / innerHeight,
    0.1,
    30,
  );
  const controls = new OrbitControls(camera, renderer.domElement);
  const worldAxesHelper = new THREE.AxesHelper(5);

  controls.enableDamping = true;
  controls.autoRotate = true;
  camera.position.z = 5;

  scene.add(cubeMesh);
  scene.add(triangleMesh);
  scene.add(worldAxesHelper);

  cubeMesh.add(cubeMeshAxesHelper);

  renderer.setSize(innerWidth, innerHeight);

  let lastTime = 0;

  function loop(currentTime: number) {
    let delta = currentTime - lastTime;
    lastTime = currentTime;
    d.value = delta;

    controls.update();
    renderer.render(scene, camera);

    requestAnimationFrame(loop);
  }

  loop(0);

  controller = new AbortController();

  addEventListener(
    "resize",
    () => {
      camera.aspect = innerWidth / innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(innerWidth, innerHeight);
    },
    { signal: controller.signal },
  );
});
onBeforeUnmount(() => {
  controller?.abort();
});
</script>

<template>
  <main>
    <p class="absolute top-1/2">{{ d }}</p>
    <canvas ref="canvas"></canvas>
  </main>
</template>
