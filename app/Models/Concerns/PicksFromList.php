<?php

namespace App\Models\Concerns;

/**
 * For JSON columns of keys picked from a fixed key => label list (cabana features, package inclusions).
 * Text typed in before the lists existed is kept as-is and shown as its own label.
 */
trait PicksFromList
{
    /**
     * @param  array<string, string>  $options
     * @return list<array{key: string, label: string}>
     */
    protected static function labelled(?array $picked, array $options): array
    {
        return collect($picked ?? [])
            ->map(fn ($key) => ['key' => $key, 'label' => $options[$key] ?? $key])
            ->values()
            ->all();
    }

    /**
     * Picked keys in list order, followed by any older free-text entries the admin kept.
     *
     * @param  list<string>  $picked
     * @param  array<string, string>  $options
     * @return list<string>
     */
    protected static function inListOrder(array $picked, array $options): array
    {
        $keys = array_keys($options);

        return array_values([...array_intersect($keys, $picked), ...array_diff(array_unique($picked), $keys)]);
    }
}
