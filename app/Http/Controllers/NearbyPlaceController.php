<?php

namespace App\Http\Controllers;

use App\Models\NearbyPlace;
use Inertia\Inertia;
use Inertia\Response;

class NearbyPlaceController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Places/Index', [
            'places' => NearbyPlace::active()->get(),
        ]);
    }

    public function show(string $slug): Response
    {
        $place = NearbyPlace::active()->where('slug', $slug)->firstOrFail();

        return Inertia::render('Places/Show', [
            'place' => $place,
            'others' => NearbyPlace::active()->whereKeyNot($place->id)->take(3)->get(),
        ]);
    }
}
