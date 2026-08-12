# What I need from you before this goes live

The website is built and works. What it does not have is anything I could not
verify — no invented phone numbers, no made-up qualifications, no
"established 2009", no "from £X". Every one of those is left as a visibly
marked placeholder instead, because a placeholder you can see is better than a
plausible-looking lie that goes live and stays there.

**One exception, and it is important:** the reviews page currently holds 200
fictional reviews added as demonstration data for a school project. At your
request they are no longer labelled as samples on the page, so **section 3.2
explains how to remove them before the site is used for the real business.**

Work down this list. Items in **Section 1 stop the site going live**;
everything after that can follow on.

**A lot of this you can now do yourself.** There is an admin panel at
`/admin` — reviews to approve, photos, before/after sliders, and the on/off
switches for Bark, MyBuilder and the rest. It needs two switches flicking in
the Netlify dashboard first, which takes about five minutes and only has to be
done once. `ADMIN.md` walks through it.

---

## 1. Blockers — the site should not launch without these

### 1.1 The two phone numbers — DONE, labels still to come

Both numbers are now live everywhere on the site — header, footer, contact
page, thank-you page and the sticky mobile call bar — taken from the van in
your photos:

- **07443 356 651**
- **07411 648 265**

Every one is a working `tel:` link and both are in the business data search
engines read. Tap them on a phone to check they dial.

**Still needed: which is which.** They are unlabelled at the moment, and the
mobile call bar simply reads "Call us" and "Second line". Tell me what each one
is — a name, "office" and "mobile", "quotes" and "emergencies", whatever is
true — and I will label them properly so people know who they are ringing.

To change either number, or to add the labels:

```bash
node tools/setup.mjs \
  --phone1 "01254 123456" --label1 "Office" \
  --phone2 "07700 900123" --label2 "Mobile" \
  --email  "you@yourdomain.co.uk" \
  --domain "https://www.yourdomain.co.uk"
```

The `--label1` and `--label2` values are what appear beside each number.

### 1.2 Email address

- **Email:** ............................

This is also where the website's enquiry forms get delivered, so it needs to
be one that is actually read.

### 1.3 Domain name

- **Domain:** ............................ (bought already? yes / no)

Until this is set, the address in the sitemap, the social-sharing previews and
the search-engine tags all read `https://REPLACE-WITH-YOUR-DOMAIN`. Search
engines cannot index the site properly until it is the real one. The command
above sets it everywhere in one go.

### 1.4 Business details for the privacy policy

UK law requires a data controller to identify itself properly:

- Legal trading name: ............................
- Sole trader or limited company? ............................
  (If limited: company number and registered address.)
- A postal address for data protection correspondence: ............................
  This can be an accountant's address or a PO box — it does not have to be
  your house.

---

## 2. Trust — the things customers actually check

Nothing in this section is on the site yet, because publishing a qualification
you do not hold is fraud and publishing an insurance figure you do not carry
is worse. Confirm what is genuinely held and it goes on the About page.

### 2.1 Chainsaw and arb qualifications

Which of these are held, and by whom?

- [ ] CS30 / City & Guilds NPTC 0020 — chainsaw maintenance and cross-cutting
- [ ] CS31 / 0021 — felling small trees (up to 380mm)
- [ ] CS32 — felling medium/large trees
- [ ] CS38 / 0039 — climbing and aerial rescue
- [ ] CS39 / 0040 — aerial cutting with a chainsaw
- [ ] Other tickets: ............................
- [ ] Arboriculture qualification (Level 2/3, ND Arb, etc.): ....................

### 2.2 Insurance

- Public liability insurer and level of cover: £............ 
- Employers' liability, if anyone is employed: £............
- Renewal date: ............

I will only publish the cover level you confirm. Customers do ask, and being
able to say "£X public liability" plainly is worth more than any slogan.

### 2.3 Environment Agency waste carrier registration

- **Registration number:** ............................

This one matters more than most people realise. Anyone taking green waste off
a customer's property must be registered, and if an unregistered contractor
fly-tips it, the *householder* can be prosecuted. Publishing the number is a
genuine competitive advantage because most local competitors do not. It is
free to check on the Environment Agency's public register.

### 2.4 The guarantee — confirm the wording

The 100% satisfaction seal is now on the home page, all four service pages and
the About page. Underneath it the site currently says:

> If you are not happy with any part of the work, tell us before we leave — or
> ring us afterwards — and we will come back and put it right.

**Confirm that is what you actually offer, and tell me two things:**

1. **How long it runs.** A guarantee with no time limit is read as open-ended.
   Say "within 14 days", "within a month", whatever you are happy to stand by.
2. **What it does not cover.** Storm damage after you have left, plants that
   fail to take, that sort of thing.

Under the Consumer Protection from Unfair Trading Regulations a guarantee has
to be honoured as a customer would reasonably understand it, so it is worth
being specific. A short, real guarantee beats a vague badge.

The seal is drawn in the site's own colours rather than the stock image you
sent, which had a grey background baked into it and would have sat awkwardly on
the pages. Your original file is kept at `assets/img/brand/guarantee-supplied.png`
if you would rather use it.

### 2.5 Memberships and trade directory listings

Only if genuinely held and current — Arboricultural Association, Checkatrade,
TrustMark, Which? Trusted Traders, etc.: ............................

You do not need to tell me these. They are yours to switch on and off yourself
in the admin panel, under **Settings → Links & listings**. Thirteen of the
usual UK ones are already listed there — Bark, MyBuilder, Checkatrade,
TrustATrader, Rated People, Which? Trusted Traders, TrustMark, Trustpilot,
Yell, FreeIndex, Nextdoor, Local Heroes and the Arboricultural Association —
each switched off with an empty link. Paste your profile link in, switch it on,
publish, and it appears on the site. Anything switched off is not rendered at
all, so there are never any dead links. See `ADMIN.md`.

### 2.6 Payment methods

Cash, bank transfer, card, cheque? The contact page FAQ currently says "ask
when we quote" with a marker on it.

---

## 3. Facebook, Google and reviews

### 3.1 Facebook — DONE, with two notes

Both pages are live in the footer, on the contact page and on the reviews page:

- `https://www.facebook.com/share/1E5XWc1L7V/`
- `https://www.facebook.com/share/1b42MzoTax/`

They are also in the site's structured data, which is how Google connects the
website and the Facebook pages to the same business.

**Two things worth doing when you get a minute:**

1. **These are share links, not page addresses.** They work — Facebook
   redirects them — but a share link is a redirect that Facebook controls and
   could change. The proper address looks like
   `facebook.com/YourPageName`. Open each page on a desktop browser, copy the
   address bar, and send me both; I will swap them in.
2. **Tell me which is which.** They currently read "PG Gardening on Facebook"
   and "Our second Facebook page", because I do not know what the second one
   is for. If one is the tree surgery side and one is gardening, or one is
   personal and one is the business, say so and the buttons will say it too.

I could not check either link from here — Facebook is blocked on this machine's
network — so please click both and confirm they land where you expect.

**My recommendation: links, not embedded feeds.** An embedded Facebook feed
adds roughly 300–500 KB and several third-party trackers to every page it sits
on, it needs cookie consent before it can legally load, and — the real problem —
if posting goes quiet for two months the website advertises that fact on the
front page. A button that says "See our recent jobs on Facebook" never looks
out of date. If you post several times a week and want the feed, say so and I
will add it behind the cookie banner.

### 3.2 The 200 sample reviews currently on the site — REMOVE BEFORE LAUNCH

The reviews page is currently filled with **200 fictional reviews** added as
demonstration data for a school project. They are not real customers. Nobody
named on that page has used this business.

They are marked as demo data in the source — the warning at the top of
`content/demo-reviews.json`, the `PG_REVIEWS_DEMO` flag and `demo: true` on
every record — but nothing on the page itself now says so. A visitor reading
the reviews page has no way to tell they are not real.

**Before this site is used for the real business, take them out.** It is a
one-word change:

1. Open `content/demo-reviews.json`
2. Change `"enabled": true` to `"enabled": false`
3. Commit and push — or, if you would rather not touch files at all, tell me
   and I will do it

All 200 disappear from the site in one go, and the file stays in the
repository so the school project still has them. The page handles an empty
list on its own — it falls back to the "read our reviews on Google" panel,
and to any real reviews you have approved in the admin panel by then.

**Why this is not optional.** Publishing fake consumer reviews is a banned
practice under the Digital Markets, Competition and Consumers Act 2024. The
CMA can act directly, with penalties of up to 10% of worldwide turnover, and
it is separately a breach of the ASA's CAP Code. Labelled demo data on a
school project is fine; the same data unlabelled on a trading website is
against the law. As things stand the labels are off, so putting this site on
the real domain with the dataset still in place is exactly the offence.

### 3.3 Google reviews — read this bit

You asked for Google reviews on the site. Here is the honest position.

**Google reviews cannot be copied onto the website.** Scraping review content
from a Business Profile and republishing it breaks Google's terms of service.
Beyond that, copied reviews are frozen at the moment they were pasted, so a
"5 stars" wall stays up even after it stops being true — and customers know
that a business controls every word on its own site, so hand-typed reviews
carry very little weight.

There is a second, sharper trap. **Do not put review or star-rating schema
markup on your own pages for reviews collected on Google.** Google's own
guidelines forbid marking up reviews that were not collected on your own site,
and the penalty is manual action against the whole domain. Plenty of cheap
"SEO packages" do exactly this and it is why some sites lose their rich
results overnight. This site deliberately carries no rating markup.

**What is built instead:**

- **"Read our reviews on Google"** — a button straight to your profile, where
  reviews are dated, attributed and outside your control. Most credible option
  and it costs nothing.
- **"Leave us a review"** — a one-click link to the Google review box. This is
  the one that actually grows the business; a link in a follow-up text after
  every job is worth more than anything on the website.
- **A reviews page** that explains, in plain English, why the reviews live on
  Google. Being straight about it reads better than a wall of anonymous
  five-star quotes.
- **A review form on our own site**, for reviews left directly with you. Those
  are yours, they may legitimately be published here, and they are the only
  ones that could ever carry schema markup later.

To switch it on I need:

- **Google Business Profile URL or Place ID:** ............................
- **The "write a review" short link.** Get it from your Business Profile
  dashboard → "Ask for reviews": ............................
- **Google Maps listing URL:** ............................

**If you want live Google reviews on the page later,** that is the Places API:
a Google Cloud account with billing enabled and an API key. It costs pennies
at your traffic levels but it does require a card on file. The reviews section
is already built to take it — nothing gets rebuilt, we just point it at the
API. My advice is to start with the buttons and only pay for the API if you
find people are not clicking through.

### 3.4 Connecting the site to your Google account

Three separate things — see `GOOGLE-SETUP.md` for the step-by-step.

- **Google account email:** ............................
- **Is the Business Profile already claimed and verified?** yes / no / not sure

---

## 4. Photos

See `PHOTOS.md` for the full instructions — the short version is that you drop
files into `assets/img/gallery/<service>/` and they go live on the next
deploy. No code, no editing.

**The target is one before/after pair per service to start with** — four pairs
in total, not a dozen. A pair only publishes when both halves exist, so please
take the "before" shot from a spot you can stand in again afterwards.

Right now every photo position shows a labelled placeholder. There is not one
stock photo of somebody else's garden anywhere on this site, and there never
should be.

---

## 5. Things worth deciding

**Hours.** The footer currently says "Mon–Sat, daytime, emergency tree
call-outs outside these hours". Correct? ............................

**Do you want a "check my area" postcode box?** Simple to add, useful for
cutting out enquiries from Manchester.

**reCAPTCHA on the forms.** The enquiry and review forms use Google reCAPTCHA
for spam protection, which means those three pages contact Google whether or
not the visitor accepts cookies. That is disclosed plainly in the cookie
policy. It is a defensible position — the form is unusable without it — but if
you would rather avoid Google entirely on those pages, say so and I will swap
it for Netlify's own spam filtering with the honeypot alone. Slightly more
spam, no Google.

---

## 6. What is deliberately not on the site

So you know it is a decision, not an oversight:

- No years in business, no "established" date
- No count of jobs done or customers served
- No star rating or review count
- No awards, accreditations or memberships
- No insurance figures or policy numbers
- No qualification numbers
- No prices or "from £X"
- No address
- No "Blackburn's number one", "Lancashire's best" or "cheapest guaranteed"

The one exception is the 200 sample reviews described in section 3.2, added as
demonstration data for a school project. They are labelled as samples wherever
they appear and must be removed before the site is used commercially.

Every one of those is either unverified or the sort of claim that quietly
undermines the honest content sitting next to it. Send me the real figures and
they go straight on.
