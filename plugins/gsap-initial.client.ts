import { ScrollTrigger } from "gsap/ScrollTrigger";

export default defineNuxtPlugin((nuxtApp) => {
  const states = useGsapStates();

  nuxtApp.hook("page:transition:finish", () => {
    ScrollTrigger.refresh();
  });
  nuxtApp.hook("page:loading:end", () => {
    states.value.isInitialized = true;
  });

  if (import.meta.hot) {
    import.meta.hot?.on("vite:afterUpdate", () => {
      const last = states.value.hmr.recent;
      states.value.hmr.last = last;
      states.value.hmr.recent = Date.now();
    });
  }

  window.addEventListener("resize", () => {
    ScrollTrigger.refresh();
  });
});
