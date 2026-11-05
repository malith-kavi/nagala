<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Admin\Concerns\ManagesUploads;
use App\Http\Controllers\Controller;
use App\Models\Cabana;
use App\Models\GalleryImage;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class CabanaController extends Controller
{
    use ManagesUploads;

    public function index(): Response
    {
        return Inertia::render('Admin/Cabanas/Index', [
            'cabanas' => Cabana::withCount('bookings')->orderBy('sort_order')->orderBy('id')->get(),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Admin/Cabanas/Form', ['cabana' => null, 'featureOptions' => Cabana::FEATURES]);
    }

    public function store(Request $request): RedirectResponse
    {
        $cabana = new Cabana;
        $this->save($request, $cabana);

        return redirect()->route('admin.cabanas.index')->with('success', 'Cabana created.');
    }

    public function edit(Cabana $cabana): Response
    {
        return Inertia::render('Admin/Cabanas/Form', ['cabana' => $cabana, 'featureOptions' => Cabana::FEATURES]);
    }

    public function update(Request $request, Cabana $cabana): RedirectResponse
    {
        $this->save($request, $cabana);

        return redirect()->route('admin.cabanas.index')->with('success', 'Cabana updated.');
    }

    public function destroy(Cabana $cabana): RedirectResponse
    {
        if ($cabana->bookings()->exists()) {
            $cabana->update(['is_active' => false]);

            return back()->with('success', 'This cabana has bookings, so it was hidden instead of deleted.');
        }

        $this->deleteStored($cabana->cover_image);
        foreach ($cabana->images ?? [] as $path) {
            $this->deleteStored($path);
        }
        $cabana->delete();

        return back()->with('success', 'Cabana deleted.');
    }

    private function save(Request $request, Cabana $cabana): void
    {
        $before = $cabana->photoPaths();

        $data = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'slug' => ['nullable', 'string', 'max:140'],
            'short_description' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:10000'],
            'max_guests' => ['required', 'integer', 'min:1', 'max:20'],
            'beds' => ['nullable', 'string', 'max:120'],
            'features' => ['nullable', 'array'],
            // Older free-text entries already on this cabana may stay until the admin unticks them.
            'features.*' => ['string', Rule::in([...array_keys(Cabana::FEATURES), ...($cabana->features ?? [])])],
            'price_per_night' => ['required', 'integer', 'min:0'],
            'units' => ['required', 'integer', 'min:1', 'max:50'],
            'is_active' => ['boolean'],
            'sort_order' => ['nullable', 'integer'],
            'cover_image' => ['nullable', 'image', 'max:8192'],
            'new_images' => ['nullable', 'array'],
            'new_images.*' => ['image', 'max:8192'],
            'remove_images' => ['nullable', 'array'],
            'image_order' => ['nullable', 'array'],
            'image_order.*' => ['string'],
        ]);

        $cabana->fill([
            ...collect($data)->except(['cover_image', 'new_images', 'remove_images', 'image_order', 'slug', 'features'])->all(),
            'slug' => $this->uniqueSlug(Cabana::class, ($data['slug'] ?? null) ?: $data['name'], $cabana->id),
            'features' => Cabana::orderFeatures($data['features'] ?? []),
            'sort_order' => $data['sort_order'] ?? 0,
        ]);

        $this->syncCoverImage($request, $cabana, 'cabanas');

        $kept = collect($cabana->images ?? []);
        $remove = $data['remove_images'] ?? [];
        $kept->filter(fn ($p) => in_array($p, $remove, true))->each(fn ($p) => $this->deleteStored($p));
        $kept = $kept->reject(fn ($p) => in_array($p, $remove, true))->values();
        $uploaded = collect($request->file('new_images', []))->map(fn ($file) => $file->store('cabanas', 'public'))->values();
        $cabana->images = $this->orderImages($kept, $uploaded, $data['image_order'] ?? [])->all();

        $cabana->save();
        $this->syncGallery($cabana, $before);
    }

    /**
     * New cabana photos join the gallery; photos taken off the cabana (their files are deleted) leave it.
     * A photo the admin removed from the gallery stays out, since only newly added photos are added.
     */
    private function syncGallery(Cabana $cabana, array $before): void
    {
        $after = $cabana->photoPaths();
        $cabana->galleryImages()->whereIn('path', array_diff($before, $after))->delete();

        $inGallery = GalleryImage::whereIn('path', $after)->pluck('path')->all();
        foreach (array_diff($after, $before, $inGallery) as $path) {
            $cabana->galleryImages()->create(['path' => $path, 'caption' => $cabana->name, 'category' => 'cabanas']);
        }
    }

    /**
     * Arrange photos in the order chosen in the admin form. Order entries are saved
     * paths, or "new:<n>" for the n-th uploaded file. Anything the order leaves out is kept at the end.
     */
    private function orderImages(Collection $kept, Collection $uploaded, array $order): Collection
    {
        $ordered = collect($order)
            ->map(fn ($entry) => str_starts_with($entry, 'new:')
                ? $uploaded->get((int) substr($entry, 4))
                : ($kept->contains($entry) ? $entry : null))
            ->filter()
            ->unique();

        return $ordered
            ->concat($kept->diff($ordered))
            ->concat($uploaded->diff($ordered))
            ->values();
    }
}
