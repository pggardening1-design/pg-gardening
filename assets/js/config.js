/* ==========================================================================
   PG Gardening & Tree Surgeon — site configuration
   THIS IS THE ONE FILE TO EDIT for links and tracking IDs.
   Every value below is deliberately empty until you supply the real thing.
   Nothing here is invented. An empty value makes the site hide or disable
   that feature rather than show something untrue.
   ========================================================================== */
window.PG_CONFIG = {

  /* --- Facebook -------------------------------------------------------
     Paste the full public URL of each page, e.g.
       "https://www.facebook.com/YourPageName"
     Leave "label" as something a customer would understand. */
  facebook: [
    { label: '', url: '' },   // Facebook page 1 — URL needed
    { label: '', url: '' }    // Facebook page 2 — URL needed
  ],

  /* --- Google Business Profile ----------------------------------------
     reviewsUrl : the public link customers use to READ your reviews.
     writeUrl   : the "write a review" short link Google gives you from
                  your Business Profile dashboard ("Ask for reviews").
     mapsUrl    : your listing on Google Maps. */
  google: {
    reviewsUrl: '',
    writeUrl: '',
    mapsUrl: '',
    placeId: ''
  },

  /* --- Google Analytics 4 ---------------------------------------------
     Measurement ID, looks like "G-XXXXXXXXXX".
     Nothing loads until a visitor accepts cookies — see site.js. */
  ga4Id: '',

  /* --- Contact ---------------------------------------------------------
     Filled in by tools/set-contact.mjs. Do not hand-edit only this block:
     the phone numbers also appear in the page HTML and in the JSON-LD, and
     the script updates all of them together. */
  phone1: { number: '', label: '' },
  phone2: { number: '', label: '' },
  email: '',
  domain: ''
};
