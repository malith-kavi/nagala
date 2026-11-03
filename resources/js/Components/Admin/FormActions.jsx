import { Link } from '@inertiajs/react';

export default function FormActions({ processing, cancelHref, label = 'Save' }) {
    return (
        <div className="flex items-center justify-end gap-3 border-t border-stone-200 pt-5">
            {cancelHref && (
                <Link href={cancelHref} className="btn border border-stone-300 bg-white text-stone-700 hover:bg-stone-50">
                    Cancel
                </Link>
            )}
            <button type="submit" disabled={processing} className="btn-primary">
                {processing ? 'Saving…' : label}
            </button>
        </div>
    );
}
