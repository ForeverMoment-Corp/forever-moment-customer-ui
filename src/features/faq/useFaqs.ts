import { useEffect, useState } from 'react';
import { fetchFaqs, type Faq } from './api';

/** Active FAQs from the API; an empty list while loading, on failure, or when none exist. */
export function useFaqs() {
    const [faqs, setFaqs] = useState<Faq[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let alive = true;
        fetchFaqs().then((items) => {
            if (!alive) return;
            setFaqs(items);
            setLoading(false);
        });
        return () => {
            alive = false;
        };
    }, []);

    return { faqs, loading };
}
