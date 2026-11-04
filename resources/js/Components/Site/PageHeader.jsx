import ImageWithFallback from '@/Components/Site/ImageWithFallback';

const DEFAULT_IMAGE = '/images/design/cliffs-header.jpg';

/** Compact hero used at the top of inner pages. */
export default function PageHeader({ eyebrow, title, subtitle, image = DEFAULT_IMAGE, imageClassName = 'object-[center_30%]' }) {
    return (
        <section className="relative isolate flex min-h-[320px] items-end overflow-hidden pb-14 pt-24">
            <ImageWithFallback src={image} alt="" className={`absolute inset-0 -z-20 h-full w-full ${imageClassName}`} />
            <div className="absolute inset-0 -z-10 bg-gradient-to-t from-forest-950/90 via-forest-950/50 to-forest-950/30" />
            <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
                {eyebrow && <p className="eyebrow">{eyebrow}</p>}
                <h1 className="mt-2 font-display text-4xl font-semibold text-white sm:text-6xl">{title}</h1>
                {subtitle && <p className="mt-3 max-w-2xl text-cream-200">{subtitle}</p>}
            </div>
        </section>
    );
}
