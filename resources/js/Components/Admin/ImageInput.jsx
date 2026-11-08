import { srcSetFor } from '@/lib/imageSrcSet';
import { IMAGE_ACCEPT, prepareImage } from '@/lib/prepareImage';
import { ImagePlus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';

/**
 * Single-image upload with preview and remove option. `maxSide` is passed to prepareImage.
 * `sizes` is how wide the photo is drawn, so a saved photo loads a fitting copy rather than the full-size one.
 */
export default function ImageInput({
    label,
    currentUrl,
    file,
    onFile,
    removed,
    onRemove,
    error,
    aspect = 'aspect-[4/3]',
    maxSide,
    sizes = '(min-width: 1024px) 300px, 100vw',
}) {
    const [preview, setPreview] = useState(null);
    const [preparing, setPreparing] = useState(false);

    useEffect(() => {
        if (!file) return setPreview(null);
        const url = URL.createObjectURL(file);
        setPreview(url);
        return () => URL.revokeObjectURL(url);
    }, [file]);

    const shown = preview ?? (removed ? null : currentUrl);

    return (
        <div>
            {label && <span className="label">{label}</span>}
            <div className={`relative overflow-hidden rounded-lg border-2 border-dashed border-stone-300 bg-stone-50 ${aspect}`}>
                {shown ? (
                    <img src={shown} srcSet={preview ? undefined : srcSetFor(shown)} sizes={sizes} alt="" className="h-full w-full object-cover" />
                ) : (
                    <div className="flex h-full flex-col items-center justify-center text-stone-400">
                        <ImagePlus className="h-8 w-8" />
                        <span className="mt-1 text-xs">Click to upload (JPG, PNG, WebP or HEIC)</span>
                    </div>
                )}
                {preparing && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/80 text-sm font-medium text-stone-600">Preparing photo…</div>
                )}
                <input
                    type="file"
                    accept={IMAGE_ACCEPT}
                    className="absolute inset-0 cursor-pointer opacity-0"
                    onChange={async (e) => {
                        const picked = e.target.files[0];
                        if (!picked) return onFile(null);
                        setPreparing(true);
                        onFile(await prepareImage(picked, { maxSide }));
                        setPreparing(false);
                    }}
                    aria-label={label || 'Upload image'}
                />
                {shown && onRemove && (
                    <button
                        type="button"
                        onClick={() => {
                            onFile(null);
                            onRemove(true);
                        }}
                        className="absolute right-2 top-2 rounded-full bg-white/90 p-1.5 text-red-600 shadow hover:bg-white"
                        aria-label="Remove image"
                    >
                        <Trash2 className="h-4 w-4" />
                    </button>
                )}
            </div>
            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
        </div>
    );
}
