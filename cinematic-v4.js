/* NewWorld V4. Scroll drives the visual story without stealing wheel/touch events.
   Globe interaction is handled by app.js; this sends a bounded rotation target. */
(() => {
  'use strict';
  const hero = document.querySelector('.hero');
  const interlude = document.querySelector('.v4-interlude');
  const progress = document.getElementById('v4-progress');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  let queued = false;
  const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));

  const paint = () => {
    queued = false;
    const off = reduced.matches || document.body.classList.contains('no-motion');
    if (progress) {
      const available = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      progress.style.transform = `scaleX(${clamp(window.scrollY / available).toFixed(4)})`;
    }
    if (hero) {
      const r = hero.getBoundingClientRect();
      if (r.bottom > -150 && r.top < window.innerHeight + 150) {
        const amount = clamp(-r.top / Math.max(1, r.height * .82));
        hero.style.setProperty('--globe-zoom', off ? '1' : (1 + amount * .37).toFixed(3));
        hero.style.setProperty('--globe-y', off ? '0px' : `${Math.round(amount * -52)}px`);
        hero.style.setProperty('--globe-opacity', off ? '1' : (1 - amount * .62).toFixed(3));
        hero.style.setProperty('--hero-copy-shift', off ? '0px' : `${Math.round(amount * -38)}px`);
        window.dispatchEvent(new CustomEvent('newworld:v4globe', {
          detail: { yaw: off ? 0 : amount * 3.45 }
        }));
      }
    }
    if (interlude) {
      const r = interlude.getBoundingClientRect();
      const amount = clamp((window.innerHeight - r.top) / Math.max(1,window.innerHeight + r.height));
      interlude.style.setProperty('--interlude-rise', off ? '0px' : `${Math.round((1 - amount) * 64)}px`);
      interlude.style.setProperty('--interlude-opacity', off ? '1' : clamp(amount * 1.7).toFixed(3));
    }
  };
  const schedule = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(paint);
  };
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule, { passive: true });
  window.addEventListener('newworld:motion', schedule);
  reduced.addEventListener?.('change', schedule);
  document.addEventListener('visibilitychange', schedule);
  schedule();
})();
