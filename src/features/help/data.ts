/** Help centre content. Grouped by topic so the page can filter without a backend. */
export interface HelpArticle {
    q: string;
    a: string;
}

export interface HelpTopic {
    id: string;
    label: string;
    /** Lucide icon name resolved in the view. */
    icon: 'calendar' | 'truck' | 'refund' | 'sparkles' | 'wallet';
    blurb: string;
    articles: HelpArticle[];
}

export const HELP_TOPICS: HelpTopic[] = [
    {
        id: 'booking',
        label: 'Booking',
        icon: 'calendar',
        blurb: 'Choosing a date, slot and venue',
        articles: [
            {
                q: 'How do I book a setup?',
                a: 'Open any experience, pick a date and a time slot, check your delivery pincode, add any extras you want, then pay. You get a confirmation on WhatsApp straight away with your booking reference.',
            },
            {
                q: 'How far in advance should I book?',
                a: 'Two to three days ahead is comfortable for most setups. Same-day slots are often available, but the later slots fill first on weekends and around festivals.',
            },
            {
                q: 'Why can I not select a time slot?',
                a: 'Slots disappear once their start time has passed, so late in the day only the evening slots remain. Pick the next date and the full list comes back. If a date shows no slots at all, that date is fully booked.',
            },
            {
                q: 'Can I book for an address in another city?',
                a: 'Yes. Enter the delivery pincode of the venue rather than your own. If we do not serve that pincode yet, the booking panel tells you before you pay.',
            },
        ],
    },
    {
        id: 'setup',
        label: 'Setup & delivery',
        icon: 'truck',
        blurb: 'What happens on the day',
        articles: [
            {
                q: 'When does the decorator arrive?',
                a: 'About two hours before your chosen slot, so the room is ready when you are. You get the decorator’s number on WhatsApp the morning of the booking.',
            },
            {
                q: 'How long does the setup take?',
                a: 'Most balloon and backdrop setups take 60 to 90 minutes. Larger canopy or stage setups can take up to two hours. The setup time for each experience is listed on its page.',
            },
            {
                q: 'Do I need to be at the venue?',
                a: 'Someone needs to let the team in and show them the space. It does not have to be you. Share the contact number of whoever will be there when you book.',
            },
            {
                q: 'What if my building has no lift?',
                a: 'Tell us when you book. Setup may take a little longer and, for upper floors without lift access, our team may ask for help carrying larger props.',
            },
            {
                q: 'Who removes the decoration afterwards?',
                a: 'We come back to take down and clear everything. Balloons and flowers are yours to keep if you would rather hold on to them.',
            },
        ],
    },
    {
        id: 'cancellation',
        label: 'Cancellation & refunds',
        icon: 'refund',
        blurb: 'Changing or cancelling a booking',
        articles: [
            {
                q: 'What is the refund policy?',
                a: 'More than 24 hours before your slot you get a 90% refund. Between 12 and 24 hours you get 50%. Less than 12 hours before, the booking is non-refundable. All timelines count from the start of your slot, not from when you booked.',
            },
            {
                q: 'Can I reschedule instead of cancelling?',
                a: 'Yes, and it is free when you ask more than 24 hours ahead. Rescheduling is subject to availability on the new date, so message us as early as you can.',
            },
            {
                q: 'Are there dates that cannot be cancelled?',
                a: 'Bookings for 13 and 14 February and for Karva Chauth are special-occasion packages and cannot be cancelled or refunded.',
            },
            {
                q: 'When does the money reach me?',
                a: 'Refunds are raised the same day we confirm the cancellation and reach your original payment method in five to seven working days, depending on your bank.',
            },
        ],
    },
    {
        id: 'customising',
        label: 'Customising',
        icon: 'sparkles',
        blurb: 'Colours, themes and add-ons',
        articles: [
            {
                q: 'Can I change the colours or theme?',
                a: 'Yes. Mention what you want while booking, or message us afterwards. We match balloon and floral colours wherever the materials allow and tell you honestly when something is not possible.',
            },
            {
                q: 'Can I add a cake, flowers or a name board?',
                a: 'Add-ons sit in the booking panel under "Make it extra special". You can also add them after booking by messaging us, as long as it is more than 24 hours before your slot.',
            },
            {
                q: 'Will it look exactly like the photos?',
                a: 'Every photo on the site is from a real setup we delivered, not stock imagery. Your room’s size, wall colour and ceiling height change how a setup sits, so expect the same materials and style rather than a pixel-perfect copy.',
            },
            {
                q: 'Can you do something that is not on the site?',
                a: 'Message us on WhatsApp with your idea, budget and date. Custom setups are quoted individually and usually need three days’ notice.',
            },
        ],
    },
    {
        id: 'payments',
        label: 'Payments',
        icon: 'wallet',
        blurb: 'Prices, coupons and invoices',
        articles: [
            {
                q: 'Is the price on the page final?',
                a: 'The price shown includes all taxes for the base setup. Anything you add from the add-ons is listed separately in the summary before you pay, so the total on the button is what you are charged.',
            },
            {
                q: 'How do I use a coupon?',
                a: 'Open "Have a coupon code?" in the booking panel and enter it. The discount is applied and validated at checkout.',
            },
            {
                q: 'Do I pay the full amount upfront?',
                a: 'Yes. Paying in full confirms the slot and the decorator. We do not hold slots against a part payment.',
            },
            {
                q: 'Can I get an invoice for my company?',
                a: 'Email support@forevermoment.com with your booking reference and GST details and we send a tax invoice within two working days.',
            },
        ],
    },
];
