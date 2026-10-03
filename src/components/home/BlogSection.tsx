import { Link } from 'react-router-dom'
import { FiArrowRight, FiCalendar } from 'react-icons/fi'
import SmartImage from '@/components/common/SmartImage';

const blogs = [
  { title: '10 Trending Wedding Decor Themes for 2026', excerpt: 'From minimalist floral to maximalist gold accents — explore what\'s in style this season.', image: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=500', date: 'June 5, 2026', category: 'Wedding' },
  { title: 'How to Plan a Surprise Birthday on a Budget', excerpt: 'Smart tips to create a memorable celebration without overspending on decor.', image: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=500', date: 'May 28, 2026', category: 'Birthday' },
  { title: 'Corporate Event Lighting: A Complete Guide', excerpt: 'Set the right mood for product launches and conferences with these lighting tricks.', image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=500', date: 'May 20, 2026', category: 'Corporate' },
]

const BlogSection = () => {
  return (
    <section className="section-padding bg-[#FDFAF4]">
      <div className="max-w-[1380px] mx-auto px-6">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-12 gap-4">
          <div>
            <p style={{ fontFamily: "'Jost', sans-serif" }} className="text-[0.7rem] text-[#C9A84C] tracking-[0.25em] uppercase mb-2">
              From Our Journal
            </p>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif" }} className="text-[2rem] md:text-[2.6rem] text-[#1A1208] font-semibold">
              Planning Tips & Inspiration
            </h2>
          </div>
          <Link to="/blog" style={{ fontFamily: "'Jost', sans-serif" }} className="text-[0.75rem] text-[#1A1208] tracking-[0.2em] uppercase font-medium hover:text-[#D9776B] transition-colors flex items-center gap-2 shrink-0">
            View All Articles <FiArrowRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {blogs.map((blog) => (
            <Link
              to="/blog"
              key={blog.title}
              className="group block bg-white rounded-2xl overflow-hidden shadow-[0_4px_16px_rgba(26,18,8,0.06)] hover:shadow-[0_16px_40px_rgba(201,168,76,0.2)] hover:-translate-y-2 transition-all duration-300"
            >
              <div className="relative h-[220px] overflow-hidden">
                <SmartImage src={blog.image} alt={blog.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                <span style={{ fontFamily: "'Jost', sans-serif" }} className="absolute top-3 left-3 bg-[#D9776B] text-white rounded-full text-[0.6rem] px-3 py-1.5 tracking-[0.15em] uppercase font-semibold">
                  {blog.category}
                </span>
              </div>
              <div className="p-5">
                <div className="flex items-center gap-2 mb-2">
                  <FiCalendar size={12} color="#C9A84C" />
                  <span style={{ fontFamily: "'Jost', sans-serif" }} className="text-[0.72rem] text-[#9E8A6A]">{blog.date}</span>
                </div>
                <h3 style={{ fontFamily: "'Cormorant Garamond', serif" }} className="text-[1.2rem] text-[#1A1208] font-semibold mb-2 leading-snug group-hover:text-[#C9A84C] transition-colors">
                  {blog.title}
                </h3>
                <p style={{ fontFamily: "'Jost', sans-serif" }} className="text-[0.82rem] text-[#9E8A6A] leading-relaxed">
                  {blog.excerpt}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

export default BlogSection
