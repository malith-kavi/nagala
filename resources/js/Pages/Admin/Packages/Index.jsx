import DeleteButton from '@/Components/Admin/DeleteButton';
import ImageWithFallback from '@/Components/Site/ImageWithFallback';
import AdminLayout from '@/Layouts/AdminLayout';
import { formatLKR } from '@/lib/format';
import { Link } from '@inertiajs/react';
import { Pencil, Plus } from 'lucide-react';

export default function PackagesIndex({ packages }) {
    return (
        <AdminLayout
            title="Packages"
            actions={
                <Link href={route('admin.packages.create')} className="btn-primary px-4 py-2">
                    <Plus className="h-4 w-4" /> Add package
                </Link>
            }
        >
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {packages.map((p) => (
                    <div key={p.id} className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-stone-200">
                        <ImageWithFallback src={p.cover_image_url} alt="" label="No photo yet" className="aspect-[16/9] w-full" />
                        <div className="p-4">
                            <div className="flex items-start justify-between gap-2">
                                <h2 className="font-semibold text-stone-900">{p.name}</h2>
                                {!p.is_active && <span className="rounded bg-stone-200 px-2 py-0.5 text-xs text-stone-600">Hidden</span>}
                            </div>
                            <p className="mt-1 text-sm text-stone-600">
                                {formatLKR(p.price)} · {p.nights} night(s) · {p.guests} guests
                            </p>
                            <p className="text-xs text-stone-500">{p.cabana ? `Uses ${p.cabana.name}` : `Any ${p.guests}-guest cabana`}</p>
                            <div className="mt-3 flex items-center justify-between">
                                <Link href={route('admin.packages.edit', p.id)} className="inline-flex items-center gap-1 text-sm font-medium text-forest-700 hover:underline">
                                    <Pencil className="h-4 w-4" /> Edit
                                </Link>
                                <DeleteButton href={route('admin.packages.destroy', p.id)} confirm={`Delete ${p.name}?`} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            {packages.length === 0 && <p className="text-stone-500">No packages yet.</p>}
        </AdminLayout>
    );
}
