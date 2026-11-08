// Uploaded photos are stored as WebP with smaller copies beside them (app/Services/ImageOptimizer.php):
//   photo.webp (up to 2048px), photo-1280.webp and photo-640.webp
// Photos uploaded before that, and the bundled /images/... files, have no copies.
const OPTIMIZED = /^(.*\/uploads\/.+)\.webp$/;

/** A srcset offering an uploaded photo's smaller copies, or undefined for photos without them. */
export function srcSetFor(url) {
    const match = url ? OPTIMIZED.exec(url) : null;
    if (!match) return undefined;

    const base = match[1];
    return `${base}-640.webp 640w, ${base}-1280.webp 1280w, ${url} 2048w`;
}

/** `sizes` for a photo filling a grid card: one column on phones, two from 640px, `columns` from 1024px. */
export const cardSizes = (columns) => `(min-width: 1280px) ${Math.round(1280 / columns)}px, (min-width: 1024px) ${Math.round(100 / columns)}vw, (min-width: 640px) 50vw, 100vw`;
