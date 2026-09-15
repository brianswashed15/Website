/**
 * One-shot scroll reveal for text.
 *
 * A `[data-reveal]` element gains `is-revealed` the first time it is properly
 * in view and keeps it for the rest of the page's life. That permanence is the
 * whole difference between this and `onscreen.ts`: the halftone is a state a
 * row moves in and out of, a reveal is an event that happens once. Replaying a
 * text entrance every time the reader scrolls back up turns a reveal into a
 * distraction, so the element is unobserved the moment it fires.
 *
 * The bar is lower than the halftone's, because copy has to be readable by the
 * time it is read rather than fully composed on screen, and the bottom inset
 * keeps it from firing at the very edge of the viewport where nobody is looking
 * yet.
 *
 * Components own what the class means visually, and must gate their hidden
 * starting state behind the `js` class the layout sets, so copy is never left
 * invisible to a reader whose script never ran.
 */
const REVEAL_RATIO = 0.4;

const targets = document.querySelectorAll<HTMLElement>("[data-reveal]");

if (targets.length) {
  if (!("IntersectionObserver" in window)) {
    targets.forEach((target) => target.classList.add("is-revealed"));
  } else {
    const observer = new IntersectionObserver(
      (entries, self) => {
        for (const entry of entries) {
          if (entry.intersectionRatio < REVEAL_RATIO) {
            continue;
          }
          entry.target.classList.add("is-revealed");
          self.unobserve(entry.target);
        }
      },
      { threshold: REVEAL_RATIO, rootMargin: "0px 0px -8% 0px" },
    );

    targets.forEach((target) => observer.observe(target));
  }
}

/** Marks the file a module, so its constants stay out of the global scope. */
export {};
