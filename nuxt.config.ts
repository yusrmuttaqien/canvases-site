import tailwindcss from "@tailwindcss/vite";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2024-11-01",
  devtools: { enabled: true },
  // css: ["~/assets/styles/main.css"],
  vite: {
    plugins: [tailwindcss()],
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
