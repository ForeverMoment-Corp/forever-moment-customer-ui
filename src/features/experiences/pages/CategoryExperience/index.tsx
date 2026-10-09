import { connect } from 'react-redux';
import { getCategoryExperiences } from '../../store/actions';
import { selectLocationId, selectLocationReady } from '@/features/experiences/store/location';
import { getCategories } from '@/features/header/store/actions';
import type { RootState } from '@/store/store';
import CategoryExperienceView from './components/CategoryExperienceView';

const mapStateToProps = (state: RootState) => ({
    experiences: state.experiences.categoryData,
    listKey: state.experiences.categoryKey,
    loading: state.experiences.categoryLoading,
    error: state.experiences.categoryError,
    categories: state.header?.categories ?? [],
    categoriesLoading: state.header?.categoriesLoading ?? false,
    locationId: selectLocationId(state),
    locationReady: selectLocationReady(state),
});

const mapDispatchToProps = {
    getCategoryExperiences,
    getCategories,
};

export default connect(mapStateToProps, mapDispatchToProps)(CategoryExperienceView);
