<?php

namespace Database\Seeders;

use App\Models\Cabana;
use App\Models\MenuSection;
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

        // Content from the first version of the site. Deleting a cabana also deletes its bookings.
        Package::whereIn('slug', ['couple-package', 'family-package', 'adventure-package'])->delete();
        Cabana::whereIn('slug', ['standard-cabana', 'deluxe-cabana', 'family-cabana'])->delete();
        NearbyPlace::whereIn('slug', ['nikawewa-reservoir', 'village-experiences'])->delete();

        $perks = ['Free Welcome Drink', 'Free Bed Tea'];

        $cabanas = [
            [
                'name' => 'Couple Cabana',
                'short_description' => 'A cosy cabana for two, surrounded by tropical greenery.',
                'description' => "Our Couple Cabana is a cosy retreat for two, set among the greenery beneath Nagala rock. Every stay includes a free welcome drink on arrival and bed tea in the morning.\n\nThe price shown is for the cabana only. Prefer your meals taken care of? Choose the Couple Full Board package with breakfast, lunch and dinner of traditional Sri Lankan home cooking.",
                'max_guests' => 2,
                'price_per_night' => 8000,
            ],
            [
                'name' => 'Family Cabana I',
                'short_description' => 'A comfortable cabana for families or friends — sleeps up to 4.',
                'description' => "Family Cabana I has room for up to four guests — ideal for a family or a small group of friends. Every stay includes a free welcome drink on arrival and bed tea in the morning.\n\nThe price shown is for the cabana only. Add breakfast, lunch and dinner with the Family Full Board package for 4 guests.",
                'max_guests' => 4,
                'price_per_night' => 12000,
            ],
            [
                'name' => 'Large Family Cabana',
                'short_description' => 'Our largest cabana — room for the whole family, up to 5 guests.',
                'description' => "The Large Family Cabana is our most spacious stay, sleeping up to five guests. Every stay includes a free welcome drink on arrival and bed tea in the morning.\n\nThe price shown is for the cabana only. Add breakfast, lunch and dinner with the Family Full Board package for 5 guests.",
                'max_guests' => 5,
                'price_per_night' => 15000,
            ],
            [
                'name' => 'Family Cabana II',
                'short_description' => 'A second family cabana for up to 4 guests.',
                'description' => "Family Cabana II has room for up to four guests — perfect for families or small groups. Every stay includes a free welcome drink on arrival and bed tea in the morning.\n\nThe price shown is for the cabana only. Add breakfast, lunch and dinner with the Family Full Board package for 4 guests.",
                'max_guests' => 4,
                'price_per_night' => 12000,
            ],
        ];

        foreach ($cabanas as $i => $cabana) {
            Cabana::updateOrCreate(
                ['slug' => str($cabana['name'])->slug()->toString()],
                [...$cabana, 'features' => $perks, 'units' => 1, 'sort_order' => $i, 'is_active' => true],
            );
        }

        $stay = 'Check-in from 2:00 PM, check-out by 12:00 PM the next day.';

        $packages = [
            [
                'name' => 'Couple Full Board',
                'short_description' => 'The Couple Cabana with breakfast, lunch and dinner for two.',
                'description' => "A relaxed full board stay for two in our Couple Cabana. Enjoy breakfast, lunch and dinner of traditional Sri Lankan home cooking, plus a free welcome drink on arrival and bed tea in the morning.\n\nLKR 17,000 per night: LKR 8,000 for the cabana + LKR 9,000 for meals for two.\n\n{$stay}",
                'guests' => 2, 'price' => 17000,
            ],
            [
                'name' => 'Family Full Board – 4 Guests',
                'short_description' => 'A family cabana for 4 with breakfast, lunch and dinner.',
                'description' => "A full board family stay in Family Cabana I or II. Enjoy breakfast, lunch and dinner of traditional Sri Lankan home cooking, plus a free welcome drink on arrival and bed tea in the morning.\n\nLKR 30,000 per night: LKR 12,000 for the cabana + LKR 18,000 for meals for four.\n\n{$stay}",
                'guests' => 4, 'price' => 30000,
            ],
            [
                'name' => 'Family Full Board – 5 Guests',
                'short_description' => 'Our Large Family Cabana for 5 with breakfast, lunch and dinner.',
                'description' => "A full board stay for the whole family in our Large Family Cabana. Enjoy breakfast, lunch and dinner of traditional Sri Lankan home cooking, plus a free welcome drink on arrival and bed tea in the morning.\n\nLKR 37,500 per night: LKR 15,000 for the cabana + LKR 22,500 for meals for five.\n\n{$stay}",
                'guests' => 5, 'price' => 37500,
            ],
        ];

        foreach ($packages as $i => $package) {
            Package::updateOrCreate(
                ['slug' => str($package['name'])->slug()->toString()],
                [
                    ...$package,
                    'nights' => 1,
                    'cabana_id' => null,
                    'inclusions' => ['Cabana', 'Breakfast', 'Lunch', 'Dinner', ...$perks],
                    'sort_order' => $i,
                    'is_active' => true,
                ],
            );
        }

        $places = [
            [
                'name' => 'Siyambalangamuwa Wewa',
                'tagline' => 'Reservoir',
                'short_description' => 'A quiet village tank surrounded by paddy fields — lovely at sunrise and sunset.',
                'description' => 'A peaceful village reservoir framed by paddy fields and forest. Visit early in the morning or late in the afternoon to watch the water birds and enjoy the reflections on the water.',
            ],
            [
                'name' => 'Reswehera Temple',
                'tagline' => 'Temple',
                'short_description' => 'Ancient forest monastery with a giant standing Buddha carved into the rock.',
                'description' => "Reswehera (also known as Sasseruwa) is an ancient forest monastery with rock caves and a towering standing Buddha statue carved out of the living rock.\n\nA calm, atmospheric place to explore. Please dress modestly, with shoulders and knees covered.",
            ],
            [
                'name' => 'Kala Wewa',
                'tagline' => 'Reservoir',
                'short_description' => 'One of Sri Lanka\'s great ancient reservoirs, built in the 5th century.',
                'description' => 'Kala Wewa was built by King Dhatusena in the 5th century and still feeds the paddy fields of the region today. Its vast waters are perfect for a sunset visit, and the famous Aukana Buddha statue is close by.',
            ],
            [
                'name' => 'Balalu Wewa',
                'tagline' => 'Reservoir',
                'short_description' => 'Kala Wewa\'s twin reservoir — wide water views and plenty of birdlife.',
                'description' => 'Balalu Wewa lies right beside Kala Wewa, and the two ancient reservoirs are linked together. Stop by for wide open views across the water, local fishermen at work and plenty of water birds.',
            ],
            [
                'name' => 'Vijithapura Temple',
                'tagline' => 'Temple',
                'short_description' => 'Historic temple near Kala Wewa, linked to King Dutugemunu.',
                'description' => 'Vijithapura Temple stands near Kala Wewa and is linked by tradition to the ancient city of Vijithapura, a stronghold taken by King Dutugemunu during his campaign to unite the country. A quiet, historic place of worship.',
            ],
            [
                'name' => 'Ananda Maha Seya',
                'tagline' => 'Temple',
                'short_description' => 'A revered stupa and calm place of worship.',
                'description' => 'A peaceful stupa visited by local devotees. Come in the cool of the evening to enjoy the quiet grounds. Please dress modestly and remove shoes and hats before entering.',
            ],
            [
                'name' => 'Nikawewa Nagala Temple',
                'tagline' => 'Temple',
                'short_description' => 'A tranquil temple in the Nikawewa area, close to Nagala.',
                'description' => 'A tranquil temple set among the forests of the Nikawewa area — a quiet place for reflection away from the crowds. Please dress modestly when visiting.',
            ],
            [
                'name' => 'Yapahuwa Rock Fortress',
                'slug' => 'yapahuwa-rock-fortress',
                'tagline' => 'Heritage site',
                'distance_km' => 12, 'travel_minutes' => 25,
                'short_description' => 'A historic rock fortress with stunning views and rich history.',
                'description' => "Yapahuwa was the capital of Sri Lanka in the 13th century. Climb the famous ornate stone staircase, see the remains of the Temple of the Tooth Relic and enjoy panoramic views from the summit.\n\nBest visited early morning or late afternoon. Allow 2–3 hours.",
                'map_url' => 'https://maps.google.com/?q=Yapahuwa+Rock+Fortress',
            ],
            [
                'name' => 'Deduru Oya Reservoir',
                'tagline' => 'Reservoir',
                'short_description' => 'A vast reservoir on the Deduru Oya — big skies and beautiful sunsets.',
                'description' => 'The Deduru Oya Reservoir is one of the largest reservoirs in the region, built across the Deduru Oya river. Its long dam and wide waters make a great stop for photos and sunsets.',
            ],
            [
                'name' => 'Hakwatunawa Lake',
                'slug' => 'hakwatunawa-lake',
                'tagline' => 'Reservoir',
                'distance_km' => 8, 'travel_minutes' => 15,
                'short_description' => 'A serene lake perfect for relaxation and photography.',
                'description' => 'A peaceful reservoir surrounded by paddy fields and mountains. Perfect for an evening walk, bird watching or photographing the reflections at sunrise.',
                'map_url' => 'https://maps.google.com/?q=Hakwatuna+Oya+Reservoir',
            ],
            [
                'name' => 'Kaballelena Temple',
                'tagline' => 'Temple',
                'short_description' => 'A historic Buddhist temple and peaceful place of worship.',
                'description' => 'Kaballelena is a historic Buddhist temple and a calm place of worship. Combine it with a drive through the surrounding countryside. Please dress modestly when visiting.',
            ],
            [
                'name' => 'Nayindanawa Temple',
                'tagline' => 'Temple',
                'short_description' => 'A village temple in a peaceful rural setting.',
                'description' => 'Nayindanawa Temple is a peaceful village temple in a quiet rural setting — a calm stop on a countryside drive. Please dress modestly when visiting.',
            ],
        ];

        foreach ($places as $i => $place) {
            NearbyPlace::updateOrCreate(
                ['slug' => $place['slug'] ?? str($place['name'])->slug()->toString()],
                [
                    'map_url' => 'https://maps.google.com/?q='.urlencode($place['name'].', Sri Lanka'),
                    ...$place,
                    'sort_order' => $i,
                    'is_active' => true,
                ],
            );
        }

        if (Setting::count() === 0) {
            Setting::put(Setting::DEFAULTS);
        }
        Setting::put(['check_in_time' => '2:00 PM', 'check_out_time' => '12:00 PM']);

        // The menu is managed in admin, so only seed it once.
        if (MenuSection::doesntExist()) {
            $this->seedMenu();
        }

        $this->call(SampleImagesSeeder::class);
    }

    private function seedMenu(): void
    {
        $menu = [
            'breakfast' => [
                ['Mains', null, ['Bread', 'Roti', 'Milk rice (kiribath)', 'Kakulu bath', 'String hoppers']],
                ['Curries & sides', null, ['Potato curry', 'Boiled egg / egg omelette', 'Fried pol sambol', 'Karawala / halmesso (dried fish / sprats)']],
                ['Dessert', null, ['Banana']],
            ],
            'lunch' => [
                ['Rice & curry', null, [
                    'Keeri samba rice', 'Wew malu mirisata (spicy tank-fish curry)', 'Kesel muwa thelata (tempered banana blossom)',
                    'Pol sambol (coconut sambol)', 'Parippu curry (dhal)',
                ]],
                ['Vegetable curry', 'One of', ['Polos (young jackfruit)', 'Amba (mango)', 'Batu (brinjal)', 'Mekaral (long beans)', 'Kakiri (cucumber)']],
                ['Greens', 'One of', ['Mukunuwenna', 'Agunukola', 'Gotukola']],
                ['Sides', null, ['Papadam', 'Miris beda (fried chillies)']],
                ['Dessert', 'Choose two', ['Ice-cream', 'Puddim (pudding)', 'Fruit salad', 'Kiri', 'Jelly']],
            ],
            'dinner' => [
                ['Mains', 'Choose two', ['Kurakkan pittu (finger-millet pittu)', 'Pol roti (coconut roti)', 'String hoppers', 'Hoppers']],
                ['Curries', null, ['Chicken curry', 'Potato curry']],
                ['Rice or kottu', 'One of', ['Rice', 'Kottu']],
                ['Dessert', null, ['Papol (papaya)', 'Banana']],
            ],
        ];

        $order = 0;
        foreach ($menu as $meal => $sections) {
            foreach ($sections as [$title, $note, $items]) {
                MenuSection::create(['meal' => $meal, 'title' => $title, 'note' => $note, 'items' => $items, 'sort_order' => $order++]);
            }
        }
    }
}
