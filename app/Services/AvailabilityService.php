<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\Cabana;
use App\Models\Package;
use Carbon\CarbonImmutable;
use Carbon\CarbonPeriod;

class AvailabilityService
{
    /**
     * Number of units of the cabana still free for every night in the range.
     */
    public function unitsAvailable(Cabana $cabana, string $checkIn, string $checkOut, ?int $ignoreBookingId = null): int
    {
        $bookings = $cabana->bookings()
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

        return max(0, $cabana->units - $peak);
    }

    public function isAvailable(Cabana $cabana, string $checkIn, string $checkOut, ?int $ignoreBookingId = null): bool
    {
        return $this->unitsAvailable($cabana, $checkIn, $checkOut, $ignoreBookingId) > 0;
    }

    /**
     * Nights (Y-m-d) in the next $days where every unit of the cabana is taken.
     *
     * @return list<string>
     */
    public function fullyBookedDates(Cabana $cabana, int $days = 365): array
    {
        $from = CarbonImmutable::today();
        $to = $from->addDays($days);

        $bookings = $cabana->bookings()
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
            ->filter(fn ($count) => $count >= $cabana->units)
            ->keys()
            ->sort()
            ->values()
            ->all();
    }

    public function quote(Cabana $cabana, ?Package $package, string $checkIn, string $checkOut): int
    {
        $nights = (int) CarbonImmutable::parse($checkIn)->diffInDays(CarbonImmutable::parse($checkOut));

        if ($package) {
            // Package price covers its included nights; extra nights at the cabana rate.
            $extra = max(0, $nights - $package->nights);

            return $package->price + $extra * $cabana->price_per_night;
        }

        return $nights * $cabana->price_per_night;
    }
}
