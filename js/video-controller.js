/* ============================================================
   video-controller.js
   Smart play/pause for all [data-video] elements.
   Rules:
     - Only videos that are VISIBLE + ACTIVE may play
     - "Active" = hero in viewport, active carousel item,
       or expanded work card
     - Everything else is paused
     - IntersectionObserver handles viewport visibility
     - Carousel & work scripts call the exported helpers
       when the active item changes
   ============================================================ */

window.RiyoVideo = (function () {
  'use strict';

  /* --- Safe play/pause wrappers (avoid unhandled promise) --- */
  function safePlay(video) {
    if (!video) return;
    if (!video.paused) return;                                // already playing
    if (!video.src && !video.querySelector('source')) return;  // no source yet
    const p = video.play();
    if (p && typeof p.catch === 'function') p.catch(() => {});
  }

  function safePause(video) {
    if (!video) return;
    try { video.pause(); } catch (_) { /* ignore */ }
  }

  /* -------------------------------------------------------
     1.  HERO VIDEO
     Autoplay when section enters viewport, pause when it
     leaves.
  ------------------------------------------------------- */
  const heroVideo = document.querySelector('.hero-video[data-video]');
  if (heroVideo) {
    const heroSection = heroVideo.closest('.hero');
    /* Reveal hero (video + title) once a frame is ready */
    function revealHero() {
      heroVideo.classList.add('loaded');
      if (heroSection) heroSection.classList.add('revealed');
    }
    if (heroVideo.readyState >= 2) revealHero();
    else heroVideo.addEventListener('loadeddata', revealHero, { once: true });

    const heroObs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) safePlay(heroVideo);
        else safePause(heroVideo);
      });
    }, { threshold: 0.25 });
    heroObs.observe(heroVideo.closest('.hero') || heroVideo);
  }

  /* -------------------------------------------------------
     2.  FEATURED WORK CAROUSEL VIDEOS
     Exported function: setActiveCarouselVideo(activeIndex)
     Called by carousel.js whenever the focused item changes.
     Also uses IntersectionObserver on the carousel section
     so everything pauses when the section is off-screen.
  ------------------------------------------------------- */
  const carouselItems = document.querySelectorAll('#featuredCarousel .fc-item');
  let carouselInView = false;
  let currentCarouselIdx = 0;

  function updateCarouselVideos() {
    carouselItems.forEach((item, i) => {
      const vid = item.querySelector('video[data-video]');
      if (!vid) return;
      if (carouselInView && i === currentCarouselIdx) safePlay(vid);
      else safePause(vid);
    });
  }

  function setActiveCarouselVideo(index) {
    currentCarouselIdx = index;
    updateCarouselVideos();
  }

  if (carouselItems.length) {
    const carouselSection = document.getElementById('featuredCarousel')
      || document.querySelector('.featured-work');
    if (carouselSection) {
      const cObs = new IntersectionObserver(entries => {
        entries.forEach(e => {
          carouselInView = e.isIntersecting;
          updateCarouselVideos();
        });
      }, { threshold: 0.15 });
      cObs.observe(carouselSection);

      // Check visibility immediately on load in case carousel is already in view
      const rect = carouselSection.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        carouselInView = true;
        updateCarouselVideos();
      }
    }
  }

  /* -------------------------------------------------------
     3.  WORK PAGE CARD VIDEOS
     Exported function: setActiveCardVideo(cardElement | null)
     Called by work.js when a card is expanded/collapsed.
     Only the expanded card plays; all others pause.
  ------------------------------------------------------- */
  const workCards = document.querySelectorAll('.work-card');

  function setActiveCardVideo(activeCard) {
    workCards.forEach(card => {
      const vid = card.querySelector('video[data-video]');
      if (!vid) return;
      if (card === activeCard) safePlay(vid);
      else safePause(vid);
    });
  }

  /* -------------------------------------------------------
     4.  GLOBAL VISIBILITY GUARD
     Pause every video on the page when the tab/window is
     hidden, resume only the relevant ones when visible again.
  ------------------------------------------------------- */
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      document.querySelectorAll('video[data-video]').forEach(safePause);
    } else {
      // Re-evaluate active states
      if (heroVideo) {
        const heroRect = (heroVideo.closest('.hero') || heroVideo).getBoundingClientRect();
        if (heroRect.top < window.innerHeight && heroRect.bottom > 0) safePlay(heroVideo);
      }
      updateCarouselVideos();
      // Work cards: replay the currently expanded one
      const expanded = document.querySelector('.work-card.active');
      if (expanded) setActiveCardVideo(expanded);
    }
  });

  /* --- Public API ----------------------------------------- */
  return {
    setActiveCarouselVideo,
    setActiveCardVideo,
    safePlay,
    safePause
  };

})();
