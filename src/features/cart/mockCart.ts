/**
 * TEMPORARY sample cart for previewing the Cart screen while there is no cart API.
 * Dates are relative to today so the items always look upcoming.
 * Delete this file once the cart is backed by the booking service.
 */

export interface CartAddon {
    id: number;
    name: string;
    price: number;
}

export interface CartItem {
    id: string;
    experienceId: number;
    slug?: string | null;
    name: string;
    image: string;
    location: string;
    /** YYYY-MM-DD */
    date: string;
    startTime: string;
    endTime: string;
    /** Package price, covers `includedGuests`. */
    price: number;
    originalPrice?: number;
    includedGuests: number;
    maxGuests: number;
    extraGuestPrice: number;
    guests: number;
    addons: CartAddon[];
}

export interface CartCoupon {
    code: string;
    percent: number;
    maxDiscount: number;
    minAmount: number;
}

/** Codes the dummy coupon field accepts. */
export const MOCK_COUPONS: CartCoupon[] = [
    { code: 'CELEBRATE10', percent: 10, maxDiscount: 1500, minAmount: 5000 },
    { code: 'FIRSTMOMENT', percent: 15, maxDiscount: 2000, minAmount: 8000 },
];

const dayFromToday = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

export const MOCK_CART: CartItem[] = [
    {
        id: 'cart-1',
        experienceId: 101,
        slug: 'candlelight-rooftop-dinner',
        name: 'Candlelight Rooftop Dinner',
        image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400',
        location: 'Bandra West, Mumbai',
        date: dayFromToday(6),
        startTime: '19:00',
        endTime: '22:00',
        price: 7999,
        originalPrice: 9999,
        includedGuests: 2,
        maxGuests: 4,
        extraGuestPrice: 2499,
        guests: 2,
        addons: [
            { id: 1, name: 'Rose petal pathway', price: 999 },
            { id: 2, name: 'Personalised cake (1 kg)', price: 1299 },
        ],
    },
    {
        id: 'cart-2',
        experienceId: 214,
        slug: 'birthday-balloon-decor',
        name: 'Birthday Balloon Decor at Home',
        image: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=400',
        location: 'Your home, Pune',
        date: dayFromToday(12),
        startTime: '16:00',
        endTime: '18:00',
        price: 3499,
        includedGuests: 10,
        maxGuests: 30,
        extraGuestPrice: 0,
        guests: 10,
        addons: [{ id: 5, name: 'LED "Happy Birthday" sign', price: 599 }],
    },
];
