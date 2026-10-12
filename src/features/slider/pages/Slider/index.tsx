import { connect } from 'react-redux';
import '../css/styles.scss';
import { getSlides } from '@/features/slider/store/actions';
import { getLocations, setSelectedLocation } from '@/features/home/store/actions';
import Slider from './components/Slider';
import type { RootState } from '@/store/store';

const SliderContainer = (props: any) => {
    return <Slider {...props} />;
};

const mapStateToProps = (state: RootState) => ({
    slides: state.slider?.slides ?? [],
    slidesLoading: state.slider?.slidesLoading ?? false,
    locations: state.home?.locations ?? [],
    selectedLocation: state.home?.selectedLocation ?? '',
});

const mapDispatchToProps = {
    getSlides,
    getLocations,
    setSelectedLocation,
};

export default connect(mapStateToProps, mapDispatchToProps)(SliderContainer);
