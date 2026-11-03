import Carousel from '@/Components/Site/Carousel';
import { CabanaCard, PackageCard, PlaceCard } from '@/Components/Site/Cards';
import FeatureStrip from '@/Components/Site/FeatureStrip';
import { BannerLeaves, CabanaLeaves, mockupVw } from '@/Components/Site/DesignFoliage';
import ImageWithFallback from '@/Components/Site/ImageWithFallback';
import SectionHeading from '@/Components/Site/SectionHeading';
import VideoModal from '@/Components/Site/VideoModal';
import SiteLayout from '@/Layouts/SiteLayout';
import { Link, usePage } from '@inertiajs/react';
import { ArrowRight, CalendarDays, Play } from 'lucide-react';
import { useState } from 'react';

export default function Home({ cabanas, places, packages }) {
    const { settings } = usePage().props;
    const [video, setVideo] = useState(false);

    return (
        <SiteLayout title="A Peaceful Getaway in Nature's Embrace">
            {/* Hero */}
            <section className="relative isolate flex min-h-[88vh] items-center overflow-hidden">
                <ImageWithFallback
                    src={settings.hero_image_url}
                    alt="Nagala Eco Cottage cabanas beneath Nagala rock at sunset"
                    className="absolute inset-0 -z-20 h-full w-full"
                />
                <div className="absolute inset-0 -z-10 bg-gradient-to-r from-forest-950/85 via-forest-950/45 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 -z-10 h-40 bg-gradient-to-t from-forest-950/60 to-transparent" />

                <div className="mx-auto w-full max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
                    <div className="max-w-2xl animate-fade-up">
                        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cream-100">Nagala Eco Cottage</p>
                        <h1 className="mt-4 font-serif text-5xl font-semibold leading-[1.05] text-white sm:text-6xl lg:text-7xl">
                            A Peaceful Getaway <br className="hidden sm:block" />
                            in <span className="text-gold-400">Nature&rsquo;s Embrace</span>
                        </h1>
                        <p className="mt-6 max-w-xl text-base text-cream-100 sm:text-lg">
                            Experience the beauty of Nagala with comfortable eco cabanas, breathtaking views and serene surroundings.
                        </p>
                        <div className="mt-8 flex flex-wrap gap-4">
                            <Link href={route('book')} className="btn-leaf">
                                <CalendarDays className="h-4 w-4" /> Book Your Stay <ArrowRight className="h-4 w-4" />
                            </Link>
                            <button type="button" onClick={() => setVideo(true)} className="btn-outline-light">
                                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-forest-900">
                                    <Play className="ml-0.5 h-3 w-3 fill-current" />
                                </span>
                                Watch Video
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            <FeatureStrip />

            {/* Cabanas */}
            <section id="cabanas" className="relative overflow-hidden bg-gradient-to-b from-[#fbf9f2] to-[#f7f3e8] pb-4 pt-8">
                <CabanaLeaves />
                <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
                    <SectionHeading
                        eyebrow="Our Stay Options"
                        title="Our Eco Cabanas"
                        subtitle="Choose the perfect cabana for your stay surrounded by nature."
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

            {/* Experience Nagala */}
            <section
                className="bg-[#0a1e12] bg-[url('/images/design/experience-bg.jpg')] bg-[length:100%_auto] bg-top bg-no-repeat pb-2 pt-6 md:bg-[length:100%_100%]"
                style={{ minHeight: mockupVw(281) }}
            >
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <SectionHeading
                        light
                        eyebrow="Explore Around"
                        title="Experience Nagala"
                        subtitle="More than just a stay – discover nature, culture and adventure."
                    />
                    <div className="mt-9 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        {places.map((p) => (
                            <PlaceCard key={p.id} place={p} />
                        ))}
                    </div>
                </div>
            </section>

            {/* Packages */}
            <section
                className="bg-[#0a2013] bg-[url('/images/design/packages-bg.jpg')] bg-[length:100%_auto] bg-top bg-no-repeat pb-3 pt-2 md:bg-[length:100%_100%]"
                style={{ minHeight: mockupVw(237) }}
            >
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-12">
                    <SectionHeading
                        light
                        eyebrow="Special Offers"
                        title="Packages & Offers"
                        subtitle="Special packages for couples, families and groups."
                    />
                    <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {packages.map((p) => (
                            <PackageCard key={p.id} pkg={p} />
                        ))}
                    </div>
                </div>
            </section>

            {/* Video banner */}
            <section
                className="relative isolate flex items-center justify-center overflow-hidden py-10 text-center"
                style={{ minHeight: mockupVw(136) }}
            >
                <ImageWithFallback
                    src={settings.banner_image_url || settings.hero_image_url}
                    alt="Sunset over the mountains near Nagala"
                    className="absolute inset-0 -z-20 h-full w-full"
                />
                <BannerLeaves />
                <div className="absolute inset-0 -z-10 bg-forest-950/50" />
                <div className="px-4">
                    <p className="eyebrow">Natural Beauty • Culture • Adventure</p>
                    <h2 className="mt-2 font-serif text-4xl font-semibold text-white sm:text-5xl">Unwind. Explore. Reconnect.</h2>
                    <button
                        type="button"
                        onClick={() => setVideo(true)}
                        className="group mx-auto mt-8 flex flex-col items-center gap-3 text-sm font-medium text-white"
                    >
                        <span className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-white bg-white/10 backdrop-blur transition group-hover:scale-110 group-hover:bg-white group-hover:text-forest-900">
                            <Play className="ml-1 h-7 w-7 fill-current" />
                        </span>
                        Watch Our Video
                    </button>
                </div>
            </section>

            <VideoModal show={video} onClose={() => setVideo(false)} url={settings.video_url} />
        </SiteLayout>
    );
}
