<?php

namespace App\Models;

use App\Models\Concerns\HasCoverImage;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

class NearbyPlace extends Model
{
    use HasCoverImage;

    protected $fillable = [
        'name', 'slug', 'distance_km', 'travel_minutes', 'tagline', 'short_description',
        'description', 'cover_image', 'cover_credit', 'map_url', 'is_active', 'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'distance_km' => 'float',
            'travel_minutes' => 'integer',
            'is_active' => 'boolean',
        ];
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true)->orderBy('sort_order')->orderBy('id');
    }
}
