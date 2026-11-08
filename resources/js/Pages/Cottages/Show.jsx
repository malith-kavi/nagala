import { Amenity, featureIcon, Pax } from '@/Components/Site/Amenity';
import { CottageCard } from '@/Components/Site/Cards';
import PhotoGallery from '@/Components/Site/PhotoGallery';
import Prose from '@/Components/Site/Prose';
import SectionHeading from '@/Components/Site/SectionHeading';
import SiteLayout from '@/Layouts/SiteLayout';
import { formatLKR } from '@/lib/format';
import { cardSizes } from '@/lib/imageSrcSet';
import { Link, usePage } from '@inertiajs/react';
import { ArrowLeft, Banknote, BedDouble, CalendarDays, Check, Clock, GlassWater, Zap } from 'lucide-react';

export default function CottageShow({ cottage, others }) {
    const { settings } = usePage().props;
    const photos = [cottage.cover_image_url, ...(cottage.image_urls ?? [])].filter(Boolean).map((url) => ({ url, caption: cottage.name }));

    return (
        <SiteLayout title={cottage.name}>
            <section className="mx-auto max-w-6xl px-4 pb-16 pt-8 sm:px-6 lg:px-8">
                <Link href={route('cottages.index')} className="inline-flex items-center gap-1 text-sm text-forest-700 hover:underline">
                    <ArrowLeft className="h-4 w-4" /> All cottages
                </Link>

                <PhotoGallery photos={photos} name={cottage.name} className="mt-4" />

                <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_340px]">
                    <div>
                        <p className="eyebrow">Eco Cottage</p>
                        <h1 className="mt-1 font-display text-4xl font-semibold text-forest-800 sm:text-5xl">{cottage.name}</h1>
                        {cottage.short_description && <p className="mt-3 text-lg text-stone-600">{cottage.short_description}</p>}

                        <div className="mt-6 flex flex-wrap gap-6 text-sm">
                            <Amenity as="span" size="md" lead={<Pax count={cottage.max_guests} size="md" />}>
                                Up to {cottage.max_guests} guests
                            </Amenity>
                            {cottage.beds && (
                                <Amenity as="span" size="md" icon={BedDouble}>
                                    {cottage.beds}
                                </Amenity>
                            )}
                            <Amenity as="span" size="md" icon={Clock}>
                                Check-in {settings.check_in_time} · Check-out {settings.check_out_time}
                            </Amenity>
                        </div>

                        <Prose text={cottage.description} className="mt-8" />

                        {cottage.feature_list?.length > 0 && (
                            <>
                                <h2 className="mt-10 font-display text-2xl font-semibold text-forest-800">Amenities</h2>
                                <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                                    {cottage.feature_list.map((f) => (
                                        <Amenity key={f.key} size="md" icon={featureIcon(f)}>
                                            {f.label}
                                        </Amenity>
                                    ))}
                                </ul>
                            </>
                        )}
                    </div>

                    <aside className="card h-fit p-6 lg:sticky lg:top-24">
                        <p className="text-sm text-stone-600">From</p>
                        <p className="text-3xl font-bold text-forest-800">
                            {formatLKR(cottage.price_per_night)} <span className="text-base font-normal text-stone-500">/ night</span>
                        </p>
                        <p className="text-xs text-stone-500">Cottage only · full board packages available</p>
                        <ul className="mt-4 space-y-2 text-sm">
                            <Amenity tone="perk" icon={GlassWater}>
                                Free welcome drink &amp; bed tea
                            </Amenity>
                            <Amenity tone="perk" icon={Banknote}>
                                Pay on arrival – no card needed
                            </Amenity>
                            <Amenity tone="perk" icon={Zap}>
                                Instant booking request
                            </Amenity>
                            <Amenity tone="perk" icon={Check}>
                                Free cancellation – just let us know
                            </Amenity>
                        </ul>
                        <Link href={route('book', { cottage: cottage.slug })} className="btn-leaf mt-6 w-full">
                            <CalendarDays className="h-4 w-4" /> Book this cottage
                        </Link>
                    </aside>
                </div>
            </section>

            {others.length > 0 && (
                <section className="bg-cream-200/60 py-16">
                    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
                        <SectionHeading eyebrow="More Options" title="Other Cottages" />
                        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {others.map((c) => (
                                <CottageCard key={c.id} cottage={c} sizes={cardSizes(3)} />
                            ))}
                        </div>
                    </div>
                </section>
            )}

        </SiteLayout>
    );
}
