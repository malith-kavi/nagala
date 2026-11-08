<?php

namespace App\Services;

use GdImage;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use InvalidArgumentException;
use RuntimeException;

/**
 * Stores photos as compact WebP files that load quickly on a weak mobile signal: the photo itself,
 * never over 1 MB, plus smaller copies beside it for cards and thumbnails:
 *
 *     cottages/<name>.webp        up to 2048px on its long side, for the full-screen view
 *     cottages/<name>-1280.webp   main photos, and cards on phones
 *     cottages/<name>-640.webp    cards on desktop
 *     cottages/<name>-480.webp    gallery tiles and thumbnails
 *
 * Each copy is the smallest that looks the same as the original where it's shown
 * (measured on the site's own photos: smaller or lower quality visibly softens thatch and leaves).
 * The frontend's srcSetFor() (resources/js/lib/imageSrcSet.js) relies on this naming.
 * Where the server's GD can't write WebP, the same files are written as JPEG instead.
 */
class ImageOptimizer
{
    public const MAX_BYTES = 1024 * 1024;

    public const MAX_SIDE = 2048;

    /** Full-screen images (the home hero and banner) keep more pixels, so they stay sharp on phones. */
    public const MAX_SIDE_LARGE = 3200;

    /** Widths of the smaller copies, with the quality each is saved at. */
    public const VARIANTS = [480 => 75, 640 => 75, 1280 => 78];

    /** Qualities tried in turn for the photo itself until it fits in MAX_BYTES. */
    private const QUALITIES = [82, 76, 70, 64];

    /** Larger photos would need too much memory to decode (a 40 MP photo takes about 160 MB). */
    private const MAX_PIXELS = 40_000_000;

    public function __construct(private string $disk = 'uploads') {}

    /** Store an uploaded photo and its smaller copies; returns the stored photo's path. */
    public function store(UploadedFile $file, string $directory, int $maxSide = self::MAX_SIDE): string
    {
        return $this->storeContents((string) file_get_contents($file->getRealPath()), $directory, $maxSide);
    }

    /**
     * @throws InvalidArgumentException when the bytes aren't a photo GD can read (the message is shown to the admin)
     */
    public function storeContents(string $bytes, string $directory, int $maxSide = self::MAX_SIDE): string
    {
        $image = $this->decode($bytes);
        $path = trim($directory, '/').'/'.Str::random(40).'.'.$this->extension();
        $longSide = max(imagesx($image), imagesy($image));

        $main = $this->isCompact($bytes, $longSide, $maxSide)
            ? $bytes // already the right size and format (the admin's browser makes these), so it isn't compressed twice
            : $this->encodeUnder($this->scaleToWidth($image, (int) floor(imagesx($image) * min(1, $maxSide / $longSide))));

        Storage::disk($this->disk)->put($path, $main);
        $this->writeVariants($image, $path);

        return $path;
    }

    /**
     * Whether a stored photo is already compact (WebP, within 1 MB and $maxSide), so it can keep its
     * path and only needs any smaller copies it lacks, such as copies added to the site after it was
     * uploaded. Otherwise it needs converting with storeContents().
     */
    public function isCompactFile(string $path, int $maxSide = self::MAX_SIDE): bool
    {
        $disk = Storage::disk($this->disk);
        if (! str_ends_with($path, '.'.$this->extension()) || ! $disk->exists($path)) {
            return false;
        }

        $bytes = $disk->get($path);
        $size = @getimagesizefromstring($bytes);

        return $size && $this->isCompact($bytes, max($size[0], $size[1]), $maxSide);
    }

    /** Write the smaller copies a stored photo lacks, keeping its path. */
    public function completeVariants(string $path): void
    {
        $this->writeVariants($this->decode(Storage::disk($this->disk)->get($path)), $path, onlyMissing: true);
    }

    /** Delete a stored photo together with its smaller copies. */
    public function delete(string $path): void
    {
        Storage::disk($this->disk)->delete([$path, ...$this->variantPaths($path)]);
    }

    /** @return list<string> */
    public function variantPaths(string $path): array
    {
        return str_contains($path, '.') ? array_map(fn ($width) => $this->variantPath($path, $width), array_keys(self::VARIANTS)) : [];
    }

    private function variantPath(string $path, int $width): string
    {
        $dot = strrpos($path, '.');

        return substr($path, 0, $dot)."-{$width}".substr($path, $dot);
    }

    private function writeVariants(GdImage $image, string $path, bool $onlyMissing = false): void
    {
        $disk = Storage::disk($this->disk);
        foreach (self::VARIANTS as $width => $quality) {
            $variant = $this->variantPath($path, $width);
            if (! $onlyMissing || ! $disk->exists($variant)) {
                $disk->put($variant, $this->encode($this->scaleToWidth($image, $width), $quality));
            }
        }
    }

    /**
     * Decode a photo, turned the right way up and ready to scale and encode.
     *
     * @throws InvalidArgumentException when the bytes aren't a photo GD can read (the message is shown to the admin)
     */
    private function decode(string $bytes): GdImage
    {
        $size = @getimagesizefromstring($bytes);
        if (! $size) {
            throw new InvalidArgumentException('This photo could not be read. Try saving it as a JPG first.');
        }
        if ($size[0] * $size[1] > self::MAX_PIXELS) {
            throw new InvalidArgumentException('This photo has too many pixels. Please resize it below 40 megapixels.');
        }

        $image = @imagecreatefromstring($bytes);
        if (! $image instanceof GdImage) {
            throw new InvalidArgumentException('This photo could not be read. Try saving it as a JPG first.');
        }

        $image = $this->orient($image, $bytes);
        imagepalettetotruecolor($image);
        imagealphablending($image, false);
        imagesavealpha($image, true);

        return $image;
    }

    /** Already a WebP within 1 MB and $maxSide, so it can be stored as it is. */
    private function isCompact(string $bytes, int $longSide, int $maxSide): bool
    {
        return $this->extension() === 'webp' && $this->isWebp($bytes) && strlen($bytes) <= self::MAX_BYTES && $longSide <= $maxSide;
    }

    /** Whether a stored photo already has its smaller copies (photos uploaded before optimising don't). */
    public function isOptimized(string $path): bool
    {
        $disk = Storage::disk($this->disk);

        return str_ends_with($path, '.'.$this->extension())
            && collect($this->variantPaths($path))->every(fn ($variant) => $disk->exists($variant));
    }

    public function extension(): string
    {
        return function_exists('imagewebp') ? 'webp' : 'jpg';
    }

    /** Encode at the highest quality that fits in MAX_BYTES, shrinking the photo if even the lowest doesn't. */
    private function encodeUnder(GdImage $image): string
    {
        while (true) {
            foreach (self::QUALITIES as $quality) {
                $bytes = $this->encode($image, $quality);
                if (strlen($bytes) <= self::MAX_BYTES || imagesx($image) <= 320) {
                    return $bytes;
                }
            }
            $image = $this->scaleToWidth($image, (int) floor(imagesx($image) * 0.85));
        }
    }

    private function encode(GdImage $image, int $quality): string
    {
        ob_start();
        $ok = $this->extension() === 'webp'
            ? imagewebp($image, null, $quality)
            : imagejpeg($this->flatten($image), null, $quality);
        $bytes = ob_get_clean();

        if (! $ok || ! $bytes) {
            throw new RuntimeException('Could not encode the photo.');
        }

        return $bytes;
    }

    /** A copy at most $width wide, keeping the aspect ratio; never enlarged. */
    private function scaleToWidth(GdImage $image, int $width): GdImage
    {
        $w = imagesx($image);
        $h = imagesy($image);
        if ($width >= $w) {
            return $image;
        }

        $height = max(1, (int) round($h * $width / $w));
        $scaled = imagecreatetruecolor($width, $height);
        imagealphablending($scaled, false);
        imagesavealpha($scaled, true);
        imagecopyresampled($scaled, $image, 0, 0, 0, 0, $width, $height, $w, $h);

        return $scaled;
    }

    /** JPEG has no transparency, so transparent areas become white rather than black. */
    private function flatten(GdImage $image): GdImage
    {
        $flat = imagecreatetruecolor(imagesx($image), imagesy($image));
        imagefill($flat, 0, 0, imagecolorallocate($flat, 255, 255, 255));
        imagealphablending($flat, true);
        imagecopy($flat, $image, 0, 0, 0, 0, imagesx($image), imagesy($image));

        return $flat;
    }

    /** Phone cameras store photos sideways with an EXIF note to turn them; GD ignores it, so turn them here. */
    private function orient(GdImage $image, string $bytes): GdImage
    {
        if (! function_exists('exif_read_data') || ! str_starts_with($bytes, "\xFF\xD8")) {
            return $image;
        }

        $stream = fopen('php://memory', 'r+b');
        fwrite($stream, $bytes);
        rewind($stream);
        $orientation = (int) (@exif_read_data($stream)['Orientation'] ?? 1);
        fclose($stream);

        // GD rotates anticlockwise.
        $rotated = match ($orientation) {
            3, 4 => imagerotate($image, 180, 0),
            5, 6 => imagerotate($image, 270, 0),
            7, 8 => imagerotate($image, 90, 0),
            default => $image,
        };

        if (in_array($orientation, [2, 4, 5, 7], true)) {
            imageflip($rotated, IMG_FLIP_HORIZONTAL);
        }

        return $rotated;
    }

    private function isWebp(string $bytes): bool
    {
        return str_starts_with($bytes, 'RIFF') && substr($bytes, 8, 4) === 'WEBP';
    }
}
