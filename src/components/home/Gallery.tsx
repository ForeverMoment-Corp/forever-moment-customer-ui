import SmartImage from '@/components/common/SmartImage';
const galleryImages = [
  'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=500',
  'https://images.unsplash.com/photo-1478146896981-b80fe463b330?w=500',
  'https://images.unsplash.com/photo-1606800052052-a08af7148866?w=500',
  'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=500',
  'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=500',
  'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=500',
  'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=500',
]

const Gallery = () => {
  const imgClass = "w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 rounded-2xl"
  const wrapClass = "overflow-hidden group shadow-[0_4px_16px_rgba(26,18,8,0.06)] hover:shadow-[0_16px_40px_rgba(201,168,76,0.25)] transition-all duration-300 rounded-2xl"

  return (
    <section className="section-padding bg-white">
      <div className="max-w-[1380px] mx-auto px-6">
        <div className="text-center mb-12">
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif" }} className="text-[2rem] md:text-[2.6rem] text-[#1A1208] font-semibold mb-2">
            Moment Gallery
          </h2>
          <p style={{ fontFamily: "'Jost', sans-serif" }} className="text-[0.7rem] text-[#9E8A6A] tracking-[0.25em] uppercase">
            Pure Inspiration
          </p>
          <div className="w-10 h-[1px] bg-[#C9A84C] mx-auto mt-4" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 auto-rows-[150px] md:auto-rows-[180px]">
          <div className={`col-span-2 row-span-2 ${wrapClass}`}>
            <SmartImage src={galleryImages[0]} alt="" className={imgClass} />
          </div>
          <div className={wrapClass}>
            <SmartImage src={galleryImages[1]} alt="" className={imgClass} />
          </div>
          <div className={wrapClass}>
            <SmartImage src={galleryImages[2]} alt="" className={imgClass} />
          </div>
          <div className={`row-span-2 ${wrapClass}`}>
            <SmartImage src={galleryImages[3]} alt="" className={imgClass} />
          </div>
          <div className={wrapClass}>
            <SmartImage src={galleryImages[4]} alt="" className={imgClass} />
          </div>
          <div className={`col-span-2 ${wrapClass}`}>
            <SmartImage src={galleryImages[5]} alt="" className={imgClass} />
          </div>
          <div className={wrapClass}>
            <SmartImage src={galleryImages[6]} alt="" className={imgClass} />
          </div>
        </div>

        <div className="text-center mt-10">
          <button style={{ fontFamily: "'Jost', sans-serif" }} className="bg-[#1A1208] text-white rounded-full px-8 py-3.5 text-[0.75rem] tracking-[0.2em] uppercase font-medium hover:bg-[#D9776B] transition-colors">
            Follow on Instagram
          </button>
        </div>
      </div>
    </section>
  )
}

export default Gallery
