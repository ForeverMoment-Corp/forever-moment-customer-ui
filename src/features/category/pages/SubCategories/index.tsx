import { connect } from 'react-redux';
import type { RootState } from '@/store/store';
import { getSubCategories } from '@/features/header/store/actions';
import { getData } from '@/features/experiences/store/actions';
import { selectLocationId, selectLocationReady } from '@/features/experiences/store/location';
import SubCategoriesView from './components/SubCategoriesView';

/** `/subcategories` — the city's sub-categories from GET /public/locations/{locationId}/subcategories, enriched with its experiences. */
const mapStateToProps = (state: RootState) => ({
    subCategories: state.header?.subCategories ?? [],
    subCategoriesLoading: state.header?.subCategoriesLoading ?? false,
    subCategoriesError: state.header?.subCategoriesError ?? null,
    subCategoriesKey: state.header?.subCategoriesKey ?? null,
    locationId: selectLocationId(state),
    locationReady: selectLocationReady(state),
    experiences: state.experiences.data,
});

const mapDispatchToProps = {
    getSubCategories,
    getData,
};

export default connect(mapStateToProps, mapDispatchToProps)(SubCategoriesView);
