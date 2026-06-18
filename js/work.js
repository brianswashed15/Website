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

  // ── Scroll buttons (prev/next) + visibility ──
  function updateScrollButtons() {
    document.querySelectorAll('.work-grid-wrap').forEach(wrap => {
      const grid = wrap.querySelector('.work-grid');
      const prev = wrap.querySelector('.scroll-btn-prev');
      const next = wrap.querySelector('.scroll-btn-next');
      if (!grid) return;
      const atStart = grid.scrollLeft <= 2;
      const atEnd = grid.scrollLeft + grid.clientWidth >= grid.scrollWidth - 2;
      if (prev) prev.hidden = atStart;
      if (next) next.hidden = atEnd;
    });
  }

  function scrollGrid(wrap, dir) {
    const grid = wrap.querySelector('.work-grid');
    if (!grid) return;
    // Scroll by ~80% of visible width per click
    const delta = grid.clientWidth * 0.8 * dir;
    grid.scrollBy({ left: delta, behavior: 'smooth' });
  }

  document.querySelectorAll('.work-grid-wrap').forEach(wrap => {
    const prev = wrap.querySelector('.scroll-btn-prev');
    const next = wrap.querySelector('.scroll-btn-next');
    if (prev) prev.addEventListener('click', e => { e.stopPropagation(); scrollGrid(wrap, -1); });
    if (next) next.addEventListener('click', e => { e.stopPropagation(); scrollGrid(wrap, 1); });
  });

  grids.forEach(g => g.addEventListener('scroll', updateScrollButtons, { passive: true }));
  updateScrollButtons();
  window.addEventListener('resize', updateScrollButtons);

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
