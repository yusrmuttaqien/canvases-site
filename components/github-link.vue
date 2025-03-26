<script setup lang="ts">
import { motion } from "motion-v";
import { NuxtLink } from "#components";

const MotionLink = motion.create(NuxtLink);
const states = useCodeRepo();
</script>

<template>
  <AnimatePresence>
    <MotionLink
      id="github-link"
      target="_blank"
      :initial="{ y: '100%' }"
      :exit="{ y: '100%', transition: { duration: 0.3 } }"
      :animate="{ y: '0%', transition: { duration: 0.3 } }"
      :to="states.repo"
      v-if="states.repo"
      class="fixed top-1/2 right-[calc(0.5lh+0.25rem)] z-10 origin-right -translate-y-1/2
        -rotate-90 cursor-pointer bg-white px-3 py-1 text-black uppercase
        mix-blend-difference"
    >
      <p>Code repo</p>
    </MotionLink>
  </AnimatePresence>
</template>
