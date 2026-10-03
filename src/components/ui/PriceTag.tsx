const formatPrice = (price: number) => `₹${price.toLocaleString('en-IN')}`

interface Props {
  price: number
  discountPercent?: number
  size?: 'sm' | 'md' | 'lg'
}

// ============================================
// REUSABLE PRICE TAG — agar discount % diya hai
// toh original price kate hue dikhega + naya price
// ============================================
const PriceTag = ({ price, discountPercent = 20, size = 'md' }: Props) => {
  const originalPrice = Math.round(price / (1 - discountPercent / 100))
  const sizeClasses = {
    sm: 'text-[0.95rem]',
    md: 'text-[1.05rem]',
    lg: 'text-[1.8rem]',
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span style={{ fontFamily: "'Jost', sans-serif" }} className={`${sizeClasses[size]} text-ink font-bold`}>
        {formatPrice(price)}
      </span>
      <span style={{ fontFamily: "'Jost', sans-serif" }} className="text-[0.75rem] text-umber line-through">
        {formatPrice(originalPrice)}
      </span>
      <span style={{ fontFamily: "'Jost', sans-serif" }} className="text-[0.68rem] text-sage font-semibold">
        {discountPercent}% OFF
      </span>
    </div>
  )
}

export default PriceTag