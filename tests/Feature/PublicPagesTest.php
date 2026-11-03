<?php

namespace Tests\Feature;

use App\Models\Cabana;
use App\Models\NearbyPlace;
use App\Models\Package;
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
            route('home'), route('cabanas.index'), route('packages.index'), route('places.index'),
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
        $this->assertSame([8000, 12000, 18000], Cabana::active()->pluck('price_per_night')->all());
        $this->assertSame([18000, 32000, 28000], Package::active()->pluck('price')->all());
        $this->assertSame(4, NearbyPlace::count());
    }
}
