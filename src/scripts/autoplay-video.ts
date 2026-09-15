/**
 * Muted looping video that only downloads and plays while it is on screen.
 *
 * Every `<video data-autoplay-video>` on the page is picked up. Pair it with
 * `preload="none"` and a poster still underneath: nothing downloads until the
 * video scrolls into view, nothing plays while the tab is hidden, and nothing
 * plays at all under prefers-reduced-motion, so the still is what remains.
 *
 * `data-autoplay-video="in-view"` holds playback back until the video is
 * properly in view, the same bar `onscreen.ts` uses, for sections where
 * playing is part of arriving at the element rather than something that should
 * already be running when it appears. Loading still starts early either way,
 * so the frames are there by the time it is allowed to play.
 *
 * The video reveals itself through `.is-playing` once it has frames, so a tile
 * never flashes empty while it loads. Components own that class's styling.
 *
 * Importing this module is what runs it. Vite evaluates it once per page, so
 * several sections can import it without stacking observers.
 */
const LOAD_RATIO = 0.2;
const PLAY_RATIO = 0.85;
const PAUSE_RATIO = 0.4;

const videos = Array.from(
  document.querySelectorAll<HTMLVideoElement>("video[data-autoplay-video]"),
);

if (videos.length) {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  const onScreen = new Set<HTMLVideoElement>();

  const heldBack = (video: HTMLVideoElement) =>
    video.dataset.autoplayVideo === "in-view";

  const play = (video: HTMLVideoElement) => {
    if (reduced.matches || document.hidden || !onScreen.has(video)) return;
    // Autoplay is blocked in some contexts even when muted; the still stays.
    video.play().catch(() => {});
  };

  // Held-back videos start buffering at the same point an eager one would
  // start playing, so waiting for the higher bar costs nothing visible.
  const warm = (video: HTMLVideoElement) => {
    if (video.preload === "auto") return;
    video.preload = "auto";
    if (video.readyState === HTMLMediaElement.HAVE_NOTHING) video.load();
  };

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        const video = entry.target as HTMLVideoElement;
        const ratio = entry.intersectionRatio;
        const playAt = heldBack(video) ? PLAY_RATIO : LOAD_RATIO;
        const pauseAt = heldBack(video) ? PAUSE_RATIO : LOAD_RATIO;

        if (ratio >= LOAD_RATIO) warm(video);

        if (ratio >= playAt) {
          onScreen.add(video);
          play(video);
        } else if (ratio < pauseAt) {
          onScreen.delete(video);
          video.pause();
        }
      }
    },
    { threshold: [LOAD_RATIO, PAUSE_RATIO, PLAY_RATIO] },
  );

  for (const video of videos) {
    video.addEventListener("playing", () => video.classList.add("is-playing"), {
      once: true,
    });
    observer.observe(video);
  }

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) videos.forEach((video) => video.pause());
    else onScreen.forEach(play);
  });

  reduced.addEventListener("change", () => {
    if (reduced.matches) videos.forEach((video) => video.pause());
    else onScreen.forEach(play);
  });
}
