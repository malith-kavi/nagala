import ApplicationLogo from '@/Components/ApplicationLogo';
import BirdsongToggle from '@/Components/Site/Birdsong';
import { FooterLeaves } from '@/Components/Site/DesignFoliage';
import FlashMessage from '@/Components/Site/FlashMessage';
import { SocialIcon } from '@/Components/Site/SocialIcons';
import { whatsappLink } from '@/lib/format';
import { Head, Link, usePage } from '@inertiajs/react';
import { CalendarDays, MapPin, Menu, Phone, X } from 'lucide-react';
import { useEffect, useState } from 'react';

export const navItems = [
    { label: 'Home', route: 'home', match: 'home' },
    { label: 'Cabanas', route: 'cabanas.index', match: 'cabanas.*' },
    { label: 'Packages', route: 'packages.index', match: 'packages.*' },
    { label: 'Dining', route: 'dining', match: 'dining' },
    { label: 'Nearby Places', route: 'places.index', match: 'places.*' },
    { label: 'Gallery', route: 'gallery', match: 'gallery' },
    { label: 'Contact', route: 'contact', match: 'contact' },
];

function Navbar() {
    const [open, setOpen] = useState(false);
    const { url } = usePage();

    useEffect(() => setOpen(false), [url]);

    return (
        <header className="sticky top-0 z-50 bg-white/95 shadow-sm backdrop-blur">
            <nav className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                <Link href={route('home')} aria-label="Nagala Eco Cottage home">
                    <ApplicationLogo />
                </Link>

                <ul className="hidden items-center gap-8 lg:flex">
                    {navItems.map((item) => {
                        const active = route().current(item.match);
                        return (
                            <li key={item.route}>
                                <Link
                                    href={route(item.route)}
                                    className={`relative py-2 text-sm font-medium transition hover:text-forest-700 ${
                                        active ? 'text-forest-800' : 'text-stone-700'
                                    }`}
                                >
                                    {item.label}
                                    {active && <span className="absolute inset-x-0 -bottom-0.5 h-0.5 rounded bg-leaf-500" />}
                                </Link>
                            </li>
                        );
                    })}
                </ul>

                <div className="flex items-center gap-2">
                    <Link href={route('book')} className="btn-primary hidden px-5 sm:inline-flex">
                        <CalendarDays className="h-4 w-4" /> Book Now
                    </Link>
                    <button
                        type="button"
                        onClick={() => setOpen((o) => !o)}
                        className="rounded-md p-2 text-forest-800 hover:bg-forest-50 lg:hidden"
                        aria-label="Toggle menu"
                        aria-expanded={open}
                    >
                        {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                    </button>
                </div>
            </nav>

            {open && (
                <div className="border-t border-stone-100 bg-white lg:hidden">
                    <ul className="space-y-1 px-4 py-3">
                        {navItems.map((item) => (
                            <li key={item.route}>
                                <Link
                                    href={route(item.route)}
                                    className={`block rounded-md px-3 py-2.5 text-base font-medium ${
                                        route().current(item.match) ? 'bg-forest-50 text-forest-800' : 'text-stone-700 hover:bg-stone-50'
                                    }`}
                                >
                                    {item.label}
                                </Link>
                            </li>
                        ))}
                        <li className="pt-2">
                            <Link href={route('book')} className="btn-primary w-full">
                                <CalendarDays className="h-4 w-4" /> Book Now
                            </Link>
                        </li>
                    </ul>
                </div>
            )}
        </header>
    );
}

function Footer() {
    const { settings } = usePage().props;
    const socials = [
        { name: 'facebook', url: settings.facebook_url, label: 'Facebook' },
        { name: 'instagram', url: settings.instagram_url, label: 'Instagram' },
        { name: 'youtube', url: settings.youtube_url, label: 'YouTube' },
        { name: 'whatsapp', url: settings.whatsapp ? whatsappLink(settings.whatsapp) : '', label: 'WhatsApp' },
    ];

    return (
        <footer className="relative overflow-hidden bg-[#082316] text-cream-100">
            <FooterLeaves />
            <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[auto_1fr_auto] md:items-center lg:px-8">
                <Link href={route('home')} className="justify-self-center md:justify-self-start">
                    <ApplicationLogo light className="scale-110" />
                </Link>

                <div className="flex flex-col items-center gap-5">
                    <ul className="flex flex-wrap justify-center gap-x-7 gap-y-2 text-sm">
                        {navItems.map((item) => (
                            <li key={item.route}>
                                <Link href={route(item.route)} className="hover:text-gold-400">
                                    {item.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                    <div className="flex gap-4">
                        {socials.map((s) => (
                            <a
                                key={s.name}
                                href={s.url || '#'}
                                target={s.url ? '_blank' : undefined}
                                rel="noreferrer"
                                aria-label={s.label}
                                className={`rounded-full bg-white/10 p-2 transition hover:bg-gold-500 hover:text-forest-900 ${s.url ? '' : 'pointer-events-none opacity-40'}`}
                            >
                                <SocialIcon name={s.name} className="h-4 w-4" />
                            </a>
                        ))}
                    </div>
                </div>

                <div className="space-y-3 justify-self-center text-sm md:border-l md:border-white/20 md:pl-8">
                    {settings.phone && (
                        <a href={`tel:${settings.phone.replace(/\s/g, '')}`} className="flex items-center gap-3 hover:text-gold-400">
                            <Phone className="h-4 w-4" /> {settings.phone}
                        </a>
                    )}
                    {settings.address && (
                        <p className="flex items-center gap-3">
                            <MapPin className="h-4 w-4" /> {settings.address}
                        </p>
                    )}
                </div>
            </div>
            <div className="relative border-t border-white/10 py-4 text-center text-xs text-cream-200/70">
                © {new Date().getFullYear()} {settings.site_name}. All rights reserved.
                <span className="mt-1 block text-[10px] text-cream-200/50">
                    Birdsong:{' '}
                    <a
                        href="https://commons.wikimedia.org/wiki/File:Dawn_chorus_at_Glencairnie_big_bungalow_Craigmore_DM.ogg"
                        target="_blank"
                        rel="noreferrer"
                        className="underline-offset-2 hover:underline"
                    >
                        &ldquo;Dawn chorus at Glencairnie&rdquo; by DivyaCM
                    </a>
                    , CC BY 4.0, edited · Night sounds:{' '}
                    <a
                        href="https://commons.wikimedia.org/wiki/File:Nature_sounds_ambience_in_a_Dordogne_pond.ogg"
                        target="_blank"
                        rel="noreferrer"
                        className="underline-offset-2 hover:underline"
                    >
                        &ldquo;Nature sounds ambience in a Dordogne pond&rdquo; by Glaneur de sons
                    </a>
                    , CC BY 3.0, edited
                </span>
            </div>
        </footer>
    );
}

export default function SiteLayout({ title, children }) {
    const { settings } = usePage().props;

    return (
        <>
            <Head title={title} />
            <div className="flex min-h-screen flex-col">
                <Navbar />
                <main className="flex-1">{children}</main>
                <Footer />
            </div>
            <FlashMessage />
            <BirdsongToggle />
            {settings.whatsapp && (
                <a
                    href={whatsappLink(settings.whatsapp, 'Hi! I would like to know more about Nagala Eco Cottage.')}
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Chat on WhatsApp"
                    className="fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-xl transition hover:scale-110"
                >
                    <SocialIcon name="whatsapp" className="h-7 w-7" />
                </a>
            )}
        </>
    );
}
