export default function Field({ label, error, children, className = '', hint }) {
    return (
        <label className={`block ${className}`}>
            {label && <span className="label">{label}</span>}
            {children}
            {hint && !error && <span className="mt-1 block text-xs text-stone-500">{hint}</span>}
            {error && <span className="mt-1 block text-sm text-red-600">{error}</span>}
        </label>
    );
}
