<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Admin\Concerns\ManagesUploads;
use App\Http\Controllers\Controller;
use App\Models\Cabana;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
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
        return Inertia::render('Admin/Cabanas/Form', ['cabana' => null]);
    }

    public function store(Request $request): RedirectResponse
    {
        $cabana = new Cabana;
        $this->save($request, $cabana);

        return redirect()->route('admin.cabanas.index')->with('success', 'Cabana created.');
    }

    public function edit(Cabana $cabana): Response
    {
        return Inertia::render('Admin/Cabanas/Form', ['cabana' => $cabana]);
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
        $data = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'slug' => ['nullable', 'string', 'max:140'],
            'short_description' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:10000'],
            'max_guests' => ['required', 'integer', 'min:1', 'max:20'],
            'beds' => ['nullable', 'string', 'max:120'],
            'features' => ['nullable'],
            'price_per_night' => ['required', 'integer', 'min:0'],
            'units' => ['required', 'integer', 'min:1', 'max:50'],
            'is_active' => ['boolean'],
            'sort_order' => ['nullable', 'integer'],
            'cover_image' => ['nullable', 'image', 'max:8192'],
            'new_images' => ['nullable', 'array'],
            'new_images.*' => ['image', 'max:8192'],
            'remove_images' => ['nullable', 'array'],
        ]);

        $cabana->fill([
            ...collect($data)->except(['cover_image', 'new_images', 'remove_images', 'slug', 'features'])->all(),
            'slug' => $this->uniqueSlug(Cabana::class, ($data['slug'] ?? null) ?: $data['name'], $cabana->id),
            'features' => $this->lines($data['features'] ?? []),
            'sort_order' => $data['sort_order'] ?? 0,
        ]);

        $this->syncCoverImage($request, $cabana, 'cabanas');

        $images = collect($cabana->images ?? []);
        $remove = $data['remove_images'] ?? [];
        $images->filter(fn ($p) => in_array($p, $remove, true))->each(fn ($p) => $this->deleteStored($p));
        $images = $images->reject(fn ($p) => in_array($p, $remove, true));
        foreach ($request->file('new_images', []) as $file) {
            $images->push($file->store('cabanas', 'public'));
        }
        $cabana->images = $images->values()->all();

        $cabana->save();
    }
}
