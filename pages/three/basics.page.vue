<script setup lang="ts">
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/Addons.js";

const d = ref(0);
const canvas = ref<HTMLCanvasElement>();
let controller: AbortController;

onMounted(() => {
  const scene = new THREE.Scene();
  const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
  const cubeMaterial = new THREE.MeshBasicMaterial({
    color: "blue",
    wireframe: true,
  });
  const renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true,
    canvas: canvas.value,
  });
  // const group = new THREE.Group();
  const cubeMesh = new THREE.Mesh(cubeGeometry, cubeMaterial);
  const cubeMeshAxesHelper = new THREE.AxesHelper(5);
  // const cubeMesh1 = new THREE.Mesh(cubeGeometry, cubeMaterial);
  // const cubeMesh2 = new THREE.Mesh(cubeGeometry, cubeMaterial);
  const camera = new THREE.PerspectiveCamera(
    75,
    innerWidth / innerHeight,
    0.1,
    30,
  );
  // const aspectRatio = innerWidth / innerHeight;
  // const camera = new THREE.OrthographicCamera(
  //   -1 * aspectRatio,
  //   1 * aspectRatio,
  //   -1,
  //   1,
  //   0.1,
  //   1000,
  // );
  const controls = new OrbitControls(camera, renderer.domElement);
  const worldAxesHelper = new THREE.AxesHelper(5);
  controls.enableDamping = true;
  // controls.autoRotate = true;
  camera.position.z = 5;
  // cubeMesh.rotation.reorder("YXZ");
  // cubeMesh.rotation.y = THREE.MathUtils.degToRad(90);
  // cubeMesh.rotation.x = THREE.MathUtils.degToRad(45);
  // cubeMesh.scale.set(1, 1, 2);
  // cubeMesh1.position.set(1, 0, 1);
  // cubeMesh2.position.set(2, 2, 2);

  // group.add(cubeMesh);
  // group.add(cubeMesh1);
  // group.add(cubeMesh2);
  // group.scale.set(1, 1, 2);

  // scene.add(group);
  scene.add(cubeMesh);
  scene.add(worldAxesHelper);
  cubeMesh.add(cubeMeshAxesHelper);
  renderer.setSize(innerWidth, innerHeight);

  let lastTime = 0;

  function loop(currentTime: number) {
    let delta = currentTime - lastTime;
    lastTime = currentTime;
    d.value = delta;

    cubeMesh.rotation.y += (THREE.MathUtils.degToRad(1) * delta) / 20;
    cubeMesh.position.y = Math.sin(currentTime / 1000) * 2;

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
