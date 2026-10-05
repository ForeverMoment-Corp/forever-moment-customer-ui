import {
  ArrowRight,
  Armchair,
  Balloon,
  Cake,
  Columns3,
  Flame,
  Flower2,
  Frame,
  Gift,
  Heart,
  Image,
  Lightbulb,
  PackageCheck,
  PackageX,
  Rainbow,
  Ribbon,
  Sparkles,
  Table2,
  Tent,
  Truck,
  Wine,
  type LucideIcon,
} from 'lucide-react';
import SectionCard, { Accent } from './SectionCard';
import type { ListItem } from '../types';
import { FONT_SANS, FONT_SERIF } from '../normalize';

/** Keyword → icon, checked in order, so "balloon arch" reads as an arch and "foil balloons on pillars" as balloons. */
const ICONS: Array<[RegExp, LucideIcon]> = [
  [/\barch/i, Rainbow],
  [/balloon/i, Balloon],
  [/flex|banner|backdrop|poster|wall/i, Image],
  [/light|fairy|led\b|lamp|neon/i, Lightbulb],
  [/flower|floral|rose|petal/i, Flower2],
  [/candle/i, Flame],
  [/cake/i, Cake],
  [/table/i, Table2],
  [/pillar|stand/i, Columns3],
  [/heart/i, Heart],
  [/photo|frame|polaroid/i, Frame],
  [/gift|hamper/i, Gift],
  [/wine|champagne|glass/i, Wine],
  [/tent|canopy/i, Tent],
  [/chair|sofa|seat|cushion/i, Armchair],
  [/ribbon|bow\b/i, Ribbon],
];
const iconFor = (text: string) => ICONS.find(([re]) => re.test(text))?.[1] ?? Sparkles;

/**
 * Colour words in a description, mapped to CSS colour keywords for small swatches. These show the
 * product's real colours (not the site theme), so plain CSS keywords are the right values here.
 * Longest names first so "dark blue" wins over "blue".
 */
const COLOURS: Array<[string, string]> = [
  ['rose gold', 'rosybrown'],
  ['dark blue', 'darkblue'],
  ['light blue', 'lightskyblue'],
  ['dark green', 'darkgreen'],
  ['light green', 'lightgreen'],
  ['hot pink', 'hotpink'],
  ['red', 'red'],
  ['blue', 'royalblue'],
  ['navy', 'navy'],
  ['green', 'green'],
  ['black', 'black'],
  ['white', 'white'],
  ['yellow', 'gold'],
  ['golden', 'goldenrod'],
  ['gold', 'goldenrod'],
  ['silver', 'silver'],
  ['pink', 'pink'],
  ['purple', 'purple'],
  ['orange', 'orange'],
  ['peach', 'peachpuff'],
  ['maroon', 'maroon'],
  ['beige', 'beige'],
  ['teal', 'teal'],
];

/** Colours named in the text, in the order the text lists them. */
const coloursIn = (text: string) => {
  // Matched words are blanked out (same length, so positions stay valid) so "blue" cannot re-match inside "dark blue".
  let rest = text.toLowerCase();
  const found: Array<{ name: string; css: string; at: number }> = [];
  for (const [name, css] of COLOURS) {
    const re = new RegExp(`\\b${name}\\b`, 'g');
    let m: RegExpExecArray | null;
    let first = -1;
    while ((m = re.exec(rest))) if (first < 0) first = m.index;
    if (first >= 0) {
      found.push({ name, css, at: first });
      rest = rest.replace(re, (w) => ' '.repeat(w.length));
    }
  }
  return found.sort((x, y) => x.at - y.at);
};

/**
 * Pull a quantity out of the description for the badge: "6*6 Feet …" → "6×6 ft",
 * "20 Themed …" → "×20" (and the number leaves the title), "Arch of 80 …" → "×80".
 */
const parseItem = (raw: string) => {
  const text = raw.trim();
  const dims = /^(\d+(?:\.\d+)?)\s*[*x×]\s*(\d+(?:\.\d+)?)\s*(feet|foot|ft)\b\.?\s*/i.exec(text);
  if (dims) return { qty: `${dims[1]}×${dims[2]} ft`, title: text.slice(dims[0].length) };
  const lead = /^(\d+)\s+/.exec(text);
  if (lead) return { qty: `×${lead[1]}`, title: text.slice(lead[0].length) };
  const of = /\bof\s+(\d+)\b/i.exec(text);
  if (of) return { qty: `×${of[1]}`, title: text };
  return { qty: null, title: text };
};

const capitalise = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/**
 * Split a description into a short title and a detail line: "(100 themed balloons)" moves to the
 * detail, and for colour lists the title stops where the colours begin ("Arch of 80 latex").
 */
const splitItem = (title: string, colours: { at: number }[], original: string) => {
  const paren = /\s*\(([^)]+)\)\s*$/.exec(title);
  if (paren) return { title: title.slice(0, paren.index), detail: paren[1] };
  if (colours.length > 1) {
    // Cut the original text at the first colour, then map that back onto the (number-stripped) title.
    const head = original.slice(0, colours[0].at).replace(/[\s,]+$/, '');
    const cut = title.length - (original.length - head.length);
    if (cut > 3) return { title: title.slice(0, cut), detail: null };
  }
  return { title, detail: null };
};

/**
 * What the package brings, laid out like the cancellation policy: one card with a rail of rows
 * (icon, title and detail, quantity badge), a footnote inside the card, and anything not
 * included in a separate dashed note with a way to add it.
 */
export default function Inclusion({ items }: { items: ListItem[] }) {
  const included = items.filter((i) => i.isIncluded);
  const excluded = items.filter((i) => !i.isIncluded);

  return (
    <SectionCard
      id="included"
      eyebrow="Package details"
      title={<>What's <Accent>included</Accent></>}
      aside={
        <span style={{ fontFamily: FONT_SANS }} className="inline-flex items-center gap-1.5 rounded-full bg-leaf-light px-2.5 py-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.1em] text-leaf">
          <PackageCheck size={13} /> {included.length} {included.length === 1 ? 'item' : 'items'}
        </span>
      }
    >
      {included.length > 0 && (
        <ol className="rounded-[20px] border border-[var(--sand)] bg-white px-4 py-2 sm:px-5">
          {included.map((item, i) => {
            const { qty, title: stripped } = parseItem(item.description);
            const colours = coloursIn(item.description);
            const { title, detail } = splitItem(stripped, colours, item.description.trim());
            const Icon = iconFor(item.description);
            return (
              <li key={item.id} className="relative grid grid-cols-[30px_minmax(0,1fr)_auto] items-center gap-x-3.5 py-3">
                {i < included.length - 1 && (
                  <span aria-hidden className="absolute left-[14px] top-[calc(50%+15px)] h-[calc(100%-30px)] w-[2px] rounded-full bg-[var(--gold-light)]" />
                )}
                <span className="relative z-[1] flex h-[30px] w-[30px] items-center justify-center rounded-full border-2 border-white bg-[var(--gold-pale)] text-[var(--burgundy)] shadow-[0_0_0_1px_var(--sand)]">
                  <Icon size={15} strokeWidth={1.8} />
                </span>
                <div className="min-w-0">
                  <p style={{ fontFamily: FONT_SERIF }} className="text-[1.05rem] font-semibold leading-tight text-[var(--charcoal)]">{capitalise(title)}</p>
                  {colours.length > 1 ? (
                    <p style={{ fontFamily: FONT_SANS }} className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[0.78rem] text-[var(--mid)]">
                      <span className="inline-flex items-center gap-1" aria-hidden>
                        {colours.map((c) => (
                          <span key={c.name} title={capitalise(c.name)} style={{ background: c.css }} className="h-3 w-3 rounded-full ring-1 ring-[var(--sand)]" />
                        ))}
                      </span>
                      <span>{capitalise(colours.map((c) => c.name).join(', '))}</span>
                    </p>
                  ) : (
                    detail && <p style={{ fontFamily: FONT_SANS }} className="text-[0.8rem] leading-relaxed text-[var(--mid)]">{capitalise(detail)}</p>
                  )}
                </div>
                <span
                  style={{ fontFamily: FONT_SANS }}
                  className={`whitespace-nowrap rounded-full px-2.5 py-1 text-[0.66rem] font-semibold uppercase tracking-[0.1em] tabular-nums ${
                    qty ? 'bg-linen text-gold-deep' : 'bg-leaf-light text-leaf'
                  }`}
                >
                  {qty ?? 'Included'}
                </span>
              </li>
            );
          })}
          <li style={{ fontFamily: FONT_SANS }} className="flex items-center gap-1.5 border-t border-dashed border-[var(--sand)] py-2.5 text-[0.74rem] text-[var(--mid)]">
            <Truck size={13} className="shrink-0 text-[var(--gold)]" /> Delivered, set up and taken down by our team.
          </li>
        </ol>
      )}

      {excluded.length > 0 && (
        <div className="mt-3 flex flex-wrap items-end justify-between gap-3 rounded-[18px] border border-dashed border-[var(--rose)] bg-[var(--rose-light)]/60 px-4 py-3">
          <div className="min-w-0">
            <p style={{ fontFamily: FONT_SANS }} className="flex items-center gap-1.5 text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-[var(--burgundy)]">
              <PackageX size={13} /> Not included
            </p>
            <ul style={{ fontFamily: FONT_SANS }} className="mt-1.5 grid gap-1 text-[0.84rem] leading-relaxed text-cocoa">
              {excluded.map((item) => <li key={item.id}>{capitalise(item.description)}</li>)}
            </ul>
          </div>
          <a
            href="#addons"
            onClick={(e) => {
              const el = document.getElementById('addons') || document.getElementById('booking-card');
              if (el) {
                e.preventDefault();
                el.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }
            }}
            style={{ fontFamily: FONT_SANS }}
            className="group inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-1.5 text-[0.78rem] font-semibold text-[var(--burgundy)] ring-1 ring-[var(--sand)] transition-colors hover:ring-[var(--burgundy)]"
          >
            Add as an extra <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
          </a>
        </div>
      )}
    </SectionCard>
  );
}
