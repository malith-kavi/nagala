import ImageWithFallback from '@/Components/Site/ImageWithFallback';
import { formatLKR } from '@/lib/format';
import { Link } from '@inertiajs/react';
import { ArrowRight, BedDouble, Clock, Eye, Home, MapPin, Sofa, Sparkles, Users } from 'lucide-react';

const featureIcon = (feature) => {
    const f = feature.toLowerCase();
    if (f.includes('veranda')) return Sofa;
    if (f.includes('view')) return Eye;
    if (f.includes('family')) return Home;
    return Sparkles;
};

function Row({ icon: Icon, children }) {
    return (
        <li className="flex items-center gap-2 text-[13px] text-stone-600">
            <Icon className="h-4 w-4 shrink-0 text-gold-600" aria-hidden />
            {children}
        </li>
    );
}

export function CabanaCard({ cabana, className = '' }) {
    const href = route('cabanas.show', cabana.slug);

    return (
        <article className={`card flex flex-col ${className}`}>
            <Link href={href} className="block overflow-hidden">
                <ImageWithFallback
                    src={cabana.cover_image_url}
                    alt={cabana.name}
                    label={cabana.name}
                    className="aspect-[4/3] w-full transition duration-500 hover:scale-105"
                />
            </Link>
            <div className="flex flex-1 flex-col p-5">
                <h3 className="text-lg font-semibold text-stone-900">
                    <Link href={href}>{cabana.name}</Link>
                </h3>
                <ul className="mt-3 space-y-1.5">
                    <Row icon={Users}>{cabana.max_guests} Guests</Row>
                    {cabana.beds && <Row icon={BedDouble}>{cabana.beds}</Row>}
                    {(cabana.features ?? []).slice(0, 2).map((f) => (
                        <Row key={f} icon={featureIcon(f)}>
                            {f}
                        </Row>
                    ))}
                </ul>
                <p className="mt-4 text-sm text-stone-700">
                    From <span className="text-xl font-bold text-stone-900">{formatLKR(cabana.price_per_night)}</span>{' '}
                    <span className="text-stone-500">/ night</span>
                </p>
                <Link href={href} className="btn-primary mt-4 w-full rounded-md">
                    View Details <ArrowRight className="h-4 w-4" />
                </Link>
            </div>
        </article>
    );
}

export function PlaceCard({ place, className = '' }) {
    const href = route('places.show', place.slug);

    return (
        <article className={`card flex flex-col ${className}`}>
            <Link href={href} className="block overflow-hidden">
                <ImageWithFallback
                    src={place.cover_image_url}
                    alt={place.name}
                    label={place.name}
                    className="aspect-[4/3] w-full transition duration-500 hover:scale-105"
                />
            </Link>
            <div className="flex flex-1 flex-col p-4">
                <h3 className="font-semibold leading-snug text-stone-900">
                    <Link href={href}>{place.name}</Link>
                </h3>
                <p className="mt-2 flex items-center gap-1.5 text-xs text-stone-600">
                    {place.distance_km ? (
                        <>
                            <Clock className="h-3.5 w-3.5 text-gold-600" aria-hidden />
                            {place.distance_km} km{place.travel_minutes ? ` • ${place.travel_minutes} min` : ''}
                        </>
                    ) : (
                        <>
                            <MapPin className="h-3.5 w-3.5 text-gold-600" aria-hidden />
                            {place.tagline || 'Nearby'}
                        </>
                    )}
                </p>
                <p className="mt-2 flex-1 text-xs leading-relaxed text-stone-600">{place.short_description}</p>
                <Link href={href} className="btn-primary mt-3 w-full rounded-md px-3 py-1.5 text-xs">
                    View Details <ArrowRight className="h-3.5 w-3.5" />
                </Link>
            </div>
        </article>
    );
}

/** Package prices cover the package's nights, so "/ night" for the usual 1-night packages. */
export const packageUnit = (pkg) => (pkg.nights > 1 ? `/ ${pkg.nights} nights` : '/ night');

export function PackageCard({ pkg, className = '' }) {
    const href = route('packages.show', pkg.slug);

    return (
        <article className={`card flex flex-col text-center ${className}`}>
            <Link href={href} className="block overflow-hidden">
                <ImageWithFallback
                    src={pkg.cover_image_url}
                    alt={pkg.name}
                    label={pkg.name}
                    className="aspect-[16/9] w-full transition duration-500 hover:scale-105"
                />
            </Link>
            <div className="flex flex-1 flex-col items-center p-5">
                <h3 className="text-lg font-semibold text-stone-900">
                    <Link href={href}>{pkg.name}</Link>
                </h3>
                <p className="mt-2 flex items-center gap-1.5 text-[13px] text-stone-600">
                    <Users className="h-4 w-4 text-gold-600" aria-hidden />
                    {pkg.guests} Guests • Full Board
                </p>
                <p className="mt-1 text-[13px] text-stone-600">{(pkg.inclusions ?? []).join(' + ')}</p>
                <p className="mt-3 flex-1 text-xl font-bold text-forest-700">
                    {formatLKR(pkg.price)} <span className="text-sm font-normal text-stone-500">{packageUnit(pkg)}</span>
                </p>
                <Link href={href} className="btn-primary mt-3 w-full max-w-[220px] rounded-md">
                    View Package <ArrowRight className="h-4 w-4" />
                </Link>
            </div>
        </article>
    );
}
