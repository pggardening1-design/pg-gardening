# Adding photos

There are two ways, and they both end up in the same place.

**The easy one:** log in to the admin panel at `/admin` and use **Photos** or
**Before &amp; after pairs**. Upload from your phone, fill in the boxes, press
Publish. Nothing else to do. See [ADMIN.md](ADMIN.md).

**The bulk one:** if you have forty photos to add at once, dropping the files
straight into the folders below is far quicker than doing them one at a time.
That is what the rest of this page is about. You do not need to touch any code
— drop the picture into the right folder with the right name and it appears on
the website.

---

## The four folders

```
assets/img/gallery/tree-surgery/
assets/img/gallery/hedge-cutting/
assets/img/gallery/garden-work/
assets/img/gallery/power-washing/
```

## The three filenames

Inside any of those folders:

| Filename | What it does |
|---|---|
| `before-01.jpg` + `after-01.jpg` | A **matched pair**. Shows as a drag-across slider on the home page, that service's page, the area pages and the gallery. |
| `photo-01.jpg` | A **single photo**. Shows in the gallery grid and on that service's page. |
| anything else | Still published, treated as a single photo. |

The number can be anything — `01`, `02`, `17` — as long as a `before-` has an
`after-` with the same number. Add as many as you like:

```
assets/img/gallery/power-washing/before-01.jpg
assets/img/gallery/power-washing/after-01.jpg
assets/img/gallery/power-washing/before-02.jpg
assets/img/gallery/power-washing/after-02.jpg
assets/img/gallery/power-washing/photo-01.jpg
```

`.jpg`, `.jpeg`, `.png`, `.webp` and `.avif` all work.

---

## The one rule that is enforced for you

**A before is never shown without its after.**

If you upload `before-01.jpg` and forget `after-01.jpg`, the site does not
publish half a pair and it does not pad it out with a placeholder — the pair
simply waits until both halves exist. The deploy log tells you which one is
missing.

Until a service has a real pair, the site shows a clearly labelled
"photo needed" placeholder there. It is obvious to you and honest to a
customer; it never pretends to be a finished job.

---

## Getting the two halves to match

The slider only works properly if both photos are of the same thing:

- **Stand in the same spot.** Same distance, same angle, same height. Take the
  "before" from a position you can find again — a corner of the patio, the
  back door step.
- **Same orientation.** Both landscape, or both portrait. Do not mix.
- **Similar light if you can.** A before in bright sun and an after in the rain
  makes the work look worse than it was.
- **Take the before shot first.** Once the chipper is running it is too late.
- **Keep the frame clean.** No house numbers, no car registrations, no people.
  That is a promise made in the privacy policy.

---

## Captions (optional)

Photos publish fine with no caption. To add your own wording, edit
`assets/img/gallery/captions.json`:

```json
{
  "power-washing/before-01.jpg": {
    "alt": "A block-paved drive covered in green algae with moss in the joints",
    "caption": "Wilpshire — block paving, washed and re-sanded",
    "title": "Driveway in Wilpshire"
  }
}
```

- `alt` — describes the photo for anyone using a screen reader, and shows if
  the image fails to load. Worth writing.
- `caption` — the line printed under the photo.
- `title` — the heading over a before/after pair.

Leave the file alone and the site writes sensible defaults itself.

---

## Making them load quickly

Photos straight off a phone are usually 3–6 MB, which is slow on mobile data.
Before uploading:

1. Resize the longest edge to about **1600 pixels**.
2. Save as JPEG at around **80% quality**, or convert to WebP.
3. Aim for under **300 KB** per photo.

[Squoosh](https://squoosh.app) does both in a browser, free, with nothing to
install. Drag the photo in, set quality, download.

Photos are lazy-loaded, so ones further down a page only download when someone
scrolls to them.

---

## Putting them live

**If you use GitHub in a browser:** open the folder, "Add file" → "Upload
files", drag them in, commit. Netlify rebuilds and they are live in a minute
or two.

**If you work on the files locally:** commit and push as usual.

Either way the scan runs automatically on deploy — that is what
`node tools/build-content.mjs` in `netlify.toml` is doing. You never run it by
hand unless you want to preview locally:

```bash
node tools/build-content.mjs   # rebuilds assets/js/photo-manifest.js
```

It prints what it found and warns about any unmatched before/after:

```
photo-manifest.js written: 2 before/after pair(s), 5 standalone photo(s).

Warnings:
  - power-washing: before-02 has no matching after-02. Pair not published.
```

---

## Removing a photo

Delete the file. The next deploy takes it off the site. If a customer asks for
a photo of their garden to be taken down, that is all it takes — and the
privacy policy says we will do it without asking why.
