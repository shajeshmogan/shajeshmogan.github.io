(() => {
  'use strict';

  const root = document.body;
  root.classList.add('js-animations');
  const year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());

  const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  let userMotionOverride = null;
  let motionEnabled = !motionQuery.matches;
  const motionButton = document.getElementById('motion-toggle');
  const mobileMotionButton = document.getElementById('mobile-motion-toggle');
  const motionLabel = document.getElementById('motion-label');
  const menuButton = document.getElementById('menu-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  const scrollBar = document.getElementById('scroll-progress');

  function updateMotion() {
    root.classList.toggle('no-motion', !motionEnabled);
    if (motionLabel) motionLabel.textContent = motionEnabled ? 'MOTION ON' : 'MOTION OFF';
    if (motionButton) {
      motionButton.setAttribute('aria-pressed', String(!motionEnabled));
      motionButton.setAttribute('aria-label', motionEnabled ? 'Turn off animations' : 'Turn on animations');
    }
    if (mobileMotionButton) mobileMotionButton.textContent = motionEnabled ? 'TURN OFF MOTION' : 'TURN ON MOTION';
    window.dispatchEvent(new Event('neurospace:motion'));
  }
  function toggleMotion() { userMotionOverride = !motionEnabled; motionEnabled = userMotionOverride; updateMotion(); }
  motionButton?.addEventListener('click', toggleMotion);
  mobileMotionButton?.addEventListener('click', toggleMotion);
  motionQuery.addEventListener?.('change', (event) => {
    if (userMotionOverride === null) { motionEnabled = !event.matches; updateMotion(); }
  });
  updateMotion();

  function closeMenu() {
    if (!menuButton || !mobileMenu) return;
    mobileMenu.hidden = true;
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'Open navigation');
  }
  menuButton?.addEventListener('click', () => {
    const open = menuButton.getAttribute('aria-expanded') === 'true';
    mobileMenu.hidden = open;
    menuButton.setAttribute('aria-expanded', String(!open));
    menuButton.setAttribute('aria-label', open ? 'Open navigation' : 'Close navigation');
  });
  mobileMenu?.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && menuButton?.getAttribute('aria-expanded') === 'true') {
      closeMenu();
      menuButton.focus();
    }
  });
  window.addEventListener('resize', () => { if (window.innerWidth > 850) closeMenu(); }, { passive: true });

  let scrollScheduled = false;
  function syncScrollBar() {
    const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const pct = Math.max(0, Math.min(100, (window.scrollY / maxScroll) * 100));
    if (scrollBar) scrollBar.style.width = `${pct}%`;
    scrollScheduled = false;
  }
  window.addEventListener('scroll', () => {
    if (!scrollScheduled) { scrollScheduled = true; requestAnimationFrame(syncScrollBar); }
  }, { passive: true });
  window.addEventListener('resize', syncScrollBar, { passive: true });
  syncScrollBar();

  const revealItems = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window)) {
    revealItems.forEach((item) => item.classList.add('is-visible'));
  } else {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      }
    }, { threshold: 0.07, rootMargin: '0px 0px -30px 0px' });
    revealItems.forEach((item) => revealObserver.observe(item));
  }

  // Gentle tilt is decoration only; reduced-motion and touch devices do not use it.
  if (window.matchMedia('(pointer: fine)').matches) {
    document.querySelectorAll('.tilt-card').forEach((card) => {
      card.addEventListener('pointermove', (event) => {
        if (!motionEnabled || !card.classList.contains('is-visible')) return;
        const rect = card.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - .5;
        const y = (event.clientY - rect.top) / rect.height - .5;
        card.style.transform = `perspective(900px) rotateX(${(-y * 2.4).toFixed(2)}deg) rotateY(${(x * 2.4).toFixed(2)}deg)`;
      }, { passive: true });
      card.addEventListener('pointerleave', () => { card.style.transform = ''; });
    });
  }

  const skills = {
    ml: {
      index: '01', title: 'Machine Learning',
      description: 'Training models on structured data and evaluating their predictions.',
      tech: 'Python · Model training · Evaluation',
      evidence: 'Foundations across AI/ML coursework and applied projects.'
    },
    dl: {
      index: '02', title: 'Deep Learning',
      description: 'Learning how neural architectures represent complex patterns in images and language, and how to compare model behaviour.',
      tech: 'CNN · SimpleRNN · LSTM · GRU',
      evidence: 'Handwriting classification and sentiment analysis project.'
    },
    agents: {
      index: '03', title: 'AI Agents',
      description: 'Exploring tool-connected workflows, decision support, explanations and human approval before sensitive changes.',
      tech: 'Agent workflows · Tool integration · Approval gates',
      evidence: 'RippleFix: disruption-recovery workflow and supervised actions.'
    },
    software: {
      index: '04', title: 'Software Engineering',
      description: 'Connecting interfaces, application logic and services to build systems that can be understood and maintained.',
      tech: 'JavaScript · Python · APIs · MVC-style structure',
      evidence: 'Backend web development coursework and project integrations.'
    },
    data: {
      index: '05', title: 'Data Engineering',
      description: 'Working with the preparation, transformation and structure of data that supports analysis and intelligent applications.',
      tech: 'Data pipelines · Data preparation · Python',
      evidence: 'Data engineering coursework and applied datasets.'
    },
    analytics: {
      index: '06', title: 'Data Analytics',
      description: 'Turning raw data into patterns, evidence and useful decisions through analysis, visualisation and careful interpretation.',
      tech: 'Exploratory analysis · Visualisation · Problem framing',
      evidence: 'Analytics learning and project work.'
    }
  };
  const skillButtons = document.querySelectorAll('[data-skill]');
  const skillTitle = document.getElementById('skill-title');
  const skillIndex = document.getElementById('skill-index');
  const skillCount = document.getElementById('skill-count');
  const skillDescription = document.getElementById('skill-description');
  const skillTech = document.getElementById('skill-tech');
  const skillEvidence = document.getElementById('skill-evidence');
  function selectSkill(key) {
    const chosen = Object.hasOwn(skills, key) ? skills[key] : null;
    if (!chosen) return;
    skillButtons.forEach((button) => {
      const active = button.dataset.skill === key;
      button.classList.toggle('is-selected', active);
      button.setAttribute('aria-pressed', String(active));
    });
    if (skillTitle) skillTitle.textContent = chosen.title;
    if (skillIndex) skillIndex.textContent = `NODE_${chosen.index} / ACTIVE`;
    if (skillCount) skillCount.textContent = `${chosen.index} / 06`;
    if (skillDescription) skillDescription.textContent = chosen.description;
    if (skillTech) skillTech.textContent = chosen.tech;
    if (skillEvidence) skillEvidence.textContent = chosen.evidence;
  }
  skillButtons.forEach((button) => button.addEventListener('click', () => selectSkill(button.dataset.skill)));

  // Case-study overlays use the browser's built-in accessible modal dialog.
  const dialogs = new Map([...document.querySelectorAll('dialog.case-dialog')].map((dialog) => [dialog.id, dialog]));
  document.querySelectorAll('[data-open-dialog]').forEach((button) => {
    button.addEventListener('click', () => {
      const dialog = dialogs.get(button.dataset.openDialog);
      if (dialog && !dialog.open) dialog.showModal();
    });
  });
  dialogs.forEach((dialog) => {
    dialog.querySelectorAll('[data-close-dialog]').forEach((button) => {
      button.addEventListener('click', () => dialog.close());
    });
    dialog.addEventListener('click', (event) => { if (event.target === dialog) dialog.close(); });
  });

  const recoverySteps = [
    ['STEP 01 / INCIDENT', 'A room becomes unavailable. The system identifies affected bookings and begins recovery analysis.'],
    ['STEP 02 / ANALYSE', 'Candidate rooms are checked for enough seats, availability and conflicts. Invalid choices are rejected.'],
    ['STEP 03 / EXPLAIN', 'The system presents an option with its scoring breakdown and reasons alternatives were rejected.'],
    ['STEP 04 / APPROVE', 'A human approves the proposal before any calendar changes are made. The illustration does not modify bookings.']
  ];
  const flowLabel = document.getElementById('flow-label');
  const flowDescription = document.getElementById('flow-description');
  document.querySelectorAll('[data-flow-step]').forEach((button) => {
    button.addEventListener('click', () => {
      const index = Number(button.dataset.flowStep);
      if (!Number.isInteger(index) || !recoverySteps[index]) return;
      document.querySelectorAll('[data-flow-step]').forEach((item) => {
        const active = item === button;
        item.classList.toggle('is-active', active);
        item.setAttribute('aria-pressed', String(active));
      });
      if (flowLabel) flowLabel.textContent = recoverySteps[index][0];
      if (flowDescription) flowDescription.textContent = recoverySteps[index][1];
    });
  });

  const modelModes = {
    vision: {
      steps: ['IMAGE', 'CONVOLUTION', 'FEATURES', 'CLASS'],
      description: 'A CNN learns image features to support handwriting classification. Results and model metrics will be added only when checked against project evidence.'
    },
    language: {
      steps: ['TEXT', 'SEQUENCE', 'RNN / LSTM / GRU', 'SENTIMENT'],
      description: 'Recurrent architectures process ordered text information for sentiment classification. The project compares different sequence-model approaches.'
    }
  };
  const modelFlow = document.getElementById('model-flow');
  const modelDescription = document.getElementById('model-description');
  document.querySelectorAll('[data-model-tab]').forEach((button) => {
    button.addEventListener('click', () => {
      const mode = modelModes[button.dataset.modelTab];
      if (!mode || !modelFlow) return;
      document.querySelectorAll('[data-model-tab]').forEach((item) => {
        const active = item === button;
        item.classList.toggle('is-active', active);
        item.setAttribute('aria-pressed', String(active));
      });
      modelFlow.replaceChildren();
      mode.steps.forEach((step, index) => {
        if (index) { const arrow = document.createElement('b'); arrow.textContent = '→'; modelFlow.append(arrow); }
        const label = document.createElement('span'); label.textContent = step; modelFlow.append(label);
      });
      if (modelDescription) modelDescription.textContent = mode.description;
    });
  });

  // Neural globe: deterministic geometry, rendered locally, never fetches data.
  const canvas = document.getElementById('neural-canvas');
  const context = canvas?.getContext('2d', { alpha: true, desynchronized: true });
  if (!canvas || !context) return;

  const nodes = [];
  const links = [];
  const mobileVisual = window.matchMedia('(max-width:850px), (pointer:coarse)').matches;
  const total = mobileVisual ? 104 : 156;
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < total; i++) {
    const y = 1 - (i / (total - 1)) * 2;
    const radius = Math.sqrt(1 - y * y);
    const a = goldenAngle * i;
    nodes.push({ x: Math.cos(a) * radius, y, z: Math.sin(a) * radius, seed: i });
  }
  for (let i = 0; i < nodes.length; i++) {
    const close = [];
    for (let j = 0; j < nodes.length; j++) {
      if (i === j) continue;
      const a = nodes[i], b = nodes[j];
      const d = (a.x - b.x) ** 2 + (a.y - b.y) ** 2 + (a.z - b.z) ** 2;
      if (d < .14) close.push({ j, d });
    }
    close.sort((a, b) => a.d - b.d);
    for (const match of close.slice(0, 3)) {
      if (match.j > i) links.push([i, match.j]);
    }
  }

  let cssWidth = 1, cssHeight = 1;
  let auraGradient = null, coreGradient = null;
  let time = 0, angleY = -.34, angleX = -.2;
  let pointerX = 0, pointerY = 0;
  let dragStart = null;
  let raf = 0;
  let lastTime = 0;
  let lastDraw = 0;
  const minFrameInterval = 1000 / (mobileVisual ? 15 : 24);
  let pageVisible = !document.hidden;
  let orbVisible = true;

  function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    const newWidth = Math.max(1, Math.round(rect.width));
    const newHeight = Math.max(1, Math.round(rect.height));
    if (newWidth === cssWidth && newHeight === cssHeight && auraGradient) return;
    cssWidth = newWidth;
    cssHeight = newHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, mobileVisual ? 1.25 : 1.5);
    canvas.width = Math.floor(cssWidth * dpr);
    canvas.height = Math.floor(cssHeight * dpr);
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    const cx = cssWidth / 2, cy = cssHeight / 2;
    const scale = Math.min(cssWidth, cssHeight) * .325;
    auraGradient = context.createRadialGradient(cx, cy, scale * .04, cx, cy, scale * 1.8);
    auraGradient.addColorStop(0, 'rgba(83,168,255,.075)');
    auraGradient.addColorStop(.45, 'rgba(54,104,206,.035)');
    auraGradient.addColorStop(1, 'rgba(11,23,54,0)');
    coreGradient = context.createRadialGradient(cx, cy, 0, cx, cy, scale * .25);
    coreGradient.addColorStop(0, 'rgba(174,229,255,.26)');
    coreGradient.addColorStop(.14, 'rgba(103,192,255,.13)');
    coreGradient.addColorStop(1, 'rgba(72,122,203,0)');
    render();
  }
  const resizeObserver = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(resizeCanvas) : null;
  if (resizeObserver) resizeObserver.observe(canvas);
  else window.addEventListener('resize', resizeCanvas, { passive: true });

  function getProjection(point, yaw, pitch, scale, cx, cy) {
    const cyaw = Math.cos(yaw), syaw = Math.sin(yaw);
    const cp = Math.cos(pitch), sp = Math.sin(pitch);
    const x = point.x * cyaw + point.z * syaw;
    const z = point.z * cyaw - point.x * syaw;
    const y = point.y * cp - z * sp;
    const zz = point.y * sp + z * cp;
    const perspective = 2.85 / (2.85 - zz * .57);
    return { x: cx + x * scale * perspective, y: cy + y * scale * perspective, z: zz, p: perspective };
  }

  function render() {
    const w = cssWidth, h = cssHeight;
    context.clearRect(0, 0, w, h);
    const cx = w / 2, cy = h / 2;
    const scale = Math.min(w, h) * .325;
    const yaw = angleY + pointerX * .11;
    const pitch = angleX + pointerY * .08;
    const projected = nodes.map((p) => getProjection(p, yaw, pitch, scale, cx, cy));

    context.fillStyle = auraGradient;
    context.beginPath();
    context.arc(cx, cy, scale * 1.8, 0, Math.PI * 2);
    context.fill();

    // Atmospheric orbital paths.
    context.save();
    context.translate(cx, cy);
    context.rotate(-.38);
    for (let r = 0; r < 3; r++) {
      context.beginPath();
      context.ellipse(0, 0, scale * (1.08 + r * .14), scale * (.41 + r * .07), r * .58, 0, Math.PI * 2);
      context.lineWidth = .75;
      context.strokeStyle = `rgba(125,187,255,${.12 - r * .025})`;
      context.stroke();
    }
    context.restore();

    for (const [i, j] of links) {
      const a = projected[i], b = projected[j];
      const depth = (a.z + b.z) / 2;
      const alpha = depth > -.1 ? .12 + (depth + 1) * .14 : .05;
      context.beginPath();
      context.moveTo(a.x, a.y);
      context.lineTo(b.x, b.y);
      context.lineWidth = depth > 0 ? .83 : .5;
      context.strokeStyle = `rgba(${depth > .1 ? '127,225,255' : '100,163,241'},${alpha})`;
      context.stroke();
    }

    const ordered = projected.map((p, i) => ({ ...p, i })).sort((a, b) => a.z - b.z);
    for (const dot of ordered) {
      const near = (dot.z + 1) / 2;
      const bright = dot.i % 17 === 0;
      const r = (bright ? 2.1 : .65) + near * (bright ? 1.1 : 1.2);
      context.beginPath();
      context.arc(dot.x, dot.y, r, 0, Math.PI * 2);
      context.fillStyle = bright ? `rgba(176,235,255,${.45 + near * .52})` : `rgba(113,198,255,${.18 + near * .66})`;
      context.fill();
    }

    // Slowly travelling signal packets along visible edges.
    for (let k = 0; k < 10; k++) {
      const edge = links[(k * 61 + 19) % links.length];
      const a = projected[edge[0]], b = projected[edge[1]];
      if (a.z + b.z < -.3) continue;
      const t = ((time * .00023) + k * .137) % 1;
      const x = a.x * (1 - t) + b.x * t;
      const y = a.y * (1 - t) + b.y * t;
      context.beginPath();
      context.arc(x, y, 1.6, 0, Math.PI * 2);
      context.fillStyle = 'rgba(169,237,255,.9)';
      context.fill();
    }

    // A restrained central glow is cached at resize, not rebuilt each frame.
    context.fillStyle = coreGradient;
    context.beginPath();
    context.arc(cx, cy, scale * .25, 0, Math.PI * 2);
    context.fill();
  }

  function loop(now) {
    raf = 0;
    if (!motionEnabled || !pageVisible || !orbVisible) return;
    if (now - lastDraw < minFrameInterval) {
      raf = requestAnimationFrame(loop);
      return;
    }
    lastDraw = now;
    const delta = Math.min(Math.max(now - (lastTime || now), 0), 80);
    lastTime = now;
    time += delta;
    if (!dragStart) { angleY += delta * .00010; angleX = -.19 + Math.sin(time * .0002) * .065; }
    render();
    raf = requestAnimationFrame(loop);
  }
  function syncAnimation() {
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
    lastTime = 0;
    lastDraw = 0;
    render();
    if (motionEnabled && pageVisible && orbVisible) raf = requestAnimationFrame(loop);
  }
  window.addEventListener('neurospace:motion', syncAnimation);
  document.addEventListener('visibilitychange', () => { pageVisible = !document.hidden; syncAnimation(); });
  if ('IntersectionObserver' in window) {
    const visualObserver = new IntersectionObserver((entries) => {
      orbVisible = entries.some((entry) => entry.isIntersecting);
      syncAnimation();
    }, { rootMargin: '80px' });
    visualObserver.observe(canvas);
  }

  canvas.addEventListener('pointermove', (event) => {
    const rect = canvas.getBoundingClientRect();
    pointerX = Math.max(-1, Math.min(1, ((event.clientX - rect.left) / rect.width - .5) * 2));
    pointerY = Math.max(-1, Math.min(1, ((event.clientY - rect.top) / rect.height - .5) * 2));
    if (dragStart && motionEnabled) {
      angleY += (event.clientX - dragStart.x) * .006;
      angleX += (event.clientY - dragStart.y) * .004;
      angleX = Math.max(-1, Math.min(1, angleX));
      dragStart = { x: event.clientX, y: event.clientY };
    }
    // Reduced motion preserves the stable image instead of repainting per pointer event.
  }, { passive: true });
  canvas.addEventListener('pointerleave', () => { pointerX = pointerY = 0; dragStart = null; });
  canvas.addEventListener('pointerdown', (event) => {
    if (!motionEnabled || event.pointerType === 'touch') return;
    dragStart = { x: event.clientX, y: event.clientY };
    canvas.setPointerCapture(event.pointerId);
  });
  canvas.addEventListener('pointerup', () => { dragStart = null; });
  canvas.addEventListener('pointercancel', () => { dragStart = null; });

  resizeCanvas();
  syncAnimation();
})();
