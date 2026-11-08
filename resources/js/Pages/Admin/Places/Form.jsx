import FormActions from '@/Components/Admin/FormActions';
import ImageInput from '@/Components/Admin/ImageInput';
import PhotoOrderInput from '@/Components/Admin/PhotoOrderInput';
import Field from '@/Components/Site/Field';
import AdminLayout from '@/Layouts/AdminLayout';
import { useForm } from '@inertiajs/react';

export default function PlaceForm({ place }) {
    const editing = Boolean(place);
    const { data, setData, post, processing, progress, errors, transform } = useForm({
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
        cover_credit: place?.cover_credit ?? '',
        remove_cover_image: false,
        photos: (place?.images ?? []).map((path, i) => ({ key: path, path, url: place.image_urls[i], removed: false })),
    });

    const setPhotos = (update) => setData((d) => ({ ...d, photos: update(d.photos) }));

    const submit = (e) => {
        e.preventDefault();
        transform(({ photos, ...rest }) => {
            const added = photos.filter((p) => p.file);
            return {
                ...rest,
                new_images: added.map((p) => p.file),
                remove_images: photos.filter((p) => p.path && p.removed).map((p) => p.path),
                // Final order: saved photos by path, new uploads as "new:<index into new_images>".
                image_order: photos.filter((p) => !p.removed).map((p) => (p.file ? `new:${added.indexOf(p)}` : p.path)),
            };
        });
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
                        <Field label="Photo credit" error={errors.cover_credit} hint="Credit for the cover photo, shown on the place page" className="sm:col-span-2">
                            <input className="input" value={data.cover_credit} onChange={(e) => setData('cover_credit', e.target.value)} />
                        </Field>
                        <Field label="Sort order" error={errors.sort_order}>
                            <input type="number" className="input" value={data.sort_order} onChange={(e) => setData('sort_order', e.target.value)} />
                        </Field>
                        <label className="flex items-center gap-2 self-end pb-2 text-sm">
                            <input type="checkbox" className="rounded text-forest-700" checked={data.is_active} onChange={(e) => setData('is_active', e.target.checked)} />
                            Visible on website
                        </label>
                    </div>

                    <div className="space-y-6">
                        <ImageInput
                            label="Cover photo"
                            currentUrl={place?.cover_image_url}
                            file={data.cover_image}
                            onFile={(f) => setData((d) => ({ ...d, cover_image: f, remove_cover_image: f ? false : d.remove_cover_image }))}
                            removed={data.remove_cover_image}
                            onRemove={(v) => setData('remove_cover_image', v)}
                            error={errors.cover_image}
                        />

                        <PhotoOrderInput
                            label="More photos"
                            photos={data.photos}
                            setPhotos={setPhotos}
                            error={Object.entries(errors).find(([k]) => k.startsWith('new_images'))?.[1]}
                        />
                    </div>
                </div>
                <FormActions processing={processing} progress={progress} cancelHref={route('admin.places.index')} label={editing ? 'Save changes' : 'Create place'} />
            </form>
        </AdminLayout>
    );
}
