import { ScrollTrigger } from "gsap/ScrollTrigger";

export default defineNuxtPlugin((nuxtApp) => {
  const states = useGsapStates();
  const html = document.documentElement;
  let controller = new AbortController();

  function setScrollY() {
    html.style.setProperty("--scroll-y", window.scrollY + "px");
  }

  nuxtApp.hook("page:transition:finish", () => {
    controller = new AbortController();

    ScrollTrigger.refresh();
    window.addEventListener("scroll", setScrollY, {
      signal: controller.signal,
    });
  });
  nuxtApp.hook("page:loading:end", () => {
    controller.abort();

    states.value.isInitialized = true;
  });

  if ("scrollRestoration" in history) {
    history.scrollRestoration = "manual";
  }
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
  window.addEventListener("scroll", setScrollY, { signal: controller.signal });
  setScrollY();
});
