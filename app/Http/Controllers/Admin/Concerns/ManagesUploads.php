<?php

namespace App\Http\Controllers\Admin\Concerns;

use App\Models\Setting;
use App\Services\ImageOptimizer;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use InvalidArgumentException;

trait ManagesUploads
{
    /**
     * Validation rules for one uploaded photo. The admin's browser compresses photos to fit
     * the 1 MB limit before uploading (resources/js/lib/prepareImage.js).
     */
    protected function imageRule(): array
    {
        return ['image', 'mimes:jpg,jpeg,png,webp', 'max:'.(ImageOptimizer::MAX_BYTES / 1024)];
    }

    /** Plain-language messages for the photo rules, for every photo field in the admin. */
    protected function imageMessages(): array
    {
        $messages = [];
        foreach (['cover_image', 'new_images.*', 'images.*', ...Setting::IMAGE_KEYS] as $field) {
            $messages["{$field}.max"] = 'Each photo must be 1 MB or smaller.';
            $messages["{$field}.mimes"] = 'Photos must be JPG, PNG or WebP.';
        }

        return $messages;
    }

    /**
     * Store an uploaded photo as compact WebP with smaller copies (see ImageOptimizer).
     * A photo that can't be read is reported against $field like any other validation error.
     */
    protected function storeImage(UploadedFile $file, string $directory, string $field, int $maxSide = ImageOptimizer::MAX_SIDE): string
    {
        try {
            return app(ImageOptimizer::class)->store($file, $directory, $maxSide);
        } catch (InvalidArgumentException $e) {
            throw ValidationException::withMessages([$field => $e->getMessage()]);
        }
    }

    /** Replace a single image column with a newly uploaded file, if any. */
    protected function syncCoverImage(Request $request, Model $model, string $directory, string $field = 'cover_image'): void
    {
        $file = $request->file($field);
        if ($file instanceof UploadedFile) {
            // Stored before the old photo is deleted, so a photo that can't be read leaves the old one in place.
            $path = $this->storeImage($file, $directory, $field);
            $this->deleteStored($model->{$field});
            $model->{$field} = $path;
        } elseif ($request->boolean('remove_'.$field) && $model->{$field}) {
            $this->deleteStored($model->{$field});
            $model->{$field} = null;
        }
    }

    /** Validation rules for a photo list edited with the admin PhotoOrderInput. */
    protected function imageListRules(): array
    {
        return [
            'new_images' => ['nullable', 'array'],
            'new_images.*' => $this->imageRule(),
            'remove_images' => ['nullable', 'array'],
            'image_order' => ['nullable', 'array'],
            'image_order.*' => ['string'],
        ];
    }

    /** Apply a photo list edit: delete removed photos, store new uploads and save them in the chosen order. */
    protected function syncImages(Request $request, Model $model, string $directory, string $field = 'images'): void
    {
        $uploaded = collect($request->file('new_images', []))->map(fn ($file) => $this->storeImage($file, $directory, 'new_images'))->values();
        $remove = $request->input('remove_images', []);
        $kept = collect($model->{$field} ?? []);
        $kept->filter(fn ($p) => in_array($p, $remove, true))->each(fn ($p) => $this->deleteStored($p));
        $kept = $kept->reject(fn ($p) => in_array($p, $remove, true))->values();
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

    /** Delete an uploaded photo and its smaller copies. Bundled /images/... and external photos are left alone. */
    protected function deleteStored(?string $path): void
    {
        if ($path && ! str_starts_with($path, 'http') && ! str_starts_with($path, '/')) {
            app(ImageOptimizer::class)->delete($path);
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
