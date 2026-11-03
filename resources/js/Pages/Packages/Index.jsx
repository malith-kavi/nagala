import { PackageCard } from '@/Components/Site/Cards';
import PageHeader from '@/Components/Site/PageHeader';
import SiteLayout from '@/Layouts/SiteLayout';

export default function PackagesIndex({ packages }) {
    return (
        <SiteLayout title="Packages & Offers">
            <PageHeader eyebrow="Special Offers" title="Packages & Offers" subtitle="Special packages for couples, families and groups." />
            <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
                <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                    {packages.map((p) => (
                        <PackageCard key={p.id} pkg={p} />
                    ))}
                </div>
                {packages.length === 0 && <p className="text-center text-stone-500">New packages are coming soon.</p>}
            </section>
        </SiteLayout>
    );
}
