import { connect } from 'react-redux';
import { getSubCategoryExperiences } from '../../store/actions';
import { getCategories } from '@/features/header/store/actions';
import { selectLocationId, selectLocationReady } from '@/features/experiences/store/location';
import type { RootState } from '@/store/store';
import SubCategoryExperienceView from './components/SubCategoryExperienceView';

const mapStateToProps = (state: RootState) => ({
    experiences: state.experiences.subCategoryData,
    subCategoryKey: state.experiences.subCategoryKey,
    loading: state.experiences.subCategoryLoading,
    error: state.experiences.subCategoryError,
    categories: state.header?.categories ?? [],
    locationId: selectLocationId(state),
    locationReady: selectLocationReady(state),
});

const mapDispatchToProps = {
    getSubCategoryExperiences,
    getCategories,
};

export default connect(mapStateToProps, mapDispatchToProps)(SubCategoryExperienceView);
