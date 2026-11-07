<?php

namespace Tests\Feature;

use App\Models\Cottage;
use App\Models\GalleryImage;
use App\Models\MenuSection;
use App\Models\NearbyPlace;
use App\Models\Package;
use App\Models\Setting;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;
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
        $cottage = Cottage::first();

        foreach ([
            route('admin.dashboard'), route('admin.bookings.index'), route('admin.cottages.index'),
            route('admin.cottages.create'), route('admin.cottages.edit', $cottage), route('admin.packages.index'),
            route('admin.packages.create'), route('admin.places.index'), route('admin.places.create'),
            route('admin.menu.index'), route('admin.menu.create'), route('admin.menu.edit', MenuSection::first()),
            route('admin.gallery.index'), route('admin.messages.index'), route('admin.settings.edit'),
            route('profile.edit'),
        ] as $url) {
            $this->actingAs($admin)->get($url)->assertOk();
        }
    }

    public function test_admin_can_create_cottage_with_photos(): void
    {
        Storage::fake('uploads');
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)->post(route('admin.cottages.store'), [
            'name' => 'Tree House',
            'max_guests' => 2,
            'price_per_night' => 15000,
            'units' => 1,
            'features' => ['garden_view', 'wifi', 'veranda'],
            'is_active' => true,
            'cover_image' => UploadedFile::fake()->image('cover.jpg', 1200, 800),
            'new_images' => [UploadedFile::fake()->image('a.jpg'), UploadedFile::fake()->image('b.jpg')],
        ])->assertRedirect(route('admin.cottages.index'));

        $cottage = Cottage::where('slug', 'tree-house')->firstOrFail();
        // Stored in the site's list order, whatever order they were ticked in.
        $this->assertSame(['wifi', 'veranda', 'garden_view'], $cottage->features);
        $this->assertSame('Free Wi-Fi', $cottage->feature_list[0]['label']);
        $this->assertCount(2, $cottage->images);
        Storage::disk('uploads')->assertExists($cottage->cover_image);

        $this->get(route('cottages.show', 'tree-house'))->assertOk();
    }

    public function test_cottage_features_must_come_from_the_list(): void
    {
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)->post(route('admin.cottages.store'), [
            'name' => 'Tree House',
            'max_guests' => 2,
            'price_per_night' => 15000,
            'units' => 1,
            'features' => ['wifi', 'Jacuzzi'],
        ])->assertSessionHasErrors('features.1');

        $this->assertDatabaseMissing('cottages', ['slug' => 'tree-house']);
    }

    public function test_older_typed_features_can_be_kept_or_removed(): void
    {
        $admin = User::factory()->admin()->create();
        $cottage = Cottage::create([
            'name' => 'Tree House', 'slug' => 'tree-house', 'max_guests' => 2, 'price_per_night' => 15000, 'units' => 1,
            'features' => ['Lake Breeze', 'Hammock', 'wifi'],
        ]);
        $update = fn (array $features) => $this->actingAs($admin)->put(route('admin.cottages.update', $cottage), [
            'name' => 'Tree House', 'max_guests' => 2, 'price_per_night' => 15000, 'units' => 1, 'features' => $features,
        ]);

        $update(['Lake Breeze', 'parking'])->assertRedirect(route('admin.cottages.index'));
        $this->assertSame(['parking', 'Lake Breeze'], $cottage->fresh()->features);
        $this->assertSame(['key' => 'Lake Breeze', 'label' => 'Lake Breeze'], $cottage->fresh()->feature_list[1]);

        // Once removed, an older entry can't be added back.
        $update(['parking', 'Hammock'])->assertSessionHasErrors('features.1');
    }

    public function test_admin_picks_package_inclusions_from_the_list(): void
    {
        $admin = User::factory()->admin()->create();
        $package = ['name' => 'Honeymoon', 'nights' => 2, 'guests' => 2, 'price' => 40000];

        $this->actingAs($admin)->post(route('admin.packages.store'), [...$package, 'inclusions' => ['dinner', 'cottage', 'boat_ride', 'breakfast']])
            ->assertRedirect(route('admin.packages.index'));

        // Stored in the site's list order, whatever order they were ticked in.
        $saved = Package::where('slug', 'honeymoon')->firstOrFail();
        $this->assertSame(['cottage', 'breakfast', 'dinner', 'boat_ride'], $saved->inclusions);
        $this->assertSame('Cottage Stay', $saved->inclusion_list[0]['label']);

        $this->actingAs($admin)->put(route('admin.packages.update', $saved), [...$package, 'inclusions' => ['breakfast', 'Spa Day']])
            ->assertSessionHasErrors('inclusions.1');
    }

    public function test_older_typed_inclusions_can_be_kept(): void
    {
        $admin = User::factory()->admin()->create();
        $saved = Package::factory()->create(['inclusions' => ['Cooking Class', 'lunch']]);

        $this->actingAs($admin)->put(route('admin.packages.update', $saved), [
            'name' => $saved->name, 'nights' => 1, 'guests' => 2, 'price' => 17000, 'inclusions' => ['Cooking Class', 'breakfast'],
        ])->assertRedirect(route('admin.packages.index'));

        $this->assertSame(['breakfast', 'Cooking Class'], $saved->fresh()->inclusions);
        $this->assertSame(['key' => 'Cooking Class', 'label' => 'Cooking Class'], $saved->fresh()->inclusion_list[1]);
    }

    public function test_cottage_photos_join_and_leave_the_gallery(): void
    {
        Storage::fake('uploads');
        $admin = User::factory()->admin()->create();
        $cottage = ['name' => 'Tree House', 'max_guests' => 2, 'price_per_night' => 15000, 'units' => 1];
        $galleryPaths = fn (Cottage $c) => $c->galleryImages()->orderBy('path')->pluck('path')->all();
        $photoPaths = fn (Cottage $c) => collect($c->photoPaths())->sort()->values()->all();

        $this->actingAs($admin)->post(route('admin.cottages.store'), [
            ...$cottage,
            'cover_image' => UploadedFile::fake()->image('cover.jpg'),
            'new_images' => [UploadedFile::fake()->image('a.jpg'), UploadedFile::fake()->image('b.jpg')],
        ])->assertRedirect(route('admin.cottages.index'));

        $saved = Cottage::where('slug', 'tree-house')->firstOrFail();
        $this->assertCount(3, $galleryPaths($saved));
        $this->assertSame($photoPaths($saved), $galleryPaths($saved));
        $this->assertSame(['cottages'], $saved->galleryImages()->distinct()->pluck('category')->all());
        $this->assertSame('Tree House', $saved->galleryImages()->value('caption'));

        // Replacing the cover and removing a photo takes both out of the gallery; the new cover joins it.
        [$oldCover, $a, $b] = $saved->photoPaths();
        $this->actingAs($admin)->put(route('admin.cottages.update', $saved), [
            ...$cottage,
            'cover_image' => UploadedFile::fake()->image('new-cover.jpg'),
            'remove_images' => [$a],
            'image_order' => [$b],
        ])->assertRedirect(route('admin.cottages.index'));

        $saved->refresh();
        $this->assertNotSame($oldCover, $saved->cover_image);
        $this->assertSame($photoPaths($saved), $galleryPaths($saved));

        $this->actingAs($admin)->delete(route('admin.cottages.destroy', $saved));
        $this->assertSame(0, GalleryImage::count());
    }

    public function test_removing_a_cottage_photo_from_the_gallery_keeps_it_on_the_cottage(): void
    {
        Storage::fake('uploads');
        $admin = User::factory()->admin()->create();
        $cottage = ['name' => 'Tree House', 'max_guests' => 2, 'price_per_night' => 15000, 'units' => 1];

        $this->actingAs($admin)->post(route('admin.cottages.store'), [...$cottage, 'new_images' => [UploadedFile::fake()->image('a.jpg')]]);
        $saved = Cottage::where('slug', 'tree-house')->firstOrFail();
        $image = $saved->galleryImages()->firstOrFail();

        $this->actingAs($admin)->delete(route('admin.gallery.destroy', $image))->assertSessionHas('success');
        Storage::disk('uploads')->assertExists($image->path);
        $this->assertSame([$image->path], $saved->fresh()->images);

        // Saving the cottage again doesn't put it back.
        $this->actingAs($admin)->put(route('admin.cottages.update', $saved), [...$cottage, 'image_order' => [$image->path]]);
        $this->assertSame(0, $saved->galleryImages()->count());
    }

    public function test_public_gallery_leaves_out_hidden_cottages(): void
    {
        $shown = Cottage::factory()->create();
        $hidden = Cottage::factory()->create(['is_active' => false]);
        GalleryImage::create(['path' => 'gallery/sunset.jpg', 'category' => 'nature']);
        GalleryImage::create(['path' => 'cottages/shown.jpg', 'category' => 'cottages', 'cottage_id' => $shown->id]);
        GalleryImage::create(['path' => 'cottages/hidden.jpg', 'category' => 'cottages', 'cottage_id' => $hidden->id]);

        $this->get(route('gallery'))->assertInertia(fn (Assert $page) => $page
            ->has('images', 2)
            ->where('images', fn ($images) => collect($images)->pluck('path')->sort()->values()->all() === ['cottages/shown.jpg', 'gallery/sunset.jpg']));
    }

    public function test_admin_can_reorder_cottage_photos(): void
    {
        Storage::fake('uploads');
        $admin = User::factory()->admin()->create();
        $cottage = Cottage::create([
            'name' => 'Tree House', 'slug' => 'tree-house', 'max_guests' => 2, 'price_per_night' => 15000, 'units' => 1,
            'images' => ['cottages/a.jpg', 'cottages/b.jpg', 'cottages/c.jpg'],
        ]);

        $this->actingAs($admin)->put(route('admin.cottages.update', $cottage), [
            'name' => 'Tree House',
            'max_guests' => 2,
            'price_per_night' => 15000,
            'units' => 1,
            'is_active' => true,
            'new_images' => [UploadedFile::fake()->image('d.jpg')],
            'remove_images' => ['cottages/b.jpg'],
            'image_order' => ['cottages/c.jpg', 'new:0', 'cottages/a.jpg'],
        ])->assertRedirect(route('admin.cottages.index'));

        $images = $cottage->fresh()->images;
        $this->assertCount(3, $images);
        $this->assertSame('cottages/c.jpg', $images[0]);
        $this->assertNotContains($images[1], ['cottages/a.jpg', 'cottages/b.jpg', 'cottages/c.jpg']);
        $this->assertSame('cottages/a.jpg', $images[2]);
    }

    public function test_new_place_photo_clears_the_old_photo_credit(): void
    {
        Storage::fake('uploads');
        $admin = User::factory()->admin()->create();
        $place = NearbyPlace::create([
            'name' => 'Kala Wewa', 'slug' => 'kala-wewa',
            'cover_image' => '/images/samples/place-kala-wewa.jpg', 'cover_credit' => 'Photo: HutchND, CC BY-SA 4.0',
        ]);
        $fields = ['name' => 'Kala Wewa', 'is_active' => true, 'cover_credit' => 'Photo: HutchND, CC BY-SA 4.0'];

        $this->actingAs($admin)->put(route('admin.places.update', $place), $fields)->assertRedirect(route('admin.places.index'));
        $this->assertSame('Photo: HutchND, CC BY-SA 4.0', $place->fresh()->cover_credit);

        $this->put(route('admin.places.update', $place), [...$fields, 'cover_image' => UploadedFile::fake()->image('mine.jpg')]);
        $this->assertNull($place->fresh()->cover_credit);
        Storage::disk('uploads')->assertExists($place->fresh()->cover_image);
    }

    public function test_admin_can_manage_the_food_menu(): void
    {
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)->post(route('admin.menu.store'), [
            'meal' => 'dinner',
            'title' => 'Dessert',
            'note' => 'Choose one',
            'items' => "Papol\n\n  Banana  \n",
        ])->assertRedirect(route('admin.menu.index'));

        $section = MenuSection::firstOrFail();
        $this->assertSame(['Papol', 'Banana'], $section->items);
        $this->get(route('dining'))->assertOk()->assertSee('Papol');

        $this->actingAs($admin)->put(route('admin.menu.update', $section), [
            'meal' => 'lunch', 'title' => 'Dessert', 'items' => "Jelly\nKiri",
        ])->assertRedirect(route('admin.menu.index'));
        $this->assertSame(['lunch', ['Jelly', 'Kiri']], [$section->fresh()->meal, $section->fresh()->items]);

        $this->actingAs($admin)->post(route('admin.menu.store'), ['meal' => 'supper', 'title' => 'X', 'items' => ' '])
            ->assertSessionHasErrors(['meal', 'items']);

        $this->actingAs($admin)->delete(route('admin.menu.destroy', $section))->assertSessionHas('success');
        $this->assertSame(0, MenuSection::count());
    }

    public function test_admin_can_upload_gallery_images_and_update_settings(): void
    {
        Storage::fake('uploads');
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
        Storage::disk('uploads')->assertExists(Setting::get('hero_image'));
    }
}
