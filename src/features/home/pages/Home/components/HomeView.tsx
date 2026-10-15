import Hero from "@/components/home/Hero";
import CategoryExperienceRows from "@/components/home/CategoryExperienceRows";
import LogoLoader from "@/components/common/LogoLoader";
import WhyChooseUs from "@/features/whyChooseUs/pages/WhyChooseUs";
import FeaturedExperience from "@/features/experiences/pages/FeaturedExperience";
import { useEffect } from "react";
import CategoryList from "@/features/category/pages/CategoryList";
import SubCategoryList from "@/features/category/pages/SubCategoryList";
import Testimonials from "@/features/testimonials/pages/Testimonials";
import StatsBar from "@/components/StatsBar/StatsBar";
import FeaturedBanner from "@/components/FeaturedBanner/FeaturedBanner";

// New sections ported from event-decoration-main
import QuickCategories from "@/components/home/QuickCategories";
import TrustBar from "@/components/home/TrustBar";
import Occasions from "@/components/home/Occasions";
import PromoBanners from "@/components/home/PromoBanners";
import PlanningSection from "@/components/home/PlanningSection";
import FAQ from "@/components/home/FAQ";
import Gallery from "@/components/home/Gallery";
import BlogSection from "@/components/home/BlogSection";
import CtaBanner from "@/components/home/CtaBanner";

// Missing sections ported from event-decoration-main
import DecorSliderSection from "@/components/home/DecorSliderSection";
import CategorySlider from "@/components/home/CategorySlider";
import ComboDeals from "@/components/home/ComboDeals";
import FlowerPicker from "@/components/home/FlowerPicker";
import PersonaliseSection from "@/components/home/PersonaliseSection";
import TrendingPackages from "@/components/home/TrendingPackages";
import RecentlyViewed from "@/components/home/RecentlyViewed";
import AddonsSlider from "@/components/home/AddonsSlider";

// Static Data
import { decorSliders } from "@/data/decorSliders";

interface HomeProps {
  loading: boolean;
  error: string | null;
  getLocations: () => void;
}

const Home = ({ loading, error, getLocations }: HomeProps) => {

  // Featured experiences are fetched by the FeaturedExperience section once the city is known.
  useEffect(() => {
    getLocations();
  }, []);

  if (loading) {
    return (
      <LogoLoader fullScreen />
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--cream)" }}>
        <p className="text-red-500">Error: {error}</p>
      </div>
    );
  }

  return (
    <div>
      <Hero />
      {/* Sub-categories right under the hero: the quickest way into a collection. Visible on load, so no defer-paint. */}
      <SubCategoryList limit={12} />
      {/* <QuickCategories /> */}
      {/* <StatsBar /> */}
      {/* <TrustBar /> */}
      {/* <Occasions /> */}
      
      <FeaturedExperience limit={10} />
      {/* <PromoBanners /> */}

      {/* New Decor Sliders block 1 */}
      {/* <DecorSliderSection slider={decorSliders[0]} bg="white" />
      <DecorSliderSection slider={decorSliders[1]} bg="cream" />
      <DecorSliderSection slider={decorSliders[2]} bg="white" />
      <DecorSliderSection slider={decorSliders[3]} bg="cream" /> */}

      {/* Category Slider replaces CategoryList conceptually but keeping both per user request to not break things */}
      {/* <CategorySlider /> */}
      <div className="defer-paint">
        <CategoryList />
      </div>
      {/* Each category that has experiences in this city, up to 8 each */}
      <div className="defer-paint">
        <CategoryExperienceRows />
      </div>

      {/* <ComboDeals /> */}

      {/* New Decor Sliders block 2 */}
      {/* <DecorSliderSection slider={decorSliders[4]} bg="white" />
      <DecorSliderSection slider={decorSliders[5]} bg="cream" />
      <DecorSliderSection slider={decorSliders[6]} bg="white" />
      <DecorSliderSection slider={decorSliders[7]} bg="cream" /> */}

      {/* FeaturedBanner from forever-moment originally */}
      {/* <FeaturedBanner /> */}

      {/* <FlowerPicker /> */}
      {/* <PersonaliseSection /> */}
      {/* <TrendingPackages /> */}
      
      {/* <PlanningSection /> */}
      <div className="defer-paint">
        <WhyChooseUs />
      </div>
      <div className="defer-paint">
        <Testimonials />
      </div>
      <div className="defer-paint">
        <FAQ />
      </div>
      
      {/* <RecentlyViewed /> */}
      {/* <Gallery /> */}
      {/* <AddonsSlider /> */}
      {/* <BlogSection /> */}
      <CtaBanner />
    </div>
  );
};

export default Home;
