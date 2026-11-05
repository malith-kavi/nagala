<?php

namespace App\Models;

use App\Models\Concerns\HasCoverImage;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Package extends Model
{
    use HasCoverImage, HasFactory;

    protected $fillable = [
        'name', 'slug', 'short_description', 'description', 'nights', 'guests',
        'inclusions', 'price', 'cabana_id', 'cover_image', 'is_active', 'sort_order',
    ];

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
