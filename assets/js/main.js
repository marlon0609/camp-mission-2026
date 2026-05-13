/**
 * Camp Mission 2026 — Dangbessito
 * Script principal — Premium UX
 */

'use strict';

/* ==========================================================================
   1. Curseur personnalisé lumineux
   ========================================================================== */
(function initCursor() {
  const spotlight = document.getElementById('cursor-spotlight');
  if (!spotlight) return;

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let curX   = mouseX;
  let curY   = mouseY;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  document.addEventListener('mouseleave', () => {
    spotlight.style.opacity = '0';
  });

  document.addEventListener('mouseenter', () => {
    spotlight.style.opacity = '1';
  });

  function animate() {
    curX += (mouseX - curX) * 0.10;
    curY += (mouseY - curY) * 0.10;
    spotlight.style.transform = `translate(${curX - 160}px, ${curY - 160}px)`;
    requestAnimationFrame(animate);
  }
  animate();
})();

/* ==========================================================================
   2. Barre de progression scroll
   ========================================================================== */
(function initScrollProgress() {
  const bar = document.getElementById('scroll-progress');
  if (!bar) return;

  window.addEventListener('scroll', () => {
    const scrolled = window.scrollY;
    const total    = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = (scrolled / total * 100) + '%';
  }, { passive: true });
})();

/* ==========================================================================
   3. Navbar — scroll + burger
   ========================================================================== */
(function initNavbar() {
  const nav    = document.getElementById('nav');
  const burger = document.getElementById('burger');
  if (!nav) return;

  window.addEventListener('scroll', () => {
    nav.classList.toggle('sc', window.scrollY > 50);
  }, { passive: true });

  if (!burger) return;
  burger.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('open');
    burger.setAttribute('aria-expanded', isOpen);
  });

  const navLinks = document.querySelectorAll('#navLinks a');

  navLinks.forEach(a => {
    a.addEventListener('click', () => {
      nav.classList.remove('open');
      burger.setAttribute('aria-expanded', 'false');
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && nav.classList.contains('open')) {
      nav.classList.remove('open');
      burger.setAttribute('aria-expanded', 'false');
    }
  });

  // Indicateur de section active au scroll
  const sections = Array.from(document.querySelectorAll('section[id], div[id]')).filter(s =>
    document.querySelector('#navLinks a[href="#' + s.id + '"]')
  );

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      navLinks.forEach(a => a.classList.remove('nav-active'));
      const active = document.querySelector('#navLinks a[href="#' + entry.target.id + '"]');
      if (active) active.classList.add('nav-active');
    });
  }, { threshold: 0.35 });

  sections.forEach(s => sectionObserver.observe(s));
})();

/* ==========================================================================
   4. Thème sombre / clair
   ========================================================================== */
(function initTheme() {
  const html   = document.documentElement;
  const btn    = document.getElementById('themeToggle');
  const KEY    = 'cm26-theme';

  const saved = localStorage.getItem(KEY);
  if (saved) html.setAttribute('data-theme', saved);

  if (!btn) return;

  btn.addEventListener('click', () => {
    const isDark = html.getAttribute('data-theme') === 'dark';
    const next   = isDark ? 'light' : 'dark';

    html.classList.add('theme-transitioning');
    html.setAttribute('data-theme', next);
    localStorage.setItem(KEY, next);

    btn.style.animation = 'theme-spin 0.5s var(--te-premium) both';
    btn.addEventListener('animationend', () => {
      btn.style.animation = '';
    }, { once: true });

    setTimeout(() => html.classList.remove('theme-transitioning'), 400);
  });
})();

/* ==========================================================================
   5. Scroll Reveal — IntersectionObserver
   ========================================================================== */
(function initReveal() {
  const elements = document.querySelectorAll('.r');
  if (!elements.length) return;

  // Hero — timings scénarisés par élément
  const heroTimings = new Map([
    ['.hero-eyebrow',     0],
    ['.hero-camp',      200],
    ['.hero-mission',   320],
    ['.hero-actions',   440],
    ['.hero-place',     560],
    ['.hero-dates',     680],
    ['.countdown',      760],
  ]);

  heroTimings.forEach((delay, sel) => {
    const el = document.querySelector('#hero ' + sel);
    if (!el) return;
    el.style.transitionDelay = delay + 'ms';
    setTimeout(() => el.classList.add('in'), 100 + delay);
  });

  // Reste de la page
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;

      const siblings = Array.from(
        entry.target.parentElement?.querySelectorAll(':scope > .r') || []
      );
      const idx = siblings.indexOf(entry.target);

      entry.target.style.transitionDelay = Math.min(idx * 75, 350) + 'ms';
      entry.target.classList.add('in');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

  elements.forEach(el => {
    if (!el.closest('#hero')) observer.observe(el);
  });
})();

/* ==========================================================================
   6. Effet 3D Tilt sur les cartes
   ========================================================================== */
(function init3DTilt() {
  const cards = document.querySelectorAll('.tilt-card');
  if (!cards.length) return;

  const STRENGTH = 8;  // degrés max de rotation
  const LIFT     = 10; // pixels de soulèvement

  cards.forEach(card => {
    let raf;

    card.addEventListener('mouseenter', () => {
      card.style.transition = 'transform 0.1s ease, box-shadow 0.3s ease';
    });

    card.addEventListener('mousemove', (e) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width  - 0.5;
        const y = (e.clientY - rect.top)  / rect.height - 0.5;

        const rotX = -y * STRENGTH;
        const rotY =  x * STRENGTH;

        card.style.transform = `
          perspective(900px)
          rotateX(${rotX}deg)
          rotateY(${rotY}deg)
          translateZ(${LIFT}px)
        `;
      });
    });

    card.addEventListener('mouseleave', () => {
      cancelAnimationFrame(raf);
      card.style.transition = 'transform 0.5s cubic-bezier(0.16,1,0.3,1), box-shadow 0.3s ease';
      card.style.transform  = 'perspective(900px) rotateX(0deg) rotateY(0deg) translateZ(0)';
    });
  });
})();

/* ==========================================================================
   7. Effet magnétique sur les boutons CTA
   ========================================================================== */
(function initMagnetic() {
  const btns = document.querySelectorAll('.magnetic');
  if (!btns.length) return;

  const FORCE = 0.35;

  btns.forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const dx = e.clientX - (rect.left + rect.width  / 2);
      const dy = e.clientY - (rect.top  + rect.height / 2);
      btn.style.transform = `translate(${dx * FORCE}px, ${dy * FORCE}px)`;
    });

    btn.addEventListener('mouseleave', () => {
      btn.style.transition = 'transform 0.5s cubic-bezier(0.16,1,0.3,1)';
      btn.style.transform  = 'translate(0, 0)';
      setTimeout(() => { btn.style.transition = ''; }, 500);
    });

    btn.addEventListener('mouseenter', () => {
      btn.style.transition = 'transform 0.15s ease';
    });
  });
})();

/* ==========================================================================
   8. Animation compteur pour les statistiques
   ========================================================================== */
(function initCounters() {
  const counters = document.querySelectorAll('.counter');
  if (!counters.length) return;

  function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }

  function animateCounter(el) {
    const target   = parseInt(el.dataset.target, 10);
    const duration = 1800;
    let startTime  = null;

    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      el.textContent = Math.floor(easeOutCubic(progress) * target);
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = target;
    }

    requestAnimationFrame(step);
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      animateCounter(entry.target);
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.5 });

  counters.forEach(c => observer.observe(c));
})();

/* ==========================================================================
   9. Parallaxe 3D dans le hero (mouse tracking)
   ========================================================================== */
(function initHeroParallax() {
  const hero    = document.getElementById('hero');
  const content = document.getElementById('heroContent');
  if (!hero || !content || window.innerWidth < 768) return;

  const layers = {
    badge:   content.querySelector('.hero-eyebrow'),
    h1:      content.querySelector('.hero-title-block'),
    place:   content.querySelector('.hero-place'),
    dates:   content.querySelector('.hero-dates'),
    cd:      content.querySelector('.countdown'),
    actions: content.querySelector('.hero-actions'),
    glow:    hero.querySelector('.hero-glow'),
  };

  let targetX = 0, targetY = 0;
  let currentX = 0, currentY = 0;
  let rafId;

  const SPEEDS = {
    badge:   { x: -12, y: -10 },
    h1:      { x: -22, y: -18 },
    place:   { x: -18, y: -14 },
    dates:   { x: -15, y: -11 },
    cd:      { x: -12, y: -9  },
    actions: { x: -8,  y: -6  },
    glow:    { x: 28,  y: 20  },
  };

  function applyParallax() {
    Object.entries(layers).forEach(([key, el]) => {
      if (!el || !SPEEDS[key]) return;
      const sx = SPEEDS[key].x, sy = SPEEDS[key].y;
      el.style.transform = `translate(${currentX * sx}px, ${currentY * sy}px)`;
    });
  }

  function animate() {
    currentX += (targetX - currentX) * 0.07;
    currentY += (targetY - currentY) * 0.07;
    applyParallax();
    rafId = requestAnimationFrame(animate);
  }

  hero.addEventListener('mousemove', (e) => {
    const rect = hero.getBoundingClientRect();
    targetX = (e.clientX - rect.left) / rect.width  - 0.5;
    targetY = (e.clientY - rect.top)  / rect.height - 0.5;
    if (!rafId) animate();
  });

  hero.addEventListener('mouseleave', () => {
    targetX = 0;
    targetY = 0;
    setTimeout(() => {
      cancelAnimationFrame(rafId);
      rafId = null;
      Object.values(layers).forEach(el => {
        if (el) el.style.transition = 'transform 0.8s cubic-bezier(0.16,1,0.3,1)';
      });
      applyParallax();
      setTimeout(() => {
        Object.values(layers).forEach(el => {
          if (el) el.style.transition = '';
        });
      }, 800);
    }, 50);
  });
})();

/* ==========================================================================
   10. Compte à rebours vers le 22 Juillet 2026
   ========================================================================== */
(function initCountdown() {
  const elDays  = document.getElementById('cd-days');
  const elHours = document.getElementById('cd-hours');
  const elMins  = document.getElementById('cd-mins');
  const elSecs  = document.getElementById('cd-secs');
  if (!elDays) return;

  const EVENT_DATE = new Date('2026-07-22T00:00:00');

  function pad(n) { return String(n).padStart(2, '0'); }

  function flipNum(el, newVal) {
    if (el.textContent === newVal) return;
    el.style.animation = 'none';
    el.offsetHeight; // reflow
    el.style.animation = 'flip-in 0.35s ease both';
    el.textContent = newVal;
  }

  function tick() {
    const now  = new Date();
    const diff = EVENT_DATE - now;

    if (diff <= 0) {
      elDays.textContent = elHours.textContent = elMins.textContent = '00';
      elSecs.textContent = '00';
      return;
    }

    const days  = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    const mins  = Math.floor((diff % 3600000)  / 60000);
    const secs  = Math.floor((diff % 60000)    / 1000);

    flipNum(elDays,  pad(days));
    flipNum(elHours, pad(hours));
    flipNum(elMins,  pad(mins));
    flipNum(elSecs,  pad(secs));
  }

  tick();
  setInterval(tick, 1000);
})();

/* ==========================================================================
   11. Formulaire — validation & soumission
   ========================================================================== */
(function initForm() {
  const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyOv_g2bAJcTtNbVPFeRZ0b6-ITkppeVA4IEnLCou8RV7snMgFQU6tNLcRLdOjVcgs/exec';

  const form      = document.getElementById('regForm');
  const successEl = document.getElementById('success');
  const submitBtn = form?.querySelector('.btn-submit');
  if (!form || !successEl) return;

  /* ── Auto-format téléphone Togo (+228 XX XX XX XX) ── */
  function formatTel(input) {
    if (!input) return;
    input.addEventListener('input', () => {
      let v = input.value.replace(/[^\d+]/g, '');
      if (v.startsWith('00228'))  v = '+228' + v.slice(5);
      else if (/^228/.test(v))   v = '+' + v;
      if (v.startsWith('+228')) {
        const d = v.slice(4).slice(0, 8);
        v = '+228 ' + d.replace(/(\d{2})(?=\d)/g, '$1 ').trim();
      } else {
        v = v.slice(0, 8).replace(/(\d{2})(?=\d)/g, '$1 ').trim();
      }
      input.value = v;
    });
  }
  formatTel(document.getElementById('tel-campeur'));
  formatTel(document.getElementById('tuteur-tel'));

  /* ── Normalise le numéro avant envoi : +228XXXXXXXX sans espaces ── */
  function normalizePhone(raw) {
    raw = (raw || '').replace(/[\s\-\.]/g, '');
    if (raw.startsWith('00228')) raw = '+228' + raw.slice(5);
    if (/^\d{8}$/.test(raw))    raw = '+228' + raw;
    return raw;
  }

  function shakeInvalid() {
    const fields = form.querySelectorAll('.fi, .fs, .fta');
    fields.forEach(f => {
      if (!f.validity.valid) {
        f.classList.add('invalid');
        f.addEventListener('animationend', () => f.classList.remove('invalid'), { once: true });
      }
    });
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!form.checkValidity()) {
      shakeInvalid();
      form.reportValidity();
      return;
    }

    const swimChecked = form.querySelector('input[name="swim"]:checked');
    if (!swimChecked) {
      form.querySelector('.radio-g')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.querySelector('span').textContent = 'Envoi en cours…';
    }

    const params = new URLSearchParams(new FormData(form));
    params.set('tel-campeur', normalizePhone(params.get('tel-campeur')));
    params.set('tuteur-tel',  normalizePhone(params.get('tuteur-tel')));

    if (SCRIPT_URL !== 'COLLER_ICI_VOTRE_URL_WEB_APP') {
      try {
        await fetch(SCRIPT_URL, { method: 'POST', mode: 'no-cors', body: params });
      } catch (_) {}
    }

    form.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
    form.style.opacity    = '0';
    form.style.transform  = 'translateY(-10px)';

    setTimeout(() => {
      form.style.display = 'none';
      successEl.style.display = 'block';
      successEl.style.opacity = '0';
      successEl.style.transform = 'translateY(20px)';
      successEl.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
      requestAnimationFrame(() => requestAnimationFrame(() => {
        successEl.style.opacity   = '1';
        successEl.style.transform = 'translateY(0)';
      }));
    }, 420);
  });
})();

/* ==========================================================================
   12. Bouton retour en haut
   ========================================================================== */
(function initBackTop() {
  const btn = document.getElementById('back-top');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    btn.classList.toggle('show', window.scrollY > 400);
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();

/* ==========================================================================
   13. Smooth scroll (fallback navigateurs anciens)
   ========================================================================== */
(function initSmoothScroll() {
  if ('scrollBehavior' in document.documentElement.style) return;
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const target = document.querySelector(a.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
    });
  });
})();

/* ==========================================================================
   14. Galerie — Bouton "Voir plus"
   ========================================================================== */
(function initGalleryMore() {
  const grid = document.getElementById('galleryGrid');
  const btn  = document.getElementById('galleryMore');
  if (!grid || !btn) return;

  btn.addEventListener('click', () => {
    grid.classList.add('expanded');
    btn.classList.add('hidden');

    // Animer l'apparition des nouvelles photos
    const extras = grid.querySelectorAll('.gallery-extra');
    extras.forEach((el, i) => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(20px)';
      setTimeout(() => {
        el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
        // Activer le reveal
        el.classList.add('in');
      }, i * 40);
    });

    // Scroll doux vers la grille
    grid.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });
})();

/* ==========================================================================
   15. Lightbox — visionneuse de photos
   ========================================================================== */
(function initLightbox() {
  const lightbox = document.getElementById('lightbox');
  const lbImg    = document.getElementById('lbImg');
  const lbCounter= document.getElementById('lbCounter');
  const lbClose  = document.getElementById('lbClose');
  const lbPrev   = document.getElementById('lbPrev');
  const lbNext   = document.getElementById('lbNext');
  const lbOverlay= document.getElementById('lbOverlay');
  if (!lightbox || !lbImg) return;

  let photos  = [];
  let current = 0;

  // Collecter toutes les photos de la galerie
  function buildPhotoList() {
    photos = Array.from(document.querySelectorAll('.gallery-item')).map(item => ({
      src: item.querySelector('img')?.src || '',
      alt: item.querySelector('img')?.alt || '',
    }));
  }

  function open(index) {
    buildPhotoList();
    current = Math.max(0, Math.min(index, photos.length - 1));
    lightbox.hidden = false;
    document.body.style.overflow = 'hidden';
    render();
  }

  function close() {
    lightbox.hidden = true;
    document.body.style.overflow = '';
  }

  function render() {
    if (!photos[current]) return;
    lbImg.style.opacity = '0';
    lbImg.src = photos[current].src;
    lbImg.alt = photos[current].alt;
    lbImg.onload = () => { lbImg.style.opacity = '1'; };
    lbCounter.textContent = (current + 1) + ' / ' + photos.length;

    // État des boutons nav
    lbPrev.style.opacity = current === 0 ? '0.3' : '1';
    lbNext.style.opacity = current === photos.length - 1 ? '0.3' : '1';
  }

  function prev() { if (current > 0) { current--; render(); } }
  function next() { if (current < photos.length - 1) { current++; render(); } }

  // Clic sur les items de la galerie
  document.addEventListener('click', (e) => {
    const item = e.target.closest('.gallery-item');
    if (!item) return;
    const idx = parseInt(item.dataset.index, 10);
    if (!isNaN(idx)) open(idx);
  });

  // Contrôles
  lbClose?.addEventListener('click', close);
  lbOverlay?.addEventListener('click', close);
  lbPrev?.addEventListener('click', prev);
  lbNext?.addEventListener('click', next);

  // Clavier
  document.addEventListener('keydown', (e) => {
    if (lightbox.hidden) return;
    if (e.key === 'Escape')     close();
    if (e.key === 'ArrowLeft')  prev();
    if (e.key === 'ArrowRight') next();
  });

  // Swipe tactile
  let touchStartX = 0;
  lightbox.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
  }, { passive: true });

  lightbox.addEventListener('touchend', (e) => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 50) {
      if (dx > 0) prev();
      else        next();
    }
  }, { passive: true });
})();
