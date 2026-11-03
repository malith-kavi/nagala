<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<\App\Models\Cabana>
 */
class CabanaFactory extends Factory
{
    public function definition(): array
    {
        $name = fake()->unique()->words(2, true).' Cabana';

        return [
            'name' => Str::title($name),
            'slug' => Str::slug($name),
            'short_description' => fake()->sentence(),
            'description' => fake()->paragraph(),
            'max_guests' => 3,
            'beds' => '1 Double Bed',
            'features' => ['Private Veranda', 'Garden View'],
            'price_per_night' => 8000,
            'units' => 1,
            'is_active' => true,
        ];
    }
}
