import ImageWithFallback from '@/Components/Site/ImageWithFallback';
import Lightbox from '@/Components/Site/Lightbox';
import PageHeader from '@/Components/Site/PageHeader';
import SiteLayout from '@/Layouts/SiteLayout';
import { ImageIcon } from 'lucide-react';
import { useMemo, useState } from 'react';

export default function Gallery({ images, categories }) {
    const [filter, setFilter] = useState('all');
    const [lightbox, setLightbox] = useState(null);

    const visible = useMemo(() => (filter === 'all' ? images : images.filter((i) => i.category === filter)), [images, filter]);
    const used = categories.filter((c) => images.some((i) => i.category === c));

    return (
        <SiteLayout title="Gallery">
            <PageHeader eyebrow="Moments at Nagala" title="Gallery" subtitle="A glimpse of life at the cottage and the beauty around us." />

            {/* Wider than other pages so four columns of photos stay large */}
            <section className="mx-auto max-w-screen-2xl px-3 py-14 sm:px-4 lg:px-6">
                {used.length > 1 && (
                    <div className="mb-10 flex flex-wrap justify-center gap-2">
                        {['all', ...used].map((c) => (
                            <button
                                key={c}
                                type="button"
                                onClick={() => setFilter(c)}
                                className={`rounded-full px-5 py-2 text-sm font-medium capitalize transition ${
                                    filter === c ? 'bg-forest-700 text-white' : 'bg-white text-stone-700 ring-1 ring-stone-200 hover:bg-forest-50'
                                }`}
                            >
                                {c}
                            </button>
                        ))}
                    </div>
                )}

                {visible.length ? (
                    // Keyed by the filter, so switching category fades the new set of photos in.
                    <div key={filter} className="columns-2 gap-3 animate-fade-in sm:gap-4 md:columns-3 lg:columns-4">
                        {visible.map((img, i) => (
                            <button
                                key={img.id}
                                type="button"
                                onClick={() => setLightbox(i)}
                                className="group relative isolate mb-3 block w-full overflow-hidden rounded-xl break-inside-avoid sm:mb-4"
                            >
                                <ImageWithFallback
                                    src={img.url}
                                    alt={img.caption || ''}
                                    sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
                                    className="w-full transition-transform duration-700 ease-smooth group-hover:scale-105"
                                />
                                {img.caption && (
                                    <span className="absolute inset-x-0 bottom-0 translate-y-1 bg-gradient-to-t from-black/70 to-transparent p-3 text-left text-sm text-white opacity-0 transition duration-300 ease-smooth group-hover:translate-y-0 group-hover:opacity-100">
                                        {img.caption}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center py-20 text-stone-500">
                        <ImageIcon className="h-12 w-12 text-forest-300" />
                        <p className="mt-3">Photos are coming soon.</p>
                    </div>
                )}
            </section>

            <Lightbox images={visible} index={lightbox} onClose={() => setLightbox(null)} onChange={setLightbox} />
        </SiteLayout>
    );
}
