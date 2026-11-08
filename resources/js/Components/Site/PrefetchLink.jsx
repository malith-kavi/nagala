import { Link, router } from '@inertiajs/react';

// Long enough to read a card and decide, short enough that prices and availability stay current.
const CACHE_FOR = '1m';

/**
 * A link that starts loading its page before it's clicked, so the page opens without waiting:
 * when a mouse rests on it (Inertia's prefetch), or when a finger touches it, which Inertia doesn't
 * listen for. Inertia skips prefetching the page you're already on, and app.jsx loads the page's
 * code along with its data.
 */
export default function PrefetchLink({ href, onTouchStart, ...props }) {
    const touched = (event) => {
        router.prefetch(href, { method: 'get' }, { cacheFor: CACHE_FOR });
        onTouchStart?.(event);
    };

    return <Link href={href} prefetch cacheFor={CACHE_FOR} onTouchStart={touched} {...props} />;
}
