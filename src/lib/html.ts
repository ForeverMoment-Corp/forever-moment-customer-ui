/**
 * Helpers for CMS text that may arrive as plain text or as a fragment of HTML.
 * The renderer lives in `richText.tsx`; these are the pure functions around it.
 */

const looksLikeHtml = (text: string) => /<\/?[a-z][\s\S]*>/i.test(text);

/** True when the string carries markup that needs rendering rather than printing. */
export const hasHtml = (text: string | null | undefined) => !!text && looksLikeHtml(text);

export const isHtmlFragment = looksLikeHtml;

/** Markup stripped back to readable text, for card summaries, titles and meta tags. */
export function toPlainText(text: string | null | undefined): string {
  const value = (text ?? '').trim();
  if (!value) return '';
  if (!looksLikeHtml(value)) return value;
  // DOMParser does not run scripts, and server-side rendering falls back to a regex strip.
  if (typeof DOMParser === 'undefined') return value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  const doc = new DOMParser().parseFromString(value, 'text/html');
  return (doc.body.textContent ?? '').replace(/\s+/g, ' ').trim();
}
