import { connect } from 'react-redux';
import '../css/styles.scss';
import { getCategories, toggleMenu, setSearchQuery } from '@/features/header/store/actions';
import { getLocations, setSelectedLocation } from '@/features/home/store/actions';
import Header from './components/Header';
import type { RootState } from '@/store/store';

const mapStateToProps = (state: RootState) => ({
    isMenuOpen: state.header?.isMenuOpen,
    searchQuery: state.header?.searchQuery,
    categories: state.header?.categories ?? [],
    categoriesLoading: state.header?.categoriesLoading ?? false,
    categoriesError: state.header?.categoriesError ?? null,
    locations: state.home?.locations ?? [],
    selectedLocation: state.home?.selectedLocation ?? '',
});

const mapDispatchToProps = {
    toggleMenu,
    setSearchQuery,
    getCategories,
    getLocations,
    setSelectedLocation,
};

export default connect(mapStateToProps, mapDispatchToProps)(Header);
