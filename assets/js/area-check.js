/* ==========================================================================
   PG Gardening & Tree Surgeon — "do we cover your postcode?"

   Checks the outward half of a UK postcode (the BB1 in BB1 7DP) against the
   districts the seventeen towns on this site actually sit in. Everything is
   worked out in the browser: no lookup service, no address data leaving the
   page, nothing to consent to.

   The answers are deliberately only ever "yes", "worth asking" or "outside the
   area". A postcode district is not a fence — a job at the far edge of PR4 may
   be an hour from Blackburn — so nothing here promises a visit. It sorts the
   obvious yeses from the obvious noes and points the rest at the phone.
   ========================================================================== */
(function () {
  'use strict';

  /* Outward code -> the towns on this site that sit in it. Only districts
     containing a town we actually name are listed. */
  var COVERED = {
    BB1: 'Blackburn, Rishton and Wilpshire',
    BB2: 'Blackburn and Mellor',
    BB3: 'Darwen',
    BB5: 'Accrington and Oswaldtwistle',
    BB6: 'Great Harwood and Langho',
    BB7: 'Clitheroe and Whalley',
    BB10: 'Burnley',
    BB11: 'Burnley',
    BB12: 'Burnley and Padiham',
    PR1: 'Preston',
    PR2: 'Preston',
    PR3: 'Longridge and Ribchester',
    PR4: 'Preston',
    PR5: 'Preston',
    PR6: 'Chorley',
    PR7: 'Chorley'
  };

  /* Postcode areas next door to the ones we work in. Not a yes, not a no. */
  var NEARBY = ['BB', 'PR', 'BL', 'FY', 'WN', 'OL', 'LA'];

  function normalise(raw) {
    return String(raw || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
  }

  /* The outward code is everything except the last three characters of a full
     postcode. Somebody who types only "BB1" gets taken at their word. */
  function outward(clean) {
    var code = clean.length >= 5 ? clean.slice(0, clean.length - 3) : clean;
    return /^[A-Z]{1,2}[0-9]{1,2}[A-Z]?$/.test(code) ? code : null;
  }

  function verdict(raw) {
    var clean = normalise(raw);
    if (!clean) {
      return { state: 'error', message: 'Pop your postcode in the box and we will check it.' };
    }

    var code = outward(clean);
    if (!code) {
      return {
        state: 'error',
        message: 'That does not look like a UK postcode. The first half is enough — BB1, PR6, and so on.'
      };
    }

    if (COVERED[code]) {
      return {
        state: 'yes',
        message: 'Yes — ' + code + ' is ' + COVERED[code] + ', and we are there regularly. ' +
          'Ring us or send the form and we will come and look at the job.'
      };
    }

    var area = code.replace(/[0-9].*$/, '');
    if (NEARBY.indexOf(area) !== -1) {
      return {
        state: 'maybe',
        message: 'Just outside the towns we list, but not far. Ring and ask — for tree work, ' +
          'hedge runs and clearances we travel further, and we would rather tell you straight ' +
          'on the phone than guess from a postcode.'
      };
    }

    return {
      state: 'no',
      message: 'That is outside the part of Lancashire we work in, so we would be no use to you ' +
        '— and somebody local will do you a better job for less travel.'
    };
  }

  function init() {
    document.querySelectorAll('[data-area-check]').forEach(function (block) {
      var form = block.querySelector('form');
      var input = block.querySelector('input');
      var result = block.querySelector('[data-area-result]');
      if (!form || !input || !result) return;

      form.addEventListener('submit', function (event) {
        event.preventDefault();
        var answer = verdict(input.value);
        result.className = 'area-check__result is-' + answer.state;
        result.textContent = answer.message;
        result.hidden = false;
      });

      // Clear the old answer as soon as they start typing a new postcode, so a
      // stale "yes" is never sitting under a different postcode.
      input.addEventListener('input', function () {
        if (!result.hidden) result.hidden = true;
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
