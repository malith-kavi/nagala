import { Bird } from 'lucide-react';
import { useEffect, useState, useSyncExternalStore } from 'react';

const SRC = '/audio/birdsong.mp3';
const VOLUME = 0.6;
const PREF_KEY = 'nagala:birdsong';
const HINT_KEY = 'nagala:birdsong-hint';

// One player for the whole visit, so the birds keep singing across Inertia page changes.
let audio = null;
let playing = false;
let held = false;
let fadeFrame = null;
const listeners = new Set();

const storage = {
    get: (key) => {
        try {
            return localStorage.getItem(key);
        } catch {
            return null;
        }
    },
    set: (key, value) => {
        try {
            localStorage.setItem(key, value);
        } catch {
            // Private mode: the preference just won't persist.
        }
    },
};

function player() {
    if (!audio) {
        audio = new Audio(SRC);
        audio.loop = true;
        audio.preload = 'none';
        audio.volume = 0;
    }
    return audio;
}

function setPlaying(value) {
    playing = value;
    listeners.forEach((notify) => notify());
}

function fadeTo(target, ms, done) {
    cancelAnimationFrame(fadeFrame);
    const a = player();
    const from = a.volume;
    const start = performance.now();
    const step = (now) => {
        const t = Math.min(1, (now - start) / ms);
        a.volume = from + (target - from) * t;
        if (t < 1) fadeFrame = requestAnimationFrame(step);
        else done?.();
    };
    fadeFrame = requestAnimationFrame(step);
}

function resume(ms) {
    const a = player();
    a.volume = 0;
    return a.play().then(() => fadeTo(VOLUME, ms));
}

function start() {
    setPlaying(true);
    if (held) return;
    // Browsers refuse audio before the visitor has interacted with the page.
    resume(2500).catch(() => setPlaying(false));
}

function stop() {
    setPlaying(false);
    if (audio) fadeTo(0, 800, () => audio.pause());
}

// Let other sound (e.g. the video modal) take over, then bring the birds back.
export function holdBirdsong(hold) {
    held = hold;
    if (!playing || !audio) return;
    if (hold) fadeTo(0, 600, () => audio.pause());
    else resume(1500).catch(() => {});
}

if (typeof document !== 'undefined') {
    // Silence a background tab; pick up again when the visitor returns.
    document.addEventListener('visibilitychange', () => {
        if (!playing || held || !audio) return;
        if (document.hidden) audio.pause();
        else resume(1200).catch(() => {});
    });

    // Visitors who turned the birds on last time hear them again from their first click or key press.
    if (storage.get(PREF_KEY) === 'on') {
        const wake = (event) => {
            window.removeEventListener('pointerdown', wake, true);
            window.removeEventListener('keydown', wake, true);
            if (!playing && !event.target.closest?.('[data-birdsong-toggle]')) start();
        };
        window.addEventListener('pointerdown', wake, true);
        window.addEventListener('keydown', wake, true);
    }
}

const subscribe = (notify) => {
    listeners.add(notify);
    return () => listeners.delete(notify);
};

export default function BirdsongToggle() {
    const isPlaying = useSyncExternalStore(subscribe, () => playing, () => false);
    const [hint, setHint] = useState(false);

    useEffect(() => {
        if (storage.get(PREF_KEY) || storage.get(HINT_KEY)) return;
        const show = setTimeout(() => setHint(true), 4000);
        const hide = setTimeout(() => {
            setHint(false);
            storage.set(HINT_KEY, 'seen');
        }, 13000);
        return () => {
            clearTimeout(show);
            clearTimeout(hide);
        };
    }, []);

    const toggle = () => {
        setHint(false);
        storage.set(HINT_KEY, 'seen');
        if (playing) {
            stop();
            storage.set(PREF_KEY, 'off');
        } else {
            start();
            storage.set(PREF_KEY, 'on');
        }
    };

    return (
        <div className="fixed bottom-5 left-5 z-40 flex items-center gap-3">
            <button
                type="button"
                data-birdsong-toggle
                onClick={toggle}
                aria-pressed={isPlaying}
                aria-label={isPlaying ? 'Turn off birdsong' : 'Play birdsong'}
                title={isPlaying ? 'Turn off birdsong' : 'Play birdsong'}
                className={`group relative flex h-12 w-12 items-center justify-center rounded-full shadow-xl ring-1 backdrop-blur transition hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-leaf-500 ${
                    isPlaying ? 'bg-forest-800 text-cream-50 ring-forest-700' : 'bg-white/90 text-forest-800 ring-stone-200'
                }`}
            >
                {isPlaying && <span className="absolute inset-0 rounded-full bg-leaf-500/40 motion-safe:animate-ping" aria-hidden />}
                <Bird className="relative h-5 w-5" strokeWidth={1.8} aria-hidden />
                {isPlaying ? (
                    <span className="absolute -right-0.5 -top-0.5 flex h-4 items-end gap-[2px] rounded-full bg-gold-500 px-1 pb-[3px]" aria-hidden>
                        {[0, 1, 2].map((i) => (
                            <span
                                key={i}
                                className="w-[2px] rounded-full bg-forest-900 motion-safe:animate-birdsong"
                                style={{ height: '8px', animationDelay: `${i * 0.18}s` }}
                            />
                        ))}
                    </span>
                ) : (
                    <span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full border-2 border-white bg-stone-300" aria-hidden />
                )}
            </button>

            {hint && (
                <button
                    type="button"
                    onClick={toggle}
                    className="animate-fade-up rounded-full bg-white/95 px-4 py-2 text-xs font-medium text-forest-800 shadow-lg ring-1 ring-stone-200 backdrop-blur hover:bg-white"
                >
                    Hear the birds of Nagala
                </button>
            )}
        </div>
    );
}
