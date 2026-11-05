<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Admin\Concerns\ManagesUploads;
use App\Http\Controllers\Controller;
use App\Models\MenuSection;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class MenuSectionController extends Controller
{
    use ManagesUploads;

    public function index(): Response
    {
        return Inertia::render('Admin/Menu/Index', [
            'meals' => MenuSection::byMeal(),
        ]);
    }

    public function create(Request $request): Response
    {
        return Inertia::render('Admin/Menu/Form', [
            'section' => null,
            'meals' => MenuSection::MEALS,
            'defaultMeal' => in_array($request->query('meal'), array_keys(MenuSection::MEALS), true) ? $request->query('meal') : 'breakfast',
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $this->save($request, new MenuSection);

        return redirect()->route('admin.menu.index')->with('success', 'Menu section created.');
    }

    public function edit(MenuSection $section): Response
    {
        return Inertia::render('Admin/Menu/Form', [
            'section' => $section,
            'meals' => MenuSection::MEALS,
        ]);
    }

    public function update(Request $request, MenuSection $section): RedirectResponse
    {
        $this->save($request, $section);

        return redirect()->route('admin.menu.index')->with('success', 'Menu section updated.');
    }

    public function destroy(MenuSection $section): RedirectResponse
    {
        $section->delete();

        return back()->with('success', 'Menu section deleted.');
    }

    private function save(Request $request, MenuSection $section): void
    {
        $data = $request->validate([
            'meal' => ['required', Rule::in(array_keys(MenuSection::MEALS))],
            'title' => ['required', 'string', 'max:120'],
            'note' => ['nullable', 'string', 'max:120'],
            'items' => ['required'],
            'sort_order' => ['nullable', 'integer'],
        ]);

        $items = $this->lines($data['items']);
        if ($items === []) {
            throw ValidationException::withMessages(['items' => 'Add at least one dish.']);
        }

        $section->fill([
            ...collect($data)->except('items')->all(),
            'items' => $items,
            'sort_order' => $data['sort_order'] ?? 0,
        ]);

        $section->save();
    }
}
