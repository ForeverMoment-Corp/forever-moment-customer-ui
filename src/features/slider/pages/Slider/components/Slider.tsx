import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

const slides = [
  {
    id: 1,
    title: "Make Every Moment",
    titleEm: "Unforgettable",
    subtitle: "Handcrafted experiences for life's most precious celebrations",
    image: "https://images.unsplash.com/photo-1519741497674-611481863552?w=1600&q=80",
  },
  {
    id: 2,
    title: "Beautiful Birthday",
    titleEm: "Surprise Setups",
    subtitle: "Premium decoration & photography services",
    image: "https://images.unsplash.com/photo-1469371670807-013ccf25f16a?q=80&w=2070",
  },
  {
    id: 3,
    title: "Romantic Anniversary",
    titleEm: "Decorations",
    subtitle: "Create magical romantic experiences",
    image: "https://images.unsplash.com/photo-1520854221256-17451cc331bf?q=80&w=2070",
  },
  {
    id: 4,
    title: "Corporate Event",
    titleEm: "Specialists",
    subtitle: "Professional setups for modern businesses",
    image: "https://images.unsplash.com/photo-1505236858219-8359eb29e329?q=80&w=2070",
  },
];

interface SliderProps {
  locations?: any[];
  selectedLocation?: string;
  getLocations?: () => void;
  setSelectedLocation?: (location: string) => void;
}

export default function PremiumHeroSlider({
  locations = [],
  selectedLocation = "Vizag",
  getLocations,
  setSelectedLocation,
}: SliderProps) {
  const [index, setIndex] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const timeoutRef = useRef<any>(null);
  const locationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (getLocations && locations.length === 0) {
      getLocations();
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (locationRef.current && !locationRef.current.contains(event.target as Node)) {
        setShowLocationDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (hovered) return;
    timeoutRef.current = setTimeout(() => {
      setIndex((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearTimeout(timeoutRef.current);
  }, [index, hovered]);

  const next = () => setIndex(index === slides.length - 1 ? 0 : index + 1);
  const prev = () => setIndex(index === 0 ? slides.length - 1 : index - 1);

  return (
    <section
      className="relative w-full overflow-hidden"
      style={{ height: 540 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <AnimatePresence>
        <motion.div
          key={slides[index].id}
          initial={{ opacity: 0, scale: 1.08 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2 }}
          className="absolute inset-0"
        >
          <img src={slides[index].image} className="w-full h-full object-cover" alt="" />

          {/* Burgundy gradient overlay */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(135deg, color-mix(in srgb, var(--burgundy) 88%, transparent) 0%, color-mix(in srgb, var(--burgundy-dark) 70%, transparent) 40%, color-mix(in srgb, var(--charcoal) 50%, transparent) 100%)",
            }}
          />

          {/* Golden glow at bottom */}
          <div
            className="absolute bottom-[-60px] left-1/2 -translate-x-1/2 pointer-events-none"
            style={{
              width: 700,
              height: 200,
              background: "radial-gradient(ellipse, color-mix(in srgb, var(--gold) 25%, transparent), transparent 70%)",
            }}
          />

          {/* Content */}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              initial={{ y: 28, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.9 }}
              className="text-center px-6 max-w-2xl"
            >
              {/* Eyebrow */}
              <div
                className="mb-4"
                style={{
                  fontSize: "0.72rem",
                  letterSpacing: "0.28em",
                  textTransform: "uppercase",
                  color: "var(--gold-light)",
                  fontFamily: "'Jost', sans-serif",
                }}
              >
                India's #1 Celebration Platform
              </div>

              {/* Title */}
              <h2
                className="text-white mb-3"
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: "clamp(2.8rem, 6vw, 4.5rem)",
                  fontWeight: 300,
                  lineHeight: 1.12,
                }}
              >
                {slides[index].title}{" "}
                <em style={{ color: "var(--gold-light)" }}>{slides[index].titleEm}</em>
              </h2>

              {/* Subtitle */}
              <p
                className="mb-8"
                style={{
                  color: "rgba(255,255,255,0.75)",
                  fontSize: "0.95rem",
                  fontWeight: 300,
                  fontFamily: "'Jost', sans-serif",
                }}
              >
                {slides[index].subtitle}
              </p>

              {/* Hero search bar */}
              <div
                className="inline-flex items-center w-full"
                style={{
                  maxWidth: 520,
                  background: "white",
                  borderRadius: 50,
                  boxShadow: "0 8px 40px rgba(0,0,0,0.25)",
                }}
              >
                <input
                  type="text"
                  placeholder="What would you like to celebrate?"
                  className="flex-1 border-none outline-none bg-transparent px-5 py-3.5 rounded-l-full"
                  style={{
                    fontFamily: "'Jost', sans-serif",
                    fontSize: "0.9rem",
                    color: "var(--charcoal)",
                  }}
                />
                <div style={{ width: 1, height: 26, background: "#e5ddd5" }} />
                <div className="relative" ref={locationRef}>
                  <div
                    onClick={() => setShowLocationDropdown(!showLocationDropdown)}
                    className="flex items-center gap-1 px-4 py-3.5 whitespace-nowrap cursor-pointer hover:bg-gray-50 transition-colors"
                    style={{ fontSize: "0.85rem", color: "var(--mid)", fontFamily: "'Jost', sans-serif" }}
                  >
                    📍 {selectedLocation} ▾
                  </div>

                  {showLocationDropdown && (
                    <ul 
                      className="absolute left-0 mt-2 w-48 bg-white border border-[var(--border-light)] rounded-xl shadow-xl p-2 space-y-1 z-[400]"
                      style={{ transform: 'translateX(0)' }}
                    >
                      {locations.filter((loc: any) => loc.isActive).map((loc: any) => (
                        <li
                          key={loc.id || loc.name}
                          onClick={() => {
                            if (setSelectedLocation) setSelectedLocation(loc.name);
                            setShowLocationDropdown(false);
                          }}
                          className={`px-3 py-2 rounded-lg text-sm cursor-pointer transition ${
                            selectedLocation === loc.name ? 'font-medium' : ''
                          }`}
                          style={{
                            background: selectedLocation === loc.name ? 'var(--burgundy)' : 'transparent',
                            color: selectedLocation === loc.name ? 'white' : 'var(--charcoal)',
                          }}
                        >
                          {loc.name}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <button
                  className="px-6 py-3.5 whitespace-nowrap font-medium border-none cursor-pointer rounded-r-full"
                  style={{
                    background: "linear-gradient(135deg, var(--burgundy), var(--wine))",
                    color: "white",
                    fontFamily: "'Jost', sans-serif",
                    fontSize: "0.88rem",
                  }}
                >
                  Explore →
                </button>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Left Arrow */}
      <button
        onClick={prev}
        className="absolute left-6 top-1/2 -translate-y-1/2 p-3 rounded-full backdrop-blur-md transition-all hover:scale-110"
        style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.2)" }}
      >
        <ChevronLeft className="text-white" size={20} />
      </button>

      {/* Right Arrow */}
      <button
        onClick={next}
        className="absolute right-6 top-1/2 -translate-y-1/2 p-3 rounded-full backdrop-blur-md transition-all hover:scale-110"
        style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.2)" }}
      >
        <ChevronRight className="text-white" size={20} />
      </button>

      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 w-full h-1" style={{ background: "rgba(255,255,255,0.2)" }}>
        <motion.div
          key={index}
          initial={{ width: 0 }}
          animate={{ width: "100%" }}
          transition={{ duration: 5 }}
          className="h-full"
          style={{ background: "var(--gold)" }}
        />
      </div>

      {/* Dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3">
        {slides.map((_, i) => (
          <div
            key={i}
            onClick={() => setIndex(i)}
            className="w-3 h-3 rounded-full cursor-pointer transition-all duration-300"
            style={{
              background: i === index ? "var(--gold-light)" : "rgba(255,255,255,0.5)",
              transform: i === index ? "scale(1.25)" : "scale(1)",
            }}
          />
        ))}
      </div>
    </section>
  );
}