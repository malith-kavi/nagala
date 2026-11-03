<?php

namespace Tests\Feature;

use App\Mail\BookingReceived;
use App\Mail\BookingStatusChanged;
use App\Mail\NewBookingNotification;
use App\Models\Booking;
use App\Models\Cabana;
use App\Models\Package;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class BookingTest extends TestCase
{
    use RefreshDatabase;

    private function payload(Cabana $cabana, array $overrides = []): array
    {
        return [
            'cabana_id' => $cabana->id,
            'check_in' => now()->addDays(10)->toDateString(),
            'check_out' => now()->addDays(12)->toDateString(),
            'guests' => 2,
            'name' => 'Nimal Perera',
            'email' => 'nimal@example.com',
            'phone' => '+94 77 000 0000',
            ...$overrides,
        ];
    }

    public function test_booking_page_renders(): void
    {
        Cabana::factory()->create();

        $this->get(route('book'))->assertOk();
    }

    public function test_guest_can_request_a_booking(): void
    {
        Mail::fake();
        $cabana = Cabana::factory()->create(['price_per_night' => 8000]);

        $response = $this->post(route('book.store'), $this->payload($cabana));

        $booking = Booking::first();
        $response->assertRedirect(route('booking.show', $booking->reference));
        $this->assertSame(Booking::STATUS_PENDING, $booking->status);
        $this->assertSame(16000, $booking->total_price);
        Mail::assertQueued(BookingReceived::class, fn ($m) => $m->hasTo('nimal@example.com'));
        Mail::assertQueued(NewBookingNotification::class, fn ($m) => $m->hasTo(config('nagala.owner_email')));

        $this->get(route('booking.show', $booking->reference))->assertOk();
    }

    public function test_package_price_is_used_with_extra_nights_at_cabana_rate(): void
    {
        Mail::fake();
        $cabana = Cabana::factory()->create(['price_per_night' => 8000]);
        $package = Package::factory()->create(['price' => 18000, 'nights' => 1, 'cabana_id' => $cabana->id]);

        $this->post(route('book.store'), $this->payload($cabana, ['package_id' => $package->id]));

        $this->assertSame(18000 + 8000, Booking::first()->total_price);
    }

    public function test_cabana_cannot_be_overbooked(): void
    {
        Mail::fake();
        $cabana = Cabana::factory()->create(['units' => 2]);

        $this->post(route('book.store'), $this->payload($cabana))->assertSessionHasNoErrors();
        $this->post(route('book.store'), $this->payload($cabana, [
            'check_in' => now()->addDays(11)->toDateString(),
            'check_out' => now()->addDays(13)->toDateString(),
        ]))->assertSessionHasNoErrors();

        $this->post(route('book.store'), $this->payload($cabana, [
            'check_in' => now()->addDays(11)->toDateString(),
            'check_out' => now()->addDays(12)->toDateString(),
        ]))->assertSessionHasErrors('check_in');

        $this->assertSame(2, Booking::count());
    }

    public function test_back_to_back_bookings_do_not_overlap(): void
    {
        Mail::fake();
        $cabana = Cabana::factory()->create(['units' => 1]);

        $this->post(route('book.store'), $this->payload($cabana))->assertSessionHasNoErrors();
        $this->post(route('book.store'), $this->payload($cabana, [
            'check_in' => now()->addDays(12)->toDateString(),
            'check_out' => now()->addDays(14)->toDateString(),
        ]))->assertSessionHasNoErrors();

        $this->assertSame(2, Booking::count());
    }

    public function test_cancelled_bookings_free_up_the_dates(): void
    {
        Mail::fake();
        $cabana = Cabana::factory()->create(['units' => 1]);
        $this->post(route('book.store'), $this->payload($cabana));
        Booking::first()->update(['status' => Booking::STATUS_CANCELLED]);

        $this->post(route('book.store'), $this->payload($cabana))->assertSessionHasNoErrors();
        $this->assertSame(2, Booking::count());
    }

    public function test_invalid_dates_and_too_many_guests_are_rejected(): void
    {
        $cabana = Cabana::factory()->create(['max_guests' => 3]);

        $this->post(route('book.store'), $this->payload($cabana, [
            'check_in' => now()->subDay()->toDateString(),
        ]))->assertSessionHasErrors('check_in');

        $this->post(route('book.store'), $this->payload($cabana, [
            'check_out' => now()->addDays(10)->toDateString(),
        ]))->assertSessionHasErrors('check_out');

        $this->post(route('book.store'), $this->payload($cabana, ['guests' => 4]))->assertSessionHasErrors('guests');

        $this->assertSame(0, Booking::count());
    }

    public function test_availability_endpoint_reports_status_and_price(): void
    {
        Mail::fake();
        $cabana = Cabana::factory()->create(['units' => 1, 'price_per_night' => 10000]);
        $this->post(route('book.store'), $this->payload($cabana));

        $this->getJson(route('availability', [
            'cabana_id' => $cabana->id,
            'check_in' => now()->addDays(11)->toDateString(),
            'check_out' => now()->addDays(13)->toDateString(),
        ]))->assertOk()->assertJson(['available' => false, 'total' => 20000])
            ->assertJsonFragment(['blocked_dates' => [now()->addDays(10)->toDateString(), now()->addDays(11)->toDateString()]]);
    }

    public function test_admin_can_confirm_and_guest_is_notified(): void
    {
        Mail::fake();
        $admin = User::factory()->admin()->create();
        $cabana = Cabana::factory()->create();
        $this->post(route('book.store'), $this->payload($cabana));
        $booking = Booking::first();

        $this->actingAs($admin)
            ->patch(route('admin.bookings.status', $booking), ['status' => 'confirmed', 'notify' => true])
            ->assertSessionHas('success');

        $this->assertSame('confirmed', $booking->fresh()->status);
        Mail::assertQueued(BookingStatusChanged::class);
    }

    public function test_restoring_a_cancelled_booking_cannot_overbook(): void
    {
        Mail::fake();
        $admin = User::factory()->admin()->create();
        $cabana = Cabana::factory()->create(['units' => 1]);
        $this->post(route('book.store'), $this->payload($cabana));
        $first = Booking::first();
        $first->update(['status' => 'cancelled']);
        $this->post(route('book.store'), $this->payload($cabana));

        $this->actingAs($admin)
            ->patch(route('admin.bookings.status', $first), ['status' => 'confirmed'])
            ->assertSessionHas('error');

        $this->assertSame('cancelled', $first->fresh()->status);
    }
}
