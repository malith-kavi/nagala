<?php

namespace App\Http\Controllers;

use App\Models\GalleryImage;
use Inertia\Inertia;
use Inertia\Response;

class GalleryController extends Controller
{
    public function __invoke(): Response
    {
        return Inertia::render('Gallery', [
            'images' => GalleryImage::visible()->orderBy('sort_order')->latest('id')->get(),
            'categories' => GalleryImage::CATEGORIES,
        ]);
    }
}
