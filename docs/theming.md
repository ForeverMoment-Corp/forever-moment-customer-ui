# Theming

Every colour in the customer UI comes from one palette. To change the look of the app, edit the palette; never edit colours inside components.

| What | Where |
|---|---|
| Palette values (all themes) | [`src/styles/theme.scss`](../src/styles/theme.scss) |
| Tailwind colour names (`text-gold`, `bg-ink`, …) | [`src/index.css`](../src/index.css), `@theme inline` block |
| Which theme is active | [`src/lib/theme.ts`](../src/lib/theme.ts) |

## How it works

1. `theme.scss` defines each colour once as a CSS variable on `:root` (the **Classic** theme), e.g. `--gold: #c9a84c`.
2. Extra themes are `[data-theme="<name>"]` blocks in the same file that override some or all of those variables.
3. `src/index.css` registers every variable as a Tailwind colour (`--color-gold: var(--gold)`), so components use `text-gold`, `bg-ink/60`, `border-sand`, or `var(--gold)` in inline styles.
4. On startup, `applyTheme()` in `src/lib/theme.ts` sets `data-theme` on `<html>`. Because components only reference variables, the whole UI follows.

## Switching themes

Set the default for all visitors in `src/lib/theme.ts`:

```ts
export const DEFAULT_THEME: ThemeName = 'blush'; // or 'classic'
```

To preview a theme in the browser, add `?theme=<name>` to the URL:

- `http://localhost:5173/?theme=classic`
- `http://localhost:5173/?theme=blush`

The choice is remembered in that browser (`localStorage` key `fm-theme`) until another `?theme=` is used.

## Changing colours in a theme

| Theme | Edit |
|---|---|
| Classic (base) | The `$…` SCSS values at the top of `theme.scss`, e.g. `$gold: #c9a84c;` |
| Blush & Plum | The `[data-theme="blush"] { … }` block, e.g. `--gold: #b4466b;` |

Change the value and keep the name. Every component refers to these names.

## Palette reference

The names come from the original gold palette. They describe a **role**, not a fixed colour: in the Blush theme, `gold` is a deep rose.

| Token | Role | Typical use |
|---|---|---|
| `ink` | Primary text, dark surfaces | Headings, footer background, dark buttons |
| `ink-soft` | Second dark shade | Gradient ends on dark areas |
| `cocoa` | Body text | Paragraphs, FAQ answers |
| `taupe` | Secondary text | Navbar menu items |
| `umber` | Muted text | Captions, placeholders, small print |
| `gold` | **Main accent** | Accent buttons, icons, active states |
| `gold-bright` | Accent on dark backgrounds | Hover on dark, outlines over photos |
| `gold-dark`, `gold-deep` | Accent as text on light backgrounds | Small caps labels, links |
| `gold-pale`, `gold-light` | Light accent tints | Soft highlights |
| `ivory`, `cream` | Page and card backgrounds | |
| `linen`, `parchment`, `wheat` | Deeper background tints | Stats bar, review cards |
| `sand` | Borders and dividers | Card borders |
| `burgundy`, `burgundy-dark` | Primary buttons on detail pages | Book, Send message |
| `wine`, `rose`, `rose-light`, `coral` | Secondary accents | Badges, tags, cart count |
| `charcoal`, `mid` | Text on detail pages | |
| `sage`, `leaf`, `leaf-light` | Success states | "Save 20%", confirmations |
| `whatsapp` | WhatsApp brand green | Keep unchanged |

`gold`, `ink`, `ivory` and `burgundy` set most of the look. Start with those; the rest are supporting shades.

## Adding a new theme

1. In `theme.scss`, copy the `[data-theme="blush"] { … }` block, rename it (e.g. `[data-theme="ocean"]`) and change the values. Any token you leave out falls back to the Classic value.
2. Add the name to the list in `src/lib/theme.ts`:
   ```ts
   export const THEMES = ['classic', 'blush', 'ocean'] as const;
   ```
3. Preview with `?theme=ocean`, or make it the default with `DEFAULT_THEME`.

## Adding a new colour

1. Add it to the palette in `theme.scss`: a `$name` value at the top and `--name: #{$name};` in `:root` (plus an override in each theme block if it should differ).
2. Register it in `src/index.css` inside `@theme inline`: `--color-name: var(--name);`
3. Use it as `text-name`, `bg-name`, `border-name`, or `var(--name)`.

## Rules for components

- Don't hardcode hex or `rgba()` colours. ESLint warns on hex literals (`no-restricted-syntax` in `eslint.config.js`).
- For a transparent version of a palette colour, use a Tailwind opacity modifier (`bg-ink/60`) or `color-mix(in srgb, var(--ink) 60%, transparent)` in inline styles and SCSS.
- On dark backgrounds, use `gold-bright` for accent text and outlines rather than `gold`.

## Accessibility

Keep these pairs readable when you change values (WCAG AA):

| Pair | Minimum contrast |
|---|---|
| White text on `gold` and on `burgundy` (buttons) | 4.5:1 |
| `umber` on `ivory` (muted text) | 4.5:1 |
| `gold-dark` / `gold-deep` on white (small labels) | 4.5:1 |
| `gold` on white (icons) | 3:1 |
| `ink` on `ivory` (body text) | 7:1 |

Check pairs with any WCAG contrast checker before shipping a new theme.

## Known exceptions

These still use literal colours and do not follow the theme:

- `src/components/home/QuickCategories.tsx`: decorative pastel tile colours (component not currently shown).
- `src/components/common/SmartImage.tsx`: the placeholder is an SVG data URI, which cannot read CSS variables.
- About eight single-use shades in `AddOnModal`, `CardBody`, `CardImage`, `ExperienceTile`, `Reviews`, `Slider`, `DetailExtraSections` and `MySupportView`. ESLint lists them as warnings.
- Plain white and black transparencies (`rgba(255,255,255,…)`, `rgba(0,0,0,…)`).
- Colours baked into images, such as hero banner artwork.

Dark mode is not set up for the palette yet. It would be a `[data-theme="dark"]` block with values for every token, like the Blush block.
