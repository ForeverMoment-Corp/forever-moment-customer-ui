import type { RootState } from '@/store/store';

/** Id of the city picked in the header (state.home.selectedLocation holds its name). */
export const selectLocationId = (state: RootState): number | undefined => {
    const name = state.home?.selectedLocation;
    const location = (state.home?.locations ?? []).find((l: { id: number; name: string }) => l.name === name);
    return location?.id ?? undefined;
};

/**
 * True once the location list has settled. Pages wait for this so they fetch once for the
 * picked city instead of once unscoped and again when the locations arrive.
 */
export const selectLocationReady = (state: RootState): boolean =>
    selectLocationId(state) != null ||
    (state.home?.locations?.length ?? 0) > 0 ||
    (!!state.home?.error && !state.home?.locationsLoading);

/** Identifies a list by city + id, so a list fetched for another city is never shown. */
export const experienceListKey = (locationId: number | undefined, id: string | number) => `${locationId ?? 'all'}:${id}`;
