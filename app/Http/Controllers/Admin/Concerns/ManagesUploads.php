<?php

namespace App\Http\Controllers\Admin\Concerns;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

trait ManagesUploads
{
    /** Replace a single image column with a newly uploaded file, if any. */
    protected function syncCoverImage(Request $request, Model $model, string $directory, string $field = 'cover_image'): void
    {
        if ($request->boolean('remove_'.$field) && $model->{$field}) {
            $this->deleteStored($model->{$field});
            $model->{$field} = null;
        }

        $file = $request->file($field);
        if ($file instanceof UploadedFile) {
            $this->deleteStored($model->{$field});
            $model->{$field} = $file->store($directory, 'uploads');
        }
    }

    /** Validation rules for a photo list edited with the admin PhotoOrderInput. */
    protected function imageListRules(): array
    {
        return [
            'new_images' => ['nullable', 'array'],
            'new_images.*' => ['image', 'max:8192'],
            'remove_images' => ['nullable', 'array'],
            'image_order' => ['nullable', 'array'],
            'image_order.*' => ['string'],
        ];
    }

    /** Apply a photo list edit: delete removed photos, store new uploads and save them in the chosen order. */
    protected function syncImages(Request $request, Model $model, string $directory, string $field = 'images'): void
    {
        $remove = $request->input('remove_images', []);
        $kept = collect($model->{$field} ?? []);
        $kept->filter(fn ($p) => in_array($p, $remove, true))->each(fn ($p) => $this->deleteStored($p));
        $kept = $kept->reject(fn ($p) => in_array($p, $remove, true))->values();
        $uploaded = collect($request->file('new_images', []))->map(fn ($file) => $file->store($directory, 'uploads'))->values();
        $model->{$field} = $this->orderImages($kept, $uploaded, $request->input('image_order', []))->all();
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

    protected function deleteStored(?string $path): void
    {
        if ($path && ! str_starts_with($path, 'http') && ! str_starts_with($path, '/')) {
            Storage::disk('uploads')->delete($path);
        }
    }

    protected function uniqueSlug(string $modelClass, string $value, ?int $ignoreId = null): string
    {
        $base = Str::slug($value) ?: Str::random(6);
        $slug = $base;
        $i = 2;

        while ($modelClass::where('slug', $slug)->when($ignoreId, fn ($q) => $q->whereKeyNot($ignoreId))->exists()) {
            $slug = $base.'-'.$i++;
        }

        return $slug;
    }

    /** Turn a newline/array input into a clean list of strings. */
    protected function lines(mixed $value): array
    {
        $items = is_array($value) ? $value : preg_split('/\r\n|\r|\n/', (string) $value);

        return array_values(array_filter(array_map('trim', $items), fn ($v) => $v !== ''));
    }
}
