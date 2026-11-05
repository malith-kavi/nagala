import FormActions from '@/Components/Admin/FormActions';
import Field from '@/Components/Site/Field';
import AdminLayout from '@/Layouts/AdminLayout';
import { useForm } from '@inertiajs/react';

export default function MenuForm({ section, meals, defaultMeal = 'breakfast' }) {
    const editing = Boolean(section);
    const { data, setData, post, put, processing, errors } = useForm({
        meal: section?.meal ?? defaultMeal,
        title: section?.title ?? '',
        note: section?.note ?? '',
        items: (section?.items ?? []).join('\n'),
        sort_order: section?.sort_order ?? 0,
    });

    const submit = (e) => {
        e.preventDefault();
        editing ? put(route('admin.menu.update', section.id)) : post(route('admin.menu.store'));
    };

    return (
        <AdminLayout title={editing ? `Edit ${section.title}` : 'New menu section'}>
            <form onSubmit={submit} className="max-w-3xl space-y-6 rounded-xl bg-white p-6 shadow-sm ring-1 ring-stone-200">
                <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Meal *" error={errors.meal}>
                        <select className="input" value={data.meal} onChange={(e) => setData('meal', e.target.value)}>
                            {Object.entries(meals).map(([key, label]) => (
                                <option key={key} value={key}>
                                    {label}
                                </option>
                            ))}
                        </select>
                    </Field>
                    <Field label="Section title *" error={errors.title} hint="e.g. Curries, Dessert">
                        <input className="input" value={data.title} onChange={(e) => setData('title', e.target.value)} required />
                    </Field>
                    <Field label="Note" error={errors.note} hint="Optional, e.g. Choose two" className="sm:col-span-2">
                        <input className="input" value={data.note} onChange={(e) => setData('note', e.target.value)} />
                    </Field>
                    <Field label="Dishes *" error={errors.items} hint="One per line" className="sm:col-span-2">
                        <textarea rows={6} className="input" value={data.items} onChange={(e) => setData('items', e.target.value)} required />
                    </Field>
                    <Field label="Sort order" error={errors.sort_order}>
                        <input type="number" className="input" value={data.sort_order} onChange={(e) => setData('sort_order', e.target.value)} />
                    </Field>
                </div>
                <FormActions processing={processing} cancelHref={route('admin.menu.index')} label={editing ? 'Save changes' : 'Create section'} />
            </form>
        </AdminLayout>
    );
}
