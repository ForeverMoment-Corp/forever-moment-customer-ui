import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FiCheck } from 'react-icons/fi'
import { shopItems } from '../../data/shopItems'
import { useAppDispatch } from '../../store/hooks'
import { addToCart, removeFromCart } from '../../store/cartSlice'
import { showToast } from '../../store/uiSlice'
import Slider from './Slider'

const formatPrice = (price: number) => `₹${price.toLocaleString('en-IN')}`

interface Props {
  excludeId?: number
  title?: string
}

const GiftsSlider = ({ excludeId, title = '🎁 Add A Gift' }: Props) => {
  const dispatch = useAppDispatch()
  const gifts = shopItems.filter((g) => g.id !== excludeId).slice(0, 8)
  const [addedIds, setAddedIds] = useState<number[]>([])

  const handleToggle = (gift: typeof gifts[number]) => {
    if (addedIds.includes(gift.id)) {
      dispatch(removeFromCart(gift.id))
      setAddedIds(addedIds.filter((id) => id !== gift.id))
    } else {
      dispatch(addToCart({ id: gift.id, title: gift.title, category: gift.category, price: gift.price, image: gift.image }))
      setAddedIds([...addedIds, gift.id])
      dispatch(showToast({ message: `${gift.title} added to cart! 🎉` }))
    }
  }

  return (
    <div className="mb-6">
      <h3 style={{ fontFamily: "'Jost', sans-serif" }} className="text-[0.7rem] text-ink font-semibold tracking-[0.15em] uppercase mb-3 whitespace-nowrap">{title}</h3>
      <Slider>
        {gifts.map((gift) => {
          const isAdded = addedIds.includes(gift.id)
          return (
            <div key={gift.id} className="shrink-0 w-[150px] bg-white rounded-xl p-3 shadow-[0_2px_8px_color-mix(in_srgb,_var(--ink)_5%,_transparent)]">
              <Link to={`/shop/${gift.id}`}>
                <div className="w-full aspect-square rounded-lg overflow-hidden mb-2">
                  <img src={gift.image} alt={gift.title} className="w-full h-full object-cover" />
                </div>
                <p style={{ fontFamily: "'Jost', sans-serif" }} className="text-[0.72rem] text-ink font-medium leading-snug mb-1 truncate">{gift.title}</p>
              </Link>
              <div className="flex items-center justify-between gap-1">
                <span style={{ fontFamily: "'Jost', sans-serif" }} className="text-[0.74rem] text-gold font-semibold shrink-0">{formatPrice(gift.price)}</span>
                <button
                  onClick={() => handleToggle(gift)}
                  className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors text-[0.8rem] shrink-0 ${isAdded ? 'bg-sage text-white' : 'bg-ink text-white hover:bg-gold'}`}
                >
                  {isAdded ? <FiCheck size={12} /> : '+'}
                </button>
              </div>
            </div>
          )
        })}
      </Slider>
    </div>
  )
}

export default GiftsSlider