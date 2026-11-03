/** Render plain multi-paragraph text entered in the admin. */
export default function Prose({ text, className = '' }) {
    if (!text) return null;

    return (
        <div className={`space-y-4 leading-relaxed text-stone-700 ${className}`}>
            {text.split(/\n{2,}/).map((para, i) => (
                <p key={i} className="whitespace-pre-line">
                    {para}
                </p>
            ))}
        </div>
    );
}
