import { Transition } from '@headlessui/react';
import { Bird, Moon } from 'lucide-react';
import { useEffect, useState, useSyncExternalStore } from 'react';

// Recordings for the sunset hero (light mode) and for the night one (dark mode). Each plays for TURN seconds, then
// crossfades into the next. They are mastered to the same loudness; `level` evens out one that is not (birdsong is
// mono, which plays about 2.4 dB louder than the stereo ones). Sources and edits: public/audio/CREDITS.md.
const PLAYLISTS = {
    day: [{ src: '/audio/birdsong.m4a', level: 0.76 }, { src: '/audio/river.m4a' }, { src: '/audio/elephants.m4a' }],
    night: [{ src: '/audio/night.m4a' }, { src: '/audio/night-paddy.m4a' }, { src: '/audio/night-river.m4a' }],
};
const VOLUME = 0.35; // overall loudness, 0 to 1
const TURN = 90; // seconds each recording plays before the next takes over
const CROSSFADE = 8; // seconds two recordings overlap when one hands over to the next
const PREF_KEY = 'nagala:birdsong';
const HINT_KEY = 'nagala:birdsong-hint';

const AudioContextClass = typeof window !== 'undefined' ? window.AudioContext || window.webkitAudioContext : undefined;
const darkQuery = typeof window !== 'undefined' ? window.matchMedia('(prefers-color-scheme: dark)') : null;
const scene = () => (darkQuery?.matches ? 'night' : 'day');

// Fade shapes, rising from 0 to 1. A hand-over uses equal-power curves (sine in, cosine out), so the two recordings
// together keep the same loudness all the way through; a fade on its own eases in and out.
const HANDOVER = (t) => Math.sin((t * Math.PI) / 2);
const EASE = (t) => (1 - Math.cos(t * Math.PI)) / 2;
const STEPS = 40;

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

// Everything below lives for the whole visit, so the sound carries on across Inertia page changes.
let ctx = null;
const decks = [];
const resumeAt = new Map(); // where each recording left off, so it continues rather than starting over
const position = { day: 0, night: 0 }; // which recording of each playlist is up
let shown = scene();
let playing = false;
let held = false;
let generation = 0; // bumped by every change of what should be heard, so stale starts can tell they lost
let turnTimer = null;
let turnEnds = 0;
let turnLeft = TURN * 1000;
const listeners = new Set();

const notify = () => listeners.forEach((listener) => listener());
const audible = () => playing && !held && !document.hidden;
const currentTrack = () => PLAYLISTS[shown][position[shown]];

function setPlaying(value) {
    playing = value;
    notify();
}

// The sound runs through the Web Audio API rather than each player's own volume, which iPhones ignore and which can
// only be stepped from a timer. Three players: one fading in, one fading out, and one free in case the scene changes
// halfway through a hand-over.
function setup() {
    if (ctx) return;
    ctx = new AudioContextClass({ latencyHint: 'playback' });
    const master = ctx.createGain();
    master.gain.value = VOLUME;
    master.connect(ctx.destination);
    for (let i = 0; i < 3; i++) {
        const el = new Audio();
        el.loop = true;
        el.preload = 'none';
        const gain = ctx.createGain();
        gain.gain.value = 0;
        ctx.createMediaElementSource(el).connect(gain).connect(master);
        decks.push({ el, gain, track: null, fade: { from: 0, to: 0, start: 0, seconds: 1, shape: EASE }, timer: null });
    }
}

const progress = (fade, t) => (fade.to >= fade.from ? fade.shape(t) : 1 - fade.shape(1 - t));

// A deck's volume at `time`, worked out from its last fade, since browsers differ on what a gain reads mid-ramp.
function levelOf(deck, time) {
    const { fade } = deck;
    const t = Math.min(1, Math.max(0, (time - fade.start) / fade.seconds));
    return fade.from + (fade.to - fade.from) * progress(fade, t);
}

// Moves a deck's volume to `to` over `seconds`. The ramps are scheduled on the audio thread, so they stay smooth even
// while the page is busy or in the background; `then` runs once the fade is over.
function fade(deck, to, seconds, shape, then) {
    const now = ctx.currentTime;
    const from = levelOf(deck, now);
    deck.fade = { from, to, start: now, seconds: Math.max(seconds, 0.01), shape };
    const gain = deck.gain.gain;
    gain.cancelScheduledValues(now);
    gain.setValueAtTime(from, now);
    for (let i = 1; i <= STEPS; i++) {
        const t = i / STEPS;
        gain.linearRampToValueAtTime(from + (to - from) * progress(deck.fade, t), now + deck.fade.seconds * t);
    }
    clearTimeout(deck.timer);
    deck.timer = then ? setTimeout(then, deck.fade.seconds * 1000 + 50) : null;
}

function park(deck) {
    clearTimeout(deck.timer);
    if (deck.track) resumeAt.set(deck.track, deck.el.currentTime);
    deck.el.pause();
}

// Fades `track` in and everything else out. A deck that already has the track just turns back up; otherwise the
// quietest deck loads it. The fades start only once it is actually playing, so a slow download never leaves a gap.
// Resolves true if this is still what should be heard by then.
function bring(track, seconds, shape) {
    const id = ++generation;
    let deck = decks.find((d) => d.track === track);
    if (!deck) {
        const now = ctx.currentTime;
        deck = decks.reduce((quietest, d) => (levelOf(d, now) < levelOf(quietest, now) ? d : quietest));
        if (deck.track) park(deck);
        deck.track = track;
        const at = resumeAt.get(track);
        deck.el.src = at ? `${track.src}#t=${at.toFixed(1)}` : track.src;
    }
    return deck.el.play().then(() => {
        if (id !== generation) return false;
        decks.forEach((d) => {
            if (d === deck) fade(d, track.level ?? 1, seconds, shape);
            else if (!d.el.paused) fade(d, 0, seconds, shape, () => park(d));
        });
        return true;
    });
}

function silence(seconds) {
    generation++;
    pauseTurn();
    decks.forEach((d) => {
        if (!d.el.paused) fade(d, 0, seconds, EASE, () => park(d));
    });
}

function schedule() {
    clearTimeout(turnTimer);
    turnEnds = Date.now() + turnLeft;
    turnTimer = setTimeout(advance, turnLeft);
}

function pauseTurn() {
    if (!turnTimer) return;
    clearTimeout(turnTimer);
    turnTimer = null;
    turnLeft = Math.max(0, turnEnds - Date.now());
}

function newTurn() {
    clearTimeout(turnTimer);
    turnTimer = null;
    turnLeft = TURN * 1000;
}

function playCurrent(seconds, shape) {
    return bring(currentTrack(), seconds, shape).then(
        (current) => current && schedule(),
        (error) => {
            // A recording that won't load: keep what is playing and move on at the next turn.
            if (audible()) schedule();
            throw error;
        },
    );
}

function advance() {
    turnTimer = null;
    if (!audible()) return;
    position[shown] = (position[shown] + 1) % PLAYLISTS[shown].length;
    newTurn();
    playCurrent(CROSSFADE, HANDOVER).catch(() => {});
}

// Picks up again after a pause, e.g. a video or a background tab.
function wake(seconds) {
    if (!ctx) {
        begin(seconds).catch(() => setPlaying(false));
        return;
    }
    if (ctx.state !== 'running') ctx.resume().catch(() => {});
    playCurrent(seconds, EASE).catch(() => {});
}

// Starts the sound. Browsers allow it only once the visitor has interacted with the page, so this runs again on
// clicks, taps and key presses until it works; everything that needs that permission is set off right here.
function begin(seconds) {
    setup();
    const allowed = ctx.state === 'running' || Promise.race([ctx.resume(), new Promise((r) => setTimeout(r, 1000))]);
    // iOS lets a player start by itself later (at the next turn) only if it was started once during a tap.
    decks.forEach((d) => {
        if (!d.el.paused) return;
        d.el.play().catch(() => {});
        d.el.pause();
    });
    return Promise.all([allowed, playCurrent(seconds, EASE)]).then(() => {
        if (ctx.state === 'running') return;
        silence(0.1);
        throw new Error('Sound is not allowed before the visitor interacts with the page');
    });
}

function start() {
    setPlaying(true);
    if (held || document.hidden) return;
    begin(2.5).catch(() => setPlaying(false));
}

function stop() {
    setPlaying(false);
    silence(1.2);
}

// Let other sound (e.g. the video modal) take over, then bring the background sound back.
export function holdBirdsong(hold) {
    held = hold;
    if (!playing || document.hidden) return;
    if (hold) silence(0.6);
    else wake(1.5);
}

if (AudioContextClass) {
    // Fade out in a background tab; pick up again when the visitor returns.
    document.addEventListener('visibilitychange', () => {
        if (!playing || held) return;
        if (document.hidden) silence(0.4);
        else wake(1.5);
    });

    // Crossfade to the other scene's sound when the device switches between light and dark mode.
    darkQuery.addEventListener('change', () => {
        notify();
        if (shown === scene()) return;
        shown = scene();
        newTurn();
        if (audible() && ctx) playCurrent(4, HANDOVER).catch(() => {});
    });

    // The sound is on unless the visitor turned it off. If the first try is refused, try again on each click, tap or
    // key press until it plays. Once it plays, a tap also restarts it if the phone suspended it (lock screen, calls).
    const interact = (event) => {
        if (event.target.closest?.('[data-birdsong-toggle]')) return; // the toggle and its hint handle their own clicks
        if (held || document.hidden) return;
        if (playing) {
            if (ctx?.state !== 'running') wake(1);
            return;
        }
        if (storage.get(PREF_KEY) === 'off') return;
        begin(3).then(
            () => setPlaying(true),
            () => {},
        );
    };
    ['pointerdown', 'pointerup', 'touchend', 'keydown'].forEach((type) => window.addEventListener(type, interact, true));
    if (storage.get(PREF_KEY) !== 'off' && !document.hidden) {
        begin(3).then(
            () => setPlaying(true),
            () => {},
        );
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

    if (!AudioContextClass) return null;

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
    const sound = isNight ? 'night sounds' : 'nature sounds';
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
