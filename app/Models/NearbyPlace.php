<?php

namespace App\Models;

use App\Models\Concerns\HasCoverImage;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;

class NearbyPlace extends Model
{
    use HasCoverImage;

    protected $fillable = [
        'name', 'slug', 'distance_km', 'travel_minutes', 'tagline', 'short_description',
        'description', 'cover_image', 'cover_credit', 'images', 'map_url', 'is_active', 'sort_order',
    ];

    protected $appends = ['image_urls'];

    protected function casts(): array
    {
        return [
            'distance_km' => 'float',
            'travel_minutes' => 'integer',
            'images' => 'array',
            'is_active' => 'boolean',
        ];
    }

    protected function imageUrls(): Attribute
    {
        return Attribute::get(fn () => collect($this->images ?? [])
            ->map(fn ($path) => static::publicUrl($path))
            ->values()
            ->all());
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true)->orderBy('sort_order')->orderBy('id');
    }
}
