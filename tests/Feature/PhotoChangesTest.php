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

/** Photos removed in the admin leave the server, and a save that fails changes nothing. */
class PhotoChangesTest extends TestCase
{
    use RefreshDatabase;

    private array $cottage = ['name' => 'Tree House', 'max_guests' => 2, 'price_per_night' => 15000, 'units' => 1];

    private User $admin;

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('uploads');
        $this->admin = User::factory()->admin()->create();
    }

    /** The photo and its smaller copies. */
    private function files(string $path): array
    {
        return [$path, ...app(ImageOptimizer::class)->variantPaths($path)];
    }

    private function assertStored(string $path): void
    {
        foreach ($this->files($path) as $file) {
            Storage::disk('uploads')->assertExists($file);
        }
    }

    private function assertDeleted(string $path): void
    {
        foreach ($this->files($path) as $file) {
            Storage::disk('uploads')->assertMissing($file);
        }
    }

    private function photo(): UploadedFile
    {
        return UploadedFile::fake()->image('photo.jpg', 1200, 800);
    }

    /** A valid image header (so it passes validation) with a broken body, which fails when stored. */
    private function unreadable(): UploadedFile
    {
        return UploadedFile::fake()->createWithContent('broken.png', substr(UploadedFile::fake()->image('x.png', 50, 50)->getContent(), 0, 60));
    }

    private function cottageWithPhotos(): Cottage
    {
        $this->actingAs($this->admin)->post(route('admin.cottages.store'), [
            ...$this->cottage,
            'cover_image' => $this->photo(),
            'new_images' => [$this->photo(), $this->photo()],
        ])->assertSessionHasNoErrors();

        return Cottage::where('slug', 'tree-house')->firstOrFail();
    }

    public function test_a_removed_photo_leaves_the_server_and_the_gallery(): void
    {
        $cottage = $this->cottageWithPhotos();
        [$removed, $kept] = $cottage->images;

        $this->actingAs($this->admin)->put(route('admin.cottages.update', $cottage), [...$this->cottage, 'remove_images' => [$removed]])
            ->assertSessionHasNoErrors();

        $this->assertDeleted($removed);
        $this->assertFalse(GalleryImage::where('path', $removed)->exists());
        $this->assertSame([$kept], $cottage->fresh()->images);
        $this->assertStored($kept);
    }

    public function test_a_replaced_or_removed_cover_leaves_the_server(): void
    {
        $cottage = $this->cottageWithPhotos();
        $first = $cottage->cover_image;

        $this->actingAs($this->admin)->put(route('admin.cottages.update', $cottage), [...$this->cottage, 'cover_image' => $this->photo()]);
        $this->assertDeleted($first);

        $second = $cottage->fresh()->cover_image;
        $this->actingAs($this->admin)->put(route('admin.cottages.update', $cottage), [...$this->cottage, 'remove_cover_image' => true]);
        $this->assertDeleted($second);
        $this->assertNull($cottage->fresh()->cover_image);
    }

    public function test_a_failed_save_keeps_the_old_photos_and_leaves_no_new_files(): void
    {
        $cottage = $this->cottageWithPhotos();
        $before = Storage::disk('uploads')->allFiles();

        // A new cover, a photo removed and one good photo added, but another new photo can't be read.
        $this->actingAs($this->admin)->put(route('admin.cottages.update', $cottage), [
            ...$this->cottage,
            'cover_image' => $this->photo(),
            'remove_images' => [$cottage->images[0]],
            'new_images' => [$this->photo(), $this->unreadable()],
        ])->assertSessionHasErrors('new_images');

        $fresh = $cottage->fresh();
        $this->assertSame($cottage->cover_image, $fresh->cover_image);
        $this->assertSame($cottage->images, $fresh->images);
        $this->assertSame($before, Storage::disk('uploads')->allFiles());
    }

    public function test_a_failed_settings_save_keeps_the_old_hero(): void
    {
        $this->actingAs($this->admin)->post(route('admin.settings.update'), ['site_name' => 'Nagala', 'hero_image' => $this->photo()])
            ->assertSessionHasNoErrors();
        $hero = Setting::get('hero_image');
        $before = Storage::disk('uploads')->allFiles();

        $this->actingAs($this->admin)->post(route('admin.settings.update'), [
            'site_name' => 'Nagala',
            'hero_image' => $this->photo(),
            'banner_image' => $this->unreadable(),
        ])->assertSessionHasErrors('banner_image');

        $this->assertSame($hero, Setting::get('hero_image'));
        $this->assertSame($before, Storage::disk('uploads')->allFiles());
    }

    public function test_a_gallery_upload_with_an_unreadable_photo_adds_nothing(): void
    {
        $this->actingAs($this->admin)->post(route('admin.gallery.store'), [
            'images' => [$this->photo(), $this->unreadable()],
            'category' => GalleryImage::CATEGORIES[0],
        ])->assertSessionHasErrors('images');

        $this->assertSame(0, GalleryImage::count());
        $this->assertSame([], Storage::disk('uploads')->allFiles());
    }
}
