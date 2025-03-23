import glsl from "vite-plugin-glsl";
import tailwindcss from "@tailwindcss/vite";
import filterPages from "./utils/filter-pages";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2024-11-01",
  devtools: { enabled: true },
  hooks: {
    "pages:extend"(pages) {
      filterPages(pages);
    },
  },
  vite: {
    plugins: [tailwindcss(), glsl()],
  },
  router: {
    options: {
      scrollBehaviorType: "auto",
    },
  },
  app: {
    pageTransition: { name: "page" },
  },
  nitro: {
    watchOptions: {
      usePolling: true,
    },
  },
  modules: ["motion-v/nuxt", "@vueuse/nuxt"],
  routeRules: {
    "/**": {
      swr: 300,
    },
  },
});
