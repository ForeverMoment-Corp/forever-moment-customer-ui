# SEO

SEO (search engine optimisation) is everything that helps Google find our pages, understand them and show them well in search results and in link previews (WhatsApp, Facebook, Instagram, LinkedIn).

This page explains what is in place and where it lives. Work still to do is in [seo-pending.md](seo-pending.md).

## The short version

| What a guest or search engine sees | What we did |
|---|---|
| A proper title and description in Google results | Every page sets its own title, description and main address (canonical URL) |
| A rich preview card when a link is shared | Every page has preview tags (title, text, image); bots get them without running JavaScript |
| Google knows all our pages | `sitemap.xml` lists every public page and is rebuilt on each build |
| Google ignores private pages | Account, cart, payment, search results and 404 pages are marked "do not index" |
| Google understands what each page is | Structured data says "this is an experience with this price", "these are the breadcrumbs", "these are FAQs" |
| Readable links | `/collection/pre-wedding-shoot-26` and `/category/anniversary-romantic-decoration` instead of ids and `&` signs |
| Pages for "decoration in my city" searches | City landing pages such as `/delhi/birthday-decoration` |
| A faster site (speed counts for ranking) | The first download is 36% smaller; logos are 6–19 KB instead of 61–102 KB |

## 1. Page titles, descriptions and preview tags

Each page tells the browser, Google and link-preview bots:

- **Title**: "Birthday Decoration in Delhi · Forever Moment"
- **Description**: one or two sentences shown under the title in Google
- **Canonical URL**: the one official address of the page, so Google does not treat `/experience/2` and `/experience/birthday-canopy` as two pages
- **Preview tags** (Open Graph / Twitter): title, description and image for share cards
- **Robots**: whether the page may appear in search results

| Pages | Where the text comes from | File |
|---|---|---|
| Home, categories, collections, help, contact | Fixed text in a list | [`src/layouts/CustomerLayout.tsx`](../src/layouts/CustomerLayout.tsx) (`PAGE_SEO`) |
| Experience | Its name, short description, first photo | [`ExperienceView.tsx`](../src/features/experiences/pages/ExperienceDetail/components/ExperienceView.tsx) |
| Category and city pages | The category name and description (plus the city) | [`CategoryExperienceView.tsx`](../src/features/experiences/pages/CategoryExperience/components/CategoryExperienceView.tsx) |
| Collection | The collection and its category | [`SubCategoryExperienceView.tsx`](../src/features/experiences/pages/SubCategoryExperience/components/SubCategoryExperienceView.tsx) |
| Search results, 404 | Marked "do not index" | [`Search`](../src/features/search/pages/Search/index.tsx), [`NotFound`](../src/features/notFound/pages/NotFound/index.tsx) |

The code that writes the tags is [`src/lib/seo.ts`](../src/lib/seo.ts), used through the `useSeo` hook in [`src/hooks/useDocumentTitle.ts`](../src/hooks/useDocumentTitle.ts).

**Adding a new fixed page:** add a line to `PAGE_SEO` in `CustomerLayout.tsx` with its title and description, and `noindex: true` if it is private.

### Defaults in `index.html`

[`index.html`](../index.html) carries the site-wide defaults (description, preview tags, preview image, business details) for any crawler that reads the page before JavaScript runs. The default share image is [`public/og-image.jpg`](../public/og-image.jpg) (1200×630, logo and tagline on the brand background).

### The site address

Canonical URLs, preview tags and the sitemap all need the full site address. It is set once:

```
VITE_SITE_URL=https://forevermoment.com     # in .env
```

Set the same variable in the Vercel project settings so the preview function (below) uses it too.

## 2. Previews for WhatsApp, Facebook and other bots

The site is a JavaScript app: the HTML file itself is almost empty and JavaScript fills it in. Google runs JavaScript, but WhatsApp, Facebook, LinkedIn and others do not, so they would only see the default home-page preview.

To fix that, a small Vercel function, [`api/seo-page.js`](../api/seo-page.js), answers **bots only**, for these addresses:

- `/experience/…`, `/category/…`, `/collection/…` (and old `/subcategory/…` links), `/city/category` pages

It loads the normal page, fills in that page's title, description, photo and structured data from the API, and returns it. People are not affected: [`vercel.json`](../vercel.json) sends only bot user-agents to the function, everyone else gets the normal page instantly. Answers are cached for 10 minutes. If the API is slow or the page is unknown, the bot still gets the normal page with the site defaults.

**To test a preview:** paste a link into the [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/), or send it to yourself on WhatsApp.

## 3. Sitemap and robots.txt

After every build, [`scripts/generate-seo-files.mjs`](../scripts/generate-seo-files.mjs) writes two files into `dist/`:

- **`sitemap.xml`**: every public page: the fixed pages, all categories, collections, experiences (with last-updated dates) and the city landing pages that have something in them. 77 addresses at the time of writing.
- **`robots.txt`**: allows everything except private pages (bookings, profile, cart, support, payment, search) and points to the sitemap.

It reads the catalogue from the public API. If part of the API fails, the rest of the sitemap is still written and the build carries on. Run it on its own with:

```
npm run seo
```

## 4. Structured data

Hidden blocks of [schema.org](https://schema.org) data tell Google exactly what a page is, which can earn richer results:

| Where | What it says |
|---|---|
| Every page (`index.html`) | Who we are: name, website, logo, email |
| Experience | It is a product with this name, description, images, category and price in INR |
| Category, collection, city, experience | Breadcrumbs (Home › Birthday Decoration › …) |
| Help centre | The FAQ questions and answers |

**Deliberately left out:** the star rating (4.8 from 124 reviews) and the "original price / % off" shown on the site. Both are placeholders, not real data, and Google penalises fake review or offer markup. Add them once they come from the API.

## 5. Readable addresses

| Before | Now |
|---|---|
| `/subcategory/26` | `/collection/pre-wedding-shoot-26` (the name, then the id, because collection names repeat across categories) |
| `/category/anniversary-&-romantic-decoration` | `/category/anniversary-romantic-decoration` |
| `/category/photography-` | `/category/photography` |

Old addresses still open the right page, and collections redirect to the new form. All links are built in one place: `categoryPath` and `subCategoryPath` in [`src/components/navbar/navTypes.ts`](../src/components/navbar/navTypes.ts).

## 6. City landing pages

People search "birthday decoration in Delhi", so each city has a page per category: `/delhi/birthday-decoration`, `/delhi/couples-dinning` and so on ([`CityCategory`](../src/features/experiences/pages/CityCategory/index.tsx)).

- Opening one switches the site to that city and shows the category with the city in the heading, title and breadcrumb.
- An unknown city shows the 404 page.
- The sitemap only lists city + category pairs that actually have experiences, so Google never finds an empty page.
- The addresses come from the city and category names in the admin, so renaming them there changes the addresses (see the data fixes in [seo-pending.md](seo-pending.md)).

## 7. Speed

Google ranks faster pages higher, and guests leave slow ones.

| Change | Result |
|---|---|
| Each page's code loads only when it is opened ([`src/router/lazyPage.tsx`](../src/router/lazyPage.tsx)) | Home page download 1,100 KB → 643 KB (329 KB → 209 KB compressed) |
| Thin gold progress bar while a page loads | No "nothing happened" moment on slow connections |
| Logo for the loader: `logo-mark.webp` | 102 KB → 19 KB |
| Logo for the navbar: `logo.webp` | 61 KB → 6 KB |

## 8. A bug this work uncovered

The website loaded each city's experiences from `/public/locations/{id}/experiences`, which returns location settings with **no experience names, ids or links**. Search, and the counts and "From ₹…" prices on the category and collection list pages, had no real data. It now uses `/public/experiences/location/{id}`, the same as the mobile app ([`src/features/experiences/store/api.ts`](../src/features/experiences/store/api.ts)).
