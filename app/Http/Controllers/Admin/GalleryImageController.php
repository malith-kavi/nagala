<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Admin\Concerns\ManagesUploads;
use App\Http\Controllers\Controller;
use App\Models\GalleryImage;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class GalleryImageController extends Controller
{
    use ManagesUploads;

    public function index(): Response
    {
        return Inertia::render('Admin/Gallery', [
            'images' => GalleryImage::with('cottage:id,name')->orderBy('sort_order')->latest('id')->get(),
            'categories' => GalleryImage::CATEGORIES,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'images' => ['required', 'array', 'max:30'],
            'images.*' => $this->imageRule(),
            'category' => ['required', Rule::in(GalleryImage::CATEGORIES)],
            'caption' => ['nullable', 'string', 'max:190'],
        ], $this->imageMessages());

        foreach ($request->file('images') as $file) {
            GalleryImage::create([
                'path' => $this->storeImage($file, 'gallery', 'images'),
                'category' => $data['category'],
                'caption' => $data['caption'] ?? null,
            ]);
        }

        return back()->with('success', count($data['images']).' image(s) uploaded.');
    }

    public function update(Request $request, GalleryImage $image): RedirectResponse
    {
        $image->update($request->validate([
            'caption' => ['nullable', 'string', 'max:190'],
            'category' => ['required', Rule::in(GalleryImage::CATEGORIES)],
            'sort_order' => ['nullable', 'integer'],
        ]));

        return back()->with('success', 'Image updated.');
    }

    public function destroy(GalleryImage $image): RedirectResponse
    {
        $image->delete();

        // A cottage's photo is still used on its cottage page, so only its gallery entry goes.
        if ($image->cottage_id) {
            return back()->with('success', 'Removed from the gallery. The photo is still on the cottage page.');
        }

        $this->deleteStored($image->path);

        return back()->with('success', 'Image deleted.');
    }
}
