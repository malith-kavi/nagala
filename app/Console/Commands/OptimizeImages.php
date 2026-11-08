<?php

namespace App\Console\Commands;

use App\Models\Cottage;
use App\Models\GalleryImage;
use App\Models\NearbyPlace;
use App\Models\Package;
use App\Models\Setting;
use App\Services\ImageOptimizer;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;
use InvalidArgumentException;

/**
 * Converts photos uploaded before uploads were optimised into compact WebP files with smaller
 * copies (see ImageOptimizer), and points the database at the new files. Photos that are
 * already compact WebP files keep their path and just get any smaller copies they lack (such as
 * a copy size added to the site later). Safe to run again: finished photos are skipped.
 */
class OptimizeImages extends Command
{
    protected $signature = 'images:optimize
        {--dry-run : Only list the photos that would be converted}
        {--delete-originals : Delete each original file once everything pointing at it uses the new one}';

    protected $description = 'Convert uploaded photos to compact WebP with smaller copies for faster pages';

    /** @var array<string, string> original path => new path, so a photo used twice (a cottage photo in the gallery) is converted once */
    private array $converted = [];

    private int $toConvert = 0;

    private int $completed = 0;

    private int $missing = 0;

    private int $failed = 0;

    public function handle(ImageOptimizer $optimizer): int
    {
        $dryRun = (bool) $this->option('dry-run');
        $this->converted = [];
        $this->toConvert = $this->completed = $this->missing = $this->failed = 0;

        $convert = function (?string $path, int $maxSide = ImageOptimizer::MAX_SIDE) use ($optimizer, $dryRun): ?string {
            if (! $path || str_starts_with($path, 'http') || str_starts_with($path, '/')) {
                return $path; // bundled /images/... or an external link
            }
            if (isset($this->converted[$path])) {
                return $this->converted[$path];
            }
            if ($optimizer->isOptimized($path)) {
                return $path;
            }

            $disk = Storage::disk('uploads');
            if (! $disk->exists($path)) {
                $this->missing++;
                $this->warn("Missing, skipped: {$path}");

                return $path;
            }

            // Already a compact WebP that only lacks a newer smaller copy: it keeps its path.
            $compact = $optimizer->isCompactFile($path, $maxSide);
            $compact ? $this->completed++ : $this->toConvert++;

            if ($dryRun) {
                $this->line(($compact ? 'Would add smaller copies: ' : 'Would convert: ').$path.' ('.round($disk->size($path) / 1024).' KB)');

                return $this->converted[$path] = $path;
            }

            try {
                if ($compact) {
                    $optimizer->completeVariants($path);
                    $this->line("Added smaller copies: {$path}");

                    return $this->converted[$path] = $path;
                }
                $new = $optimizer->storeContents($disk->get($path), dirname($path), $maxSide);
            } catch (InvalidArgumentException $e) {
                $compact ? $this->completed-- : $this->toConvert--;
                $this->failed++;
                $this->error("Could not convert {$path}: {$e->getMessage()}");

                return $path;
            }

            $this->line("{$path} (".round($disk->size($path) / 1024).' KB) → '.$new.' ('.round($disk->size($new) / 1024).' KB)');

            return $this->converted[$path] = $new;
        };

        foreach ([Cottage::class, NearbyPlace::class] as $model) {
            $model::query()->each(function ($record) use ($convert, $dryRun) {
                $record->cover_image = $convert($record->cover_image);
                $record->images = array_map(fn ($path) => $convert($path), $record->images ?? []);
                $dryRun || $record->save();
            });
        }

        Package::query()->each(function (Package $package) use ($convert, $dryRun) {
            $package->cover_image = $convert($package->cover_image);
            $dryRun || $package->save();
        });

        GalleryImage::query()->each(function (GalleryImage $image) use ($convert, $dryRun) {
            $image->path = $convert($image->path);
            $dryRun || $image->save();
        });

        $settings = [];
        foreach (Setting::IMAGE_KEYS as $key) {
            $path = Setting::get($key) ?: null;
            $new = $convert($path, ImageOptimizer::MAX_SIDE_LARGE);
            if ($new !== $path) {
                $settings[$key] = $new;
            }
        }
        if ($settings && ! $dryRun) {
            Setting::put($settings);
        }

        $changed = array_filter($this->converted, fn ($new, $old) => $new !== $old, ARRAY_FILTER_USE_BOTH);

        if ($this->option('delete-originals') && ! $dryRun) {
            Storage::disk('uploads')->delete(array_keys($changed));
            $this->info('Deleted '.count($changed).' original file(s).');
        }

        $this->info(($dryRun ? 'Would convert ' : 'Converted ')."{$this->toConvert} photo(s)"
            .($this->completed ? ($dryRun ? ' and add' : ' and added')." smaller copies to {$this->completed} more" : '').'.'
            .($this->missing ? " {$this->missing} missing." : '')
            .($this->failed ? " {$this->failed} could not be read." : ''));

        return $this->failed ? self::FAILURE : self::SUCCESS;
    }
}
