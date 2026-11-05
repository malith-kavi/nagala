import { PackageCard, packageUnit } from '@/Components/Site/Cards';
import ImageWithFallback from '@/Components/Site/ImageWithFallback';
import Prose from '@/Components/Site/Prose';
import SectionHeading from '@/Components/Site/SectionHeading';
import SiteLayout from '@/Layouts/SiteLayout';
import { formatLKR } from '@/lib/format';
import { Link, usePage } from '@inertiajs/react';
import { ArrowLeft, CalendarDays, Check, Clock, Home, Users, UtensilsCrossed } from 'lucide-react';
import { Fragment } from 'react';

export default function PackageShow({ package: pkg, cabanas, others }) {
    const { settings } = usePage().props;

    return (
        <SiteLayout title={pkg.name}>
            <section className="mx-auto max-w-6xl px-4 pb-16 pt-8 sm:px-6 lg:px-8">
                <Link href={route('packages.index')} className="inline-flex items-center gap-1 text-sm text-forest-700 hover:underline">
                    <ArrowLeft className="h-4 w-4" /> All packages
                </Link>

                <div className="mt-4 grid gap-10 lg:grid-cols-[1fr_340px]">
                    <div>
                        <ImageWithFallback src={pkg.cover_image_url} alt={pkg.name} label={pkg.name} className="aspect-[16/9] w-full rounded-xl" />
                        <p className="eyebrow mt-8">Full Board Package</p>
                        <h1 className="mt-1 font-display text-4xl font-semibold text-forest-800 sm:text-5xl">{pkg.name}</h1>
                        {pkg.short_description && <p className="mt-3 text-lg text-stone-600">{pkg.short_description}</p>}
                        <Prose text={pkg.description} className="mt-6" />
                    </div>

                    <aside className="card h-fit p-6 lg:sticky lg:top-24">
                        <p className="text-3xl font-bold text-forest-800">
                            {formatLKR(pkg.price)} <span className="text-base font-normal text-stone-500">{packageUnit(pkg)}</span>
                        </p>
                        <ul className="mt-5 space-y-2.5 text-sm text-stone-700">
                            <li className="flex items-center gap-2">
                                <Users className="h-4 w-4 shrink-0 text-gold-600" /> {pkg.guests} guests
                            </li>
                            {cabanas.length > 0 && (
                                <li className="flex items-start gap-2">
                                    <Home className="mt-0.5 h-4 w-4 shrink-0 text-gold-600" />
                                    <span>
                                        Stay in the{' '}
                                        {cabanas.map((c, i) => (
                                            <Fragment key={c.id}>
                                                {i > 0 && ' or '}
                                                <Link href={route('cabanas.show', c.slug)} className="text-forest-700 underline">
                                                    {c.name}
                                                </Link>
                                            </Fragment>
                                        ))}
                                    </span>
                                </li>
                            )}
                            <li className="flex items-center gap-2">
                                <Clock className="h-4 w-4 shrink-0 text-gold-600" /> Check-in {settings.check_in_time} · Check-out {settings.check_out_time}
                            </li>
                        </ul>
                        {pkg.inclusions?.length > 0 && (
                            <>
                                <p className="mt-5 text-sm font-semibold text-stone-900">Included</p>
                                <ul className="mt-2 space-y-1.5 text-sm text-stone-700">
                                    {pkg.inclusions.map((i) => (
                                        <li key={i} className="flex items-center gap-2">
                                            <Check className="h-4 w-4 text-leaf-500" /> {i}
                                        </li>
                                    ))}
                                </ul>
                            </>
                        )}
                        <Link href={route('dining')} className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-forest-700 hover:underline">
                            <UtensilsCrossed className="h-4 w-4" /> See what&rsquo;s on the menu
                        </Link>
                        <Link href={route('book', { package: pkg.slug })} className="btn-leaf mt-6 w-full">
                            <CalendarDays className="h-4 w-4" /> Book this package
                        </Link>
                    </aside>
                </div>
            </section>

            {others.length > 0 && (
                <section className="bg-cream-200/60 py-16">
                    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
                        <SectionHeading eyebrow="More Offers" title="Other Packages" />
                        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {others.map((p) => (
                                <PackageCard key={p.id} pkg={p} />
                            ))}
                        </div>
                    </div>
                </section>
            )}
        </SiteLayout>
    );
}
