<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GalleryImage extends Model
{
    public const CATEGORIES = ['cottages', 'nature', 'places', 'food', 'activities'];

    protected $fillable = ['cottage_id', 'path', 'caption', 'category', 'sort_order'];

    protected $appends = ['url'];

    protected function url(): Attribute
    {
        return Attribute::get(fn () => Cottage::publicUrl($this->path));
    }

    /** Set when the photo was added from a cottage; the file belongs to that cottage. */
    public function cottage(): BelongsTo
    {
        return $this->belongsTo(Cottage::class);
    }

    /** What visitors see: uploaded photos, plus photos of cottages that are on the website. */
    public function scopeVisible(Builder $query): Builder
    {
        return $query->where(fn ($q) => $q->whereNull('cottage_id')->orWhereHas('cottage', fn ($c) => $c->where('is_active', true)));
    }
}
