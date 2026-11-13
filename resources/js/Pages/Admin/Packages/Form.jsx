import FeaturePicker from '@/Components/Admin/FeaturePicker';
import FormActions from '@/Components/Admin/FormActions';
import ImageInput from '@/Components/Admin/ImageInput';
import Field from '@/Components/Site/Field';
import AdminLayout from '@/Layouts/AdminLayout';
import { useForm, usePage } from '@inertiajs/react';

export default function PackageForm({ package: pkg, cottages, inclusionOptions }) {
    const { settings } = usePage().props;
    const editing = Boolean(pkg);
    const olderInclusions = (pkg?.inclusions ?? []).filter((i) => !(i in inclusionOptions));
    const { data, setData, post, processing, progress, errors } = useForm({
        _method: editing ? 'put' : 'post',
        name: pkg?.name ?? '',
        slug: pkg?.slug ?? '',
        short_description: pkg?.short_description ?? '',
        description: pkg?.description ?? '',
        nights: pkg?.nights ?? 1,
        guests: pkg?.guests ?? 2,
        check_in_time: pkg?.check_in_time ?? '',
        check_out_time: pkg?.check_out_time ?? '',
        inclusions: pkg?.inclusions ?? [],
        price: pkg?.price ?? '',
        cottage_ids: pkg?.cottage_ids ?? [],
        is_active: pkg?.is_active ?? true,
        sort_order: pkg?.sort_order ?? 0,
        cover_image: null,
        remove_cover_image: false,
    });

    const cottageError = errors.cottage_ids ?? Object.entries(errors).find(([k]) => k.startsWith('cottage_ids.'))?.[1];

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
                        <Field label="Nights *" error={errors.nights}>
                            <input type="number" min="1" className="input" value={data.nights} onChange={(e) => setData('nights', e.target.value)} required />
                        </Field>
                        <Field label="Check-in time" error={errors.check_in_time} hint={`Leave blank to use the usual ${settings.check_in_time}`}>
                            <input className="input" value={data.check_in_time} placeholder={settings.check_in_time} onChange={(e) => setData('check_in_time', e.target.value)} />
                        </Field>
                        <Field label="Check-out time" error={errors.check_out_time} hint={`Leave blank to use the usual ${settings.check_out_time}`}>
                            <input className="input" value={data.check_out_time} placeholder={settings.check_out_time} onChange={(e) => setData('check_out_time', e.target.value)} />
                        </Field>
                        <Field label="Guests *" error={errors.guests}>
                            <input type="number" min="1" className="input" value={data.guests} onChange={(e) => setData('guests', e.target.value)} required />
                        </Field>
                        <fieldset className="sm:col-span-2">
                            <legend className="label">Cottages used</legend>
                            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                                {cottages.map((c) => {
                                    const on = data.cottage_ids.includes(c.id);
                                    return (
                                        <label
                                            key={c.id}
                                            className={`flex cursor-pointer items-center gap-2.5 rounded-lg border px-3 py-2 text-sm transition ${
                                                on ? 'border-forest-500 bg-forest-50 text-forest-800' : 'border-stone-200 text-stone-700 hover:border-stone-300'
                                            }`}
                                        >
                                            <input
                                                type="checkbox"
                                                className="rounded text-forest-700"
                                                checked={on}
                                                onChange={() => setData('cottage_ids', on ? data.cottage_ids.filter((id) => id !== c.id) : [...data.cottage_ids, c.id])}
                                            />
                                            {c.name}
                                        </label>
                                    );
                                })}
                            </div>
                            {cottageError ? (
                                <p className="mt-1 text-sm text-red-600">{cottageError}</p>
                            ) : (
                                <p className="mt-1 text-xs text-stone-500">
                                    Tick every cottage this package can be booked in. Tick none to allow any cottage sized for the guests above.
                                </p>
                            )}
                        </fieldset>
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
                <FormActions processing={processing} progress={progress} cancelHref={route('admin.packages.index')} label={editing ? 'Save changes' : 'Create package'} />
            </form>
        </AdminLayout>
    );
}
