/**
 * The city the guest picked, kept in localStorage so a reload (or a new tab) opens on the same city.
 * Only an explicit pick is saved; the fallback to the first active city is not.
 */
const KEY = 'fm_selected_location';

export function readSavedLocation(): string | null {
    try {
        const value = localStorage.getItem(KEY);
        return value && value.trim() ? value : null;
    } catch {
        // Storage blocked (private mode): fall back to the default city.
        return null;
    }
}

export function saveLocation(name: string) {
    try {
        localStorage.setItem(KEY, name);
    } catch {
        // Storage blocked: the pick still applies for this visit.
    }
}
