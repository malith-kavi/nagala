<?php

namespace App\Support;

use App\Services\ImageOptimizer;

/**
 * The first photo a page shows (the home hero, an inner page's header, or the main photo of a
 * cottage, place or package) as attributes for a
 * <link rel="preload" as="image"> in app.blade.php, so it downloads alongside the page's scripts
 * instead of after them, which matters most on a weak signal.
 *
 * A preload must name exactly the copy the page's <img> will pick, or the photo would download
 * twice. So this follows how ImageWithFallback.jsx builds its <picture>, and reads the copies and
 * `sizes` from the file the page itself uses: resources/js/lib/bundledImages.json.
 */
class FirstPhotoPreload
{
    /** Pages showing PageHeader with its default photo (Dining has a photo of its own). */
    private const DEFAULT_HEADER_PAGES = ['Book', 'Contact', 'Gallery', 'Cottages/Index', 'Packages/Index', 'Places/Index'];

    /** Pages opening with a PhotoGallery, and the prop holding the cottage or place it shows (also its gallerySizes key). */
    private const GALLERY_PAGES = ['Cottages/Show' => 'cottage', 'Places/Show' => 'place'];

    private const DARK = '(prefers-color-scheme: dark)';

    private static ?array $bundled = null;

    /** @return list<array<string, string>> */
    public static function for(array $page): array
    {
        $bundled = self::bundled();
        $settings = $page['props']['settings'] ?? [];

        if ($page['component'] === 'Home' && ! empty($settings['hero_image_url'])) {
            $dark = $settings['hero_image_dark_url'] ?? null;
            if (! $dark) {
                return [self::preload($settings['hero_image_url'], $bundled['heroSizes'])];
            }

            // Dark mode shows the night photo, which has no AVIF copies; everyone else the day one.
            return [
                self::preload($settings['hero_image_url'], $bundled['heroSizes'], 'not all and '.self::DARK),
                self::preload($dark, $bundled['heroSizes'], self::DARK, avif: false),
            ];
        }

        if (in_array($page['component'], self::DEFAULT_HEADER_PAGES, true)) {
            return [self::preload($bundled['headerImage'], $bundled['headerSizes'])];
        }

        if ($prop = self::GALLERY_PAGES[$page['component']] ?? null) {
            return self::galleryPhoto($page['props'][$prop] ?? [], $bundled['gallerySizes'][$prop]);
        }

        if ($page['component'] === 'Packages/Show' && ! empty($page['props']['package']['cover_image_url'])) {
            return [self::preload($page['props']['package']['cover_image_url'], $bundled['packagePhotoSizes'])];
        }

        return [];
    }

    /** The main photo of PhotoGallery.jsx: the cover (or else the first photo), drawn smaller when tiles sit beside it. */
    private static function galleryPhoto(array $item, array $sizes): array
    {
        $photos = array_values(array_filter([$item['cover_image_url'] ?? null, ...($item['image_urls'] ?? [])]));
        if (! $photos) {
            return [];
        }

        return [self::preload($photos[0], count($photos) > 1 ? $sizes['main'] : $sizes['alone'])];
    }

    /** The first source the <picture> offers for this photo: AVIF, then WebP, then the photo's own copies. */
    private static function preload(string $src, string $sizes, ?string $media = null, bool $avif = true): array
    {
        $copies = self::bundled()['copies'][$src] ?? [];
        $uploaded = self::uploadedSrcSet($src);

        if ($avif && isset($copies['avif'])) {
            $attributes = ['type' => 'image/avif', 'imagesrcset' => $copies['avif'], 'imagesizes' => $sizes];
        } elseif (isset($copies['webp'])) {
            $attributes = ['type' => 'image/webp', 'imagesrcset' => $copies['webp'], 'imagesizes' => $sizes];
        } elseif ($uploaded) {
            $attributes = ['imagesrcset' => $uploaded, 'imagesizes' => $sizes];
        } else {
            $attributes = ['href' => $src];
        }

        return $media ? [...$attributes, 'media' => $media] : $attributes;
    }

    /** The twin of srcSetFor() in resources/js/lib/imageSrcSet.js: an uploaded photo's smaller copies. */
    private static function uploadedSrcSet(string $url): ?string
    {
        if (! preg_match('#^(.*/uploads/.+)\.webp$#', $url, $match)) {
            return null;
        }

        $base = $match[1];
        $copies = array_map(fn ($width) => "{$base}-{$width}.webp {$width}w", array_keys(ImageOptimizer::VARIANTS));

        return implode(', ', [...$copies, "{$url} ".ImageOptimizer::MAX_SIDE.'w']);
    }

    private static function bundled(): array
    {
        return self::$bundled ??= json_decode(
            file_get_contents(resource_path('js/lib/bundledImages.json')),
            true,
            flags: JSON_THROW_ON_ERROR,
        );
    }
}
