import { useRef, useState } from "react";
import { FiChevronLeft, FiChevronRight, FiPlus, FiCheck } from "react-icons/fi";
import { Link } from "react-router-dom";
import SmartImage from '@/components/common/SmartImage';
// ============================================
// ADDONS DATA — 3 categories
// ============================================
const addonCategories = [
  {
    label: "Gift Add-ons",
    emoji: "🎁",
    items: [
      {
        id: 101,
        title: "Luxury Gift Hamper",
        price: 2999,
        image:
          "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=300",
        category: "Gift",
      },
      {
        id: 102,
        title: "Personalized Photo Frame",
        price: 899,
        image:
          "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=300",
        category: "Gift",
      },
      {
        id: 103,
        title: "Scented Candle Set",
        price: 1299,
        image:
          "https://images.unsplash.com/photo-1602028915047-37269d1a73f7?w=300",
        category: "Gift",
      },
      {
        id: 104,
        title: "Chocolates Box (Premium)",
        price: 1599,
        image:
          "https://images.unsplash.com/photo-1548907040-4baa42d10919?w=300",
        category: "Gift",
      },
      {
        id: 105,
        title: "Flower Bouquet (50 stems)",
        price: 1999,
        image:
          "https://images.unsplash.com/photo-1487530811015-780deb85cf64?w=300",
        category: "Gift",
      },
      {
        id: 106,
        title: "Teddy Bear (XL)",
        price: 1199,
        image:
          "https://images.unsplash.com/photo-1559715745-e1b33a271c8f?w=300",
        category: "Gift",
      },
    ],
  },
  {
    label: "Decoration Add-ons",
    emoji: "✨",
    items: [
      {
        id: 201,
        title: "Balloon Arch (6ft)",
        price: 2499,
        image:
          "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=300",
        category: "Decoration",
      },
      {
        id: 202,
        title: "Fairy Light Curtain",
        price: 1799,
        image:
          "https://images.unsplash.com/photo-1478146896981-b80fe463b330?w=300",
        category: "Decoration",
      },
      {
        id: 203,
        title: "Neon Sign (Custom)",
        price: 4999,
        image:
          "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=300",
        category: "Decoration",
      },
      {
        id: 204,
        title: "Fog Machine",
        price: 3499,
        image:
          "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=300",
        category: "Decoration",
      },
      {
        id: 205,
        title: "Photo Booth Props Set",
        price: 1499,
        image:
          "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=300",
        category: "Decoration",
      },
      {
        id: 206,
        title: "Flower Wall (4x4ft)",
        price: 5999,
        image:
          "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=300",
        category: "Decoration",
      },
    ],
  },
  {
    label: "Experience Add-ons",
    emoji: "🎭",
    items: [
      {
        id: 301,
        title: "Professional DJ (4hrs)",
        price: 12999,
        image:
          "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=300",
        category: "Experience",
      },
      {
        id: 302,
        title: "Live Acoustic Music",
        price: 8999,
        image:
          "https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=300",
        category: "Experience",
      },
      {
        id: 303,
        title: "Professional Photographer",
        price: 9999,
        image:
          "https://images.unsplash.com/photo-1542038374977-af2f3e6a1b41?w=300",
        category: "Experience",
      },
      {
        id: 304,
        title: "Caricature Artist",
        price: 4999,
        image:
          "https://images.unsplash.com/photo-1607799279861-4dd421887fb3?w=300",
        category: "Experience",
      },
      {
        id: 305,
        title: "Magic Show (1hr)",
        price: 6999,
        image:
          "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=300",
        category: "Experience",
      },
      {
        id: 306,
        title: "Drone Videography",
        price: 14999,
        image:
          "https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=300",
        category: "Experience",
      },
    ],
  },
];

const formatPrice = (price: number) => `₹${price.toLocaleString("en-IN")}`;

// ============================================
// SINGLE SLIDER — ek category ke liye
// ============================================
const AddonSlider = ({
  category,
}: {
  category: (typeof addonCategories)[0];
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [addedIds, setAddedIds] = useState<number[]>([]);

  const scroll = (dir: "left" | "right") => {
    scrollRef.current?.scrollBy({
      left: dir === "left" ? -280 : 280,
      behavior: "smooth",
    });
  };

  const handleAdd = (item: (typeof category.items)[0]) => {
    setAddedIds((prev) => [...prev, item.id]);
    alert(`${item.title} added to cart`);
    setTimeout(
      () => setAddedIds((prev) => prev.filter((id) => id !== item.id)),
      2000,
    );
  };

  return (
    <div className="mb-12">
      {/* Category Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <span className="text-[1.4rem]">{category.emoji}</span>
          <h3
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
            className="text-[1.4rem] text-ink font-semibold"
          >
            {category.label}
          </h3>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => scroll("left")}
            className="w-9 h-9 rounded-full bg-white border border-sand flex items-center justify-center hover:border-gold hover:text-gold transition-colors shadow-sm"
          >
            <FiChevronLeft size={16} />
          </button>
          <button
            onClick={() => scroll("right")}
            className="w-9 h-9 rounded-full bg-white border border-sand flex items-center justify-center hover:border-gold hover:text-gold transition-colors shadow-sm"
          >
            <FiChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Scrollable Cards */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide pb-2"
      >
        {category.items.map((item) => {
          const isAdded = addedIds.includes(item.id);
          return (
            <Link
              to={`/product/${item.id}`}
              key={item.id}
              className="shrink-0 w-[200px] bg-white rounded-2xl overflow-hidden shadow-[0_4px_16px_color-mix(in_srgb,_var(--ink)_6%,_transparent)] hover:shadow-[0_12px_30px_color-mix(in_srgb,_var(--gold)_20%,_transparent)] hover:-translate-y-1 transition-all duration-300 group block"
            >
              {/* same image div */}
              <div className="h-[140px] overflow-hidden relative">
                <SmartImage
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              </div>
              <div className="p-3">
                <p
                  style={{ fontFamily: "'Jost', sans-serif" }}
                  className="text-[0.75rem] text-ink font-medium leading-snug mb-2"
                >
                  {item.title}
                </p>
                <div className="flex items-center justify-between">
                  <span
                    style={{ fontFamily: "'Jost', sans-serif" }}
                    className="text-[0.85rem] text-gold font-bold"
                  >
                    {formatPrice(item.price)}
                  </span>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleAdd(item);
                    }}
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${isAdded ? "bg-green-500 text-white" : "bg-ink text-white hover:bg-gold"}`}
                  >
                    {isAdded ? <FiCheck size={13} /> : <FiPlus size={13} />}
                  </button>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

// ============================================
// MAIN COMPONENT — sab sliders ek section mein
// ============================================
const AddonsSlider = () => {
  return (
    <section className="section-padding bg-ivory">
      <div className="container mx-auto px-6">
        {/* Heading */}
        <div className="text-center mb-12">
          <h2
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
            className="text-[2rem] md:text-[2.6rem] text-ink font-semibold mb-2"
          >
            Elevate Your Celebration
          </h2>
          <p
            style={{ fontFamily: "'Jost', sans-serif" }}
            className="text-[0.7rem] text-umber tracking-[0.25em] uppercase"
          >
            Add-ons, Gifts & Experiences
          </p>
          <div className="w-10 h-[1px] bg-gold mx-auto mt-4" />
        </div>

        {addonCategories.map((cat) => (
          <AddonSlider key={cat.label} category={cat} />
        ))}
      </div>
    </section>
  );
};

export default AddonsSlider;
