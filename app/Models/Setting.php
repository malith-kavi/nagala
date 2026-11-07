<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

class Setting extends Model
{
    public const CACHE_KEY = 'site_settings';

    public const DEFAULTS = [
        'site_name' => 'Nagala Eco Cottage',
        'tagline' => 'A Peaceful Getaway in Nature\'s Embrace',
        'phone' => '+94 77 123 4567',
        'whatsapp' => '94771234567',
        'email' => 'info@nagalaecocottage.lk',
        'address' => 'Nagala, Sri Lanka',
        'map_embed_url' => 'https://www.google.com/maps?q=Yapahuwa,Sri+Lanka&output=embed',
        'facebook_url' => '',
        'instagram_url' => '',
        'youtube_url' => '',
        'video_url' => '',
        'hero_image' => '',
        'hero_image_dark' => '',
        'banner_image' => '',
        'check_in_time' => '2:00 PM',
        'check_out_time' => '12:00 PM',
    ];

    /** Image settings stored as uploaded paths. */
    public const IMAGE_KEYS = ['hero_image', 'hero_image_dark', 'banner_image'];

    public $incrementing = false;

    public $timestamps = false;

    protected $primaryKey = 'key';

    protected $keyType = 'string';

    protected $fillable = ['key', 'value'];

    public static function allValues(): array
    {
        return Cache::rememberForever(self::CACHE_KEY, function () {
            $stored = static::query()->pluck('value', 'key')->all();

            return array_merge(self::DEFAULTS, array_filter($stored, fn ($v) => $v !== null));
        });
    }

    public static function get(string $key, mixed $default = null): mixed
    {
        return static::allValues()[$key] ?? $default;
    }

    public static function put(array $values): void
    {
        foreach ($values as $key => $value) {
            static::updateOrCreate(['key' => $key], ['value' => $value]);
        }

        Cache::forget(self::CACHE_KEY);
    }

    /** Settings for the frontend, with image paths resolved to URLs. */
    public static function forFrontend(): array
    {
        $values = static::allValues();

        foreach (self::IMAGE_KEYS as $key) {
            $values[$key.'_url'] = Cottage::publicUrl($values[$key] ?: null);
        }

        return $values;
    }
}
