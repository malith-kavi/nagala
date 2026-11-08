import '../css/app.css';
import './bootstrap';

import PageErrorBoundary from '@/Components/PageErrorBoundary';
import { createInertiaApp, router } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';

const appName = import.meta.env.VITE_APP_NAME || 'Nagala Eco Cottage';

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.jsx`,
            import.meta.glob('./Pages/**/*.jsx'),
        ),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(
            <PageErrorBoundary>
                <App {...props} />
            </PageErrorBoundary>,
        );
    },
    progress: {
        color: '#4caf2a',
    },
    defaults: {
        // Cross-fade between pages (styled in app.css) in browsers with view transitions; others just
        // swap. Visits that update the current page in place (filters, marking a message read,
        // reloads) keep their state and scroll position, and don't fade.
        visitOptions: (href, options) => (options.preserveState || options.preserveScroll ? {} : { viewTransition: true }),
    },
});

// When a link prefetches a page's data (PrefetchLink), also fetch that page's code, so clicking it
// doesn't wait for the download either.
router.on('prefetched', (event) => {
    // The event carries the response as Inertia received it, which is still JSON text.
    let page = event.detail.response;
    if (typeof page === 'string') {
        try {
            page = JSON.parse(page);
        } catch {
            return;
        }
    }
    if (page?.component) router.resolveComponent(page.component).catch(() => {});
});
