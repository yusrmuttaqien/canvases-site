export default defineNuxtPlugin((nuxtApp) => {
  if (process.env.NODE_ENV === "production") {
    useHead({
      link: [
        {
          as: "font",
          rel: "preload",
          type: "font/woff",
          href: "~/assets/fonts/gm-regular.woff",
        },
      ],
    });
  }
});
