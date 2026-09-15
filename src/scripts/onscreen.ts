/**
 * Tracks whether an element is in view.
 *
 * Every `[data-onscreen]` element carries the `is-onscreen` class while it is
 * properly in view and loses it once it has largely scrolled away. Components
 * own what the class means visually.
 *
 * The two ratios are deliberately far apart. Revealing on first contact would
 * flip the element at the bottom edge of the viewport, where nobody is looking
 * yet, and a single shared ratio would make it flicker for anyone scrolling
 * slowly across that one boundary — so it takes 85% to turn on and dropping
 * below 40% to turn back off. The cost of the high bar is that an element
 * taller than the viewport can never satisfy it, so only mark targets that fit
 * on screen.
 */
const REVEAL_RATIO = 0.85;
const CONCEAL_RATIO = 0.4;

const targets = document.querySelectorAll<HTMLElement>("[data-onscreen]");

if (targets.length) {
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.intersectionRatio >= REVEAL_RATIO) {
          entry.target.classList.add("is-onscreen");
        } else if (entry.intersectionRatio < CONCEAL_RATIO) {
          entry.target.classList.remove("is-onscreen");
        }
      }
    },
    { threshold: [CONCEAL_RATIO, REVEAL_RATIO] },
  );

  targets.forEach((target) => observer.observe(target));
}
