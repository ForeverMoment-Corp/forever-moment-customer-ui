import { connect } from 'react-redux';
import { getLocations } from '@/features/home/store/actions';
import type { RootState } from '@/store/store';
import ContactView from './components/ContactView';

const mapStateToProps = (state: RootState) => ({
    locations: state.home?.locations ?? [],
});

const mapDispatchToProps = {
    getLocations,
};

export default connect(mapStateToProps, mapDispatchToProps)(ContactView);
