# PG Gardening & Tree Surgeon

Website for a gardening and tree surgery business in Blackburn, Lancashire.

Plain HTML, CSS and vanilla JavaScript. No framework, no bundler, nothing to
compile. Open a file in a browser and it works.

---

## Start here

| If you want to… | Read |
|---|---|
| Add job photos | **[PHOTOS.md](PHOTOS.md)** |
| Know what still needs supplying | **[NEEDED-FROM-YOU.md](NEEDED-FROM-YOU.md)** |
| Set up Business Profile, Search Console, Analytics | **[GOOGLE-SETUP.md](GOOGLE-SETUP.md)** |

---

## Putting the real details in

The site ships with visible placeholders instead of invented phone numbers.
One command replaces every one of them — header, footer, contact page, sticky
mobile call bar, structured data, sitemap and `config.js`:

```bash
node tools/setup.mjs \
  --phone1 "01254 123456" --label1 "Office" \
  --phone2 "07700 900123" --label2 "Mobile" \
  --email  "you@yourdomain.co.uk" \
  --domain "https://www.yourdomain.co.uk"
```

Add `--dry-run` to see what it would change without changing anything. Run it
again whenever a detail changes.

---

## What is where

```
index.html              Home
services/               Services hub + four service pages
areas/                  Areas hub + 17 town and village pages
gallery.html            Every photo, and every before/after pair
reviews.html            Reviews, and the "leave a review" form
about.html              About
contact.html            Contact and the main quote form
privacy-policy.html     UK GDPR / DPA 2018 privacy policy
cookie-policy.html      Cookie policy, with a live consent switch
thank-you.html          Form confirmation (noindex)
404.html                Not found (noindex)

assets/css/styles.css   All styling
assets/js/site.js       Navigation, reveals, sliders, lightbox, consent
assets/js/media.js      Renders photos from the manifest
assets/js/reviews.js    Renders reviews, wires up Google and Facebook links
assets/js/config.js     ← the file to edit: links and tracking IDs
assets/js/reviews-data.js   Reviews left on our own site
assets/js/photo-manifest.js Auto-generated — do not edit
assets/img/gallery/     Job photos go here (see PHOTOS.md)

tools/scan-photos.mjs   Rebuilds the photo manifest (runs on deploy)
tools/setup.mjs         Writes real contact details into the site
```

### The two files you will actually edit

- **`assets/js/config.js`** — Facebook URLs, Google Business Profile links,
  GA4 measurement ID. Anything left empty is hidden on the site rather than
  shown as a dead link.
- **`assets/js/reviews-data.js`** — reviews left with you directly. Read the
  notes at the top: Google reviews must not be copied in here.

---

## Running it locally

Any static server will do. The pages use root-relative paths (`/assets/...`),
so opening the HTML files directly off the disk will not load the CSS —
serve them instead:

```bash
npx serve .          # then open http://localhost:3000
# or
python3 -m http.server 8000
```

To preview photos before pushing:

```bash
node tools/scan-photos.mjs
```

---

## Deploying

Hosted on Netlify from this repository. Push to the deployment branch and it
rebuilds.

`netlify.toml` sets one build command:

```
node tools/scan-photos.mjs
```

That regenerates the photo manifest, which is what makes "drop a photo in the
folder and it goes live" true. There is no other build step.

### Forms

Three Netlify forms: `quick-quote` (home page), `quote` (contact page) and
`review` (reviews page). All three have a honeypot field and reCAPTCHA.

**After the first deploy, turn on email notifications:** Netlify → Forms →
Settings → Form notifications → add an email notification. Without it,
enquiries collect in the dashboard and nobody sees them.

---

## Notes for whoever works on this next

- **British English throughout** — organise, colour, metre, licence (noun) /
  license (verb), kerb, tyre. Prices in £, dates DD/MM/YYYY, UK phone formats.
- **Nothing invented**, with one flagged exception. No years in business, job
  counts, awards, accreditations, insurance figures, qualification numbers,
  prices or addresses appear anywhere unless the owner has confirmed them.
  Where one is needed it is a visible `.pending` marker. Please keep it that
  way.
- **`reviews-data.js` currently holds 200 fictional demo reviews** added for a
  school project. They are marked in the source only — the header warning,
  `PG_REVIEWS_DEMO` and `demo: true` on each record — and at the owner's
  request nothing on the page says so, though demo records do print no
  provenance line rather than claiming they were left on this site. Publishing
  unlabelled fake reviews is illegal in the UK under the DMCC Act 2024, so
  clear the dataset before this goes on a live commercial domain: set the flag
  to false and `PG_REVIEWS` to `[]`. See NEEDED-FROM-YOU.md section 3.2.
- **No review or rating schema.** Google's guidelines forbid marking up
  reviews collected on Google, and it risks a manual penalty. The site
  carries `LocalBusiness`, `Service`, `BreadcrumbList` and `FAQPage` markup
  only.
- **Consent before analytics.** No analytics cookie is set and no Google
  script is fetched until the visitor presses accept. Do not "simplify" this
  into a notice bar — that is not valid consent under UK law.
- **A before/after pair is never shown half-finished.** The manifest builder
  drops any unmatched pair and warns in the deploy log.
- **Accessibility:** every text/background pair meets WCAG AA contrast, the
  whole site is keyboard navigable, the before/after sliders work with arrow
  keys, and everything animated respects `prefers-reduced-motion`.
- **Layout is verified at 320, 390, 768, 1024 and 1440px** with no horizontal
  scrolling at any width. If you add a grid, use
  `minmax(min(280px, 100%), 1fr)` rather than a bare `minmax(280px, 1fr)` —
  the bare version forces the page wider than a small phone screen.
