<script setup lang="ts">
import { NuxtLink } from "#components";
import {
  routes as routesRoot,
  routesChildrens,
} from "~/components/navbar/constants";
import type { Routes, RoutesChildrens } from "~/components/navbar/types";

const currentRoute = useRoute();
const router = useRouter();

const parsedRoutesChildrens = transformRoutesChildrens(routesChildrens);
let afterEach: VoidFunction;
let routesPos = 1;

const routeForward = ref(true);
const routes = computed(() => {
  const routesChildrens = parsedRoutesChildrens;
  const childrenRoutes = Array.from(routesChildrens[currentRoute.path] || []);
  const isChildren = Boolean(childrenRoutes.length);
  const isChildrenRoot = childrenRoutes?.[0]?.path === currentRoute.path;

  childrenRoutes?.shift();

  let routes: Routes = isChildren ? childrenRoutes : routesRoot;

  return {
    routes,
    isChildrenRoot,
    parentKey: routes.toString(),
    isChildren: Boolean(isChildren),
  };
});

function goBack() {
  router.go(-1);
}
function transformRoutesChildrens(routes: RoutesChildrens) {
  return Object.entries(routes).reduce(
    (prev, [key, values]) => {
      prev[key] = values.map((value) => ({
        ...value,
        path: key + value.path,
      }));
      prev[key].unshift({
        name: "_root_",
        path: key,
      });

      values.forEach(({ path }) => {
        prev[`${key}${path}`] = prev[key];
      });

      return prev;
    },
    {} as Record<string, Routes>,
  );
}

onMounted(() => {
  afterEach = router.afterEach(() => {
    const isForward = window.history.state.position >= routesPos;
    routeForward.value = isForward;
    routesPos = window.history.state.position;
  });
});
onUnmounted(() => {
  afterEach();
});
</script>

<template>
  <nav
    class="fixed top-0 right-0 left-0 z-10 m-3 text-center mix-blend-difference"
  >
    <AnimatePresence mode="popLayout" :initial="false">
      <Motion
        layout
        as="div"
        :key="routes.parentKey"
        class="flex flex-wrap justify-center gap-3"
        :initial="{ opacity: 0, x: routeForward ? 100 : -100 }"
        :animate="{ opacity: 1, x: 0, transition: { duration: 0.3 } }"
        :exit="{
          opacity: 0,
          x: routeForward ? -100 : 100,
          transition: { duration: 0.3 },
        }"
      >
        <button
          @click="goBack"
          class="cursor-pointer"
          v-if="routes.isChildren"
          :data-active="routes.isChildrenRoot"
        >
          <Motion
            as="span"
            id="background"
            layout-id="path-highlight"
            v-if="routes.isChildrenRoot"
          />
          <span
            id="text"
            class="font-extrabold whitespace-nowrap text-white uppercase transition-colors
              duration-300"
          >
            Go back
          </span>
        </button>
        <NuxtLink
          layout
          :to="route.path"
          :key="route.path"
          v-for="route in routes.routes"
          :replace="!routes.isChildrenRoot && routes.isChildren"
        >
          <Motion
            as="span"
            id="background"
            :layout-id="'path-highlight'"
            v-if="currentRoute.path === route.path"
          />
          <span
            id="text"
            class="font-extrabold whitespace-nowrap text-white uppercase transition-colors
              duration-300"
          >
            {{ route.name }}
          </span>
        </NuxtLink>
      </Motion>
    </AnimatePresence>
  </nav>
  <NuxtLink
    id="ym"
    to="/about"
    :data-active="currentRoute.path === '/about'"
    class="fixed right-0 bottom-0 isolate z-10 block cursor-pointer mix-blend-difference"
  >
    <Motion
      as="span"
      id="background"
      :layout-id="'path-highlight'"
      v-if="currentRoute.path === '/about'"
    />
    <NavbarYm
      class="relative z-10 w-12 text-white transition-colors duration-300"
    />
  </NuxtLink>
</template>

<style>
@reference "~/assets/styles/main.css";

nav a,
nav button {
  @apply relative isolate inline-block p-1 px-1.5;
}
nav a.router-link-exact-active #text,
nav button[data-active="true"] #text,
#ym[data-active="true"] svg {
  @apply relative z-10 text-black;
}
nav a span#background,
nav button span#background,
#ym span#background {
  @apply absolute inset-0 z-0 bg-white;
}
</style>
