/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly PUBLIC_SANITY_PROJECT_ID?: string;
  readonly PUBLIC_SANITY_DATASET?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

/**
 * The page's Lenis instance, published by SmoothScroll.astro. It is the only
 * thing on the page allowed to move the scroll, so anything that wants to
 * scroll the reader somewhere has to go through it rather than calling
 * `window.scrollTo` and fighting Lenis' own loop for the position.
 *
 * Absent under reduced motion, where there is no Lenis and the browser's own
 * scrolling is left alone — so every use of it has to cope with `undefined`.
 */
interface Window {
  lenis?: import("lenis").default;
}
