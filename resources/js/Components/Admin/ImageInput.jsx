import { ImagePlus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';

/** Single-image upload with preview and remove option. */
export default function ImageInput({ label, currentUrl, file, onFile, removed, onRemove, error, aspect = 'aspect-[4/3]' }) {
    const [preview, setPreview] = useState(null);

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
                    <img src={shown} alt="" className="h-full w-full object-cover" />
                ) : (
                    <div className="flex h-full flex-col items-center justify-center text-stone-400">
                        <ImagePlus className="h-8 w-8" />
                        <span className="mt-1 text-xs">Click to upload (max 8 MB)</span>
                    </div>
                )}
                <input
                    type="file"
                    accept="image/*"
                    className="absolute inset-0 cursor-pointer opacity-0"
                    onChange={(e) => onFile(e.target.files[0] ?? null)}
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
