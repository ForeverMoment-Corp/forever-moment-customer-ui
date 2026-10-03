import { Link } from "react-router-dom";
import CardImage from "./CardImage";
import CardBody from "./CardBody";
import CardFooter from "./CardFooter";
import { experiencePath } from "@/features/experiences/utils/slug";
import { prefetchExperience } from "@/features/experiences/store/api";

export interface ExperienceCardProps {
  id: string | number;
  /** Backend slug; when present the card links to /experience/:slug instead of the id. */
  slug?: string | null;
  image: string;
  /** Small variant of `image`, shown while the full image loads. */
  thumbnail?: string;
  title: string;
  category: string;
  city?: string;
  rating?: number;
  reviews?: number;
  price: number;
  priceLabel?: string;
  showBadge?: boolean;
  badgeText?: string;
  badgeVariant?: 'pop' | 'default';
  isLiked?: boolean;
  onToggleLike?: (id: string | number) => void;
  className?: string;
}

export default function ExperienceCard({
  id,
  slug,
  image,
  thumbnail,
  title,
  category,
  city = "India",
  rating = 4.8,
  reviews = 120,
  price,
  priceLabel = "per setup",
  showBadge = false,
  badgeText = "Bestseller",
  badgeVariant = 'pop',
  isLiked = false,
  onToggleLike,
  className = "",
}: ExperienceCardProps) {
  
  // Warm the detail API response and its photos on hover/focus/touch so the detail page opens instantly.
  const prefetch = () => prefetchExperience({ id, slug });

  return (
    <Link
      to={experiencePath({ id, slug })}
      className={`block ${className}`}
      onMouseEnter={prefetch}
      onFocus={prefetch}
      onTouchStart={prefetch}
    >
      <div className="card group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 h-full flex flex-col">
        <CardImage 
          id={id}
          image={image}
          placeholderImage={thumbnail}
          title={title}
          showBadge={showBadge}
          badgeText={badgeText}
          badgeVariant={badgeVariant}
          isLiked={isLiked}
          onToggleLike={onToggleLike}
        />

        <CardBody 
          category={category}
          title={title}
          city={city}
          rating={rating}
          reviews={reviews}
        />

        <CardFooter 
          price={price}
          priceLabel={priceLabel}
        />
      </div>
    </Link>
  );
}
