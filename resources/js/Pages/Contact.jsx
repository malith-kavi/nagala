import Field from '@/Components/Site/Field';
import MapEmbed from '@/Components/Site/MapEmbed';
import PageHeader from '@/Components/Site/PageHeader';
import { SocialIcon } from '@/Components/Site/SocialIcons';
import SiteLayout from '@/Layouts/SiteLayout';
import { whatsappLink } from '@/lib/format';
import { useForm, usePage } from '@inertiajs/react';
import { Clock, Mail, MapPin, Phone, Send } from 'lucide-react';

export default function Contact() {
    const { settings } = usePage().props;
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('contact.store'), { preserveScroll: true, onSuccess: () => reset() });
    };

    const info = [
        settings.phone && { icon: Phone, label: 'Call us', value: settings.phone, href: `tel:${settings.phone.replace(/\s/g, '')}` },
        settings.email && { icon: Mail, label: 'Email', value: settings.email, href: `mailto:${settings.email}` },
        settings.address && { icon: MapPin, label: 'Location', value: settings.address },
        { icon: Clock, label: 'Check-in / out', value: `${settings.check_in_time} / ${settings.check_out_time}` },
    ].filter(Boolean);

    return (
        <SiteLayout title="Contact">
            <PageHeader eyebrow="Get in Touch" title="Contact Us" subtitle="Questions about your stay? We'd love to hear from you." />

            <section className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1fr_1.3fr] lg:px-8">
                <div>
                    <h2 className="font-display text-3xl font-semibold text-forest-800">We're here to help</h2>
                    <p className="mt-2 text-stone-600">Reach out by phone, WhatsApp or the form — we usually reply within a few hours.</p>

                    <ul className="mt-8 space-y-5">
                        {info.map(({ icon: Icon, label, value, href }) => (
                            <li key={label} className="flex items-start gap-4">
                                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-forest-50 text-forest-700">
                                    <Icon className="h-5 w-5" />
                                </span>
                                <span>
                                    <span className="block text-xs uppercase tracking-wider text-stone-500">{label}</span>
                                    {href ? (
                                        <a href={href} className="font-medium text-stone-900 hover:text-forest-700">
                                            {value}
                                        </a>
                                    ) : (
                                        <span className="font-medium text-stone-900">{value}</span>
                                    )}
                                </span>
                            </li>
                        ))}
                    </ul>

                    {settings.whatsapp && (
                        <a
                            href={whatsappLink(settings.whatsapp, 'Hi! I have a question about Nagala Eco Cottage.')}
                            target="_blank"
                            rel="noreferrer"
                            className="btn mt-8 bg-[#25D366] text-white hover:brightness-95"
                        >
                            <SocialIcon name="whatsapp" className="h-5 w-5" /> Chat on WhatsApp
                        </a>
                    )}
                </div>

                <form onSubmit={submit} className="card space-y-4 p-6 sm:p-8">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <Field label="Your name *" error={errors.name}>
                            <input className="input" value={data.name} onChange={(e) => setData('name', e.target.value)} required />
                        </Field>
                        <Field label="Email *" error={errors.email}>
                            <input type="email" className="input" value={data.email} onChange={(e) => setData('email', e.target.value)} required />
                        </Field>
                        <Field label="Phone" error={errors.phone}>
                            <input type="tel" className="input" value={data.phone} onChange={(e) => setData('phone', e.target.value)} />
                        </Field>
                        <Field label="Subject" error={errors.subject}>
                            <input className="input" value={data.subject} onChange={(e) => setData('subject', e.target.value)} />
                        </Field>
                    </div>
                    <Field label="Message *" error={errors.message}>
                        <textarea rows={6} className="input" value={data.message} onChange={(e) => setData('message', e.target.value)} required />
                    </Field>
                    <button type="submit" disabled={processing} className="btn-primary">
                        <Send className="h-4 w-4" /> {processing ? 'Sending…' : 'Send Message'}
                    </button>
                </form>
            </section>

            {settings.map_embed_url && <MapEmbed url={settings.map_embed_url} link={settings.map_url} address={settings.address} title="Map to Nagala Eco Cottage" />}
        </SiteLayout>
    );
}
