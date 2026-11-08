const logos = {
    horizontal: { src: '/images/logo/nagala-logo.webp', light: '/images/logo/nagala-logo-light.webp', width: 710, height: 240 },
    stacked: { src: '/images/logo/nagala-logo-stacked.webp', light: '/images/logo/nagala-logo-stacked-light.webp', width: 512, height: 514 },
};

/**
 * Brand logo. `light` swaps to the cream/gold wordmark for dark backgrounds;
 * `stacked` uses the square emblem-over-wordmark version. Size it with a height class.
 * Pass loading="lazy" for a logo far down the page, such as the footer's.
 */
export default function ApplicationLogo({ light = false, stacked = false, className = 'h-14', loading }) {
    const logo = logos[stacked ? 'stacked' : 'horizontal'];

    return (
        <img
            src={light ? logo.light : logo.src}
            width={logo.width}
            height={logo.height}
            loading={loading}
            alt="Nagala Eco Cottage"
            className={`w-auto select-none ${className}`}
            draggable={false}
        />
    );
}
