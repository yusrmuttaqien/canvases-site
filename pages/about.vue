<script setup lang="ts">
import gsap from "gsap";
import { transform } from "motion";
import SplitType from "split-type";
import { ScrollTrigger } from "gsap/ScrollTrigger";

let gsapCtx: gsap.Context | undefined;
let controller: AbortController | undefined;
const isSettled = usePageSettled();
const explanations = [
  {
    ids: {
      target: "what-is-this",
      trigger: "wrapper-what-is-this",
    },
    text: "this website is dedicated for my learning purpose. putting all of those learnings in one place.",
  },
  {
    ids: {
      target: "what-learned",
      trigger: "wrapper-what-learned",
    },
    text: "by creating this website, I learned about the beauty and flaws of Vue & Nuxt.js (I am a former React & Next.js dev ⚛️. I found Vue & Nuxt to be miles more delightful 🥰), more about GSAP and layout animations, and of course, HTML Canvas 🎨.",
  },
];

function animateHero() {
  const titleChars = new SplitType("#title", {
    types: "chars,words",
    tagName: "span",
  });

  gsap.set("#intro", { y: "100%", opacity: 1 });
  gsap.set("#credit", { y: "100%", opacity: 1 });
  gsap.set(titleChars.chars, {
    x: "-50%",
    rotateY: "90deg",
    letterSpacing: "-0.05em",
  });
  gsap.set("#title", { opacity: 1 });

  const timeline = gsap.timeline();

  timeline.to(titleChars.chars, {
    x: "0%",
    rotateY: "0deg",
    duration: 0.5,
    stagger: 0.075,
    ease: "power4.out",
    delay: 0.3,
    onComplete: () => {
      gsap.set("#title", { perspective: "500px" });
      gsap.set(titleChars.words, { transformStyle: "preserve-3d" });
      gsap.set(titleChars.chars, { transformStyle: "preserve-3d" });
      gsap.to(titleChars.words, {
        scrollTrigger: {
          scrub: 1,
          end: "bottom",
          start: "center-=40% top",
          trigger: "#wrapper-hero",
        },
        rotateX: "45deg",
        z: "-1000px",
        ease: "none",
      });
      gsap.to(titleChars.chars, {
        scrollTrigger: {
          scrub: 1,
          start: "top",
          end: "bottom top+=10%",
          trigger: "#wrapper-hero",
          onUpdate(e) {
            gsap.to("#intro", {
              opacity: transform(e.progress, [0, 0.24], [1, 0]),
            });
            gsap.to("#credit", {
              opacity: transform(e.progress, [0, 0.24], [1, 0]),
            });
          },
        },
        y: "-60%",
        ease: "none",
        stagger: {
          grid: [1, 8],
          from: "center",
          axis: "x",
          amount: 0.3,
        },
      });
      gsap.to(titleChars.chars, {
        scrollTrigger: {
          scrub: 1,
          end: "bottom",
          start: "center-=40% top",
          trigger: "#wrapper-hero",
        },
        rotateY: "360deg",
        ease: "none",
        stagger: {
          grid: [1, 8],
          from: "center",
          axis: "x",
          amount: 0.3,
        },
      });
    },
  });
  timeline.to(
    "#intro",
    {
      y: "0%",
      duration: 1,
      ease: "power4.out",
    },
    "<0.3",
  );
  timeline.to(
    "#credit",
    {
      y: "0%",
      duration: 1,
      ease: "power4.out",
    },
    "<0.3",
  );
}
function animateParagraph(
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
function animatePage() {
  const styles = getComputedStyle(document.documentElement);
  const black = styles.getPropertyValue("--color-black");
  const amber = styles.getPropertyValue("--color-amber-300");

  gsap.set("main", {
    color: black,
    backgroundColor: amber,
  });
  gsap.to("main", {
    scrollTrigger: {
      scrub: true,
      start: "top top",
      end: "bottom bottom",
      trigger: "main",
    },
    backgroundColor: black,
    color: amber,
  });
}
function animate(controller: AbortController) {
  gsap.registerPlugin(ScrollTrigger);

  gsapCtx = gsap.context(() => {
    animateHero();
    animatePage();
    explanations.forEach((explanation) => {
      animateParagraph(
        controller,
        explanation.ids.target,
        explanation.ids.trigger,
        ["opacity-30"],
      );
    });
  });
}

useGsapInitial(
  () => {
    controller = new AbortController();

    animate(controller);
  },
  undefined,
  undefined,
  () => {
    gsapCtx?.revert();
    controller?.abort();
  },
);
</script>

<template>
  <main class="relative text-black">
    <AnimatePresence>
      <Motion
        as="p"
        v-if="isSettled"
        id="tell-scroll"
        :exit="{ opacity: 0 }"
        :initial="{ opacity: 0 }"
        :animate="{ opacity: 1 }"
        class="pointer-events-none fixed top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/4
          text-center text-4xl font-extrabold text-amber-600/20"
      >
        scroll thee downward
      </Motion>
    </AnimatePresence>
    <section
      id="wrapper-hero"
      class="@container relative grid h-dvh items-end overflow-hidden"
    >
      <div>
        <div class="mx-[2vw] flex justify-between overflow-hidden">
          <p id="intro" class="font-bold opacity-0">you're now at</p>
          <p id="credit" class="font-bold opacity-0">
            by
            <NuxtLink
              target="_blank"
              class="underline"
              to="https://yusrmuttaqien.com"
            >
              yusrmuttaqien
            </NuxtLink>
          </p>
        </div>
        <h1
          id="title"
          class="font-grand pointer-events-none -ml-[0.05em] text-center
            text-[calc(100cqw/8*3.3)] uppercase opacity-0"
        >
          Canvases
        </h1>
      </div>
    </section>
    <section
      :key="explanation.text"
      :id="explanation.ids.trigger"
      v-for="explanation in explanations"
      class="grid min-h-dvh place-content-center py-36"
    >
      <p
        :id="explanation.ids.target"
        class="max-w-[50rem] text-4xl leading-[1.2em] font-bold opacity-30"
      >
        {{ explanation.text }}
      </p>
    </section>
  </main>
</template>

<style scoped>
@reference "~/assets/styles/main.css";

p#tell-scroll {
  font-family: cursive;
}

h1,
h1 span {
  @apply before:-mb-[0.305em] before:table after:-mt-[0.32em] after:table;
}
</style>
