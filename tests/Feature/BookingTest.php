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

    public function test_package_linked_to_cottages_only_fits_those_cottages(): void
    {
        Mail::fake();
        [$first, $second, $other] = Cottage::factory()->count(3)->create(['max_guests' => 4]);
        $package = Package::factory()->create(['guests' => 2]);
        $package->cottages()->attach([$first->id, $second->id]);

        $this->post(route('book.store'), $this->payload($other, ['package_id' => $package->id]))
            ->assertSessionHasErrors(['package_id' => "The {$package->name} is only available in the {$first->name} or {$second->name}."]);
        $this->post(route('book.store'), $this->payload($first, ['package_id' => $package->id]))
            ->assertSessionHasNoErrors();
        $this->post(route('book.store'), $this->payload($second, ['package_id' => $package->id]))
            ->assertSessionHasNoErrors();
    }

    public function test_booking_form_knows_which_cottages_each_package_is_for(): void
    {
        [$first, $second] = Cottage::factory()->count(2)->create();
        $package = Package::factory()->create();
        $package->cottages()->attach([$first->id, $second->id]);

        $this->get(route('book'))->assertInertia(fn ($page) => $page
            ->where('packages.0.cottage_ids', [$first->id, $second->id])
            ->missing('packages.0.cottages'));
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

    public function test_dates_in_another_format_cannot_slip_past_the_fully_booked_check(): void
    {
        Mail::fake();
        $cottage = Cottage::factory()->create(['units' => 1]);
        $this->post(route('book.store'), $this->payload($cottage))->assertSessionHasNoErrors();

        // "8 December 2026" compared wrongly with the stored dates, so the cottage looked free.
        $this->post(route('book.store'), $this->payload($cottage, [
            'check_in' => now()->addDays(10)->format('j F Y'),
            'check_out' => now()->addDays(11)->format('j F Y'),
        ]))->assertSessionHasErrors(['check_in', 'check_out']);

        $this->assertSame(1, Booking::count());
    }

    public function test_availability_only_answers_for_dates_that_can_be_booked(): void
    {
        $cottage = Cottage::factory()->create();
        $check = fn (string $in, string $out) => $this->getJson(route('availability', ['cottage_id' => $cottage->id, 'check_in' => $in, 'check_out' => $out]));

        // A range of decades kept the server busy for minutes with a few years of bookings.
        $check(now()->addDay()->toDateString(), now()->addYears(20)->toDateString())->assertJsonValidationErrors('check_out');
        $check(now()->subYears(5)->toDateString(), now()->addDay()->toDateString())->assertJsonValidationErrors('check_in');
        $check(now()->addDay()->format('j F Y'), now()->addDays(3)->format('j F Y'))->assertJsonValidationErrors(['check_in', 'check_out']);

        $check(now()->addDay()->toDateString(), now()->addYear()->toDateString())->assertOk()->assertJson(['available' => true]);
    }

    public function test_units_left_counts_the_busiest_night(): void
    {
        Mail::fake();
        $cottage = Cottage::factory()->create(['units' => 3]);
        $day = fn (int $n) => now()->addDays($n)->toDateString();

        // Nights 10–11 and 12–13 back to back (one unit), plus 11–13 overlapping both (a second unit).
        foreach ([[10, 12], [12, 14], [11, 14]] as [$in, $out]) {
            $this->post(route('book.store'), $this->payload($cottage, ['check_in' => $day($in), 'check_out' => $day($out)]))->assertSessionHasNoErrors();
        }

        $left = fn (int $in, int $out) => $this->getJson(route('availability', ['cottage_id' => $cottage->id, 'check_in' => $day($in), 'check_out' => $day($out)]))->json('units_left');
        $this->assertSame(1, $left(9, 15));
        $this->assertSame(2, $left(10, 11));
        $this->assertSame(3, $left(14, 16));
        $this->assertSame(3, $left(5, 10));
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
