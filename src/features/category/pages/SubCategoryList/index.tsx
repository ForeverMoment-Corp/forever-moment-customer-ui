import { connect } from 'react-redux';
import type { RootState } from '@/store/store';
import { getSubCategories } from '@/features/header/store/actions';
import { selectLocationId, selectLocationReady } from '@/features/experiences/store/location';
import SubCategoryListView from './components/SubCategoryListView';

/** Home strip of collections, from GET /public/locations/{locationId}/subcategories. */
const mapStateToProps = (state: RootState, ownProps: { limit?: number }) => ({
    subCategories: state.header?.subCategories ?? [],
    subCategoriesKey: state.header?.subCategoriesKey ?? null,
    locationId: selectLocationId(state),
    locationReady: selectLocationReady(state),
    limit: ownProps.limit,
});

const mapDispatchToProps = {
    getSubCategories,
};

export default connect(mapStateToProps, mapDispatchToProps)(SubCategoryListView);
