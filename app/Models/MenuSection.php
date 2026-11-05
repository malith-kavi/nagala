<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

class MenuSection extends Model
{
    public const MEALS = [
        'breakfast' => 'Breakfast',
        'lunch' => 'Lunch',
        'dinner' => 'Dinner',
    ];

    protected $fillable = ['meal', 'title', 'note', 'items', 'sort_order'];

    protected function casts(): array
    {
        return [
            'items' => 'array',
            'sort_order' => 'integer',
        ];
    }

    public function scopeOrdered(Builder $query): Builder
    {
        return $query->orderBy('sort_order')->orderBy('id');
    }

    /**
     * Every meal in serving order with its sections.
     *
     * @return list<array{key: string, label: string, sections: \Illuminate\Support\Collection<int, self>}>
     */
    public static function byMeal(): array
    {
        $sections = static::ordered()->get()->groupBy('meal');

        return collect(self::MEALS)
            ->map(fn ($label, $key) => ['key' => $key, 'label' => $label, 'sections' => $sections->get($key, collect())->values()])
            ->values()
            ->all();
    }
}
