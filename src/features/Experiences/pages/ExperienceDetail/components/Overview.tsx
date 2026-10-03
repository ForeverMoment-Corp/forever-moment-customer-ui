import { Clock, MapPin, Timer, Users } from 'lucide-react';
import SectionCard, { Accent } from './SectionCard';
import RichText from '@/lib/richText';
import type { ExperienceVM } from '../types';
import { FONT_SANS, FONT_SERIF, formatDuration } from '../normalize';

/** The long description, opened by an "at a glance" strip built from the experience's own data. */
export default function Overview({ experience: e }: { experience: ExperienceVM }) {
  const tags = Array.from(new Set([e.categoryName, e.subCategoryName, ...e.locations].filter(Boolean)));
  if (!e.description.trim() && tags.length === 0) return null;

  const facts = [
    e.durationMinutes > 0 && { icon: Timer, label: 'Setup time', value: formatDuration(e.durationMinutes) },
    e.maxCapacity > 0 && { icon: Users, label: 'Guests', value: `Up to ${e.maxCapacity}` },
    e.locations.length > 0 && {
      icon: MapPin,
      label: e.locations.length === 1 ? 'City' : 'Cities',
      value: e.locations.length <= 2 ? e.locations.join(', ') : `${e.locations.length} cities`,
      capitalize: true,
    },
    e.timeslots.length > 0 && { icon: Clock, label: 'Time slots', value: `${e.timeslots.length} a day` },
  ].filter(Boolean) as { icon: typeof Clock; label: string; value: string; capitalize?: boolean }[];

  return (
    <SectionCard id="overview" eyebrow="About this setup" title={<>The <Accent>experience</Accent></>}>
      {facts.length > 0 && (
        // One column per fact from `sm` up, so two facts split the row evenly instead of leaving gaps.
        <dl
          style={{ '--facts': facts.length } as React.CSSProperties}
          className={`mb-5 grid overflow-hidden rounded-[18px] border border-[var(--sand)] bg-white sm:[grid-template-columns:repeat(var(--facts),minmax(0,1fr))] ${facts.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}
        >
          {facts.map(({ icon: Icon, label, value, capitalize }, i) => (
            <div
              key={label}
              className={`flex flex-col gap-1 px-4 py-3.5 ${i % 2 === 1 ? 'border-l' : ''} ${i >= 2 ? 'border-t sm:border-t-0' : ''} ${i > 0 ? 'sm:border-l' : ''} border-[var(--sand)]`}
            >
              <dt style={{ fontFamily: FONT_SANS }} className="flex items-center gap-1.5 text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-[var(--mid)]">
                <Icon size={13} className="text-[var(--gold)]" /> {label}
              </dt>
              <dd style={{ fontFamily: FONT_SERIF }} className={`truncate text-[1.15rem] font-semibold leading-tight text-[var(--charcoal)] ${capitalize ? 'capitalize' : ''}`}>{value}</dd>
            </div>
          ))}
        </dl>
      )}

      {/* Drop cap on the opening paragraph gives the description an editorial start */}
      <RichText
        html={e.description}
        className="max-w-[64ch] text-[0.95rem] leading-[1.7] text-cocoa [&>p:first-child]:first-letter:float-left [&>p:first-child]:first-letter:mr-2.5 [&>p:first-child]:first-letter:mt-1 [&>p:first-child]:first-letter:[font-family:'Cormorant_Garamond',serif] [&>p:first-child]:first-letter:text-[3.4rem] [&>p:first-child]:first-letter:font-semibold [&>p:first-child]:first-letter:leading-[0.8] [&>p:first-child]:first-letter:text-[var(--burgundy)]"
      />

      {tags.length > 0 && (
        <ul style={{ fontFamily: FONT_SANS }} className="mt-5 flex flex-wrap gap-2">
          {tags.map((t) => (
            <li key={t} className="rounded-full border border-[var(--sand)] bg-white px-3 py-1 text-[0.76rem] font-medium capitalize text-[var(--burgundy)]">
              #{t.replace(/\s+/g, '')}
            </li>
          ))}
        </ul>
      )}
    </SectionCard>
  );
}
