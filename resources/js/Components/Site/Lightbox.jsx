import { srcSetFor } from '@/lib/imageSrcSet';
import { useStopDownloadOnRemove } from '@/lib/photoDownloads';
import { Transition } from '@headlessui/react';
import { ChevronLeft, ChevronRight, LoaderCircle, X } from 'lucide-react';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';

// How wide the photo is drawn: the screen less the 16px padding each side, at most max-w-5xl (1024px).
// Uploaded photos then come as the copy that fits (on a phone, about a quarter of the full-size photo)
// rather than the full 2048px one, which can be up to 1 MB.
const SIZES = '(min-width: 1056px) 1024px, calc(100vw - 32px)';

// A swipe changes photo once it has gone a fifth of the screen (at most 80px), or sooner if it's a quick flick.
const SWIPE_DISTANCE = 80;
const FLICK_DISTANCE = 30;
const FLICK_MS = 300;
const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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

    // Swiping on a phone: the photo follows the finger sideways, then either springs back or gives way to the next
    // one, which glides in from the side the finger moved away from. Vertical drags and pinch-zoom are left alone.
    const figureRef = useRef(null);
    const swipe = useRef(null);
    const enterFrom = useRef(0);

    const moveFigure = (x, ms = 0) => {
        const el = figureRef.current;
        if (!el) return;
        el.style.transition = ms ? `transform ${ms}ms ease-out` : 'none';
        el.style.transform = x ? `translateX(${x}px)` : '';
        if (ms) el.addEventListener('transitionend', () => (el.style.transition = ''), { once: true });
    };

    const onTouchStart = (e) => {
        const zoomed = (window.visualViewport?.scale ?? 1) > 1.01;
        swipe.current =
            images.length > 1 && e.touches.length === 1 && !zoomed
                ? { x: e.touches[0].clientX, y: e.touches[0].clientY, time: e.timeStamp, dx: 0, sideways: null }
                : null;
    };

    const onTouchMove = (e) => {
        const s = swipe.current;
        if (!s) return;
        if (e.touches.length > 1) {
            swipe.current = null; // a second finger: pinch-zoom, not a swipe
            moveFigure(0, 200);
            return;
        }
        const dx = e.touches[0].clientX - s.x;
        const dy = e.touches[0].clientY - s.y;
        if (s.sideways === null) {
            if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return;
            s.sideways = Math.abs(dx) > Math.abs(dy);
        }
        if (!s.sideways) return;
        s.dx = dx;
        moveFigure(dx);
    };

    const onTouchEnd = (e) => {
        const s = swipe.current;
        swipe.current = null;
        if (!s?.sideways) return;
        const distance = Math.abs(s.dx);
        const flick = distance > FLICK_DISTANCE && e.timeStamp - s.time < FLICK_MS;
        if (distance > Math.min(SWIPE_DISTANCE, window.innerWidth / 5) || flick) {
            enterFrom.current = s.dx < 0 ? 1 : -1;
            if (s.dx < 0) next();
            else prev();
        } else {
            moveFigure(0, 200);
        }
    };

    useLayoutEffect(() => {
        const from = enterFrom.current;
        enterFrom.current = 0;
        const el = figureRef.current;
        if (!el) return;
        if (!from || reducedMotion()) {
            // Arrows, keys, opening and closing keep the figure's own transitions.
            el.style.transition = '';
            el.style.transform = '';
            return;
        }
        moveFigure(from * 48);
        figureRef.current.getBoundingClientRect(); // apply the starting offset before gliding from it
        moveFigure(0, 250);
    }, [index]);

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
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
                onTouchCancel={onTouchEnd}
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
                        ref={figureRef}
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
