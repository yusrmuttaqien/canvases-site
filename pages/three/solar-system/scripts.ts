import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/Addons.js";

// NOTE: Source https://www.solarsystemscope.com/textures/
import sunTexture from "~/assets/textures/solar-system/sun.png";
import moonTexture from "~/assets/textures/solar-system/moon.png";
import marsTexture from "~/assets/textures/solar-system/mars.png";
import earthTexture from "~/assets/textures/solar-system/earth.png";
import venusTexture from "~/assets/textures/solar-system/venus.png";
import mercuryTeture from "~/assets/textures/solar-system/mercury.png";

import milkyWayNX from "~/assets/textures/solar-system/milkyway-cubemap/nx.png";
import milkyWayPY from "~/assets/textures/solar-system/milkyway-cubemap/py.png";
import milkyWayPZ from "~/assets/textures/solar-system/milkyway-cubemap/pz.png";
import milkyWayNY from "~/assets/textures/solar-system/milkyway-cubemap/ny.png";
import milkyWayNZ from "~/assets/textures/solar-system/milkyway-cubemap/nz.png";
import milkyWayPX from "~/assets/textures/solar-system/milkyway-cubemap/px.png";

type Scripts = {
  canvas: Ref<HTMLCanvasElement | undefined>;
  controller: Ref<AbortController | undefined>;
  d: Ref<number | undefined>;
  isLooping: Ref<boolean>;
};
type Loop = {
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  lastTime: Ref<number>;
  scene: THREE.Scene;
  controls: OrbitControls;
  d: Scripts["d"];
  isLooping: Scripts["isLooping"];
};
type Planet = {
  name: string;
  radius: number;
  distance: number;
  speed: number;
  material: THREE.Material;
  moons: Planet[];
};
type MeshUserData = {
  distance: number;
  speed: number;
};

export default function scripts(params: Scripts) {
  const { canvas, controller, d, isLooping } = params;
  controller.value = new AbortController();
  const { scene, renderer, camera, controls, clear } = initialize(canvas);
  const meshes = createMeshes();
  const lastTime = ref(0);

  scene.add(meshes);
  loop(lastTime.value, {
    d,
    scene,
    camera,
    renderer,
    lastTime,
    controls,
    isLooping,
  });

  addEventListener(
    "resize",
    function () {
      camera.aspect = innerWidth / innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(innerWidth, innerHeight);
    },
    { signal: controller.value.signal },
  );

  return function () {
    scene.traverse((object) => {
      if (object.type === "Mesh") {
        const obj = object as THREE.Mesh;

        obj.geometry.dispose();

        if (Array.isArray(obj.material)) {
          obj.material.forEach((material) => {
            const mat = material as THREE.MeshBasicMaterial;

            mat.map?.dispose();
            mat.dispose();
          });
        } else {
          const mat = obj.material as THREE.MeshBasicMaterial;

          mat.map?.dispose();
          mat.dispose();
        }
      }
      if (["Light", "Helper"].includes(object.type)) {
        const obj = object as THREE.Light | THREE.AxesHelper;

        obj.dispose();
      }
    });
    clear();
    controls.dispose();
    renderer.dispose();
  };
}

function initialize(canvas: Scripts["canvas"]) {
  const background = new THREE.CubeTextureLoader().load([
    milkyWayPX,
    milkyWayNX,
    milkyWayPY,
    milkyWayNY,
    milkyWayPZ,
    milkyWayNZ,
  ]);
  let scene: null | THREE.Scene = new THREE.Scene();
  scene.background = background;

  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    canvas: canvas.value,
  });
  renderer.setSize(innerWidth, innerHeight);

  let camera: null | THREE.PerspectiveCamera = new THREE.PerspectiveCamera(
    35,
    innerWidth / innerHeight,
    0.1,
    1000,
  );
  camera.position.set(0, 5, 100);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;

  const pointLight = new THREE.PointLight("#ffdd00", 300);
  const ambientLight = new THREE.AmbientLight("#ffffff", 0.1);

  const worldAxesHelper = new THREE.AxesHelper(500);

  scene.add(worldAxesHelper, pointLight, ambientLight);

  function clear() {
    scene?.clear();
    camera?.remove();

    scene = null;
    camera = null;
  }

  return { scene, renderer, camera, controls, clear };
}
function createMeshes() {
  const meshes = new THREE.Group();
  meshes.name = "Planets";

  const loader = new THREE.TextureLoader();
  const sphereGeometry = new THREE.SphereGeometry(1, 32, 32);

  const sunMaterial = new THREE.MeshBasicMaterial({
    map: loader.load(sunTexture),
    color: "#ffae00",
  });
  const sun = new THREE.Mesh(sphereGeometry, sunMaterial);
  sun.scale.setScalar(5);
  sun.name = "Sun";

  generatePlanets(loader).forEach((planet) => {
    const mesh = new THREE.Mesh(sphereGeometry, planet.material);
    mesh.name = planet.name;
    mesh.userData = {
      speed: planet.speed,
      distance: planet.distance,
    };

    mesh.scale.setScalar(planet.radius);
    mesh.position.set(planet.distance, 0, 0);

    planet.moons.forEach((moon) => {
      const moonMesh = new THREE.Mesh(sphereGeometry, moon.material);
      moonMesh.name = moon.name;
      moonMesh.userData = {
        speed: moon.speed,
        distance: moon.distance,
      };

      moonMesh.scale.setScalar(moon.radius);
      moonMesh.position.set(moon.distance, 0, 0);

      mesh.add(moonMesh);
    });

    meshes.add(mesh);
  });

  meshes.add(sun);

  return meshes;
}
function loop(currentTime: number, params: Loop) {
  const { lastTime, d, controls, renderer, scene, camera, isLooping } = params;
  let delta = (currentTime - lastTime.value) / 1000;
  lastTime.value = currentTime;
  d.value = delta;

  const planets = scene.getObjectByName("Planets") as THREE.Group;

  planets?.children.forEach((planet) => {
    if (planet.name === "Sun") {
      planet.rotation.y += delta * 0.1;

      return;
    }
    const userData = planet.userData as MeshUserData;

    planet.rotation.y += delta * userData.speed;
    planet.position.x = Math.sin(planet.rotation.y) * userData.distance;
    planet.position.z = Math.cos(planet.rotation.y) * userData.distance;

    planet.children.forEach((moon) => {
      const userData = moon.userData as MeshUserData;

      moon.rotation.y += delta * userData.speed;
      moon.position.x = Math.sin(moon.rotation.y) * userData.distance;
      moon.position.z = Math.cos(moon.rotation.y) * userData.distance;
    });
  });

  controls.update();
  renderer.render(scene, camera);

  if (isLooping.value) requestAnimationFrame((e) => loop(e, params));
}
function generatePlanets(loader: THREE.TextureLoader): Planet[] {
  return [
    {
      name: "Mercury",
      distance: 10,
      radius: 0.3,
      speed: 0.5,
      material: new THREE.MeshStandardMaterial({
        map: loader.load(mercuryTeture),
      }),
      moons: [],
    },
    {
      name: "Venus",
      distance: 18,
      radius: 0.8,
      speed: 0.3,
      material: new THREE.MeshStandardMaterial({
        map: loader.load(venusTexture),
      }),
      moons: [],
    },
    {
      name: "Earth",
      distance: 30,
      radius: 1,
      speed: 0.1,
      material: new THREE.MeshStandardMaterial({
        map: loader.load(earthTexture),
      }),
      moons: [
        {
          name: "Moon",
          distance: 5,
          radius: 0.3,
          speed: 0.5,
          material: new THREE.MeshStandardMaterial({
            map: loader.load(moonTexture),
          }),
          moons: [],
        },
      ],
    },
    {
      name: "Mars",
      distance: 50,
      radius: 0.6,
      speed: 0.08,
      material: new THREE.MeshStandardMaterial({
        map: loader.load(marsTexture),
      }),
      moons: [
        {
          name: "Phobos",
          distance: 5,
          radius: 0.3,
          speed: 0.8,
          material: new THREE.MeshStandardMaterial({
            map: loader.load(moonTexture),
          }),
          moons: [],
        },
        {
          name: "Delmos",
          distance: 10,
          radius: 0.3,
          speed: 0.5,
          material: new THREE.MeshStandardMaterial({
            map: loader.load(moonTexture),
          }),
          moons: [],
        },
      ],
    },
  ];
}
