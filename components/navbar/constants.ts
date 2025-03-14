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
