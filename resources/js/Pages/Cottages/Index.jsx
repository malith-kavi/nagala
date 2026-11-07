import { CottageCard } from '@/Components/Site/Cards';
import PageHeader from '@/Components/Site/PageHeader';
import SiteLayout from '@/Layouts/SiteLayout';

export default function CottagesIndex({ cottages }) {
    return (
        <SiteLayout title="Our Eco Cottages">
            <PageHeader
                eyebrow="Our Stay Options"
                title="Our Eco Cottages"
                subtitle="Handcrafted thatched cottages surrounded by tropical greenery and mountain views."
            />
            <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {cottages.map((c) => (
                        <CottageCard key={c.id} cottage={c} />
                    ))}
                </div>
                {cottages.length === 0 && <p className="text-center text-stone-500">Cottages will be listed here soon.</p>}
            </section>
        </SiteLayout>
    );
}
