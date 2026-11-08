import ImageWithFallback from '@/Components/Site/ImageWithFallback';
import Lightbox from '@/Components/Site/Lightbox';
import { useState } from 'react';

// The tile grid beside the main photo: 460px tall, and at most 490px wide (on screens 1152px and up).
const GRID_HEIGHT = 460;
const GRID_MAX_WIDTH = 490;
const TILE_GAP = 8;

/**
 * How wide a tile's photo is drawn. Tiles are cropped from landscape photos (about 4:3), so a tile
 * shorter than it is wide still draws its photo wider than the tile. Getting this right lets the
 * browser pick the 320px copy for a full 4×4 grid rather than one twice the size.
 */
function tileSizes(columns, rows) {
    const width = (GRID_MAX_WIDTH - TILE_GAP * (columns - 1)) / columns;
    const height = (GRID_HEIGHT - TILE_GAP * (rows - 1)) / rows;
    return `${Math.ceil(Math.max(width, (height * 4) / 3))}px`;
}

/**
 * Detail-page photos: a main photo with up to 16 tiles beside it (a swipeable strip on mobile).
 * Any photo opens the lightbox. `photos` is a list of `{ url, caption }`, cover first.
 * `sizes` is how wide the main photo is drawn on the page, from gallerySizes in lib/bundledImages.json:
 * `main` with tiles beside it, `alone` without.
 * The main photo is the one the page waits on: app.blade.php starts downloading it with the page
 * (App\Support\FirstPhotoPreload, which reads the same sizes), and the tiles load at low priority
 * so they don't slow it down on a weak signal.
 */
export default function PhotoGallery({ photos, name, sizes, className = '' }) {
    // Up to 16 tiles beside the main photo, in a near-square grid (4×4 when full).
    const thumbs = photos.slice(1, 17);
    const thumbColumns = Math.min(4, Math.ceil(Math.sqrt(thumbs.length)));
    const thumbRows = Math.ceil(thumbs.length / thumbColumns) || 1;
    const thumbSizes = tileSizes(thumbColumns, thumbRows);
    const [lightbox, setLightbox] = useState(null);

    return (
        <div className={className}>
            {/* Photo grid: main photo plus up to 16 tiles beside it; the last tile shows how many more there are */}
            <div className={`grid gap-3 ${thumbs.length ? 'sm:h-[460px] sm:grid-cols-[1.2fr_1fr] sm:grid-rows-[minmax(0,1fr)]' : ''}`}>
                <button type="button" onClick={() => photos.length && setLightbox(0)} className="overflow-hidden rounded-xl">
                    <ImageWithFallback
                        src={photos[0]?.url}
                        alt={name}
                        label={name}
                        loading="eager"
                        fetchPriority="high"
                        sizes={thumbs.length ? sizes.main : sizes.alone}
                        className={`aspect-[16/10] h-full w-full ${thumbs.length ? 'sm:aspect-auto' : ''}`}
                    />
                </button>
                {thumbs.length > 0 && (
                    <div
                        className="hidden min-h-0 gap-2 sm:grid"
                        style={{
                            gridTemplateColumns: `repeat(${thumbColumns}, minmax(0, 1fr))`,
                            gridTemplateRows: `repeat(${thumbRows}, minmax(0, 1fr))`,
                        }}
                    >
                        {thumbs.map((p, i) => {
                            const more = i === thumbs.length - 1 ? photos.length - 1 - thumbs.length : 0;
                            return (
                                <button key={p.url} type="button" onClick={() => setLightbox(i + 1)} className="group relative isolate overflow-hidden rounded-lg">
                                    <ImageWithFallback
                                        src={p.url}
                                        sizes={thumbSizes}
                                        fetchPriority="low"
                                        className="absolute inset-0 h-full w-full transition-transform duration-700 ease-smooth group-hover:scale-105"
                                    />
                                    {more > 0 && (
                                        <span className="absolute inset-0 flex items-center justify-center bg-forest-950/55 text-sm font-semibold text-white">
                                            +{more}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Mobile: swipeable strip of every photo */}
            {photos.length > 1 && (
                <div className="scrollbar-none -mx-4 mt-3 flex snap-x gap-2 overflow-x-auto px-4 sm:hidden">
                    {photos.slice(1).map((p, i) => (
                        <button key={p.url} type="button" onClick={() => setLightbox(i + 1)} className="shrink-0 snap-start overflow-hidden rounded-lg">
                            <ImageWithFallback src={p.url} sizes="112px" fetchPriority="low" className="h-20 w-28" />
                        </button>
                    ))}
                </div>
            )}

            {photos.length > 1 && (
                <button type="button" onClick={() => setLightbox(0)} className="mt-3 text-sm font-medium text-forest-700 hover:underline">
                    View all {photos.length} photos
                </button>
            )}

            <Lightbox images={photos} index={lightbox} onClose={() => setLightbox(null)} onChange={setLightbox} />
        </div>
    );
}
