<?php

use App\Services\ImageOptimizer;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * Adds the Aukana Buddha statue and Anuradhapura to the nearby places, each with a photo from
 * Wikimedia Commons (bundled in database/data/places) stored like an admin upload. A place whose
 * slug already exists is left alone, so nothing typed in the admin is overwritten. Each goes in
 * right after a related place, and the places after it move down one.
 */
return new class extends Migration
{
    // Snapshot of the text when this ran (DatabaseSeeder has the same), so later edits to the seeder don't change it.
    private const PLACES = [
        [
            'after' => 'balalu-wewa',
            'photo' => 'aukana.jpg',
            'name' => 'Aukana Buddha Statue',
            'slug' => 'aukana-buddha-statue',
            'tagline' => 'Heritage site',
            'short_description' => 'A majestic standing Buddha, almost 12 m tall, carved from the living rock and gazing out over Kala Wewa.',
            'description' => "The Aukana (Avukana) Buddha is one of the finest ancient standing Buddha statues in Sri Lanka. It was carved from a single granite rock face and stands almost 12 metres tall, or over 14 metres with its lotus pedestal, still joined to the rock by a narrow strip at the back. The right hand is raised in the Asisa mudra, a gesture of blessing, and the robe is carved so finely that its pleats seem to flow over the body.\n\nTradition credits the statue to King Dhatusena (5th century AD), who built Kala Wewa, and it faces east across the tank. An inscription found on the shrine wall suggests it may instead date from the 8th century. A popular legend tells of a contest between a master sculptor and his pupil: the master carved Aukana and the pupil the statue at Reswehera, and when the master finished first, the pupil laid down his tools. The statue once stood inside a large image house, whose lower walls still surround it.\n\nCome early in the morning, when the sun rises in front of the statue and lights its face, and combine your visit with Kala Wewa just below. Please dress modestly, with shoulders and knees covered, and remove shoes and hats before approaching the statue.",
            'cover_credit' => 'Photo: Michael Gunther, CC BY-SA 4.0, via Wikimedia Commons',
        ],
        [
            'after' => 'yapahuwa-rock-fortress',
            'photo' => 'anuradhapura.jpg',
            'name' => 'Anuradhapura Sacred City',
            'slug' => 'anuradhapura-sacred-city',
            'tagline' => 'Heritage site',
            'short_description' => 'Sri Lanka\'s first great capital: giant stupas, the sacred Bo tree and 1,500 years of history.',
            'description' => "Anuradhapura was the first great capital of Sri Lanka. King Pandukabhaya made it his royal city in the 4th century BC, and it remained the seat of the island's kings for around 1,500 years, until invaders from South India sacked it at the end of the 10th century. Today the Sacred City is a UNESCO World Heritage Site and one of the most important Buddhist pilgrimage sites in the world, with the ruins of palaces, monasteries, bathing ponds and reservoirs spread over a vast area.\n\nAt its heart is the Jaya Sri Maha Bodhi, a sacred Bo tree grown from a cutting of the tree under which the Buddha attained enlightenment. Planted in the 3rd century BC, it is the oldest living tree in the world planted by people on a known date. Nearby rise the great white dome of Ruwanwelisaya, built by King Dutugemunu around 140 BC and now 103 metres tall, and the Thuparamaya, the earliest stupa on the island. The brick Jetavanaramaya, built by King Mahasena, was once 122 metres high: the tallest stupa in the world and, in its day, the third tallest structure on earth after two of the pyramids of Giza. Don't miss the vast Abhayagiri monastery and the Isurumuniya rock temple with its famous carving of the Lovers.\n\nAnuradhapura is tied to Kala Wewa, one of the reservoirs near the cottage: the ancient Yoda Ela canal still carries water from Kala Wewa to Tissa Wewa in the city.\n\nPlan a full day. The sites are far apart, so most visitors get around by car, tuk-tuk or bicycle. Go early in the morning or late in the afternoon, as you walk barefoot at the sacred sites and the ground gets very hot at midday. Wear light clothes that cover shoulders and knees, and remove shoes and hats at the temples. Foreign visitors need a ticket for the archaeological areas.",
            'cover_credit' => 'Photo: KennyOMG, CC BY-SA 4.0, via Wikimedia Commons',
        ],
    ];

    public function up(): void
    {
        foreach (self::PLACES as $place) {
            if (DB::table('nearby_places')->where('slug', $place['slug'])->exists()) {
                continue;
            }

            $after = DB::table('nearby_places')->where('slug', $place['after'])->value('sort_order');
            if ($after === null) {
                $sortOrder = (DB::table('nearby_places')->max('sort_order') ?? -1) + 1;
            } else {
                $sortOrder = $after + 1;
                DB::table('nearby_places')->where('sort_order', '>=', $sortOrder)->increment('sort_order');
            }

            DB::table('nearby_places')->insert([
                ...collect($place)->except(['after', 'photo'])->all(),
                ...$this->photo($place),
                'map_url' => 'https://maps.google.com/?q='.urlencode($place['name'].', Sri Lanka'),
                'sort_order' => $sortOrder,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }

    public function down(): void
    {
        foreach (self::PLACES as $place) {
            $row = DB::table('nearby_places')->where('slug', $place['slug'])->first();
            if (! $row) {
                continue;
            }
            if ($row->cover_image && ! str_starts_with($row->cover_image, '/') && ! str_starts_with($row->cover_image, 'http')) {
                app(ImageOptimizer::class)->delete($row->cover_image);
            }
            DB::table('nearby_places')->where('id', $row->id)->delete();
            DB::table('nearby_places')->where('sort_order', '>', $row->sort_order)->decrement('sort_order');
        }
    }

    /** The cover photo, stored with its smaller copies like an admin upload; the place is still added if this fails. */
    private function photo(array $place): array
    {
        $file = database_path('data/places/'.$place['photo']);

        try {
            return ['cover_image' => app(ImageOptimizer::class)->storeContents((string) file_get_contents($file), 'places')];
        } catch (Throwable $e) {
            Log::warning("Nearby place {$place['slug']} added without its photo: {$e->getMessage()}");

            return ['cover_image' => null, 'cover_credit' => null];
        }
    }
};
