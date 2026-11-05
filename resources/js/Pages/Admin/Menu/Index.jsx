import DeleteButton from '@/Components/Admin/DeleteButton';
import AdminLayout from '@/Layouts/AdminLayout';
import { Link } from '@inertiajs/react';
import { Pencil, Plus } from 'lucide-react';

export default function MenuIndex({ meals }) {
    return (
        <AdminLayout
            title="Food Menu"
            actions={
                <Link href={route('admin.menu.create')} className="btn-primary px-4 py-2">
                    <Plus className="h-4 w-4" /> Add section
                </Link>
            }
        >
            <div className="grid gap-5 xl:grid-cols-3">
                {meals.map((meal) => (
                    <div key={meal.key} className="rounded-xl bg-white shadow-sm ring-1 ring-stone-200">
                        <div className="flex items-center justify-between border-b border-stone-200 px-4 py-3">
                            <h2 className="font-semibold text-stone-900">{meal.label}</h2>
                            <Link
                                href={route('admin.menu.create', { meal: meal.key })}
                                className="inline-flex items-center gap-1 text-sm font-medium text-forest-700 hover:underline"
                            >
                                <Plus className="h-4 w-4" /> Add
                            </Link>
                        </div>
                        <ul className="divide-y divide-stone-100">
                            {meal.sections.map((section) => (
                                <li key={section.id} className="flex items-start justify-between gap-3 px-4 py-3">
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium text-stone-900">
                                            {section.title}
                                            {section.note && <span className="ml-2 text-xs font-normal text-leaf-600">{section.note}</span>}
                                        </p>
                                        <p className="mt-0.5 text-xs text-stone-600">{(section.items ?? []).join(', ')}</p>
                                    </div>
                                    <div className="flex shrink-0 items-center gap-1">
                                        <Link
                                            href={route('admin.menu.edit', section.id)}
                                            className="rounded-md p-1.5 text-forest-700 hover:bg-forest-50"
                                            aria-label={`Edit ${section.title}`}
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </Link>
                                        <DeleteButton
                                            href={route('admin.menu.destroy', section.id)}
                                            confirm={`Delete "${section.title}" from ${meal.label.toLowerCase()}?`}
                                        />
                                    </div>
                                </li>
                            ))}
                            {meal.sections.length === 0 && <li className="px-4 py-6 text-center text-sm text-stone-500">Nothing on this menu yet.</li>}
                        </ul>
                    </div>
                ))}
            </div>
        </AdminLayout>
    );
}
