/**
 * submission-created — puts a submitted review into the admin panel.
 *
 * Netlify calls this by itself every time one of the site's forms is
 * submitted. Only the `review` form is acted on; quote enquiries are left
 * alone and stay in the Netlify Forms inbox where they belong.
 *
 * What it does with a review is write a file into content/reviews/ with
 * `approved: false`. That makes the review show up in the admin panel under
 * "Waiting for approval", and nothing appears on the website until the tick
 * box is switched on by hand.
 *
 * ---------------------------------------------------------------------------
 * This is optional. Without it the site still works exactly as described —
 * reviews arrive in the Netlify Forms inbox and get added in the panel by
 * hand. Turning it on saves that retyping, and needs three environment
 * variables in Netlify (Site configuration → Environment variables):
 *
 *   GITHUB_TOKEN   a fine-grained personal access token with Contents: write
 *                  on this repository, and nothing else
 *   GITHUB_REPO    owner/repository, e.g. tjsservices81-ux/pg-gardening
 *   GITHUB_BRANCH  the branch Netlify deploys from
 *
 * If any of them is missing the function does nothing at all and says so in
 * the deploy log. It never fails a submission: a customer who has just written
 * a nice review must not be shown an error because a token expired.
 * ---------------------------------------------------------------------------
 */

const API = 'https://api.github.com';

/** Anything that is not a letter, digit or dash comes out of a filename. */
function slugify(value, fallback) {
  const slug = String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);
  return slug || fallback;
}

/* The form's dropdown sends the words a customer reads ("Tree surgery"); the
   site's data files use the slug. Anything unrecognised is left blank rather
   than guessed at. */
const SERVICE_SLUGS = {
  'tree surgery': 'tree-surgery',
  'hedge cutting': 'hedge-cutting',
  'garden work': 'garden-work',
  'power washing': 'power-washing',
};

function firstOf(data, names) {
  for (const name of names) {
    if (data[name] != null && String(data[name]).trim() !== '') return String(data[name]).trim();
  }
  return '';
}

export default async (request) => {
  let payload;
  try {
    payload = (await request.json()).payload || {};
  } catch (error) {
    return new Response('ok', { status: 200 });
  }

  const formName = payload.form_name || payload.formName || '';
  if (formName !== 'review') return new Response('ok', { status: 200 });

  const token = process.env.GITHUB_TOKEN;
  const repo = process.env.GITHUB_REPO;
  const branch = process.env.GITHUB_BRANCH;

  if (!token || !repo || !branch) {
    console.log(
      'Review submitted, but GITHUB_TOKEN / GITHUB_REPO / GITHUB_BRANCH are not all set, ' +
        'so it was not filed into content/reviews/. It is still in the Netlify Forms inbox. ' +
        'See netlify/functions/submission-created.mjs.'
    );
    return new Response('ok', { status: 200 });
  }

  const data = payload.data || {};
  const name = firstOf(data, ['name', 'your-name', 'customer']);
  const text = firstOf(data, ['review', 'message', 'text', 'comments']);

  if (!name || !text) {
    console.log('Review submitted with no name or no text — not filed.');
    return new Response('ok', { status: 200 });
  }

  const submittedAt = payload.created_at ? new Date(payload.created_at) : new Date();
  const date = submittedAt.toISOString().slice(0, 10);
  const ratingRaw = Number(firstOf(data, ['rating', 'stars']));
  const consentRaw = firstOf(data, ['consent', 'permission', 'publish']).toLowerCase();

  const serviceRaw = firstOf(data, ['service', 'job']).toLowerCase();

  const review = {
    // False, always. The whole point of this file is that the owner decides.
    approved: false,
    name,
    area: firstOf(data, ['area', 'town', 'location']),
    service:
      SERVICE_SLUGS[serviceRaw] ||
      (Object.values(SERVICE_SLUGS).includes(serviceRaw) ? serviceRaw : ''),
    rating: ratingRaw >= 1 && ratingRaw <= 5 ? Math.round(ratingRaw) : 5,
    date,
    text,
    // A tick box arrives as "on"/"yes"/"true" when ticked and is absent when
    // not, so anything unrecognised is treated as no permission given.
    consent: ['on', 'yes', 'true', '1', 'checked'].includes(consentRaw),
    // The email address the customer gave is deliberately not written here.
    // It is personal data, this file goes into a git repository forever, and
    // the address is already in the Netlify Forms inbox where it is needed.
    notes:
      'Submitted through the website review form on ' +
      submittedAt.toLocaleDateString('en-GB') +
      '. Contact details, if any were given, are in the Netlify Forms inbox. ' +
      'Not shown on the site until the tick box at the top is switched on.',
  };

  const path = `content/reviews/${date}-${slugify(name, 'customer')}-${Date.now().toString(36)}.json`;
  const body = {
    message: `Review submitted on the website by ${name} (waiting for approval)`,
    content: Buffer.from(JSON.stringify(review, null, 2) + '\n', 'utf8').toString('base64'),
    branch,
  };

  try {
    const response = await fetch(`${API}/repos/${repo}/contents/${path}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      console.log(`Could not file the review (${response.status}): ${await response.text()}`);
    } else {
      console.log(`Review from ${name} filed at ${path}, waiting for approval.`);
    }
  } catch (error) {
    console.log(`Could not file the review: ${error.message}`);
  }

  // Always 200. The customer has already seen the thank-you page by now.
  return new Response('ok', { status: 200 });
};
