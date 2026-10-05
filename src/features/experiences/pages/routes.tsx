import ExperienceDetails from "./ExperienceDetail";
import FeaturedExperience from "./FeaturedExperience";
import SubCategoryExperience from "./SubCategoryExperience";
import CategoryExperience from "./CategoryExperience";

export const ExperienceRoutes = [
  {
    path: "experience/:slugOrId",
    element: <ExperienceDetails />,
  },
  {
    path: "featured-experiences",
    element: <FeaturedExperience />,
  },
  {
    path: "subcategory/:subCategoryId",
    element: <SubCategoryExperience />,
  },
  {
    path: "category/:categorySlug",
    element: <CategoryExperience />,
  },
];