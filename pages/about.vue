<template>
  <main>
    <div class="@container relative grid h-dvh items-end">
      <p
        id="tell-scroll"
        class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-4xl
          font-extrabold text-amber-600/20"
      >
        scroll thee downward
      </p>
      <div>
        <div class="flex justify-between">
          <p class="ml-[2vw] font-bold">you're now at</p>
          <p class="mr-[2vw] font-bold">
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
          class="font-grand pointer-events-none text-[calc(100cqw/8*3.26)] uppercase
            before:-mb-[0.305em] before:table after:-mt-[0.32em] after:table"
        >
          Canvases
        </h1>
      </div>
    </div>
  </main>
</template>

<style scoped>
#tell-scroll {
  font-family: cursive;
}
</style>
