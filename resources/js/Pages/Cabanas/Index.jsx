import { CabanaCard } from '@/Components/Site/Cards';
import PageHeader from '@/Components/Site/PageHeader';
import SiteLayout from '@/Layouts/SiteLayout';

export default function CabanasIndex({ cabanas }) {
    return (
        <SiteLayout title="Our Eco Cabanas">
            <PageHeader
                eyebrow="Our Stay Options"
                title="Our Eco Cabanas"
                subtitle="Handcrafted thatched cabanas surrounded by tropical greenery and mountain views."
            />
            <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {cabanas.map((c) => (
                        <CabanaCard key={c.id} cabana={c} />
                    ))}
                </div>
                {cabanas.length === 0 && <p className="text-center text-stone-500">Cabanas will be listed here soon.</p>}
            </section>
        </SiteLayout>
    );
}
