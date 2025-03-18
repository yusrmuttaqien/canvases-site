<script setup lang="ts">
import gsap from "gsap";
import SplitType from "split-type";
import { ScrollTrigger } from "gsap/ScrollTrigger";

let controller: AbortController;
let gsapCtx: gsap.Context | undefined;
const props = defineProps<{
  contents: {
    ids: {
      target: string;
      trigger: string;
    };
    text: string;
  };
  hasSlot: boolean;
}>();

function animate(
  controller: AbortController,
  target: string,
  trigger: string,
  classToRelease?: string[],
) {
  let splits: SplitType;
  let ctx: gsap.Context;
  const debouncedReRun = useDebounceFn(reRun, 1000);

  function run(reRun: boolean = false) {
    splits = new SplitType(`#${target}`, {
      types: "lines,words,chars",
      tagName: "span",
    });

    document
      .getElementById(target)
      ?.classList.remove(...(classToRelease || []));

    ctx = gsap.context(() => {
      gsap.set(splits.words, {
        overflow: "hidden",
      });
      gsap.set(splits.chars, {
        y: reRun ? "100%" : "0%",
        opacity: 0.3,
        letterSpacing: "-0.05em",
      });
      gsap.to(splits.chars, {
        scrollTrigger: {
          scrub: 1,
          start: "center bottom",
          end: "bottom bottom",
          trigger: `#${trigger}`,
        },
        opacity: 1,
        ease: "none",
        stagger: 0.1,
      });

      if (reRun) {
        gsap.to(splits.chars, {
          y: "0%",
        });
      }
    });
  }
  function reRun() {
    ctx?.kill();
    gsap.set(splits.words, {
      overflow: "hidden",
    });
    gsap.to(splits.chars, {
      y: "100%",
      onComplete: () => {
        run(true);
      },
    });
  }

  run();
  window.addEventListener("resize", debouncedReRun, {
    signal: controller.signal,
  });
}

useGsapInitial(
  () => {
    gsap.registerPlugin(ScrollTrigger);

    controller = new AbortController();
    gsapCtx = gsap.context(() => {
      animate(
        controller,
        props.contents.ids.target,
        props.contents.ids.trigger,
        ["opacity-30"],
      );
    });
  },
  undefined,
  undefined,
  () => {
    gsapCtx?.revert();
    controller.abort();
  },
);
</script>

<template>
  <section
    :key="props.contents.text"
    :id="props.contents.ids.trigger"
    class="600:flex-row flex min-h-dvh flex-col items-center justify-center gap-12 py-36"
  >
    <p
      :id="props.contents.ids.target"
      class="600:order-none order-2 max-w-[50rem] text-4xl leading-[1.2em] font-bold
        opacity-30"
    >
      {{ props.contents.text }}
    </p>
    <div v-if="props.hasSlot" class="600:order-none order-1">
      <slot />
    </div>
  </section>
</template>
