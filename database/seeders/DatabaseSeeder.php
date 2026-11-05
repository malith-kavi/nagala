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

        $perks = ['welcome_drink', 'bed_tea'];

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
                    'inclusions' => ['cabana', 'breakfast', 'lunch', 'dinner', ...$perks],
                    'sort_order' => $i,
                    'is_active' => true,
                ],
            );
        }

        $places = [
            [
                'name' => 'Siyambalangamuwa Wewa',
                'tagline' => 'Reservoir',
                'short_description' => 'An ancient reservoir credited to King Mahasena, ringed by paddy fields — lovely at sunrise and sunset.',
                'description' => "Usgala Siyambalangamuwa Wewa is an ancient reservoir whose history reaches back to the 3rd century AD. It is traditionally credited to King Mahasena (276–301 AD) of Anuradhapura, one of the island's great tank-building kings.\n\nIn the 8th century King Mahinda II enlarged it by linking it to Kala Wewa with a 16-mile channel, and it became known as Santinigamakavapi. The tank later fell into ruin, and modern restoration began in 1955. Today its waters spread over some 1,900 acres and feed the paddy fields of the Kala Oya basin.\n\nVisit early in the morning or late in the afternoon to watch the water birds and enjoy the reflections on the water.",
            ],
            [
                'name' => 'Reswehera Temple',
                'tagline' => 'Temple',
                'short_description' => 'Ancient forest monastery with a 12 m standing Buddha carved into the living rock.',
                'description' => "Reswehera (also known as Sasseruwa) is an ancient forest monastery said to have been founded by King Devanampiya Tissa in the 3rd century BC, in the earliest days of Buddhism in Sri Lanka. Its Bo tree is believed to be one of the saplings of the Sri Maha Bodhi in Anuradhapura, and the ruined stupas, moonstones and stone inscriptions on the site date back as far as the 2nd century BC.\n\nThe highlight is a towering standing Buddha, around 12 metres (40 ft) tall, carved out of the living rock and believed to date from the reign of King Mahasena (3rd century AD). It closely resembles the famous Aukana Buddha only about 10 km away, but some details were never finished. Legend says a master and his pupil carved the two statues in a race, and when the master finished Aukana first, the pupil laid down his tools at Sasseruwa.\n\nExplore the rock caves once used by meditating monks, and two cave image houses with faded murals and a large reclining Buddha. The site is surrounded by jungle, so visit in daylight only. Please dress modestly, with shoulders and knees covered.",
            ],
            [
                'name' => 'Kala Wewa',
                'tagline' => 'Reservoir',
                'short_description' => 'One of Sri Lanka\'s great ancient reservoirs, built in the 5th century.',
                'description' => "Kala Wewa was built around 460 AD by King Dhatusena, and together with its twin, Balalu Wewa, it was once the largest reservoir in Sri Lanka. Its bund stretches almost 7 km, and when full the water covers about 18 km².\n\nFrom its great central sluice flows the Yoda Ela (Jaya Ganga), an 87 km canal that carries water all the way to Tissa Wewa in Anuradhapura. Over its first 27 km the canal drops only about six inches per mile, an astonishing feat of ancient engineering. The tank was restored by King Parakramabahu the Great in the 12th century and again under British rule, and it still feeds the paddy fields of the region today.\n\nThe famous Aukana Buddha, a 12 m standing statue also attributed to King Dhatusena, stands close by overlooking the tank. Come for sunset, when the vast waters glow gold.",
            ],
            [
                'name' => 'Balalu Wewa',
                'tagline' => 'Reservoir',
                'short_description' => 'Kala Wewa\'s twin reservoir — wide water views and plenty of birdlife.',
                'description' => "Balalu Wewa lies right beside Kala Wewa and is part of the same great ancient reservoir system. According to tradition, King Dhatusena built it in the 5th century after completing Kala Wewa and joined the two tanks together. Their bund was rebuilt in 1958 to link them once again, and together they hold around 123 million cubic metres of water.\n\nStop by for wide open views across the water, local fishermen at work and plenty of water birds.",
            ],
            [
                'name' => 'Vijithapura Temple',
                'tagline' => 'Temple',
                'short_description' => 'Historic temple near Kala Wewa, said to mark King Dutugemunu\'s victory over King Elara.',
                'description' => "Vijithapura Rajamaha Viharaya stands near Kala Wewa, in a village that tradition identifies with the ancient fortress city of Vijithapura. In the 2nd century BC this was a stronghold of King Elara, ringed by three moats and high walls with iron gates. King Dutugemunu besieged it for about four months during his campaign to unite the country. The city finally fell when his war elephant Kandula and his Ten Giant Warriors broke through the southern gate.\n\nAfter the victory, Dutugemunu is said to have built a stupa here to commemorate the battle, and the temple later grew around it. Look for the ancient stone said to have been used to sharpen his army's swords, along with old guardstones and a small ancient stupa. The temple was restored by several kings and again in the late 19th century.\n\nA quiet, historic place of worship. Please dress modestly when visiting.",
            ],
            [
                'name' => 'Ananda Maha Seya',
                'tagline' => 'Temple',
                'short_description' => 'A great new stupa near Kala Wewa, dedicated to Venerable Ananda, the Buddha\'s devoted attendant.',
                'description' => "Sri Ananda Maha Seya is a great stupa being built at Galnewa, near Kala Wewa, by a Mahamevnawa meditation monastery. It is dedicated to Venerable Ananda, the Buddha's cousin and his devoted personal attendant for 25 years.\n\nAnanda is remembered as the \"Keeper of the Dhamma\". He heard and memorised the Buddha's teachings and recited them at the First Buddhist Council after the Buddha's passing, which helped preserve them for later generations. Building work is still in progress, and devotees join volunteer work (shramadana) here every day.\n\nCome in the cool of the evening to enjoy the quiet grounds. Please dress modestly and remove shoes and hats before entering.",
            ],
            [
                'name' => 'Nikawewa Nagala Temple',
                'tagline' => 'Temple',
                'short_description' => 'The ancient Sri Nagala Raja Maha Viharaya — cave temples and ruins on the slopes of Nagala mountain.',
                'description' => "Sri Nagala Raja Maha Viharaya, also known as Nagalakanda Viharaya, sits at the foot of Nagala mountain in Nikawewa. Tradition links its founding to King Devanampiya Tissa in the 3rd century BC, and local belief also credits Prince Saliya, son of King Dutugemunu. Ruins dating from the 3rd century BC to the 18th century AD are spread across some 40 acres, on five terraces of the mountain's eastern slope.\n\nAs you climb, you pass an ancient Brahmi inscription, stone pillars, moonstones and guardstones, and an old stupa conserved by the Department of Archaeology in the 1990s. Its relic chamber was found intact, holding twelve crystal and glass caskets. A long flight of steps leads up to two Kandyan-period cave temples with fading murals. The temple lay neglected for centuries until Selaratana Thero began restoring it around 1900.\n\nA tranquil place for reflection away from the crowds. Please dress modestly when visiting.",
            ],
            [
                'name' => 'Yapahuwa Rock Fortress',
                'slug' => 'yapahuwa-rock-fortress',
                'tagline' => 'Heritage site',
                'distance_km' => 12, 'travel_minutes' => 25,
                'short_description' => 'A historic rock fortress with stunning views and rich history.',
                'description' => "Yapahuwa became the capital of Sri Lanka in 1272, when King Bhuvanekabahu I moved his court here from Dambadeniya. The fortress was built on a granite rock about 90 metres high, in a style similar to Sigiriya. For twelve years it guarded the Sacred Tooth Relic, the most precious symbol of royal power.\n\nAfter the king's death in 1284, Pandyan invaders from South India captured the fortress and carried the Tooth Relic away. King Parakramabahu III won it back in 1288. Yapahuwa was then largely abandoned, and Buddhist monks made it their home.\n\nClimb the famous ornate stone staircase, guarded by carved lions (one of which appeared on the old Sri Lankan 10-rupee note), and see the remains of the Temple of the Tooth Relic at the top. Higher up are a ruined stupa, a Bo tree shrine and panoramic views from the summit, and caves at the base hold a Kandyan-period temple with murals.\n\nBest visited early morning or late afternoon. Allow 2–3 hours.",
                'map_url' => 'https://maps.google.com/?q=Yapahuwa+Rock+Fortress',
            ],
            [
                'name' => 'Deduru Oya Reservoir',
                'tagline' => 'Reservoir',
                'short_description' => 'A vast reservoir on the Deduru Oya — big skies and beautiful sunsets.',
                'description' => "The Deduru Oya Reservoir is one of the largest reservoirs in the region. It was built between 2008 and 2014 near Wariyapola, where a 2.4 km dam holds back the Deduru Oya, one of the major rivers of the North Western Province, which flows on to the sea at Chilaw.\n\nThe reservoir stores around 75 million cubic metres of water and irrigates some 11,000 hectares of farmland, and a small hydropower station at the dam generates electricity. A 33 km canal also carries its water across to the Inginimitiya Reservoir.\n\nThe long dam and wide waters make a great stop for photos, and the sunsets here are beautiful.",
            ],
            [
                'name' => 'Hakwatunawa Lake',
                'slug' => 'hakwatunawa-lake',
                'tagline' => 'Reservoir',
                'distance_km' => 8, 'travel_minutes' => 15,
                'short_description' => 'A serene lake perfect for relaxation and photography.',
                'description' => "Hakwatuna Oya Wewa is a large reservoir in the Polpithigama area. It was formed by damming the Hakwatuna Oya, a tributary of the Deduru Oya known in ancient times as the Sankhamadhamandu-nadi. Local belief holds that a great tank was first built here by King Mahasena (276–301 AD) and later restored by King Parakramabahu the Great.\n\nThe present tank was built between 1957 and 1964, with a bund of around 2,900 feet stretching between the hillocks of Kepitigala and Koragahahena. When full it covers about 960 acres and waters around 6,000 acres of paddy fields. The ancient Viharagala Purana Viharaya lies just 700 m to the northeast.\n\nSurrounded by paddy fields and mountains, the lake is perfect for an evening walk, bird watching or photographing the reflections at sunrise.",
                'map_url' => 'https://maps.google.com/?q=Hakwatuna+Oya+Reservoir',
            ],
            [
                'name' => 'Kaballelena Temple',
                'tagline' => 'Temple',
                'short_description' => 'An ancient rock cave temple in Maeliya, with Brahmi inscriptions and traces of prehistoric life.',
                'description' => "Kaballelena Purana Raja Maha Viharaya lies in Maeliya village in the Polpithigama area. People have lived here since prehistoric times. Quartz stone tools are still found across the temple grounds, and the great rock cave probably sheltered early people long before it became a place of worship.\n\nThe cave was later turned into a rare three-level cave temple, with an image house at the top, a sermon hall in the middle and a shrine to the deities below. Guardian figures and carved lions stand at the entrance. Inside are seated Buddha statues, deities and Bodhisattvas, with ceiling and wall paintings in striking blue tones. Several ancient Brahmi inscriptions and a conserved ancient stupa survive on the site, and the temple has been a protected archaeological monument since 1965.\n\nCombine it with a drive through the surrounding countryside. Please dress modestly when visiting.",
            ],
            [
                'name' => 'Nayindanawa Temple',
                'tagline' => 'Temple',
                'short_description' => 'An ancient village temple, famous for a giant seven-headed cobra carved into the rock.',
                'description' => "Nayindanawa Raja Maha Viharaya is an ancient temple in a remote village near Polpithigama. Its name is said to come from its most remarkable feature, a giant seven-headed cobra (naya) carved into the rock. The carving may date from the reign of King Mahasena (3rd century AD), or it may go back even further, to the worship of the ancient Naga people.\n\nTradition dates the temple to King Devanampiya Tissa (3rd century BC), who is credited with its ancient stupa, and says it was home to one of the first sixty monks ordained by Arahant Mahinda. A rock inscription records that a devoted layman named Gotaimbara gave a drip-ledged cave to an Arahant monk called Kujjitissa, and a statue carved nearby is believed to depict him.\n\nLook out too for two rock-carved Bahirawa guardian figures, a Buddha statue from the Polonnaruwa period and many carved stone slabs of the Buddha's footprints. A peaceful, little-visited temple in a quiet rural setting. Please dress modestly when visiting.",
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
