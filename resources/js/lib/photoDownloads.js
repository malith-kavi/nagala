import { useCallback, useRef } from 'react';

// A full page load stops the old page's downloads, but Inertia swaps pages in place, so the browser
// carries on downloading photos the visitor has left behind. On a weak signal they hold up the next
// page: clicking away from the gallery (80 photos) while it loaded seemed to do nothing.
//
// Pointing an image at another address stops its download. That address is a transparent pixel
// built into the page: with no address at all, browsers draw a broken-image icon.
const BLANK = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

/** Whether an image's download was stopped (it's showing the transparent pixel). */
export const isStopped = (img) => img.getAttribute('src') === BLANK;

/**
 * Stops an image's download if it's still loading (or waiting to, when lazy).
 * Returns a function that starts it again, or null if there was nothing to stop.
 */
export function stopDownload(img) {
    if (!img || img.complete) return null;

    // A <picture>'s sources too, or the image would just load one of them instead.
    const sources = img.parentElement?.tagName === 'PICTURE' ? [...img.parentElement.querySelectorAll('source')] : [];
    const saved = [...sources, img].map((element) => [element, ['srcset', 'src'].map((name) => [name, element.getAttribute(name)])]);
    sources.forEach((source) => source.removeAttribute('srcset'));
    img.removeAttribute('srcset');
    img.setAttribute('src', BLANK);

    return () => {
        if (!img.isConnected) return;
        saved.forEach(([element, attributes]) =>
            attributes.forEach(([name, value]) => (value === null ? element.removeAttribute(name) : element.setAttribute(name, value))),
        );
    };
}

let stopped = [];

/** Stops every photo still downloading on the page, to make way for the page being opened. */
export function stopPagePhotos() {
    for (const img of document.images) {
        const restart = stopDownload(img);
        if (restart) stopped.push(restart);
    }
}

/** The page stays after all (opening the next one failed or was cancelled): carry on with its photos. */
export function resumePagePhotos() {
    stopped.forEach((restart) => restart());
    stopped = [];
}

/** The next page is replacing this one, photos and all. */
export function forgetPagePhotos() {
    stopped = [];
}

/** A ref for an <img>: when React takes it off the page, its download stops too. */
export function useStopDownloadOnRemove() {
    const current = useRef(null);
    return useCallback((img) => {
        if (!img) stopDownload(current.current);
        current.current = img;
    }, []);
}
