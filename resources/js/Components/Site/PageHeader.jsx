import ImageWithFallback from '@/Components/Site/ImageWithFallback';
import { usePage } from '@inertiajs/react';

/** Compact hero used at the top of inner pages. */
export default function PageHeader({ eyebrow, title, subtitle, image }) {
    const { settings } = usePage().props;
    const src = image ?? settings.banner_image_url ?? settings.hero_image_url;

    return (
        <section className="relative isolate flex min-h-[320px] items-end overflow-hidden pb-14 pt-24">
            <ImageWithFallback src={src} alt="" className="absolute inset-0 -z-20 h-full w-full" />
            <div className="absolute inset-0 -z-10 bg-gradient-to-t from-forest-950/90 via-forest-950/50 to-forest-950/30" />
            <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
                {eyebrow && <p className="eyebrow">{eyebrow}</p>}
                <h1 className="mt-2 font-serif text-4xl font-semibold text-white sm:text-6xl">{title}</h1>
                {subtitle && <p className="mt-3 max-w-2xl text-cream-200">{subtitle}</p>}
            </div>
        </section>
    );
}
