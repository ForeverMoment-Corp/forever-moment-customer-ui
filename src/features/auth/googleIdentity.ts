/**
 * Google Identity Services (the "Sign in with Google" button), set up ONCE per page.
 *
 * @react-oauth/google's <GoogleLogin> calls google.accounts.id.initialize() every time it mounts, and
 * our login popup mounts it on every open. Google warns that initialising more than once "could cause
 * unexpected behavior"; in practice the button stopped opening Google's window, typically on the
 * second open (e.g. after logging out). Here we initialise once and only re-render the button.
 *
 * The script itself is still loaded by <GoogleOAuthProvider> (LoginModal).
 */

export interface GoogleCredential {
    /** The ID token (JWT) our backend's /auth/google expects. */
    credential?: string;
    select_by?: string;
}

interface GoogleIdApi {
    initialize: (config: Record<string, unknown>) => void;
    renderButton: (parent: HTMLElement, options: Record<string, unknown>) => void;
    disableAutoSelect: () => void;
}

const googleId = (): GoogleIdApi | undefined =>
    (window as unknown as { google?: { accounts?: { id?: GoogleIdApi } } }).google?.accounts?.id;

let initializedFor: string | null = null;
// The latest handler; Google's single callback forwards to it, so each popup open gets fresh state.
let credentialHandler: ((response: GoogleCredential) => void) | null = null;

export function setGoogleCredentialHandler(handler: ((response: GoogleCredential) => void) | null) {
    credentialHandler = handler;
}

/** Initialise once (per client id). False when Google's script has not loaded yet. */
export function ensureGoogleInitialized(clientId: string): boolean {
    const id = googleId();
    if (!id) return false;
    if (initializedFor !== clientId) {
        id.initialize({
            client_id: clientId,
            callback: (response: GoogleCredential) => credentialHandler?.(response),
            ux_mode: 'popup',
            auto_select: false,
            // Browser-mediated sign-in (FedCM) where supported: keeps working as Chrome / Edge block
            // third-party cookies. Browsers without FedCM fall back to the normal popup.
            use_fedcm_for_button: true,
            // Safari / iOS tracking prevention.
            itp_support: true,
        });
        initializedFor = clientId;
    }
    return true;
}

/** Draws Google's button into `container` (replacing any previous one). */
export function renderGoogleButton(container: HTMLElement, width: number) {
    const id = googleId();
    if (!id) return;
    container.innerHTML = '';
    id.renderButton(container, {
        type: 'standard',
        theme: 'outline',
        size: 'large',
        shape: 'pill',
        text: 'continue_with',
        logo_alignment: 'left',
        width,
    });
}

/**
 * Call on logout. Google requires this so it stops treating the user as auto-signed-in; without it
 * the personalised "Continue as <name>" button can be left in a stale state after logging out.
 */
export function googleSignOut() {
    try {
        googleId()?.disableAutoSelect();
    } catch {
        // Google's script not loaded on this page: nothing to reset.
    }
}
