import { Transition } from '@headlessui/react';
import { Bird, Moon } from 'lucide-react';
import { useEffect, useState, useSyncExternalStore } from 'react';

// Birdsong goes with the sunset hero (light mode), the cricket-and-frog chorus with the night one.
const TRACKS = { day: '/audio/birdsong.m4a', night: '/audio/night.m4a' };
const VOLUME = 0.6;
const PREF_KEY = 'nagala:birdsong';
const HINT_KEY = 'nagala:birdsong-hint';

const darkQuery = typeof window !== 'undefined' ? window.matchMedia('(prefers-color-scheme: dark)') : null;
const scene = () => (darkQuery?.matches ? 'night' : 'day');

// One player per sound for the whole visit, so it keeps playing across Inertia page changes.
const players = {};
const fades = {};
let current = null;
let playing = false;
let held = false;
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

const notify = () => listeners.forEach((listener) => listener());

function player(name) {
    if (!players[name]) {
        const audio = new Audio(TRACKS[name]);
        audio.loop = true;
        audio.preload = 'none';
        audio.volume = 0;
        players[name] = audio;
    }
    return players[name];
}

function setPlaying(value) {
    playing = value;
    notify();
}

// Timer-driven rather than animation frames, which browsers may stall while nothing on screen moves.
function fadeTo(name, target, ms, done) {
    clearInterval(fades[name]);
    const audio = player(name);
    const from = audio.volume;
    const start = performance.now();
    fades[name] = setInterval(() => {
        const t = Math.min(1, (performance.now() - start) / ms);
        audio.volume = from + (target - from) * t;
        if (t < 1) return;
        clearInterval(fades[name]);
        done?.();
    }, 40);
}

function fadeOut(name, ms) {
    if (players[name] && !players[name].paused) fadeTo(name, 0, ms, () => players[name].pause());
}

// Plays the sound for the current colour scheme, fading it in.
function resume(ms) {
    current = scene();
    const audio = player(current);
    clearInterval(fades[current]);
    audio.volume = 0;
    return audio.play().then(() => fadeTo(current, VOLUME, ms));
}

function start() {
    setPlaying(true);
    if (held) return;
    resume(2500).catch(() => setPlaying(false));
}

function stop() {
    setPlaying(false);
    Object.keys(players).forEach((name) => fadeOut(name, 800));
}

// Let other sound (e.g. the video modal) take over, then bring the background sound back.
export function holdBirdsong(hold) {
    held = hold;
    if (!playing) return;
    if (hold) Object.keys(players).forEach((name) => fadeOut(name, 600));
    else resume(1500).catch(() => {});
}

if (typeof window !== 'undefined') {
    // Silence a background tab; pick up again when the visitor returns.
    document.addEventListener('visibilitychange', () => {
        if (!playing || held) return;
        if (document.hidden) {
            Object.keys(players).forEach((name) => {
                clearInterval(fades[name]);
                players[name].pause();
            });
        } else {
            resume(1200).catch(() => {});
        }
    });

    // Crossfade to the other sound when the device switches between light and dark mode.
    darkQuery.addEventListener('change', () => {
        notify();
        if (!playing || held || document.hidden || current === scene()) return;
        fadeOut(current, 2500);
        resume(2500).catch(() => {});
    });

    // The sound is on unless the visitor turned it off. Browsers only allow sound once the visitor
    // has interacted with the page, so if the first try is refused, try again on each click, tap or
    // key press until it plays.
    if (storage.get(PREF_KEY) !== 'off') {
        const events = ['pointerdown', 'pointerup', 'touchend', 'keydown'];
        const unlisten = () => events.forEach((type) => window.removeEventListener(type, wake, true));
        const attempt = () => {
            if (playing || storage.get(PREF_KEY) === 'off') return unlisten();
            if (held || document.hidden) return;
            resume(3000)
                .then(() => {
                    setPlaying(true);
                    unlisten();
                })
                .catch(() => {});
        };
        // The toggle and its hint handle their own clicks.
        function wake(event) {
            if (!event.target.closest?.('[data-birdsong-toggle]')) attempt();
        }
        events.forEach((type) => window.addEventListener(type, wake, true));
        attempt();
    }
}

const subscribe = (listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
};

export default function BirdsongToggle() {
    const isPlaying = useSyncExternalStore(subscribe, () => playing, () => false);
    const isNight = useSyncExternalStore(subscribe, () => scene() === 'night', () => false);
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

    const Icon = isNight ? Moon : Bird;
    const sound = isNight ? 'night sounds' : 'birdsong';
    const label = isPlaying ? `Turn off ${sound}` : `Play ${sound}`;

    return (
        <div className="fixed bottom-5 left-5 z-40 flex items-center gap-3">
            <button
                type="button"
                data-birdsong-toggle
                onClick={toggle}
                aria-pressed={isPlaying}
                aria-label={label}
                title={label}
                className={`group relative flex h-12 w-12 items-center justify-center rounded-full shadow-xl ring-1 backdrop-blur transition duration-300 ease-smooth hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-leaf-500 ${
                    isPlaying ? 'bg-forest-800 text-cream-50 ring-forest-700' : 'bg-white/90 text-forest-800 ring-stone-200'
                }`}
            >
                {isPlaying && <span className="absolute inset-0 rounded-full bg-leaf-500/40 motion-safe:animate-ping" aria-hidden />}
                <Icon className="relative h-5 w-5" strokeWidth={1.8} aria-hidden />
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

            <Transition show={hint && !isPlaying}>
                <button
                    type="button"
                    data-birdsong-toggle
                    onClick={toggle}
                    className="rounded-full bg-white/95 px-4 py-2 text-xs font-medium text-forest-800 shadow-lg ring-1 ring-stone-200 backdrop-blur transition duration-500 ease-smooth hover:bg-white data-[closed]:opacity-0 motion-safe:data-[closed]:-translate-x-2"
                >
                    {isNight ? 'Hear the Nagala night' : 'Hear the birds of Nagala'}
                </button>
            </Transition>
        </div>
    );
}
