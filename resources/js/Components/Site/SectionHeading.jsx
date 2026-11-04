export default function SectionHeading({ eyebrow, title, subtitle, light = false, className = '' }) {
    return (
        <div className={`mx-auto max-w-2xl text-center ${className}`}>
            {eyebrow && <p className="eyebrow">{eyebrow}</p>}
            <h2 className={`mt-2 font-display text-4xl font-semibold sm:text-5xl ${light ? 'text-white' : 'text-forest-800'}`}>
                {title}
            </h2>
            {subtitle && <p className={`mt-3 text-sm sm:text-base ${light ? 'text-cream-200' : 'text-stone-600'}`}>{subtitle}</p>}
        </div>
    );
}
