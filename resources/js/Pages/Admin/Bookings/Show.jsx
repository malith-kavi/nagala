import DeleteButton from '@/Components/Admin/DeleteButton';
import StatusBadge from '@/Components/Admin/StatusBadge';
import AdminLayout from '@/Layouts/AdminLayout';
import { formatDate, formatLKR, whatsappLink } from '@/lib/format';
import { Link, router } from '@inertiajs/react';
import { ArrowLeft, Check, Mail, Phone, RotateCcw, X } from 'lucide-react';
import { useState } from 'react';

export default function BookingShow({ booking }) {
    const [notify, setNotify] = useState(true);
    const setStatus = (status) => router.patch(route('admin.bookings.status', booking.id), { status, notify }, { preserveScroll: true });

    const rows = [
        ['Cottage', booking.cottage?.name],
        ['Package', booking.package?.name ?? 'Room only'],
        ['Check-in', formatDate(booking.check_in, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })],
        ['Check-out', formatDate(booking.check_out, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })],
        ['Nights', booking.nights],
        ['Guests', booking.guests],
        ['Total (pay on arrival)', formatLKR(booking.total_price)],
        ['Requested on', formatDate(booking.created_at)],
    ];

    return (
        <AdminLayout title={`Booking ${booking.reference}`}>
            <Link href={route('admin.bookings.index')} className="mb-4 inline-flex items-center gap-1 text-sm text-forest-700 hover:underline">
                <ArrowLeft className="h-4 w-4" /> All bookings
            </Link>

            <div className="grid max-w-5xl gap-6 lg:grid-cols-[1fr_320px]">
                <section className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-stone-200">
                    <div className="flex items-center justify-between">
                        <h2 className="font-mono text-lg font-semibold">{booking.reference}</h2>
                        <StatusBadge status={booking.status} />
                    </div>
                    <dl className="mt-4 divide-y divide-stone-100 text-sm">
                        {rows.map(([k, v]) => (
                            <div key={k} className="flex justify-between gap-4 py-2.5">
                                <dt className="text-stone-500">{k}</dt>
                                <dd className="text-right font-medium text-stone-900">{v}</dd>
                            </div>
                        ))}
                    </dl>
                    {booking.notes && (
                        <div className="mt-4 rounded-lg bg-cream-100 p-4 text-sm">
                            <p className="font-medium text-stone-900">Guest notes</p>
                            <p className="mt-1 whitespace-pre-line text-stone-700">{booking.notes}</p>
                        </div>
                    )}
                </section>

                <div className="space-y-6">
                    <section className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-stone-200">
                        <h3 className="font-semibold text-stone-900">{booking.name}</h3>
                        <ul className="mt-3 space-y-2 text-sm">
                            <li>
                                <a href={`mailto:${booking.email}`} className="flex items-center gap-2 text-forest-700 hover:underline">
                                    <Mail className="h-4 w-4" /> {booking.email}
                                </a>
                            </li>
                            <li>
                                <a href={`tel:${booking.phone}`} className="flex items-center gap-2 text-forest-700 hover:underline">
                                    <Phone className="h-4 w-4" /> {booking.phone}
                                </a>
                            </li>
                            <li>
                                <a
                                    href={whatsappLink(booking.phone, `Hi ${booking.name}, this is Nagala Eco Cottage about your booking ${booking.reference}.`)}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-sm text-green-700 hover:underline"
                                >
                                    Message on WhatsApp
                                </a>
                            </li>
                        </ul>
                    </section>

                    <section className="space-y-3 rounded-xl bg-white p-6 shadow-sm ring-1 ring-stone-200">
                        <h3 className="font-semibold text-stone-900">Actions</h3>
                        {booking.status !== 'confirmed' && (
                            <button onClick={() => setStatus('confirmed')} className="btn w-full bg-green-600 text-white hover:bg-green-700">
                                {booking.status === 'cancelled' ? <RotateCcw className="h-4 w-4" /> : <Check className="h-4 w-4" />}
                                {booking.status === 'cancelled' ? 'Restore & confirm' : 'Confirm booking'}
                            </button>
                        )}
                        {booking.status !== 'cancelled' && (
                            <button
                                onClick={() => window.confirm('Cancel this booking?') && setStatus('cancelled')}
                                className="btn w-full border border-stone-300 bg-white text-stone-700 hover:bg-stone-50"
                            >
                                <X className="h-4 w-4" /> Cancel booking
                            </button>
                        )}
                        <label className="flex items-center gap-2 text-sm text-stone-600">
                            <input type="checkbox" className="rounded text-forest-700" checked={notify} onChange={(e) => setNotify(e.target.checked)} />
                            Email the guest about status changes
                        </label>
                        <div className="border-t border-stone-100 pt-3">
                            <DeleteButton
                                href={route('admin.bookings.destroy', booking.id)}
                                confirm="Permanently delete this booking? This cannot be undone."
                                label="Delete booking"
                            />
                        </div>
                    </section>
                </div>
            </div>
        </AdminLayout>
    );
}
