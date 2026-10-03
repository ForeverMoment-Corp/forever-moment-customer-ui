import SectionCard, { Accent } from './SectionCard';
import RichText from '@/lib/richText';
import type { ExperienceVM } from '../types';
import { FONT_SANS } from '../normalize';

/** The long description. Arrives as plain text or as HTML from the admin. */
export default function Overview({ experience: e }: { experience: ExperienceVM }) {
  const tags = Array.from(new Set([e.categoryName, e.subCategoryName, ...e.locations].filter(Boolean)));
  if (!e.description.trim() && tags.length === 0) return null;

  return (
    <SectionCard id="overview" eyebrow="About this setup" title={<>The <Accent>experience</Accent></>}>
      <RichText
        html={e.description}
        className="max-w-[64ch] text-[0.95rem] leading-[1.65] text-[#4A3F35]"
      />
      {tags.length > 0 && (
        <ul style={{ fontFamily: FONT_SANS }} className="mt-4 flex flex-wrap gap-2">
          {tags.map((t) => (
            <li key={t} className="rounded-full bg-[var(--rose-light)] text-[var(--burgundy)] text-[0.78rem] font-medium px-2.5 py-1 capitalize">
              {t}
            </li>
          ))}
        </ul>
      )}
    </SectionCard>
  );
}
