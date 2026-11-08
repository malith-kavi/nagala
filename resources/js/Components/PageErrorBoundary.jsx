import { Component } from 'react';

/**
 * Shown instead of a page that fails while it's drawn. Without it the screen went blank, and a page
 * change that failed this way never finished: Inertia's cross-fade only ends a visit once the new
 * page is drawn, so the green loading bar ran forever. The message says what went wrong, so it can
 * be passed on.
 */
export default class PageErrorBoundary extends Component {
    state = { error: null };

    static getDerivedStateFromError(error) {
        return { error };
    }

    componentDidCatch(error, info) {
        console.error(error, info?.componentStack);
    }

    render() {
        const { error } = this.state;
        if (!error) return this.props.children;

        return (
            <div className="flex min-h-screen items-center justify-center bg-stone-100 px-4 py-10" role="alert">
                <div className="w-full max-w-md rounded-xl bg-white p-6 text-center shadow-sm ring-1 ring-stone-200">
                    <h1 className="text-lg font-semibold text-stone-900">Sorry, this page couldn’t be shown</h1>
                    <p className="mt-2 text-sm text-stone-600">Reloading usually fixes it. If it keeps happening, please send us the message below.</p>
                    <pre className="mt-4 whitespace-pre-wrap break-words rounded-lg bg-stone-50 p-3 text-left text-xs text-stone-700 ring-1 ring-stone-200">
                        {String(error?.message ?? error)}
                    </pre>
                    <button type="button" onClick={() => window.location.reload()} className="btn-primary mt-5">
                        Reload page
                    </button>
                </div>
            </div>
        );
    }
}
