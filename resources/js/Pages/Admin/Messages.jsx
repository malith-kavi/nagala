import DeleteButton from '@/Components/Admin/DeleteButton';
import Pagination from '@/Components/Admin/Pagination';
import AdminLayout from '@/Layouts/AdminLayout';
import { formatDate } from '@/lib/format';
import { router } from '@inertiajs/react';
import { Mail, MailOpen, Phone, Reply } from 'lucide-react';
import { useState } from 'react';

export default function Messages({ messages }) {
    const [open, setOpen] = useState(null);

    const toggleOpen = (m) => {
        setOpen(open === m.id ? null : m.id);
        if (!m.read_at) router.patch(route('admin.messages.read', m.id), {}, { preserveScroll: true, preserveState: true });
    };

    return (
        <AdminLayout title="Messages">
            <div className="divide-y divide-stone-100 overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-stone-200">
                {messages.data.map((m) => (
                    <div key={m.id} className={m.read_at ? '' : 'bg-sky-50/50'}>
                        <button type="button" onClick={() => toggleOpen(m)} className="flex w-full items-center gap-4 px-5 py-4 text-left hover:bg-stone-50">
                            {m.read_at ? <MailOpen className="h-5 w-5 shrink-0 text-stone-400" /> : <Mail className="h-5 w-5 shrink-0 text-sky-600" />}
                            <span className="min-w-0 flex-1">
                                <span className={`block text-sm ${m.read_at ? 'text-stone-700' : 'font-semibold text-stone-900'}`}>
                                    {m.name} {m.subject && <span className="font-normal text-stone-500">— {m.subject}</span>}
                                </span>
                                <span className="block truncate text-sm text-stone-500">{m.message}</span>
                            </span>
                            <span className="shrink-0 text-xs text-stone-500">{formatDate(m.created_at)}</span>
                        </button>
                        {open === m.id && (
                            <div className="px-5 pb-5 pl-14">
                                <p className="whitespace-pre-line text-sm text-stone-800">{m.message}</p>
                                <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
                                    <a href={`mailto:${m.email}?subject=Re: ${encodeURIComponent(m.subject || 'Your enquiry')}`} className="inline-flex items-center gap-1 text-forest-700 hover:underline">
                                        <Reply className="h-4 w-4" /> {m.email}
                                    </a>
                                    {m.phone && (
                                        <a href={`tel:${m.phone}`} className="inline-flex items-center gap-1 text-forest-700 hover:underline">
                                            <Phone className="h-4 w-4" /> {m.phone}
                                        </a>
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => router.patch(route('admin.messages.read', m.id), {}, { preserveScroll: true })}
                                        className="text-stone-500 hover:underline"
                                    >
                                        Mark as {m.read_at ? 'unread' : 'read'}
                                    </button>
                                    <DeleteButton href={route('admin.messages.destroy', m.id)} confirm="Delete this message?" className="ml-auto" />
                                </div>
                            </div>
                        )}
                    </div>
                ))}
                {messages.data.length === 0 && <p className="p-10 text-center text-stone-500">No messages yet.</p>}
            </div>
            <Pagination links={messages.links} />
        </AdminLayout>
    );
}
