import { Clock, MapPin, PackageCheck } from 'lucide-react';
import SectionCard, { Accent } from './SectionCard';
import RichText from '@/lib/richText';
import type { ExperienceVM } from '../types';
import { FONT_SANS } from '../normalize';

const DROP_CAP =
  "[&>p:first-child]:first-letter:float-left [&>p:first-child]:first-letter:mr-2.5 [&>p:first-child]:first-letter:mt-1 [&>p:first-child]:first-letter:[font-family:'Cormorant_Garamond',serif] [&>p:first-child]:first-letter:text-[3.4rem] [&>p:first-child]:first-letter:font-semibold [&>p:first-child]:first-letter:leading-[0.8] [&>p:first-child]:first-letter:text-[var(--burgundy)]";

/** The short description as a lead, then the long description, with a line of quick facts. Both are CMS HTML. */
export default function Overview({ experience: e }: { experience: ExperienceVM }) {
  if (!e.description && !e.shortDescription) return null;

  // City, setup time and guests are already in the page header, so this row only adds the
  // details the header leaves out.
  const facts = [
    e.inclusions.some((i) => i.isIncluded) && { icon: PackageCheck, label: 'In the box', value: `${e.inclusions.filter((i) => i.isIncluded).length} items` },
    e.timeslots.length > 0 && { icon: Clock, label: 'Time slots', value: `${e.timeslots.length} a day` },
    e.locations.length > 2 && { icon: MapPin, label: 'Cities', value: `${e.locations.length} cities` },
  ].filter(Boolean) as { icon: typeof Clock; label: string; value: string }[];

  return (
    <SectionCard id="overview" eyebrow="About this setup" title={<>The <Accent>experience</Accent></>}>
      {facts.length > 0 && (
        <dl style={{ fontFamily: FONT_SANS }} className="mb-4 flex flex-wrap gap-x-6 gap-y-2 text-[0.82rem]">
          {facts.map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-center gap-2">
              <Icon size={15} className="text-[var(--gold)]" />
              <dt className="text-[var(--mid)]">{label}</dt>
              <dd className="font-semibold text-[var(--charcoal)]">{value}</dd>
            </div>
          ))}
        </dl>
      )}

      {/* The short description is the lead: larger serif text before the full description */}
      {e.shortDescription && (
        <RichText
          html={e.shortDescription}
          className="mb-4 max-w-[60ch] text-[1.15rem] italic leading-[1.5] text-[var(--charcoal)] [font-family:'Cormorant_Garamond',serif]"
        />
      )}

      {/* Drop cap gives the description an editorial start, unless the lead line already does */}
      {e.description && (
        <RichText
          html={e.description}
          className={`max-w-[64ch] text-[0.95rem] leading-[1.7] text-cocoa ${e.shortDescription ? '' : DROP_CAP}`}
        />
      )}
    </SectionCard>
  );
}
