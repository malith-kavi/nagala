<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;

class GalleryImage extends Model
{
    public const CATEGORIES = ['cabanas', 'nature', 'places', 'food', 'activities'];

    protected $fillable = ['path', 'caption', 'category', 'sort_order'];

    protected $appends = ['url'];

    protected function url(): Attribute
    {
        return Attribute::get(fn () => Cabana::publicUrl($this->path));
    }
}
