<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Admin\Concerns\ManagesUploads;
use App\Http\Controllers\Controller;
use App\Models\NearbyPlace;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class NearbyPlaceController extends Controller
{
    use ManagesUploads;

    public function index(): Response
    {
        return Inertia::render('Admin/Places/Index', [
            'places' => NearbyPlace::orderBy('sort_order')->orderBy('id')->get(),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Admin/Places/Form', ['place' => null]);
    }

    public function store(Request $request): RedirectResponse
    {
        $this->save($request, new NearbyPlace);

        return redirect()->route('admin.places.index')->with('success', 'Place created.');
    }

    public function edit(NearbyPlace $place): Response
    {
        return Inertia::render('Admin/Places/Form', ['place' => $place]);
    }

    public function update(Request $request, NearbyPlace $place): RedirectResponse
    {
        $this->save($request, $place);

        return redirect()->route('admin.places.index')->with('success', 'Place updated.');
    }

    public function destroy(NearbyPlace $place): RedirectResponse
    {
        $this->deleteStored($place->cover_image);
        foreach ($place->images ?? [] as $path) {
            $this->deleteStored($path);
        }
        $place->delete();

        return back()->with('success', 'Place deleted.');
    }

    private function save(Request $request, NearbyPlace $place): void
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'slug' => ['nullable', 'string', 'max:140'],
            'distance_km' => ['nullable', 'numeric', 'min:0', 'max:9999'],
            'travel_minutes' => ['nullable', 'integer', 'min:0', 'max:1440'],
            'tagline' => ['nullable', 'string', 'max:120'],
            'short_description' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:10000'],
            'map_url' => ['nullable', 'url', 'max:1000'],
            'is_active' => ['boolean'],
            'sort_order' => ['nullable', 'integer'],
            'cover_image' => ['nullable', ...$this->imageRule()],
            'cover_credit' => ['nullable', 'string', 'max:255'],
            ...$this->imageListRules(),
        ], $this->imageMessages());

        $place->fill([
            ...collect($data)->except(['cover_image', 'new_images', 'remove_images', 'image_order', 'slug'])->all(),
            'slug' => $this->uniqueSlug(NearbyPlace::class, ($data['slug'] ?? null) ?: $data['name'], $place->id),
            'sort_order' => $data['sort_order'] ?? 0,
        ]);

        $this->syncCoverImage($request, $place, 'places');
        $this->syncImages($request, $place, 'places');

        // A new or removed photo shouldn't keep the previous photographer's credit.
        if ($place->isDirty('cover_image') && ! $place->isDirty('cover_credit')) {
            $place->cover_credit = null;
        }

        $place->save();
    }
}
