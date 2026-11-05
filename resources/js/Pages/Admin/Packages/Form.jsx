import FeaturePicker from '@/Components/Admin/FeaturePicker';
import FormActions from '@/Components/Admin/FormActions';
import ImageInput from '@/Components/Admin/ImageInput';
import Field from '@/Components/Site/Field';
import AdminLayout from '@/Layouts/AdminLayout';
import { useForm } from '@inertiajs/react';

export default function PackageForm({ package: pkg, cabanas, inclusionOptions }) {
    const editing = Boolean(pkg);
    const olderInclusions = (pkg?.inclusions ?? []).filter((i) => !(i in inclusionOptions));
    const { data, setData, post, processing, errors } = useForm({
        _method: editing ? 'put' : 'post',
        name: pkg?.name ?? '',
        slug: pkg?.slug ?? '',
        short_description: pkg?.short_description ?? '',
        description: pkg?.description ?? '',
        nights: pkg?.nights ?? 1,
        guests: pkg?.guests ?? 2,
        inclusions: pkg?.inclusions ?? [],
        price: pkg?.price ?? '',
        cabana_id: pkg?.cabana_id ?? '',
        is_active: pkg?.is_active ?? true,
        sort_order: pkg?.sort_order ?? 0,
        cover_image: null,
        remove_cover_image: false,
    });

    const submit = (e) => {
        e.preventDefault();
        post(editing ? route('admin.packages.update', pkg.id) : route('admin.packages.store'), { forceFormData: true });
    };

    return (
        <AdminLayout title={editing ? `Edit ${pkg.name}` : 'New package'}>
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
                        <Field label="Full description" error={errors.description} className="sm:col-span-2">
                            <textarea rows={5} className="input" value={data.description} onChange={(e) => setData('description', e.target.value)} />
                        </Field>
                        <Field label="Price (LKR) *" error={errors.price} hint="Covers the nights below; longer stays repeat this rate">
                            <input type="number" min="0" className="input" value={data.price} onChange={(e) => setData('price', e.target.value)} required />
                        </Field>
                        <Field label="Cabana used" error={errors.cabana_id} hint="Leave as 'any' to allow every cabana sized for the guests below">
                            <select className="input" value={data.cabana_id} onChange={(e) => setData('cabana_id', e.target.value)}>
                                <option value="">Any cabana for this many guests</option>
                                {cabanas.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.name}
                                    </option>
                                ))}
                            </select>
                        </Field>
                        <Field label="Nights *" error={errors.nights}>
                            <input type="number" min="1" className="input" value={data.nights} onChange={(e) => setData('nights', e.target.value)} required />
                        </Field>
                        <Field label="Guests *" error={errors.guests}>
                            <input type="number" min="1" className="input" value={data.guests} onChange={(e) => setData('guests', e.target.value)} required />
                        </Field>
                        <FeaturePicker
                            label="What's included"
                            hint="Shown with these icons on the website, in this order. Meals are highlighted in green on the package page."
                            options={inclusionOptions}
                            older={olderInclusions}
                            value={data.inclusions}
                            onChange={(inclusions) => setData('inclusions', inclusions)}
                            error={errors.inclusions ?? Object.entries(errors).find(([k]) => k.startsWith('inclusions.'))?.[1]}
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
                    <ImageInput
                        label="Cover photo"
                        currentUrl={pkg?.cover_image_url}
                        file={data.cover_image}
                        onFile={(f) => setData((d) => ({ ...d, cover_image: f, remove_cover_image: f ? false : d.remove_cover_image }))}
                        removed={data.remove_cover_image}
                        onRemove={(v) => setData('remove_cover_image', v)}
                        error={errors.cover_image}
                    />
                </div>
                <FormActions processing={processing} cancelHref={route('admin.packages.index')} label={editing ? 'Save changes' : 'Create package'} />
            </form>
        </AdminLayout>
    );
}
