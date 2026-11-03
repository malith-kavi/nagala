<?php

namespace App\Http\Controllers;

use App\Models\Cabana;
use Inertia\Inertia;
use Inertia\Response;

class CabanaController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Cabanas/Index', [
            'cabanas' => Cabana::active()->get(),
        ]);
    }

    public function show(string $slug): Response
    {
        $cabana = Cabana::active()->where('slug', $slug)->firstOrFail();

        return Inertia::render('Cabanas/Show', [
            'cabana' => $cabana,
            'others' => Cabana::active()->whereKeyNot($cabana->id)->get(),
        ]);
    }
}
