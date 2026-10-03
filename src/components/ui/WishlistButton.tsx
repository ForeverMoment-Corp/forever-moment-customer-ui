import { FiHeart } from 'react-icons/fi'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { toggleWishlist } from '../../store/wishlistSlice'
import type { WishlistItem } from '../../store/wishlistSlice'

interface Props {
  item: WishlistItem
  size?: number
  className?: string
}

// ============================================
// REUSABLE WISHLIST BUTTON — kahin bhi use kar sakte ho
// khud check karta hai ki already wishlist mein hai ya nahi
// ============================================
const WishlistButton = ({ item, size = 16, className = '' }: Props) => {
  const dispatch = useAppDispatch()
  const wishlistItems = useAppSelector((state) => state.wishlist.items)
  const isWishlisted = wishlistItems.some((w) => w.id === item.id)

  return (
    <button
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        dispatch(toggleWishlist(item))
      }}
      className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
        isWishlisted ? 'bg-coral text-white' : 'bg-white/90 text-ink hover:bg-white'
      } ${className}`}
    >
      <FiHeart size={size} fill={isWishlisted ? 'white' : 'none'} />
    </button>
  )
}

export default WishlistButton