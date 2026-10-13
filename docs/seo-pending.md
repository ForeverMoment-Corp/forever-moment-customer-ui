# SEO: pending work

Things decided to pick up later. What is already done is in [seo.md](seo.md).

## Before going live

These are needed for the work in `seo.md` to take effect.

| # | Task | Who | Notes |
|---|---|---|---|
| 1 | **Confirm the site address** | Product | `VITE_SITE_URL=https://forevermoment.com` in `.env` is an assumption (from the support email and API domains). If the live site is `www.` or another domain, change that one line. |
| 2 | **Set `VITE_SITE_URL` in Vercel** | Dev | Project settings → Environment Variables, so the preview function builds addresses on the real domain. |
| 3 | **Fix the Vercel build command** | Dev | `npm run build` stops at `tsc -b` because of older type errors (unused imports in `HomeView.tsx`, `GiftSlider`, `minGuests` and others), so Vercel must be using another command. Set it to `vite build && npm run seo` so `sitemap.xml` and `robots.txt` are generated, or fix the type errors. |
| 4 | **Check the bot routing on a Preview deployment** | Dev | `curl -A "WhatsApp/2.23" https://<preview>/experience/rose-gold-balloon-birthday-surprise \| grep og:title` should show the experience name. Then `curl -A "WhatsApp/2.23" "https://<preview>/api/seo-page?kind=category&param=birthday-decoration"` must return HTML, not a backend error. If it returns a backend error, the `/api/(.*)` proxy rule in `vercel.json` is catching the function: narrow it to `/api/platform/…`, `/api/payment/…`, `/api/booking/…`. |
| 5 | **Submit the sitemap to Google** | Product | Add the site in [Google Search Console](https://search.google.com/search-console) and submit `https://<site>/sitemap.xml`. Also useful: Bing Webmaster Tools. |

## Data to fix in the admin

These now appear in addresses, Google results and share cards.

| What | Problem | Fix |
|---|---|---|
| City "Bangloare" | Misspelt; gives `/bangloare/birthday-decoration`. Nobody searches for it. | Rename to "Bengaluru" or "Bangalore". The addresses and sitemap follow on the next build. |
| Category "Couples Dinning" | Misspelt ("Dining") | Rename |
| Category "Photography " | Trailing space in the name | Remove the space |
| All 8 categories | No slug, so addresses come from the names | Add short slugs (`birthday-decoration`, `photography`, …) so renaming a category never changes its address |
| Category and collection descriptions | Many are a few words ("Celebrate Birthdays", "Pre-wedding shoot") | Write one or two real sentences each: they become the Google and share-card description |
| "Rose Gold Balloon Birthday Surprise" | Filed under the "Marriage Proposal" collection | Move it to the right collection |

## Backend

| What | Problem |
|---|---|
| `GET /public/experiences` | Returns 500 Internal Server Error. The sitemap works around it by reading each city, but it should be fixed. |
| `GET /public/subcategories` | Takes about 1.6 s. The preview function caches answers, but a faster endpoint helps. |

## Content and trust

| # | Task | Why it matters for SEO |
|---|---|---|
| 1 | **Real contact details** | The WhatsApp (`919876543210`) and phone (`+91 65223651230`) numbers are placeholders (`src/features/help/contact.ts`, `WhatsAppButton.tsx`). Local search ranking depends on the same real name, address and phone everywhere. Once set, add the phone to the business structured data in `index.html` and create a Google Business Profile. |
| 2 | **Remove or replace the placeholder rating** ("4.8 (124)") | Shown on every experience; not real. It is already kept out of structured data, but showing fake reviews is a trust and policy risk. |
| 3 | **Remove the derived "original price / % off"** | Computed as price × 1.25; there is no real offer. Same risk as the rating. |
| 4 | **Terms and Privacy pages** | The login popup links to `/terms` and `/privacy`, which do not exist (they show the 404 page). See `doc/customer-ui-parked.md` in the workspace for the options. |

## Links to the city pages

Google currently finds the city landing pages only through the sitemap. Pages rank better when the site links to them. Ideas:

- On each category page: "Also in Delhi · Bengaluru", linking to `/delhi/<category>` and so on.
- In the footer: "Birthday decoration in Delhi", "Birthday decoration in Bengaluru", …

## The big decision: real HTML for crawlers

Today Google sees a page only after running its JavaScript. The preview function (`api/seo-page.js`) fills in titles and images for bots, but the page body is still empty until JavaScript runs. Three options were compared; **option A is the plan**.

### Option A: pre-render pages at build time (planned)

After the build, a script opens every sitemap address in a headless Chrome running the real app, waits for its data, and saves the finished page (`dist/experience/<slug>/index.html`, …). Vercel serves those files to everyone, so the first byte already has the text, prices, links and structured data.

- **No app rewrite**: the app runs as-is in a real browser.
- **No flash**: the script also saves the loaded data, and the app starts from it, so the first screen matches the saved page.
- **Not pre-rendered**: account, cart, payment and search pages (private or "do not index").
- The preview function stays as a fallback for pages added after the last build.
- **Effort**: about 1–2 days.

**Decisions needed before starting:**

1. **Where the build runs**: headless Chrome often fails inside Vercel's own build machine.
   - **a. (recommended)** Build in GitHub Actions and upload with `vercel deploy --prebuilt`; needs a Vercel token in GitHub.
   - **b.** Try Vercel's build with `@sparticuz/chromium`; no new pipeline, but can break when Vercel updates its build image.
2. **How often pages refresh**: saved pages only change on a rebuild (guests always see live data once the app loads, but Google sees the last build).
   - Nightly rebuild, a deploy hook the admin triggers after publishing, or **both (recommended)**.
3. **City for category / collection pages**: those pages depend on the selected city. Plan: the first active city; city landing pages use their own.

### Option C: server-side rendering (later, if needed)

React Router 7's server mode renders every request on a Node server, so content is always fresh with no rebuilds. It needs data loading moved into route loaders, no `localStorage` / `window` at start-up, a Redux store per request, and a server on Vercel: roughly 1–2 weeks. Worth it if the catalogue grows to thousands of pages or prices change hourly.

## Smaller items

- **Hero image preload**: `index.html` preloads the first *stock* hero photo. When banners come from the admin, that download is wasted; preload the real first banner instead, or drop the preload.
- **Collections in other cities**: city landing pages exist for categories only; `/delhi/<collection>` could follow if city + collection searches matter.
- **More code splitting**: the login popup (with Google sign-in) and animation library still load with the home page.
