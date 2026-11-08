<?php

namespace App\Http\Controllers;

use App\Services\ImageOptimizer;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

/**
 * Makes a smaller copy of an uploaded photo the first time it's asked for, when the photo was
 * uploaded before that copy size was added to the site (see ImageOptimizer::VARIANTS). Uploads
 * live in public/uploads, so the web server serves files that exist without reaching Laravel;
 * only a missing copy ends up here, once. Without this, pages would ask for copies that don't
 * exist and fall back to the full-size photo until `php artisan images:optimize` had been run.
 */
class PhotoCopyController extends Controller
{
    public function __invoke(string $path, ImageOptimizer $optimizer): BinaryFileResponse
    {
        $disk = Storage::disk('uploads');
        $photo = $optimizer->photoOf($path);
        abort_unless($photo && $disk->exists($photo), 404);

        $optimizer->completeVariants($photo);

        return response()->file($disk->path($path), [
            'Content-Type' => 'image/'.$optimizer->extension(),
            'Cache-Control' => 'public, max-age=31536000, immutable',
        ]);
    }
}
