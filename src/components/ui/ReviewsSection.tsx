import { FiStar } from 'react-icons/fi'
import { sampleReviews } from '../../data/reviews'
import Slider from './Slider'
import FadeIn from '../animations/FadeIn'

// ============================================
// id="reviews-section" — isi id pe rating click
// karne se "scroll" hoga (anchor link concept)
// ============================================
const ReviewsSection = () => {
  return (
    <div id="reviews-section" className="mt-16">
      <FadeIn>
        <h2 style={{ fontFamily: "'Cormorant Garamond', serif" }} className="text-[1.8rem] text-ink font-semibold mb-6">
          Customer Reviews 📸
        </h2>
      </FadeIn>

      <Slider>
        {sampleReviews.map((review) => (
          <div
            key={review.id}
            className="shrink-0 w-[300px] bg-white rounded-2xl p-5 shadow-[0_4px_16px_color-mix(in_srgb,_var(--ink)_6%,_transparent)]"
          >
            {/* User Info */}
            <div className="flex items-center gap-3 mb-3">
              <img src={review.avatar} alt={review.name} className="w-10 h-10 rounded-full object-cover" />
              <div>
                <p style={{ fontFamily: "'Jost', sans-serif" }} className="text-[0.82rem] text-ink font-semibold">{review.name}</p>
                <p style={{ fontFamily: "'Jost', sans-serif" }} className="text-[0.65rem] text-umber">{review.date}</p>
              </div>
            </div>

            {/* Stars */}
            <div className="flex gap-1 mb-2">
              {[...Array(5)].map((_, i) => (
                <FiStar key={i} size={12} fill={i < review.rating ? 'var(--coral)' : 'none'} color={i < review.rating ? 'var(--coral)' : 'var(--sand)'} />
              ))}
            </div>

            {/* Comment */}
            <p style={{ fontFamily: "'Jost', sans-serif" }} className="text-[0.8rem] text-taupe leading-relaxed mb-3">
              {review.comment}
            </p>

            {/* Customer Photos */}
            <div className="flex gap-2">
              {review.photos.map((photo, i) => (
                <img key={i} src={photo} alt="" className="w-16 h-16 rounded-lg object-cover" />
              ))}
            </div>
          </div>
        ))}
      </Slider>
    </div>
  )
}

export default ReviewsSection