// The server takes photos up to 1 MB, but phone photos are often several MB, and often HEIC (which
// browsers can't show and the server rejects). So photos are resized and re-encoded here before
// uploading, which also keeps uploads quick on a weak signal: WebP where the browser can make it
// (JPEG otherwise), at the highest quality that fits. The server then makes the smaller copies.
import { useCallback, useEffect, useRef, useSyncExternalStore } from 'react';

export const MAX_BYTES = 1024 * 1024;
export const MAX_SIDE = 2048;
/** Full-screen images such as the home hero keep more pixels, so they stay sharp on phones. */
export const MAX_SIDE_LARGE = 3200;

const QUALITIES = [0.9, 0.82, 0.74, 0.66];

const isHeic = (file) => /image\/hei[cf]/i.test(file.type) || /\.hei[cf]$/i.test(file.name);
const isConvertible = (file) => /^image\//i.test(file.type) && !/svg/i.test(file.type);
/** Formats the server takes as they are (others, such as GIF or AVIF, are converted here). */
const isAccepted = (file) => /^image\/(jpeg|png|webp)$/i.test(file.type);

const toBlob = (canvas, type, quality) => new Promise((resolve) => canvas.toBlob(resolve, type, quality));

// How many photo batches are being prepared right now. A photo still being prepared isn't in its
// form yet, so FormActions holds off saving until it's ready instead of leaving it out.
let pending = 0;
const listeners = new Set();
const setPending = (change) => {
    pending += change;
    listeners.forEach((listener) => listener());
};
const subscribe = (listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
};

/** Whether any photo is still being prepared for upload. */
export const usePreparingImages = () => useSyncExternalStore(subscribe, () => pending > 0, () => false);

// Older Safari can't encode WebP; asked for it, the canvas returns a PNG instead.
let webp;
const canEncodeWebp = () => {
    if (webp === undefined) {
        const canvas = document.createElement('canvas');
        canvas.width = canvas.height = 1;
        webp = canvas.toDataURL('image/webp').startsWith('data:image/webp');
    }
    return webp;
};

function draw(bitmap, scale, type) {
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    const ctx = canvas.getContext('2d');
    if (type === 'image/jpeg') {
        // JPEG has no transparency; without this, transparent areas turn black.
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    return canvas;
}

/** The best-quality encoding under MAX_BYTES, shrinking the photo a little at a time if needed. */
async function encodeUnderLimit(bitmap, maxSide, type) {
    let scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
    let blob = null;

    for (let attempt = 0; attempt < 8; attempt++) {
        const canvas = draw(bitmap, scale, type);
        try {
            for (const quality of QUALITIES) {
                blob = await toBlob(canvas, type, quality);
                if (blob && blob.size <= MAX_BYTES) return blob;
            }
        } finally {
            // Safari holds on to a canvas's memory until it's garbage collected; emptying it frees that now.
            canvas.width = canvas.height = 0;
        }
        scale *= 0.85;
    }

    return blob;
}

/**
 * A photo ready to upload: at most `maxSide` pixels on its long side and 1 MB. Photos already
 * within both limits are left as they are. If the browser can't read the photo, it's returned
 * unchanged and the server reports the problem.
 */
async function prepare(file, { maxSide = MAX_SIDE } = {}) {
    const heic = isHeic(file);
    if (!heic && !isConvertible(file)) return file;

    let bitmap;
    try {
        if (heic) {
            const { heicTo } = await import('heic-to');
            bitmap = await heicTo({ blob: file, type: 'bitmap' });
        } else {
            bitmap = await createImageBitmap(file);
        }

        if (isAccepted(file) && file.size <= MAX_BYTES && Math.max(bitmap.width, bitmap.height) <= maxSide) return file;

        const type = canEncodeWebp() ? 'image/webp' : 'image/jpeg';
        const blob = await encodeUnderLimit(bitmap, maxSide, type);
        if (!blob) return file;

        const extension = type === 'image/webp' ? 'webp' : 'jpg';
        return new File([blob], `${file.name.replace(/\.[^.]+$/, '')}.${extension}`, { type, lastModified: file.lastModified });
    } catch {
        return file;
    } finally {
        bitmap?.close?.();
    }
}

async function tracked(work) {
    setPending(1);
    try {
        return await work();
    } finally {
        setPending(-1);
    }
}

export const prepareImage = (file, options) => tracked(() => prepare(file, options));

/**
 * Photos are prepared one at a time: a phone photo takes about 50 MB of memory while it's resized,
 * so preparing a dozen at once could freeze the page or make a phone reload it.
 * Once `signal` is aborted, the photos not yet prepared are skipped and nothing is returned.
 */
export const prepareImages = (files, { signal, ...options } = {}) =>
    tracked(async () => {
        const prepared = [];
        for (const file of files) {
            if (signal?.aborted) break;
            prepared.push(await prepare(file, options));
        }
        return signal?.aborted ? [] : prepared;
    });

/**
 * prepareImages for one admin page. When the admin leaves the page (Cancel or any other link)
 * the photos not yet prepared are skipped, so the work doesn't slow down the next page or hold
 * up its Save button.
 */
export function usePrepareImages() {
    const controller = useRef(null);
    useEffect(() => {
        controller.current = new AbortController();
        return () => controller.current.abort();
    }, []);

    return useCallback((files, options) => prepareImages(files, { ...options, signal: controller.current?.signal }), []);
}

export const IMAGE_ACCEPT = 'image/*,.heic,.heif';
