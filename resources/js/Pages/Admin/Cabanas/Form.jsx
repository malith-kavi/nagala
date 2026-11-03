import FormActions from '@/Components/Admin/FormActions';
import ImageInput from '@/Components/Admin/ImageInput';
import Field from '@/Components/Site/Field';
import AdminLayout from '@/Layouts/AdminLayout';
import { useForm } from '@inertiajs/react';
import { ImagePlus, Trash2, Undo2 } from 'lucide-react';

export default function CabanaForm({ cabana }) {
    const editing = Boolean(cabana);
    const { data, setData, post, processing, errors } = useForm({
        _method: editing ? 'put' : 'post',
        name: cabana?.name ?? '',
        slug: cabana?.slug ?? '',
        short_description: cabana?.short_description ?? '',
        description: cabana?.description ?? '',
        max_guests: cabana?.max_guests ?? 2,
        beds: cabana?.beds ?? '',
        features: (cabana?.features ?? []).join('\n'),
        price_per_night: cabana?.price_per_night ?? '',
        units: cabana?.units ?? 1,
        is_active: cabana?.is_active ?? true,
        sort_order: cabana?.sort_order ?? 0,
        cover_image: null,
        remove_cover_image: false,
        new_images: [],
        remove_images: [],
    });

    const submit = (e) => {
        e.preventDefault();
        post(editing ? route('admin.cabanas.update', cabana.id) : route('admin.cabanas.store'), { forceFormData: true });
    };

    const toggleRemove = (path) =>
        setData('remove_images', data.remove_images.includes(path) ? data.remove_images.filter((p) => p !== path) : [...data.remove_images, path]);

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
                        <Field label="Features / amenities" error={errors.features} hint="One per line" className="sm:col-span-2">
                            <textarea rows={4} className="input" value={data.features} onChange={(e) => setData('features', e.target.value)} />
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
                            currentUrl={cabana?.cover_image_url}
                            file={data.cover_image}
                            onFile={(f) => setData((d) => ({ ...d, cover_image: f, remove_cover_image: f ? false : d.remove_cover_image }))}
                            removed={data.remove_cover_image}
                            onRemove={(v) => setData('remove_cover_image', v)}
                            error={errors.cover_image}
                        />

                        <div>
                            <span className="label">More photos</span>
                            <div className="grid grid-cols-3 gap-2">
                                {(cabana?.images ?? []).map((path, i) => {
                                    const removed = data.remove_images.includes(path);
                                    return (
                                        <div key={path} className="relative">
                                            <img src={cabana.image_urls[i]} alt="" className={`aspect-square w-full rounded object-cover ${removed ? 'opacity-30' : ''}`} />
                                            <button
                                                type="button"
                                                onClick={() => toggleRemove(path)}
                                                className="absolute right-1 top-1 rounded-full bg-white/90 p-1 shadow"
                                                aria-label={removed ? 'Keep photo' : 'Remove photo'}
                                            >
                                                {removed ? <Undo2 className="h-3.5 w-3.5" /> : <Trash2 className="h-3.5 w-3.5 text-red-600" />}
                                            </button>
                                        </div>
                                    );
                                })}
                                {data.new_images.map((f, i) => (
                                    <img key={i} src={URL.createObjectURL(f)} alt="" className="aspect-square w-full rounded object-cover ring-2 ring-leaf-500" />
                                ))}
                                <label className="flex aspect-square cursor-pointer items-center justify-center rounded border-2 border-dashed border-stone-300 text-stone-400 hover:border-forest-400">
                                    <ImagePlus className="h-6 w-6" />
                                    <input
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        className="hidden"
                                        onChange={(e) => setData('new_images', [...data.new_images, ...e.target.files])}
                                    />
                                </label>
                            </div>
                            {Object.keys(errors).some((k) => k.startsWith('new_images')) && <p className="mt-1 text-sm text-red-600">One of the photos is invalid (images up to 8 MB).</p>}
                        </div>
                    </div>
                </div>

                <FormActions processing={processing} cancelHref={route('admin.cabanas.index')} label={editing ? 'Save changes' : 'Create cabana'} />
            </form>
        </AdminLayout>
    );
}
