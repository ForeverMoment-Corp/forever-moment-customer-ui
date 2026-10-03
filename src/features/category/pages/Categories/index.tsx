import { connect } from 'react-redux';
import type { RootState } from '@/store/store';
import { getCategories } from '@/features/header/store/actions';
import { getData } from '@/features/experiences/store/actions';
import CategoriesView from './components/CategoriesView';

/** `/categories` — every active category from GET /public/categories, enriched with GET /public/experiences. */
const mapStateToProps = (state: RootState) => ({
    categories: state.header?.categories ?? [],
    categoriesLoading: state.header?.categoriesLoading ?? false,
    categoriesError: state.header?.categoriesError ?? null,
    experiences: state.experiences.data,
    experiencesLoading: state.experiences.loading,
});

const mapDispatchToProps = {
    getCategories,
    getData,
};

export default connect(mapStateToProps, mapDispatchToProps)(CategoriesView);
