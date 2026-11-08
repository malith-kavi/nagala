import { scrollBehavior } from '@/lib/motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useRef } from 'react';

/** Horizontal scroll-snap carousel with arrow buttons. */
export default function Carousel({ children, itemClassName = 'w-[85%] sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)]' }) {
    const track = useRef(null);

    const scroll = (dir) => {
        const el = track.current;
        if (!el) return;
        const item = el.firstElementChild;
        const step = item ? item.getBoundingClientRect().width + 24 : el.clientWidth;
        const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 4;
        const atStart = el.scrollLeft <= 4;

        const behavior = scrollBehavior();
        if (dir > 0 && atEnd) el.scrollTo({ left: 0, behavior });
        else if (dir < 0 && atStart) el.scrollTo({ left: el.scrollWidth, behavior });
        else el.scrollBy({ left: dir * step, behavior });
    };

    const arrow =
        'absolute top-1/3 z-10 hidden h-11 w-11 items-center justify-center rounded-full bg-white text-forest-800 shadow-lg ring-1 ring-black/5 transition hover:bg-forest-700 hover:text-white sm:flex';

    return (
        <div className="relative">
            <button type="button" onClick={() => scroll(-1)} className={`${arrow} -left-5`} aria-label="Previous">
                <ChevronLeft className="h-5 w-5" />
            </button>
            <div ref={track} className="scrollbar-none flex snap-x snap-mandatory gap-6 overflow-x-auto pb-4">
                {(Array.isArray(children) ? children : [children]).map((child, i) => (
                    <div key={child?.key ?? i} className={`shrink-0 snap-start ${itemClassName}`}>
                        {child}
                    </div>
                ))}
            </div>
            <button type="button" onClick={() => scroll(1)} className={`${arrow} -right-5`} aria-label="Next">
                <ChevronRight className="h-5 w-5" />
            </button>
        </div>
    );
}
