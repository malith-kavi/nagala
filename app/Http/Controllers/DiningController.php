<?php

namespace App\Http\Controllers;

use App\Models\MenuSection;
use Inertia\Inertia;
use Inertia\Response;

class DiningController extends Controller
{
    public function __invoke(): Response
    {
        return Inertia::render('Dining', [
            'meals' => MenuSection::byMeal(),
        ]);
    }
}
