/**
 * The venue pincode the guest set (in the header or on an experience), kept in localStorage so
 * every experience page can check it automatically instead of asking again.
 */
export interface SavedPincode {
    pincode: string;
    /** From GET /public/locations/check-pincode, for the header label ("Koramangala"). */
    areaName?: string | null;
    /** The header city the pincode belongs to. */
    locationId?: number | null;
}

const KEY = 'fm_venue_pincode';

export function readSavedPincode(): SavedPincode | null {
    try {
        const raw = localStorage.getItem(KEY);
        const value = raw ? (JSON.parse(raw) as SavedPincode) : null;
        return value && /^\d{6}$/.test(value.pincode) ? value : null;
    } catch {
        return null;
    }
}

export function savePincode(value: SavedPincode | null) {
    try {
        if (value) localStorage.setItem(KEY, JSON.stringify(value));
        else localStorage.removeItem(KEY);
    } catch {
        // Storage blocked: the pincode still applies for this visit.
    }
}
