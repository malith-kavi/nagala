import { PackageCard } from '@/Components/Site/Cards';
import ImageWithFallback from '@/Components/Site/ImageWithFallback';
import Prose from '@/Components/Site/Prose';
import SectionHeading from '@/Components/Site/SectionHeading';
import SiteLayout from '@/Layouts/SiteLayout';
import { formatLKR } from '@/lib/format';
import { Link } from '@inertiajs/react';
import { ArrowLeft, CalendarDays, Check, Home, Moon, Users } from 'lucide-react';

export default function PackageShow({ package: pkg, others }) {
    return (
        <SiteLayout title={pkg.name}>
            <section className="mx-auto max-w-6xl px-4 pb-16 pt-8 sm:px-6 lg:px-8">
                <Link href={route('packages.index')} className="inline-flex items-center gap-1 text-sm text-forest-700 hover:underline">
                    <ArrowLeft className="h-4 w-4" /> All packages
                </Link>

                <div className="mt-4 grid gap-10 lg:grid-cols-[1fr_340px]">
                    <div>
                        <ImageWithFallback src={pkg.cover_image_url} alt={pkg.name} label={pkg.name} className="aspect-[16/9] w-full rounded-xl" />
                        <p className="eyebrow mt-8">Special Offer</p>
                        <h1 className="mt-1 font-serif text-4xl font-semibold text-forest-800 sm:text-5xl">{pkg.name}</h1>
                        {pkg.short_description && <p className="mt-3 text-lg text-stone-600">{pkg.short_description}</p>}
                        <Prose text={pkg.description} className="mt-6" />
                    </div>

                    <aside className="card h-fit p-6 lg:sticky lg:top-24">
                        <p className="text-3xl font-bold text-forest-800">{formatLKR(pkg.price)}</p>
                        <p className="text-sm text-stone-500">per package</p>
                        <ul className="mt-5 space-y-2.5 text-sm text-stone-700">
                            <li className="flex items-center gap-2">
                                <Moon className="h-4 w-4 text-gold-600" /> {pkg.nights} night{pkg.nights > 1 ? 's' : ''}
                            </li>
                            <li className="flex items-center gap-2">
                                <Users className="h-4 w-4 text-gold-600" /> {pkg.guests} guests
                            </li>
                            {pkg.cabana && (
                                <li className="flex items-center gap-2">
                                    <Home className="h-4 w-4 text-gold-600" /> Stay in the{' '}
                                    <Link href={route('cabanas.show', pkg.cabana.slug)} className="text-forest-700 underline">
                                        {pkg.cabana.name}
                                    </Link>
                                </li>
                            )}
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
