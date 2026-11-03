const styles = {
    pending: 'bg-amber-100 text-amber-800',
    confirmed: 'bg-green-100 text-green-800',
    cancelled: 'bg-stone-200 text-stone-600',
};

export default function StatusBadge({ status }) {
    return <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${styles[status] ?? styles.cancelled}`}>{status}</span>;
}
