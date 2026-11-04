<?php

namespace Tests\Feature;

use App\Models\Cabana;
use App\Models\GalleryImage;
use App\Models\Setting;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class AdminAccessTest extends TestCase
{
    use RefreshDatabase;

    public function test_guests_are_redirected_to_login(): void
    {
        $this->get('/admin')->assertRedirect(route('login'));
    }

    public function test_non_admin_users_are_forbidden(): void
    {
        $this->actingAs(User::factory()->create())->get('/admin')->assertForbidden();
    }

    public function test_registration_is_disabled(): void
    {
        $this->get('/register')->assertNotFound();
    }

    public function test_admin_can_view_every_admin_page(): void
    {
        $this->seed();
        $admin = User::factory()->admin()->create();
        $cabana = Cabana::first();

        foreach ([
            route('admin.dashboard'), route('admin.bookings.index'), route('admin.cabanas.index'),
            route('admin.cabanas.create'), route('admin.cabanas.edit', $cabana), route('admin.packages.index'),
            route('admin.packages.create'), route('admin.places.index'), route('admin.places.create'),
            route('admin.gallery.index'), route('admin.messages.index'), route('admin.settings.edit'),
            route('profile.edit'),
        ] as $url) {
            $this->actingAs($admin)->get($url)->assertOk();
        }
    }

    public function test_admin_can_create_cabana_with_photos(): void
    {
        Storage::fake('public');
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)->post(route('admin.cabanas.store'), [
            'name' => 'Tree House',
            'max_guests' => 2,
            'price_per_night' => 15000,
            'units' => 1,
            'features' => "Forest View\nBalcony",
            'is_active' => true,
            'cover_image' => UploadedFile::fake()->image('cover.jpg', 1200, 800),
            'new_images' => [UploadedFile::fake()->image('a.jpg'), UploadedFile::fake()->image('b.jpg')],
        ])->assertRedirect(route('admin.cabanas.index'));

        $cabana = Cabana::where('slug', 'tree-house')->firstOrFail();
        $this->assertSame(['Forest View', 'Balcony'], $cabana->features);
        $this->assertCount(2, $cabana->images);
        Storage::disk('public')->assertExists($cabana->cover_image);

        $this->get(route('cabanas.show', 'tree-house'))->assertOk();
    }

    public function test_admin_can_reorder_cabana_photos(): void
    {
        Storage::fake('public');
        $admin = User::factory()->admin()->create();
        $cabana = Cabana::create([
            'name' => 'Tree House', 'slug' => 'tree-house', 'max_guests' => 2, 'price_per_night' => 15000, 'units' => 1,
            'images' => ['cabanas/a.jpg', 'cabanas/b.jpg', 'cabanas/c.jpg'],
        ]);

        $this->actingAs($admin)->put(route('admin.cabanas.update', $cabana), [
            'name' => 'Tree House',
            'max_guests' => 2,
            'price_per_night' => 15000,
            'units' => 1,
            'is_active' => true,
            'new_images' => [UploadedFile::fake()->image('d.jpg')],
            'remove_images' => ['cabanas/b.jpg'],
            'image_order' => ['cabanas/c.jpg', 'new:0', 'cabanas/a.jpg'],
        ])->assertRedirect(route('admin.cabanas.index'));

        $images = $cabana->fresh()->images;
        $this->assertCount(3, $images);
        $this->assertSame('cabanas/c.jpg', $images[0]);
        $this->assertNotContains($images[1], ['cabanas/a.jpg', 'cabanas/b.jpg', 'cabanas/c.jpg']);
        $this->assertSame('cabanas/a.jpg', $images[2]);
    }

    public function test_admin_can_upload_gallery_images_and_update_settings(): void
    {
        Storage::fake('public');
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)->post(route('admin.gallery.store'), [
            'images' => [UploadedFile::fake()->image('x.jpg'), UploadedFile::fake()->image('y.jpg')],
            'category' => 'nature',
        ])->assertSessionHas('success');
        $this->assertSame(2, GalleryImage::count());

        $this->actingAs($admin)->post(route('admin.settings.update'), [
            'site_name' => 'Nagala Eco Cottage',
            'phone' => '+94 70 111 2222',
            'whatsapp' => '94701112222',
            'hero_image' => UploadedFile::fake()->image('hero.jpg', 1920, 1080),
        ])->assertSessionHas('success');

        $this->assertSame('+94 70 111 2222', Setting::get('phone'));
        Storage::disk('public')->assertExists(Setting::get('hero_image'));
    }
}
