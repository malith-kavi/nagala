import CoverBox from '@/Components/Site/CoverBox';

// Made for specific hero photos from the photo's sky:
// - light:    the sky blurred hard sideways, so it keeps the sunset colours but no cloud shapes
// - screen /
//   multiply: the clouds' brightening and darkening detail, tiling seamlessly side to side
// - mask:     opaque over the sky only, so the mountains, sun and cottages never move
// Recombined (light, then screen, then multiply) they reproduce the photo's sky; scrolling the two
// cloud layers moves the clouds through the still sunset light. A different hero upload has no
// entry, so it simply shows as a still photo.
const SKIES = {
    '/images/hero_l.jpg': {
        ratio: 1670 / 942,
        light: '/images/hero_l-sky-light.webp',
        screen: '/images/hero_l-clouds-screen.webp',
        multiply: '/images/hero_l-clouds-multiply.webp',
        mask: '/images/hero_l-sky-mask.png',
    },
};

const masked = (url) => ({
    maskImage: `url(${url})`,
    WebkitMaskImage: `url(${url})`,
    maskSize: '100% 100%',
    WebkitMaskSize: '100% 100%',
    maskRepeat: 'no-repeat',
    WebkitMaskRepeat: 'no-repeat',
});

/**
 * Clouds that keep drifting right to left across a hero photo. Lines up with an `object-cover`
 * image filling the same box. `seconds` is how long the clouds take to cross the photo's width.
 */
export default function DriftingSky({ src, seconds = 120, hiddenInDarkMode = false, className = '' }) {
    const sky = SKIES[src];
    if (!sky) return null;

    // Two tiles side by side, slid one tile's width per loop, so the clouds never jump back.
    const clouds = (image, blend) => (
        <div
            className="absolute inset-y-0 left-0 w-[200%] motion-safe:animate-cloud-flow"
            style={{
                backgroundImage: `url(${image})`,
                backgroundSize: '50% 100%',
                backgroundRepeat: 'repeat-x',
                mixBlendMode: blend,
                animationDuration: `${seconds}s`,
            }}
        />
    );

    return (
        <CoverBox
            ratio={sky.ratio}
            className={`${hiddenInDarkMode ? 'dark:hidden' : ''} ${className}`}
            style={{ isolation: 'isolate', ...masked(sky.mask) }}
        >
            <img src={sky.light} alt="" className="absolute inset-0 h-full w-full" />
            {clouds(sky.screen, 'screen')}
            {clouds(sky.multiply, 'multiply')}
        </CoverBox>
    );
}
