import FeaturePicker from '@/Components/Admin/FeaturePicker';
import FormActions from '@/Components/Admin/FormActions';
import ImageInput from '@/Components/Admin/ImageInput';
import PhotoOrderInput from '@/Components/Admin/PhotoOrderInput';
import Field from '@/Components/Site/Field';
import AdminLayout from '@/Layouts/AdminLayout';
import { useForm } from '@inertiajs/react';

export default function CabanaForm({ cabana, featureOptions }) {
    const editing = Boolean(cabana);
    const olderFeatures = (cabana?.features ?? []).filter((f) => !(f in featureOptions));
    const { data, setData, post, processing, errors, transform } = useForm({
        _method: editing ? 'put' : 'post',
        name: cabana?.name ?? '',
        slug: cabana?.slug ?? '',
        short_description: cabana?.short_description ?? '',
        description: cabana?.description ?? '',
        max_guests: cabana?.max_guests ?? 2,
        beds: cabana?.beds ?? '',
        features: cabana?.features ?? [],
        price_per_night: cabana?.price_per_night ?? '',
        units: cabana?.units ?? 1,
        is_active: cabana?.is_active ?? true,
        sort_order: cabana?.sort_order ?? 0,
        cover_image: null,
        remove_cover_image: false,
        photos: (cabana?.images ?? []).map((path, i) => ({ key: path, path, url: cabana.image_urls[i], removed: false })),
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
        post(editing ? route('admin.cabanas.update', cabana.id) : route('admin.cabanas.store'), { forceFormData: true });
    };

    return (
        <AdminLayout title={editing ? `Edit ${cabana.name}` : 'New cabana'}>
            <form onSubmit={submit} className="max-w-5xl space-y-6 rounded-xl bg-white p-6 shadow-sm ring-1 ring-stone-200">
                <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <Field label="Name *" error={errors.name}>
                            <input className="input" value={data.name} onChange={(e) => setData('name', e.target.value)} required />
                        </Field>
                        <Field label="URL slug" error={errors.slug} hint="Leave blank to generate from name">
                            <input className="input" value={data.slug} onChange={(e) => setData('slug', e.target.value)} />
                        </Field>
                        <Field label="Short description" error={errors.short_description} className="sm:col-span-2">
                            <input className="input" value={data.short_description} onChange={(e) => setData('short_description', e.target.value)} />
                        </Field>
                        <Field label="Full description" error={errors.description} className="sm:col-span-2" hint="Blank line = new paragraph">
                            <textarea rows={6} className="input" value={data.description} onChange={(e) => setData('description', e.target.value)} />
                        </Field>
                        <Field label="Price per night (LKR) *" error={errors.price_per_night}>
                            <input type="number" min="0" className="input" value={data.price_per_night} onChange={(e) => setData('price_per_night', e.target.value)} required />
                        </Field>
                        <Field label="Units available *" error={errors.units} hint="How many cabanas of this type you have">
                            <input type="number" min="1" className="input" value={data.units} onChange={(e) => setData('units', e.target.value)} required />
                        </Field>
                        <Field label="Max guests *" error={errors.max_guests}>
                            <input type="number" min="1" className="input" value={data.max_guests} onChange={(e) => setData('max_guests', e.target.value)} required />
                        </Field>
                        <Field label="Beds" error={errors.beds}>
                            <input className="input" value={data.beds} onChange={(e) => setData('beds', e.target.value)} placeholder="1 Double Bed" />
                        </Field>
                        <FeaturePicker
                            label="Features / amenities"
                            hint="Shown with these icons on the website. The first two ticked (in this order) appear on the cabana card."
                            options={featureOptions}
                            older={olderFeatures}
                            value={data.features}
                            onChange={(features) => setData('features', features)}
                            error={errors.features ?? Object.entries(errors).find(([k]) => k.startsWith('features.'))?.[1]}
                            className="sm:col-span-2"
                        />
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
                            currentUrl={cabana?.cover_image_url}
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
                            error={Object.keys(errors).some((k) => k.startsWith('new_images')) && 'One of the photos is invalid (images up to 8 MB).'}
                        />
                    </div>
                </div>

                <FormActions processing={processing} cancelHref={route('admin.cabanas.index')} label={editing ? 'Save changes' : 'Create cabana'} />
            </form>
        </AdminLayout>
    );
}
