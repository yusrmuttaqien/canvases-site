<script setup lang="ts">
const pageTransition = usePtSlideUp();

definePageMeta({ pageTransition });
</script>

<template>
  <main class="grid place-items-center">
    <p class="p4 text-center text-4xl font-extrabold text-amber-600">
      Please select thy shape that thou dost prefer above.
    </p>
  </main>
</template>

<style scoped>
p {
  font-family: cursive;
}
</style>
