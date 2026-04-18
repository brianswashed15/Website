/* ============================================================
   carousel.js — Stacked featured-work carousel
   Adapted from work by Fabio Ottaviani.

   The MIT License (MIT)
   Copyright (c) 2026 Fabio Ottaviani (https://codepen.io/supah/pen/xxJMbbg)

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

  const wrap = document.getElementById('featuredCarousel');
  if (!wrap) return;

  const items = wrap.querySelectorAll('.fc-item');
  if (!items.length) return;

  /* --- State --- */
  let progress = 50;      // 0–100, controls which card is active
  let startX = 0;
  let isDown = false;

  const speedWheel = 0.02;
  const speedDrag = -0.1;

  /* --- Z-index helper --- */
  function getZindex(arr, activeIdx) {
    return arr.map((_, i) =>
      i === activeIdx ? arr.length : arr.length - Math.abs(activeIdx - i)
    );
  }

  /* --- Display / position items via CSS custom properties --- */
  let lastActive = -1;

  function displayItems() {
    progress = Math.max(0, Math.min(progress, 100));
    const active = Math.floor((progress / 100) * (items.length - 1));
    const zArr = getZindex([...items], active);

    items.forEach((item, i) => {
      item.style.setProperty('--zIndex', zArr[i]);
      item.style.setProperty('--active', (i - active) / items.length);
    });

    // Notify video controller when active card changes
    if (active !== lastActive) {
      lastActive = active;
      if (window.RiyoVideo && window.RiyoVideo.setActiveCarouselVideo) {
        window.RiyoVideo.setActiveCarouselVideo(active);
      }
    }
  }

  displayItems();

  /* --- Kick-start: nudge to item 1 then back to 0 so the
       video controller fires on the first visible card --- */
  setTimeout(() => {
    lastActive = -1;          // reset so the next displayItems triggers a change
    progress = 50;            // back to start
    displayItems();
  }, 100);

  /* --- Click to focus --- */
  items.forEach((item, i) => {
    item.addEventListener('click', () => {
      progress = (i / (items.length - 1)) * 100;
      displayItems();
    });
  });

  /* --- Wheel --- */
  wrap.addEventListener('wheel', (e) => {
    /* Only respond to horizontal scroll; let vertical scroll pass through to the page */
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
      progress += e.deltaX * speedWheel;
      displayItems();
      e.preventDefault();
    }
  }, { passive: false });

  /* --- Mouse drag --- */
  wrap.addEventListener('mousedown', (e) => {
    isDown = true;
    startX = e.clientX;
  });

  window.addEventListener('mousemove', (e) => {
    if (!isDown) return;
    const x = e.clientX;
    progress += (x - startX) * speedDrag;
    startX = x;
    displayItems();
  });

  window.addEventListener('mouseup', () => { isDown = false; });

  /* --- Touch --- */
  let startY = 0;
  let touchLocked = null; // null = undecided, 'h' = horizontal, 'v' = vertical

  wrap.addEventListener('touchstart', (e) => {
    isDown = true;
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
    touchLocked = null;
  }, { passive: true });

  window.addEventListener('touchmove', (e) => {
    if (!isDown) return;
    const x = e.touches[0].clientX;
    const y = e.touches[0].clientY;
    const dx = Math.abs(x - startX);
    const dy = Math.abs(y - startY);

    /* Decide direction on first significant movement */
    if (touchLocked === null && (dx > 5 || dy > 5)) {
      touchLocked = dx > dy ? 'h' : 'v';
    }

    /* Only swipe carousel horizontally; vertical = normal page scroll */
    if (touchLocked === 'h') {
      progress += (x - startX) * speedDrag;
      startX = x;
      displayItems();
    }
  }, { passive: true });

  window.addEventListener('touchend', () => { isDown = false; touchLocked = null; });

})();
