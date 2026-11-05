<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GalleryImage extends Model
{
    public const CATEGORIES = ['cabanas', 'nature', 'places', 'food', 'activities'];

    protected $fillable = ['cabana_id', 'path', 'caption', 'category', 'sort_order'];

    protected $appends = ['url'];

    protected function url(): Attribute
    {
        return Attribute::get(fn () => Cabana::publicUrl($this->path));
    }

    /** Set when the photo was added from a cabana; the file belongs to that cabana. */
    public function cabana(): BelongsTo
    {
        return $this->belongsTo(Cabana::class);
    }

    /** What visitors see: uploaded photos, plus photos of cabanas that are on the website. */
    public function scopeVisible(Builder $query): Builder
    {
        return $query->where(fn ($q) => $q->whereNull('cabana_id')->orWhereHas('cabana', fn ($c) => $c->where('is_active', true)));
    }
}
