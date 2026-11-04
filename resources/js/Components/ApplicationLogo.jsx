import { Leaf } from 'lucide-react';

export default function ApplicationLogo({ light = false, className = '' }) {
    return (
        <span className={`inline-flex flex-col items-center leading-none ${className}`}>
            <span className="relative font-display text-[1.9rem] font-bold tracking-tight">
                <Leaf
                    className={`absolute -top-2.5 left-[38%] h-3.5 w-3.5 -rotate-12 ${light ? 'text-leaf-400' : 'text-leaf-500'}`}
                    strokeWidth={2.5}
                    aria-hidden
                />
                <span className={light ? 'text-white' : 'text-forest-800'}>Nagala</span>
            </span>
            <span className={`mt-0.5 font-display text-[0.6rem] font-semibold uppercase tracking-[0.3em] ${light ? 'text-cream-200' : 'text-forest-700'}`}>
                Eco Cottage
            </span>
        </span>
    );
}
