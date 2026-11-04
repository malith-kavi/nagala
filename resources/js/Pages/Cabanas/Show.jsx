import { CabanaCard } from '@/Components/Site/Cards';
import ImageWithFallback from '@/Components/Site/ImageWithFallback';
import Lightbox from '@/Components/Site/Lightbox';
import Prose from '@/Components/Site/Prose';
import SectionHeading from '@/Components/Site/SectionHeading';
import SiteLayout from '@/Layouts/SiteLayout';
import { formatLKR } from '@/lib/format';
import { Link, usePage } from '@inertiajs/react';
import { ArrowLeft, BedDouble, CalendarDays, Check, Clock, Users } from 'lucide-react';
import { useState } from 'react';

export default function CabanaShow({ cabana, others }) {
    const { settings } = usePage().props;
    const photos = [cabana.cover_image_url, ...(cabana.image_urls ?? [])].filter(Boolean).map((url) => ({ url, caption: cabana.name }));
    const [lightbox, setLightbox] = useState(null);

    return (
        <SiteLayout title={cabana.name}>
            <section className="mx-auto max-w-6xl px-4 pb-16 pt-8 sm:px-6 lg:px-8">
                <Link href={route('cabanas.index')} className="inline-flex items-center gap-1 text-sm text-forest-700 hover:underline">
                    <ArrowLeft className="h-4 w-4" /> All cabanas
                </Link>

                {/* Photo grid */}
                <div className="mt-4 grid gap-3 sm:grid-cols-4 sm:grid-rows-2">
                    <button
                        type="button"
                        onClick={() => photos.length && setLightbox(0)}
                        className="overflow-hidden rounded-xl sm:col-span-3 sm:row-span-2"
                    >
                        <ImageWithFallback src={photos[0]?.url} alt={cabana.name} label={cabana.name} className="aspect-[16/10] h-full w-full" />
                    </button>
                    {photos.slice(1, 3).map((p, i) => (
                        <button key={p.url} type="button" onClick={() => setLightbox(i + 1)} className="hidden overflow-hidden rounded-xl sm:block">
                            <img src={p.url} alt="" className="h-full w-full object-cover transition hover:scale-105" />
                        </button>
                    ))}
                </div>
                {photos.length > 3 && (
                    <button type="button" onClick={() => setLightbox(0)} className="mt-3 text-sm font-medium text-forest-700 hover:underline">
                        View all {photos.length} photos
                    </button>
                )}

                <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_340px]">
                    <div>
                        <p className="eyebrow">Eco Cabana</p>
                        <h1 className="mt-1 font-display text-4xl font-semibold text-forest-800 sm:text-5xl">{cabana.name}</h1>
                        {cabana.short_description && <p className="mt-3 text-lg text-stone-600">{cabana.short_description}</p>}

                        <div className="mt-6 flex flex-wrap gap-6 text-sm text-stone-700">
                            <span className="flex items-center gap-2">
                                <Users className="h-5 w-5 text-gold-600" /> Up to {cabana.max_guests} guests
                            </span>
                            {cabana.beds && (
                                <span className="flex items-center gap-2">
                                    <BedDouble className="h-5 w-5 text-gold-600" /> {cabana.beds}
                                </span>
                            )}
                            <span className="flex items-center gap-2">
                                <Clock className="h-5 w-5 text-gold-600" /> Check-in {settings.check_in_time} · Check-out {settings.check_out_time}
                            </span>
                        </div>

                        <Prose text={cabana.description} className="mt-8" />

                        {cabana.features?.length > 0 && (
                            <>
                                <h2 className="mt-10 font-display text-2xl font-semibold text-forest-800">Amenities</h2>
                                <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                                    {cabana.features.map((f) => (
                                        <li key={f} className="flex items-center gap-2 text-stone-700">
                                            <Check className="h-4 w-4 text-leaf-500" /> {f}
                                        </li>
                                    ))}
                                </ul>
                            </>
                        )}
                    </div>

                    <aside className="card h-fit p-6 lg:sticky lg:top-24">
                        <p className="text-sm text-stone-600">From</p>
                        <p className="text-3xl font-bold text-forest-800">
                            {formatLKR(cabana.price_per_night)} <span className="text-base font-normal text-stone-500">/ night</span>
                        </p>
                        <ul className="mt-4 space-y-2 text-sm text-stone-600">
                            <li className="flex gap-2">
                                <Check className="h-4 w-4 text-leaf-500" /> Pay on arrival – no card needed
                            </li>
                            <li className="flex gap-2">
                                <Check className="h-4 w-4 text-leaf-500" /> Instant booking request
                            </li>
                            <li className="flex gap-2">
                                <Check className="h-4 w-4 text-leaf-500" /> Free cancellation – just let us know
                            </li>
                        </ul>
                        <Link href={route('book', { cabana: cabana.slug })} className="btn-leaf mt-6 w-full">
                            <CalendarDays className="h-4 w-4" /> Book this cabana
                        </Link>
                    </aside>
                </div>
            </section>

            {others.length > 0 && (
                <section className="bg-cream-200/60 py-16">
                    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
                        <SectionHeading eyebrow="More Options" title="Other Cabanas" />
                        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {others.map((c) => (
                                <CabanaCard key={c.id} cabana={c} />
                            ))}
                        </div>
                    </div>
                </section>
            )}

            <Lightbox images={photos} index={lightbox} onClose={() => setLightbox(null)} onChange={setLightbox} />
        </SiteLayout>
    );
}
