import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useCallback, useEffect } from 'react';

export default function Lightbox({ images, index, onClose, onChange }) {
    const open = index !== null && index !== undefined;
    const prev = useCallback(() => onChange((index - 1 + images.length) % images.length), [index, images.length, onChange]);
    const next = useCallback(() => onChange((index + 1) % images.length), [index, images.length, onChange]);

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

    if (!open) return null;
    const image = images[index];

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 p-4" onClick={onClose} role="dialog" aria-modal>
            <button className="absolute right-4 top-4 rounded-full p-2 text-white hover:bg-white/10" aria-label="Close">
                <X className="h-7 w-7" />
            </button>
            {images.length > 1 && (
                <>
                    <button
                        className="absolute left-2 rounded-full p-2 text-white hover:bg-white/10 sm:left-6"
                        onClick={(e) => {
                            e.stopPropagation();
                            prev();
                        }}
                        aria-label="Previous image"
                    >
                        <ChevronLeft className="h-9 w-9" />
                    </button>
                    <button
                        className="absolute right-2 rounded-full p-2 text-white hover:bg-white/10 sm:right-6"
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
            <figure className="max-h-full max-w-5xl" onClick={(e) => e.stopPropagation()}>
                <img src={image.url} alt={image.caption || ''} className="max-h-[85vh] w-auto rounded-lg object-contain" />
                {image.caption && <figcaption className="mt-3 text-center text-sm text-cream-200">{image.caption}</figcaption>}
            </figure>
        </div>
    );
}
