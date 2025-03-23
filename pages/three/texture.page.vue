<script setup lang="ts">
import * as THREE from "three";
import { Pane } from "tweakpane";
import { OrbitControls } from "three/examples/jsm/Addons.js";

import SCAlbedo from "~/assets/textures/space-cruiser-panels2-bl/space-cruiser-panels2_albedo.png";
import SCAO from "~/assets/textures/space-cruiser-panels2-bl/space-cruiser-panels2_ao.png";
import SCHeight from "~/assets/textures/space-cruiser-panels2-bl/space-cruiser-panels2_height.png";
import SCNormal from "~/assets/textures/space-cruiser-panels2-bl/space-cruiser-panels2_normal-ogl.png";
import SCRoughness from "~/assets/textures/space-cruiser-panels2-bl/space-cruiser-panels2_roughness.png";
import SCMetallic from "~/assets/textures/space-cruiser-panels2-bl/space-cruiser-panels2_metallic.png";

const d = ref(0);
const canvas = ref<HTMLCanvasElement>();
let controller: AbortController;
let pane: Pane;

function init() {
  pane = new Pane();
  const scene = new THREE.Scene();
  const fog = new THREE.Fog("black", 0, 20);
  const textureLoader = new THREE.TextureLoader();
  scene.fog = fog;

  const meshes = new THREE.Group();
  const scAlbedo = textureLoader.load(SCAlbedo);
  const scAo = textureLoader.load(SCAO);
  const scHeight = textureLoader.load(SCHeight);
  const scNormal = textureLoader.load(SCNormal);
  const scRoughness = textureLoader.load(SCRoughness);
  const scMetallic = textureLoader.load(SCMetallic);

  const material = new THREE.MeshPhysicalMaterial({
    side: THREE.DoubleSide,
    aoMap: scAo,
    map: scAlbedo,
    normalMap: scNormal,
    displacementScale: 0.1,
    metalnessMap: scMetallic,
    displacementMap: scHeight,
    roughnessMap: scRoughness,
  });
  pane.addBinding(material, "metalness", { min: 0, max: 1, step: 0.01 });
  pane.addBinding(material, "roughness", { min: 0, max: 1, step: 0.01 });
  pane.addBinding(material, "reflectivity", { min: 0, max: 1, step: 0.01 });
  pane.addBinding(material, "clearcoat", { min: 0, max: 1, step: 0.01 });
  pane.addBinding(material, "displacementScale", {
    min: 0,
    max: 1,
    step: 0.01,
  });
  pane.addBinding(material, "aoMapIntensity", { min: 0, max: 1, step: 0.01 });

  const sphere = new THREE.Mesh(new THREE.SphereGeometry(2, 20, 20), material);
  const ambient = new THREE.AmbientLight("#FFFFFF", 1);
  const pointLight = new THREE.PointLight("#FFFFFF", 10);
  const pointLightHelper = new THREE.PointLightHelper(pointLight, 8);
  pointLight.position.set(2, 4, 0);

  const pointLight2 = new THREE.PointLight("#FFFFFF", 10);
  const pointLight2Helper = new THREE.PointLightHelper(pointLight2, 8);
  pointLight2.position.set(-2, 4, 0);

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
  const controls = new OrbitControls(camera, canvas.value);
  const worldAxesHelper = new THREE.AxesHelper(5);
  controls.enableDamping = true;
  camera.position.z = 7;

  meshes.add(sphere);

  scene.add(
    ambient,
    pointLight,
    pointLightHelper,
    pointLight2,
    pointLight2Helper,
  );
  scene.add(meshes, worldAxesHelper);
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
}

onMounted(() => {
  init();
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
