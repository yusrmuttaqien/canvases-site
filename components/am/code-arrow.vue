<script setup lang="ts">
const arrow = ref<HTMLElement | null>(null);
const controller = new AbortController();

onMounted(() => {
  function followMouse() {
    return requestAnimationFrame(() => {
      if (!arrow.value) return;
      const ghLink = document.getElementById(
        "github-link",
      ) as HTMLAnchorElement;
      const { left: ghLeft, top: ghTop } = ghLink.getBoundingClientRect();
      const { left, top } = arrow.value.getBoundingClientRect();
      const { clientHeight: ghCh, clientWidth: ghWh } = ghLink;
      const { clientHeight, clientWidth } = arrow.value;
      const x = left + clientWidth / 2;
      const y = top + clientHeight / 2;
      const ghX = ghLeft + ghWh / 2;
      const ghY = ghTop + ghCh / 2;

      const radian = Math.atan2(x - ghX, y - ghY);
      const rotation = radian * (180 / Math.PI) * -1 + 270;
      arrow.value.style.transform = `rotate(${rotation}deg)`;
    });
  }

  window.addEventListener("scroll", followMouse, {
    signal: controller.signal,
  });
  window.addEventListener("resize", followMouse, {
    signal: controller.signal,
  });
});
onBeforeUnmount(() => {
  controller.abort();
});
</script>

<template>
  <figure>
    <p ref="arrow" class="text-9xl">→</p>
  </figure>
</template>
