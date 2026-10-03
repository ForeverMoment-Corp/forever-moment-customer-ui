import { Link } from "react-router-dom";
import CategoryListCard from "@/components/common/CategoryListCard";
import FadeIn from "@/components/animations/FadeIn";

interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  displayOrder: number;
  isActive: boolean;
}

interface CategoryListViewProps {
  categories: Category[];
}

export default function CategoryListView({ categories }: CategoryListViewProps) {
  const activeCategories = categories
    .filter((cat) => cat.isActive)
    .sort((a, b) => a.displayOrder - b.displayOrder);

  // Don't render the section if there are no categories yet
  if (activeCategories.length === 0) return null;

  return (
    <section className="section-padding bg-white">
      <div className="max-w-[1380px] mx-auto px-6">

        {/* Section Header */}
        <FadeIn>
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-10 gap-4">
            <div>
              <p style={{ fontFamily: "'Jost', sans-serif" }} className="text-[0.7rem] text-umber tracking-[0.25em] uppercase mb-2">
                Every Occasion
              </p>
              <h2 style={{ fontFamily: "'Cormorant Garamond', serif" }} className="text-[2rem] md:text-[2.6rem] text-ink font-semibold leading-tight">
                Browse by <em>Category</em>
              </h2>
            </div>
            <Link 
              to="/categories" 
              style={{ fontFamily: "'Jost', sans-serif" }} 
              className="text-gold text-[0.85rem] font-medium uppercase tracking-[0.1em] hover:text-ink transition-colors flex items-center gap-2 group"
            >
              All Categories 
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          </div>
        </FadeIn>

        {/* Category Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {activeCategories.map((cat, index) => (
            <CategoryListCard key={cat.id} category={cat} imageIndex={index} />
          ))}
        </div>
      </div>
    </section>
  );
}