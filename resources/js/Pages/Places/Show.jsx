import { Amenity } from '@/Components/Site/Amenity';
import { PlaceCard } from '@/Components/Site/Cards';
import PhotoGallery from '@/Components/Site/PhotoGallery';
import PrefetchLink from '@/Components/Site/PrefetchLink';
import Prose from '@/Components/Site/Prose';
import SectionHeading from '@/Components/Site/SectionHeading';
import SiteLayout from '@/Layouts/SiteLayout';
import { gallerySizes } from '@/lib/bundledImages.json';
import { cardSizes } from '@/lib/imageSrcSet';
import { ArrowLeft, CalendarDays, Car, ExternalLink, MapPin } from 'lucide-react';

export default function PlaceShow({ place, others }) {
    const photos = [place.cover_image_url, ...(place.image_urls ?? [])].filter(Boolean).map((url) => ({ url, caption: place.name }));

    return (
        <SiteLayout title={place.name}>
            <section className="mx-auto max-w-5xl px-4 pb-16 pt-8 sm:px-6 lg:px-8">
                <PrefetchLink href={route('places.index')} className="inline-flex items-center gap-1 text-sm text-forest-700 hover:underline">
                    <ArrowLeft className="h-4 w-4" /> All nearby places
                </PrefetchLink>
                <PhotoGallery photos={photos} name={place.name} sizes={gallerySizes.place} className="mt-4" />
                {place.cover_image_url && place.cover_credit && <p className="mt-2 text-right text-xs text-stone-500">{place.cover_credit}</p>}

                <p className="eyebrow mt-8">Explore Around</p>
                <h1 className="mt-1 font-display text-4xl font-semibold text-forest-800 sm:text-5xl">{place.name}</h1>
                <div className="mt-4 flex flex-wrap gap-6 text-sm">
                    {place.distance_km && (
                        <Amenity as="span" icon={MapPin}>
                            {place.distance_km} km from the cottage
                        </Amenity>
                    )}
                    {place.travel_minutes && (
                        <Amenity as="span" icon={Car}>
                            About {place.travel_minutes} min drive
                        </Amenity>
                    )}
                </div>

                <Prose text={place.description || place.short_description} className="mt-6 text-lg" />

                <div className="mt-8 flex flex-wrap gap-3">
                    <PrefetchLink href={route('book')} className="btn-leaf">
                        <CalendarDays className="h-4 w-4" /> Book your stay
                    </PrefetchLink>
                    {place.map_url && (
                        <a href={place.map_url} target="_blank" rel="noreferrer" className="btn-outline">
                            <ExternalLink className="h-4 w-4" /> Open in Google Maps
                        </a>
                    )}
                </div>
            </section>

            {others.length > 0 && (
                <section className="leaf-bg py-16">
                    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
                        <SectionHeading light eyebrow="Keep Exploring" title="More Places Nearby" />
                        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {others.map((p) => (
                                <PlaceCard key={p.id} place={p} sizes={cardSizes(3, { container: 1152 })} />
                            ))}
                        </div>
                    </div>
                </section>
            )}
        </SiteLayout>
    );
}
