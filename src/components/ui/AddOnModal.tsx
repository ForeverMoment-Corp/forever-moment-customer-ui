import { useState } from 'react'
import { motion } from 'framer-motion'
import { FiX } from 'react-icons/fi'

interface AddOn {
  id: number
  name: string
  price: number
  image: string
  category?: string
}

interface AddOnModalProps {
  addOns: AddOn[]
  categories?: string[]
  selectedAddOns: number[]
  onToggle: (id: number) => void
  onClose: () => void
}

const formatPrice = (price: number) => `₹${price.toLocaleString('en-IN')}`

// ============================================
// REUSABLE MODAL — "+" click karne se khulta hai
// filter tabs + checkbox list + "Done" button
// ============================================
const AddOnModal = ({ addOns, categories, selectedAddOns, onToggle, onClose }: AddOnModalProps) => {
  const [filter, setFilter] = useState('All')

  const filtered = filter === 'All' ? addOns : addOns.filter((a) => a.category === filter)
  const addedTotal = addOns.filter((a) => selectedAddOns.includes(a.id)).reduce((sum, a) => sum + a.price, 0)

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      {/* Backdrop — click karke band ho jaye */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative bg-white rounded-2xl w-full max-w-[480px] max-h-[80vh] overflow-hidden flex flex-col shadow-[0_20px_60px_color-mix(in_srgb,_var(--ink)_25%,_transparent)]"
      >
        {/* Header */}
       <div className="flex items-center justify-between px-6 pt-6 pb-4">
  <h3 style={{ fontFamily: "'Cormorant Garamond', serif" }} className="text-[1.4rem] text-ink font-semibold leading-snug">
    Customize Your Experience
  </h3>
  <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-ivory transition-colors shrink-0">
    <FiX size={18} />
  </button>
</div>

        {/* Filter Tabs */}
{categories && (
  <div className="px-6 pb-4 border-b border-sand">
    <div className="flex gap-2 p-1 bg-[#FAF7F1] rounded-full overflow-x-auto scrollbar-hide">
      {['All', ...categories].map((c) => (
        <button
          key={c}
          onClick={() => setFilter(c)}
          style={{ fontFamily: "'Jost', sans-serif" }}
          className={`shrink-0 rounded-full px-5 h-9 text-[13px] font-medium transition-all duration-300 ${
            filter === c
              ? 'bg-ink text-white shadow-sm'
              : 'text-[#6F5A2B] hover:bg-white'
          }`}
        >
          {c}
        </button>
      ))}
    </div>
  </div>
)}
        {/* List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {filtered.map((addOn) => {
            const isSelected = selectedAddOns.includes(addOn.id)
            return (
              <label
                key={addOn.id}
                className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${isSelected ? 'border-gold bg-ivory' : 'border-sand bg-white'}`}
              >
                <input type="checkbox" checked={isSelected} onChange={() => onToggle(addOn.id)} className="accent-coral w-4 h-4 cursor-pointer rounded shrink-0" />
                <img src={addOn.image} alt={addOn.name} className="w-12 h-12 rounded-lg object-cover shrink-0" />
                <div className="flex-1">
                  <p style={{ fontFamily: "'Jost', sans-serif" }} className="text-[0.82rem] text-ink font-medium">{addOn.name}</p>
                  {addOn.category && <p style={{ fontFamily: "'Jost', sans-serif" }} className="text-[0.65rem] text-umber">{addOn.category}</p>}
                </div>
                <p style={{ fontFamily: "'Jost', sans-serif" }} className="text-[0.82rem] text-gold font-semibold shrink-0">+ {formatPrice(addOn.price)}</p>
              </label>
            )
          })}
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-sand flex items-center justify-between bg-ivory">
          <div>
            <p style={{ fontFamily: "'Jost', sans-serif" }} className="text-[0.7rem] text-umber">{selectedAddOns.length} item(s) selected</p>
            <p style={{ fontFamily: "'Cormorant Garamond', serif" }} className="text-[1.1rem] text-ink font-bold">+ {formatPrice(addedTotal)}</p>
          </div>
          <button onClick={onClose} style={{ fontFamily: "'Jost', sans-serif" }} className="bg-gold text-white rounded-full px-8 py-3 text-[0.75rem] tracking-[0.15em] uppercase font-semibold hover:bg-ink transition-colors">
            Done
          </button>
        </div>
      </motion.div>
    </div>
  )
}

export default AddOnModal