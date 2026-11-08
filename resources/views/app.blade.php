@php
    // Public pages show a grey sketch of their layout while loading (partials/skeleton).
    $skeleton = match ($page['component']) {
        'Home' => 'home',
        'Cottages/Show', 'Packages/Show', 'Places/Show' => 'detail',
        'Book', 'Contact', 'Dining', 'Gallery', 'Cottages/Index', 'Packages/Index', 'Places/Index' => 'list',
        default => null,
    };

    // Stylesheets normally hold back the first paint until they download, which would hide the
    // sketch too. The sketch covers the page until they've arrived, so they needn't block.
    if ($skeleton) {
        \Illuminate\Support\Facades\Vite::useStyleTagAttributes(['media' => 'print', 'onload' => "this.media='all'"]);
    }
@endphp
<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="description" content="Nagala Eco Cottage – eco cottages surrounded by nature near Yapahuwa, Sri Lanka. Book your peaceful getaway.">
        <meta name="theme-color" content="#1f4d2b">
        <link rel="icon" href="{{ asset('favicon.ico') }}" sizes="any">
        <link rel="icon" type="image/png" href="{{ asset('favicon.png') }}">
        <link rel="apple-touch-icon" href="{{ asset('apple-touch-icon.png') }}">

        <title inertia>{{ config('app.name', 'Laravel') }}</title>

        <!-- Fonts -->
        <link rel="preconnect" href="https://fonts.bunny.net">
        @if ($skeleton)
            <link rel="preload" as="style" href="https://fonts.bunny.net/css?family=fredoka:500,600,700|nunito:400,500,600,700,800&display=swap">
            <link href="https://fonts.bunny.net/css?family=fredoka:500,600,700|nunito:400,500,600,700,800&display=swap" rel="stylesheet" media="print" onload="this.media='all';document.documentElement.dataset.fonts=1" />
        @else
            <link href="https://fonts.bunny.net/css?family=fredoka:500,600,700|nunito:400,500,600,700,800&display=swap" rel="stylesheet" />
        @endif

        <!-- Scripts -->
        @routes
        @viteReactRefresh
        @vite(['resources/js/app.jsx', "resources/js/Pages/{$page['component']}.jsx"])
        @inertiaHead
    </head>
    <body class="bg-cream-100 font-sans text-stone-800 antialiased">
        @if ($skeleton)
            @include('partials.skeleton')
        @endif
        @inertia
    </body>
</html>
