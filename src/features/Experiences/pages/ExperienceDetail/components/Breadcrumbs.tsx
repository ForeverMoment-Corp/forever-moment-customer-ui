import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { FONT_SANS } from '../normalize';

export interface Crumb {
  label: string;
  to?: string;
}

export default function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" style={{ fontFamily: FONT_SANS }} className="text-[0.78rem]">
      <ol className="flex items-center gap-1 flex-wrap text-[var(--mid)]">
        {items.map((item, i) => {
          const isLast = i === items.length - 1;
          return (
            <li key={`${item.label}-${i}`} className="flex items-center gap-1 min-w-0">
              {item.to && !isLast ? (
                <Link to={item.to} className="hover:text-[var(--burgundy)] transition-colors whitespace-nowrap capitalize">
                  {item.label}
                </Link>
              ) : (
                <span aria-current={isLast ? 'page' : undefined} className={`truncate max-w-[220px] sm:max-w-none ${isLast ? 'text-[var(--charcoal)]' : ''}`}>
                  {item.label}
                </span>
              )}
              {!isLast && <ChevronRight size={12} className="text-[var(--gold)] shrink-0" />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
