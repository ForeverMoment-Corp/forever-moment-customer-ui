import { connect } from 'react-redux';
import '../css/styles.scss';
import { getLocations } from '@/features/home/store/actions';
import HomeView from './components/HomeView';
import type { RootState } from '@/store/store';

const HomeContainer = (props: any) => {
    return <HomeView {...props} />;
};

const mapStateToProps = (state: RootState) => ({
  featuredExperiences: state.home.featuredExperiences,
  loading: state.home.loading,
  error: state.home.error,
});

const mapDispatchToProps = {
  getLocations,
};

export default connect(mapStateToProps, mapDispatchToProps)(HomeContainer);
