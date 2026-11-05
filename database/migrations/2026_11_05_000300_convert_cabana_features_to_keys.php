<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Cabana features used to be typed in one per line; they are now picked from Cabana::FEATURES and stored as keys.
 * Typed entries that match a label become that key. Anything else is kept as-is and shows up in the admin form.
 */
return new class extends Migration
{
    // Snapshot of Cabana::FEATURES when this ran, so later edits to the list don't change what this migration does.
    private const LABELS = [
        'welcome_drink' => 'Free Welcome Drink',
        'bed_tea' => 'Free Bed Tea',
        'wifi' => 'Free Wi-Fi',
        'parking' => 'Free Parking',
        'attached_bathroom' => 'Attached Bathroom',
        'hot_water' => 'Hot Water',
        'air_conditioning' => 'Air Conditioning',
        'ceiling_fan' => 'Ceiling Fan',
        'mosquito_net' => 'Mosquito Net',
        'veranda' => 'Private Veranda',
        'garden_view' => 'Garden View',
        'mountain_view' => 'Mountain View',
        'family_friendly' => 'Family Friendly',
        'extra_bed' => 'Extra Bed on Request',
        'baby_cot' => 'Baby Cot',
        'refrigerator' => 'Mini Fridge',
        'tv' => 'TV',
        'power_backup' => 'Power Backup',
        'laundry' => 'Laundry Service',
        'bbq' => 'BBQ / Campfire',
        'nature_walks' => 'Nature Walks',
        'bird_watching' => 'Bird Watching',
        'bicycles' => 'Bicycles',
        'transfer' => 'Pick-up & Drop-off',
        'non_smoking' => 'Non-Smoking',
        'pets' => 'Pets Allowed',
    ];

    public function up(): void
    {
        $byLabel = array_change_key_case(array_flip(self::LABELS));

        $this->convert(fn (string $feature) => $byLabel[strtolower(trim($feature))] ?? $feature);
    }

    public function down(): void
    {
        $this->convert(fn (string $feature) => self::LABELS[$feature] ?? $feature);
    }

    private function convert(callable $map): void
    {
        DB::table('cabanas')->whereNotNull('features')->get(['id', 'features'])->each(function ($row) use ($map) {
            $features = array_values(array_unique(array_map($map, json_decode($row->features, true) ?: [])));

            DB::table('cabanas')->where('id', $row->id)->update(['features' => json_encode($features)]);
        });
    }
};
