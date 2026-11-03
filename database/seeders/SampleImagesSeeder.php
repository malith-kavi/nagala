<?php

namespace Database\Seeders;

use App\Models\Cabana;
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
        $cabanas = [
            'standard-cabana' => ['cabana-standard.jpg', ['cabana-veranda.jpg', 'cabana-interior.jpg', 'cabana-garden.jpg']],
            'deluxe-cabana' => ['cabana-deluxe.jpg', ['cabana-interior.jpg', 'cabana-veranda.jpg', 'nature-hills.jpg']],
            'family-cabana' => ['cabana-family.jpg', ['cabana-garden.jpg', 'cabana-interior.jpg', 'cabana-veranda.jpg']],
        ];

        foreach ($cabanas as $slug => [$cover, $images]) {
            $cabana = Cabana::where('slug', $slug)->first();
            if (! $cabana) {
                continue;
            }

            $cabana->cover_image ??= self::DIR.$cover;
            if (empty($cabana->images)) {
                $cabana->images = array_map(fn ($file) => self::DIR.$file, $images);
            }
            $cabana->save();
        }

        $this->fillCovers(Package::class, [
            'couple-package' => 'package-couple.jpg',
            'family-package' => 'package-family.jpg',
            'adventure-package' => 'package-adventure.jpg',
        ]);

        $this->fillCovers(NearbyPlace::class, [
            'yapahuwa-rock-fortress' => 'place-yapahuwa.jpg',
            'hakwatunawa-lake' => 'place-hakwatunawa.jpg',
            'nikawewa-reservoir' => 'place-nikawewa.jpg',
            'village-experiences' => 'place-village.jpg',
        ]);

        $settings = array_filter([
            'hero_image' => Setting::get('hero_image') ? null : self::DIR.'hero.jpg',
            'banner_image' => Setting::get('banner_image') ? null : self::DIR.'banner.jpg',
        ]);
        if ($settings) {
            Setting::put($settings);
        }

        if (GalleryImage::exists()) {
            return;
        }

        $gallery = [
            ['hero.jpg', 'Our eco cabanas among the gardens', 'cabanas'],
            ['cabana-standard.jpg', 'Standard Cabana with private veranda', 'cabanas'],
            ['cabana-deluxe.jpg', 'Deluxe Cabana with mountain views', 'cabanas'],
            ['cabana-veranda.jpg', 'A quiet veranda to unwind', 'cabanas'],
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
