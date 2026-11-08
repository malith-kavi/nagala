import { srcSetFor } from '@/lib/imageSrcSet';
import { IMAGE_ACCEPT, usePrepareImages } from '@/lib/prepareImage';
import { ChevronLeft, ChevronRight, ImagePlus, Trash2, Undo2 } from 'lucide-react';
import { useState } from 'react';

let nextKey = 0;

const move = (list, from, to) => {
    const next = [...list];
    next.splice(to, 0, next.splice(from, 1)[0]);
    return next;
};

/**
 * Sortable photo list. Each photo is either saved (`{ key, path, url, removed }`)
 * or freshly picked (`{ key, file, url }`). Reorder by dragging or with the arrows.
 */
export default function PhotoOrderInput({ label, photos, setPhotos, error }) {
    const prepareImages = usePrepareImages();
    const [preparing, setPreparing] = useState(false);
    const [dragging, setDragging] = useState(null);
    const [over, setOver] = useState(null);

    const add = async (files) => {
        setPreparing(true);
        const prepared = await prepareImages(files);
        setPhotos((current) => [...current, ...prepared.map((file) => ({ key: `new-${nextKey++}`, file, url: URL.createObjectURL(file) }))]);
        setPreparing(false);
    };

    const remove = (photo) => {
        if (photo.file) {
            URL.revokeObjectURL(photo.url);
            setPhotos((current) => current.filter((p) => p.key !== photo.key));
        } else {
            setPhotos((current) => current.map((p) => (p.key === photo.key ? { ...p, removed: !p.removed } : p)));
        }
    };

    const shift = (from, to) => {
        if (to < 0 || to >= photos.length) return;
        setPhotos((current) => move(current, from, to));
    };

    const endDrag = () => {
        setDragging(null);
        setOver(null);
    };

    return (
        <div>
            <span className="label">{label}</span>
            <div className="grid grid-cols-3 gap-2">
                {photos.map((photo, i) => (
                    <div
                        key={photo.key}
                        draggable
                        onDragStart={(e) => {
                            e.dataTransfer.effectAllowed = 'move';
                            setDragging(i);
                        }}
                        onDragOver={(e) => {
                            e.preventDefault();
                            setOver(i);
                        }}
                        onDrop={(e) => {
                            e.preventDefault();
                            if (dragging !== null && dragging !== i) shift(dragging, i);
                            endDrag();
                        }}
                        onDragEnd={endDrag}
                        className={`group relative cursor-grab rounded active:cursor-grabbing ${dragging === i ? 'opacity-40' : ''} ${
                            over === i && dragging !== i ? 'ring-2 ring-forest-500 ring-offset-2' : ''
                        }`}
                    >
                        <img
                            // Saved photos load their small copies: the full-size ones are up to 1 MB each, and a
                            // cottage with dozens of photos made this page download tens of MB on a weak signal.
                            src={photo.url}
                            srcSet={srcSetFor(photo.url)}
                            sizes="(min-width: 1024px) 96px, 33vw"
                            loading="lazy"
                            alt=""
                            draggable={false}
                            className={`aspect-square w-full rounded object-cover ${photo.removed ? 'opacity-30' : ''} ${photo.file ? 'ring-2 ring-leaf-500' : ''}`}
                        />
                        <span className="absolute left-1 top-1 rounded-full bg-forest-900/80 px-1.5 text-[10px] font-semibold text-white">{i + 1}</span>
                        <button
                            type="button"
                            onClick={() => remove(photo)}
                            className="absolute right-1 top-1 rounded-full bg-white/90 p-1 shadow"
                            aria-label={photo.removed ? 'Keep photo' : 'Remove photo'}
                        >
                            {photo.removed ? <Undo2 className="h-3.5 w-3.5" /> : <Trash2 className="h-3.5 w-3.5 text-red-600" />}
                        </button>
                        <div className="absolute inset-x-1 bottom-1 flex justify-between opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100">
                            <button
                                type="button"
                                onClick={() => shift(i, i - 1)}
                                disabled={i === 0}
                                className="rounded-full bg-white/90 p-0.5 shadow disabled:invisible"
                                aria-label="Move photo earlier"
                            >
                                <ChevronLeft className="h-3.5 w-3.5" />
                            </button>
                            <button
                                type="button"
                                onClick={() => shift(i, i + 1)}
                                disabled={i === photos.length - 1}
                                className="rounded-full bg-white/90 p-0.5 shadow disabled:invisible"
                                aria-label="Move photo later"
                            >
                                <ChevronRight className="h-3.5 w-3.5" />
                            </button>
                        </div>
                    </div>
                ))}
                <label className="flex aspect-square cursor-pointer items-center justify-center rounded border-2 border-dashed border-stone-300 text-stone-400 hover:border-forest-400">
                    {preparing ? <span className="text-xs">Preparing…</span> : <ImagePlus className="h-6 w-6" />}
                    <input
                        type="file"
                        accept={IMAGE_ACCEPT}
                        multiple
                        className="hidden"
                        onChange={(e) => {
                            add([...e.target.files]);
                            e.target.value = '';
                        }}
                    />
                </label>
            </div>
            {photos.length > 1 && <p className="mt-1 text-xs text-stone-500">Drag photos or use the arrows to change the order. They show on the website after the cover photo, in this order.</p>}
            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
        </div>
    );
}
