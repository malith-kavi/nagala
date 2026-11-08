import { srcSetFor } from '@/lib/imageSrcSet';
import { Leaf } from 'lucide-react';
import { useState } from 'react';

// Photos already shown during this visit, so going back to a page doesn't replay their reveal.
const shown = new Set();

/**
 * Shows the uploaded photo, or a branded placeholder until the owner uploads one.
 * While the photo loads it shows a shimmering grey, then turns from a blurred grey into the photo;
 * photos that arrive straight from the browser's cache just appear.
 * An optional darkSrc is shown instead to visitors whose device is set to dark mode.
 * Uploaded photos come with smaller copies, so the browser loads the one that fits `sizes`
 * (how wide the photo is drawn; the full screen width if not given).
 * Optional webpSrcSet / darkWebpSrcSet offer WebP copies of bundled photos in several widths;
 * browsers without WebP use src.
 */
export default function ImageWithFallback({
    src,
    darkSrc,
    webpSrcSet,
    darkWebpSrcSet,
    sizes,
    alt = '',
    className = '',
    label,
    loading = 'lazy',
}) {
    const [failed, setFailed] = useState(false);
    // If a smaller copy can't be loaded, try the photo itself before giving up.
    const [plain, setPlain] = useState(false);
    const [mountedAt] = useState(() => performance.now());
    const [stage, setStage] = useState('loading'); // then 'reveal', or 'shown' when no animation is needed

    const loaded = (e) => {
        const url = e.currentTarget.currentSrc || e.currentTarget.src;
        const instant = shown.has(url) || performance.now() - mountedAt < 150;
        shown.add(url);
        setStage(instant ? 'shown' : 'reveal');
    };

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

    const srcSet = plain ? undefined : srcSetFor(src);
    const darkSrcSet = plain ? undefined : srcSetFor(darkSrc);
    const img = (
        <img
            src={src}
            srcSet={srcSet}
            sizes={srcSet ? sizes : undefined}
            alt={alt}
            loading={loading}
            onLoad={loaded}
            onError={() => (srcSet || darkSrcSet ? setPlain(true) : setFailed(true))}
            className={`object-cover ${stage === 'loading' ? 'img-loading' : stage === 'reveal' ? 'img-reveal' : ''} ${className}`}
        />
    );

    if (!darkSrc && !webpSrcSet) return img;

    const dark = '(prefers-color-scheme: dark)';

    return (
        <picture>
            {darkSrc && darkWebpSrcSet && <source media={dark} type="image/webp" srcSet={darkWebpSrcSet} sizes={sizes} />}
            {darkSrc && <source media={dark} srcSet={darkSrcSet ?? darkSrc} sizes={darkSrcSet ? sizes : undefined} />}
            {webpSrcSet && <source type="image/webp" srcSet={webpSrcSet} sizes={sizes} />}
            {img}
        </picture>
    );
}
