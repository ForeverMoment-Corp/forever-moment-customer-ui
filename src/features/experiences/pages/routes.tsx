import { lazyPage } from "@/router/lazyPage";

export const ExperienceRoutes = [
  { path: "experience/:slugOrId", lazy: lazyPage(() => import("./ExperienceDetail")) },
  { path: "featured-experiences", lazy: lazyPage(() => import("./FeaturedExperience")) },
  // Readable collection URL: /collection/pre-wedding-shoot-26
  { path: "collection/:collectionSlug", lazy: lazyPage(() => import("./SubCategoryExperience")) },
  // Old links (/subcategory/26) still work and redirect to the /collection/ URL.
  { path: "subcategory/:subCategoryId", lazy: lazyPage(() => import("./SubCategoryExperience")) },
  { path: "category/:categorySlug", lazy: lazyPage(() => import("./CategoryExperience")) },
  // City landing pages: /delhi/birthday-decoration. Fixed two-part paths (payment/status, category/x …)
  // rank above this pattern, and an unknown city renders the 404 page.
  { path: ":citySlug/:categorySlug", lazy: lazyPage(() => import("./CityCategory")) },
];
