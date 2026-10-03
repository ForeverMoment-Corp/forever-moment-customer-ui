import { useState } from 'react'
import { FiCheck } from 'react-icons/fi'
import { combos } from '../../data/combos'
import FadeIn from '../animations/FadeIn'
import Slider from '../ui/Slider'
import SmartImage from '@/components/common/SmartImage';

const formatPrice = (price: number) => `₹${price.toLocaleString('en-IN')}`

const ComboDeals = () => {
  // ============================================
  // KONSE COMBOS ADD HO GAYE — track karne ke liye
  // ============================================
  const [addedCombos, setAddedCombos] = useState<number[]>([])

  const handleToggleCombo = (combo: typeof combos[number]) => {
    if (addedCombos.includes(combo.id)) {
      // REMOVE — cart se sab items hatao, list se bhi hatao
      setAddedCombos(addedCombos.filter((id) => id !== combo.id))
      alert(`${combo.title} removed from cart`)
    } else {
      setAddedCombos([...addedCombos, combo.id])
      alert(`${combo.title} added to cart! 🎁`)
    }
  }

  return (
    <section className="section-padding bg-[#1A1208]">
      <div className="container mx-auto px-6">
        <FadeIn>
          <div className="text-center mb-10">
            <p style={{ fontFamily: "'Jost', sans-serif" }} className="text-[0.7rem] text-[#D9776B] tracking-[0.25em] uppercase mb-2">Bundle & Save</p>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif" }} className="text-[2rem] md:text-[2.6rem] text-white font-semibold">Combo Deals ⚡</h2>
          </div>
        </FadeIn>

        <Slider>
          {combos.map((combo) => {
            const isAdded = addedCombos.includes(combo.id)
            const originalTotal = combo.items.reduce((sum, i) => sum + i.price, 0)

            return (
              <div key={combo.id} className="shrink-0 w-[320px] bg-white rounded-2xl p-5 shadow-[0_8px_30px_rgba(0,0,0,0.2)]">
                <div className="flex items-center justify-between mb-3 gap-2">
                  <h3 style={{ fontFamily: "'Cormorant Garamond', serif" }} className="text-[1.15rem] text-[#1A1208] font-semibold leading-snug truncate">{combo.title}</h3>
                  <span style={{ fontFamily: "'Jost', sans-serif" }} className="bg-[#7B9E7B] text-white rounded-full text-[0.6rem] px-2.5 py-1 font-semibold shrink-0 whitespace-nowrap">{combo.badge}</span>
                </div>

                <p style={{ fontFamily: "'Jost', sans-serif" }} className="text-[0.78rem] text-[#9E8A6A] leading-relaxed mb-4 line-clamp-2">{combo.description}</p>

                {/* ============================================
                    Images — object-cover + fixed aspect, ab chipkega nahi
                ============================================ */}
                <div className="flex gap-2 mb-4">
                  {combo.items.map((item, i) => (
                    <div key={item.id} className="relative flex-1">
                      <div className="w-full aspect-square rounded-lg overflow-hidden bg-[#FDFAF4]">
                        <SmartImage src={item.image} alt={item.title} className="w-full h-full object-cover" />
                      </div>
                      {i < combo.items.length - 1 && (
                        <span className="absolute -right-[9px] top-1/2 -translate-y-1/2 text-[#C9A84C] font-bold text-[0.9rem] z-10">+</span>
                      )}
                    </div>
                  ))}
                </div>

                {/* ============================================
                    Price with discount + Add Combo — ek line mein
                ============================================ */}
                <div className="flex items-center justify-between pt-3 border-t border-[#EDE0C4] gap-3">
                  <div className="flex items-baseline gap-1.5 flex-wrap">
                    <span style={{ fontFamily: "'Cormorant Garamond', serif" }} className="text-[1.25rem] text-[#1A1208] font-bold">{formatPrice(combo.comboPrice)}</span>
                    <span style={{ fontFamily: "'Jost', sans-serif" }} className="text-[0.7rem] text-[#9E8A6A] line-through">{formatPrice(originalTotal)}</span>
                  </div>
                  <button
                    onClick={() => handleToggleCombo(combo)}
                    style={{ fontFamily: "'Jost', sans-serif" }}
                    className={`flex items-center gap-1.5 rounded-full px-4 py-2.5 text-[0.65rem] tracking-[0.1em] uppercase font-semibold transition-colors shrink-0 ${
                      isAdded ? 'bg-[#7B9E7B] text-white' : 'bg-[#C9A84C] text-white hover:bg-[#1A1208]'
                    }`}
                  >
                    {isAdded ? <><FiCheck size={12} /> Added</> : 'Add Combo'}
                  </button>
                </div>
              </div>
            )
          })}
        </Slider>
      </div>
    </section>
  )
}

export default ComboDeals