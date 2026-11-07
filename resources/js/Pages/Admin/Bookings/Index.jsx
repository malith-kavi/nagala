import Pagination from '@/Components/Admin/Pagination';
import StatusBadge from '@/Components/Admin/StatusBadge';
import AdminLayout from '@/Layouts/AdminLayout';
import { formatDate, formatLKR } from '@/lib/format';
import { Link, router } from '@inertiajs/react';
import { Search } from 'lucide-react';
import { useState } from 'react';

export default function BookingsIndex({ bookings, filters, statuses }) {
    const [search, setSearch] = useState(filters.search ?? '');

    const apply = (changes) =>
        router.get(route('admin.bookings.index'), { ...filters, ...changes }, { preserveState: true, preserveScroll: true, replace: true });

    return (
        <AdminLayout title="Bookings">
            <div className="mb-5 flex flex-wrap items-center gap-3">
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        apply({ search: search || undefined });
                    }}
                    className="relative"
                >
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-stone-400" />
                    <input className="input w-64 pl-9" placeholder="Name, email, phone, ref…" value={search} onChange={(e) => setSearch(e.target.value)} />
                </form>
                <select className="input w-40 capitalize" value={filters.status ?? ''} onChange={(e) => apply({ status: e.target.value || undefined })}>
                    <option value="">All statuses</option>
                    {statuses.map((s) => (
                        <option key={s} value={s}>
                            {s}
                        </option>
                    ))}
                </select>
                <select className="input w-40" value={filters.when ?? ''} onChange={(e) => apply({ when: e.target.value || undefined })}>
                    <option value="">Any dates</option>
                    <option value="upcoming">Upcoming / current</option>
                    <option value="past">Past</option>
                </select>
            </div>

            <div className="overflow-x-auto rounded-xl bg-white shadow-sm ring-1 ring-stone-200">
                <table className="min-w-full divide-y divide-stone-200 text-sm">
                    <thead className="bg-stone-50 text-left text-xs font-semibold uppercase tracking-wider text-stone-500">
                        <tr>
                            <th className="px-4 py-3">Ref</th>
                            <th className="px-4 py-3">Guest</th>
                            <th className="px-4 py-3">Cottage</th>
                            <th className="px-4 py-3">Dates</th>
                            <th className="px-4 py-3">Guests</th>
                            <th className="px-4 py-3">Total</th>
                            <th className="px-4 py-3">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                        {bookings.data.map((b) => (
                            <tr key={b.id} className="cursor-pointer hover:bg-stone-50" onClick={() => router.visit(route('admin.bookings.show', b.id))}>
                                <td className="px-4 py-3 font-mono text-xs">
                                    <Link href={route('admin.bookings.show', b.id)} className="text-forest-700 hover:underline">
                                        {b.reference}
                                    </Link>
                                </td>
                                <td className="px-4 py-3">
                                    <span className="block font-medium text-stone-900">{b.name}</span>
                                    <span className="text-xs text-stone-500">{b.phone}</span>
                                </td>
                                <td className="px-4 py-3">
                                    {b.cottage?.name}
                                    {b.package && <span className="block text-xs text-stone-500">{b.package.name}</span>}
                                </td>
                                <td className="whitespace-nowrap px-4 py-3">
                                    {formatDate(b.check_in, { day: 'numeric', month: 'short' })} → {formatDate(b.check_out)}
                                </td>
                                <td className="px-4 py-3">{b.guests}</td>
                                <td className="whitespace-nowrap px-4 py-3">{formatLKR(b.total_price)}</td>
                                <td className="px-4 py-3">
                                    <StatusBadge status={b.status} />
                                </td>
                            </tr>
                        ))}
                        {bookings.data.length === 0 && (
                            <tr>
                                <td colSpan={7} className="px-4 py-10 text-center text-stone-500">
                                    No bookings found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            <Pagination links={bookings.links} />
        </AdminLayout>
    );
}
