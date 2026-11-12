import FormActions from '@/Components/Admin/FormActions';
import ImageInput from '@/Components/Admin/ImageInput';
import Field from '@/Components/Site/Field';
import AdminLayout from '@/Layouts/AdminLayout';
import { MAX_SIDE_LARGE } from '@/lib/prepareImage';
import { useForm } from '@inertiajs/react';

const text = [
    ['site_name', 'Site name *'],
    ['tagline', 'Tagline'],
    ['phone', 'Phone number'],
    ['whatsapp', 'WhatsApp number', 'Digits with country code, e.g. 94771234567'],
    ['email', 'Public email'],
    ['address', 'Address / location'],
    ['check_in_time', 'Check-in time'],
    ['check_out_time', 'Check-out time'],
    ['facebook_url', 'Facebook URL'],
    ['instagram_url', 'Instagram URL'],
    ['youtube_url', 'YouTube channel URL'],
    ['map_url', 'Google Maps location link', 'Google Maps → Share → Copy link'],
    ['video_url', '"Watch Video" YouTube link', 'Used by the Watch Video buttons on the home page'],
];

export default function Settings({ settings }) {
    const { data, setData, post, processing, progress, errors } = useForm({
        ...Object.fromEntries(text.map(([k]) => [k, settings[k] ?? ''])),
        map_embed_url: settings.map_embed_url ?? '',
        hero_image: null,
        hero_image_dark: null,
        banner_image: null,
        remove_hero_image: false,
        remove_hero_image_dark: false,
        remove_banner_image: false,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('admin.settings.update'), { forceFormData: true, preserveScroll: true });
    };

    const image = (key, label) => (
        <ImageInput
            label={label}
            aspect="aspect-[16/7]"
            maxSide={MAX_SIDE_LARGE}
            sizes="(min-width: 768px) 420px, 100vw"
            currentUrl={settings[`${key}_url`]}
            file={data[key]}
            onFile={(f) => setData((d) => ({ ...d, [key]: f, [`remove_${key}`]: f ? false : d[`remove_${key}`] }))}
            removed={data[`remove_${key}`]}
            onRemove={(v) => setData(`remove_${key}`, v)}
            error={errors[key]}
        />
    );

    return (
        <AdminLayout title="Settings">
            <form onSubmit={submit} className="max-w-4xl space-y-8 rounded-xl bg-white p-6 shadow-sm ring-1 ring-stone-200">
                <section>
                    <h2 className="font-semibold text-stone-900">Website images</h2>
                    <p className="text-sm text-stone-500">Large landscape photos work best (at least 1920 px wide).</p>
                    <div className="mt-4 grid gap-6 md:grid-cols-2">
                        {image('hero_image', 'Home hero background')}
                        {image('hero_image_dark', 'Home hero background – dark mode (optional)')}
                        {image('banner_image', '"Unwind. Explore. Reconnect." banner & page headers')}
                    </div>
                </section>

                <section>
                    <h2 className="font-semibold text-stone-900">Contact & social</h2>
                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                        {text.map(([key, label, hint]) => (
                            <Field key={key} label={label} error={errors[key]} hint={hint}>
                                <input className="input" value={data[key]} onChange={(e) => setData(key, e.target.value)} />
                            </Field>
                        ))}
                        <Field
                            label="Google Maps embed URL"
                            error={errors.map_embed_url}
                            hint='Google Maps → Share → Embed a map → copy the src="…" URL'
                            className="sm:col-span-2"
                        >
                            <input className="input" value={data.map_embed_url} onChange={(e) => setData('map_embed_url', e.target.value)} />
                        </Field>
                    </div>
                </section>

                <FormActions processing={processing} progress={progress} label="Save settings" />
            </form>
        </AdminLayout>
    );
}
