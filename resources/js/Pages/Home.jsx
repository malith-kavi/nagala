import Carousel from '@/Components/Site/Carousel';
import { CabanaCard, PackageCard, PlaceCard } from '@/Components/Site/Cards';
import FeatureStrip from '@/Components/Site/FeatureStrip';
import { CabanaLeaves } from '@/Components/Site/DesignFoliage';
import DriftingSky from '@/Components/Site/DriftingSky';
import TwinklingStars from '@/Components/Site/TwinklingStars';
import ImageWithFallback from '@/Components/Site/ImageWithFallback';
import Reveal, { revealDelay } from '@/Components/Site/Reveal';
import SectionHeading from '@/Components/Site/SectionHeading';
import VideoModal from '@/Components/Site/VideoModal';
import SiteLayout from '@/Layouts/SiteLayout';
import { Link, usePage } from '@inertiajs/react';
import { ArrowRight, CalendarDays, Play } from 'lucide-react';
import { useState } from 'react';

// Each home section fills one screen below the 72px sticky navbar.
const screenSection = 'flex min-h-[calc(100svh-72px)] flex-col justify-center';

export default function Home({ cabanas, places, packages }) {
    const { settings } = usePage().props;
    const [video, setVideo] = useState(false);

    return (
        <SiteLayout title="A Peaceful Getaway in Nature's Embrace">
            {/* Hero */}
            <section className={`relative isolate overflow-hidden ${screenSection}`}>
                <ImageWithFallback
                    src={settings.hero_image_url}
                    darkSrc={settings.hero_image_dark_url}
                    alt="Nagala Eco Cottage cabanas beneath Nagala rock"
                    className="absolute inset-0 -z-20 h-full w-full"
                    loading="eager"
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
                    <div className="max-w-2xl animate-fade-up [text-shadow:0_2px_18px_rgba(4,20,12,0.55)]">
                        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cream-100">Nagala Eco Cottage</p>
                        <h1 className="mt-4 font-display text-5xl font-semibold leading-[1.05] text-white sm:text-6xl lg:text-7xl">
                            A Peaceful Getaway <br className="hidden sm:block" />
                            in <span className="text-gold-400">Nature&rsquo;s Embrace</span>
                        </h1>

                        <div className="mt-8 flex flex-wrap gap-4">
                            <Link href={route('book')} className="btn-leaf">
                                <CalendarDays className="h-4 w-4" /> Book Your Stay <ArrowRight className="h-4 w-4" />
                            </Link>
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



            {/* Cabanas */}
            <section id="cabanas" className={`relative overflow-hidden bg-gradient-to-b from-[#fbf9f2] to-[#f7f3e8] py-10 ${screenSection}`}>
                <CabanaLeaves />
                <div className="relative mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
                    <SectionHeading
                        eyebrow="Our Stay Options"
                        title="Our Eco Cabanas"
                    />
                    <div className="mt-8">
                        {cabanas.length > 3 ? (
                            <Carousel>
                                {cabanas.map((c) => (
                                    <CabanaCard key={c.id} cabana={c} className="h-full" />
                                ))}
                            </Carousel>
                        ) : (
                            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                {cabanas.map((c) => (
                                    <CabanaCard key={c.id} cabana={c} />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* Experience Nagala + Packages share one background photo that stays pinned while their content scrolls over it */}
            <div className="relative isolate bg-[#0a1e12]">
                <div
                    aria-hidden
                    className="sticky top-[72px] -z-10 mb-[calc(72px-100svh)] h-[calc(100svh-72px)] bg-[url('/images/design/nearby-bg.jpg')] bg-cover bg-center"
                >
                    <div className="absolute inset-0 bg-gradient-to-b from-[#0a1e12]/55 via-[#0a1e12]/35 to-[#0a1e12]/70" />
                </div>

                {/* Experience Nagala */}
                <section className={`py-10 ${screenSection}`}>
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
                    </Reveal>
                </section>

                {/* Packages */}
                <section className={`py-10 ${screenSection}`}>
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
                    </Reveal>
                </section>
            </div>

            <VideoModal show={video} onClose={() => setVideo(false)} url={settings.video_url} />
        </SiteLayout>
    );
}
