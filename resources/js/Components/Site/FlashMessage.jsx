import { Transition } from '@headlessui/react';
import { usePage } from '@inertiajs/react';
import { CheckCircle2, AlertTriangle, X } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function FlashMessage() {
    const { flash } = usePage().props;
    // The message stays put while the toast fades out, so it doesn't go blank mid-fade.
    const [message, setMessage] = useState(null);
    const [show, setShow] = useState(false);

    useEffect(() => {
        if (flash?.success || flash?.error) {
            setMessage(flash.success ? { type: 'success', text: flash.success } : { type: 'error', text: flash.error });
            setShow(true);
            const t = setTimeout(() => setShow(false), 6000);
            return () => clearTimeout(t);
        }
    }, [flash]);

    if (!message) return null;
    const ok = message.type === 'success';

    return (
        <Transition show={show} appear>
            <div
                className="fixed right-4 top-20 z-[70] max-w-sm transition duration-500 ease-smooth data-[closed]:opacity-0 motion-safe:data-[closed]:translate-y-3"
                role="status"
            >
                <div className={`flex items-start gap-3 rounded-lg p-4 shadow-xl ring-1 ${ok ? 'bg-forest-700 text-white ring-forest-800' : 'bg-red-600 text-white ring-red-700'}`}>
                    {ok ? <CheckCircle2 className="h-5 w-5 shrink-0" /> : <AlertTriangle className="h-5 w-5 shrink-0" />}
                    <p className="text-sm">{message.text}</p>
                    <button onClick={() => setShow(false)} aria-label="Dismiss" className="ml-auto opacity-80 transition hover:opacity-100">
                        <X className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </Transition>
    );
}
