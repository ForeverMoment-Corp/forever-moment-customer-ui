import { connect } from 'react-redux';
import { getAddons, getData, getExperience, getExperienceAddons, getSubCategoryExperiences } from '@/features/experiences/store/actions';
import type { RootState } from '@/store/store';
import ExperienceDetails from './components/ExperienceView';
import '../css/styles.scss';

const mapStateToProps = (state: RootState) => ({
    experience: state.experiences?.currentExperience ?? null,
    loading: state.experiences?.detailLoading ?? false,
    error: state.experiences?.detailError ?? null,
    // Related section: same sub-category first, whole catalogue as fallback.
    subCategoryExperiences: state.experiences?.subCategoryData ?? [],
    subCategoryKey: state.experiences?.subCategoryKey ?? null,
    allExperiences: state.experiences?.data ?? [],
    // GET /public/experiences/{id}/addons, keyed by experience id.
    experienceAddons: state.experiences?.experienceAddons ?? {},
    addonsLoading: state.experiences?.experienceAddonsLoading ?? {},
    // GET /public/addons — the rest of the catalogue, offered below the page.
    addonCatalogue: state.experiences?.addons ?? [],
});

const mapDispatchToProps = {
    getExperience,
    getSubCategoryExperiences,
    getExperienceAddons,
    getAddons,
    getData,
};

export default connect(mapStateToProps, mapDispatchToProps)(ExperienceDetails);
