import { PackageCard } from '@/Components/Site/Cards';
import PageHeader from '@/Components/Site/PageHeader';
import PrefetchLink from '@/Components/Site/PrefetchLink';
import SiteLayout from '@/Layouts/SiteLayout';
import { Utensils } from 'lucide-react';

export default function PackagesIndex({ packages }) {
    return (
        <SiteLayout title="Packages & Offers">
            <PageHeader
                eyebrow="Full Board"
                title="Packages & Offers"
                subtitle="Full board stays — your cottage with breakfast, lunch & dinner, plus a free welcome drink and bed tea."
            />
            <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
                <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                    {packages.map((p) => (
                        <PackageCard key={p.id} pkg={p} />
                    ))}
                </div>
                {packages.length === 0 && <p className="text-center text-stone-500">New packages are coming soon.</p>}
                <p className="mt-10 text-center">
                    <PrefetchLink href={route('dining')} className="inline-flex items-center gap-1.5 font-medium text-forest-700 hover:underline">
                        <Utensils className="h-4 w-4" /> See what&rsquo;s on the full board menu
                    </PrefetchLink>
                </p>
            </section>
        </SiteLayout>
    );
}
