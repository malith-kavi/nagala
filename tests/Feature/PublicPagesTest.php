<?php

namespace Tests\Feature;

use App\Models\Cottage;
use App\Models\MenuSection;
use App\Models\NearbyPlace;
use App\Models\Package;
use App\Models\Setting;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PublicPagesTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();
    }

    public function test_all_public_pages_render(): void
    {
        $urls = [
            route('home'), route('cottages.index'), route('packages.index'), route('dining'), route('places.index'),
            route('gallery'), route('contact'), route('book'), route('login'),
        ];
        foreach (Cottage::all() as $c) {
            $urls[] = route('cottages.show', $c->slug);
        }
        foreach (Package::all() as $p) {
            $urls[] = route('packages.show', $p->slug);
        }
        foreach (NearbyPlace::all() as $p) {
            $urls[] = route('places.show', $p->slug);
        }

        foreach ($urls as $url) {
            $this->get($url)->assertOk();
        }
    }

    public function test_hidden_and_missing_items_return_404(): void
    {
        Cottage::first()->update(['is_active' => false]);

        $this->get(route('cottages.show', Cottage::first()->slug))->assertNotFound();
        $this->get(route('packages.show', 'does-not-exist'))->assertNotFound();
    }

    public function test_old_cabana_addresses_redirect_to_cottages(): void
    {
        $this->get('/cabanas')->assertRedirect(route('cottages.index'))->assertStatus(301);
        $this->get('/cabanas/couple-cabana')->assertRedirect(route('cottages.show', 'couple-cottage'))->assertStatus(301);
        $this->get(route('cottages.show', 'couple-cottage'))->assertOk();
    }

    public function test_seeded_content_matches_the_design(): void
    {
        $this->assertSame([8000, 12000, 15000, 12000], Cottage::active()->pluck('price_per_night')->all());
        $this->assertSame([2, 4, 5, 4], Cottage::active()->pluck('max_guests')->all());
        $this->assertSame([1, 1, 1, 1], Cottage::active()->pluck('units')->all());
        $this->assertSame([17000, 30000, 37500], Package::active()->pluck('price')->all());
        $this->assertSame(12, NearbyPlace::count());
        $this->assertSame(['breakfast', 'lunch', 'dinner'], MenuSection::ordered()->pluck('meal')->unique()->values()->all());
        $this->assertSame(['2:00 PM', '12:00 PM'], [Setting::get('check_in_time'), Setting::get('check_out_time')]);
    }

    public function test_each_package_fits_the_right_cottages(): void
    {
        $fits = fn (string $slug) => Cottage::active()->get()
            ->filter(fn (Cottage $c) => Package::where('slug', $slug)->first()->fitsCottage($c))
            ->pluck('name')->values()->all();

        $this->assertSame(['Couple Cottage'], $fits('couple-full-board'));
        $this->assertSame(['Family Cottage I', 'Family Cottage II'], $fits('family-full-board-4-guests'));
        $this->assertSame(['Large Family Cottage'], $fits('family-full-board-5-guests'));
    }

    public function test_reseeding_keeps_menu_edits(): void
    {
        MenuSection::first()->update(['items' => ['Edited']]);

        $this->seed();

        $this->assertSame(['Edited'], MenuSection::first()->items);
    }
}
