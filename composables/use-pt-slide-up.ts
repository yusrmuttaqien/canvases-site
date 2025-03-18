import type { TransitionProps } from "vue";

export default function usePtSlideUp() {
  const CSS_SCROLL_NAME = "scroll-y-slide-up";
  return {
    onBeforeLeave(el) {
      const html = document.documentElement;

      html.style.setProperty(`--${CSS_SCROLL_NAME}`, `${window.scrollY}px`);
    },
  } satisfies TransitionProps;
}
