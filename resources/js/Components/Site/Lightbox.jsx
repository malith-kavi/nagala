import { srcSetFor } from '@/lib/imageSrcSet';
import { useStopDownloadOnRemove } from '@/lib/photoDownloads';
import { Transition } from '@headlessui/react';
import { ChevronLeft, ChevronRight, LoaderCircle, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

// How wide the photo is drawn: the screen less the 16px padding each side, at most max-w-5xl (1024px).
// Uploaded photos then come as the copy that fits (on a phone, about a quarter of the full-size photo)
// rather than the full 2048px one, which can be up to 1 MB.
const SIZES = '(min-width: 1056px) 1024px, calc(100vw - 32px)';

export default function Lightbox({ images, index, onClose, onChange }) {
    const open = index !== null && index !== undefined;
    const prev = useCallback(() => onChange((index - 1 + images.length) % images.length), [index, images.length, onChange]);
    const next = useCallback(() => onChange((index + 1) % images.length), [index, images.length, onChange]);

    // Keep showing the last photo while the lightbox fades out after closing.
    const shownIndex = useRef(index);
    if (open) shownIndex.current = index;
    const image = images[shownIndex.current];
    const [loadedUrl, setLoadedUrl] = useState(null);
    const loaded = loadedUrl === image?.url;
    // Stepping on past a photo that hasn't arrived stops its download, so the next one isn't kept waiting.
    const imgRef = useStopDownloadOnRemove();

    useEffect(() => {
        if (!open) return;
        const onKey = (e) => {
            if (e.key === 'Escape') onClose();
            if (e.key === 'ArrowLeft') prev();
            if (e.key === 'ArrowRight') next();
        };
        document.addEventListener('keydown', onKey);
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', onKey);
            document.body.style.overflow = '';
        };
    }, [open, onClose, prev, next]);

    // Once this photo is in, load the photos either side (the same copy this one used), so stepping
    // through them doesn't wait on a download. Not before: on a weak signal they'd slow this one down.
    useEffect(() => {
        if (!open || !loaded || images.length < 2) return;
        [index - 1, index + 1].forEach((i) => {
            const neighbour = images[(i + images.length) % images.length];
            if (!neighbour?.url) return;
            const preload = new Image();
            const srcSet = srcSetFor(neighbour.url);
            if (srcSet) {
                preload.sizes = SIZES;
                preload.srcset = srcSet;
            }
            preload.src = neighbour.url;
        });
    }, [open, loaded, index, images]);

    return (
        <Transition show={open}>
            <div
                className="group fixed inset-0 z-[60] flex items-center justify-center bg-black/90 p-4 transition duration-300 ease-smooth data-[closed]:opacity-0"
                onClick={onClose}
                role="dialog"
                aria-modal
            >
                <button className="absolute right-4 top-4 rounded-full p-2 text-white transition hover:bg-white/10" aria-label="Close">
                    <X className="h-7 w-7" />
                </button>
                {images.length > 1 && (
                    <>
                        <button
                            className="absolute left-2 rounded-full p-2 text-white transition hover:bg-white/10 sm:left-6"
                            onClick={(e) => {
                                e.stopPropagation();
                                prev();
                            }}
                            aria-label="Previous image"
                        >
                            <ChevronLeft className="h-9 w-9" />
                        </button>
                        <button
                            className="absolute right-2 rounded-full p-2 text-white transition hover:bg-white/10 sm:right-6"
                            onClick={(e) => {
                                e.stopPropagation();
                                next();
                            }}
                            aria-label="Next image"
                        >
                            <ChevronRight className="h-9 w-9" />
                        </button>
                    </>
                )}
                {/* Only shown if the photo takes a moment, so cached photos don't flash it. */}
                {open && image && !loaded && (
                    <span className="pointer-events-none absolute animate-fade-in [animation-delay:300ms]" aria-hidden>
                        <LoaderCircle className="h-8 w-8 animate-spin text-white/60" />
                    </span>
                )}
                {image && (
                    // Grows gently into place as the lightbox opens; each photo fades in as you step to it.
                    <figure
                        key={image.url}
                        className="max-h-full max-w-5xl animate-fade-in transition duration-300 ease-smooth motion-safe:group-data-[closed]:scale-95"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <img
                            ref={imgRef}
                            src={image.url}
                            srcSet={srcSetFor(image.url)}
                            sizes={srcSetFor(image.url) ? SIZES : undefined}
                            alt={image.caption || ''}
                            onLoad={() => setLoadedUrl(image.url)}
                            onError={() => setLoadedUrl(image.url)}
                            className="max-h-[85vh] w-auto rounded-lg object-contain"
                        />
                        {image.caption && <figcaption className="mt-3 text-center text-sm text-cream-200">{image.caption}</figcaption>}
                    </figure>
                )}
            </div>
        </Transition>
    );
}
