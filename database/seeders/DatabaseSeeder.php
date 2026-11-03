<?php

namespace Database\Seeders;

use App\Models\Cabana;
use App\Models\NearbyPlace;
use App\Models\Package;
use App\Models\Setting;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database with the Nagala Eco Cottage content.
     */
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => config('nagala.admin_email')],
            [
                'name' => 'Nagala Admin',
                'password' => config('nagala.admin_password'),
                'is_admin' => true,
                'email_verified_at' => now(),
            ],
        );

        $cabanas = [
            [
                'name' => 'Standard Cabana',
                'short_description' => 'A cosy thatched cabana tucked into the garden — perfect for couples.',
                'description' => "Our Standard Cabana is a cosy, thatched-roof retreat set among tropical greenery. Wake up to birdsong, sip tea on your private veranda and enjoy the cool evening breeze.\n\nThe cabana includes a comfortable double bed, mosquito net, fan, attached bathroom with hot water, and a private veranda overlooking the garden.",
                'max_guests' => 3,
                'beds' => '1 Double Bed',
                'features' => ['Private Veranda', 'Garden View', 'Attached Bathroom', 'Hot Water', 'Free Wi-Fi'],
                'price_per_night' => 8000,
                'units' => 3,
            ],
            [
                'name' => 'Deluxe Cabana',
                'short_description' => 'Spacious cabana with a wide veranda and views of the Nagala mountain.',
                'description' => "The Deluxe Cabana offers more space and a spacious veranda with sweeping views of the Nagala rock and surrounding forest — ideal for sunsets.\n\nEnjoy a double bed, seating area, attached bathroom with hot water and handcrafted eco-friendly furnishings.",
                'max_guests' => 3,
                'beds' => '1 Double Bed',
                'features' => ['Spacious Veranda', 'Mountain View', 'Attached Bathroom', 'Hot Water', 'Free Wi-Fi'],
                'price_per_night' => 12000,
                'units' => 2,
            ],
            [
                'name' => 'Family Cabana',
                'short_description' => 'Two-bed family cabana with a large veranda — room for everyone.',
                'description' => "Bring the whole family. The Family Cabana sleeps up to five guests with two double beds, a large veranda and plenty of space for children to relax after a day of exploring.\n\nIncludes attached bathroom with hot water, extra bedding on request and garden access.",
                'max_guests' => 5,
                'beds' => '2 Double Beds',
                'features' => ['Large Veranda', 'Family Friendly', 'Attached Bathroom', 'Hot Water', 'Free Wi-Fi'],
                'price_per_night' => 18000,
                'units' => 2,
            ],
        ];

        foreach ($cabanas as $i => $cabana) {
            Cabana::updateOrCreate(
                ['slug' => str($cabana['name'])->slug()->toString()],
                [...$cabana, 'sort_order' => $i, 'is_active' => true],
            );
        }

        $standard = Cabana::where('slug', 'standard-cabana')->first();
        $family = Cabana::where('slug', 'family-cabana')->first();

        $packages = [
            [
                'name' => 'Couple Package',
                'short_description' => 'A romantic night in nature for two.',
                'description' => 'Escape with your partner for a peaceful night surrounded by nature. Enjoy a cosy cabana, a hearty Sri Lankan breakfast and a late check-out so you can make the most of your morning.',
                'nights' => 1, 'guests' => 2,
                'inclusions' => ['Room', 'Breakfast', 'Late Visit'],
                'price' => 18000, 'cabana_id' => $standard?->id,
            ],
            [
                'name' => 'Family Package',
                'short_description' => 'Village tour and comfort for the whole family.',
                'description' => 'A full family experience: stay in our Family Cabana, enjoy breakfast together and join a guided village tour to discover local farming, cooking and traditions.',
                'nights' => 1, 'guests' => 4,
                'inclusions' => ['Room', 'Breakfast', 'Village Tour'],
                'price' => 32000, 'cabana_id' => $family?->id,
            ],
            [
                'name' => 'Adventure Package',
                'short_description' => 'Climb the ancient Yapahuwa Rock Fortress.',
                'description' => 'For explorers: stay the night, fuel up with breakfast and head out on a guided tour to the historic Yapahuwa Rock Fortress, with transport included.',
                'nights' => 1, 'guests' => 3,
                'inclusions' => ['Room', 'Breakfast', 'Yapahuwa Tour'],
                'price' => 28000, 'cabana_id' => $standard?->id,
            ],
        ];

        foreach ($packages as $i => $package) {
            Package::updateOrCreate(
                ['slug' => str($package['name'])->slug()->toString()],
                [...$package, 'sort_order' => $i, 'is_active' => true],
            );
        }

        $places = [
            [
                'name' => 'Yapahuwa Rock Fortress',
                'distance_km' => 12, 'travel_minutes' => 25,
                'short_description' => 'A historic rock fortress with stunning views and rich history.',
                'description' => "Yapahuwa was the capital of Sri Lanka in the 13th century. Climb the famous ornate stone staircase, see the remains of the Temple of the Tooth Relic and enjoy panoramic views from the summit.\n\nBest visited early morning or late afternoon. Allow 2–3 hours.",
                'map_url' => 'https://maps.google.com/?q=Yapahuwa+Rock+Fortress',
            ],
            [
                'name' => 'Hakwatunawa Lake',
                'distance_km' => 8, 'travel_minutes' => 15,
                'short_description' => 'A serene lake perfect for relaxation and photography.',
                'description' => 'A peaceful reservoir surrounded by paddy fields and mountains. Perfect for an evening walk, bird watching or photographing the reflections at sunrise.',
                'map_url' => 'https://maps.google.com/?q=Hakwatuna+Oya+Reservoir',
            ],
            [
                'name' => 'Nikawewa Reservoir',
                'distance_km' => 10, 'travel_minutes' => 20,
                'short_description' => 'Beautiful reservoir with scenic views and bird watching.',
                'description' => 'Nikawewa is home to many water birds and offers spectacular sunsets over the water with the mountains in the background.',
                'map_url' => 'https://maps.google.com/?q=Nikawewa+Sri+Lanka',
            ],
            [
                'name' => 'Village Experiences',
                'tagline' => 'Local culture',
                'short_description' => 'Experience traditional village life, local cuisine and activities.',
                'description' => 'Join local villagers for a taste of rural Sri Lankan life — cook traditional rice and curry, visit paddy fields, try a bullock-cart ride and learn about local crafts.',
            ],
        ];

        foreach ($places as $i => $place) {
            NearbyPlace::updateOrCreate(
                ['slug' => str($place['name'])->slug()->toString()],
                [...$place, 'sort_order' => $i, 'is_active' => true],
            );
        }

        if (Setting::count() === 0) {
            Setting::put(Setting::DEFAULTS);
        }
    }
}
