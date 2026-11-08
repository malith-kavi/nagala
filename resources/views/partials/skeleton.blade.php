{{--
    A grey sketch of the page, shown the moment the HTML arrives. On a slow connection the app's
    code, styles, fonts and first photos take a while; the sketch shimmers until they're ready,
    then fades to reveal the page. Everything here is inline so it never waits on a download.

    $skeleton is the layout to sketch: 'home', 'list' (pages with a header band and cards)
    or 'detail' (a cottage, package or place page).
--}}
<style>
    html.sk-lock { overflow: hidden; }
    /* The page's entrance animations wait for the sketch to fade, so visitors still see them. */
    html.sk-lock .animate-fade-up { animation-play-state: paused; }

    #skeleton { position: fixed; inset: 0; z-index: 1000; overflow: hidden; background: #faf7ef; transition: opacity .6s ease, visibility .6s; }
    #skeleton.sk-out { opacity: 0; visibility: hidden; }
    #skeleton *, #skeleton *::after { box-sizing: border-box; }

    .sk { position: relative; display: block; overflow: hidden; border-radius: 6px; background: #e7e5e4; }
    .sk::after { content: ''; position: absolute; inset: 0; transform: translateX(-100%); background: linear-gradient(90deg, transparent, rgba(255, 255, 255, .65), transparent); animation: sk-shine 1.5s ease-in-out infinite; }
    @keyframes sk-shine { to { transform: translateX(100%); } }

    .sk-wrap { width: 100%; max-width: 1280px; margin: 0 auto; padding: 0 16px; }
    @media (min-width: 640px) { .sk-wrap { padding: 0 24px; } }
    @media (min-width: 1024px) { .sk-wrap { padding: 0 32px; } }

    /* Navbar */
    .sk-nav { height: 72px; background: #fff; box-shadow: 0 1px 2px rgba(0, 0, 0, .06); }
    .sk-nav .sk-wrap { display: flex; height: 100%; align-items: center; justify-content: space-between; gap: 24px; }
    .sk-logo { width: 132px; height: 44px; }
    .sk-links { display: none; gap: 32px; }
    .sk-links .sk { width: 58px; height: 12px; }
    .sk-btn { display: none; width: 132px; height: 40px; border-radius: 999px; }
    .sk-menu { width: 28px; height: 24px; }
    @media (min-width: 640px) { .sk-btn { display: block; } }
    @media (min-width: 1024px) { .sk-links { display: flex; } .sk-menu { display: none; } }

    /* Photo areas (hero, page header): a darker grey with lighter lines on top */
    .sk-band { display: flex; background: #cfcbc7; }
    .sk-band .sk { background: rgba(255, 255, 255, .5); }
    .sk-eyebrow { width: 150px; height: 12px; }
    .sk-h1 { height: 40px; margin-top: 16px; }
    .sk-text { height: 14px; margin-top: 12px; }
    @media (min-width: 640px) { .sk-h1 { height: 56px; } }

    /* Home: the full-screen hero */
    .sk-hero { height: calc(100vh - 72px); height: calc(100svh - 72px); align-items: center; }
    .sk-hero .sk-h1 { width: min(560px, 92%); }
    .sk-hero .sk-h1 + .sk-h1 { width: min(440px, 72%); }
    .sk-cta { width: 200px; height: 48px; margin-top: 32px; border-radius: 999px; }
    @media (min-width: 1024px) { .sk-hero .sk-h1 { height: 68px; } }
    @media (prefers-color-scheme: dark) {
        .sk-hero { background: #3a3937; }
        .sk-hero .sk { background: rgba(255, 255, 255, .14); }
        .sk-hero .sk::after { background: linear-gradient(90deg, transparent, rgba(255, 255, 255, .12), transparent); }
    }

    /* List pages: header band, then cards */
    .sk-header { min-height: 320px; align-items: flex-end; padding: 96px 0 56px; }
    .sk-header .sk-h1 { width: min(420px, 80%); }
    .sk-section { padding-top: 64px; }
    .sk-grid { display: grid; gap: 24px; grid-template-columns: 1fr; }
    @media (min-width: 640px) { .sk-grid { grid-template-columns: repeat(2, 1fr); } }
    @media (min-width: 1024px) { .sk-grid { grid-template-columns: repeat(4, 1fr); } }
    .sk-card { overflow: hidden; border-radius: 12px; background: #fff; box-shadow: 0 8px 30px rgba(20, 56, 32, .10); }
    .sk-card > .sk:first-child { aspect-ratio: 4 / 3; border-radius: 0; }
    .sk-card-body { padding: 20px; }
    .sk-card-body .sk + .sk { margin-top: 10px; }

    /* Detail pages: photo grid, then title */
    .sk-detail { max-width: 1152px; padding-top: 32px; }
    .sk-photos { display: grid; gap: 12px; margin-top: 16px; }
    .sk-photos > .sk { aspect-ratio: 16 / 10; border-radius: 12px; }
    .sk-thumbs { display: none; }
    @media (min-width: 640px) {
        .sk-photos { grid-template-columns: 1.2fr 1fr; height: 460px; }
        .sk-photos > .sk { aspect-ratio: auto; }
        .sk-thumbs { display: grid; grid-template-columns: 1fr 1fr; grid-template-rows: 1fr 1fr; gap: 8px; }
        .sk-thumbs .sk { border-radius: 8px; }
    }
    .sk-detail .sk-h1 { width: min(380px, 70%); margin-top: 40px; }

    @media (prefers-reduced-motion: reduce) {
        .sk::after { animation: none; display: none; }
        #skeleton { transition-duration: .2s; }
    }
</style>
<noscript><style>#skeleton { display: none; }</style></noscript>

<div id="skeleton" aria-hidden="true">
    <div class="sk-nav">
        <div class="sk-wrap">
            <span class="sk sk-logo"></span>
            <span class="sk-links">@for ($i = 0; $i < 7; $i++)<span class="sk"></span>@endfor</span>
            <span class="sk sk-btn"></span>
            <span class="sk sk-menu"></span>
        </div>
    </div>

    @if ($skeleton === 'home')
        <div class="sk-band sk-hero">
            <div class="sk-wrap">
                <span class="sk sk-eyebrow"></span>
                <span class="sk sk-h1"></span>
                <span class="sk sk-h1"></span>
                <span class="sk sk-cta"></span>
            </div>
        </div>
    @elseif ($skeleton === 'list')
        <div class="sk-band sk-header">
            <div class="sk-wrap">
                <span class="sk sk-eyebrow"></span>
                <span class="sk sk-h1"></span>
                <span class="sk sk-text" style="width: min(520px, 85%)"></span>
            </div>
        </div>
        <div class="sk-wrap sk-section">
            <div class="sk-grid">
                @for ($i = 0; $i < 4; $i++)
                    <div class="sk-card">
                        <span class="sk"></span>
                        <div class="sk-card-body">
                            <span class="sk" style="width: 70%; height: 18px"></span>
                            <span class="sk" style="width: 55%; height: 12px"></span>
                            <span class="sk" style="width: 45%; height: 12px"></span>
                            <span class="sk" style="height: 38px; margin-top: 20px"></span>
                        </div>
                    </div>
                @endfor
            </div>
        </div>
    @else
        <div class="sk-wrap sk-detail">
            <span class="sk" style="width: 110px; height: 14px"></span>
            <div class="sk-photos">
                <span class="sk"></span>
                <div class="sk-thumbs">@for ($i = 0; $i < 4; $i++)<span class="sk"></span>@endfor</div>
            </div>
            <span class="sk sk-h1"></span>
            <span class="sk sk-text" style="width: min(560px, 90%)"></span>
            <span class="sk sk-text" style="width: min(480px, 75%)"></span>
        </div>
    @endif
</div>

<script>
    (function () {
        var sketch = document.getElementById('skeleton');
        var root = document.documentElement;
        var start = Date.now();
        var renderedAt = 0;
        var fontsReady = false;
        var fontsRequested = false;
        // Once the page has rendered, wait at most this long for styles, fonts and photos.
        var MAX_WAIT_AFTER_RENDER = 5000;
        // Never keep the sketch up longer than this, even if the app fails to start.
        var MAX_WAIT = 20000;

        root.classList.add('sk-lock');

        function rendered() {
            var app = document.getElementById('app');
            return app && app.firstElementChild;
        }

        // The site's stylesheet gives the body its cream background.
        function styled() {
            var bg = getComputedStyle(document.body).backgroundColor;
            return bg && bg !== 'transparent' && bg !== 'rgba(0, 0, 0, 0)';
        }

        // The site's stylesheet declares the fonts; once it has arrived, load the two the page uses
        // (app.blade.php has usually started downloading them already).
        function fontsLoaded() {
            if (!fontsRequested && styled() && document.fonts) {
                fontsRequested = true;
                Promise.all([document.fonts.load('600 1em "Fredoka Variable"'), document.fonts.load('1em "Nunito Variable"')]).then(
                    function () { fontsReady = true; },
                    function () { fontsReady = true; }
                );
            }
            return fontsReady || !document.fonts;
        }

        // Photos visible without scrolling, such as the hero.
        function photosLoaded() {
            var images = document.querySelectorAll('#app img');
            for (var i = 0; i < images.length; i++) {
                var box = images[i].getBoundingClientRect();
                if (box.width && box.bottom > 0 && box.top < window.innerHeight && !images[i].complete) return false;
            }
            return true;
        }

        function reveal() {
            sketch.classList.add('sk-out');
            root.classList.remove('sk-lock');
            setTimeout(function () { sketch.remove(); }, 700);
        }

        (function check() {
            var now = Date.now();
            if (!renderedAt && rendered()) renderedAt = now;

            var ready = renderedAt && styled() && fontsLoaded() && photosLoaded();
            if (ready || (renderedAt && now - renderedAt > MAX_WAIT_AFTER_RENDER) || now - start > MAX_WAIT) {
                reveal();
            } else {
                setTimeout(check, 50);
            }
        })();
    })();
</script>
