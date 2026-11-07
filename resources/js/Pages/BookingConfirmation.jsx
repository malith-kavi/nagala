import SiteLayout from '@/Layouts/SiteLayout';
import { formatDate, formatLKR, whatsappLink } from '@/lib/format';
import { Link, usePage } from '@inertiajs/react';
import { CheckCircle2, Clock, XCircle } from 'lucide-react';

const statusStyles = {
    pending: { icon: Clock, color: 'text-gold-600', bg: 'bg-gold-300/30', title: 'Booking request received', text: "We'll review your request and confirm by email shortly." },
    confirmed: { icon: CheckCircle2, color: 'text-leaf-600', bg: 'bg-leaf-500/15', title: 'Your booking is confirmed', text: 'We look forward to welcoming you to Nagala!' },
    cancelled: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-100', title: 'This booking was cancelled', text: 'Please contact us if you have any questions.' },
};

export default function BookingConfirmation({ booking }) {
    const { settings } = usePage().props;
    const s = statusStyles[booking.status] ?? statusStyles.pending;
    const Icon = s.icon;

    const rows = [
        ['Reference', booking.reference],
        ['Cottage', booking.cottage?.name],
        booking.package && ['Package', booking.package.name],
        ['Check-in', `${formatDate(booking.check_in)} · from ${settings.check_in_time}`],
        ['Check-out', `${formatDate(booking.check_out)} · by ${settings.check_out_time}`],
        ['Nights', booking.nights],
        ['Guests', booking.guests],
        ['Guest name', booking.name],
        ['Total (pay on arrival)', formatLKR(booking.total_price)],
    ].filter(Boolean);

    return (
        <SiteLayout title={`Booking ${booking.reference}`}>
            <section className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
                <div className="card p-8 text-center">
                    <span className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full ${s.bg}`}>
                        <Icon className={`h-9 w-9 ${s.color}`} />
                    </span>
                    <h1 className="mt-4 font-display text-3xl font-semibold text-forest-800 sm:text-4xl">{s.title}</h1>
                    <p className="mt-2 text-stone-600">{s.text}</p>
                    <p className="mt-4 inline-block rounded-full bg-forest-50 px-4 py-1.5 font-mono text-sm font-semibold tracking-wider text-forest-800">
                        {booking.reference}
                    </p>

                    <dl className="mt-8 divide-y divide-stone-100 text-left text-sm">
                        {rows.map(([k, v]) => (
                            <div key={k} className="flex justify-between gap-4 py-2.5">
                                <dt className="text-stone-500">{k}</dt>
                                <dd className="text-right font-medium text-stone-900">{v}</dd>
                            </div>
                        ))}
                    </dl>

                    <p className="mt-6 text-xs text-stone-500">Save this page or your reference number. A copy has been sent to {booking.email}.</p>

                    <div className="mt-6 flex flex-wrap justify-center gap-3">
                        <Link href={route('home')} className="btn-outline">
                            Back to home
                        </Link>
                        {settings.whatsapp && (
                            <a
                                href={whatsappLink(settings.whatsapp, `Hi! About my booking ${booking.reference}`)}
                                target="_blank"
                                rel="noreferrer"
                                className="btn-primary"
                            >
                                Message us on WhatsApp
                            </a>
                        )}
                    </div>
                </div>
            </section>
        </SiteLayout>
    );
}
