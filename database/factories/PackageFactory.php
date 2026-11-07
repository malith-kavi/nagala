<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<\App\Models\Package>
 */
class PackageFactory extends Factory
{
    public function definition(): array
    {
        $name = fake()->unique()->words(2, true).' Package';

        return [
            'name' => Str::title($name),
            'slug' => Str::slug($name),
            'short_description' => fake()->sentence(),
            'nights' => 1,
            'guests' => 2,
            'inclusions' => ['cottage', 'breakfast'],
            'price' => 18000,
            'is_active' => true,
        ];
    }
}
