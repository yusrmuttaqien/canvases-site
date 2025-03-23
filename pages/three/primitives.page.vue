<script setup lang="ts">
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/Addons.js";

const d = ref(0);
const canvas = ref<HTMLCanvasElement>();
let controller: AbortController;

onMounted(() => {
  const scene = new THREE.Scene();

  const cubeGeometry = new THREE.BoxGeometry(2, 2, 2, 2, 2, 2);
  const cubeMaterial = new THREE.MeshBasicMaterial({
    color: "red",
    wireframe: true,
  });
  const cubeMesh = new THREE.Mesh(cubeGeometry, cubeMaterial);
  const cubeMeshAxesHelper = new THREE.AxesHelper(5);

  const sphereGeometry = new THREE.SphereGeometry(2, 10, 10);
  const sphereMaterial = new THREE.MeshBasicMaterial({
    color: "blue",
    wireframe: true,
  });
  const sphereMesh = new THREE.Mesh(sphereGeometry, sphereMaterial);
  const sphereMeshAxesHelper = new THREE.AxesHelper(5);

  const torusKnotGeometry = new THREE.TorusKnotGeometry(1, 1, 64, 13, 10, 15);
  const torusKnotMaterial = new THREE.MeshBasicMaterial({
    color: "blue",
    wireframe: true,
  });
  const torusKnotMesh = new THREE.Mesh(torusKnotGeometry, torusKnotMaterial);
  const torusKnotMeshAxesHelper = new THREE.AxesHelper(5);

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
  scene.add(sphereMesh);
  scene.add(torusKnotMesh);
  scene.add(worldAxesHelper);

  cubeMesh.add(cubeMeshAxesHelper);
  sphereMesh.add(sphereMeshAxesHelper);
  torusKnotMesh.add(torusKnotMeshAxesHelper);
  torusKnotMesh.scale.set(0.3, 0.3, 0.3);

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
