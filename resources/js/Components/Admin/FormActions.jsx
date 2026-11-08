import { usePreparingImages } from '@/lib/prepareImage';
import { Link } from '@inertiajs/react';

/**
 * `progress` is useForm's upload progress: photos can take a minute to upload on a weak signal,
 * and a bare "Saving…" for that long looks like the page has frozen.
 */
export default function FormActions({ processing, progress, cancelHref, label = 'Save' }) {
    // A photo still being prepared isn't in the form yet, so saving now would leave it out.
    const preparing = usePreparingImages();
    const uploading = processing && progress?.percentage != null && progress.percentage < 100;

    return (
        <div className="flex items-center justify-end gap-3 border-t border-stone-200 pt-5">
            {cancelHref && (
                <Link href={cancelHref} className="btn border border-stone-300 bg-white text-stone-700 hover:bg-stone-50">
                    Cancel
                </Link>
            )}
            <button type="submit" disabled={processing || preparing} className="btn-primary">
                {preparing ? 'Preparing photos…' : uploading ? `Uploading ${progress.percentage}%` : processing ? 'Saving…' : label}
            </button>
        </div>
    );
}
