import { usePage } from '@inertiajs/react';
import { CheckCircle2, AlertTriangle, X } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function FlashMessage() {
    const { flash } = usePage().props;
    const [visible, setVisible] = useState(null);

    useEffect(() => {
        if (flash?.success || flash?.error) {
            setVisible(flash.success ? { type: 'success', text: flash.success } : { type: 'error', text: flash.error });
            const t = setTimeout(() => setVisible(null), 6000);
            return () => clearTimeout(t);
        }
    }, [flash]);

    if (!visible) return null;
    const ok = visible.type === 'success';

    return (
        <div className="fixed right-4 top-20 z-[70] max-w-sm animate-fade-up" role="status">
            <div className={`flex items-start gap-3 rounded-lg p-4 shadow-xl ring-1 ${ok ? 'bg-forest-700 text-white ring-forest-800' : 'bg-red-600 text-white ring-red-700'}`}>
                {ok ? <CheckCircle2 className="h-5 w-5 shrink-0" /> : <AlertTriangle className="h-5 w-5 shrink-0" />}
                <p className="text-sm">{visible.text}</p>
                <button onClick={() => setVisible(null)} aria-label="Dismiss" className="ml-auto opacity-80 hover:opacity-100">
                    <X className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
}
