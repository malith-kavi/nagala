import { Amenity, featureIcon, isMeal, Pax } from '@/Components/Site/Amenity';
import ImageWithFallback from '@/Components/Site/ImageWithFallback';
import PrefetchLink from '@/Components/Site/PrefetchLink';
import { formatDuration, formatLKR } from '@/lib/format';
import { cardSizes } from '@/lib/imageSrcSet';
import { ArrowRight, BedDouble, Car, MapPin } from 'lucide-react';

/** "Breakfast, Lunch & Dinner" */
const joinList = (items) => (items.length > 1 ? `${items.slice(0, -1).join(', ')} & ${items.at(-1)}` : (items[0] ?? ''));

/** Price + button, pinned to the bottom so cards in a row line up. */
function CardFooter({ href, price, unit, from = false, cta }) {
    return (
        <div className="mt-auto pt-4">
            <p className="border-t border-stone-100 pt-4 text-sm text-stone-700">
                {from && 'From '}
                <span className="text-xl font-bold text-stone-900">{formatLKR(price)}</span> <span className="text-stone-500">{unit}</span>
            </p>
            <PrefetchLink href={href} className="btn-primary mt-4 w-full rounded-md">
                {cta} <ArrowRight className="h-4 w-4" />
            </PrefetchLink>
        </div>
    );
}

export function CottageCard({ cottage, className = '', sizes = cardSizes(4) }) {
    const href = route('cottages.show', cottage.slug);

    return (
        <article className={`card group flex flex-col ${className}`}>
            <PrefetchLink href={href} className="block overflow-hidden">
                <ImageWithFallback
                    src={cottage.cover_image_url}
                    alt={cottage.name}
                    label={cottage.name}
                    sizes={sizes}
                    className="aspect-[4/3] w-full transition-transform duration-700 ease-smooth group-hover:scale-105"
                />
            </PrefetchLink>
            <div className="flex flex-1 flex-col p-5">
                <h3 className="text-lg font-semibold text-stone-900">
                    <PrefetchLink href={href}>{cottage.name}</PrefetchLink>
                </h3>
                <ul className="mt-3 space-y-1.5 text-[13px]">
                    <Amenity lead={<Pax count={cottage.max_guests} />}>Sleeps {cottage.max_guests}</Amenity>
                    {cottage.beds && <Amenity icon={BedDouble}>{cottage.beds}</Amenity>}
                    {(cottage.feature_list ?? []).slice(0, 2).map((f) => (
                        <Amenity key={f.key} icon={featureIcon(f)}>
                            {f.label}
                        </Amenity>
                    ))}
                </ul>
                <CardFooter href={href} price={cottage.price_per_night} unit="/ night" from cta="View Details" />
            </div>
        </article>
    );
}

export function PlaceCard({ place, className = '', sizes = cardSizes(4) }) {
    const href = route('places.show', place.slug);

    return (
        <article className={`card group flex flex-col ${className}`}>
            <PrefetchLink href={href} className="block overflow-hidden">
                <ImageWithFallback
                    src={place.cover_image_url}
                    alt={place.name}
                    label={place.name}
                    sizes={sizes}
                    className="aspect-[4/3] w-full transition-transform duration-700 ease-smooth group-hover:scale-105"
                />
            </PrefetchLink>
            <div className="flex flex-1 flex-col p-4">
                <h3 className="font-semibold leading-snug text-stone-900">
                    <PrefetchLink href={href}>{place.name}</PrefetchLink>
                </h3>
                <ul className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs">
                    <Amenity icon={MapPin} size="xs">
                        {place.distance_km ? `${place.distance_km} km` : place.tagline || 'Nearby'}
                    </Amenity>
                    {place.distance_km && place.travel_minutes && (
                        <Amenity icon={Car} size="xs">
                            {formatDuration(place.travel_minutes)} drive
                        </Amenity>
                    )}
                </ul>
                <p className="mt-2 flex-1 text-xs leading-relaxed text-stone-600">{place.short_description}</p>
                <PrefetchLink href={href} className="btn-primary mt-3 w-full rounded-md px-3 py-1.5 text-xs">
                    View Details <ArrowRight className="h-3.5 w-3.5" />
                </PrefetchLink>
            </div>
        </article>
    );
}

/** Package prices cover the package's nights, so "/ night" for the usual 1-night packages. */
export const packageUnit = (pkg) => (pkg.nights > 1 ? `/ ${pkg.nights} nights` : '/ night');

export function PackageCard({ pkg, className = '', sizes = cardSizes(3) }) {
    const href = route('packages.show', pkg.slug);
    // The card is already a stay, so the cottage itself isn't listed; meals share one row like a bed/guests line.
    const inclusions = (pkg.inclusion_list ?? []).filter((i) => i.key !== 'cottage');
    const meals = inclusions.filter((i) => isMeal(i.label));
    const extras = inclusions.filter((i) => !isMeal(i.label));

    return (
        <article className={`card group flex flex-col ${className}`}>
            <PrefetchLink href={href} className="block overflow-hidden">
                <ImageWithFallback
                    src={pkg.cover_image_url}
                    alt={pkg.name}
                    label={pkg.name}
                    sizes={sizes}
                    className="aspect-[16/9] w-full transition-transform duration-700 ease-smooth group-hover:scale-105"
                />
            </PrefetchLink>
            <div className="flex flex-1 flex-col p-5">
                <h3 className="text-lg font-semibold text-stone-900">
                    <PrefetchLink href={href}>{pkg.name}</PrefetchLink>
                </h3>
                <ul className="mt-3 space-y-1.5 text-[13px]">
                    <Amenity lead={<Pax count={pkg.guests} />}>{pkg.guests} Guests</Amenity>
                    {meals.length > 0 && (
                        <Amenity
                            lead={
                                <span className="inline-flex shrink-0 gap-0.5 text-stone-800">
                                    {meals.map((m) => {
                                        const Icon = featureIcon(m);
                                        return <Icon key={m.key} className="h-4 w-4" aria-hidden />;
                                    })}
                                </span>
                            }
                        >
                            {joinList(meals.map((m) => m.label))}
                        </Amenity>
                    )}
                    {extras.slice(0, 2).map((i) => (
                        <Amenity key={i.key} icon={featureIcon(i)}>
                            {i.label}
                        </Amenity>
                    ))}
                </ul>
                <CardFooter href={href} price={pkg.price} unit={packageUnit(pkg)} cta="View Package" />
            </div>
        </article>
    );
}
