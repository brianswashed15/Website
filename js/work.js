/* ============================================================
   work.js — Category filtering + expandable card interaction
   Card expand pattern adapted from work by Yudiz Solutions Limited.

   The MIT License (MIT)
   Copyright (c) 2026 Yudiz Solutions Limited
   (https://codepen.io/yudizsolutions/pen/wvzrPoj)

   Permission is hereby granted, free of charge, to any person
   obtaining a copy of this software and associated documentation
   files (the "Software"), to deal in the Software without
   restriction, including without limitation the rights to use,
   copy, modify, merge, publish, distribute, sublicense, and/or
   sell copies of the Software, and to permit persons to whom the
   Software is furnished to do so, subject to the following
   conditions:

   The above copyright notice and this permission notice shall be
   included in all copies or substantial portions of the Software.

   THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
   ============================================================ */

(function () {
  'use strict';

  const nav = document.getElementById('workNav');
  const sections = document.querySelectorAll('.work-section');
  const grids = document.querySelectorAll('.work-grid');
  const cards = document.querySelectorAll('.work-card');
  if (!sections.length) return;

  const buttons = nav ? nav.querySelectorAll('.work-nav-btn') : [];
  const isMobile = () => window.innerWidth < 481;

  // ── Category filtering (mobile only) ──
  function filterCategory(category) {
    buttons.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.category === category);
    });

    sections.forEach(sec => {
      const match = sec.dataset.section === category;
      sec.hidden = !match;
    });

    cards.forEach(card => card.classList.remove('active'));
    if (window.RiyoVideo) window.RiyoVideo.setActiveCardVideo(null);
  }

  // Show all sections on desktop, filter on mobile
  function handleResize() {
    if (isMobile()) {
      const activeBtn = nav && nav.querySelector('.work-nav-btn.active');
      const cat = activeBtn ? activeBtn.dataset.category : 'motion-graphics';
      filterCategory(cat);
    } else {
      sections.forEach(sec => { sec.hidden = false; });
    }
  }

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      if (isMobile()) filterCategory(btn.dataset.category);
    });
  });

  handleResize();
  window.addEventListener('resize', handleResize);

  // ── Scroll indicator visibility ──
  function updateScrollIndicators() {
    document.querySelectorAll('.work-grid-wrap').forEach(wrap => {
      const grid = wrap.querySelector('.work-grid');
      const indicator = wrap.querySelector('.scroll-indicator');
      if (!grid || !indicator) return;
      const atEnd = grid.scrollLeft + grid.clientWidth >= grid.scrollWidth - 10;
      indicator.classList.toggle('hidden', atEnd);
    });
  }

  grids.forEach(g => g.addEventListener('scroll', updateScrollIndicators, { passive: true }));
  updateScrollIndicators();
  window.addEventListener('resize', updateScrollIndicators);

  // ── Card expand / collapse (click toggles, only one open at a time) ──
  cards.forEach(card => {
    card.addEventListener('click', () => {
      const wasActive = card.classList.contains('active');

      // Collapse all
      cards.forEach(c => c.classList.remove('active'));

      // Toggle this card
      if (!wasActive) {
        card.classList.add('active');
        if (window.RiyoVideo) window.RiyoVideo.setActiveCardVideo(card);
        if (isMobile()) {
          setTimeout(() => card.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 120);
        }
      } else {
        if (window.RiyoVideo) window.RiyoVideo.setActiveCardVideo(null);
      }
    });
  });

})();
