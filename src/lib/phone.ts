/** Phone numbers are Indian mobiles: entered as 10 digits, stored and sent as +91XXXXXXXXXX. */

/** Country code shown in front of every phone field; numbers are Indian mobiles. */
export const COUNTRY_CODE = '+91';

/**
 * Whatever was typed or pasted → the 10 local digits. "+91 98765 43210", "098765-43210" and
 * "9876543210" all become "9876543210"; anything longer is cut to 10.
 */
export function toLocalDigits(raw: string | null | undefined): string {
    let digits = String(raw ?? '').replace(/\D/g, '');
    if (digits.length > 10 && digits.startsWith('91')) digits = digits.slice(2);
    else if (digits.length > 10 && digits.startsWith('0')) digits = digits.slice(1);
    return digits.slice(0, 10);
}

/** A valid Indian mobile: 10 digits starting 6–9. */
export const isValidMobile = (digits: string) => /^[6-9]\d{9}$/.test(digits);

/** The number as stored / sent: "+919876543210", or '' when empty. */
export const withCountryCode = (digits: string) => (digits ? `${COUNTRY_CODE}${digits}` : '');

/** "+919876543210" → "+91 98765 43210" for display. */
export function formatPhone(raw: string | null | undefined): string {
    const digits = toLocalDigits(raw);
    if (!digits) return '';
    return digits.length === 10 ? `${COUNTRY_CODE} ${digits.slice(0, 5)} ${digits.slice(5)}` : `${COUNTRY_CODE} ${digits}`;
}
