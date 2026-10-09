import { Swiper, SwiperSlide } from "swiper/react"
import { Navigation } from "swiper/modules"

import "swiper/css"
import "swiper/css/navigation"

import { Heart, ShoppingCart, ChevronLeft, ChevronRight } from "lucide-react"
import SmartImage from '@/components/common/SmartImage';
import { useRequireAuth } from '@/features/auth/hooks/useRequireAuth';

const gifts = [
  {
    id:1,
    name:"Rose Bucket",
    price:999,
    img:"https://images.unsplash.com/photo-1525310072745-f49212b5ac6d"
  },
  {
    id:2,
    name:"Chocolate Hamper",
    price:1199,
    img:"https://images.unsplash.com/photo-1511381939415-e44015466834"
  },
  {
    id:3,
    name:"Teddy Gift",
    price:899,
    img:"https://images.unsplash.com/photo-1582794543139-8ac9cb0f7b11"
  },
  {
    id:4,
    name:"Balloon Surprise",
    price:799,
    img:"https://images.unsplash.com/photo-1504196606672-aef5c9cefc92"
  },
  {
    id:5,
    name:"Rose Bouquet",
    price:699,
    img:"https://images.unsplash.com/photo-1490750967868-88aa4486c946"
  },
  {
    id:6,
    name:"Couple Mug",
    price:599,
    img:"https://images.unsplash.com/photo-1514228742587-6b1558fcf93a"
  },
  {
    id:7,
    name:"Ferrero Box",
    price:999,
    img:"https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b"
  },
  {
    id:8,
    name:"Photo Frame",
    price:749,
    img:"https://images.unsplash.com/photo-1500530855697-b586d89ba3ee"
  },
  {
    id:9,
    name:"Mini Cake",
    price:499,
    img:"https://images.unsplash.com/photo-1606313564200-e75d5e30476c"
  },
  {
    id:10,
    name:"Love Combo",
    price:1299,
    img:"https://images.unsplash.com/photo-1492724441997-5dc865305da7"
  }
]

export default function GiftSlider(){

  const requireAuth = useRequireAuth()

  return(

    <section className="max-w-[1200px] mx-auto mt-16 px-4 relative">

      {/* TITLE */}

      <h2 className="text-2xl font-bold mb-6">
        Related Gifts & Experiences
      </h2>

      {/* ARROWS */}

      <button className="gift-prev absolute left-0 top-[45%] z-10 bg-white shadow-lg rounded-full p-2 hover:scale-110 transition">

        <ChevronLeft size={22}/>

      </button>

      <button className="gift-next absolute right-0 top-[45%] z-10 bg-white shadow-lg rounded-full p-2 hover:scale-110 transition">

        <ChevronRight size={22}/>

      </button>


      <Swiper

        modules={[Navigation]}

        navigation={{
          prevEl:".gift-prev",
          nextEl:".gift-next"
        }}

        spaceBetween={20}

        breakpoints={{
          320:{slidesPerView:1.2},
          640:{slidesPerView:2},
          1024:{slidesPerView:3},
          1280:{slidesPerView:4}
        }}

      >

        {gifts.map((gift)=>(

          <SwiperSlide key={gift.id}>

            <div className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition duration-300 group">

              {/* IMAGE */}

              <div className="relative overflow-hidden">

                <SmartImage
                  src={gift.img}
                  className="h-56 w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                />

                {/* HEART */}

                <button
                  type="button"
                  aria-label="Save to wishlist"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    requireAuth()
                  }}
                  className="absolute top-3 right-3 bg-white/90 backdrop-blur p-2 rounded-full shadow hover:scale-110 transition">

                  <Heart size={16}/>

                </button>

              </div>

              {/* CONTENT */}

              <div className="p-4 space-y-2">

                <h3 className="font-semibold text-[15px]">
                  {gift.name}
                </h3>

                <p className="text-[var(--primary)] font-bold">
                  ₹{gift.price}
                </p>

                <button className="w-full flex items-center justify-center gap-2 bg-[var(--primary)] text-white py-2 rounded-lg text-sm font-medium hover:scale-[1.03] active:scale-95 transition">

                  <ShoppingCart size={16}/>
                  Add to Cart

                </button>

              </div>

            </div>

          </SwiperSlide>

        ))}

      </Swiper>

    </section>

  )

}