/**
 * In-app browsers (WhatsApp on Android, Instagram, Facebook, LinkedIn, Snapchat, X …) open shared
 * links in their own web view. There, Google refuses to sign in ("disallowed_useragent") and new
 * tabs / popups are blocked or ignored, so callers switch to something that works.
 */
export const isInAppBrowser = () =>
    typeof navigator !== 'undefined' &&
    /FBAN|FBAV|FB_IAB|Instagram|WhatsApp|Line\/|LinkedInApp|Snapchat|Twitter|; wv\)/i.test(navigator.userAgent);
