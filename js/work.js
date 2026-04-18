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
  const grid = document.getElementById('workGrid');
  if (!nav || !grid) return;

  const buttons = nav.querySelectorAll('.work-nav-btn');
  const cards = grid.querySelectorAll('.work-card');

  // ── Category filtering ──
  function filterCategory(category) {
    buttons.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.category === category);
    });

    cards.forEach(card => {
      const match = card.dataset.category === category;
      card.style.display = match ? '' : 'none';
      card.classList.remove('active');
    });

    // Reset scroll position to start of grid
    grid.scrollLeft = 0;

    // Pause all card videos on category switch
    if (window.RiyoVideo) window.RiyoVideo.setActiveCardVideo(null);
  }

  buttons.forEach(btn => {
    btn.addEventListener('click', () => filterCategory(btn.dataset.category));
  });

  // Default to Motion Graphics
  filterCategory('motion-graphics');

  // ── Card expand / collapse (click toggles, only one open at a time) ──
  cards.forEach(card => {
    card.addEventListener('click', () => {
      const wasActive = card.classList.contains('active');

      // Collapse all
      cards.forEach(c => c.classList.remove('active'));

      // Toggle this card
      if (!wasActive) {
        card.classList.add('active');
        // Play this card's video
        if (window.RiyoVideo) window.RiyoVideo.setActiveCardVideo(card);
        // Scroll into view on mobile
        if (window.innerWidth < 481) {
          setTimeout(() => card.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 120);
        }
      } else {
        // Collapsed — pause all card videos
        if (window.RiyoVideo) window.RiyoVideo.setActiveCardVideo(null);
      }
    });
  });

})();
