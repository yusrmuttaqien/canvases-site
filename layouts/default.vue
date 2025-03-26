<script setup lang="ts">
import GMRegular from "~/assets/fonts/gm-regular.woff";
import "~/assets/styles/main.css";

const route = useRoute();
const codeRepo = computed(() => {
  const path = route.path === "/" ? "/index" : route.path;

  return `https://github.com/yusrmuttaqien/canvases-site/blob/main/pages${path}.page.vue`;
});

useCrStates(codeRepo);
useHead({
  link: [
    {
      as: "font",
      rel: "preload",
      href: GMRegular,
      type: "font/woff",
      crossorigin: "anonymous",
    },
  ],
});
</script>

<template>
  <Navbar />
  <GithubLink />
  <slot />
</template>
