/* ==========================================================================
   PG Gardening & Tree Surgeon — photo rendering
   Reads window.PG_PHOTOS (built by tools/scan-photos.mjs) and fills in every
   photo slot on the page. Where there is no real photo yet, a clearly
   labelled placeholder shows the exact filename that would fill it.
   ========================================================================== */
(function () {
  'use strict';

  var DATA = window.PG_PHOTOS || { services: {}, totals: { pairs: 0, singles: 0 } };

  var SERVICE_ORDER = ['tree-surgery', 'hedge-cutting', 'garden-work', 'power-washing'];
  var SERVICE_LABELS = {
    'tree-surgery': 'Tree surgery',
    'hedge-cutting': 'Hedge cutting',
    'garden-work': 'Garden work',
    'power-washing': 'Power washing'
  };

  function svc(slug) {
    return DATA.services && DATA.services[slug]
      ? DATA.services[slug]
      : { slug: slug, label: SERVICE_LABELS[slug] || slug, pairs: [], singles: [] };
  }

  function slugsFor(value) {
    if (!value || value === 'all') return SERVICE_ORDER.slice();
    return value.split(',').map(function (s) { return s.trim(); }).filter(Boolean);
  }

  function esc(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  /* ------------------------------------------------------------------
     Placeholder slot
     ------------------------------------------------------------------ */
  var CAMERA_ICON =
    '<svg class="slot__icon" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
    'stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<path d="M14.5 4h-5L8 6H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-4l-1.5-2Z"/>' +
    '<circle cx="12" cy="13" r="3.5"/></svg>';

  function slot(label, filename) {
    return '<div class="slot"><div class="slot__inner">' + CAMERA_ICON +
      '<span class="slot__label">' + esc(label) + '</span>' +
      (filename ? '<span class="slot__hint">' + esc(filename) + '</span>' : '') +
      '</div></div>';
  }

  /* ------------------------------------------------------------------
     Before / after slider markup
     ------------------------------------------------------------------ */
  function pairMarkup(pair, service, showCaption) {
    var title = pair.title || (SERVICE_LABELS[service] + ' — before and after');
    return '' +
      '<figure class="ba reveal" data-service="' + esc(service) + '">' +
        '<div class="ba__frame">' +
          '<img class="ba__img" src="' + esc(pair.before) + '" alt="' + esc(pair.altBefore) + '" loading="lazy" decoding="async">' +
          '<div class="ba__after-wrap">' +
            '<img class="ba__img" src="' + esc(pair.after) + '" alt="' + esc(pair.altAfter) + '" loading="lazy" decoding="async">' +
          '</div>' +
          '<span class="ba__tag ba__tag--before">Before</span>' +
          '<span class="ba__tag ba__tag--after">After</span>' +
          '<input class="ba__range" type="range" min="0" max="100" value="50" step="1" ' +
            'aria-label="' + esc(title) + ' — drag to wipe between the before and after photo">' +
          '<span class="ba__handle"><span class="ba__grip" aria-hidden="true">' +
            '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" ' +
            'stroke-linecap="round" stroke-linejoin="round"><path d="m9 6-6 6 6 6"/><path d="m15 6 6 6-6 6"/></svg>' +
          '</span></span>' +
        '</div>' +
        (showCaption !== false
          ? '<figcaption class="ba__caption"><h3>' + esc(title) + '</h3>' +
            '<p>' + esc(pair.caption || 'Drag the slider to compare. Real job, real garden — photographed before we started and again when we finished.') + '</p></figcaption>'
          : '') +
      '</figure>';
  }

  function pairPlaceholder(service) {
    var label = SERVICE_LABELS[service] || service;
    return '' +
      '<figure class="ba reveal" data-service="' + esc(service) + '">' +
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:1px;background:var(--line);aspect-ratio:4/3">' +
          slot('Before photo needed', 'before-01.jpg') +
          slot('After photo needed', 'after-01.jpg') +
        '</div>' +
        '<figcaption class="ba__caption"><h3>' + esc(label) + ' — before and after</h3>' +
        '<p>Drop both photos into <code>assets/img/gallery/' + esc(service) + '/</code> and this pair goes live. ' +
        'A pair is never shown half-finished.</p></figcaption>' +
      '</figure>';
  }

  /* ------------------------------------------------------------------
     Photo grid item
     ------------------------------------------------------------------ */
  function photoMarkup(item, service, tag) {
    var caption = item.caption || (tag ? tag + ' — ' + SERVICE_LABELS[service] : SERVICE_LABELS[service]);
    return '' +
      '<figure class="photo reveal" data-service="' + esc(service) + '">' +
        '<button class="photo__btn" type="button" data-full="' + esc(item.src) + '" ' +
          'data-caption="' + esc(caption) + '">' +
          '<img src="' + esc(item.src) + '" alt="' + esc(item.alt) + '" loading="lazy" decoding="async">' +
        '</button>' +
        '<figcaption>' + esc(caption) + '</figcaption>' +
      '</figure>';
  }

  /* ------------------------------------------------------------------
     Renderers
     ------------------------------------------------------------------ */

  // <div data-pg-pairs="tree-surgery" data-limit="1"></div>
  function renderPairs(el) {
    var slugs = slugsFor(el.dataset.pgPairs);
    var limit = Number(el.dataset.limit || 0);
    var allowPlaceholder = el.dataset.placeholder !== 'off';
    var html = [];

    slugs.forEach(function (slug) {
      var service = svc(slug);
      var pairs = service.pairs || [];
      var perService = limit > 0 ? pairs.slice(0, limit) : pairs;

      if (perService.length) {
        perService.forEach(function (pair) { html.push(pairMarkup(pair, slug)); });
      } else if (allowPlaceholder) {
        html.push(pairPlaceholder(slug));
      }
    });

    el.innerHTML = html.join('');
  }

  // <div data-pg-gallery="all"></div>  — every photo, including both halves of pairs
  function renderGallery(el) {
    var slugs = slugsFor(el.dataset.pgGallery);
    var includePairs = el.dataset.includePairs !== 'off';
    var html = [];
    var count = 0;

    slugs.forEach(function (slug) {
      var service = svc(slug);

      if (includePairs) {
        (service.pairs || []).forEach(function (pair) {
          html.push(photoMarkup({ src: pair.before, alt: pair.altBefore, caption: pair.caption }, slug, 'Before'));
          html.push(photoMarkup({ src: pair.after, alt: pair.altAfter, caption: pair.caption }, slug, 'After'));
          count += 2;
        });
      }

      (service.singles || []).forEach(function (item) {
        html.push(photoMarkup(item, slug));
        count += 1;
      });
    });

    if (!count) {
      el.innerHTML = '';
      el.hidden = true;
      var empty = document.querySelector('[data-pg-gallery-empty]');
      if (empty) empty.hidden = false;
      return;
    }

    el.hidden = false;
    el.innerHTML = html.join('');
  }

  // <div data-pg-photo="tree-surgery"></div> — one representative image
  function renderPhoto(el) {
    var slug = el.dataset.pgPhoto;
    var service = svc(slug);
    var pick = null;

    if (service.pairs && service.pairs.length) {
      pick = { src: service.pairs[0].after, alt: service.pairs[0].altAfter };
    } else if (service.singles && service.singles.length) {
      pick = service.singles[0];
    }

    if (!pick) {
      el.innerHTML = slot((SERVICE_LABELS[slug] || slug) + ' photo', 'gallery/' + slug + '/photo-01.jpg');
      return;
    }

    el.innerHTML = '<img src="' + esc(pick.src) + '" alt="' + esc(pick.alt) + '" loading="lazy" decoding="async">';
  }

  // <span data-pg-count="photos"></span>
  function renderCount(el) {
    var kind = el.dataset.pgCount;
    var pairs = 0;
    var singles = 0;

    SERVICE_ORDER.forEach(function (slug) {
      var service = svc(slug);
      pairs += (service.pairs || []).length;
      singles += (service.singles || []).length;
    });

    var photos = singles + pairs * 2;
    el.textContent = kind === 'pairs' ? String(pairs) : String(photos);
  }

  /* ------------------------------------------------------------------
     Boot
     ------------------------------------------------------------------ */
  function render() {
    document.querySelectorAll('[data-pg-pairs]').forEach(renderPairs);
    document.querySelectorAll('[data-pg-gallery]').forEach(renderGallery);
    document.querySelectorAll('[data-pg-photo]').forEach(renderPhoto);
    document.querySelectorAll('[data-pg-count]').forEach(renderCount);

    if (window.PG && window.PG.initBeforeAfter) window.PG.initBeforeAfter(document);
    if (window.PG && window.PG.initReveal) window.PG.initReveal();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', render);
  } else {
    render();
  }
})();
