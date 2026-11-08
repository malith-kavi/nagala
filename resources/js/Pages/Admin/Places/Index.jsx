import DeleteButton from '@/Components/Admin/DeleteButton';
import ImageWithFallback from '@/Components/Site/ImageWithFallback';
import AdminLayout from '@/Layouts/AdminLayout';
import { Link } from '@inertiajs/react';
import { Pencil, Plus } from 'lucide-react';

export default function PlacesIndex({ places }) {
    return (
        <AdminLayout
            title="Nearby Places"
            actions={
                <Link href={route('admin.places.create')} className="btn-primary px-4 py-2">
                    <Plus className="h-4 w-4" /> Add place
                </Link>
            }
        >
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
                {places.map((p) => (
                    <div key={p.id} className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-stone-200">
                        <ImageWithFallback src={p.cover_image_url} alt="" label="No photo yet" sizes="(min-width: 1280px) 25vw, (min-width: 640px) 50vw, 100vw" className="aspect-[4/3] w-full" />
                        <div className="p-4">
                            <div className="flex items-start justify-between gap-2">
                                <h2 className="font-semibold text-stone-900">{p.name}</h2>
                                {!p.is_active && <span className="rounded bg-stone-200 px-2 py-0.5 text-xs text-stone-600">Hidden</span>}
                            </div>
                            <p className="mt-1 text-sm text-stone-600">
                                {p.distance_km ? `${p.distance_km} km · ${p.travel_minutes ?? '?'} min` : p.tagline}
                            </p>
                            <div className="mt-3 flex items-center justify-between">
                                <Link href={route('admin.places.edit', p.id)} className="inline-flex items-center gap-1 text-sm font-medium text-forest-700 hover:underline">
                                    <Pencil className="h-4 w-4" /> Edit
                                </Link>
                                <DeleteButton href={route('admin.places.destroy', p.id)} confirm={`Delete ${p.name}?`} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </AdminLayout>
    );
}
