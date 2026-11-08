<?php

namespace App\Http\Controllers;

use App\Models\Cottage;
use App\Models\Package;
use Inertia\Inertia;
use Inertia\Response;

class PackageController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Packages/Index', [
            'packages' => Package::active()->get()->makeHidden(Package::CARD_HIDDEN),
        ]);
    }

    public function show(string $slug): Response
    {
        $package = Package::active()->where('slug', $slug)->firstOrFail();

        return Inertia::render('Packages/Show', [
            'package' => $package,
            'cottages' => Cottage::active()->get()->makeHidden(Cottage::CARD_HIDDEN)->filter(fn (Cottage $c) => $package->fitsCottage($c))->values(),
            'others' => Package::active()->whereKeyNot($package->id)->get()->makeHidden(Package::CARD_HIDDEN),
        ]);
    }
}
