<?php

namespace Database\Seeders;

use App\Models\Cottage;
use App\Models\GalleryImage;
use App\Models\NearbyPlace;
use App\Models\Package;
use App\Models\Setting;
use Illuminate\Database\Seeder;

/**
 * Fills empty image slots with the bundled sample photos in public/images/samples
 * so the site can be reviewed against the design. Never overwrites uploaded images.
 */
class SampleImagesSeeder extends Seeder
{
    private const DIR = '/images/samples/';

    public function run(): void
    {
        $cottages = [
            'couple-cottage' => ['cabana-standard.jpg', ['cabana-veranda.jpg', 'cabana-interior.jpg', 'cabana-garden.jpg']],
            'family-cottage-i' => ['cabana-deluxe.jpg', ['cabana-interior.jpg', 'cabana-veranda.jpg', 'nature-hills.jpg']],
            'large-family-cottage' => ['cabana-family.jpg', ['cabana-garden.jpg', 'cabana-interior.jpg', 'cabana-veranda.jpg']],
            'family-cottage-ii' => ['cabana-garden.jpg', ['cabana-veranda.jpg', 'cabana-interior.jpg', 'nature-palms.jpg']],
        ];

        foreach ($cottages as $slug => [$cover, $images]) {
            $cottage = Cottage::where('slug', $slug)->first();
            if (! $cottage) {
                continue;
            }

            $cottage->cover_image ??= self::DIR.$cover;
            if (empty($cottage->images)) {
                $cottage->images = array_map(fn ($file) => self::DIR.$file, $images);
            }
            $cottage->save();
        }

        $this->fillCovers(Package::class, [
            'couple-full-board' => 'package-couple.jpg',
            'family-full-board-4-guests' => 'package-family.jpg',
            'family-full-board-5-guests' => 'food-rice-curry.jpg',
        ]);

        // Real photos of each place from Wikimedia Commons, credited on the place page.
        $places = [
            'siyambalangamuwa-wewa' => ['place-siyambalangamuwa.jpg', 'Nethma Bro, CC0'],
            'reswehera-temple' => ['place-reswehera.jpg', 'Sherath2006, CC BY-SA 4.0'],
            'kala-wewa' => ['place-kala-wewa.jpg', 'HutchND, CC BY-SA 4.0'],
            'balalu-wewa' => ['place-balalu-wewa.jpg', 'Nuwaiza Naseem, CC BY-SA 4.0'],
            'vijithapura-temple' => ['place-vijithapura.jpg', 'Pasanm79, CC BY-SA 3.0'],
            'yapahuwa-rock-fortress' => ['place-yapahuwa.jpg', 'Dulakshi, CC BY-SA 4.0'],
            'deduru-oya-reservoir' => ['place-deduru-oya.jpg', 'Imantha025, CC BY-SA 4.0'],
        ];

        $this->fillCovers(NearbyPlace::class, array_map(fn ($photo) => $photo[0], $places));

        foreach ($places as $slug => [$file, $credit]) {
            NearbyPlace::where('slug', $slug)->where('cover_image', self::DIR.$file)
                ->update(['cover_credit' => "Photo: {$credit}, via Wikimedia Commons"]);
        }

        // The earlier Hakwatunawa cover was a photo of a different lake.
        NearbyPlace::where('slug', 'hakwatunawa-lake')->where('cover_image', self::DIR.'place-hakwatunawa.jpg')
            ->update(['cover_image' => null, 'cover_credit' => null]);

        $settings = array_filter([
            'hero_image' => Setting::get('hero_image') ? null : '/images/hero_l.jpg',
            'hero_image_dark' => Setting::get('hero_image_dark') ? null : '/images/hero_d.jpg',
            'banner_image' => Setting::get('banner_image') ? null : self::DIR.'banner.jpg',
        ]);
        if ($settings) {
            Setting::put($settings);
        }

        if (GalleryImage::exists()) {
            return;
        }

        $gallery = [
            ['hero.jpg', 'Our eco cottages among the gardens', 'cottages'],
            ['cabana-standard.jpg', 'The Couple Cottage', 'cottages'],
            ['cabana-deluxe.jpg', 'Family Cottage I', 'cottages'],
            ['cabana-veranda.jpg', 'A quiet veranda to unwind', 'cottages'],
            ['banner.jpg', 'Sunset over the hills', 'nature'],
            ['nature-hills.jpg', 'Golden evening over the mountains', 'nature'],
            ['nature-palms.jpg', 'Shady palm groves', 'nature'],
            ['place-yapahuwa.jpg', 'The ancient staircase at Yapahuwa', 'places'],
            ['place-hakwatunawa.jpg', 'Hakwatunawa Lake', 'places'],
            ['place-nikawewa.jpg', 'Sunset at Nikawewa Reservoir', 'places'],
            ['food-rice-curry.jpg', 'Traditional Sri Lankan rice and curry', 'food'],
            ['package-family.jpg', 'Family meals together', 'food'],
            ['activity-boating.jpg', 'Boat rides along the river', 'activities'],
            ['package-adventure.jpg', 'Guided nature hikes', 'activities'],
            ['place-village.jpg', 'Walks through the paddy fields', 'activities'],
        ];

        foreach ($gallery as $i => [$file, $caption, $category]) {
            GalleryImage::create(['path' => self::DIR.$file, 'caption' => $caption, 'category' => $category, 'sort_order' => $i]);
        }
    }

    /** @param  class-string<\Illuminate\Database\Eloquent\Model>  $model */
    private function fillCovers(string $model, array $files): void
    {
        foreach ($files as $slug => $file) {
            $model::where('slug', $slug)->whereNull('cover_image')->update(['cover_image' => self::DIR.$file]);
        }
    }
}
