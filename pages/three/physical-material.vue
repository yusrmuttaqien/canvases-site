<script setup lang="ts">
import * as THREE from "three";
import { Pane } from "tweakpane";
import { OrbitControls } from "three/examples/jsm/Addons.js";

const d = ref(0);
const canvas = ref<HTMLCanvasElement>();
let controller: AbortController;
let pane: Pane;

onMounted(() => {
  const scene = new THREE.Scene();
  pane = new Pane();

  const material = new THREE.MeshPhysicalMaterial({
    color: "red",
    side: THREE.DoubleSide,
    clearcoat: 1,
    roughness: 0.3,
    metalness: 0.05,
    reflectivity: 0.2,
  });
  pane.addBinding(material, "metalness", { min: 0, max: 1, step: 0.01 });
  pane.addBinding(material, "roughness", { min: 0, max: 1, step: 0.01 });
  pane.addBinding(material, "reflectivity", { min: 0, max: 1, step: 0.01 });
  pane.addBinding(material, "clearcoat", { min: 0, max: 1, step: 0.01 });

  const cubeGeometry = new THREE.BoxGeometry(2, 2, 2, 2, 2, 2);
  const cubeMesh = new THREE.Mesh(cubeGeometry, material);
  const cubeMesh2 = new THREE.Mesh(cubeGeometry, material);

  const torusGeometry = new THREE.TorusKnotGeometry(1, 0.3, 64, 100);
  const torusMesh = new THREE.Mesh(torusGeometry, material);

  const fog = new THREE.Fog("black", 0, 20);
  const meshAxesHelper = new THREE.AxesHelper(5);
  const ambientLight = new THREE.AmbientLight("#FFFFFF", 0.5);
  const pointLight = new THREE.PointLight("#FFFFFF", 10);
  const pointLight2 = new THREE.PointLight("#FFFFFF", 10);
  const pointLightHelper = new THREE.PointLightHelper(pointLight, 5);
  const pointLightHelper2 = new THREE.PointLightHelper(pointLight2, 5);
  const renderer = new THREE.WebGLRenderer({
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

  camera.position.set(2, 0, 8);
  controls.target.set(2, 0, 0);
  pointLight.position.set(2, 2, 2);
  pointLight.rotateX(THREE.MathUtils.degToRad(45));
  pointLight2.position.set(2, 2, 5);
  pointLight2.rotateX(THREE.MathUtils.degToRad(-45));
  cubeMesh2.position.set(4, 0, 0);
  torusMesh.position.set(2, 0, 4);

  scene.add(cubeMesh);
  scene.add(cubeMesh2);
  scene.add(torusMesh);
  scene.add(pointLight);
  scene.add(pointLight2);
  scene.add(ambientLight);
  scene.add(worldAxesHelper);
  scene.add(pointLightHelper);
  scene.add(pointLightHelper2);

  scene.fog = fog;

  cubeMesh.add(meshAxesHelper);
  cubeMesh2.add(meshAxesHelper);

  renderer.setSize(innerWidth, innerHeight);

  let lastTime = 0;

  function loop(currentTime: number) {
    let delta = currentTime - lastTime;
    lastTime = currentTime;
    d.value = delta;

    cubeMesh.rotation.y += (THREE.MathUtils.degToRad(1) * delta) / 20;
    cubeMesh2.rotation.z += (THREE.MathUtils.degToRad(1) * delta) / 20;

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
  pane?.dispose();
});
</script>

<template>
  <main>
    <p class="absolute top-1/2 text-white mix-blend-difference">{{ d }}</p>
    <canvas ref="canvas"></canvas>
  </main>
</template>
