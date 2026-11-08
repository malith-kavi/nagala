import Carousel from '@/Components/Site/Carousel';
import { CottageCard, PackageCard, PlaceCard } from '@/Components/Site/Cards';
import FeatureStrip from '@/Components/Site/FeatureStrip';
import { CottageLeaves } from '@/Components/Site/DesignFoliage';
import DriftingSky from '@/Components/Site/DriftingSky';
import TwinklingStars from '@/Components/Site/TwinklingStars';
import ImageWithFallback from '@/Components/Site/ImageWithFallback';
import PrefetchLink from '@/Components/Site/PrefetchLink';
import Reveal, { revealDelay } from '@/Components/Site/Reveal';
import SectionHeading from '@/Components/Site/SectionHeading';
import VideoModal from '@/Components/Site/VideoModal';
import SiteLayout from '@/Layouts/SiteLayout';
import { copies, heroSizes } from '@/lib/bundledImages.json';
import { usePage } from '@inertiajs/react';
import { ArrowRight, CalendarDays, Play } from 'lucide-react';
import { useState } from 'react';

// Each home section fills one screen below the 72px sticky navbar.
const screenSection = 'flex min-h-[calc(100svh-72px)] flex-col justify-center';
// The menu's Cottages, Nearby Places and Packages links scroll to these sections; this keeps
// the section top clear of the sticky navbar.
const menuSection = `scroll-mt-[72px] ${screenSection}`;

// The bundled hero photos are 1670px wide, but a phone shows only a narrow slice of the photo
// stretched to fill a tall screen, so it looked soft. Each one has WebP copies: the same photo,
// a 2x one made with an AI upscaler, and a 2500px one between them. The sunset one also has much
// smaller AVIF copies (the night one doesn't: AVIF loses its faintest stars). An uploaded hero has
// none and shows as uploaded. The copies and heroSizes (how wide the photo is drawn: the screen
// width, or on screens narrower than the photo, one screen's height minus the navbar times its
// 1670/942 aspect ratio) live in lib/bundledImages.json, which app.blade.php also reads to start
// downloading the same copy with the page.
export default function Home({ cottages, places, placesCount, packages, packagesCount }) {
    const { settings } = usePage().props;
    const [video, setVideo] = useState(false);

    return (
        <SiteLayout title="A Peaceful Getaway in Nature's Embrace">
            {/* Hero */}
            <section className={`relative isolate overflow-hidden ${screenSection}`}>
                <ImageWithFallback
                    src={settings.hero_image_url}
                    darkSrc={settings.hero_image_dark_url}
                    avifSrcSet={copies[settings.hero_image_url]?.avif}
                    webpSrcSet={copies[settings.hero_image_url]?.webp}
                    darkWebpSrcSet={copies[settings.hero_image_dark_url]?.webp}
                    sizes={heroSizes}
                    alt="Eco cottages beneath Nagala rock"
                    className="absolute inset-0 -z-20 h-full w-full"
                    loading="eager"
                    fetchPriority="high"
                />
                <DriftingSky
                    src={settings.hero_image_url}
                    hiddenInDarkMode={Boolean(settings.hero_image_dark_url)}
                    className="absolute inset-0 -z-20"
                />
                <TwinklingStars src={settings.hero_image_dark_url} className="absolute inset-0 -z-20" />
                <div className="absolute inset-0 -z-10 bg-gradient-to-r from-forest-950/65 via-forest-950/30 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 -z-10 h-40 bg-gradient-to-t from-forest-950/45 to-transparent" />

                <div className="mx-auto w-full max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
                    {/* The name, headline and button rise in one after another */}
                    <div className="max-w-2xl [text-shadow:0_2px_18px_rgba(4,20,12,0.55)]">
                        <p className="animate-fade-up text-xs font-semibold uppercase tracking-[0.3em] text-cream-100">Nagala Eco Cottage</p>
                        <h1 className="mt-4 animate-fade-up font-display text-5xl font-semibold leading-[1.05] text-white [animation-delay:120ms] sm:text-6xl lg:text-7xl">
                            A Peaceful Getaway <br className="hidden sm:block" />
                            in <span className="text-gold-400">Nature&rsquo;s Embrace</span>
                        </h1>

                        <div className="mt-8 flex animate-fade-up flex-wrap gap-4 [animation-delay:240ms]">
                            <PrefetchLink href={route('book')} className="btn-leaf">
                                <CalendarDays className="h-4 w-4" /> Book Your Stay <ArrowRight className="h-4 w-4" />
                            </PrefetchLink>
                            {/* <button type="button" onClick={() => setVideo(true)} className="btn-outline-light">
                                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-forest-900">
                                    <Play className="ml-0.5 h-3 w-3 fill-current" />
                                </span>
                                Watch Video
                            </button> */}
                        </div>
                    </div>
                </div>
            </section>



            {/* Cottages */}
            <section id="cottages" className={`relative overflow-hidden bg-gradient-to-b from-[#fbf9f2] to-[#f7f3e8] py-10 ${menuSection}`}>
                <CottageLeaves />
                <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
                    <SectionHeading
                        eyebrow="Our Stay Options"
                        title="Our Eco Cottages"
                    />
                    <div className="mt-8">
                        {/* All four cottages side by side; a carousel only if more are added later */}
                        {cottages.length > 4 ? (
                            <Carousel itemClassName="w-[85%] sm:w-[calc(50%-12px)] lg:w-[calc(25%-18px)]">
                                {cottages.map((c) => (
                                    <CottageCard key={c.id} cottage={c} className="h-full" />
                                ))}
                            </Carousel>
                        ) : (
                            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                                {cottages.map((c) => (
                                    <CottageCard key={c.id} cottage={c} />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* Experience Nagala + Packages share one background photo that stays pinned while their content scrolls over it */}
            <div className="relative isolate bg-[#0a1e12]">
                <div aria-hidden className="sticky top-[72px] -z-10 mb-[calc(72px-100svh)] h-[calc(100svh-72px)] overflow-hidden">
                    {/* A lazy, low-priority photo rather than a CSS background, which would download with the page at
                        the same priority as the hero. On wide screens it is close enough to load early anyway, but
                        after the hero. (Lowercase fetchpriority: React 18 doesn't know the prop yet.) */}
                    <picture>
                        <source type="image/avif" srcSet="/images/design/nearby-bg.avif" />
                        <img
                            src="/images/design/nearby-bg.webp"
                            alt=""
                            loading="lazy"
                            fetchpriority="low"
                            decoding="async"
                            className="absolute inset-0 h-full w-full object-cover"
                        />
                    </picture>
                    <div className="absolute inset-0 bg-gradient-to-b from-[#0a1e12]/55 via-[#0a1e12]/35 to-[#0a1e12]/70" />
                </div>

                {/* Experience Nagala */}
                <section id="places" className={`py-10 ${menuSection}`}>
                    <Reveal className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="reveal-item">
                            <SectionHeading
                                light
                                eyebrow="Explore Around"
                                title="Experience Nagala"
                                subtitle="More than just a stay – discover nature, culture and adventure."
                            />
                        </div>
                        <div className="mt-9 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                            {places.map((p, i) => (
                                <div key={p.id} className="reveal-item" style={revealDelay(150 + i * 100)}>
                                    <PlaceCard place={p} className="h-full" />
                                </div>
                            ))}
                        </div>
                        {placesCount > places.length && (
                            <div className="reveal-item mt-8 text-center" style={revealDelay(150 + places.length * 100)}>
                                <PrefetchLink href={route('places.index')} className="btn-outline-light">
                                    View all {placesCount} places <ArrowRight className="h-4 w-4" />
                                </PrefetchLink>
                            </div>
                        )}
                    </Reveal>
                </section>

                {/* Packages */}
                <section id="packages" className={`py-10 ${menuSection}`}>
                    <Reveal className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-12">
                        <div className="reveal-item">
                            <SectionHeading
                                light
                                eyebrow="Special Offers"
                                title="Packages & Offers"
                                subtitle="Special packages for couples, families and groups."
                            />
                        </div>
                        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {packages.map((p, i) => (
                                <div key={p.id} className="reveal-item" style={revealDelay(150 + i * 100)}>
                                    <PackageCard pkg={p} className="h-full" />
                                </div>
                            ))}
                        </div>
                        {packagesCount > packages.length && (
                            <div className="reveal-item mt-8 text-center" style={revealDelay(150 + packages.length * 100)}>
                                <PrefetchLink href={route('packages.index')} className="btn-outline-light">
                                    View all {packagesCount} packages <ArrowRight className="h-4 w-4" />
                                </PrefetchLink>
                            </div>
                        )}
                    </Reveal>
                </section>
            </div>

            <VideoModal show={video} onClose={() => setVideo(false)} url={settings.video_url} />
        </SiteLayout>
    );
}
