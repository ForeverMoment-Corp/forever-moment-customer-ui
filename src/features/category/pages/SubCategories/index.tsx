import { connect } from 'react-redux';
import type { RootState } from '@/store/store';
import { getSubCategories } from '@/features/header/store/actions';
import { getData } from '@/features/experiences/store/actions';
import SubCategoriesView from './components/SubCategoriesView';

/** `/subcategories` — every active sub-category from GET /public/subcategories, enriched with GET /public/experiences. */
const mapStateToProps = (state: RootState) => ({
    subCategories: state.header?.subCategories ?? [],
    subCategoriesLoading: state.header?.subCategoriesLoading ?? false,
    subCategoriesError: state.header?.subCategoriesError ?? null,
    experiences: state.experiences.data,
});

const mapDispatchToProps = {
    getSubCategories,
    getData,
};

export default connect(mapStateToProps, mapDispatchToProps)(SubCategoriesView);
