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
   11. Programme journalier
   ========================================================================== */
(function initDailyProgramme() {
  const daysEl = document.getElementById('progDays');
  const panelEl = document.getElementById('progPanel');
  const modeEl = document.getElementById('progMode');
  const dateEl = document.getElementById('progDate');
  const titleEl = document.getElementById('progDayTitle');
  const wordEl = document.getElementById('progWord');
  const timelineEl = document.getElementById('progTimeline');
  if (!daysEl || !panelEl || !modeEl || !dateEl || !titleEl || !wordEl || !timelineEl) return;

  const programme = [
    {
      date: '2026-07-22',
      day: 'Mercredi',
      label: '22 juillet',
      title: 'Journée Hola',
      word: 'Mot du soir : Crainte',
      events: [
        ['08h00', 'Rassemblement et contrôle'],
        ['10h00 - 11h30', 'Départ'],
        ['14h30', 'Arrivée et installation'],
        ['18h00', 'Angélus'],
        ['19h00', 'Dîner'],
        ['20h00', 'Ouverture du camp missionnaire : règlement intérieur, consigne et lancement de la récollection'],
        ['21h30', 'Couvre-feu']
      ]
    },
    {
      date: '2026-07-23',
      day: 'Jeudi',
      label: '23 juillet',
      title: 'Journée Méditation',
      word: 'Mot du jour : Piété · Mot du soir : Sagesse',
      events: [
        ['05h00', 'Réveil + prière'],
        ['05h30', 'Messe'],
        ['06h45', 'Jogging et entretien'],
        ['08h00', 'Petit déjeuner'],
        ['09h00', 'Rêver'],
        ['11h00', 'Chemin de croix et douche'],
        ['12h30', 'Déjeuner'],
        ['13h20', 'Sieste'],
        ['15h00', 'Chapelet de la miséricorde et préparatif'],
        ['18h00', 'Angélus et adoration'],
        ['19h30', 'Dîner'],
        ['20h30', 'Soirée louange : détruire le mur de Jéricho'],
        ['22h00', 'Journal et couvre-feu']
      ]
    },
    {
      date: '2026-07-24',
      day: 'Vendredi',
      label: '24 juillet',
      title: 'Journée Missionnaire',
      word: 'Mot du jour : Intelligence · Mot du soir : Connaissance',
      events: [
        ['05h00', 'Réveil + prière'],
        ['05h30', 'Messe'],
        ['06h45', 'Jogging et entretien'],
        ['08h00', 'Petit déjeuner'],
        ['09h00', 'Atelier : carte de mission'],
        ['10h30', 'Activités missionnaires : évangélisons autrement'],
        ['12h00', 'Angélus et déjeuner'],
        ['13h00', 'Douche et sieste'],
        ['15h00', 'Olympiade : jeux des vertus et de politesse'],
        ['18h00', 'Angélus et animation'],
        ['19h00', 'Dîner'],
        ['20h00', 'Projection : photos et vidéos, League des génies et journal'],
        ['22h00', 'Couvre-feu']
      ]
    },
    {
      date: '2026-07-25',
      day: 'Samedi',
      label: '25 juillet',
      title: 'Journée Olympique',
      word: 'Mot du jour : Amour · Mot du soir : Amour',
      events: [
        ['05h00', 'Réveil et prière'],
        ['05h30', 'Messe'],
        ['06h30', 'Jogging et entretien'],
        ['08h00', 'Petit déjeuner'],
        ['09h00', 'Initiation au jeu de piste biblique'],
        ['10h00', 'Formation sur la santé sexuelle'],
        ['12h00', 'Déjeuner'],
        ['13h00', 'Douche et sieste'],
        ['15h00', 'Jeux de piste'],
        ['17h00', 'Animation'],
        ['19h00', 'Dîner'],
        ['20h00', 'League des génies, veillée et journal'],
        ['22h00', 'Couvre-feu']
      ]
    },
    {
      date: '2026-07-26',
      day: 'Dimanche',
      label: '26 juillet',
      title: 'Journée Culturelle',
      word: 'Mot du jour : Courage · Mot du soir : Conseil',
      events: [
        ['05h00', 'Réveil et prière'],
        ['05h30', 'Entretien'],
        ['06h00', 'Douche'],
        ['07h00', 'Petit déjeuner'],
        ['08h30', 'Messe et caravane'],
        ['12h00', 'Pique-nique'],
        ['14h00', 'Après-midi culturelle : prestations, joutes verbales et League des génies'],
        ['19h00', 'Bal masqué'],
        ['22h00', 'Couvre-feu']
      ]
    },
    {
      date: '2026-07-27',
      day: 'Lundi',
      label: '27 juillet',
      title: 'Journée Tradi-moderne',
      word: 'Mot du jour : Science · Mot du soir : Union',
      events: [
        ['05h30', 'Réveil et prière'],
        ['06h00', 'Jogging et entretien'],
        ['08h00', 'Petit déjeuner'],
        ['09h30', 'Matinée clerc et formation en art oratoire'],
        ['12h00', 'Angélus, déjeuner et sieste'],
        ['14h00', 'Commémoration'],
        ['18h00', 'Angélus'],
        ['19h30', 'Dîner'],
        ['21h30', 'Veillée traditionnelle et journal'],
        ['22h30', 'Couvre-feu']
      ]
    },
    {
      date: '2026-07-28',
      day: 'Mardi',
      label: '28 juillet',
      title: 'Journée Eco-football',
      word: 'Mot du jour : Force · Mot du soir : Fierté',
      events: [
        ['05h00', 'Réveil et prière'],
        ['05h30', 'Messe'],
        ['06h45', 'Jogging et entretien'],
        ['08h00', 'Petit déjeuner'],
        ['09h45', 'Classe de chant'],
        ['11h00', 'Dangbessito propre : écologie'],
        ['12h00', 'Angélus et déjeuner'],
        ['13h00', 'Sieste'],
        ['14h30', 'Match de football'],
        ['17h00', 'Bilan du camp'],
        ['19h00', 'Dîner'],
        ['20h00', 'Feu du camp'],
        ['22h00', 'Couvre-feu']
      ]
    },
    {
      date: '2026-07-29',
      day: 'Mercredi',
      label: '29 juillet',
      title: 'Journée Ciaooo',
      word: 'Mot du jour : Mission',
      events: [
        ['06h00', 'Réveil et prière'],
        ['07h00', 'Jogging et entretien'],
        ['08h30', 'Petit déjeuner'],
        ['09h30', 'Douche'],
        ['11h00', 'Classe de chant'],
        ['12h00', 'Déjeuner'],
        ['13h00', 'Départ']
      ]
    }
  ];

  function todayKey() {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  const activeToday = todayKey();
  const autoIndex = programme.findIndex(day => day.date === activeToday);
  let selectedIndex = autoIndex >= 0 ? autoIndex : 0;
  let lastAutoDate = activeToday;

  function renderDay(index, fromAuto = false) {
    selectedIndex = index;
    const day = programme[index];

    dateEl.textContent = `${day.day} ${day.label} 2026`;
    titleEl.textContent = day.title;
    wordEl.textContent = day.word;
    const currentAutoIndex = programme.findIndex(item => item.date === todayKey());
    modeEl.textContent = currentAutoIndex >= 0 && index === currentAutoIndex
      ? 'Aujourd’hui au camp'
      : fromAuto
        ? 'Programme affiché automatiquement'
        : 'Programme sélectionné';

    timelineEl.innerHTML = day.events.map(([time, activity]) => `
      <li class="prog-event">
        <time class="prog-time">${time}</time>
        <div class="prog-activity">${activity}</div>
      </li>
    `).join('');

    daysEl.querySelectorAll('.prog-day-btn').forEach((btn, btnIndex) => {
      const isActive = btnIndex === index;
      btn.classList.toggle('is-active', isActive);
      btn.setAttribute('aria-selected', String(isActive));
      btn.setAttribute('tabindex', isActive ? '0' : '-1');
    });
  }

  daysEl.innerHTML = programme.map((day, index) => `
    <button class="prog-day-btn" type="button" role="tab" aria-controls="progPanel" data-index="${index}">
      <span class="prog-day-num">${String(index + 1).padStart(2, '0')}</span>
      <span>
        <span class="prog-day-name">${day.day}</span>
        <span class="prog-day-date">${day.label}</span>
      </span>
    </button>
  `).join('');

  daysEl.addEventListener('click', (e) => {
    const btn = e.target.closest('.prog-day-btn');
    if (!btn) return;
    renderDay(Number(btn.dataset.index));
  });

  daysEl.addEventListener('keydown', (e) => {
    if (!['ArrowDown', 'ArrowRight', 'ArrowUp', 'ArrowLeft', 'Home', 'End'].includes(e.key)) return;
    e.preventDefault();

    let next = selectedIndex;
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') next = (selectedIndex + 1) % programme.length;
    if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') next = (selectedIndex - 1 + programme.length) % programme.length;
    if (e.key === 'Home') next = 0;
    if (e.key === 'End') next = programme.length - 1;

    renderDay(next);
    daysEl.querySelectorAll('.prog-day-btn')[next]?.focus();
  });

  renderDay(selectedIndex, autoIndex >= 0);

  setInterval(() => {
    const nextDate = todayKey();
    if (nextDate === lastAutoDate) return;
    lastAutoDate = nextDate;

    const nextAutoIndex = programme.findIndex(day => day.date === nextDate);
    if (nextAutoIndex >= 0) renderDay(nextAutoIndex, true);
  }, 60000);
})();

/* ==========================================================================
   12. Formulaire — validation & soumission
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
   13. Bouton retour en haut
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
   14. Smooth scroll (fallback navigateurs anciens)
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
