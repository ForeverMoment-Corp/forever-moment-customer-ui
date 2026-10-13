import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setSelectedLocation, setVenuePincode } from '@/features/home/store/actions';
import { slugify } from '@/features/experiences/utils/slug';
import LogoLoader from '@/components/common/LogoLoader';
import NotFound from '@/features/notFound/pages/NotFound';
import CategoryExperience from '../CategoryExperience';

interface Location {
    id?: number;
    name: string;
    isActive?: boolean;
}

/**
 * City landing page, e.g. /delhi/birthday-decoration ("birthday decoration in Delhi" is how people
 * search). Switches the site to that city, then shows the category page with the city in its title,
 * canonical URL and breadcrumb. An unknown city is a 404.
 */
export default function CityCategoryPage() {
    const { citySlug } = useParams<{ citySlug: string; categorySlug: string }>();
    const dispatch = useAppDispatch();
    const locations = useAppSelector((s) => s.home.locations) as Location[];
    const locationsError = useAppSelector((s) => s.home.error);
    const selectedLocation = useAppSelector((s) => s.home.selectedLocation);
    const venuePincode = useAppSelector((s) => s.home.venuePincode);

    const city = locations.find((l) => l && l.isActive !== false && slugify(l.name) === citySlug);

    // The listing loads per selected city, so this page selects its own (as picking it in the header would).
    useEffect(() => {
        if (!city || selectedLocation === city.name) return;
        if (venuePincode?.locationId != null && city.id != null && venuePincode.locationId !== city.id) dispatch(setVenuePincode(null));
        dispatch(setSelectedLocation(city.name));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [city?.name]);

    if (locations.length === 0 && !locationsError) return <LogoLoader />;
    if (!city || !citySlug) return <NotFound />;
    return <CategoryExperience city={{ name: city.name.trim(), slug: citySlug }} />;
}
