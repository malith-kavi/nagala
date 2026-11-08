import ApplicationLogo from '@/Components/ApplicationLogo';
import BirdsongToggle from '@/Components/Site/Birdsong';
import { FooterLeaves } from '@/Components/Site/DesignFoliage';
import FlashMessage from '@/Components/Site/FlashMessage';
import PrefetchLink from '@/Components/Site/PrefetchLink';
import { SocialIcon } from '@/Components/Site/SocialIcons';
import { whatsappLink } from '@/lib/format';
import { scrollBehavior } from '@/lib/motion';
import { Transition } from '@headlessui/react';
import { Head, usePage } from '@inertiajs/react';
import { CalendarDays, LucideProvider, MapPin, Menu, Phone, X } from 'lucide-react';
import { useEffect, useState } from 'react';

// Cottages, Packages and Nearby Places are sections of the home page (`section` is the id).
// `match` keeps the item highlighted on its own pages, such as a cottage's page.
export const navItems = [
    { label: 'Home', route: 'home', match: 'home' },
    { label: 'Cottages', route: 'home', section: 'cottages', match: 'cottages.*' },
    { label: 'Packages', route: 'home', section: 'packages', match: 'packages.*' },
    { label: 'Dining', route: 'dining', match: 'dining' },
    { label: 'Nearby Places', route: 'home', section: 'places', match: 'places.*' },
    { label: 'Gallery', route: 'gallery', match: 'gallery' },
    { label: 'Contact', route: 'contact', match: 'contact' },
];

const sections = navItems.filter((item) => item.section).map((item) => item.section);

/**
 * A menu link. On the home page, links to the home page or its sections just scroll there,
 * with no page load; elsewhere they open the home page at that section.
 */
function NavLink({ item, onNavigate, ...props }) {
    const href = route(item.route) + (item.section ? `#${item.section}` : '');

    const scrollOnHome = (e) => {
        onNavigate?.();
        if (item.route !== 'home' || !route().current('home')) return;

        const target = item.section ? document.getElementById(item.section) : null;
        if (item.section && !target) return;

        e.preventDefault();
        window.history.replaceState(window.history.state, '', href);
        // After React has handled the click (and started closing the mobile menu).
        setTimeout(() => {
            const behavior = scrollBehavior();
            target ? target.scrollIntoView({ behavior }) : window.scrollTo({ top: 0, behavior });
        });
    };

    return <PrefetchLink href={href} onClick={scrollOnHome} {...props} />;
}

/** On the home page, the menu section scrolled into view (null over the hero). */
function useSectionInView(enabled) {
    const [section, setSection] = useState(null);

    useEffect(() => {
        if (!enabled) return undefined;

        let frame = 0;
        const update = () => {
            frame = 0;
            // The section whose top has passed the upper third of the screen most recently.
            const line = window.innerHeight / 3;
            let current = null;
            let currentTop = -Infinity;
            for (const id of sections) {
                const top = document.getElementById(id)?.getBoundingClientRect().top;
                if (top !== undefined && top <= line && top > currentTop) {
                    current = id;
                    currentTop = top;
                }
            }
            setSection(current);
        };
        const onScroll = () => {
            frame ||= requestAnimationFrame(update);
        };

        update();
        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', onScroll);
        return () => {
            cancelAnimationFrame(frame);
            window.removeEventListener('scroll', onScroll);
            window.removeEventListener('resize', onScroll);
        };
    }, [enabled]);

    return enabled ? section : null;
}

function Navbar() {
    const [open, setOpen] = useState(false);
    const { url } = usePage();
    const onHome = route().current('home');
    const section = useSectionInView(onHome);
    const isActive = (item) => {
        if (!onHome) return route().current(item.match);
        return item.section ? item.section === section : item.route === 'home' && !section;
    };

    useEffect(() => setOpen(false), [url]);

    return (
        <header className="sticky top-0 z-50 bg-white/95 shadow-sm backdrop-blur">
            <nav className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                <PrefetchLink href={route('home')} aria-label="Nagala Eco Cottage home" className="shrink-0">
                    <ApplicationLogo className="h-12 sm:h-14" />
                </PrefetchLink>

                <ul className="hidden items-center gap-8 lg:flex">
                    {navItems.map((item) => {
                        const active = isActive(item);
                        return (
                            <li key={item.label}>
                                <NavLink
                                    item={item}
                                    className={`relative py-2 text-sm font-medium transition hover:text-forest-700 ${
                                        active ? 'text-forest-800' : 'text-stone-700'
                                    }`}
                                >
                                    {item.label}
                                    {/* Grows in from the middle, and shrinks away as another section takes over */}
                                    <span
                                        aria-hidden
                                        className={`absolute inset-x-0 -bottom-0.5 h-0.5 rounded bg-leaf-500 transition duration-300 ease-smooth ${
                                            active ? 'scale-x-100 opacity-100' : 'scale-x-0 opacity-0'
                                        }`}
                                    />
                                </NavLink>
                            </li>
                        );
                    })}
                </ul>

                <div className="flex items-center gap-2">
                    <PrefetchLink href={route('book')} className="btn-primary hidden px-5 sm:inline-flex">
                        <CalendarDays className="h-4 w-4" /> Book Now
                    </PrefetchLink>
                    <button
                        type="button"
                        onClick={() => setOpen((o) => !o)}
                        className="rounded-md p-2 text-forest-800 hover:bg-forest-50 lg:hidden"
                        aria-label="Toggle menu"
                        aria-expanded={open}
                    >
                        {/* The two icons turn into each other */}
                        <span className="relative block h-6 w-6">
                            <Menu
                                className={`absolute inset-0 h-6 w-6 transition duration-300 ease-smooth ${open ? 'rotate-90 scale-50 opacity-0' : ''}`}
                            />
                            <X
                                className={`absolute inset-0 h-6 w-6 transition duration-300 ease-smooth ${open ? '' : '-rotate-90 scale-50 opacity-0'}`}
                            />
                        </span>
                    </button>
                </div>
            </nav>

            {/* Slides open and closed over the page (the grid row animates between no height and the
                menu's own height). It overlays the page rather than pushing it down, so nothing below
                reflows while it moves and a section link scrolls to where the section really is. */}
            <Transition show={open}>
                <div className="absolute inset-x-0 top-full grid grid-rows-[1fr] shadow-lg transition-[grid-template-rows,opacity] duration-300 ease-smooth data-[closed]:grid-rows-[0fr] data-[closed]:opacity-0 motion-reduce:transition-opacity lg:hidden">
                    <div className="min-h-0 overflow-hidden">
                        <ul className="space-y-1 border-t border-stone-100 bg-white px-4 py-3">
                            {navItems.map((item) => (
                                <li key={item.label}>
                                    <NavLink
                                        item={item}
                                        onNavigate={() => setOpen(false)}
                                        className={`block rounded-md px-3 py-2.5 text-base font-medium transition ${
                                            isActive(item) ? 'bg-forest-50 text-forest-800' : 'text-stone-700 hover:bg-stone-50'
                                        }`}
                                    >
                                        {item.label}
                                    </NavLink>
                                </li>
                            ))}
                            <li className="pt-2">
                                <PrefetchLink href={route('book')} className="btn-primary w-full">
                                    <CalendarDays className="h-4 w-4" /> Book Now
                                </PrefetchLink>
                            </li>
                        </ul>
                    </div>
                </div>
            </Transition>
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
                <PrefetchLink href={route('home')} className="justify-self-center md:justify-self-start">
                    <ApplicationLogo light stacked loading="lazy" className="h-36 md:h-40" />
                </PrefetchLink>

                <div className="flex flex-col items-center gap-5">
                    <ul className="flex flex-wrap justify-center gap-x-7 gap-y-2 text-sm">
                        {navItems.map((item) => (
                            <li key={item.label}>
                                <NavLink item={item} className="hover:text-gold-400">
                                    {item.label}
                                </NavLink>
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
                {/* <span className="mt-1 block text-[10px] text-cream-200/50">
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
                </span> */}
            </div>
        </footer>
    );
}

export default function SiteLayout({ title, children }) {
    const { settings } = usePage().props;

    // Thin, even outline icons across the public site (Booking.com style); explicit strokeWidth props still win.
    return (
        <LucideProvider strokeWidth={1.5}>
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
                    className="fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-xl transition duration-300 ease-smooth hover:scale-110"
                >
                    <SocialIcon name="whatsapp" className="h-7 w-7" />
                </a>
            )}
        </LucideProvider>
    );
}
