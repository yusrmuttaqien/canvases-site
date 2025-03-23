<script setup lang="ts">
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/Addons.js";

const d = ref(0);
const canvas = ref<HTMLCanvasElement>();
let controller: AbortController;

onMounted(() => {
  const scene = new THREE.Scene();
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    canvas: canvas.value,
  });
  const camera = new THREE.PerspectiveCamera(
    35,
    innerWidth / innerHeight,
    0.1,
    1000,
  );
  camera.position.set(0, 5, 100);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;

  const worldAxesHelper = new THREE.AxesHelper(500);

  const sphereGeometry = new THREE.SphereGeometry(1, 32, 32);

  const sunMaterial = new THREE.MeshBasicMaterial({ color: "yellow" });
  const earthMaterial = new THREE.MeshBasicMaterial({ color: "blue" });
  const moonMaterial = new THREE.MeshBasicMaterial({ color: "grey" });

  const sun = new THREE.Mesh(sphereGeometry, sunMaterial);
  sun.scale.setScalar(5);

  const earth = new THREE.Mesh(sphereGeometry, earthMaterial);
  earth.position.set(10, 0, 0);

  const moon = new THREE.Mesh(sphereGeometry, moonMaterial);
  moon.scale.setScalar(0.3);
  moon.position.set(2, 0, 0);

  earth.add(moon);

  scene.add(sun, earth);
  scene.add(worldAxesHelper);
  renderer.setSize(innerWidth, innerHeight);

  let lastTime = 0;

  function loop(currentTime: number) {
    let delta = currentTime - lastTime;
    lastTime = currentTime;
    d.value = delta;

    earth.rotation.y += (1 * delta) / 1000;
    earth.position.x = Math.sin((currentTime / 1000) * 0.1) * 10;
    earth.position.z = Math.cos((currentTime / 1000) * 0.1) * 10;

    moon.rotation.y += (1.5 * delta) / 1000;
    moon.position.x = Math.sin((currentTime / 1000) * 0.05) * 2;
    moon.position.z = Math.cos((currentTime / 1000) * 0.05) * 2;

    sun.rotation.y += (0.5 * delta) / 1000;

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
    <p class="absolute top-1/2 text-white mix-blend-difference">{{ d }}</p>
    <canvas ref="canvas"></canvas>
  </main>
</template>
