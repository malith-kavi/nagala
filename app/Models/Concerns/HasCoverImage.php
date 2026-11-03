<?php

namespace App\Models\Concerns;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Support\Facades\Storage;

trait HasCoverImage
{
    public function initializeHasCoverImage(): void
    {
        $this->append('cover_image_url');
    }

    protected function coverImageUrl(): Attribute
    {
        return Attribute::get(fn () => static::publicUrl($this->cover_image));
    }

    public static function publicUrl(?string $path): ?string
    {
        if (! $path) {
            return null;
        }

        if (str_starts_with($path, 'http') || str_starts_with($path, '/')) {
            return $path;
        }

        // Root-relative for the local public disk so images work on any host/port.
        if (config('filesystems.disks.public.driver') === 'local') {
            return '/storage/'.ltrim($path, '/');
        }

        return Storage::disk('public')->url($path);
    }
}
