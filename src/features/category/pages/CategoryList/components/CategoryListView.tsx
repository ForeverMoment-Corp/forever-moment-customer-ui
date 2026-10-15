import CategoryListCard from "@/components/common/CategoryListCard";
import FadeIn from "@/components/animations/FadeIn";
import SectionHeading from "@/components/home/SectionHeading";

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
    <section className="section-padding bg-ivory">
      <div className="max-w-[1380px] mx-auto px-6 2xl:max-w-none 2xl:px-5">

        <FadeIn>
          <SectionHeading eyebrow="Every occasion" title="Browse by" accent="category" link={{ to: "/categories", label: "All categories" }} />
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