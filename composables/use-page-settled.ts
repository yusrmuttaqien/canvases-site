export default function usePageSettled() {
  const nuxtApp = useNuxtApp();
  const states = useGsapStates();
  const isSettled = ref(false);
  const isHMR = computed(
    () => states.value.hmr.last !== states.value.hmr.recent,
  );
  let timeout: NodeJS.Timeout;

  function setSettledFalse() {
    isSettled.value = false;
  }

  if (import.meta.hot) {
    import.meta.hot?.on("vite:beforeUpdate", setSettledFalse);
  }

  nuxtApp.hook("page:transition:finish", () => {
    if (isHMR.value) {
      clearTimeout(timeout);

      timeout = setTimeout(() => (isSettled.value = true), 500);
    } else {
      isSettled.value = true;
    }
  });

  onMounted(() => {
    if (!states.value.isInitialized) {
      isSettled.value = true;
    }
  });
  onBeforeUnmount(() => {
    if (import.meta.hot) {
      import.meta.hot?.on("vite:beforeUpdate", setSettledFalse);
    }
  });

  return isSettled;
}
