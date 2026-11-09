import '../css/app.css';
import './bootstrap';

import PageErrorBoundary from '@/Components/PageErrorBoundary';
import { forgetPagePhotos, resumePagePhotos, stopPagePhotos } from '@/lib/photoDownloads';
import { createInertiaApp, router } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';

const appName = import.meta.env.VITE_APP_NAME || 'Nagala Eco Cottage';

// Visits that open another page. Others update the current page in place (filters, marking a
// message read, form posts) and keep its state and scroll position.
const opensPage = (options) => !options.preserveState && !options.preserveScroll;

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
        // swap. Visits that update the current page in place don't fade.
        visitOptions: (href, options) => (opensPage(options) ? { viewTransition: true } : {}),
    },
});

// When a link opens another page, stop this page's photos that are still downloading, so the next
// page doesn't queue behind them (lib/photoDownloads). Hovering a link to prefetch it doesn't count:
// the visitor may not click. They start again if the page stays after all.
router.on('before', (event) => {
    const { visit } = event.detail;
    if (visit.method === 'get' && !visit.prefetch && !visit.async && opensPage(visit)) stopPagePhotos();
});
router.on('beforeUpdate', forgetPagePhotos);
router.on('finish', (event) => event.detail.visit.cancelled && resumePagePhotos());
router.on('exception', resumePagePhotos);
router.on('invalid', resumePagePhotos);

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
