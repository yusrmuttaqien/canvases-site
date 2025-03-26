<script setup lang="ts">
import GMRegular from "~/assets/fonts/gm-regular.woff";
import { CR_PATH } from "~/constants/app";
import "~/assets/styles/main.css";

const route = useRoute();
const codeRepo = computed(() => {
  const components = Array.from(route.matched)[0].components;

  if (!components) return "";
  // @ts-expect-error
  const filePath = components.default.__file;
  const indexOfPageString = filePath.indexOf("/pages");

  return `${CR_PATH}${filePath.substring(indexOfPageString)}`;
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
