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

            <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
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
                    <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
                        {visible.map((img, i) => (
                            <button
                                key={img.id}
                                type="button"
                                onClick={() => setLightbox(i)}
                                className="group relative mb-4 block w-full overflow-hidden rounded-xl break-inside-avoid"
                            >
                                <img src={img.url} alt={img.caption || ''} loading="lazy" className="w-full transition duration-500 group-hover:scale-105" />
                                {img.caption && (
                                    <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3 text-left text-sm text-white opacity-0 transition group-hover:opacity-100">
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
