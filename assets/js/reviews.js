/* ==========================================================================
   PG Gardening & Tree Surgeon — reviews rendering
   Renders reviews collected on this site, and wires up the Google / Facebook
   buttons from config.js. Anything not yet configured is shown as a clearly
   marked placeholder rather than a dead link.
   ========================================================================== */
(function () {
  'use strict';

  var REVIEWS = (window.PG_REVIEWS || []).filter(function (r) { return r && r.consent !== false; });
  var CONFIG = window.PG_CONFIG || {};

  /* Demo mode. While this is on, the reviews are invented sample data for a
     school project and the page says so out loud — a warning that lives only
     in a source comment is invisible to whoever is reading the website, and
     unlabelled fake reviews on a real trading site are illegal in the UK
     under the Digital Markets, Competition and Consumers Act 2024.
     Turn it off by setting PG_REVIEWS_DEMO to false in reviews-data.js. */
  var DEMO = window.PG_REVIEWS_DEMO === true;

  var SERVICE_LABELS = {
    'tree-surgery': 'Tree surgery',
    'hedge-cutting': 'Hedge cutting',
    'garden-work': 'Garden work',
    'power-washing': 'Power washing'
  };

  function esc(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function ukDate(iso) {
    if (!iso) return '';
    var parts = String(iso).split('-');
    if (parts.length !== 3) return esc(iso);
    return parts[2] + '/' + parts[1] + '/' + parts[0];
  }

  function stars(rating) {
    var n = Math.max(0, Math.min(5, Math.round(Number(rating) || 0)));
    var filled = '';
    for (var i = 0; i < 5; i++) filled += i < n ? '★' : '☆';
    return '<p class="review__stars" role="img" aria-label="' + n + ' out of 5 stars">' + filled + '</p>';
  }

  function reviewMarkup(review) {
    var meta = [review.area, SERVICE_LABELS[review.service] || review.service].filter(Boolean).join(' · ');
    var isDemo = DEMO || review.demo === true;
    return '' +
      '<article class="review reveal" ' +
        'data-service="' + esc(review.service || '') + '"' + (isDemo ? ' data-demo="true"' : '') + '>' +
        stars(review.rating) +
        '<p class="review__text">' + esc(review.text) + '</p>' +
        '<p class="review__meta"><strong>' + esc(review.name || 'Customer') + '</strong>' +
          esc(meta) + (review.date ? ' · ' + ukDate(review.date) : '') + '</p>' +
        // Provenance is only stated for reviews genuinely collected here. Demo
        // records carry the data-demo attribute above and print no claim.
        (isDemo ? '' : '<span class="review__source">Left on this website</span>') +
      '</article>';
  }

  function renderReviews() {
    document.querySelectorAll('[data-pg-reviews]').forEach(function (el) {
      var limit = Number(el.dataset.limit || 0);
      var filter = el.dataset.pgReviews;
      var list = REVIEWS.slice();

      if (filter && filter !== 'all') {
        list = list.filter(function (r) { return r.service === filter; });
      }
      list.sort(function (a, b) { return String(b.date || '').localeCompare(String(a.date || '')); });
      if (limit > 0) list = list.slice(0, limit);

      if (!list.length) {
        el.hidden = true;
        var block = el.closest('[data-reviews-block]') || document;
        block.querySelectorAll('[data-pg-reviews-empty]').forEach(function (e) { e.hidden = false; });
        return;
      }

      el.hidden = false;
      el.innerHTML = list.map(reviewMarkup).join('');
      var parent = el.closest('[data-reviews-block]') || document;
      parent.querySelectorAll('[data-pg-reviews-empty]').forEach(function (e) { e.hidden = true; });
    });

    document.querySelectorAll('[data-pg-review-count]').forEach(function (el) {
      el.textContent = String(REVIEWS.length);
    });
  }

  /* Google buttons ---------------------------------------------------- */
  function wireGoogle() {
    var google = CONFIG.google || {};
    var map = {
      reviews: { url: google.reviewsUrl, need: 'Google Business Profile link needed' },
      write: { url: google.writeUrl, need: 'Google "write a review" link needed' },
      maps: { url: google.mapsUrl, need: 'Google Maps listing link needed' }
    };

    document.querySelectorAll('[data-google-link]').forEach(function (el) {
      var entry = map[el.dataset.googleLink];
      if (entry && entry.url) {
        el.href = entry.url;
        el.setAttribute('rel', 'noopener');
        el.setAttribute('target', '_blank');
        el.hidden = false;
        return;
      }
      // Not configured yet — replace the link with an honest placeholder.
      var note = document.createElement('span');
      note.className = 'pending';
      note.textContent = entry ? entry.need : 'Link needed';
      el.replaceWith(note);
    });
  }

  /* Facebook links ---------------------------------------------------- */
  var FB_ICON = '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">' +
    '<path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5 3.66 9.15 8.44 9.94v-7.03H7.9v-2.9h2.54V9.85c0-2.52 1.5-3.91 3.77-3.91 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.78-1.63 1.57v1.89h2.78l-.45 2.9h-2.33V22c4.78-.79 8.44-4.94 8.44-9.94Z"/></svg>';

  function wireFacebook() {
    var pages = (CONFIG.facebook || []).filter(function (p) { return p && p.url; });

    document.querySelectorAll('[data-facebook-links]').forEach(function (el) {
      var style = el.dataset.facebookLinks; // "icons" | "buttons"

      if (!pages.length) {
        el.innerHTML = '<span class="pending">Facebook page URLs needed (both pages)</span>';
        return;
      }

      el.innerHTML = pages.map(function (page, i) {
        // Until the owner tells us what each page is for, the second one is
        // described by position rather than given an invented purpose.
        var label = page.label || (i === 0
          ? 'PG Gardening on Facebook'
          : 'Our second Facebook page');
        if (style === 'icons') {
          return '<a href="' + esc(page.url) + '" target="_blank" rel="noopener me" ' +
            'aria-label="' + esc(label) + '">' + FB_ICON + '</a>';
        }
        return '<a class="btn btn--ghost" href="' + esc(page.url) + '" target="_blank" rel="noopener me">' +
          FB_ICON + ' ' + esc(label) + '</a>';
      }).join('');
    });
  }

  /* Trade directories and review sites --------------------------------
     Only the listings switched on in the admin panel reach config.js, so an
     empty list here means the owner has none set up and the whole block is
     removed rather than left as an empty heading. */
  function wireDirectories() {
    var listings = (CONFIG.directories || []).filter(function (d) { return d && d.url && d.name; });

    document.querySelectorAll('[data-directories]').forEach(function (el) {
      var card = el.closest('[data-directories-card]');

      if (!listings.length) {
        if (card) card.remove(); else el.remove();
        return;
      }

      el.innerHTML = listings.map(function (listing) {
        return '<a class="btn btn--ghost" href="' + esc(listing.url) + '" ' +
          'target="_blank" rel="noopener me">' + esc(listing.name) + '</a>';
      }).join('');
      if (card) card.hidden = false;
    });
  }

  function render() {
    renderReviews();
    wireGoogle();
    wireFacebook();
    wireDirectories();
    if (window.PG && window.PG.initReveal) window.PG.initReveal();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', render);
  } else {
    render();
  }
})();
