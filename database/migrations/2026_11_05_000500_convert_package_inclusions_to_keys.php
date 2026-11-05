<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Package inclusions used to be typed in one per line; they are now picked from Package::INCLUSIONS and stored as keys.
 * Typed entries that match a label (or an older wording below) become that key. Anything else is kept as-is.
 */
return new class extends Migration
{
    // Snapshot of Package::INCLUSIONS when this ran, so later edits to the list don't change what this migration does.
    private const LABELS = [
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

    // Wordings the seeder and admins used before the list existed.
    private const ALIASES = ['cabana' => 'cabana', 'room' => 'cabana'];

    public function up(): void
    {
        $byLabel = [...array_change_key_case(array_flip(self::LABELS)), ...self::ALIASES];

        $this->convert(fn (string $item) => isset(self::LABELS[$item]) ? $item : ($byLabel[strtolower(trim($item))] ?? $item));
    }

    public function down(): void
    {
        $this->convert(fn (string $item) => self::LABELS[$item] ?? $item);
    }

    private function convert(callable $map): void
    {
        DB::table('packages')->whereNotNull('inclusions')->get(['id', 'inclusions'])->each(function ($row) use ($map) {
            $items = array_values(array_unique(array_map($map, json_decode($row->inclusions, true) ?: [])));

            DB::table('packages')->where('id', $row->id)->update(['inclusions' => json_encode($items)]);
        });
    }
};
