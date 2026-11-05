import ApplicationLogo from '@/Components/ApplicationLogo';
import FlashMessage from '@/Components/Site/FlashMessage';
import { Head, Link, usePage } from '@inertiajs/react';
import {
    CalendarDays,
    ExternalLink,
    Home,
    Image,
    LayoutDashboard,
    LogOut,
    Mail,
    MapPin,
    Menu,
    Package,
    Settings,
    UserCog,
    UtensilsCrossed,
    X,
} from 'lucide-react';
import { useState } from 'react';

const nav = [
    { label: 'Dashboard', route: 'admin.dashboard', match: 'admin.dashboard', icon: LayoutDashboard },
    { label: 'Bookings', route: 'admin.bookings.index', match: 'admin.bookings.*', icon: CalendarDays, badge: 'pendingBookings' },
    { label: 'Cabanas', route: 'admin.cabanas.index', match: 'admin.cabanas.*', icon: Home },
    { label: 'Packages', route: 'admin.packages.index', match: 'admin.packages.*', icon: Package },
    { label: 'Nearby Places', route: 'admin.places.index', match: 'admin.places.*', icon: MapPin },
    { label: 'Food Menu', route: 'admin.menu.index', match: 'admin.menu.*', icon: UtensilsCrossed },
    { label: 'Gallery', route: 'admin.gallery.index', match: 'admin.gallery.*', icon: Image },
    { label: 'Messages', route: 'admin.messages.index', match: 'admin.messages.*', icon: Mail, badge: 'unreadMessages' },
    { label: 'Settings', route: 'admin.settings.edit', match: 'admin.settings.*', icon: Settings },
    { label: 'My Account', route: 'profile.edit', match: 'profile.*', icon: UserCog },
];

function Sidebar({ onNavigate }) {
    const { adminCounts } = usePage().props;

    return (
        <div className="flex h-full flex-col bg-forest-900 text-cream-100">
            <Link href={route('admin.dashboard')} className="flex justify-center py-6" onClick={onNavigate}>
                <ApplicationLogo light />
            </Link>
            <nav className="flex-1 space-y-1 px-3">
                {nav.map((item) => {
                    const active = route().current(item.match);
                    const count = item.badge ? adminCounts?.[item.badge] : 0;
                    return (
                        <Link
                            key={item.route}
                            href={route(item.route)}
                            onClick={onNavigate}
                            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                                active ? 'bg-white/15 text-white' : 'text-cream-200/80 hover:bg-white/10 hover:text-white'
                            }`}
                        >
                            <item.icon className="h-4 w-4" />
                            {item.label}
                            {count > 0 && <span className="ml-auto rounded-full bg-gold-500 px-2 py-0.5 text-xs font-bold text-forest-950">{count}</span>}
                        </Link>
                    );
                })}
            </nav>
            <div className="space-y-1 border-t border-white/10 p-3">
                <a href={route('home')} target="_blank" rel="noreferrer" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-cream-200/80 hover:bg-white/10">
                    <ExternalLink className="h-4 w-4" /> View website
                </a>
                <Link
                    href={route('logout')}
                    method="post"
                    as="button"
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-cream-200/80 hover:bg-white/10"
                >
                    <LogOut className="h-4 w-4" /> Log out
                </Link>
            </div>
        </div>
    );
}

export default function AdminLayout({ title, actions, children }) {
    const [open, setOpen] = useState(false);
    const { auth } = usePage().props;

    return (
        <div className="min-h-screen bg-stone-100">
            <Head title={`${title} · Admin`} />

            <aside className="fixed inset-y-0 left-0 hidden w-64 lg:block">
                <Sidebar />
            </aside>

            {open && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
                    <aside className="absolute inset-y-0 left-0 w-64">
                        <Sidebar onNavigate={() => setOpen(false)} />
                    </aside>
                </div>
            )}

            <div className="lg:pl-64">
                <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-stone-200 bg-white px-4 sm:px-8">
                    <button className="rounded-md p-1.5 hover:bg-stone-100 lg:hidden" onClick={() => setOpen(true)} aria-label="Open menu">
                        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </button>
                    <h1 className="text-lg font-semibold text-stone-900">{title}</h1>
                    <div className="ml-auto flex items-center gap-3">
                        {actions}
                        <span className="hidden text-sm text-stone-500 sm:inline">{auth.user?.name}</span>
                    </div>
                </header>
                <main className="p-4 sm:p-8">{children}</main>
            </div>
            <FlashMessage />
        </div>
    );
}
