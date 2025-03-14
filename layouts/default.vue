<script setup lang="ts">
import GMRegular from "~/assets/fonts/gm-regular.woff";

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
  <slot />
</template>
