import type { NuxtPage } from "nuxt/schema";

export default function filterPages(pages: NuxtPage[] = []) {
  const pattern = /\.page\.vue$/;
  const pagesToRemove = [];

  for (const page of pages) {
    if (page.file && pattern.test(page.file)) {
      page.name = page.name?.replaceAll(`.page`, "");
      page.name = page.name?.replaceAll(`-index`, "");

      page.path = page.path.replaceAll(`.page`, "");
      page.path = page.path?.replaceAll(`/index`, "");

      if (page.name === "index") {
        page.path = "/";
      } else {
        page.path = page.path?.replaceAll(`index`, "");
      }

      filterPages(page.children);
    } else {
      pagesToRemove.push(page);
    }
  }

  for (const page of pagesToRemove) {
    pages.splice(pages.indexOf(page), 1);
  }
}
