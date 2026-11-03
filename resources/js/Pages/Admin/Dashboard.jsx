import StatusBadge from '@/Components/Admin/StatusBadge';
import AdminLayout from '@/Layouts/AdminLayout';
import { formatDate, formatLKR } from '@/lib/format';
import { Link, router } from '@inertiajs/react';
import { BedDouble, CalendarClock, CalendarDays, Check, Mail, Wallet, X } from 'lucide-react';

function Stat({ icon: Icon, label, value, href, tone = 'forest' }) {
    const tones = { forest: 'bg-forest-50 text-forest-700', amber: 'bg-amber-50 text-amber-700', blue: 'bg-sky-50 text-sky-700' };
    const body = (
        <div className="flex items-center gap-4 rounded-xl bg-white p-5 shadow-sm ring-1 ring-stone-200 transition hover:shadow-md">
            <span className={`flex h-12 w-12 items-center justify-center rounded-lg ${tones[tone]}`}>
                <Icon className="h-6 w-6" />
            </span>
            <span>
                <span className="block text-2xl font-bold text-stone-900">{value}</span>
                <span className="text-sm text-stone-500">{label}</span>
            </span>
        </div>
    );
    return href ? <Link href={href}>{body}</Link> : body;
}

const setStatus = (booking, status) =>
    router.patch(route('admin.bookings.status', booking.id), { status, notify: true }, { preserveScroll: true });

export default function Dashboard({ stats, pendingBookings, upcomingBookings, recentMessages }) {
    return (
        <AdminLayout title="Dashboard">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
                <Stat icon={CalendarClock} label="Pending requests" value={stats.pending} tone="amber" href={route('admin.bookings.index', { status: 'pending' })} />
                <Stat icon={CalendarDays} label="Upcoming confirmed" value={stats.upcoming} href={route('admin.bookings.index', { status: 'confirmed', when: 'upcoming' })} />
                <Stat icon={BedDouble} label="Guests staying now" value={stats.staying} />
                <Stat icon={Mail} label="Unread messages" value={stats.unread_messages} tone="blue" href={route('admin.messages.index')} />
                <Stat icon={Wallet} label="Confirmed this month" value={formatLKR(stats.revenue_month)} />
            </div>

            <div className="mt-8 grid gap-8 xl:grid-cols-2">
                <section className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-stone-200">
                    <h2 className="font-semibold text-stone-900">Pending booking requests</h2>
                    {pendingBookings.length === 0 ? (
                        <p className="mt-4 text-sm text-stone-500">No pending requests. 🎉</p>
                    ) : (
                        <ul className="mt-3 divide-y divide-stone-100">
                            {pendingBookings.map((b) => (
                                <li key={b.id} className="flex items-center gap-3 py-3">
                                    <Link href={route('admin.bookings.show', b.id)} className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-medium text-stone-900">
                                            {b.name} · {b.cabana?.name}
                                        </p>
                                        <p className="text-xs text-stone-500">
                                            {formatDate(b.check_in)} → {formatDate(b.check_out)} · {b.guests} guests · {formatLKR(b.total_price)}
                                        </p>
                                    </Link>
                                    <button onClick={() => setStatus(b, 'confirmed')} className="rounded-md bg-green-600 p-1.5 text-white hover:bg-green-700" title="Confirm">
                                        <Check className="h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={() => window.confirm('Cancel this booking?') && setStatus(b, 'cancelled')}
                                        className="rounded-md bg-stone-200 p-1.5 text-stone-700 hover:bg-stone-300"
                                        title="Cancel"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>

                <section className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-stone-200">
                    <h2 className="font-semibold text-stone-900">Upcoming arrivals</h2>
                    {upcomingBookings.length === 0 ? (
                        <p className="mt-4 text-sm text-stone-500">No confirmed arrivals coming up.</p>
                    ) : (
                        <ul className="mt-3 divide-y divide-stone-100">
                            {upcomingBookings.map((b) => (
                                <li key={b.id}>
                                    <Link href={route('admin.bookings.show', b.id)} className="flex items-center justify-between gap-3 py-3">
                                        <span>
                                            <span className="block text-sm font-medium text-stone-900">{b.name}</span>
                                            <span className="text-xs text-stone-500">
                                                {b.cabana?.name} · {b.nights} night{b.nights > 1 ? 's' : ''}
                                            </span>
                                        </span>
                                        <span className="text-right text-sm font-medium text-forest-700">{formatDate(b.check_in)}</span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>

                <section className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-stone-200 xl:col-span-2">
                    <div className="flex items-center justify-between">
                        <h2 className="font-semibold text-stone-900">Recent messages</h2>
                        <Link href={route('admin.messages.index')} className="text-sm text-forest-700 hover:underline">
                            View all
                        </Link>
                    </div>
                    {recentMessages.length === 0 ? (
                        <p className="mt-4 text-sm text-stone-500">No messages yet.</p>
                    ) : (
                        <ul className="mt-3 divide-y divide-stone-100">
                            {recentMessages.map((m) => (
                                <li key={m.id} className="py-3">
                                    <p className="text-sm">
                                        <span className={`font-medium ${m.read_at ? 'text-stone-700' : 'text-stone-900'}`}>{m.name}</span>
                                        {!m.read_at && <span className="ml-2 rounded bg-sky-100 px-1.5 text-xs text-sky-700">new</span>}
                                        <span className="ml-2 text-xs text-stone-500">{formatDate(m.created_at)}</span>
                                    </p>
                                    <p className="truncate text-sm text-stone-600">{m.subject ? `${m.subject} — ` : ''}{m.message}</p>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>
            </div>
        </AdminLayout>
    );
}
