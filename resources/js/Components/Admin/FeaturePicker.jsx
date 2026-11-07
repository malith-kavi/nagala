import { featureIcon } from '@/Components/Site/Amenity';

/**
 * Tick-box grid for picking from a fixed list (key => label), e.g. cottage features or package inclusions,
 * each shown with the icon the site uses.
 * `older` holds free-text entries saved before the list existed, so they can be kept or unticked.
 */
export default function FeaturePicker({ label, hint, options, older = [], value, onChange, error, className = '' }) {
    const toggle = (key) => onChange(value.includes(key) ? value.filter((k) => k !== key) : [...value, key]);
    const choices = [...Object.entries(options).map(([key, text]) => ({ key, label: text })), ...older.map((text) => ({ key: text, label: text, older: true }))];

    return (
        <fieldset className={className}>
            <legend className="label">{label}</legend>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {choices.map((choice) => {
                    const Icon = featureIcon(choice);
                    const on = value.includes(choice.key);
                    return (
                        <label
                            key={choice.key}
                            className={`flex cursor-pointer items-center gap-2.5 rounded-lg border px-3 py-2 text-sm transition ${
                                on ? 'border-forest-500 bg-forest-50 text-forest-800' : 'border-stone-200 text-stone-700 hover:border-stone-300'
                            }`}
                        >
                            <input type="checkbox" className="rounded text-forest-700" checked={on} onChange={() => toggle(choice.key)} />
                            <Icon className="h-4 w-4 shrink-0" aria-hidden />
                            <span className="min-w-0 flex-1">
                                {choice.label}
                                {choice.older && <span className="block text-xs text-stone-500">Typed in earlier – untick to remove</span>}
                            </span>
                        </label>
                    );
                })}
            </div>
            {hint && !error && <p className="mt-1 text-xs text-stone-500">{hint}</p>}
            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
        </fieldset>
    );
}
