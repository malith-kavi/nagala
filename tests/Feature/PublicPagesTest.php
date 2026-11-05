<?php

namespace Tests\Feature;

use App\Models\Cabana;
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
            route('home'), route('cabanas.index'), route('packages.index'), route('dining'), route('places.index'),
            route('gallery'), route('contact'), route('book'), route('login'),
        ];
        foreach (Cabana::all() as $c) {
            $urls[] = route('cabanas.show', $c->slug);
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
        Cabana::first()->update(['is_active' => false]);

        $this->get(route('cabanas.show', Cabana::first()->slug))->assertNotFound();
        $this->get(route('packages.show', 'does-not-exist'))->assertNotFound();
    }

    public function test_seeded_content_matches_the_design(): void
    {
        $this->assertSame([8000, 12000, 15000, 12000], Cabana::active()->pluck('price_per_night')->all());
        $this->assertSame([2, 4, 5, 4], Cabana::active()->pluck('max_guests')->all());
        $this->assertSame([1, 1, 1, 1], Cabana::active()->pluck('units')->all());
        $this->assertSame([17000, 30000, 37500], Package::active()->pluck('price')->all());
        $this->assertSame(12, NearbyPlace::count());
        $this->assertSame(['breakfast', 'lunch', 'dinner'], MenuSection::ordered()->pluck('meal')->unique()->values()->all());
        $this->assertSame(['2:00 PM', '12:00 PM'], [Setting::get('check_in_time'), Setting::get('check_out_time')]);
    }

    public function test_each_package_fits_the_right_cabanas(): void
    {
        $fits = fn (string $slug) => Cabana::active()->get()
            ->filter(fn (Cabana $c) => Package::where('slug', $slug)->first()->fitsCabana($c))
            ->pluck('name')->values()->all();

        $this->assertSame(['Couple Cabana'], $fits('couple-full-board'));
        $this->assertSame(['Family Cabana I', 'Family Cabana II'], $fits('family-full-board-4-guests'));
        $this->assertSame(['Large Family Cabana'], $fits('family-full-board-5-guests'));
    }

    public function test_reseeding_keeps_menu_edits(): void
    {
        MenuSection::first()->update(['items' => ['Edited']]);

        $this->seed();

        $this->assertSame(['Edited'], MenuSection::first()->items);
    }
}
