<?php

namespace App\Models;

use App\Models\Concerns\HasCoverImage;
use App\Models\Concerns\PicksFromList;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Package extends Model
{
    use HasCoverImage, HasFactory, PicksFromList;

    /**
     * What a package can include, in the order the site lists them. Each key has a matching icon in
     * resources/js/Components/Site/Amenity.jsx; keys shared with Cottage::FEATURES mean the same thing.
     */
    public const INCLUSIONS = [
        'cottage' => 'Cottage Stay',
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
        'check_in_time', 'check_out_time',
        'inclusions', 'price', 'cover_image', 'is_active', 'sort_order',
    ];

    protected $appends = ['inclusion_list'];

    /**
     * Left out where packages are listed (cards, the booking form): the long text and bookkeeping
     * fields, which made list pages heavier to download on a weak signal. Use with makeHidden();
     * a package's own page still gets everything.
     */
    public const CARD_HIDDEN = [
        'short_description', 'description', 'inclusions', 'cover_image',
        'check_in_time', 'check_out_time',
        'is_active', 'sort_order', 'created_at', 'updated_at',
    ];

    /** The package's own check-in time, or the site-wide one when it has none. */
    public function checkInTime(): string
    {
        return $this->check_in_time ?: Setting::get('check_in_time');
    }

    /** The package's own check-out time, or the site-wide one when it has none. */
    public function checkOutTime(): string
    {
        return $this->check_out_time ?: Setting::get('check_out_time');
    }

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

    /** The cottages this package is for. None means any cottage sized for its guests. */
    public function cottages(): BelongsToMany
    {
        return $this->belongsToMany(Cottage::class);
    }

    /**
     * IDs of the cottages it names, for the booking form and the admin. Not sent by default: load
     * `cottages` first, then append('cottage_ids').
     *
     * @return list<int>
     */
    protected function cottageIds(): Attribute
    {
        return Attribute::get(fn () => $this->cottages->modelKeys());
    }

    /**
     * Whether the package can be booked in the cottage: one of its named cottages if it names
     * any, otherwise any cottage sized for exactly the package's guests.
     */
    public function fitsCottage(Cottage $cottage): bool
    {
        return $this->cottages->isNotEmpty()
            ? $this->cottages->contains($cottage)
            : $this->guests === $cottage->max_guests;
    }
}
