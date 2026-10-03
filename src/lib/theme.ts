/**
 * Runtime theme selection. Palettes live in src/styles/theme.scss; a theme is a
 * `[data-theme="…"]` block that overrides the palette variables.
 *
 * Preview another theme with `?theme=classic` or `?theme=blush` in the URL; the
 * choice is remembered in this browser until changed.
 */
export const THEMES = ['classic', 'blush'] as const;
export type ThemeName = (typeof THEMES)[number];

/** The theme visitors get by default. */
export const DEFAULT_THEME: ThemeName = 'blush';

const STORAGE_KEY = 'fm-theme';
const isTheme = (v: string | null): v is ThemeName => !!v && (THEMES as readonly string[]).includes(v);

export function applyTheme() {
    let theme: ThemeName = DEFAULT_THEME;
    try {
        const fromUrl = new URLSearchParams(window.location.search).get('theme');
        if (isTheme(fromUrl)) localStorage.setItem(STORAGE_KEY, fromUrl);
        const saved = localStorage.getItem(STORAGE_KEY);
        if (isTheme(saved)) theme = saved;
    } catch {
        // Storage can be unavailable (private mode); fall back to the default.
    }
    // "classic" is the base :root palette, so it needs no attribute.
    if (theme === 'classic') delete document.documentElement.dataset.theme;
    else document.documentElement.dataset.theme = theme;
}
