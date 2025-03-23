<script setup lang="ts">
const pageTransition = usePtSlideUp();
</script>

<template>
  <NuxtLayout>
    <NuxtPage :transition="pageTransition" />
  </NuxtLayout>
  <NuxtRouteAnnouncer />
</template>
