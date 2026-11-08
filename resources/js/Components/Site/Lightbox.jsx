import { Transition } from '@headlessui/react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useCallback, useEffect, useRef } from 'react';

export default function Lightbox({ images, index, onClose, onChange }) {
    const open = index !== null && index !== undefined;
    const prev = useCallback(() => onChange((index - 1 + images.length) % images.length), [index, images.length, onChange]);
    const next = useCallback(() => onChange((index + 1) % images.length), [index, images.length, onChange]);

    // Keep showing the last photo while the lightbox fades out after closing.
    const shownIndex = useRef(index);
    if (open) shownIndex.current = index;
    const image = images[shownIndex.current];

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

    // Load the photos either side, so stepping through them doesn't wait on a download.
    useEffect(() => {
        if (!open || images.length < 2) return;
        [index - 1, index + 1].forEach((i) => {
            const neighbour = images[(i + images.length) % images.length];
            if (neighbour?.url) new Image().src = neighbour.url;
        });
    }, [open, index, images]);

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
                {image && (
                    // Grows gently into place as the lightbox opens; each photo fades in as you step to it.
                    <figure
                        key={image.url}
                        className="max-h-full max-w-5xl animate-fade-in transition duration-300 ease-smooth motion-safe:group-data-[closed]:scale-95"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <img src={image.url} alt={image.caption || ''} className="max-h-[85vh] w-auto rounded-lg object-contain" />
                        {image.caption && <figcaption className="mt-3 text-center text-sm text-cream-200">{image.caption}</figcaption>}
                    </figure>
                )}
            </div>
        </Transition>
    );
}
