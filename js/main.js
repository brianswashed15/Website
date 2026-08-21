/* ============================================================
   main.js — Shared navigation, mobile menu, utilities
   ============================================================ */

(function () {
  'use strict';

  // ── Year ──
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ── Mobile menu ──
  const burger = document.querySelector('.burger');
  const mobileNav = document.querySelector('.mobile-nav');

  function toggleMenu(open) {
    const isOpen = typeof open === 'boolean' ? open : !burger.classList.contains('open');
    burger.classList.toggle('open', isOpen);
    mobileNav.classList.toggle('open', isOpen);
    burger.setAttribute('aria-expanded', isOpen);
    mobileNav.setAttribute('aria-hidden', !isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  }

  if (burger) burger.addEventListener('click', () => toggleMenu());

  if (mobileNav) {
    mobileNav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => toggleMenu(false));
    });
  }

  // ── Contact nav: smooth-scroll on homepage, follow link on work page ──
  document.querySelectorAll('[data-nav="contact"]').forEach(link => {
    link.addEventListener('click', function (e) {
      const contactSection = document.getElementById('contact');
      if (contactSection) {
        e.preventDefault();
        toggleMenu(false);
        contactSection.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // ── Home nav: scroll to top if already on homepage ──
  document.querySelectorAll('[data-nav="home"]').forEach(link => {
    link.addEventListener('click', function (e) {
      if (document.getElementById('hero')) {
        e.preventDefault();
        toggleMenu(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  });

  // ── On load: if hash is #contact, scroll there after paint ──
  if (window.location.hash === '#contact') {
    requestAnimationFrame(() => {
      setTimeout(() => {
        const el = document.getElementById('contact');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 350);
    });
  }

  // ── College hero: no video to gate the reveal, so trigger it directly ──
  const collegeHero = document.querySelector('.college-hero');
  if (collegeHero) requestAnimationFrame(() => collegeHero.classList.add('revealed'));

  // ── Header solidify on scroll ──
  const header = document.querySelector('.site-header');
  if (header) {
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          header.style.background = window.scrollY > 60
            ? 'rgba(10,10,10,.95)'
            : 'rgba(10,10,10,.85)';
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }

})();
