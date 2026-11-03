import FormActions from '@/Components/Admin/FormActions';
import ImageInput from '@/Components/Admin/ImageInput';
import Field from '@/Components/Site/Field';
import AdminLayout from '@/Layouts/AdminLayout';
import { useForm } from '@inertiajs/react';

export default function PlaceForm({ place }) {
    const editing = Boolean(place);
    const { data, setData, post, processing, errors } = useForm({
        _method: editing ? 'put' : 'post',
        name: place?.name ?? '',
        slug: place?.slug ?? '',
        distance_km: place?.distance_km ?? '',
        travel_minutes: place?.travel_minutes ?? '',
        tagline: place?.tagline ?? '',
        short_description: place?.short_description ?? '',
        description: place?.description ?? '',
        map_url: place?.map_url ?? '',
        is_active: place?.is_active ?? true,
        sort_order: place?.sort_order ?? 0,
        cover_image: null,
        remove_cover_image: false,
    });

    const submit = (e) => {
        e.preventDefault();
        post(editing ? route('admin.places.update', place.id) : route('admin.places.store'), { forceFormData: true });
    };

    return (
        <AdminLayout title={editing ? `Edit ${place.name}` : 'New place'}>
            <form onSubmit={submit} className="max-w-5xl space-y-6 rounded-xl bg-white p-6 shadow-sm ring-1 ring-stone-200">
                <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <Field label="Name *" error={errors.name}>
                            <input className="input" value={data.name} onChange={(e) => setData('name', e.target.value)} required />
                        </Field>
                        <Field label="URL slug" error={errors.slug} hint="Leave blank to generate from name">
                            <input className="input" value={data.slug} onChange={(e) => setData('slug', e.target.value)} />
                        </Field>
                        <Field label="Distance (km)" error={errors.distance_km}>
                            <input type="number" step="0.1" min="0" className="input" value={data.distance_km} onChange={(e) => setData('distance_km', e.target.value)} />
                        </Field>
                        <Field label="Travel time (minutes)" error={errors.travel_minutes}>
                            <input type="number" min="0" className="input" value={data.travel_minutes} onChange={(e) => setData('travel_minutes', e.target.value)} />
                        </Field>
                        <Field label="Tagline" error={errors.tagline} hint="Shown instead of distance when distance is empty">
                            <input className="input" value={data.tagline} onChange={(e) => setData('tagline', e.target.value)} placeholder="Local culture" />
                        </Field>
                        <Field label="Google Maps link" error={errors.map_url}>
                            <input type="url" className="input" value={data.map_url} onChange={(e) => setData('map_url', e.target.value)} />
                        </Field>
                        <Field label="Short description" error={errors.short_description} className="sm:col-span-2">
                            <input className="input" value={data.short_description} onChange={(e) => setData('short_description', e.target.value)} />
                        </Field>
                        <Field label="Full description" error={errors.description} className="sm:col-span-2">
                            <textarea rows={6} className="input" value={data.description} onChange={(e) => setData('description', e.target.value)} />
                        </Field>
                        <Field label="Sort order" error={errors.sort_order}>
                            <input type="number" className="input" value={data.sort_order} onChange={(e) => setData('sort_order', e.target.value)} />
                        </Field>
                        <label className="flex items-center gap-2 self-end pb-2 text-sm">
                            <input type="checkbox" className="rounded text-forest-700" checked={data.is_active} onChange={(e) => setData('is_active', e.target.checked)} />
                            Visible on website
                        </label>
                    </div>
                    <ImageInput
                        label="Cover photo"
                        currentUrl={place?.cover_image_url}
                        file={data.cover_image}
                        onFile={(f) => setData((d) => ({ ...d, cover_image: f, remove_cover_image: f ? false : d.remove_cover_image }))}
                        removed={data.remove_cover_image}
                        onRemove={(v) => setData('remove_cover_image', v)}
                        error={errors.cover_image}
                    />
                </div>
                <FormActions processing={processing} cancelHref={route('admin.places.index')} label={editing ? 'Save changes' : 'Create place'} />
            </form>
        </AdminLayout>
    );
}
