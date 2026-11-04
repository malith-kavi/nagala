import { useEffect, useRef, useState } from 'react';

/**
 * Animates its `.reveal-item` children in while it sits in the middle of the
 * screen, and out again as it scrolls away — drifting up when leaving through
 * the top, down when leaving through the bottom.
 */
export default function Reveal({ as: Tag = 'div', className = '', children }) {
    const ref = useRef(null);
    const [state, setState] = useState('below');

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) setState('shown');
                else setState(entry.boundingClientRect.top < 0 ? 'above' : 'below');
            },
            { rootMargin: '-15% 0px -15% 0px' },
        );
        observer.observe(ref.current);
        return () => observer.disconnect();
    }, []);

    return (
        <Tag ref={ref} data-reveal={state} className={className}>
            {children}
        </Tag>
    );
}

export const revealDelay = (ms) => ({ '--reveal-delay': `${ms}ms` });
