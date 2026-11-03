// Decorative foliage drawn as SVG so it stays sharp at every size and has a transparent background.
// Sizes and offsets are given in pixels of the 613px-wide design mockup and scale with the viewport,
// so the foliage keeps the same proportions as the design at every screen width.
import { useId } from 'react';

const MOCKUP_WIDTH = 613;

export const mockupVw = (px) => `${((px / MOCKUP_WIDTH) * 100).toFixed(3)}vw`;

const PALETTES = {
    fern: { base: '#173f1f', mid: '#2c6a2d', tip: '#5e9442', sheen: '#9cc57a', rib: '#2a4d22', vein: '#b9d79a' },
    pale: { base: '#a7bd94', mid: '#c9d8b6', tip: '#e5edd8', sheen: '#ffffff', rib: '#b3c3a0', vein: '#f3f7ec' },
    shadow: { base: '#06140a', mid: '#0f2c15', tip: '#24502a', sheen: '#5d8c44', rib: '#0b1f0f', vein: '#3f6c33' },
    bright: { base: '#1d5524', mid: '#3a8733', tip: '#7dbb57', sheen: '#bfe39a', rib: '#24521f', vein: '#a6d483' },
};

// Small deterministic PRNG so the same seed always draws the same plant.
function random(seed) {
    let s = seed % 2147483647 || 1;
    return () => (s = (s * 16807) % 2147483647) / 2147483647;
}

// Point and heading (degrees) along a quadratic curve from (0,0) to (length,0) bowed by `bend`.
function along(length, bend, t) {
    const [cx, cy] = [length / 2, -bend];
    const u = 1 - t;
    return {
        x: 2 * u * t * cx + t * t * length,
        y: 2 * u * t * cy,
        angle: (Math.atan2(2 * u * cy + 2 * t * (0 - cy), 2 * u * cx + 2 * t * (length - cx)) * 180) / Math.PI,
    };
}

// A pointed leaf lying along +x, its tip curling `curl` units sideways.
function Leaf({ length: l, width: w, curl = 0, palette, gradient, veins = 0 }) {
    const outline = `M0 0C${l * 0.22} ${-w} ${l * 0.62} ${-w * 0.95} ${l} ${curl}C${l * 0.62} ${w * 0.75 + curl * 0.4} ${l * 0.22} ${w * 0.85} 0 0Z`;
    const upperHalf = `M0 0C${l * 0.22} ${-w} ${l * 0.62} ${-w * 0.95} ${l} ${curl}Q${l * 0.5} ${curl * 0.35} 0 0Z`;
    const midrib = `M0 0Q${l * 0.5} ${curl * 0.35} ${l} ${curl}`;

    return (
        <>
            <path d={outline} fill={`url(#${gradient})`} />
            <path d={upperHalf} fill={palette.sheen} opacity="0.22" />
            <path d={midrib} fill="none" stroke={palette.vein} strokeWidth={Math.max(0.5, w * 0.09)} strokeLinecap="round" opacity="0.8" />
            {Array.from({ length: veins }, (_, i) => {
                const t = 0.12 + (0.62 * i) / veins;
                const x = l * t;
                const y = curl * t * t * 0.35;
                const reach = w * 0.62 * (1 - t);
                return (
                    <path
                        key={i}
                        d={`M${x} ${y}Q${x + l * 0.06} ${y - reach * 0.6} ${x + l * 0.13} ${y - reach}M${x} ${y}Q${x + l * 0.06} ${y + reach * 0.5} ${x + l * 0.13} ${y + reach * 0.85}`}
                        fill="none"
                        stroke={palette.vein}
                        strokeWidth={Math.max(0.35, w * 0.04)}
                        opacity="0.45"
                    />
                );
            })}
        </>
    );
}

// Pinnate frond: a curved rib with paired leaflets that shrink toward the tip.
function Frond({ x, y, rotate, length, bend = 0, pairs = 12, leaf = 50, width = 9, spread = 54, palette, gradient, seed = 1, opacity = 1 }) {
    const rnd = random(seed);
    const leaflets = [];

    for (let i = 0; i < pairs; i++) {
        const t = 0.05 + (0.92 * i) / pairs;
        const p = along(length, bend, t);
        const size = Math.max(0.28, Math.sin(Math.PI * (0.22 + 0.72 * t)));
        for (const side of [-1, 1]) {
            const l = leaf * size * (0.9 + rnd() * 0.2);
            leaflets.push(
                <g
                    key={`${i}${side}`}
                    transform={`translate(${p.x} ${p.y}) rotate(${p.angle + side * (spread - 24 * t + rnd() * 10)}) scale(1 ${-side})`}
                    opacity={0.82 + rnd() * 0.18}
                >
                    <Leaf length={l} width={width * size} curl={l * (0.12 + rnd() * 0.1)} palette={palette} gradient={gradient} />
                </g>,
            );
        }
    }
    const tip = along(length, bend, 1);

    return (
        <g transform={`translate(${x} ${y}) rotate(${rotate})`} opacity={opacity}>
            <path d={`M0 0Q${length / 2} ${-bend} ${length} 0`} fill="none" stroke={palette.rib} strokeWidth={width * 0.22} strokeLinecap="round" />
            {leaflets}
            <g transform={`translate(${tip.x} ${tip.y}) rotate(${tip.angle - 4})`}>
                <Leaf length={leaf * 0.42} width={width * 0.5} curl={leaf * 0.05} palette={palette} gradient={gradient} />
            </g>
        </g>
    );
}

// Stem with broad alternating leaves, like the sprigs in the footer.
function Sprig({ x, y, rotate, length, bend = 0, leaves = 6, leaf = 40, palette, gradient, seed = 1, opacity = 1 }) {
    const rnd = random(seed);

    return (
        <g transform={`translate(${x} ${y}) rotate(${rotate})`} opacity={opacity}>
            <path d={`M0 0Q${length / 2} ${-bend} ${length} 0`} fill="none" stroke={palette.rib} strokeWidth={leaf * 0.06} strokeLinecap="round" />
            {Array.from({ length: leaves }, (_, i) => {
                const t = 0.18 + (0.82 * i) / leaves;
                const p = along(length, bend, t);
                const side = i % 2 ? 1 : -1;
                const l = leaf * (1 - t * 0.35) * (0.9 + rnd() * 0.2);
                return (
                    <g key={i} transform={`translate(${p.x} ${p.y}) rotate(${p.angle + side * (38 + rnd() * 14)}) scale(1 ${-side})`}>
                        <Leaf length={l} width={l * 0.36} curl={l * 0.08} palette={palette} gradient={gradient} veins={4} />
                    </g>
                );
            })}
            <g transform={`translate(${length} 0) rotate(${along(length, bend, 1).angle})`}>
                <Leaf length={leaf * 0.8} width={leaf * 0.27} curl={leaf * 0.05} palette={palette} gradient={gradient} veins={3} />
            </g>
        </g>
    );
}

// Fine-line botanical branch for the pencil-sketch look around section headings.
function SketchBranch({ x, y, rotate, length, bend = 0, leaves = 7, leaf = 26, seed = 1, color = '#6f7d5c', opacity = 0.8 }) {
    const rnd = random(seed);

    return (
        <g transform={`translate(${x} ${y}) rotate(${rotate})`} fill="none" stroke={color} strokeLinecap="round" strokeLinejoin="round" opacity={opacity}>
            <path d={`M0 0Q${length / 2} ${-bend} ${length} 0`} strokeWidth="0.8" />
            {Array.from({ length: leaves }, (_, i) => {
                const t = 0.12 + (0.86 * i) / leaves;
                const p = along(length, bend, t);
                const side = i % 2 ? 1 : -1;
                const l = leaf * (1 - t * 0.3) * (0.85 + rnd() * 0.3);
                const w = l * 0.24;
                const stalk = l * 0.12;
                return (
                    <g key={i} transform={`translate(${p.x} ${p.y}) rotate(${p.angle + side * (40 + rnd() * 18)})`}>
                        <path d={`M0 0L${stalk} 0`} strokeWidth="0.6" />
                        <path
                            d={`M${stalk} 0C${stalk + l * 0.2} ${-w} ${stalk + l * 0.62} ${-w * 1.05} ${stalk + l} ${w * 0.15}C${stalk + l * 0.66} ${w * 0.8} ${stalk + l * 0.22} ${w * 0.95} ${stalk} 0Z`}
                            fill="#dfe8cf"
                            fillOpacity="0.3"
                            strokeWidth="0.55"
                        />
                        <path d={`M${stalk} 0Q${stalk + l * 0.5} ${w * 0.05} ${stalk + l * 0.94} ${w * 0.14}`} strokeWidth="0.4" opacity="0.7" />
                        {[0.25, 0.42, 0.6].map((v) => (
                            <path
                                key={v}
                                d={`M${stalk + l * v} ${w * 0.02}L${stalk + l * (v + 0.1)} ${-w * 0.5 * (1.1 - v)}M${stalk + l * v} ${w * 0.04}L${stalk + l * (v + 0.1)} ${w * 0.5 * (1.1 - v)}`}
                                strokeWidth="0.3"
                                opacity="0.55"
                            />
                        ))}
                    </g>
                );
            })}
            {Array.from({ length: 4 }, (_, i) => {
                const p = along(length, bend, 0.97);
                const a = ((p.angle + (i - 1.5) * 22) * Math.PI) / 180;
                const r = leaf * (0.35 + rnd() * 0.25);
                return (
                    <g key={`bud${i}`}>
                        <path d={`M${p.x} ${p.y}L${p.x + Math.cos(a) * r} ${p.y + Math.sin(a) * r}`} strokeWidth="0.4" />
                        <circle cx={p.x + Math.cos(a) * r} cy={p.y + Math.sin(a) * r} r="1.1" fill={color} stroke="none" />
                    </g>
                );
            })}
        </g>
    );
}

// Shared <svg> wrapper: one leaf gradient per palette, unique to this instance.
function Plant({ viewBox, width, flip = false, className = '', style = {}, children }) {
    const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
    const gradient = (name) => `${uid}${name}`;

    return (
        <svg
            viewBox={viewBox}
            aria-hidden
            focusable="false"
            className={`pointer-events-none absolute h-auto select-none ${flip ? '-scale-x-100' : ''} ${className}`}
            style={{ width: mockupVw(width), ...style }}
        >
            <defs>
                {Object.entries(PALETTES).map(([name, p]) => (
                    <linearGradient key={name} id={gradient(name)} x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0" stopColor={p.base} />
                        <stop offset="0.55" stopColor={p.mid} />
                        <stop offset="1" stopColor={p.tip} />
                    </linearGradient>
                ))}
            </defs>
            {children((name) => ({ palette: PALETTES[name], gradient: gradient(name) }))}
        </svg>
    );
}

// Fern cluster spilling in from the left edge (flip for the right edge).
function FernCorner({ seed, tone = 'fern', back = 'pale', ...props }) {
    return (
        <Plant viewBox="0 0 240 344" {...props}>
            {(paint) => (
                <>
                    <Frond {...paint(back)} seed={seed} x={-30} y={20} rotate={-12} length={250} bend={22} pairs={16} leaf={48} width={7.5} spread={62} />
                    <Frond {...paint(back)} seed={seed + 1} x={-40} y={150} rotate={8} length={190} bend={-14} pairs={13} leaf={40} width={6.5} opacity={0.8} />
                    <Frond {...paint(tone)} seed={seed + 2} x={-26} y={70} rotate={32} length={240} bend={26} pairs={13} leaf={74} width={12} spread={52} />
                    <Frond {...paint(tone)} seed={seed + 3} x={-20} y={-30} rotate={58} length={250} bend={30} pairs={12} leaf={70} width={12} spread={50} />
                    <Frond {...paint(tone)} seed={seed + 4} x={-30} y={210} rotate={50} length={170} bend={18} pairs={10} leaf={56} width={10} />
                </>
            )}
        </Plant>
    );
}

// Botanical line drawing that frames a section heading.
function SketchCorner({ seed, ...props }) {
    return (
        <Plant viewBox="0 0 300 260" {...props}>
            {() => (
                <>
                    <SketchBranch seed={seed} x={-10} y={120} rotate={-14} length={290} bend={34} leaves={9} leaf={46} />
                    <SketchBranch seed={seed + 1} x={-10} y={40} rotate={8} length={170} bend={-18} leaves={6} leaf={36} color="#8b977a" opacity={0.6} />
                    <SketchBranch seed={seed + 2} x={-6} y={210} rotate={-36} length={140} bend={16} leaves={5} leaf={36} color="#8b977a" opacity={0.6} />
                </>
            )}
        </Plant>
    );
}

// Fronds rising from a bottom corner.
function RisingFerns({ seed, tone = 'fern', ...props }) {
    return (
        <Plant viewBox="0 0 120 320" {...props}>
            {(paint) => (
                <>
                    <Frond {...paint('pale')} seed={seed} x={-10} y={330} rotate={-62} length={240} bend={-20} pairs={14} leaf={44} width={7} />
                    <Frond {...paint(tone)} seed={seed + 1} x={-20} y={330} rotate={-78} length={250} bend={-30} pairs={13} leaf={58} width={10} spread={52} />
                    <Frond {...paint(tone)} seed={seed + 2} x={-30} y={330} rotate={-42} length={170} bend={-16} pairs={10} leaf={50} width={9} />
                </>
            )}
        </Plant>
    );
}

// Dark tropical foliage framing a photo banner.
function ShadowCorner({ seed, ...props }) {
    return (
        <Plant viewBox="0 0 250 272" {...props}>
            {(paint) => (
                <>
                    <Sprig {...paint('shadow')} seed={seed} x={-20} y={30} rotate={12} length={170} bend={16} leaves={7} leaf={46} opacity={0.9} />
                    <Frond {...paint('shadow')} seed={seed + 1} x={-30} y={290} rotate={-48} length={260} bend={-30} pairs={14} leaf={70} width={12} spread={52} />
                    <Frond {...paint('shadow')} seed={seed + 2} x={-20} y={300} rotate={-18} length={190} bend={-16} pairs={11} leaf={56} width={10} opacity={0.85} />
                    <Sprig {...paint('shadow')} seed={seed + 3} x={-10} y={280} rotate={-70} length={150} bend={-14} leaves={6} leaf={40} />
                </>
            )}
        </Plant>
    );
}

// Bright leafy sprigs for the footer corners.
function SprigCorner({ seed, ...props }) {
    return (
        <Plant viewBox="0 0 220 180" {...props}>
            {(paint) => (
                <>
                    <Sprig {...paint('fern')} seed={seed} x={-10} y={190} rotate={-58} length={170} bend={-14} leaves={7} leaf={34} opacity={0.75} />
                    <Sprig {...paint('bright')} seed={seed + 1} x={-10} y={185} rotate={-24} length={200} bend={-18} leaves={8} leaf={40} />
                    <Sprig {...paint('bright')} seed={seed + 2} x={-14} y={150} rotate={-82} length={150} bend={10} leaves={6} leaf={32} opacity={0.9} />
                </>
            )}
        </Plant>
    );
}

export function StripLeaves() {
    return (
        <>
            <FernCorner seed={11} width={60} className="left-0 top-0" />
            <FernCorner seed={47} width={61} flip className="right-0 top-0" />
        </>
    );
}

export function CabanaLeaves() {
    return (
        <>
            <SketchCorner seed={5} width={150} className="left-0 top-0" />
            <SketchCorner seed={29} width={155} flip className="right-0 top-0" />
            <RisingFerns seed={71} width={36} className="bottom-0 left-0" />
            <RisingFerns seed={93} width={32} flip className="bottom-0 right-0" />
        </>
    );
}

// Sits between the banner photo and its tint so the tint unifies them.
export function BannerLeaves() {
    return (
        <>
            <ShadowCorner seed={3} width={125} className="bottom-0 left-0 -z-10" />
            <ShadowCorner seed={17} width={90} flip className="bottom-0 right-0 -z-10" />
        </>
    );
}

export function FooterLeaves() {
    return (
        <>
            <SprigCorner seed={8} width={80} className="bottom-0 left-0" />
            <SprigCorner seed={21} width={80} flip className="bottom-0 right-0" />
        </>
    );
}
