import CoverBox from '@/Components/Site/CoverBox';
import heroNightStars from '@/lib/heroNightStars';

// Star positions found in specific night photos. A different upload has no entry and stays still.
const STARS = {
    '/images/hero_d.jpg': { ratio: 1670 / 942, stars: heroNightStars },
};

// The brightest few also flash a soft four-point sparkle.
const SPARKLES = 14;

/**
 * Makes the stars of a night hero photo twinkle: each one gets a soft glow, sitting exactly on the
 * star in the photo, that brightens and fades at its own pace. Shown only in dark mode, where the
 * night photo is, and left out for visitors who prefer reduced motion.
 */
export default function TwinklingStars({ src, className = '' }) {
    const sky = STARS[src];
    if (!sky) return null;

    return (
        <CoverBox ratio={sky.ratio} className={`hidden motion-reduce:!hidden dark:block ${className}`}>
            {sky.stars.map(([x, y, brightness], i) => {
                // Steady pseudo-random timing per star, so they never pulse in step.
                const duration = 2.2 + ((i * 7919) % 97) / 97 * 3.8;
                const delay = -(((i * 104729) % 991) / 991) * duration;
                const sparkle = i < SPARKLES;
                const size = sparkle ? 0.9 : 0.16 + brightness * 0.16;

                return (
                    <span
                        key={i}
                        className="absolute aspect-square animate-twinkle"
                        style={{ left: `${x}%`, top: `${y}%`, width: `${size}%`, animationDuration: `${duration}s`, animationDelay: `${delay}s` }}
                    >
                        <span
                            className="absolute inset-0 rounded-full"
                            style={{
                                background: `radial-gradient(circle, #fff 0 ${sparkle ? 6 : 12}%, rgba(205, 222, 255, 0.55) ${sparkle ? 11 : 24}%, transparent ${sparkle ? 45 : 62}%)`,
                            }}
                        />
                        {sparkle && (
                            <>
                                <span className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-gradient-to-r from-transparent via-white to-transparent" />
                                <span className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-white to-transparent" />
                            </>
                        )}
                    </span>
                );
            })}
        </CoverBox>
    );
}
