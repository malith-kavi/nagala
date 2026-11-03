export const formatLKR = (amount) =>
    `LKR ${Number(amount || 0).toLocaleString('en-LK', { maximumFractionDigits: 0 })}`;

export const formatDate = (value, opts = { day: 'numeric', month: 'short', year: 'numeric' }) => {
    if (!value) return '';
    const [y, m, d] = String(value).slice(0, 10).split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString('en-GB', opts);
};

export const nightsBetween = (checkIn, checkOut) => {
    if (!checkIn || !checkOut) return 0;
    const ms = new Date(checkOut) - new Date(checkIn);
    return Math.max(0, Math.round(ms / 86400000));
};

export const toISODate = (date) => {
    const pad = (n) => String(n).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

export const addDays = (iso, days) => {
    const [y, m, d] = iso.split('-').map(Number);
    return toISODate(new Date(y, m - 1, d + days));
};

export const whatsappLink = (number, text = '') =>
    `https://wa.me/${String(number || '').replace(/\D/g, '')}${text ? `?text=${encodeURIComponent(text)}` : ''}`;

/** Convert a YouTube watch/share URL to an embeddable one. */
export const youtubeEmbed = (url) => {
    if (!url) return null;
    const match = url.match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([\w-]{11})/);
    return match ? `https://www.youtube.com/embed/${match[1]}?autoplay=1&rel=0` : url;
};
