/** Shared contact details, kept here so the footer, help centre and contact page agree. */
export const WHATSAPP_NUMBER = '919876543210';
export const PHONE = '+91 65223651230';
export const EMAIL = 'support@forevermoment.com';
export const OFFICE = 'Mumbai, India';
export const HOURS = 'Seven days a week, 9 AM to 9 PM';

export const whatsappLink = (message?: string) =>
    `https://wa.me/${WHATSAPP_NUMBER}${message ? `?text=${encodeURIComponent(message)}` : ''}`;

export const OCCASIONS = [
    'Birthday',
    'Anniversary',
    'Baby shower',
    'Proposal',
    'Wedding',
    'Corporate event',
    'Something else',
];

/**
 * Social profiles shown in the footer. Leave a URL empty to hide that icon,
 * so the footer never links to a placeholder.
 */
export const SOCIAL_LINKS: { id: 'instagram' | 'facebook' | 'youtube'; label: string; url: string }[] = [
    { id: 'instagram', label: 'Instagram', url: '' },
    { id: 'facebook', label: 'Facebook', url: '' },
    { id: 'youtube', label: 'YouTube', url: '' },
];
