import Field from '@/Components/Site/Field';
import ImageWithFallback from '@/Components/Site/ImageWithFallback';
import PageHeader from '@/Components/Site/PageHeader';
import SiteLayout from '@/Layouts/SiteLayout';
import { addDays, formatDate, formatLKR, nightsBetween, toISODate } from '@/lib/format';
import { useForm } from '@inertiajs/react';
import axios from 'axios';
import { AlertTriangle, CalendarCheck, CheckCircle2, Loader2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

export default function Book({ cabanas, packages, preselect }) {
    const today = toISODate(new Date());

    const initialPackage = packages.find((p) => p.slug === preselect.package);
    const initialCabana =
        cabanas.find((c) => c.slug === preselect.cabana) ??
        cabanas.find((c) => c.id === initialPackage?.cabana_id) ??
        cabanas[0];

    const { data, setData, post, processing, errors, transform } = useForm({
        cabana_id: initialCabana?.id ?? '',
        package_id: initialPackage?.id ?? '',
        check_in: today,
        check_out: addDays(today, initialPackage?.nights ?? 1),
        guests: Math.min(initialPackage?.guests ?? 2, initialCabana?.max_guests ?? 2),
        name: '',
        email: '',
        phone: '',
        notes: '',
    });

    const cabana = cabanas.find((c) => c.id === Number(data.cabana_id));
    const pkg = packages.find((p) => p.id === Number(data.package_id));
    const nights = nightsBetween(data.check_in, data.check_out);

    const [availability, setAvailability] = useState({ loading: false });

    // Live availability + price check whenever the stay details change.
    useEffect(() => {
        if (!data.cabana_id || !data.check_in || !data.check_out || nights < 1) {
            setAvailability({ loading: false });
            return;
        }
        const controller = new AbortController();
        setAvailability((a) => ({ ...a, loading: true }));
        const t = setTimeout(() => {
            axios
                .get(route('availability'), {
                    params: { cabana_id: data.cabana_id, package_id: data.package_id || undefined, check_in: data.check_in, check_out: data.check_out },
                    signal: controller.signal,
                })
                .then(({ data: res }) => setAvailability({ loading: false, ...res }))
                .catch((err) => !axios.isCancel(err) && setAvailability({ loading: false, error: true }));
        }, 250);
        return () => {
            clearTimeout(t);
            controller.abort();
        };
    }, [data.cabana_id, data.package_id, data.check_in, data.check_out, nights]);

    const estimate = useMemo(() => {
        if (!cabana || nights < 1) return 0;
        if (pkg) return pkg.price + Math.max(0, nights - pkg.nights) * cabana.price_per_night;
        return nights * cabana.price_per_night;
    }, [cabana, pkg, nights]);
    const total = availability.total ?? estimate;

    const choosePackage = (id) => {
        const p = packages.find((x) => x.id === Number(id));
        setData((d) => {
            const next = { ...d, package_id: id };
            if (p) {
                if (p.cabana_id) next.cabana_id = p.cabana_id;
                next.check_out = addDays(d.check_in, p.nights);
                next.guests = p.guests;
            }
            return next;
        });
    };

    const changeCheckIn = (value) => {
        setData((d) => ({
            ...d,
            check_in: value,
            check_out: d.check_out <= value ? addDays(value, pkg?.nights ?? 1) : d.check_out,
        }));
    };

    const submit = (e) => {
        e.preventDefault();
        transform((d) => ({ ...d, package_id: d.package_id || null }));
        post(route('book.store'), { preserveScroll: true });
    };

    const unavailable = availability.available === false;

    return (
        <SiteLayout title="Book Your Stay">
            <PageHeader eyebrow="Reservations" title="Book Your Stay" subtitle="Reserve your cabana in a few steps. No payment needed now — pay on arrival." />

            <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
                <form onSubmit={submit} className="grid gap-8 lg:grid-cols-[1fr_360px]">
                    <div className="space-y-8">
                        {/* Step 1 */}
                        <fieldset className="card p-6 sm:p-8">
                            <legend className="sr-only">Stay details</legend>
                            <h2 className="font-serif text-2xl font-semibold text-forest-800">1. Your stay</h2>

                            <div className="mt-5 grid gap-3 sm:grid-cols-3">
                                {cabanas.map((c) => (
                                    <button
                                        key={c.id}
                                        type="button"
                                        onClick={() =>
                                            setData((d) => ({ ...d, cabana_id: c.id, guests: Math.min(d.guests, c.max_guests) }))
                                        }
                                        className={`overflow-hidden rounded-lg text-left ring-2 transition ${
                                            Number(data.cabana_id) === c.id ? 'ring-leaf-500' : 'ring-stone-200 hover:ring-forest-300'
                                        }`}
                                    >
                                        <ImageWithFallback src={c.cover_image_url} alt="" className="aspect-[16/9] w-full" />
                                        <span className="block p-3">
                                            <span className="block text-sm font-semibold text-stone-900">{c.name}</span>
                                            <span className="block text-xs text-stone-600">
                                                {formatLKR(c.price_per_night)} / night · up to {c.max_guests}
                                            </span>
                                        </span>
                                    </button>
                                ))}
                            </div>
                            {errors.cabana_id && <p className="mt-2 text-sm text-red-600">{errors.cabana_id}</p>}

                            <div className="mt-6 grid gap-4 sm:grid-cols-2">
                                <Field label="Package (optional)" error={errors.package_id} className="sm:col-span-2">
                                    <select className="input" value={data.package_id} onChange={(e) => choosePackage(e.target.value)}>
                                        <option value="">Room only</option>
                                        {packages.map((p) => (
                                            <option key={p.id} value={p.id}>
                                                {p.name} – {formatLKR(p.price)} ({(p.inclusions ?? []).join(', ')})
                                            </option>
                                        ))}
                                    </select>
                                </Field>
                                <Field label="Check-in" error={errors.check_in}>
                                    <input type="date" className="input" min={today} value={data.check_in} onChange={(e) => changeCheckIn(e.target.value)} required />
                                </Field>
                                <Field label="Check-out" error={errors.check_out}>
                                    <input
                                        type="date"
                                        className="input"
                                        min={data.check_in ? addDays(data.check_in, 1) : today}
                                        value={data.check_out}
                                        onChange={(e) => setData('check_out', e.target.value)}
                                        required
                                    />
                                </Field>
                                <Field label="Guests" error={errors.guests} hint={cabana ? `${cabana.name} sleeps up to ${cabana.max_guests}` : null}>
                                    <select className="input" value={data.guests} onChange={(e) => setData('guests', Number(e.target.value))}>
                                        {Array.from({ length: cabana?.max_guests ?? 2 }, (_, i) => i + 1).map((n) => (
                                            <option key={n} value={n}>
                                                {n} guest{n > 1 ? 's' : ''}
                                            </option>
                                        ))}
                                    </select>
                                </Field>
                            </div>

                            <div className="mt-5 min-h-[28px] text-sm" aria-live="polite">
                                {availability.loading ? (
                                    <span className="flex items-center gap-2 text-stone-500">
                                        <Loader2 className="h-4 w-4 animate-spin" /> Checking availability…
                                    </span>
                                ) : availability.available === true ? (
                                    <span className="flex items-center gap-2 font-medium text-leaf-600">
                                        <CheckCircle2 className="h-4 w-4" /> Available for your dates
                                        {availability.units_left === 1 && ' — last one left!'}
                                    </span>
                                ) : unavailable ? (
                                    <span className="flex items-center gap-2 font-medium text-red-600">
                                        <AlertTriangle className="h-4 w-4" /> Fully booked for these dates. Please try other dates or another cabana.
                                    </span>
                                ) : null}
                            </div>
                        </fieldset>

                        {/* Step 2 */}
                        <fieldset className="card p-6 sm:p-8">
                            <legend className="sr-only">Guest details</legend>
                            <h2 className="font-serif text-2xl font-semibold text-forest-800">2. Your details</h2>
                            <div className="mt-5 grid gap-4 sm:grid-cols-2">
                                <Field label="Full name *" error={errors.name} className="sm:col-span-2">
                                    <input className="input" value={data.name} onChange={(e) => setData('name', e.target.value)} autoComplete="name" required />
                                </Field>
                                <Field label="Email *" error={errors.email}>
                                    <input type="email" className="input" value={data.email} onChange={(e) => setData('email', e.target.value)} autoComplete="email" required />
                                </Field>
                                <Field label="Phone / WhatsApp *" error={errors.phone}>
                                    <input type="tel" className="input" value={data.phone} onChange={(e) => setData('phone', e.target.value)} autoComplete="tel" required />
                                </Field>
                                <Field label="Special requests" error={errors.notes} className="sm:col-span-2">
                                    <textarea
                                        rows={3}
                                        className="input"
                                        value={data.notes}
                                        onChange={(e) => setData('notes', e.target.value)}
                                        placeholder="Arrival time, dietary needs, celebrations…"
                                    />
                                </Field>
                            </div>
                        </fieldset>
                    </div>

                    {/* Summary */}
                    <aside className="card h-fit p-6 lg:sticky lg:top-24">
                        <h2 className="flex items-center gap-2 font-serif text-2xl font-semibold text-forest-800">
                            <CalendarCheck className="h-6 w-6" /> Summary
                        </h2>
                        <dl className="mt-5 space-y-3 text-sm">
                            <div className="flex justify-between gap-4">
                                <dt className="text-stone-500">Cabana</dt>
                                <dd className="text-right font-medium">{cabana?.name ?? '—'}</dd>
                            </div>
                            {pkg && (
                                <div className="flex justify-between gap-4">
                                    <dt className="text-stone-500">Package</dt>
                                    <dd className="text-right font-medium">{pkg.name}</dd>
                                </div>
                            )}
                            <div className="flex justify-between gap-4">
                                <dt className="text-stone-500">Dates</dt>
                                <dd className="text-right font-medium">
                                    {formatDate(data.check_in, { day: 'numeric', month: 'short' })} → {formatDate(data.check_out)}
                                </dd>
                            </div>
                            <div className="flex justify-between gap-4">
                                <dt className="text-stone-500">Nights</dt>
                                <dd className="font-medium">{nights}</dd>
                            </div>
                            <div className="flex justify-between gap-4">
                                <dt className="text-stone-500">Guests</dt>
                                <dd className="font-medium">{data.guests}</dd>
                            </div>
                        </dl>
                        <div className="mt-5 flex items-end justify-between border-t border-stone-200 pt-5">
                            <span className="text-sm text-stone-600">Total</span>
                            <span className="text-2xl font-bold text-forest-800">{formatLKR(total)}</span>
                        </div>
                        <p className="mt-1 text-right text-xs text-stone-500">Pay on arrival</p>

                        <button type="submit" disabled={processing || unavailable || nights < 1} className="btn-leaf mt-6 w-full">
                            {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : <CalendarCheck className="h-4 w-4" />}
                            {processing ? 'Sending request…' : 'Request Booking'}
                        </button>
                        <p className="mt-3 text-center text-xs text-stone-500">We'll confirm your booking by email shortly.</p>
                    </aside>
                </form>
            </section>
        </SiteLayout>
    );
}
