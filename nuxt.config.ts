import tailwindcss from "@tailwindcss/vite";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2024-11-01",
  devtools: { enabled: true },
  css: ["~/assets/styles/main.css"],
  vite: {
    plugins: [tailwindcss()],
  },
  app: {
    pageTransition: { name: "page" },
  },
  modules: ["motion-v/nuxt"],
  routeRules: {
    "/**": {
      swr: 300,
      prerender: true,
    },
  },
});
