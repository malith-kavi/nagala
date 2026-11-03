import { router } from '@inertiajs/react';
import { Trash2 } from 'lucide-react';

export default function DeleteButton({ href, confirm = 'Are you sure you want to delete this?', label, className = '' }) {
    return (
        <button
            type="button"
            onClick={() => window.confirm(confirm) && router.delete(href, { preserveScroll: true })}
            className={`inline-flex items-center gap-1 rounded-md p-1.5 text-sm text-red-600 hover:bg-red-50 ${className}`}
            aria-label={label || 'Delete'}
        >
            <Trash2 className="h-4 w-4" />
            {label}
        </button>
    );
}
