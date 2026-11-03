import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link } from '@inertiajs/react';

export default function GuestLayout({ children }) {
    return (
        <div className="leaf-bg flex min-h-screen flex-col items-center px-4 pt-6 sm:justify-center sm:pt-0">
            <Link href="/">
                <ApplicationLogo light />
            </Link>

            <div className="mt-6 w-full overflow-hidden rounded-xl bg-white px-6 py-6 shadow-xl sm:max-w-md">
                {children}
            </div>
        </div>
    );
}
