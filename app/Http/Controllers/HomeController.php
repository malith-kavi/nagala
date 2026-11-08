<?php

namespace App\Http\Controllers;

use App\Models\Cottage;
use App\Models\NearbyPlace;
use App\Models\Package;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    public function __invoke(): Response
    {
        return Inertia::render('Home', [
            'cottages' => Cottage::active()->get()->makeHidden(Cottage::CARD_HIDDEN),
            'places' => NearbyPlace::active()->take(4)->get()->makeHidden(NearbyPlace::CARD_HIDDEN),
            'placesCount' => NearbyPlace::active()->count(),
            'packages' => Package::active()->take(3)->get()->makeHidden(Package::CARD_HIDDEN),
            'packagesCount' => Package::active()->count(),
        ]);
    }
}
