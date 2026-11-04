// Phone photos are often HEIC (which browsers can't show and the server rejects) and
// larger than the upload limit, so convert them to a reasonably sized JPEG before uploading.
const MAX_SIDE = 2560;
const MAX_BYTES = 1.8 * 1024 * 1024;

const isHeic = (file) => /image\/hei[cf]/i.test(file.type) || /\.hei[cf]$/i.test(file.name);
const isResizable = (file) => /^image\/(jpeg|png|webp|bmp)$/i.test(file.type);

const toJpeg = (canvas, quality) => new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality));

export async function prepareImage(file) {
    const heic = isHeic(file);
    if (!heic && (file.size <= MAX_BYTES || !isResizable(file))) return file;

    try {
        let bitmap;
        if (heic) {
            const { heicTo } = await import('heic-to');
            bitmap = await heicTo({ blob: file, type: 'bitmap' });
        } else {
            bitmap = await createImageBitmap(file);
        }

        const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(bitmap.width * scale);
        canvas.height = Math.round(bitmap.height * scale);
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
        bitmap.close?.();

        let blob = await toJpeg(canvas, 0.85);
        if (blob.size > MAX_BYTES) blob = await toJpeg(canvas, 0.7);

        return new File([blob], `${file.name.replace(/\.[^.]+$/, '')}.jpg`, { type: 'image/jpeg', lastModified: file.lastModified });
    } catch {
        // Leave the original file; the server will report it as invalid.
        return file;
    }
}

export const prepareImages = (files) => Promise.all([...files].map(prepareImage));

export const IMAGE_ACCEPT = 'image/*,.heic,.heif';
