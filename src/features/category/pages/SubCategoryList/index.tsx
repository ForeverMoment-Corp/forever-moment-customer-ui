import { connect } from 'react-redux';
import type { RootState } from '@/store/store';
import { getSubCategories } from '@/features/header/store/actions';
import SubCategoryListView from './components/SubCategoryListView';

/** Home strip of collections, from GET /public/subcategories. */
const mapStateToProps = (state: RootState, ownProps: { limit?: number }) => ({
    subCategories: state.header?.subCategories ?? [],
    limit: ownProps.limit,
});

const mapDispatchToProps = {
    getSubCategories,
};

export default connect(mapStateToProps, mapDispatchToProps)(SubCategoryListView);
