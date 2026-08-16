# Connecting the website to Google

"Connect the site to our Google account" is really three separate jobs. They
do different things and you need all three. None of them can be done from the
website's code alone — each needs someone signed in to your Google account —
so this is the step-by-step.

Do them in this order. Budget about half an hour, plus a wait for the postcard
if the Business Profile is not verified yet.

Have ready: the Google account email, the domain name, and access to the
domain's DNS (wherever you bought it — 123 Reg, GoDaddy, Namecheap) and to
Netlify.

---

## 1. Google Business Profile — the one that actually brings the phone calls

This is what puts you on Google Maps and in the local results with the map
pins. For a local trade it is worth more than everything else on this page put
together.

### If the profile is not claimed yet

1. Go to <https://business.google.com> and sign in with the business Google
   account.
2. "Manage now" → search for **PG Gardening & Tree Surgeon**. If a listing
   already exists, claim it rather than creating a second one — duplicates
   split your reviews and hurt your ranking.
3. Business category: **Tree service** as primary. Add **Landscaper**,
   **Gardener** and **Pressure washing service** as secondary categories.
4. **Do not add a street address if you work from home.** Choose "I deliver
   goods and services to my customers" and set a service area instead —
   Blackburn, Darwen, Accrington, Clitheroe, Whalley, Burnley, Preston,
   Chorley and the rest. A home address on a public listing is a genuine
   nuisance you cannot easily undo.
5. Add both phone numbers, the opening hours and the website address.
6. Verify. Usually a postcard to the address on file (5–14 days), sometimes
   phone or video. **Nothing shows on Maps until this is done.**

### Once it is verified

- Put the website address in: Edit profile → Contact → Website.
- Add photos. Google's own data says listings with photos get materially more
  clicks, and the before/after shots you are taking for the website work here
  too. Add new ones regularly.
- Set the service area properly. It is the main thing deciding whether you
  appear for someone searching in Clitheroe.
- Grab your **review link**: Business Profile → "Ask for reviews". You get a
  short link like `https://g.page/r/XXXXXXXX/review`. That is the one to text
  customers after a job, and it goes in `assets/js/config.js` so the "Leave us
  a review" buttons work.

### Getting reviews, which is the whole game

Send the review link by text the same day you finish, while they are still
looking at the garden. One line: *"Thanks again — if you were happy with it,
a quick review really helps us: [link]"*. Do not offer anything in exchange,
do not bulk-request, and never write them yourself: Google filters fake
reviews aggressively and can suspend the listing.

---

## 2. Google Search Console — what you rank for

Free, and it is the only way to see which searches bring people to the site.

1. Go to <https://search.google.com/search-console>, sign in.
2. "Add property" → choose **Domain** (the left-hand box). It covers `www` and
   non-`www` and `http` and `https` in one go.
3. It gives you a **TXT record** to add to your DNS.
4. If the domain's DNS is managed at Netlify: Netlify dashboard → Domains →
   your domain → DNS records → Add record → type **TXT**, name `@`, value =
   the string Google gave you. If DNS is at your registrar, add it there in
   the same way.
5. Back in Search Console, click Verify. DNS can take anywhere from a few
   minutes to a few hours to propagate — if it fails, wait and try again
   rather than starting over.
6. Once verified: **Sitemaps** → submit `sitemap.xml`.

The sitemap is generated already and lists all 30 public pages. It will point
at the right domain as soon as `tools/setup.mjs` has been run with `--domain`.

Check it about a month after launch. "Performance" shows the actual search
terms people used — that is real evidence about which services and which towns
to write more about, rather than guesswork.

---

## 3. Google Analytics 4 — visitor numbers

Optional. Worth having, but do the two above first.

1. <https://analytics.google.com> → Admin → Create → Property.
2. Name it, set the time zone to **United Kingdom** and currency to **£**
   (get these right at the start; they cannot be changed afterwards).
3. Create a **Web** data stream for your domain.
4. Copy the **Measurement ID** — it looks like `G-XXXXXXXXXX`.
5. Open `assets/js/config.js` and put it in:

   ```js
   ga4Id: 'G-XXXXXXXXXX',
   ```

6. Commit and push. That is all — no tag manager, no extra script in the HTML.

### How consent works on this site, and why it matters

Analytics does not load until a visitor presses **"Accept analytics cookies"**
on the banner. Not a reduced version, not anonymised-anyway — the Google
script is not even downloaded. Press reject, or ignore the banner, and nothing
loads at all.

That is deliberate and it is what UK law (PECR, alongside UK GDPR) actually
requires. The common "by continuing to use this site you agree to cookies"
bar is **not valid consent** and the ICO has said so repeatedly. It is worth
knowing that the version on this site is the compliant one, because the other
sort is everywhere.

The practical consequence: your visitor numbers will be lower than a site that
fires analytics at everyone, because you are only counting people who agreed.
Those numbers are still perfectly good for comparing months and pages — just
do not compare them against a site that is doing it improperly.

---

## 4. After launch — a short checklist

- [ ] `tools/setup.mjs` run with the real numbers, email and domain
- [ ] Site deployed to Netlify on the real domain, HTTPS on (Netlify does this
      automatically with Let's Encrypt)
- [ ] Business Profile claimed, verified, website address added
- [ ] Search Console verified and `sitemap.xml` submitted
- [ ] GA4 ID in `config.js`, and the banner checked: reject → no Google
      requests, accept → analytics appears in the GA4 realtime view
- [ ] Enquiry form sent as a test, and the email actually arrived
- [ ] Netlify → Forms → Notifications set to email you on every submission
      (**do this — without it, submissions sit in the Netlify dashboard and
      nobody sees them**)
- [ ] Both phone numbers tapped on a real phone to confirm they dial
- [ ] Facebook page links added to `config.js`
- [ ] Review link tested from a phone that has not reviewed you before
