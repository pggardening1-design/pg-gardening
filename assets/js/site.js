/* ==========================================================================
   PG Gardening & Tree Surgeon — site behaviour
   Vanilla JS. No dependencies. Everything degrades without JS.
   ========================================================================== */
(function () {
  'use strict';

  document.documentElement.classList.add('js');

  /* ------------------------------------------------------------------
     Mobile navigation
     ------------------------------------------------------------------ */
  function initNav() {
    var toggle = document.querySelector('.nav-toggle');
    var nav = document.getElementById('primary-nav');
    if (!toggle || !nav) return;

    function setOpen(open) {
      toggle.setAttribute('aria-expanded', String(open));
      nav.classList.toggle('is-open', open);
      document.body.classList.toggle('nav-open', open);
      toggle.querySelector('.nav-toggle__text').textContent = open ? 'Close' : 'Menu';
    }

    toggle.addEventListener('click', function () {
      setOpen(toggle.getAttribute('aria-expanded') !== 'true');
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
        setOpen(false);
        toggle.focus();
      }
    });

    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) setOpen(false);
    });

    var mq = window.matchMedia('(min-width: 1101px)');
    (mq.addEventListener ? mq.addEventListener.bind(mq, 'change') : mq.addListener.bind(mq))(function () {
      if (mq.matches) setOpen(false);
    });
  }

  /* ------------------------------------------------------------------
     Header shadow on scroll
     ------------------------------------------------------------------ */
  function initHeader() {
    var header = document.querySelector('.site-header');
    if (!header) return;
    var ticking = false;
    function update() {
      header.classList.toggle('is-scrolled', window.scrollY > 8);
      ticking = false;
    }
    window.addEventListener('scroll', function () {
      if (!ticking) { window.requestAnimationFrame(update); ticking = true; }
    }, { passive: true });
    update();
  }

  /* ------------------------------------------------------------------
     Scroll reveal — subtle, and off entirely for reduced motion
     ------------------------------------------------------------------ */
  function initReveal() {
    var items = document.querySelectorAll('.reveal');
    if (!items.length) return;

    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced || !('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        // A fast flick can carry an element right past the viewport between
        // observer callbacks. Without the second test it would never be told
        // to appear and would stay invisible for good.
        var scrolledPast = entry.boundingClientRect.bottom <= 0;
        if (!entry.isIntersecting && !scrolledPast) return;
        var el = entry.target;
        var delay = Number(el.dataset.revealDelay || 0);
        window.setTimeout(function () { el.classList.add('is-visible'); }, delay);
        io.unobserve(el);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

    items.forEach(function (el) { io.observe(el); });

    // Safety net: if anything goes wrong later in the page's life, content
    // must never be left permanently invisible behind an unfired animation.
    window.setTimeout(function () {
      document.querySelectorAll('.reveal:not(.is-visible)').forEach(function (el) {
        var box = el.getBoundingClientRect();
        if (box.top < window.innerHeight * 1.5) el.classList.add('is-visible');
      });
    }, 2500);
  }

  /* ------------------------------------------------------------------
     Before / after sliders
     Works with mouse, touch, and arrow keys via a real range input.
     ------------------------------------------------------------------ */
  function initBeforeAfter(scope) {
    (scope || document).querySelectorAll('.ba__frame').forEach(function (frame) {
      if (frame.dataset.baReady === 'true') return;
      frame.dataset.baReady = 'true';

      var range = frame.querySelector('.ba__range');
      var afterWrap = frame.querySelector('.ba__after-wrap');
      var handle = frame.querySelector('.ba__handle');
      if (!range || !afterWrap) return;

      function apply(value) {
        var pct = Math.min(100, Math.max(0, Number(value)));
        frame.style.setProperty('--pos', pct + '%');
        afterWrap.style.clipPath = 'inset(0 0 0 ' + pct + '%)';
        if (handle) handle.style.left = pct + '%';
        range.setAttribute('aria-valuetext', Math.round(pct) + '% of the after photo showing');
      }

      range.addEventListener('input', function () { apply(range.value); });

      function pointerTo(clientX) {
        var rect = frame.getBoundingClientRect();
        var pct = ((clientX - rect.left) / rect.width) * 100;
        range.value = String(Math.min(100, Math.max(0, pct)));
        apply(range.value);
      }

      var dragging = false;
      frame.addEventListener('pointerdown', function (e) {
        dragging = true;
        frame.setPointerCapture(e.pointerId);
        pointerTo(e.clientX);
      });
      frame.addEventListener('pointermove', function (e) {
        if (dragging) pointerTo(e.clientX);
      });
      ['pointerup', 'pointercancel'].forEach(function (evt) {
        frame.addEventListener(evt, function (e) {
          dragging = false;
          if (frame.hasPointerCapture && frame.hasPointerCapture(e.pointerId)) {
            frame.releasePointerCapture(e.pointerId);
          }
        });
      });

      apply(range.value || 50);
    });
  }

  /* ------------------------------------------------------------------
     Lightbox for gallery photos
     ------------------------------------------------------------------ */
  function initLightbox() {
    var box = document.getElementById('lightbox');
    if (!box) return;

    var img = box.querySelector('.lightbox__img');
    var cap = box.querySelector('.lightbox__cap');
    var lastFocus = null;
    var items = [];
    var index = 0;

    function collect() {
      items = Array.prototype.slice.call(
        document.querySelectorAll('.photo__btn:not([hidden])')
      ).filter(function (btn) { return btn.offsetParent !== null; });
    }

    function show(i) {
      if (!items.length) return;
      index = (i + items.length) % items.length;
      var btn = items[index];
      var source = btn.querySelector('img');
      img.src = btn.dataset.full || source.src;
      img.alt = source.alt || '';
      cap.textContent = btn.dataset.caption || '';
      box.hidden = false;
      document.body.style.overflow = 'hidden';
      box.querySelector('.lightbox__close').focus();
    }

    function close() {
      box.hidden = true;
      document.body.style.overflow = '';
      img.src = '';
      if (lastFocus) lastFocus.focus();
    }

    document.addEventListener('click', function (e) {
      var btn = e.target.closest('.photo__btn');
      if (btn) {
        lastFocus = btn;
        collect();
        show(items.indexOf(btn));
        return;
      }
      if (e.target.closest('.lightbox__close') || e.target === box) close();
      if (e.target.closest('.lightbox__nav--prev')) show(index - 1);
      if (e.target.closest('.lightbox__nav--next')) show(index + 1);
    });

    document.addEventListener('keydown', function (e) {
      if (box.hidden) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') show(index - 1);
      if (e.key === 'ArrowRight') show(index + 1);
      if (e.key === 'Tab') {
        // Simple focus trap: keep focus inside the dialog.
        var focusables = box.querySelectorAll('button');
        var first = focusables[0];
        var last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
  }

  /* ------------------------------------------------------------------
     Gallery filters
     ------------------------------------------------------------------ */
  function initFilters() {
    var bar = document.querySelector('[data-filter-bar]');
    if (!bar) return;

    bar.addEventListener('click', function (e) {
      var chip = e.target.closest('.chip');
      if (!chip) return;
      var filter = chip.dataset.filter;

      bar.querySelectorAll('.chip').forEach(function (c) {
        c.setAttribute('aria-pressed', String(c === chip));
      });

      document.querySelectorAll('[data-filter-target] [data-service]').forEach(function (el) {
        var match = filter === 'all' || el.dataset.service === filter;
        el.hidden = !match;
      });

      document.querySelectorAll('[data-filter-group]').forEach(function (group) {
        var visible = group.querySelectorAll('[data-service]:not([hidden])').length;
        group.hidden = visible === 0;
      });

      var live = document.getElementById('filter-status');
      if (live) {
        var count = document.querySelectorAll('[data-filter-target] [data-service]:not([hidden])').length;
        live.textContent = count + (count === 1 ? ' photo shown' : ' photos shown');
      }
    });
  }

  /* ------------------------------------------------------------------
     Cookie consent — no analytics cookie loads before an explicit Accept.
     Consent is stored in localStorage, which is not a cookie and is
     strictly necessary for honouring the choice.
     ------------------------------------------------------------------ */
  var CONSENT_KEY = 'pg-cookie-consent';

  function readConsent() {
    try { return window.localStorage.getItem(CONSENT_KEY); }
    catch (err) { return null; }
  }

  function writeConsent(value) {
    try { window.localStorage.setItem(CONSENT_KEY, value); }
    catch (err) { /* storage blocked — the banner simply reappears */ }
  }

  function loadAnalytics() {
    var id = window.PG_CONFIG && window.PG_CONFIG.ga4Id;
    if (!id || id.indexOf('G-') !== 0 || document.getElementById('ga4-script')) return;

    var s = document.createElement('script');
    s.async = true;
    s.id = 'ga4-script';
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(id);
    document.head.appendChild(s);

    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', id, { anonymize_ip: true });
  }

  function initCookies() {
    var banner = document.getElementById('cookie-banner');
    var consent = readConsent();

    if (consent === 'accepted') loadAnalytics();

    if (banner && !consent) {
      banner.hidden = false;
      banner.addEventListener('click', function (e) {
        var btn = e.target.closest('[data-consent]');
        if (!btn) return;
        var choice = btn.dataset.consent;
        writeConsent(choice);
        banner.hidden = true;
        if (choice === 'accepted') loadAnalytics();
      });
    }

    // "Change your cookie choice" links on the cookie policy page
    document.querySelectorAll('[data-consent-reset]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        try { window.localStorage.removeItem(CONSENT_KEY); } catch (err) {}
        window.location.reload();
      });
    });

    var state = document.getElementById('consent-state');
    if (state) {
      state.textContent = consent === 'accepted'
        ? 'You have accepted analytics cookies.'
        : consent === 'rejected'
          ? 'You have rejected analytics cookies. Only strictly necessary storage is in use.'
          : 'You have not made a choice yet. No analytics cookies are running.';
    }
  }

  /* ------------------------------------------------------------------
     Sticky call bar height
     The bar's height depends on how long the phone numbers are and whether
     they wrap, so it is measured rather than guessed. --callbar-h keeps the
     page's bottom padding and the cookie banner clear of it.
     ------------------------------------------------------------------ */
  function initCallbar() {
    var bar = document.querySelector('.callbar');
    if (!bar) return;

    function measure() {
      var height = bar.offsetHeight;
      var showing = window.getComputedStyle(bar).display !== 'none';
      document.documentElement.style.setProperty(
        '--callbar-h', (showing && height ? height : 0) + 'px'
      );
    }

    measure();
    window.addEventListener('resize', function () {
      window.clearTimeout(measure.timer);
      measure.timer = window.setTimeout(measure, 150);
    }, { passive: true });

    if ('ResizeObserver' in window) new ResizeObserver(measure).observe(bar);
    window.addEventListener('load', measure);
  }

  /* ------------------------------------------------------------------
     Current year in the footer
     ------------------------------------------------------------------ */
  function initYear() {
    document.querySelectorAll('[data-year]').forEach(function (el) {
      el.textContent = String(new Date().getFullYear());
    });
  }

  /* ------------------------------------------------------------------
     Boot
     ------------------------------------------------------------------ */
  function boot() {
    initNav();
    initHeader();
    initReveal();
    initBeforeAfter();
    initLightbox();
    initFilters();
    initCallbar();
    initCookies();
    initYear();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  // Exposed so media.js can wire up sliders it injects after load.
  window.PG = window.PG || {};
  window.PG.initBeforeAfter = initBeforeAfter;
  window.PG.initReveal = initReveal;
})();
