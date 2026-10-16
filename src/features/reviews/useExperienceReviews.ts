import { useCallback, useEffect, useState } from 'react';
import { fetchExperienceReviews, fetchRatingSummary, type RatingSummary, type Review } from './api';

export interface ExperienceReviews {
    reviews: Review[];
    summary: RatingSummary;
    loading: boolean;
    /** Re-fetch (e.g. after the user submits a review). */
    reload: () => void;
}

const EMPTY: RatingSummary = { averageRating: 0, reviewCount: 0 };

/** Approved reviews + rating summary of one experience. Failures leave an empty list (no review section errors). */
export function useExperienceReviews(experienceId: number | string | null | undefined): ExperienceReviews {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [summary, setSummary] = useState<RatingSummary>(EMPTY);
    const [attempt, setAttempt] = useState(0);
    // Loading = the last finished request was for another experience (or an earlier attempt).
    const requestKey = experienceId == null || experienceId === '' ? null : `${experienceId}:${attempt}`;
    const [loadedKey, setLoadedKey] = useState<string | null>(null);
    const loading = requestKey !== null && loadedKey !== requestKey;

    useEffect(() => {
        if (experienceId == null || experienceId === '') return;
        let alive = true;
        Promise.allSettled([fetchExperienceReviews(experienceId), fetchRatingSummary(experienceId)]).then(([list, sum]) => {
            if (!alive) return;
            const items = list.status === 'fulfilled' ? list.value : [];
            setReviews(items);
            if (sum.status === 'fulfilled' && sum.value.reviewCount > 0) setSummary(sum.value);
            else if (items.length > 0) {
                // No summary: work it out from the list.
                const avg = items.reduce((total, r) => total + r.rating, 0) / items.length;
                setSummary({ averageRating: avg, reviewCount: items.length });
            } else setSummary(EMPTY);
            setLoadedKey(`${experienceId}:${attempt}`);
        });
        return () => {
            alive = false;
        };
    }, [experienceId, attempt]);

    const reload = useCallback(() => setAttempt((n) => n + 1), []);
    return { reviews, summary, loading, reload };
}

/** 4.666 → "4.7"; whole numbers stay "5". */
export const formatRating = (value: number) => (Math.round(value * 10) / 10).toFixed(Number.isInteger(Math.round(value * 10) / 10) ? 0 : 1);
