/* Антишкола — летний лендинг. Interactions & motion. */
(() => {
  const RM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  gsap.registerPlugin(ScrollTrigger);

  /* ---------- Lenis smooth scroll (weighted, premium) ---------- */
  let lenis = null;
  function smoothScroll() {
    if (RM || typeof Lenis === 'undefined') return;
    lenis = new Lenis({ duration: 1.15, easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true, wheelMultiplier: 0.95 });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(t => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  /* ---------- Preloader ---------- */
  function preload() {
    const pl = $('#preloader'), logo = $('.pl-logo'), bar = $('.pl-bar i');
    const tl = gsap.timeline();
    tl.to(logo, { opacity: 1, duration: .6, ease: 'power2.out' })
      .fromTo(bar, { width: '0%' }, { width: '100%', duration: 1, ease: 'power1.inOut' }, '-=.3')
      .to(pl, { yPercent: -100, duration: .8, ease: 'power3.inOut', delay: .15 })
      .add(() => { document.body.classList.remove('locked'); pl.style.display = 'none'; heroIntro(); })
      .set(pl, { display: 'none' });
  }

  /* ---------- Hero kinetic intro ---------- */
  function heroIntro() {
    if (RM) { gsap.set('[data-w]', { y: 0 }); return; }
    gsap.fromTo('[data-w]', { yPercent: 115 }, {
      yPercent: 0, duration: 1.05, ease: 'power4.out', stagger: .09
    });
    gsap.fromTo('.hero-eyebrow,.hero-promise,.hero-sub,.hero-cta,.hero-micro,.hero-trust',
      { y: 26, opacity: 0 }, { y: 0, opacity: 1, duration: .8, ease: 'power3.out', stagger: .08, delay: .5 });
  }

  /* ---------- Cursor glow + magnetic ---------- */
  function cursor() {
    if (RM || matchMedia('(pointer:coarse)').matches) { $('#cursor').style.display = 'none'; return; }
    const c = $('#cursor');
    let x = innerWidth / 2, y = innerHeight / 2, cx = x, cy = y;
    addEventListener('mousemove', e => { x = e.clientX; y = e.clientY; });
    gsap.ticker.add(() => { cx += (x - cx) * .12; cy += (y - cy) * .12; c.style.transform = `translate(${cx}px,${cy}px) translate(-50%,-50%)`; });
    $$('[data-magnetic]').forEach(el => {
      el.addEventListener('mousemove', e => {
        const r = el.getBoundingClientRect();
        gsap.to(el, { x: (e.clientX - r.left - r.width / 2) * .3, y: (e.clientY - r.top - r.height / 2) * .4, duration: .4, ease: 'power3.out' });
      });
      el.addEventListener('mouseleave', () => gsap.to(el, { x: 0, y: 0, duration: .5, ease: 'elastic.out(1,.4)' }));
    });
  }

  /* ---------- Header ---------- */
  function header() {
    const h = $('#header'); let last = 0;
    const upd = () => {
      const y = scrollY;
      h.classList.toggle('scrolled', y > 40);
      h.classList.toggle('hide', y > last && y > 600);
      last = y;
    };
    addEventListener('scroll', upd, { passive: true });
  }

  /* ---------- Mobile nav ---------- */
  function mnav() {
    const b = $('#burger'), m = $('#mnav');
    const t = () => { m.classList.toggle('open'); document.body.classList.toggle('locked', m.classList.contains('open')); };
    b.addEventListener('click', t);
    $$('#mnav a').forEach(a => a.addEventListener('click', () => { m.classList.remove('open'); document.body.classList.remove('locked'); }));
  }

  /* ---------- Hero neon canvas ---------- */
  function heroCanvas() {
    const cv = $('#hero-canvas'); if (!cv) return;
    const ctx = cv.getContext('2d');
    let w, h, dpr = Math.min(devicePixelRatio || 1, 2), parts = [], mx = -999, my = -999;
    const COL = ['#ed1ec6', '#fff600', '#14e0e0'];
    function resize() {
      w = cv.width = innerWidth * dpr; h = cv.height = cv.offsetHeight * dpr;
      cv.style.width = innerWidth + 'px';
      const n = RM ? 0 : Math.min(90, Math.floor(innerWidth / 16));
      parts = Array.from({ length: n }, () => ({
        x: Math.random() * w, y: Math.random() * h,
        vx: (Math.random() - .5) * .25 * dpr, vy: (Math.random() - .5) * .25 * dpr,
        r: (Math.random() * 1.8 + .6) * dpr, c: COL[Math.random() * COL.length | 0]
      }));
    }
    addEventListener('mousemove', e => { mx = e.clientX * dpr; my = e.clientY * dpr; });
    addEventListener('mouseleave', () => { mx = my = -9999; });
    function frame() {
      ctx.clearRect(0, 0, w, h);
      for (let i = 0; i < parts.length; i++) {
        const p = parts[i];
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
        const dx = p.x - mx, dy = p.y - my, d = Math.hypot(dx, dy);
        if (d < 150 * dpr) { p.x += dx / d * 1.4; p.y += dy / d * 1.4; }
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 7); ctx.fillStyle = p.c; ctx.globalAlpha = .9; ctx.fill();
        for (let j = i + 1; j < parts.length; j++) {
          const q = parts[j], l = Math.hypot(p.x - q.x, p.y - q.y);
          if (l < 120 * dpr) { ctx.globalAlpha = (1 - l / (120 * dpr)) * .18; ctx.strokeStyle = p.c; ctx.lineWidth = dpr; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke(); }
        }
      }
      ctx.globalAlpha = 1; requestAnimationFrame(frame);
    }
    resize(); addEventListener('resize', resize); if (!RM) frame();
  }

  /* ---------- Split headings: words rise on scroll (WOW) ---------- */
  function splitHeadings() {
    $$('h2[data-split]').forEach(h => {
      // wrap each word (preserving accent spans) in a mask line
      const frag = document.createDocumentFragment();
      const words = [];
      h.childNodes.forEach(node => {
        if (node.nodeType === 3) {
          node.textContent.split(/(\s+)/).forEach(t => {
            if (!t.trim()) { frag.appendChild(document.createTextNode(t)); return; }
            const w = mkWord(t, false); frag.appendChild(w.outer); words.push(w.inner);
          });
        } else {
          const accent = node.classList && node.classList.contains('accent');
          node.textContent.split(/(\s+)/).forEach(t => {
            if (!t.trim()) { frag.appendChild(document.createTextNode(t)); return; }
            const w = mkWord(t, accent); frag.appendChild(w.outer); words.push(w.inner);
          });
        }
      });
      h.innerHTML = ''; h.appendChild(frag);
      if (RM) { gsap.set(words, { yPercent: 0 }); return; }
      gsap.set(words, { yPercent: 110 });
      ScrollTrigger.create({
        trigger: h, start: 'top 84%', once: true,
        onEnter: () => gsap.to(words, { yPercent: 0, duration: 1, ease: 'power4.out', stagger: .055 })
      });
    });
    function mkWord(text, accent) {
      const outer = document.createElement('span');
      outer.style.cssText = 'display:inline-block;overflow:hidden;vertical-align:top;';
      const inner = document.createElement('span');
      inner.textContent = text;
      inner.style.cssText = 'display:inline-block;will-change:transform;';
      if (accent) inner.className = 'accent';
      outer.appendChild(inner);
      return { outer, inner };
    }
  }

  /* ---------- Reveal on scroll (with grouped stagger) ---------- */
  function reveals() {
    // stagger cards inside grids
    [['.pain-grid', '.pain'], ['.principles', '.principle'], ['.bento', '.cell'], ['.steps', '.step']].forEach(([wrapSel, itemSel]) => {
      $$(wrapSel).forEach(w => {
        const items = $$(itemSel, w);
        if (RM) return;
        gsap.set(items, { y: 40, opacity: 0 });
        ScrollTrigger.create({
          trigger: w, start: 'top 80%', once: true,
          onEnter: () => gsap.to(items, { y: 0, opacity: 1, duration: .9, ease: 'power3.out', stagger: .1 })
        });
      });
    });
    $$('.reveal').forEach(el => {
      ScrollTrigger.create({ trigger: el, start: 'top 88%', onEnter: () => el.classList.add('is-in') });
    });
  }

  /* ---------- Image clip-reveal + parallax (WOW) ---------- */
  function imageFX() {
    if (RM) return;
    // hero photo subtle parallax + scale
    const hp = $('.hero-photo img');
    if (hp) gsap.to(hp, { yPercent: 12, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
    // door images clip reveal as they enter
    $$('.door-card .visual img').forEach(img => {
      gsap.fromTo(img, { clipPath: 'inset(0 0 100% 0)', scale: 1.15 },
        { clipPath: 'inset(0 0 0% 0)', scale: 1, duration: 1.1, ease: 'power3.out',
          scrollTrigger: { trigger: img.closest('.door'), start: 'top 80%', once: true } });
    });
    // bridge / lead big lines fade-rise handled by reveal; add parallax to door visuals
    $$('.door-card .visual').forEach(v => {
      gsap.fromTo(v.querySelector('img'), { yPercent: -6 }, { yPercent: 6, ease: 'none',
        scrollTrigger: { trigger: v, start: 'top bottom', end: 'bottom top', scrub: true } });
    });
  }

  /* ---------- Counters ---------- */
  function counters() {
    $$('[data-count]').forEach(el => {
      const to = +el.dataset.count, suf = el.dataset.suffix || (el.textContent.includes('+') ? '+' : '');
      ScrollTrigger.create({
        trigger: el, start: 'top 88%', once: true,
        onEnter: () => {
          const o = { v: 0 };
          gsap.to(o, { v: to, duration: 1.6, ease: 'power2.out', onUpdate: () => { el.textContent = Math.round(o.v) + (suf || ''); } });
        }
      });
    });
  }

  /* ---------- Doors pinned horizontal ---------- */
  function doors() {
    const track = $('#doorTrack'), pin = $('#pinWrap'), btns = $$('#doorsProg button');
    if (!track || innerWidth < 861) { // mobile = stacked, sync buttons on scroll
      $$('.door').forEach((d, i) => ScrollTrigger.create({
        trigger: d, start: 'top 60%', end: 'bottom 60%',
        onToggle: self => self.isActive && setActive(i)
      }));
      btns.forEach(b => b.addEventListener('click', () => $$('.door')[+b.dataset.i].scrollIntoView({ behavior: 'smooth', block: 'center' })));
      return;
    }
    function setActive(i) { btns.forEach((b, k) => b.classList.toggle('on', k === i)); }
    const st = gsap.to(track, {
      xPercent: -66.666, ease: 'none',
      scrollTrigger: {
        trigger: pin, pin: true, scrub: 1,
        start: 'top 84px', end: () => '+=' + (track.offsetWidth * 1.4),
        onUpdate: self => setActive(Math.min(2, Math.round(self.progress * 2.2)))
      }
    });
    btns.forEach(b => b.addEventListener('click', () => {
      const i = +b.dataset.i, t = st.scrollTrigger;
      const y = t.start + (t.end - t.start) * (i / 2.2);
      gsap.to(window, { scrollTo: y, duration: .8, ease: 'power2.inOut' });
    }));
    // light parallax inside cards
    $$('.door .door-card').forEach(card => {
      gsap.fromTo(card, { scale: .96 }, { scale: 1, ease: 'none',
        scrollTrigger: { trigger: pin, start: 'top 84px', end: 'bottom bottom', scrub: true } });
    });
  }
  function setActive(i){ $$('#doorsProg button').forEach((b,k)=>b.classList.toggle('on',k===i)); }

  /* ---------- How steps line ---------- */
  function howLine() {
    const steps = $('.steps'); if (!steps) return;
    ScrollTrigger.create({ trigger: steps, start: 'top 72%', once: true, onEnter: () => steps.style.setProperty('--p', '1') });
  }

  /* ---------- FAQ ---------- */
  function faq() {
    $$('.acc-item').forEach(it => {
      const q = $('.acc-q', it), a = $('.acc-a', it);
      q.addEventListener('click', () => {
        const open = it.classList.contains('open');
        $$('.acc-item.open').forEach(o => { o.classList.remove('open'); $('.acc-a', o).style.maxHeight = 0; });
        if (!open) { it.classList.add('open'); a.style.maxHeight = a.scrollHeight + 'px'; }
      });
    });
  }

  /* ---------- Form ---------- */
  function form() {
    const f = $('#leadForm'); if (!f) return;
    f.addEventListener('submit', e => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(f));
      if (!data.name || !data.age || !data.contact) { gsap.fromTo(f, { x: -8 }, { x: 0, duration: .4, ease: 'elastic.out(1,.3)' }); return; }
      const btn = $('button[type=submit]', f);
      btn.innerHTML = '✓ Заявка отправлена';
      btn.style.background = 'var(--magenta)'; btn.style.color = '#fff';
      f.querySelector('.fm-micro').textContent = 'Спасибо! Мы напишем вам в ближайшее время, чтобы понять задачу ребёнка.';
      // TODO: connect real endpoint / CRM
      console.log('lead', data);
    });
  }

  /* ---------- Smooth anchor ---------- */
  function anchors() {
    $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
      const id = a.getAttribute('href'); if (id.length < 2) return;
      const t = $(id); if (!t) return;
      e.preventDefault();
      const y = t.getBoundingClientRect().top + scrollY - 70;
      if (lenis) lenis.scrollTo(y, { duration: 1.2 }); else window.scrollTo({ top: y, behavior: 'smooth' });
    }));
  }

  /* ---------- Init ---------- */
  function init() {
    smoothScroll();
    preload(); cursor(); header(); mnav();
    splitHeadings(); reveals(); imageFX(); counters(); doors(); howLine(); faq(); form(); anchors();
    ScrollTrigger.refresh();
  }
  if (document.readyState !== 'loading') init();
  else document.addEventListener('DOMContentLoaded', init);
})();
