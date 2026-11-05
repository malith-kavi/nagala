<?php

namespace App\Models;

use App\Models\Concerns\HasCoverImage;
use App\Models\Concerns\PicksFromList;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Cabana extends Model
{
    use HasCoverImage, HasFactory, PicksFromList;

    /**
     * Features the admin can pick, in the order the site lists them (the first two show on cabana cards).
     * Each key has a matching icon in resources/js/Components/Site/Amenity.jsx (shared with Package::INCLUSIONS).
     */
    public const FEATURES = [
        'welcome_drink' => 'Free Welcome Drink',
        'bed_tea' => 'Free Bed Tea',
        'wifi' => 'Free Wi-Fi',
        'parking' => 'Free Parking',
        'attached_bathroom' => 'Attached Bathroom',
        'hot_water' => 'Hot Water',
        'air_conditioning' => 'Air Conditioning',
        'ceiling_fan' => 'Ceiling Fan',
        'mosquito_net' => 'Mosquito Net',
        'veranda' => 'Private Veranda',
        'garden_view' => 'Garden View',
        'mountain_view' => 'Mountain View',
        'family_friendly' => 'Family Friendly',
        'extra_bed' => 'Extra Bed on Request',
        'baby_cot' => 'Baby Cot',
        'refrigerator' => 'Mini Fridge',
        'tv' => 'TV',
        'power_backup' => 'Power Backup',
        'laundry' => 'Laundry Service',
        'bbq' => 'BBQ / Campfire',
        'nature_walks' => 'Nature Walks',
        'bird_watching' => 'Bird Watching',
        'bicycles' => 'Bicycles',
        'transfer' => 'Pick-up & Drop-off',
        'non_smoking' => 'Non-Smoking',
        'pets' => 'Pets Allowed',
    ];

    protected $fillable = [
        'name', 'slug', 'short_description', 'description', 'max_guests', 'beds',
        'features', 'price_per_night', 'units', 'cover_image', 'images', 'is_active', 'sort_order',
    ];

    protected $appends = ['image_urls', 'feature_list'];

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

    /** @return list<array{key: string, label: string}> */
    protected function featureList(): Attribute
    {
        return Attribute::get(fn () => static::labelled($this->features, self::FEATURES));
    }

    /**
     * @param  list<string>  $selected
     * @return list<string>
     */
    public static function orderFeatures(array $selected): array
    {
        return static::inListOrder($selected, self::FEATURES);
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

    public function galleryImages(): HasMany
    {
        return $this->hasMany(GalleryImage::class);
    }

    /** @return list<string> The cover and every other photo. */
    public function photoPaths(): array
    {
        return array_values(array_filter([$this->cover_image, ...($this->images ?? [])]));
    }
}
