import { PlaceCard } from '@/Components/Site/Cards';
import PageHeader from '@/Components/Site/PageHeader';
import SiteLayout from '@/Layouts/SiteLayout';

export default function PlacesIndex({ places }) {
    return (
        <SiteLayout title="Nearby Places">
            <PageHeader
                eyebrow="Explore Around"
                title="Experience Nagala"
                subtitle="More than just a stay – discover nature, culture and adventure."
            />
            <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {places.map((p) => (
                        <PlaceCard key={p.id} place={p} />
                    ))}
                </div>
            </section>
        </SiteLayout>
    );
}
