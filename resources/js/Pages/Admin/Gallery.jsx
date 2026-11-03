import DeleteButton from '@/Components/Admin/DeleteButton';
import Field from '@/Components/Site/Field';
import AdminLayout from '@/Layouts/AdminLayout';
import { router, useForm } from '@inertiajs/react';
import { Upload } from 'lucide-react';

function ImageRow({ image, categories }) {
    const update = (changes) =>
        router.patch(route('admin.gallery.update', image.id), { caption: image.caption, category: image.category, sort_order: image.sort_order, ...changes }, { preserveScroll: true });

    return (
        <div className="overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-stone-200">
            <img src={image.url} alt={image.caption || ''} className="aspect-[4/3] w-full object-cover" />
            <div className="space-y-2 p-3">
                <input
                    className="input py-1.5"
                    defaultValue={image.caption ?? ''}
                    placeholder="Caption"
                    onBlur={(e) => e.target.value !== (image.caption ?? '') && update({ caption: e.target.value })}
                />
                <div className="flex items-center gap-2">
                    <select className="input py-1.5 capitalize" value={image.category} onChange={(e) => update({ category: e.target.value })}>
                        {categories.map((c) => (
                            <option key={c} value={c}>
                                {c}
                            </option>
                        ))}
                    </select>
                    <DeleteButton href={route('admin.gallery.destroy', image.id)} confirm="Delete this photo?" />
                </div>
            </div>
        </div>
    );
}

export default function Gallery({ images, categories }) {
    const { data, setData, post, processing, errors, reset, progress } = useForm({
        images: [],
        category: categories[0],
        caption: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('admin.gallery.store'), { forceFormData: true, preserveScroll: true, onSuccess: () => reset('images', 'caption') });
    };

    return (
        <AdminLayout title="Gallery">
            <form onSubmit={submit} className="mb-8 rounded-xl bg-white p-5 shadow-sm ring-1 ring-stone-200">
                <h2 className="font-semibold text-stone-900">Upload photos</h2>
                <div className="mt-4 grid gap-4 md:grid-cols-[2fr_1fr_1fr_auto] md:items-end">
                    <Field label="Photos (select multiple)" error={errors.images || Object.entries(errors).find(([k]) => k.startsWith('images.'))?.[1]}>
                        <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={(e) => setData('images', [...e.target.files])}
                            className="block w-full text-sm file:mr-3 file:rounded-full file:border-0 file:bg-forest-50 file:px-4 file:py-2 file:text-forest-700"
                        />
                    </Field>
                    <Field label="Category">
                        <select className="input capitalize" value={data.category} onChange={(e) => setData('category', e.target.value)}>
                            {categories.map((c) => (
                                <option key={c} value={c}>
                                    {c}
                                </option>
                            ))}
                        </select>
                    </Field>
                    <Field label="Caption (optional)">
                        <input className="input" value={data.caption} onChange={(e) => setData('caption', e.target.value)} />
                    </Field>
                    <button type="submit" disabled={processing || data.images.length === 0} className="btn-primary">
                        <Upload className="h-4 w-4" /> {processing ? `Uploading ${progress?.percentage ?? 0}%` : `Upload ${data.images.length || ''}`}
                    </button>
                </div>
            </form>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {images.map((img) => (
                    <ImageRow key={img.id} image={img} categories={categories} />
                ))}
            </div>
            {images.length === 0 && <p className="text-stone-500">No photos yet — upload some above.</p>}
        </AdminLayout>
    );
}
