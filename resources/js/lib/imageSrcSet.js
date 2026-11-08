// Uploaded photos are stored as WebP with smaller copies beside them (app/Services/ImageOptimizer.php):
//   photo.webp (up to 2048px), photo-1280.webp, photo-960.webp, photo-640.webp, photo-480.webp and photo-320.webp
// Photos uploaded before that, and the bundled /images/... files, have no copies.
// app/Support/FirstPhotoPreload.php builds the same list for the photo it preloads.
const OPTIMIZED = /^(.*\/uploads\/.+)\.webp$/;
const WIDTHS = [320, 480, 640, 960, 1280];

/** A srcset offering an uploaded photo's smaller copies, or undefined for photos without them. */
export function srcSetFor(url) {
    const match = url ? OPTIMIZED.exec(url) : null;
    if (!match) return undefined;

    const base = match[1];
    return [...WIDTHS.map((w) => `${base}-${w}.webp ${w}w`), `${url} 2048w`].join(', ');
}

/**
 * `sizes` for a photo filling a grid card: one column on phones, two from 640px, `columns` from 1024px.
 * `container` is the grid's max width (1280 for max-w-7xl, 1152 for max-w-6xl) and `gap` the space
 * between cards. The page's side padding (16px, 24px, then 32px) and the gaps are taken off, so
 * browsers don't pick a copy a size larger than the card needs.
 */
export function cardSizes(columns, { container = 1280, gap = 24 } = {}) {
    const lgGaps = 64 + gap * (columns - 1);
    return [
        `(min-width: ${container}px) ${Math.ceil((container - lgGaps) / columns)}px`,
        `(min-width: 1024px) calc((100vw - ${lgGaps}px) / ${columns})`,
        `(min-width: 640px) calc((100vw - ${48 + gap}px) / 2)`,
        'calc(100vw - 32px)',
    ].join(', ');
}
