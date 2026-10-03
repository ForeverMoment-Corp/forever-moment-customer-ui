import React from 'react';
import { Heart, ImageOff } from "lucide-react";
import SmartImage from '@/components/common/SmartImage';

interface CardImageProps {
  id: string | number;
  image: string;
  /** Low-res variant shown instantly while `image` downloads (blur-up). */
  placeholderImage?: string;
  title: string;
  showBadge?: boolean;
  badgeText?: string;
  badgeVariant?: 'pop' | 'default';
  isLiked: boolean;
  onToggleLike?: (id: string | number) => void;
}

const CardImage: React.FC<CardImageProps> = ({
  id,
  image,
  placeholderImage,
  title,
  showBadge,
  badgeText,
  badgeVariant,
  isLiked,
  onToggleLike
}) => {
  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onToggleLike) {
      onToggleLike(id);
    }
  };

  return (
    <div className="relative h-[220px] sm:h-[240px] overflow-hidden">
      {image ? (
        <SmartImage
          src={image}
          placeholderSrc={placeholderImage && placeholderImage !== image ? placeholderImage : undefined}
          alt={title}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px"
          className="w-full h-full object-cover group-hover:scale-[1.1] transition-transform duration-700"
        />
      ) : (
        <div
          role="img"
          aria-label={`${title} (no photo yet)`}
          className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[var(--rose-light,#F6E7E4)] to-[var(--cream,#FDFAF4)]"
        >
          <ImageOff size={28} className="text-[var(--mid)] opacity-60" />
        </div>
      )}

      {/* Badge */}
      {showBadge && (
        <span className={`card-badge ${badgeVariant === 'pop' ? 'pop' : ''}`}>
          {badgeText}
        </span>
      )}

      {/* Wishlist Button */}
      <button
        onClick={handleLike}
        className="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 z-10 shadow-sm"
        style={{
          background: isLiked ? "var(--rose)" : "rgba(255,255,255,0.9)",
          backdropFilter: "blur(4px)",
          border: "none",
          cursor: "pointer",
        }}
      >
        <Heart
          size={18}
          className={isLiked ? "text-white fill-white" : "text-[var(--mid)]"}
        />
      </button>

      {/* Overlay Gradient */}
      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/20 to-transparent"></div>
    </div>
  );
};

export default CardImage;
