import { PAGE_TRANSITION_DURATION, HMR_DURATION } from "~/constants/app";

export default function useGSAPInitial(
  func: VoidFunction,
  beforeUnmountFunc?: (isLeaving: boolean) => void,
  beforeNavigationFunc?: VoidFunction,
  beforeUnmountOrNavigationFunc?: VoidFunction,
) {
  const router = useRouter();
  const { hook } = useNuxtApp();
  const states = useGsapStates();
  let beforeEach: VoidFunction;
  let timeout: NodeJS.Timeout;
  let isAboutToLeave = ref(false);
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
      isAboutToLeave.value = isLeaving;

      if (isLeaving) {
        clearHook();
        setTimeout(() => {
          beforeNavigationFunc?.();
          beforeUnmountOrNavigationFunc?.();
        }, PAGE_TRANSITION_DURATION);
      }
    });

    if (!states.value.isInitialized) {
      func();
    }
  });
  watchEffect(() => {
    if (!isHMR.value) return;

    clearTimeout(timeout);

    timeout = setTimeout(func, HMR_DURATION);
  });
  onBeforeUnmount(() => {
    beforeEach();
    beforeUnmountFunc?.(isAboutToLeave.value);
    if (!isAboutToLeave.value) beforeUnmountOrNavigationFunc?.();
  });
}
