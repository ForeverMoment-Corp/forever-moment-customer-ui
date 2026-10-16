const API_BASE = import.meta.env.VITE_API_URL || '/api/platform';

export interface VendorRegistration {
    businessName: string;
    category: string;
    contactName: string;
    contactEmail: string;
    contactPhone?: string;
    password?: string;
}

/** POST /public/vendors/register — a new partner, PENDING until the team approves it. */
export async function registerVendor(input: VendorRegistration): Promise<void> {
    const response = await fetch(`${API_BASE}/public/vendors/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
            businessName: input.businessName.trim(),
            category: input.category.trim(),
            contactName: input.contactName.trim(),
            contactEmail: input.contactEmail.trim(),
            contactPhone: input.contactPhone?.trim() || undefined,
            password: input.password || undefined,
        }),
    });
    if (response.ok) return;
    let body: { msg?: string; message?: string; errors?: string[] } | null = null;
    try {
        body = await response.json();
    } catch {
        body = null;
    }
    const validation = Array.isArray(body?.errors) && body.errors.length > 0 ? body.errors.join(', ') : null;
    throw new Error(validation || body?.msg || body?.message || `Could not send your application: ${response.status}`);
}
