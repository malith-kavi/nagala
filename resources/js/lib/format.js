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

/** Travel time entered in minutes, shown as "45 min", "1 hr", "1 hr 30 min" or "2 hrs 15 min". */
export const formatDuration = (minutes) => {
    const total = Math.round(Number(minutes) || 0);
    const h = Math.floor(total / 60);
    const m = total % 60;
    const hours = h ? `${h} ${h === 1 ? 'hr' : 'hrs'}` : '';
    const mins = m || !h ? `${m} min` : '';
    return [hours, mins].filter(Boolean).join(' ');
};
