import { Leaf } from 'lucide-react';
import { useState } from 'react';

/**
 * Shows the uploaded photo, or a branded placeholder until the owner uploads one.
 * An optional darkSrc is shown instead to visitors whose device is set to dark mode.
 */
export default function ImageWithFallback({ src, darkSrc, alt = '', className = '', label, loading = 'lazy' }) {
    const [failed, setFailed] = useState(false);

    if (!src || failed) {
        return (
            <div
                role="img"
                aria-label={alt}
                className={`flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-forest-600 via-forest-700 to-forest-900 text-forest-100/70 ${className}`}
            >
                <Leaf className="h-8 w-8" strokeWidth={1.5} aria-hidden />
                {label && <span className="px-3 text-center font-display text-sm">{label}</span>}
            </div>
        );
    }

    const img = <img src={src} alt={alt} loading={loading} onError={() => setFailed(true)} className={`object-cover ${className}`} />;

    if (!darkSrc) return img;

    return (
        <picture>
            <source srcSet={darkSrc} media="(prefers-color-scheme: dark)" />
            {img}
        </picture>
    );
}
