import { connect } from 'react-redux';
import '../css/styles.scss';
import { getFeaturedExperiences } from '@/features/home/store/actions';
import { selectLocationId, selectLocationReady } from '@/features/experiences/store/location';
import type { RootState } from '@/store/store';
import FeaturedExperienceView from './components/FeaturedExperienceView';

const mapStateToProps = (state: RootState, ownProps: { limit?: number }) => ({
    experiences: state.home?.featuredExperiences ?? [],
    featuredKey: state.home?.featuredKey ?? null,
    loading: state.home?.experiencesLoading ?? false,
    locationId: selectLocationId(state),
    locationReady: selectLocationReady(state),
    limit: ownProps.limit,
});

const mapDispatchToProps = {
    getFeaturedExperiences,
};

export default connect(mapStateToProps, mapDispatchToProps)(FeaturedExperienceView);
