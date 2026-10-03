import { useState } from 'react'
import { FiPlus, FiMinus } from 'react-icons/fi'
import { useFaqs } from '@/features/faq'
import RichText from '@/lib/richText'

const FAQ = () => {
  const { faqs } = useFaqs()
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  // Nothing to answer yet: render no section at all rather than an empty heading.
  if (faqs.length === 0) return null

  return (
    <section className="section-padding bg-ivory">
      <div className="max-w-[1380px] mx-auto px-6">

        {/* Heading */}
        <div className="text-center mb-12">
          <h2
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
            className="text-[2rem] md:text-[2.6rem] text-ink font-semibold mb-2"
          >
            Good to Know
          </h2>
          <p
            style={{ fontFamily: "'Jost', sans-serif" }}
            className="text-[0.7rem] text-umber tracking-[0.25em] uppercase"
          >
            Frequently Asked Questions
          </p>
          <div className="w-10 h-[1px] bg-gold mx-auto mt-4" />
        </div>

        {/* FAQ List */}
        <div className="max-w-[700px] mx-auto space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index

            return (
              <div
                key={faq.id}
                className="bg-white border border-sand overflow-hidden"
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left"
                >
                  <span
                    style={{ fontFamily: "'Jost', sans-serif" }}
                    className="text-[0.92rem] text-ink font-medium"
                  >
                    {faq.question}
                  </span>

                  <span className="shrink-0 w-7 h-7 rounded-full border border-sand flex items-center justify-center">
                    {isOpen ? <FiMinus size={13} color="var(--gold)" /> : <FiPlus size={13} color="var(--gold)" />}
                  </span>
                </button>

                <div
                  className={`transition-all duration-300 ease-in-out overflow-hidden ${
                    isOpen ? 'max-h-[600px]' : 'max-h-0'
                  }`}
                >
                  <div style={{ fontFamily: "'Jost', sans-serif" }}>
                    <RichText
                      html={faq.answer}
                      className="px-6 pb-5 text-[0.85rem] text-umber leading-relaxed"
                    />
                  </div>
                </div>
              </div>
            )
          })}
        </div>

      </div>
    </section>
  )
}

export default FAQ
