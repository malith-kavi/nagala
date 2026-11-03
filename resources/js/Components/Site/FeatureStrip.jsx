import { Leaf, MapPin, Mountain, Sprout } from 'lucide-react';

const features = [
    { icon: Sprout, title: 'Nature Stay', text: 'Relax in natural surroundings' },
    { icon: Mountain, title: 'Mountain View', text: 'Breathtaking rock and nature views' },
    { icon: Leaf, title: 'Eco Friendly', text: 'Sustainable & environment friendly' },
    { icon: MapPin, title: 'Peaceful Location', text: 'A calm and relaxing environment' },
];

export default function FeatureStrip() {
    return (
        <section className="relative z-10 bg-cream-50">
            <div className="mx-auto grid max-w-6xl grid-cols-2 divide-stone-200 px-4 py-10 md:grid-cols-4 md:divide-x">
                {features.map(({ icon: Icon, title, text }) => (
                    <div key={title} className="flex flex-col items-center px-4 py-4 text-center">
                        <Icon className="h-9 w-9 text-forest-700" strokeWidth={1.4} aria-hidden />
                        <h3 className="mt-3 text-sm font-semibold text-stone-900">{title}</h3>
                        <p className="mt-1 max-w-[160px] text-xs text-stone-600">{text}</p>
                    </div>
                ))}
            </div>
        </section>
    );
}
