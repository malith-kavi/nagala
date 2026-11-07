import ImageWithFallback from '@/Components/Site/ImageWithFallback';
import Lightbox from '@/Components/Site/Lightbox';
import { useState } from 'react';

/**
 * Detail-page photos: a main photo with up to 16 tiles beside it (a swipeable strip on mobile).
 * Any photo opens the lightbox. `photos` is a list of `{ url, caption }`, cover first.
 */
export default function PhotoGallery({ photos, name, className = '' }) {
    // Up to 16 tiles beside the main photo, in a near-square grid (4×4 when full).
    const thumbs = photos.slice(1, 17);
    const thumbColumns = Math.min(4, Math.ceil(Math.sqrt(thumbs.length)));
    const thumbRows = Math.ceil(thumbs.length / thumbColumns) || 1;
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
                                <button key={p.url} type="button" onClick={() => setLightbox(i + 1)} className="relative overflow-hidden rounded-lg">
                                    <img src={p.url} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover transition hover:scale-105" />
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
                            <img src={p.url} alt="" loading="lazy" className="h-20 w-28 object-cover" />
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
