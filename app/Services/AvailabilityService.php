<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\Cottage;
use App\Models\Package;
use Carbon\CarbonImmutable;
use Carbon\CarbonPeriod;

class AvailabilityService
{
    /**
     * Number of units of the cottage still free for every night in the range.
     */
    public function unitsAvailable(Cottage $cottage, string $checkIn, string $checkOut, ?int $ignoreBookingId = null): int
    {
        $bookings = $cottage->bookings()
            ->blocking()
            ->overlapping($checkIn, $checkOut)
            ->when($ignoreBookingId, fn ($q) => $q->whereKeyNot($ignoreBookingId))
            ->get(['check_in', 'check_out']);

        // Peak occupancy across the nights requested, not the raw overlap count,
        // so two back-to-back bookings don't wrongly use up two units.
        $peak = 0;
        foreach (CarbonPeriod::create($checkIn, CarbonImmutable::parse($checkOut)->subDay()) as $night) {
            $occupied = $bookings->filter(
                fn (Booking $b) => $b->check_in->lte($night) && $b->check_out->gt($night)
            )->count();
            $peak = max($peak, $occupied);
        }

        return max(0, $cottage->units - $peak);
    }

    public function isAvailable(Cottage $cottage, string $checkIn, string $checkOut, ?int $ignoreBookingId = null): bool
    {
        return $this->unitsAvailable($cottage, $checkIn, $checkOut, $ignoreBookingId) > 0;
    }

    /**
     * Nights (Y-m-d) in the next $days where every unit of the cottage is taken.
     *
     * @return list<string>
     */
    public function fullyBookedDates(Cottage $cottage, int $days = 365): array
    {
        $from = CarbonImmutable::today();
        $to = $from->addDays($days);

        $bookings = $cottage->bookings()
            ->blocking()
            ->overlapping($from->toDateString(), $to->toDateString())
            ->get(['check_in', 'check_out']);

        $counts = [];
        foreach ($bookings as $booking) {
            $start = $booking->check_in->max($from);
            foreach (CarbonPeriod::create($start, $booking->check_out->subDay()) as $night) {
                $key = $night->toDateString();
                $counts[$key] = ($counts[$key] ?? 0) + 1;
            }
        }

        return collect($counts)
            ->filter(fn ($count) => $count >= $cottage->units)
            ->keys()
            ->sort()
            ->values()
            ->all();
    }

    public function quote(Cottage $cottage, ?Package $package, string $checkIn, string $checkOut): int
    {
        $nights = (int) CarbonImmutable::parse($checkIn)->diffInDays(CarbonImmutable::parse($checkOut));

        if ($package) {
            // Full-board packages include meals, so longer stays repeat the package's
            // nightly rate (never less than the package's own nights).
            $packageNights = max(1, $package->nights);

            return (int) round($package->price * max($nights, $packageNights) / $packageNights);
        }

        return $nights * $cottage->price_per_night;
    }
}
