<?php

namespace App\Http\Controllers;

use App\Models\Cottage;
use Inertia\Inertia;
use Inertia\Response;

class CottageController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Cottages/Index', [
            'cottages' => Cottage::active()->get()->makeHidden(Cottage::CARD_HIDDEN),
        ]);
    }

    public function show(string $slug): Response
    {
        $cottage = Cottage::active()->where('slug', $slug)->firstOrFail();

        return Inertia::render('Cottages/Show', [
            'cottage' => $cottage,
            'others' => Cottage::active()->whereKeyNot($cottage->id)->get()->makeHidden(Cottage::CARD_HIDDEN),
        ]);
    }
}
