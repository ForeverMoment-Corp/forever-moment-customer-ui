import { connect } from 'react-redux';
import { getData } from '../../store/actions';
import { getCategories } from '@/features/header/store/actions';
import type { RootState } from '@/store/store';
import CategoryExperienceView from './components/CategoryExperienceView';

const mapStateToProps = (state: RootState) => ({
    experiences: state.experiences.data,
    loading: state.experiences.loading,
    error: state.experiences.error,
    categories: state.header?.categories ?? [],
});

const mapDispatchToProps = {
    getData,
    getCategories,
};

export default connect(mapStateToProps, mapDispatchToProps)(CategoryExperienceView);
