<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Admin\Concerns\ManagesUploads;
use App\Http\Controllers\Controller;
use App\Models\Cottage;
use App\Models\GalleryImage;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class CottageController extends Controller
{
    use ManagesUploads;

    public function index(): Response
    {
        return Inertia::render('Admin/Cottages/Index', [
            'cottages' => Cottage::withCount('bookings')->orderBy('sort_order')->orderBy('id')->get(),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Admin/Cottages/Form', ['cottage' => null, 'featureOptions' => Cottage::FEATURES]);
    }

    public function store(Request $request): RedirectResponse
    {
        $cottage = new Cottage;
        $this->save($request, $cottage);

        return redirect()->route('admin.cottages.index')->with('success', 'Cottage created.');
    }

    public function edit(Cottage $cottage): Response
    {
        return Inertia::render('Admin/Cottages/Form', ['cottage' => $cottage, 'featureOptions' => Cottage::FEATURES]);
    }

    public function update(Request $request, Cottage $cottage): RedirectResponse
    {
        $this->save($request, $cottage);

        return redirect()->route('admin.cottages.index')->with('success', 'Cottage updated.');
    }

    public function destroy(Cottage $cottage): RedirectResponse
    {
        if ($cottage->bookings()->exists()) {
            $cottage->update(['is_active' => false]);

            return back()->with('success', 'This cottage has bookings, so it was hidden instead of deleted.');
        }

        $this->deleteStored($cottage->cover_image);
        foreach ($cottage->images ?? [] as $path) {
            $this->deleteStored($path);
        }
        $cottage->delete();

        return back()->with('success', 'Cottage deleted.');
    }

    private function save(Request $request, Cottage $cottage): void
    {
        $before = $cottage->photoPaths();

        $data = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'slug' => ['nullable', 'string', 'max:140'],
            'short_description' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:10000'],
            'max_guests' => ['required', 'integer', 'min:1', 'max:20'],
            'beds' => ['nullable', 'string', 'max:120'],
            'features' => ['nullable', 'array'],
            // Older free-text entries already on this cottage may stay until the admin unticks them.
            'features.*' => ['string', Rule::in([...array_keys(Cottage::FEATURES), ...($cottage->features ?? [])])],
            'price_per_night' => ['required', 'integer', 'min:0'],
            'units' => ['required', 'integer', 'min:1', 'max:50'],
            'is_active' => ['boolean'],
            'sort_order' => ['nullable', 'integer'],
            'cover_image' => ['nullable', ...$this->imageRule()],
            ...$this->imageListRules(),
        ], $this->imageMessages());

        $this->savingPhotos(function () use ($request, $cottage, $data, $before) {
            $cottage->fill([
                ...collect($data)->except(['cover_image', 'new_images', 'remove_images', 'image_order', 'slug', 'features'])->all(),
                'slug' => $this->uniqueSlug(Cottage::class, ($data['slug'] ?? null) ?: $data['name'], $cottage->id),
                'features' => Cottage::orderFeatures($data['features'] ?? []),
                'sort_order' => $data['sort_order'] ?? 0,
            ]);

            $this->syncCoverImage($request, $cottage, 'cottages');
            $this->syncImages($request, $cottage, 'cottages');

            $cottage->save();
            $this->syncGallery($cottage, $before);
        });
    }

    /**
     * New cottage photos join the gallery; photos taken off the cottage (their files are deleted) leave it.
     * A photo the admin removed from the gallery stays out, since only newly added photos are added.
     */
    private function syncGallery(Cottage $cottage, array $before): void
    {
        $after = $cottage->photoPaths();
        $cottage->galleryImages()->whereIn('path', array_diff($before, $after))->delete();

        $inGallery = GalleryImage::whereIn('path', $after)->pluck('path')->all();
        foreach (array_diff($after, $before, $inGallery) as $path) {
            $cottage->galleryImages()->create(['path' => $path, 'caption' => $cottage->name, 'category' => 'cottages']);
        }
    }
}
