<?php

namespace App\Models;

use App\Models\Concerns\HasCoverImage;
use App\Models\Concerns\PicksFromList;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Package extends Model
{
    use HasCoverImage, HasFactory, PicksFromList;

    /**
     * What a package can include, in the order the site lists them. Each key has a matching icon in
     * resources/js/Components/Site/Amenity.jsx; keys shared with Cabana::FEATURES mean the same thing.
     */
    public const INCLUSIONS = [
        'cabana' => 'Cabana Stay',
        'breakfast' => 'Breakfast',
        'lunch' => 'Lunch',
        'dinner' => 'Dinner',
        'bbq_dinner' => 'BBQ Dinner',
        'evening_tea' => 'Evening Tea & Snacks',
        'welcome_drink' => 'Free Welcome Drink',
        'bed_tea' => 'Free Bed Tea',
        'celebration_cake' => 'Celebration Cake',
        'campfire' => 'Campfire Evening',
        'nature_walks' => 'Guided Nature Walk',
        'bird_watching' => 'Bird Watching',
        'village_tour' => 'Village Tour',
        'boat_ride' => 'Boat Ride',
        'bicycles' => 'Bicycle Use',
        'transfer' => 'Pick-up & Drop-off',
        'late_checkout' => 'Late Check-out',
        'wifi' => 'Free Wi-Fi',
        'parking' => 'Free Parking',
    ];

    protected $fillable = [
        'name', 'slug', 'short_description', 'description', 'nights', 'guests',
        'inclusions', 'price', 'cabana_id', 'cover_image', 'is_active', 'sort_order',
    ];

    protected $appends = ['inclusion_list'];

    protected function casts(): array
    {
        return [
            'inclusions' => 'array',
            'is_active' => 'boolean',
            'price' => 'integer',
            'nights' => 'integer',
            'guests' => 'integer',
        ];
    }

    /** @return list<array{key: string, label: string}> */
    protected function inclusionList(): Attribute
    {
        return Attribute::get(fn () => static::labelled($this->inclusions, self::INCLUSIONS));
    }

    /**
     * @param  list<string>  $selected
     * @return list<string>
     */
    public static function orderInclusions(array $selected): array
    {
        return static::inListOrder($selected, self::INCLUSIONS);
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true)->orderBy('sort_order')->orderBy('id');
    }

    public function cabana(): BelongsTo
    {
        return $this->belongsTo(Cabana::class);
    }

    /**
     * Whether the package can be booked in the cabana: its linked cabana if one
     * is set, otherwise any cabana sized for exactly the package's guests.
     */
    public function fitsCabana(Cabana $cabana): bool
    {
        return $this->cabana_id
            ? $this->cabana_id === $cabana->id
            : $this->guests === $cabana->max_guests;
    }
}
