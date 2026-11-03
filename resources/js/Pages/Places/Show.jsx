import { PlaceCard } from '@/Components/Site/Cards';
import ImageWithFallback from '@/Components/Site/ImageWithFallback';
import Prose from '@/Components/Site/Prose';
import SectionHeading from '@/Components/Site/SectionHeading';
import SiteLayout from '@/Layouts/SiteLayout';
import { Link } from '@inertiajs/react';
import { ArrowLeft, CalendarDays, Clock, ExternalLink, MapPin } from 'lucide-react';

export default function PlaceShow({ place, others }) {
    return (
        <SiteLayout title={place.name}>
            <section className="mx-auto max-w-5xl px-4 pb-16 pt-8 sm:px-6 lg:px-8">
                <Link href={route('places.index')} className="inline-flex items-center gap-1 text-sm text-forest-700 hover:underline">
                    <ArrowLeft className="h-4 w-4" /> All nearby places
                </Link>
                <ImageWithFallback src={place.cover_image_url} alt={place.name} label={place.name} className="mt-4 aspect-[16/8] w-full rounded-xl" />

                <p className="eyebrow mt-8">Explore Around</p>
                <h1 className="mt-1 font-serif text-4xl font-semibold text-forest-800 sm:text-5xl">{place.name}</h1>
                <div className="mt-4 flex flex-wrap gap-6 text-sm text-stone-700">
                    {place.distance_km && (
                        <span className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-gold-600" /> {place.distance_km} km from the cottage
                        </span>
                    )}
                    {place.travel_minutes && (
                        <span className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-gold-600" /> About {place.travel_minutes} min drive
                        </span>
                    )}
                </div>

                <Prose text={place.description || place.short_description} className="mt-6 text-lg" />

                <div className="mt-8 flex flex-wrap gap-3">
                    <Link href={route('book')} className="btn-leaf">
                        <CalendarDays className="h-4 w-4" /> Book your stay
                    </Link>
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
                                <PlaceCard key={p.id} place={p} />
                            ))}
                        </div>
                    </div>
                </section>
            )}
        </SiteLayout>
    );
}
