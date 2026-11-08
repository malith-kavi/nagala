import { Pax } from '@/Components/Site/Amenity';
import { packageUnit } from '@/Components/Site/Cards';
import Field from '@/Components/Site/Field';
import ImageWithFallback from '@/Components/Site/ImageWithFallback';
import PageHeader from '@/Components/Site/PageHeader';
import SiteLayout from '@/Layouts/SiteLayout';
import { addDays, formatDate, formatLKR, nightsBetween, toISODate } from '@/lib/format';
import { useForm } from '@inertiajs/react';
import axios from 'axios';
import { AlertTriangle, CalendarCheck, CalendarDays, Check, CheckCircle2, House, Loader2, Moon, User, Utensils } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

// Mirrors Package::fitsCottage(): the package's linked cottage, or any cottage sized for exactly its guests.
const fits = (pkg, cottage) => (pkg.cottage_id ? pkg.cottage_id === cottage.id : pkg.guests === cottage.max_guests);

function SummaryRow({ icon: Icon, label, children }) {
    return (
        <div className="flex justify-between gap-4">
            <dt className="flex items-center gap-2 text-stone-500">
                <Icon className="h-4 w-4 shrink-0 text-stone-800" aria-hidden /> {label}
            </dt>
            <dd className="text-right font-medium">{children}</dd>
        </div>
    );
}

export default function Book({ cottages, packages, preselect }) {
    const today = toISODate(new Date());

    const preselectedPackage = packages.find((p) => p.slug === preselect.package);
    const initialCottage =
        cottages.find((c) => c.slug === preselect.cottage) ??
        (preselectedPackage && cottages.find((c) => fits(preselectedPackage, c))) ??
        cottages[0];
    const initialPackage = preselectedPackage && initialCottage && fits(preselectedPackage, initialCottage) ? preselectedPackage : null;

    const { data, setData, post, processing, errors, transform } = useForm({
        cottage_id: initialCottage?.id ?? '',
        package_id: initialPackage?.id ?? '',
        check_in: today,
        check_out: addDays(today, initialPackage?.nights ?? 1),
        guests: Math.min(initialPackage?.guests ?? 2, initialCottage?.max_guests ?? 2),
        name: '',
        email: '',
        phone: '',
        notes: '',
    });

    const cottage = cottages.find((c) => c.id === Number(data.cottage_id));
    const pkg = packages.find((p) => p.id === Number(data.package_id));
    const nights = nightsBetween(data.check_in, data.check_out);

    const [availability, setAvailability] = useState({ loading: false });

    // Live availability + price check whenever the stay details change.
    useEffect(() => {
        if (!data.cottage_id || !data.check_in || !data.check_out || nights < 1) {
            setAvailability({ loading: false });
            return;
        }
        const controller = new AbortController();
        setAvailability((a) => ({ ...a, loading: true }));
        const t = setTimeout(() => {
            axios
                .get(route('availability'), {
                    params: { cottage_id: data.cottage_id, package_id: data.package_id || undefined, check_in: data.check_in, check_out: data.check_out },
                    signal: controller.signal,
                })
                .then(({ data: res }) => setAvailability({ loading: false, ...res }))
                .catch((err) => !axios.isCancel(err) && setAvailability({ loading: false, error: true }));
        }, 250);
        return () => {
            clearTimeout(t);
            controller.abort();
        };
    }, [data.cottage_id, data.package_id, data.check_in, data.check_out, nights]);

    const estimate = useMemo(() => {
        if (!cottage || nights < 1) return 0;
        if (pkg) {
            // Full board repeats the package's nightly rate, as in AvailabilityService::quote().
            const packageNights = Math.max(1, pkg.nights);
            return Math.round((pkg.price * Math.max(nights, packageNights)) / packageNights);
        }
        return nights * cottage.price_per_night;
    }, [cottage, pkg, nights]);
    const total = availability.total ?? estimate;

    const chooseCottage = (c) => {
        setData((d) => {
            const current = packages.find((p) => p.id === Number(d.package_id));
            // Keep full board when switching cottages by moving to the package that fits the new one.
            const next = current && !fits(current, c) ? packages.find((p) => fits(p, c)) : current;
            return {
                ...d,
                cottage_id: c.id,
                package_id: next?.id ?? '',
                guests: Math.min(next && next !== current ? next.guests : d.guests, c.max_guests),
            };
        });
    };

    const choosePackage = (id) => {
        const p = packages.find((x) => x.id === Number(id));
        setData((d) => {
            const next = { ...d, package_id: id };
            if (p) {
                const current = cottages.find((c) => c.id === Number(d.cottage_id));
                const target = current && fits(p, current) ? current : cottages.find((c) => fits(p, c));
                if (target) next.cottage_id = target.id;
                next.guests = Math.min(p.guests, target?.max_guests ?? p.guests);
                if (nightsBetween(d.check_in, d.check_out) < p.nights) next.check_out = addDays(d.check_in, p.nights);
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
            <PageHeader eyebrow="Reservations" title="Book Your Stay" subtitle="Reserve your cottage in a few steps. No payment needed now — pay on arrival." />

            <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
                <form onSubmit={submit} className="grid gap-8 lg:grid-cols-[1fr_360px]">
                    <div className="space-y-8">
                        {/* Step 1 */}
                        <fieldset className="card p-6 sm:p-8">
                            <legend className="sr-only">Stay details</legend>
                            <h2 className="font-display text-2xl font-semibold text-forest-800">1. Your stay</h2>

                            <div className="mt-5 grid gap-3 sm:grid-cols-2">
                                {cottages.map((c) => {
                                    // With full board chosen, show the package rate this cottage would switch to.
                                    const tilePackage = pkg && (fits(pkg, c) ? pkg : packages.find((p) => fits(p, c)));
                                    return (
                                        <button
                                            key={c.id}
                                            type="button"
                                            onClick={() => chooseCottage(c)}
                                            className={`overflow-hidden rounded-lg text-left ring-2 transition ${
                                                Number(data.cottage_id) === c.id ? 'ring-leaf-500' : 'ring-stone-200 hover:ring-forest-300'
                                            }`}
                                        >
                                            <ImageWithFallback src={c.cover_image_url} alt="" sizes="(min-width: 640px) 400px, 100vw" className="aspect-[16/9] w-full" />
                                            <span className="block p-3">
                                                <span className="block text-sm font-semibold text-stone-900">{c.name}</span>
                                                <span className="mt-0.5 flex items-center justify-between gap-2 text-xs text-stone-600">
                                                    {tilePackage
                                                        ? `${formatLKR(tilePackage.price)} ${packageUnit(tilePackage)} full board`
                                                        : `${formatLKR(c.price_per_night)} / night`}
                                                    <Pax count={c.max_guests} size="xs" />
                                                </span>
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                            {errors.cottage_id && <p className="mt-2 text-sm text-red-600">{errors.cottage_id}</p>}

                            <div className="mt-6 grid gap-4 sm:grid-cols-2">
                                <Field
                                    label="Meals"
                                    error={errors.package_id}
                                    hint={pkg ? `Includes ${(pkg.inclusion_list ?? []).map((i) => i.label).join(', ')}` : 'Add breakfast, lunch & dinner with a full board package'}
                                    className="sm:col-span-2"
                                >
                                    <select className="input" value={data.package_id} onChange={(e) => choosePackage(e.target.value)}>
                                        <option value="">Cottage only</option>
                                        {packages.map((p) => (
                                            <option key={p.id} value={p.id}>
                                                {p.name} – {formatLKR(p.price)} {packageUnit(p)}
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
                                <Field label="Guests" error={errors.guests} hint={cottage ? `${cottage.name} sleeps up to ${cottage.max_guests}` : null}>
                                    <select className="input" value={data.guests} onChange={(e) => setData('guests', Number(e.target.value))}>
                                        {Array.from({ length: cottage?.max_guests ?? 2 }, (_, i) => i + 1).map((n) => (
                                            <option key={n} value={n}>
                                                {n} guest{n > 1 ? 's' : ''}
                                            </option>
                                        ))}
                                    </select>
                                </Field>
                            </div>

                            {/* Each status is keyed, so it fades in rather than snapping over the last one */}
                            <div className="mt-5 min-h-[28px] text-sm" aria-live="polite">
                                {availability.loading ? (
                                    <span key="checking" className="flex animate-fade-in items-center gap-2 text-stone-500">
                                        <Loader2 className="h-4 w-4 animate-spin" /> Checking availability…
                                    </span>
                                ) : availability.available === true ? (
                                    <span key="available" className="flex animate-fade-in items-center gap-2 font-medium text-leaf-600">
                                        <CheckCircle2 className="h-4 w-4" /> Available for your dates
                                        {availability.units_left === 1 && ' — last one left!'}
                                    </span>
                                ) : unavailable ? (
                                    <span key="booked" className="flex animate-fade-in items-center gap-2 font-medium text-red-600">
                                        <AlertTriangle className="h-4 w-4" /> Fully booked for these dates. Please try other dates or another cottage.
                                    </span>
                                ) : null}
                            </div>
                        </fieldset>

                        {/* Step 2 */}
                        <fieldset className="card p-6 sm:p-8">
                            <legend className="sr-only">Guest details</legend>
                            <h2 className="font-display text-2xl font-semibold text-forest-800">2. Your details</h2>
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
                        <h2 className="flex items-center gap-2 font-display text-2xl font-semibold text-forest-800">
                            <CalendarCheck className="h-6 w-6" /> Summary
                        </h2>
                        <dl className="mt-5 space-y-3 text-sm">
                            <SummaryRow icon={House} label="Cottage">
                                {cottage?.name ?? '—'}
                            </SummaryRow>
                            {pkg && (
                                <SummaryRow icon={Utensils} label="Package">
                                    {pkg.name}
                                </SummaryRow>
                            )}
                            <SummaryRow icon={CalendarDays} label="Dates">
                                {formatDate(data.check_in, { day: 'numeric', month: 'short' })} → {formatDate(data.check_out)}
                            </SummaryRow>
                            <SummaryRow icon={Moon} label="Nights">
                                {nights}
                            </SummaryRow>
                            <SummaryRow icon={User} label="Guests">
                                {data.guests}
                            </SummaryRow>
                        </dl>
                        <div className="mt-5 flex items-end justify-between border-t border-stone-200 pt-5">
                            <span className="text-sm text-stone-600">Total</span>
                            <span className="text-2xl font-bold text-forest-800">{formatLKR(total)}</span>
                        </div>
                        <p className="mt-1 flex items-center justify-end gap-1 text-right text-xs font-medium text-forest-500">
                            <Check className="h-3.5 w-3.5 shrink-0 text-leaf-600" aria-hidden /> Pay on arrival · free welcome drink &amp; bed tea included
                        </p>

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
