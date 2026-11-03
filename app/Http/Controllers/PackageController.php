<?php

namespace App\Http\Controllers;

use App\Models\Package;
use Inertia\Inertia;
use Inertia\Response;

class PackageController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Packages/Index', [
            'packages' => Package::active()->get(),
        ]);
    }

    public function show(string $slug): Response
    {
        $package = Package::active()->with('cabana')->where('slug', $slug)->firstOrFail();

        return Inertia::render('Packages/Show', [
            'package' => $package,
            'others' => Package::active()->whereKeyNot($package->id)->get(),
        ]);
    }
}
