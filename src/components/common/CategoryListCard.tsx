import { Link } from "react-router-dom";

import SmartImage from '@/components/common/SmartImage';
import { getCategoryImage, getCategoryImageOrFallback } from "@/features/category/utils/categoryImage";

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface CategoryListCardProps {
  category: Category;
  /** Position in the list; picks the stand-in artwork when the API has none. */
  imageIndex: number;
}

export default function CategoryListCard({ category, imageIndex }: CategoryListCardProps) {
  // Artwork comes from /public/categories; the static pool only fills gaps.
  const image = getCategoryImageOrFallback(category, imageIndex);
  const thumbnail = getCategoryImage(category, 'thumbnail');

  return (
    <Link
      to={`/category/${category.slug || category.name.toLowerCase().replace(/\s+/g, "-")}`}
      className="relative rounded-2xl overflow-hidden cursor-pointer group transition-transform duration-300 hover:scale-[1.03]"
      style={{ height: 160 }}
    >
      <SmartImage
        src={image}
        placeholderSrc={thumbnail && thumbnail !== image ? thumbnail : undefined}
        alt={category.name}
        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 260px"
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
      />

      {/* Overlay */}
      <div
        className="absolute inset-0 transition-opacity duration-300 group-hover:opacity-85"
        style={{
          background:
            "linear-gradient(to top, color-mix(in srgb, var(--ink) 90%, transparent), color-mix(in srgb, var(--ink) 20%, transparent))",
        }}
      />

      {/* Label */}
      <div className="absolute bottom-0 left-0 right-0 p-3.5 text-white">
        <div
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "1.15rem",
            fontWeight: 500,
          }}
        >
          {category.name}
        </div>
        <div
          style={{
            fontSize: "0.72rem",
            color: "rgba(255,255,255,0.7)",
            marginTop: 2,
            fontFamily: "'Jost', sans-serif",
          }}
        >
          View experiences
        </div>
      </div>
    </Link>
  );
}
