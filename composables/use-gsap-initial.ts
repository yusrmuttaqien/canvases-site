export default function useGSAPInitial(
  func: VoidFunction,
  beforeUnmountFunc?: VoidFunction,
  beforeNavigationFunc?: VoidFunction,
  beforeUnmountOrNavigationFunc?: VoidFunction,
) {
  const router = useRouter();
  const { hook } = useNuxtApp();
  const states = useGsapStates();
  let beforeEach: VoidFunction;
  let timeout: NodeJS.Timeout;
  let isAboutToLeave = false;
  const isHMR = computed(
    () => states.value.hmr.last !== states.value.hmr.recent,
  );
  const clearHook = hook("page:transition:finish", () => {
    if (!isHMR.value) {
      func();
    }
  });

  onMounted(() => {
    beforeEach = router.beforeEach((to, from) => {
      const isLeaving = to.path !== from.path;
      isAboutToLeave = isLeaving;

      if (isLeaving) {
        clearHook();
        setTimeout(() => {
          beforeNavigationFunc?.();
          beforeUnmountOrNavigationFunc?.();
        }, 400);
      }
    });

    if (!states.value.isInitialized) {
      func();
    }
  });
  watchEffect(() => {
    if (!isHMR.value) return;

    clearTimeout(timeout);

    timeout = setTimeout(func, 500);
  });
  onBeforeUnmount(() => {
    beforeEach();
    beforeUnmountFunc?.();
    if (!isAboutToLeave) beforeUnmountOrNavigationFunc?.();
  });
}
