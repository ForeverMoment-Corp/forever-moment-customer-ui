import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FiArrowRight, FiPlus, FiCheck } from 'react-icons/fi'
import SmartImage from '@/components/common/SmartImage';

const gifts = [
  { id: 1, title: 'Luxury Red Roses', price: 799, image: 'https://images.unsplash.com/photo-1519378058457-4c29a0a2efac?w=800', category: 'Flowers' },
  { id: 2, title: 'Premium Chocolate Box', price: 999, image: 'https://images.unsplash.com/photo-1511381939415-e44015466834?w=800', category: 'Chocolates' },
  { id: 3, title: 'Romantic Teddy Bear', price: 699, image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800', category: 'Teddy' },
  { id: 4, title: 'White Lily Bouquet', price: 1199, image: 'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=800', category: 'Flowers' },
  { id: 5, title: 'Indoor Lucky Plant', price: 899, image: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=800', category: 'Plants' },
  { id: 6, title: 'Anniversary Gift Hamper', price: 1499, image: 'https://images.unsplash.com/photo-1512909006721-3d6018887383?w=800', category: 'Gift Hamper' },
]

const formatPrice = (price: number) => `₹${price.toLocaleString('en-IN')}`

const GiftPicker = () => {
  // ============================================
  // KONSE GIFTS CART MEIN HAIN — track karne ke liye
  // ============================================
  const [addedIds, setAddedIds] = useState<number[]>([])

  const handleToggleGift = (gift: typeof gifts[number]) => {
    if (addedIds.includes(gift.id)) {
      setAddedIds(addedIds.filter((id) => id !== gift.id))
      alert(`${gift.title} removed from cart`)
    } else {
      setAddedIds([...addedIds, gift.id])
      alert(`${gift.title} added to cart 🎁`)
    }
  }

  return (
    <section className="py-14 md:py-20 bg-gradient-to-b from-white to-ivory overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6">

        {/* ============================================
            HEADER — ek line mein, truncate se overflow nahi hoga
        ============================================ */}
        <div className="flex items-center justify-between gap-4 mb-8 md:mb-10">
          <div className="min-w-0">
            <p style={{ fontFamily: "'Jost', sans-serif" }} className="text-[0.65rem] text-gold tracking-[0.25em] uppercase mb-1.5 font-semibold whitespace-nowrap">
              Thoughtful Add-Ons
            </p>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif" }} className="truncate text-[1.4rem] md:text-[2.2rem] text-ink font-semibold leading-tight">
              Add A Gift They'll Never Forget 🎁
            </h2>
          </div>

          <Link to="/shop" style={{ fontFamily: "'Jost', sans-serif" }} className="hidden sm:flex items-center gap-2 text-[0.7rem] text-gold hover:text-gold-dark tracking-[0.15em] uppercase font-semibold transition-colors shrink-0">
            View All <FiArrowRight size={13} />
          </Link>
        </div>

        {/* Slider */}
        <div className="flex gap-4 md:gap-6 overflow-x-auto scrollbar-hide pb-2">
          {gifts.map((gift) => {
            const isAdded = addedIds.includes(gift.id)
            return (
              <div key={gift.id} className="group relative shrink-0 w-[210px] sm:w-[250px] md:w-[280px] rounded-[28px] overflow-hidden border border-wheat bg-white shadow-[0_10px_30px_color-mix(in_srgb,_var(--ink)_8%,_transparent)] hover:shadow-[0_25px_60px_color-mix(in_srgb,_var(--gold)_22%,_transparent)] transition-all duration-500 hover:-translate-y-2">

                <div className="relative h-[220px] overflow-hidden">
                  <SmartImage src={gift.image} alt={gift.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent" />
                  <span style={{ fontFamily: "'Jost', sans-serif" }} className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-white/90 backdrop-blur text-ink text-[9px] tracking-[0.18em] uppercase font-semibold">
                    {gift.category}
                  </span>
                </div>

                <div className="p-5">
                  <h3 style={{ fontFamily: "'Cormorant Garamond', serif" }} className="truncate text-[1.25rem] text-ink font-semibold leading-tight mb-3">{gift.title}</h3>

                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p style={{ fontFamily: "'Jost', sans-serif" }} className="text-[10px] uppercase tracking-[0.15em] text-umber">Starting From</p>
                      <p style={{ fontFamily: "'Jost', sans-serif" }} className="text-[1.15rem] font-semibold text-ink whitespace-nowrap tabular-nums">{formatPrice(gift.price)}</p>
                    </div>

                    <button
                      onClick={() => handleToggleGift(gift)}
                      style={{ fontFamily: "'Jost', sans-serif" }}
                      className={`flex items-center gap-1.5 px-4 py-2.5 rounded-full text-[11px] uppercase tracking-[0.1em] font-semibold transition-colors shrink-0 ${
                        isAdded ? 'bg-sage text-white' : 'bg-ink text-white hover:bg-gold'
                      }`}
                    >
                      {isAdded ? <><FiCheck size={12} /> Added</> : <><FiPlus size={12} /> Add</>}
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div className="sm:hidden text-center mt-8">
          <Link to="/shop" style={{ fontFamily: "'Jost', sans-serif" }} className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-gold text-gold text-[0.7rem] uppercase tracking-[0.15em] font-semibold">
            View All Gifts <FiArrowRight size={12} />
          </Link>
        </div>
      </div>
    </section>
  )
}

export default GiftPicker