import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import SectionCard, { Accent } from './SectionCard';
import type { FaqItem } from '../types';
import { FONT_SANS } from '../normalize';
import RichText from '@/lib/richText';

export default function FAQ({ items }: { items: FaqItem[] }) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <SectionCard id="faq" eyebrow="Good to know" title={<>Questions, <Accent>answered</Accent></>}>
      <div>
        {items.map((faq, i) => {
          const isOpen = open === i;
          return (
            <div key={`${faq.q}-${i}`} className="border-b border-[var(--border-light)]">
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : i)}
                aria-expanded={isOpen}
                style={{ fontFamily: FONT_SANS }}
                className="w-full flex items-center justify-between gap-4 py-3.5 text-left group"
              >
                <span className={`text-[0.98rem] font-medium leading-snug transition-colors ${isOpen ? 'text-[var(--burgundy)]' : 'text-[var(--charcoal)] group-hover:text-[var(--burgundy)]'}`}>
                  {faq.q}
                </span>
                <span
                  className={`shrink-0 w-[30px] h-[30px] rounded-full border flex items-center justify-center transition-all duration-300 ${
                    isOpen ? 'bg-[var(--burgundy)] border-[var(--burgundy)] text-white rotate-45' : 'bg-white border-[var(--border-light)] text-[var(--mid)]'
                  }`}
                >
                  <Plus size={15} />
                </span>
              </button>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                    className="overflow-hidden"
                  >
                    <RichText
                      html={faq.a}
                      className="pb-4 pr-12 text-[0.88rem] leading-relaxed text-[#4A3F35]"
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </SectionCard>
  );
}
