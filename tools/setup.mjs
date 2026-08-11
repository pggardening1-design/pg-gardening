#!/usr/bin/env node
/**
 * setup.mjs — puts the real contact details and domain into the website.
 *
 * The site ships with clearly-marked placeholders instead of invented phone
 * numbers, so nothing false can ever go live by accident. This script swaps
 * every placeholder for the real thing in one pass: the header, the footer,
 * the contact page, the sticky mobile call bar, the JSON-LD business data,
 * the sitemap, robots.txt and config.js.
 *
 * Run it from the project folder. You can run it again any time details
 * change — it rewrites its own markers, so it never doubles up.
 *
 * Examples
 * --------
 * Everything at once:
 *
 *   node tools/setup.mjs \
 *     --phone1 "01254 123456" --label1 "Office" \
 *     --phone2 "07700 900123" --label2 "Mobile" \
 *     --email  "info@example.co.uk" \
 *     --domain "https://www.example.co.uk"
 *
 * Just the domain, later on:
 *
 *   node tools/setup.mjs --domain "https://www.example.co.uk"
 *
 * Check what it would do without writing anything:
 *
 *   node tools/setup.mjs --domain "https://www.example.co.uk" --dry-run
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DOMAIN_PLACEHOLDER = 'https://REPLACE-WITH-YOUR-DOMAIN';

/* ---------------------------------------------------------------- args --- */
const args = {};
for (let i = 2; i < process.argv.length; i++) {
  const a = process.argv[i];
  if (!a.startsWith('--')) continue;
  const key = a.slice(2);
  if (key === 'dry-run') { args.dryRun = true; continue; }
  args[key] = process.argv[++i];
}
const DRY = Boolean(args.dryRun);

if (!args.phone1 && !args.phone2 && !args.email && !args.domain) {
  console.log(readFileSync(new URL(import.meta.url)).toString().split('*/')[0].replace(/^\/\*\*?/, ''));
  process.exit(0);
}

/* ------------------------------------------------------------- helpers --- */

/** UK number to a dialable E.164 form: 01254 123456 -> +441254123456 */
function toTel(raw) {
  const digits = String(raw).replace(/[^\d+]/g, '');
  if (digits.startsWith('+')) return digits;
  if (digits.startsWith('00')) return '+' + digits.slice(2);
  if (digits.startsWith('0')) return '+44' + digits.slice(1);
  return digits;
}

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/** Replaces everything between <!--TAG--> and <!--/TAG-->, markers included. */
function replaceBlock(text, tag, replacement) {
  const re = new RegExp(`<!--${tag}-->[\\s\\S]*?<!--/${tag}-->`, 'g');
  return text.replace(re, `<!--${tag}-->${replacement}<!--/${tag}-->`);
}

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    if (['.git', 'node_modules', 'tools'].includes(name)) continue;
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walk(full, out);
    else if (['.html', '.xml', '.txt', '.js'].includes(extname(name))) out.push(full);
  }
  return out;
}

/* -------------------------------------------------------------- markup --- */
const PHONE_ICON =
  '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
  'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 ' +
  '19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 ' +
  '1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 ' +
  '2.8.7a2 2 0 0 1 1.7 2Z"/></svg>';

function inlinePhone(number, label) {
  const tel = toTel(number);
  const aria = label ? `${label}: ${number}` : `Call ${number}`;
  return `<a class="tel" href="tel:${esc(tel)}" aria-label="${esc(aria)}">` +
    (label ? `<span class="tel__label">${esc(label)}:</span> ` : '') +
    `<strong>${esc(number)}</strong></a>`;
}

function barPhone(number, label, fallback) {
  const tel = toTel(number);
  // Without a label the two buttons would both read the same, so the second
  // one falls back to "Second line" rather than repeating "Call us".
  return `<a href="tel:${esc(tel)}" aria-label="Call ${esc(label || number)}">${PHONE_ICON}` +
    `<span>${esc(label || fallback)}</span><small>${esc(number)}</small></a>`;
}

/* --------------------------------------------------------------- apply --- */
const files = walk(ROOT);
let changed = 0;
const summary = [];

for (const file of files) {
  const original = readFileSync(file, 'utf8');
  let text = original;

  if (args.phone1) {
    text = replaceBlock(text, 'PHONE1', inlinePhone(args.phone1, args.label1));
    text = replaceBlock(text, 'PHONE1BAR', barPhone(args.phone1, args.label1, 'Call us'));
  }
  if (args.phone2) {
    text = replaceBlock(text, 'PHONE2', inlinePhone(args.phone2, args.label2));
    text = replaceBlock(text, 'PHONE2BAR', barPhone(args.phone2, args.label2, 'Second line'));
  }
  if (args.email) {
    text = replaceBlock(text, 'EMAIL',
      `<a href="mailto:${esc(args.email)}">${esc(args.email)}</a>`);
  }

  // Structured data: only ever written with numbers that were actually given.
  if (args.phone1 || args.phone2) {
    const tels = [args.phone1, args.phone2].filter(Boolean).map((n) => `"${toTel(n)}"`);
    text = text.replace(/"telephone":\s*\[[^\]]*\]/g, `"telephone": [${tels.join(', ')}]`);
  }
  if (args.email) {
    text = text.replace(/"email":\s*"[^"]*"/g, `"email": "${args.email}"`);
  }

  if (args.domain) {
    const domain = args.domain.replace(/\/+$/, '');
    text = text.split(DOMAIN_PLACEHOLDER).join(domain);
  }

  // config.js keeps its own copy for the JavaScript side of the site.
  if (file.endsWith('assets/js/config.js') || file.endsWith('assets\\js\\config.js')) {
    if (args.phone1) {
      text = text.replace(/phone1:\s*\{[^}]*\}/,
        `phone1: { number: '${args.phone1}', label: '${args.label1 || ''}' }`);
    }
    if (args.phone2) {
      text = text.replace(/phone2:\s*\{[^}]*\}/,
        `phone2: { number: '${args.phone2}', label: '${args.label2 || ''}' }`);
    }
    if (args.email) text = text.replace(/email:\s*'[^']*'/, `email: '${args.email}'`);
    if (args.domain) text = text.replace(/domain:\s*'[^']*'/, `domain: '${args.domain}'`);
  }

  if (text !== original) {
    changed++;
    summary.push(file.replace(ROOT + '/', ''));
    if (!DRY) writeFileSync(file, text, 'utf8');
  }
}

console.log(`${DRY ? '[dry run] would update' : 'Updated'} ${changed} file(s).`);
if (summary.length) console.log(summary.map((f) => '  ' + f).join('\n'));

if (args.phone1 || args.phone2) {
  console.log('\nCheck the tel: links dial correctly from an actual phone:');
  if (args.phone1) console.log(`  ${args.phone1} -> tel:${toTel(args.phone1)}`);
  if (args.phone2) console.log(`  ${args.phone2} -> tel:${toTel(args.phone2)}`);
}
if (!args.domain) {
  console.log(`\nThe domain is still ${DOMAIN_PLACEHOLDER} — the sitemap and social`);
  console.log('previews need the real one before launch. Re-run with --domain when you have it.');
}
