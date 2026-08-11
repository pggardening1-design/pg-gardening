#!/usr/bin/env node
/**
 * scan-photos.mjs — builds assets/js/photo-manifest.js from whatever image
 * files are sitting in assets/img/gallery/<service>/.
 *
 * You do not need to run this by hand. Netlify runs it on every deploy
 * (see netlify.toml), so dropping a photo into the right folder and pushing
 * is all it takes to put it on the website.
 *
 * Run it locally if you want to preview before pushing:
 *     node tools/scan-photos.mjs
 *
 * Naming rules (this is the whole system):
 *
 *   assets/img/gallery/<service>/before-01.jpg   \  a matched pair — shows as
 *   assets/img/gallery/<service>/after-01.jpg    /  a drag-to-compare slider
 *
 *   assets/img/gallery/<service>/photo-01.jpg       a standalone photo
 *
 * <service> must be one of: tree-surgery, hedge-cutting, garden-work,
 * power-washing. Any number after "before-"/"after-"/"photo-" works
 * (01, 02, 17, whatever) as long as before-NN has a matching after-NN.
 *
 * A "before" with no matching "after" is never published — the site will not
 * show half a pair. It gets reported below as a warning instead.
 */

import { readdirSync, readFileSync, writeFileSync, existsSync, statSync } from 'node:fs';
import { join, dirname, extname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const GALLERY_DIR = join(ROOT, 'assets', 'img', 'gallery');
const CAPTIONS_FILE = join(GALLERY_DIR, 'captions.json');
const OUTPUT_FILE = join(ROOT, 'assets', 'js', 'photo-manifest.js');

const SERVICES = {
  'tree-surgery': 'Tree surgery',
  'hedge-cutting': 'Hedge cutting',
  'garden-work': 'Garden work',
  'power-washing': 'Power washing'
};

const IMAGE_EXTENSIONS = new Set(['.webp', '.jpg', '.jpeg', '.png', '.avif']);

const warnings = [];

function readCaptions() {
  if (!existsSync(CAPTIONS_FILE)) return {};
  try {
    return JSON.parse(readFileSync(CAPTIONS_FILE, 'utf8'));
  } catch (error) {
    warnings.push(`captions.json could not be read (${error.message}). Captions skipped.`);
    return {};
  }
}

function listImages(dir) {
  if (!existsSync(dir) || !statSync(dir).isDirectory()) return [];
  return readdirSync(dir)
    .filter((name) => !name.startsWith('.'))
    .filter((name) => IMAGE_EXTENSIONS.has(extname(name).toLowerCase()))
    .sort((a, b) => a.localeCompare(b, 'en-GB', { numeric: true }));
}

/** Pulls "before"/"after"/"photo" and the trailing number out of a filename. */
function classify(filename) {
  const stem = basename(filename, extname(filename)).toLowerCase();
  const match = stem.match(/^(before|after|photo)[-_ ]?(\d+)?$/);
  if (!match) return null;
  return { kind: match[1], index: match[2] || '01' };
}

function buildService(slug, label, captions) {
  const files = listImages(join(GALLERY_DIR, slug));
  const befores = new Map();
  const afters = new Map();
  const singles = [];

  for (const file of files) {
    const info = classify(file);
    const webPath = `/assets/img/gallery/${slug}/${file}`;
    const key = `${slug}/${file}`;
    const meta = captions[key] || {};

    if (!info) {
      // Unrecognised name — treat it as a standalone photo rather than drop it.
      singles.push({
        src: webPath,
        alt: meta.alt || `${label} carried out by PG Gardening & Tree Surgeon`,
        caption: meta.caption || ''
      });
      continue;
    }

    if (info.kind === 'photo') {
      singles.push({
        src: webPath,
        alt: meta.alt || `${label} carried out by PG Gardening & Tree Surgeon`,
        caption: meta.caption || ''
      });
    } else if (info.kind === 'before') {
      befores.set(info.index, { src: webPath, meta });
    } else {
      afters.set(info.index, { src: webPath, meta });
    }
  }

  const pairs = [];
  for (const [index, before] of [...befores.entries()].sort((a, b) => a[0].localeCompare(b[0], 'en-GB', { numeric: true }))) {
    const after = afters.get(index);
    if (!after) {
      warnings.push(`${slug}: before-${index} has no matching after-${index}. Pair not published.`);
      continue;
    }
    pairs.push({
      id: `${slug}-${index}`,
      before: before.src,
      after: after.src,
      altBefore: before.meta.alt || `${label} — before PG Gardening & Tree Surgeon started work`,
      altAfter: after.meta.alt || `${label} — the same spot after the job was finished`,
      title: before.meta.title || after.meta.title || `${label} — before and after`,
      caption: before.meta.caption || after.meta.caption || ''
    });
  }

  for (const [index] of afters.entries()) {
    if (!befores.has(index)) {
      warnings.push(`${slug}: after-${index} has no matching before-${index}. Pair not published.`);
    }
  }

  return { slug, label, pairs, singles };
}

const captions = readCaptions();
const services = {};
let totalPairs = 0;
let totalSingles = 0;

for (const [slug, label] of Object.entries(SERVICES)) {
  const built = buildService(slug, label, captions);
  services[slug] = built;
  totalPairs += built.pairs.length;
  totalSingles += built.singles.length;
}

const payload = {
  generated: new Date().toISOString(),
  totals: { pairs: totalPairs, singles: totalSingles },
  services
};

const output = `/* AUTO-GENERATED by tools/scan-photos.mjs — do not edit by hand.
   Add photos to assets/img/gallery/<service>/ and this file rebuilds on deploy. */
window.PG_PHOTOS = ${JSON.stringify(payload, null, 2)};
`;

writeFileSync(OUTPUT_FILE, output, 'utf8');

console.log(`photo-manifest.js written: ${totalPairs} before/after pair(s), ${totalSingles} standalone photo(s).`);
if (warnings.length) {
  console.log('\nWarnings:');
  for (const warning of warnings) console.log(`  - ${warning}`);
}
