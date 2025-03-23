import type { Routes, RoutesChildrens } from "~/components/navbar/types";

export const routes: Routes = [
  {
    name: "Static",
    path: "/",
  },
  {
    name: "Animated circles ⚠️",
    path: "/animated-circles",
  },
  {
    name: "Gravity ⚠️",
    path: "/gravity",
  },
  {
    name: "Collision...",
    path: "/collision",
  },
  {
    name: "Collisions ⚠️",
    path: "/collisions",
  },
  {
    name: "Circular motion ⚠️",
    path: "/circular-motion",
  },
  {
    name: "Three...",
    path: "/three",
  },
  {
    name: "GLSL",
    path: "/glsl",
  },
  {
    name: "GLSL Three",
    path: "/glsl-three",
  },
];
export const routesChildrens: RoutesChildrens = {
  "/collision": [
    {
      name: "Circle",
      path: "/circle",
    },
    {
      name: "Square",
      path: "/square",
    },
  ],
  "/three": [
    {
      name: "Basics",
      path: "/basics",
    },
    {
      name: "Geometry buffer",
      path: "/geometry-buffer",
    },
    {
      name: "Primitives",
      path: "/primitives",
    },
    {
      name: "Materials",
      path: "/materials",
    },
    {
      name: "PBR material ⚠️",
      path: "/pbr-material",
    },
    {
      name: "Physical material ⚠️",
      path: "/physical-material",
    },
    {
      name: "Texture ⚠️",
      path: "/texture",
    },
    {
      name: "Solar system 🪐",
      path: "/solar-system",
    },
  ],
};
