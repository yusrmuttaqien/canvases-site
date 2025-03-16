import type { TransitionProps } from "vue";

export default function usePtSlideUp() {
  const CSS_SCROLL_NAME = "scroll-y-slide-up";

  return {
    onAfterLeave() {
      const html = document.documentElement;

      html.style.removeProperty(`--${CSS_SCROLL_NAME}`);
    },
    onBeforeLeave() {
      const html = document.documentElement;

      html.style.setProperty(`--${CSS_SCROLL_NAME}`, `${window.scrollY}px`);
    },
  } satisfies TransitionProps;
}
