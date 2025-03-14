<script setup lang="ts">
import gsap from "gsap";
import SplitType from "split-type";

const title = ref<HTMLHeadingElement | null>(null);

onMounted(() => {
  if (!title.value) return;
  const titleChars = new SplitType(title.value, {
    types: "chars",
    tagName: "span",
  });

  gsap.set("#intro", { y: "100%" });
  gsap.set("#credit", { y: "100%" });
  gsap.set(titleChars.chars, { y: "100%", letterSpacing: "-0.05em" });

  const timeline = gsap.timeline();

  timeline.to(titleChars.chars, {
    y: "0%",
    duration: 1,
    stagger: 0.075,
    ease: "power4.out",
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
});
</script>

<template>
  <main>
    <div class="@container relative grid h-dvh items-end overflow-hidden">
      <p
        id="tell-scroll"
        class="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
          text-center text-4xl font-extrabold text-amber-600/20"
      >
        scroll thee downward
      </p>
      <div>
        <div class="flex justify-between overflow-hidden">
          <p id="intro" class="ml-[2vw] font-bold">you're now at</p>
          <p id="credit" class="mr-[2vw] font-bold">
            by
            <NuxtLink
              target="_blank"
              class="underline"
              to="https://yusrmuttaqien.com"
            >
              yusrmuttaqien</NuxtLink
            >
          </p>
        </div>
        <h1
          ref="title"
          class="font-grand pointer-events-none text-[calc(100cqw/8*3.26)] uppercase"
        >
          Canvases
        </h1>
      </div>
    </div>
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
