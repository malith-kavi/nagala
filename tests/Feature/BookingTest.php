<?php

namespace Tests\Feature;

use App\Mail\BookingReceived;
use App\Mail\BookingStatusChanged;
use App\Mail\NewBookingNotification;
use App\Models\Booking;
use App\Models\Cottage;
use App\Models\Package;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class BookingTest extends TestCase
{
    use RefreshDatabase;

    private function payload(Cottage $cottage, array $overrides = []): array
    {
        return [
            'cottage_id' => $cottage->id,
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
        Cottage::factory()->create();

        $this->get(route('book'))->assertOk();
    }

    public function test_guest_can_request_a_booking(): void
    {
        Mail::fake();
        $cottage = Cottage::factory()->create(['price_per_night' => 8000]);

        $response = $this->post(route('book.store'), $this->payload($cottage));

        $booking = Booking::first();
        $response->assertRedirect(route('booking.show', $booking->reference));
        $this->assertSame(Booking::STATUS_PENDING, $booking->status);
        $this->assertSame(16000, $booking->total_price);
        Mail::assertQueued(BookingReceived::class, fn ($m) => $m->hasTo('nimal@example.com'));
        Mail::assertQueued(NewBookingNotification::class, fn ($m) => $m->hasTo(config('nagala.owner_email')));

        $this->get(route('booking.show', $booking->reference))->assertOk();
    }

    public function test_full_board_package_is_charged_per_night(): void
    {
        Mail::fake();
        $cottage = Cottage::factory()->create(['price_per_night' => 8000, 'max_guests' => 2]);
        $package = Package::factory()->create(['price' => 17000, 'nights' => 1, 'guests' => 2]);

        $this->post(route('book.store'), $this->payload($cottage, ['package_id' => $package->id]))->assertSessionHasNoErrors();

        $this->assertSame(2 * 17000, Booking::first()->total_price);
    }

    public function test_package_must_fit_the_cottage_size(): void
    {
        Mail::fake();
        $couple = Cottage::factory()->create(['max_guests' => 2]);
        $family = Package::factory()->create(['guests' => 4]);

        $this->post(route('book.store'), $this->payload($couple, ['package_id' => $family->id]))
            ->assertSessionHasErrors('package_id');
        $this->assertSame(0, Booking::count());
    }

    public function test_package_linked_to_a_cottage_only_fits_that_cottage(): void
    {
        Mail::fake();
        [$linked, $other] = Cottage::factory()->count(2)->create(['max_guests' => 2]);
        $package = Package::factory()->create(['guests' => 2, 'cottage_id' => $linked->id]);

        $this->post(route('book.store'), $this->payload($other, ['package_id' => $package->id]))
            ->assertSessionHasErrors('package_id');
        $this->post(route('book.store'), $this->payload($linked, ['package_id' => $package->id]))
            ->assertSessionHasNoErrors();
    }

    public function test_cottage_cannot_be_overbooked(): void
    {
        Mail::fake();
        $cottage = Cottage::factory()->create(['units' => 2]);

        $this->post(route('book.store'), $this->payload($cottage))->assertSessionHasNoErrors();
        $this->post(route('book.store'), $this->payload($cottage, [
            'check_in' => now()->addDays(11)->toDateString(),
            'check_out' => now()->addDays(13)->toDateString(),
        ]))->assertSessionHasNoErrors();

        $this->post(route('book.store'), $this->payload($cottage, [
            'check_in' => now()->addDays(11)->toDateString(),
            'check_out' => now()->addDays(12)->toDateString(),
        ]))->assertSessionHasErrors('check_in');

        $this->assertSame(2, Booking::count());
    }

    public function test_back_to_back_bookings_do_not_overlap(): void
    {
        Mail::fake();
        $cottage = Cottage::factory()->create(['units' => 1]);

        $this->post(route('book.store'), $this->payload($cottage))->assertSessionHasNoErrors();
        $this->post(route('book.store'), $this->payload($cottage, [
            'check_in' => now()->addDays(12)->toDateString(),
            'check_out' => now()->addDays(14)->toDateString(),
        ]))->assertSessionHasNoErrors();

        $this->assertSame(2, Booking::count());
    }

    public function test_cancelled_bookings_free_up_the_dates(): void
    {
        Mail::fake();
        $cottage = Cottage::factory()->create(['units' => 1]);
        $this->post(route('book.store'), $this->payload($cottage));
        Booking::first()->update(['status' => Booking::STATUS_CANCELLED]);

        $this->post(route('book.store'), $this->payload($cottage))->assertSessionHasNoErrors();
        $this->assertSame(2, Booking::count());
    }

    public function test_invalid_dates_and_too_many_guests_are_rejected(): void
    {
        $cottage = Cottage::factory()->create(['max_guests' => 3]);

        $this->post(route('book.store'), $this->payload($cottage, [
            'check_in' => now()->subDay()->toDateString(),
        ]))->assertSessionHasErrors('check_in');

        $this->post(route('book.store'), $this->payload($cottage, [
            'check_out' => now()->addDays(10)->toDateString(),
        ]))->assertSessionHasErrors('check_out');

        $this->post(route('book.store'), $this->payload($cottage, ['guests' => 4]))->assertSessionHasErrors('guests');

        $this->assertSame(0, Booking::count());
    }

    public function test_availability_endpoint_reports_status_and_price(): void
    {
        Mail::fake();
        $cottage = Cottage::factory()->create(['units' => 1, 'price_per_night' => 10000]);
        $this->post(route('book.store'), $this->payload($cottage));

        $this->getJson(route('availability', [
            'cottage_id' => $cottage->id,
            'check_in' => now()->addDays(11)->toDateString(),
            'check_out' => now()->addDays(13)->toDateString(),
        ]))->assertOk()->assertJson(['available' => false, 'total' => 20000])
            ->assertJsonFragment(['blocked_dates' => [now()->addDays(10)->toDateString(), now()->addDays(11)->toDateString()]]);
    }

    public function test_admin_can_confirm_and_guest_is_notified(): void
    {
        Mail::fake();
        $admin = User::factory()->admin()->create();
        $cottage = Cottage::factory()->create();
        $this->post(route('book.store'), $this->payload($cottage));
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
        $cottage = Cottage::factory()->create(['units' => 1]);
        $this->post(route('book.store'), $this->payload($cottage));
        $first = Booking::first();
        $first->update(['status' => 'cancelled']);
        $this->post(route('book.store'), $this->payload($cottage));

        $this->actingAs($admin)
            ->patch(route('admin.bookings.status', $first), ['status' => 'confirmed'])
            ->assertSessionHas('error');

        $this->assertSame('cancelled', $first->fresh()->status);
    }
}
