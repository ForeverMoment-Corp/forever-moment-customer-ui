import { Link } from 'react-router-dom'

const CtaBanner = () => {
  return (
    <section className="relative bg-ink py-16 md:py-24 overflow-hidden">

      {/* Decorative gold glow circles */}
      <div
        className="absolute top-0 left-1/4 w-[300px] h-[300px] rounded-full opacity-20"
        style={{ background: 'var(--gold)', filter: 'blur(120px)' }}
      />
      <div
        className="absolute bottom-0 right-1/4 w-[300px] h-[300px] rounded-full opacity-15"
        style={{ background: 'var(--gold)', filter: 'blur(120px)' }}
      />

      {/* Content */}
      <div className="max-w-[1380px] mx-auto px-6 relative z-10 text-center">

        {/* Small label */}
        <div className="inline-flex items-center gap-2 border border-gold-bright/40 px-4 py-1.5 mb-6">
          <div className="w-1.5 h-1.5 rounded-full bg-gold" />
          <span style={{ fontFamily: "'Jost', sans-serif" }} className="text-[0.65rem] text-gold-bright tracking-[0.25em]">
            LET'S CREATE SOMETHING BEAUTIFUL
          </span>
        </div>

        {/* Heading */}
        <h2
          style={{ fontFamily: "'Cormorant Garamond', serif" }}
          className="text-[2.2rem] md:text-[3.4rem] text-white font-semibold leading-tight mb-4 max-w-[700px] mx-auto"
        >
          Ready to Make Your Next Moment{' '}
          <span className="italic text-gold-pale">Iconic?</span>
        </h2>

        {/* Description */}
        <p
          style={{ fontFamily: "'Jost', sans-serif" }}
          className="text-[0.9rem] text-white/60 max-w-[480px] mx-auto mb-10 leading-relaxed"
        >
          Join our happy clients who've experienced Forever Moment for their most precious occasions.
        </p>

        {/* Buttons */}
        <div className="flex flex-wrap gap-4 justify-center">
          <Link
            to="/packages"
            style={{ fontFamily: "'Jost', sans-serif" }}
            className="bg-gold text-white px-9 py-4 text-[0.78rem] tracking-[0.2em] uppercase font-semibold hover:bg-gold-bright hover:text-ink transition-all"
          >
            Browse Packages
          </Link>
          <Link
            to="/contact"
            style={{ fontFamily: "'Jost', sans-serif" }}
            className="border border-white/30 text-white px-9 py-4 text-[0.78rem] tracking-[0.2em] uppercase font-semibold hover:bg-white hover:text-ink transition-all"
          >
            Consult a Designer
          </Link>
        </div>

      </div>
    </section>
  )
}

export default CtaBanner
