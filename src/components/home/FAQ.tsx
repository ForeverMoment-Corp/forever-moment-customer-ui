import { useId, useState } from 'react'
import { Plus } from 'lucide-react'
import { useFaqs } from '@/features/faq'
import RichText from '@/lib/richText'
import SectionHeading from '@/components/home/SectionHeading'

const SANS = "'Jost', sans-serif"

/** The home page shows the top questions; the rest are on the FAQ page. */
const MAX_FAQS = 6

/**
 * Home page FAQ: one white panel of questions divided by thin rules (same family as "Why choose us"),
 * one open at a time, the first open on arrival.
 */
const FAQ = () => {
  const { faqs } = useFaqs()
  const [openIndex, setOpenIndex] = useState<number | null>(0)
  const baseId = useId()

  // Nothing to answer yet: render no section at all rather than an empty heading.
  if (faqs.length === 0) return null

  const visible = faqs.slice(0, MAX_FAQS)

  return (
    // Tighter than other sections and one 900px column (heading, link and panel aligned): no empty margins.
    <section className="bg-ivory py-8 md:py-10" style={{ fontFamily: SANS }}>
      <div className="mx-auto max-w-[900px] px-4 sm:px-6">
        <SectionHeading
          eyebrow="Frequently asked questions"
          title="Good to"
          accent="know"
          link={{ to: '/faqs', label: faqs.length > MAX_FAQS ? `All ${faqs.length} questions` : 'Help centre' }}
        />

        <ul className="divide-y divide-[var(--border-light)] overflow-hidden rounded-2xl border border-[var(--border-light)] bg-white">
          {visible.map((faq, index) => {
            const isOpen = openIndex === index
            const buttonId = `${baseId}-q-${index}`
            const panelId = `${baseId}-a-${index}`
            return (
              <li key={faq.id} className={`transition-colors ${isOpen ? 'bg-[var(--cream)]/70' : ''}`}>
                <h3>
                  <button
                    id={buttonId}
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => setOpenIndex(isOpen ? null : index)}
                    className="group flex w-full items-center justify-between gap-4 px-5 py-4 text-left sm:px-6"
                  >
                    {/* Jost explicitly: the global h3 style would otherwise make the question serif */}
                    <span
                      style={{ fontFamily: SANS }}
                      className={`text-[0.92rem] font-medium leading-snug transition-colors ${
                        isOpen ? 'text-[var(--burgundy)]' : 'text-ink group-hover:text-[var(--burgundy)]'
                      }`}
                    >
                      {faq.question}
                    </span>
                    <span
                      aria-hidden="true"
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-all duration-300 ${
                        isOpen ? 'rotate-45 bg-[var(--burgundy)] text-white' : 'bg-[var(--rose-light)] text-[var(--burgundy)]'
                      }`}
                    >
                      <Plus size={15} strokeWidth={2} />
                    </span>
                  </button>
                </h3>

                {/* grid-rows 0fr → 1fr opens to the answer's real height, however long it is */}
                <div
                  id={panelId}
                  role="region"
                  aria-labelledby={buttonId}
                  className={`grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none ${
                    isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                  }`}
                >
                  <div className="min-h-0 overflow-hidden">
                    <RichText html={faq.answer} className="px-5 pb-5 pr-14 text-[0.85rem] leading-relaxed text-[var(--mid)] sm:px-6 sm:pr-16" />
                  </div>
                </div>
              </li>
            )
          })}
        </ul>

      </div>
    </section>
  )
}

export default FAQ
