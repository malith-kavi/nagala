import DeleteButton from '@/Components/Admin/DeleteButton';
import ImageWithFallback from '@/Components/Site/ImageWithFallback';
import AdminLayout from '@/Layouts/AdminLayout';
import { formatLKR } from '@/lib/format';
import { Link } from '@inertiajs/react';
import { Pencil, Plus } from 'lucide-react';

export default function CottagesIndex({ cottages }) {
    return (
        <AdminLayout
            title="Cottages"
            actions={
                <Link href={route('admin.cottages.create')} className="btn-primary px-4 py-2">
                    <Plus className="h-4 w-4" /> Add cottage
                </Link>
            }
        >
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {cottages.map((c) => (
                    <div key={c.id} className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-stone-200">
                        <ImageWithFallback src={c.cover_image_url} alt="" label="No photo yet" sizes="(min-width: 1280px) 33vw, (min-width: 640px) 50vw, 100vw" className="aspect-[16/9] w-full" />
                        <div className="p-4">
                            <div className="flex items-start justify-between gap-2">
                                <h2 className="font-semibold text-stone-900">{c.name}</h2>
                                {!c.is_active && <span className="rounded bg-stone-200 px-2 py-0.5 text-xs text-stone-600">Hidden</span>}
                            </div>
                            <p className="mt-1 text-sm text-stone-600">
                                {formatLKR(c.price_per_night)} / night · {c.units} unit{c.units > 1 ? 's' : ''} · up to {c.max_guests} guests
                            </p>
                            <p className="text-xs text-stone-500">{c.bookings_count} booking(s)</p>
                            <div className="mt-3 flex items-center justify-between">
                                <Link href={route('admin.cottages.edit', c.id)} className="inline-flex items-center gap-1 text-sm font-medium text-forest-700 hover:underline">
                                    <Pencil className="h-4 w-4" /> Edit
                                </Link>
                                <DeleteButton href={route('admin.cottages.destroy', c.id)} confirm={`Delete ${c.name}?`} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            {cottages.length === 0 && <p className="text-stone-500">No cottages yet.</p>}
        </AdminLayout>
    );
}
