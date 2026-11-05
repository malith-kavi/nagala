<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Admin\Concerns\ManagesUploads;
use App\Http\Controllers\Controller;
use App\Models\Cabana;
use App\Models\Package;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class PackageController extends Controller
{
    use ManagesUploads;

    public function index(): Response
    {
        return Inertia::render('Admin/Packages/Index', [
            'packages' => Package::with('cabana:id,name')->orderBy('sort_order')->orderBy('id')->get(),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Admin/Packages/Form', [
            'package' => null,
            'cabanas' => Cabana::orderBy('sort_order')->get(['id', 'name']),
            'inclusionOptions' => Package::INCLUSIONS,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $this->save($request, new Package);

        return redirect()->route('admin.packages.index')->with('success', 'Package created.');
    }

    public function edit(Package $package): Response
    {
        return Inertia::render('Admin/Packages/Form', [
            'package' => $package,
            'cabanas' => Cabana::orderBy('sort_order')->get(['id', 'name']),
            'inclusionOptions' => Package::INCLUSIONS,
        ]);
    }

    public function update(Request $request, Package $package): RedirectResponse
    {
        $this->save($request, $package);

        return redirect()->route('admin.packages.index')->with('success', 'Package updated.');
    }

    public function destroy(Package $package): RedirectResponse
    {
        $this->deleteStored($package->cover_image);
        $package->delete();

        return back()->with('success', 'Package deleted.');
    }

    private function save(Request $request, Package $package): void
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'slug' => ['nullable', 'string', 'max:140'],
            'short_description' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:10000'],
            'nights' => ['required', 'integer', 'min:1', 'max:30'],
            'guests' => ['required', 'integer', 'min:1', 'max:20'],
            'inclusions' => ['nullable', 'array'],
            // Older free-text entries already on this package may stay until the admin unticks them.
            'inclusions.*' => ['string', Rule::in([...array_keys(Package::INCLUSIONS), ...($package->inclusions ?? [])])],
            'price' => ['required', 'integer', 'min:0'],
            'cabana_id' => ['nullable', 'exists:cabanas,id'],
            'is_active' => ['boolean'],
            'sort_order' => ['nullable', 'integer'],
            'cover_image' => ['nullable', 'image', 'max:8192'],
        ]);

        $package->fill([
            ...collect($data)->except(['cover_image', 'slug', 'inclusions'])->all(),
            'slug' => $this->uniqueSlug(Package::class, ($data['slug'] ?? null) ?: $data['name'], $package->id),
            'inclusions' => Package::orderInclusions($data['inclusions'] ?? []),
            'sort_order' => $data['sort_order'] ?? 0,
        ]);

        $this->syncCoverImage($request, $package, 'packages');
        $package->save();
    }
}
