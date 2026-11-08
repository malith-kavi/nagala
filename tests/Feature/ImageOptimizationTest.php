<?php

namespace Tests\Feature;

use App\Models\Cottage;
use App\Models\GalleryImage;
use App\Models\Setting;
use App\Models\User;
use App\Services\ImageOptimizer;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ImageOptimizationTest extends TestCase
{
    use RefreshDatabase;

    private array $cottage = ['name' => 'Tree House', 'max_guests' => 2, 'price_per_night' => 15000, 'units' => 1];

    private function files(string $path): array
    {
        return [$path, ...app(ImageOptimizer::class)->variantPaths($path)];
    }

    /** A JPEG of random noise, which compresses badly, so it tests the 1 MB limit. */
    private function noisyJpeg(int $width, int $height): string
    {
        $image = imagecreatetruecolor($width, $height);
        for ($y = 0; $y < $height; $y += 2) {
            for ($x = 0; $x < $width; $x += 2) {
                imagefilledrectangle($image, $x, $y, $x + 1, $y + 1, random_int(0, 0xFFFFFF));
            }
        }
        ob_start();
        imagejpeg($image, null, 95);

        return ob_get_clean();
    }

    public function test_uploads_are_stored_as_webp_with_smaller_copies(): void
    {
        Storage::fake('uploads');
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)->post(route('admin.cottages.store'), [
            ...$this->cottage,
            'cover_image' => UploadedFile::fake()->image('cover.jpg', 3000, 2000),
        ])->assertRedirect(route('admin.cottages.index'));

        $path = Cottage::where('slug', 'tree-house')->value('cover_image');
        $this->assertStringEndsWith('.webp', $path);

        $disk = Storage::disk('uploads');
        [$full, $tile, $small, $medium] = $this->files($path);
        foreach ([$full => [2048, 1365], $tile => [480, 320], $small => [640, 427], $medium => [1280, 853]] as $file => $size) {
            $disk->assertExists($file);
            $this->assertSame('image/webp', getimagesizefromstring($disk->get($file))['mime']);
            $this->assertSame($size, array_slice(getimagesizefromstring($disk->get($file)), 0, 2), $file);
        }
    }

    public function test_stored_photos_never_exceed_one_megabyte(): void
    {
        Storage::fake('uploads');

        $path = app(ImageOptimizer::class)->storeContents($this->noisyJpeg(1800, 1200), 'gallery');

        $bytes = Storage::disk('uploads')->get($path);
        $this->assertLessThanOrEqual(ImageOptimizer::MAX_BYTES, strlen($bytes));
        $this->assertGreaterThan(0, getimagesizefromstring($bytes)[0]);
    }

    public function test_photos_over_one_megabyte_are_rejected(): void
    {
        Storage::fake('uploads');
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)->post(route('admin.gallery.store'), [
            'images' => [UploadedFile::fake()->image('big.jpg')->size(1500)],
            'category' => GalleryImage::CATEGORIES[0],
        ])->assertSessionHasErrors(['images.0' => 'Each photo must be 1 MB or smaller.']);

        $this->actingAs($admin)->post(route('admin.settings.update'), [
            'site_name' => 'Nagala',
            'hero_image' => UploadedFile::fake()->image('hero.jpg')->size(1025),
        ])->assertSessionHasErrors(['hero_image' => 'Each photo must be 1 MB or smaller.']);
    }

    public function test_unreadable_photos_get_a_validation_error(): void
    {
        Storage::fake('uploads');
        $admin = User::factory()->admin()->create();
        // A valid image header (so it passes the image rule) with a broken body.
        $broken = UploadedFile::fake()->createWithContent('broken.png', substr(UploadedFile::fake()->image('x.png', 50, 50)->getContent(), 0, 60));

        $this->actingAs($admin)->post(route('admin.cottages.store'), [...$this->cottage, 'cover_image' => $broken])
            ->assertSessionHasErrors('cover_image');
        $this->assertSame(0, Cottage::count());
    }

    public function test_hero_images_keep_more_pixels(): void
    {
        Storage::fake('uploads');
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)->post(route('admin.settings.update'), [
            'site_name' => 'Nagala',
            'hero_image' => UploadedFile::fake()->image('hero.jpg', 4000, 2000),
        ])->assertSessionHasNoErrors();

        $path = Setting::get('hero_image');
        $this->assertSame([3200, 1600], array_slice(getimagesizefromstring(Storage::disk('uploads')->get($path)), 0, 2));
    }

    public function test_removing_a_photo_deletes_its_smaller_copies(): void
    {
        Storage::fake('uploads');
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)->post(route('admin.cottages.store'), [...$this->cottage, 'new_images' => [UploadedFile::fake()->image('a.jpg', 1500, 1000)]]);
        $cottage = Cottage::where('slug', 'tree-house')->firstOrFail();
        $files = $this->files($cottage->images[0]);
        foreach ($files as $file) {
            Storage::disk('uploads')->assertExists($file);
        }

        $this->actingAs($admin)->put(route('admin.cottages.update', $cottage), [...$this->cottage, 'remove_images' => $cottage->images]);

        foreach ($files as $file) {
            Storage::disk('uploads')->assertMissing($file);
        }
    }

    public function test_command_converts_photos_uploaded_before_optimising(): void
    {
        Storage::fake('uploads');
        $disk = Storage::disk('uploads');
        $disk->put('cottages/old.jpg', UploadedFile::fake()->image('old.jpg', 2560, 1920)->getContent());
        $disk->put('site/old-hero.jpg', UploadedFile::fake()->image('hero.jpg', 1600, 900)->getContent());

        $cottage = Cottage::factory()->create(['cover_image' => 'cottages/old.jpg', 'images' => ['cottages/old.jpg', 'cottages/missing.jpg']]);
        $gallery = GalleryImage::create(['path' => 'cottages/old.jpg', 'category' => 'cottages', 'cottage_id' => $cottage->id]);
        Setting::put(['hero_image' => 'site/old-hero.jpg', 'hero_image_dark' => '/images/hero_d.jpg']);

        $this->artisan('images:optimize', ['--dry-run' => true])->assertSuccessful();
        $this->assertSame('cottages/old.jpg', $cottage->fresh()->cover_image);

        $this->artisan('images:optimize', ['--delete-originals' => true])->assertSuccessful();

        $cottage->refresh();
        $new = $cottage->cover_image;
        $this->assertStringEndsWith('.webp', $new);
        $this->assertStringStartsWith('cottages/', $new);
        // The same photo used in several places is converted once, and every place points at it.
        $this->assertSame([$new, 'cottages/missing.jpg'], $cottage->images);
        $this->assertSame($new, $gallery->fresh()->path);
        foreach ($this->files($new) as $file) {
            $disk->assertExists($file);
        }
        $disk->assertMissing('cottages/old.jpg');

        $this->assertStringEndsWith('.webp', Setting::get('hero_image'));
        $this->assertSame('/images/hero_d.jpg', Setting::get('hero_image_dark'));

        // Running it again changes nothing.
        $this->artisan('images:optimize')->assertSuccessful();
        $this->assertSame($new, $cottage->fresh()->cover_image);
    }

    public function test_command_adds_newer_copy_sizes_to_optimized_photos_in_place(): void
    {
        Storage::fake('uploads');
        $disk = Storage::disk('uploads');
        $optimizer = app(ImageOptimizer::class);

        // A photo optimised before the 480px copy existed.
        $path = $optimizer->storeContents(UploadedFile::fake()->image('a.jpg', 2000, 1500)->getContent(), 'cottages');
        $tile = $optimizer->variantPaths($path)[0];
        $disk->delete($tile);
        $photo = $disk->get($path);
        $cottage = Cottage::factory()->create(['cover_image' => $path]);

        $this->artisan('images:optimize', ['--dry-run' => true])->assertSuccessful();
        $disk->assertMissing($tile);

        $this->artisan('images:optimize', ['--delete-originals' => true])->assertSuccessful();

        $this->assertSame($path, $cottage->fresh()->cover_image);
        $this->assertSame($photo, $disk->get($path), 'The photo itself is left untouched.');
        $this->assertSame([480, 360], array_slice(getimagesizefromstring($disk->get($tile)), 0, 2));
    }
}
