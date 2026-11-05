import { mealIcon } from '@/Components/Site/Amenity';
import PageHeader from '@/Components/Site/PageHeader';
import SiteLayout from '@/Layouts/SiteLayout';
import { Link } from '@inertiajs/react';
import { ArrowRight, Coffee, GlassWater } from 'lucide-react';

export default function Dining({ meals }) {
    const served = meals.filter((m) => m.sections.length > 0);

    return (
        <SiteLayout title="Food & Dining">
            <PageHeader
                eyebrow="Full Board"
                title="Food & Dining"
                subtitle="Traditional Sri Lankan home cooking — breakfast, lunch and dinner are included in every full board package."
                image="/images/samples/food-rice-curry.jpg"
                imageClassName="object-center"
            />

            <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
                <div className="grid gap-4 sm:grid-cols-2">
                    <p className="card flex items-center gap-3 p-4 text-sm text-stone-700">
                        <GlassWater className="h-6 w-6 shrink-0 text-stone-800" aria-hidden />
                        <span>
                            <span className="block font-semibold text-stone-900">Free welcome drink</span>
                            On arrival, with every stay
                        </span>
                    </p>
                    <p className="card flex items-center gap-3 p-4 text-sm text-stone-700">
                        <Coffee className="h-6 w-6 shrink-0 text-stone-800" aria-hidden />
                        <span>
                            <span className="block font-semibold text-stone-900">Free bed tea</span>
                            Every morning, with every stay
                        </span>
                    </p>
                </div>

                <div className="mt-10 grid gap-6 lg:grid-cols-3">
                    {served.map((meal) => {
                        const Icon = mealIcon(meal.key);
                        return (
                            <article key={meal.key} className="card p-6">
                                <h2 className="flex items-center gap-2 font-display text-3xl font-semibold text-forest-800">
                                    <Icon className="h-6 w-6 text-stone-800" aria-hidden /> {meal.label}
                                </h2>
                                <div className="mt-5 space-y-5">
                                    {meal.sections.map((section) => (
                                        <div key={section.id}>
                                            <h3 className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wider text-stone-500">
                                                {section.title}
                                                {section.note && (
                                                    <span className="rounded-full bg-leaf-500/10 px-2 py-0.5 text-[11px] normal-case tracking-normal text-leaf-600">
                                                        {section.note}
                                                    </span>
                                                )}
                                            </h3>
                                            <ul className="mt-2 space-y-1 text-stone-700">
                                                {(section.items ?? []).map((item) => (
                                                    <li key={item} className="flex gap-2">
                                                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gold-500" aria-hidden />
                                                        {item}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    ))}
                                </div>
                            </article>
                        );
                    })}
                </div>
                {served.length === 0 && <p className="mt-10 text-center text-stone-500">Our menu will be listed here soon.</p>}

                <div className="mt-12 flex flex-wrap justify-center gap-4">
                    <Link href={route('packages.index')} className="btn-leaf">
                        View full board packages <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>
            </section>
        </SiteLayout>
    );
}
