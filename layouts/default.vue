<script setup lang="ts">
import GMRegular from "~/assets/fonts/gm-regular.woff";
import { CR_PATH } from "~/constants/app";
import "~/assets/styles/main.css";

const route = useRoute();
const codeRepo = computed(() => {
  const path = route.path === "/" ? "/index" : route.path;

  return `${CR_PATH.START}${path}${CR_PATH.END}`;
});

useCodeRepo(codeRepo);
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
