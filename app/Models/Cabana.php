<?php

namespace App\Models;

use App\Models\Concerns\HasCoverImage;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Cabana extends Model
{
    use HasCoverImage, HasFactory;

    protected $fillable = [
        'name', 'slug', 'short_description', 'description', 'max_guests', 'beds',
        'features', 'price_per_night', 'units', 'cover_image', 'images', 'is_active', 'sort_order',
    ];

    protected $appends = ['image_urls'];

    protected function casts(): array
    {
        return [
            'features' => 'array',
            'images' => 'array',
            'is_active' => 'boolean',
            'price_per_night' => 'integer',
            'max_guests' => 'integer',
            'units' => 'integer',
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

    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class);
    }

    public function packages(): HasMany
    {
        return $this->hasMany(Package::class);
    }
}
