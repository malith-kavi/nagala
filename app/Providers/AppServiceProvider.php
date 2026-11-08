<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // No Vite::prefetch(): after every page load it downloads the code of every page, admin
        // pages included, and the admin's 3 MB HEIC photo converter with them, about 3.2 MB in all.
        // On a weak signal that kept the connection busy for well over ten seconds, slowing the
        // visitor's next click or reload. Links fetch the page they lead to on hover or touch
        // instead (Components/Site/PrefetchLink.jsx and app.jsx).
    }
}
