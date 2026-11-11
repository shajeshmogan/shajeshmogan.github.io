/* NewWorld — one scroll-linked transition, no scroll hijacking.
   Updates only compositor-friendly transforms; stops for reduced motion/mobile. */
(() => {
  'use strict';
  const hero = document.querySelector('.hero');
  if (!hero) return;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const compact = window.matchMedia('(max-width: 850px)');
  let queued = false;
  let enabled = true;

  const clear = () => {
    hero.style.removeProperty('--globe-zoom');
    hero.style.removeProperty('--globe-y');
    hero.style.removeProperty('--globe-opacity');
    hero.style.removeProperty('--hero-copy-shift');
  };
  const paint = () => {
    queued = false;
    if (!enabled || reduceMotion.matches || compact.matches || document.body.classList.contains('no-motion')) {
      clear();
      return;
    }
    const bounds = hero.getBoundingClientRect();
    if (bounds.bottom <= 0 || bounds.top >= innerHeight) return;
    const distance = Math.max(1, bounds.height);
    const progress = Math.min(1, Math.max(0, -bounds.top / (distance * .88)));
    hero.style.setProperty('--globe-zoom', (1 + progress * .12).toFixed(3));
    hero.style.setProperty('--globe-y', `${Math.round(progress * -26)}px`);
    hero.style.setProperty('--globe-opacity', (1 - progress * .35).toFixed(3));
    hero.style.setProperty('--hero-copy-shift', `${Math.round(progress * -18)}px`);
  };
  const queue = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(paint);
  };
  document.addEventListener('visibilitychange', () => { enabled = !document.hidden; queue(); }, {passive:true});
  window.addEventListener('scroll', queue, {passive:true});
  window.addEventListener('resize', queue, {passive:true});
  window.addEventListener('newworld:motion', queue);
  reduceMotion.addEventListener?.('change', queue);
  compact.addEventListener?.('change', queue);
  queue();
})();
