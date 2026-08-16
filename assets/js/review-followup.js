/* ==========================================================================
   PG Gardening & Tree Surgeon — passing a website review on to Google

   A review written on this site cannot be posted to a Google Business Profile
   automatically. Google has no way to accept one: a review has to be written
   by a signed-in Google account, by the person themselves. Anything claiming
   to post them for you is either faking the account or breaking Google's terms.

   What can be done, and what this file does, is make it one tap for a customer
   who has just written a review here to put the same words on Google. Their
   text is carried over to the thank-you page and offered ready to paste.

   One rule this deliberately follows: the invitation is shown to EVERY
   reviewer, whatever they rated. Showing it only to happy customers is called
   review gating, it is against Google's policies, and under the Digital
   Markets, Competition and Consumers Act 2024 selectively suppressing negative
   feedback is a banned practice in its own right. Do not add a rating check.
   ========================================================================== */
(function () {
  'use strict';

  var KEY = 'pg-review-just-left';

  /* --- on the reviews page: remember what they wrote, for one hop only --- */
  function rememberOnSubmit() {
    var form = document.querySelector('form[name="review"]');
    if (!form) return;

    form.addEventListener('submit', function () {
      try {
        var text = form.querySelector('[name="review"]');
        var name = form.querySelector('[name="name"]');
        // sessionStorage, not localStorage: it belongs to this one visit and
        // should not sit on the customer's machine afterwards.
        sessionStorage.setItem(KEY, JSON.stringify({
          text: text ? text.value : '',
          name: name ? name.value : ''
        }));
      } catch (error) {
        // Private browsing can refuse storage. The thank-you page copes.
      }
    });
  }

  /* Google gives a business two useful links: a one-tap "write a review" short
     link from the Business Profile dashboard, and the profile itself. The
     first is far better — it opens the review box directly. Until it is set,
     send people to the profile rather than showing them a dead placeholder:
     landing on the listing and tapping the stars is one extra step, not a
     wasted journey. This runs before reviews.js, and clears the attribute so
     reviews.js leaves the button alone. */
  function fallbackGoogleLink() {
    var google = (window.PG_CONFIG || {}).google || {};
    if (google.writeUrl || !google.reviewsUrl) return;

    document.querySelectorAll('[data-review-thanks] [data-google-link="write"]').forEach(function (el) {
      el.href = google.reviewsUrl;
      el.target = '_blank';
      el.rel = 'noopener';
      el.textContent = 'Open our Google page';
      el.removeAttribute('data-google-link');

      var hint = document.createElement('p');
      hint.className = 'form-note';
      hint.textContent = 'It opens our listing — tap the stars there to add yours.';
      el.parentNode.insertAdjacentElement('afterend', hint);
    });
  }

  /* --------------------------- on the thank-you page --------------------- */
  function showFollowUp() {
    var block = document.querySelector('[data-review-thanks]');
    if (!block) return;

    var params = new URLSearchParams(window.location.search);
    if (params.get('type') !== 'review') return;

    // Swap the enquiry wording for the review wording.
    document.querySelectorAll('[data-quote-thanks]').forEach(function (el) { el.hidden = true; });
    block.hidden = false;

    var saved = null;
    try {
      saved = JSON.parse(sessionStorage.getItem(KEY) || 'null');
      sessionStorage.removeItem(KEY);
    } catch (error) {
      saved = null;
    }

    var quote = block.querySelector('[data-review-copy]');
    var copyBtn = block.querySelector('[data-copy-review]');

    if (!saved || !saved.text) {
      // Nothing carried over — the offer still stands, just without the paste.
      if (quote) quote.hidden = true;
      if (copyBtn) copyBtn.hidden = true;
      return;
    }

    if (quote) quote.textContent = saved.text;

    if (copyBtn) {
      copyBtn.addEventListener('click', function () {
        var done = function () {
          copyBtn.textContent = 'Copied — now paste it on Google';
          copyBtn.classList.add('is-done');
        };
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(saved.text).then(done, selectInstead);
        } else {
          selectInstead();
        }
      });
    }

    // Older browsers, and anywhere the clipboard is blocked: select the text
    // so a long-press or Ctrl+C still works.
    function selectInstead() {
      if (!quote) return;
      var range = document.createRange();
      range.selectNodeContents(quote);
      var sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
      if (copyBtn) copyBtn.textContent = 'Highlighted — copy it, then open Google';
    }
  }

  function init() {
    rememberOnSubmit();
    fallbackGoogleLink();
    showFollowUp();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
