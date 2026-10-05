import { connect } from 'react-redux';
import '../css/styles.scss';
import { getFeaturedExperiences } from '@/features/home/store/actions';
import type { RootState } from '@/store/store';
import FeaturedExperienceView from './components/FeaturedExperienceView';

const mapStateToProps = (state: RootState, ownProps: { limit?: number }) => ({
    experiences: state.home?.featuredExperiences ?? [],
    loading: state.home?.experiencesLoading ?? false,
    limit: ownProps.limit,
});

const mapDispatchToProps = {
    getFeaturedExperiences,
};

export default connect(mapStateToProps, mapDispatchToProps)(FeaturedExperienceView);
