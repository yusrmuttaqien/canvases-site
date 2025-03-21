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
};
