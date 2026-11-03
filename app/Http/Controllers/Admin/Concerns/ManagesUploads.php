<?php

namespace App\Http\Controllers\Admin\Concerns;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
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
            $model->{$field} = $file->store($directory, 'public');
        }
    }

    protected function deleteStored(?string $path): void
    {
        if ($path && ! str_starts_with($path, 'http') && ! str_starts_with($path, '/')) {
            Storage::disk('public')->delete($path);
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
