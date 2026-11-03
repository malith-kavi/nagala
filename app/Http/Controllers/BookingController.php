<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreBookingRequest;
use App\Mail\BookingReceived;
use App\Mail\NewBookingNotification;
use App\Models\Booking;
use App\Models\Cabana;
use App\Models\Package;
use App\Services\AvailabilityService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class BookingController extends Controller
{
    public function __construct(private AvailabilityService $availability) {}

    public function create(Request $request): Response
    {
        return Inertia::render('Book', [
            'cabanas' => Cabana::active()->get(),
            'packages' => Package::active()->get(),
            'preselect' => [
                'cabana' => $request->query('cabana'),
                'package' => $request->query('package'),
            ],
        ]);
    }

    public function store(StoreBookingRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $cabana = Cabana::findOrFail($data['cabana_id']);
        $package = isset($data['package_id']) ? Package::find($data['package_id']) : null;

        $booking = DB::transaction(function () use ($data, $cabana, $package) {
            // Lock the cabana row so concurrent requests can't double-book the last unit.
            Cabana::whereKey($cabana->id)->lockForUpdate()->first();

            if (! $this->availability->isAvailable($cabana, $data['check_in'], $data['check_out'])) {
                throw ValidationException::withMessages([
                    'check_in' => "Sorry, the {$cabana->name} is fully booked for those dates. Please try other dates or another cabana.",
                ]);
            }

            return Booking::create([
                ...$data,
                'total_price' => $this->availability->quote($cabana, $package, $data['check_in'], $data['check_out']),
                'status' => Booking::STATUS_PENDING,
            ]);
        });

        Mail::to($booking->email)->queue(new BookingReceived($booking));
        Mail::to(config('nagala.owner_email'))->queue(new NewBookingNotification($booking));

        return redirect()->route('booking.show', $booking->reference);
    }

    public function show(string $reference): Response
    {
        $booking = Booking::with('cabana', 'package')->where('reference', $reference)->firstOrFail();

        // Reference links are shareable, so only expose a masked email publicly.
        $booking->setAttribute('email', preg_replace('/(?<=.).(?=[^@]*@)/', '*', $booking->email));
        $booking->makeHidden(['phone', 'notes']);

        return Inertia::render('BookingConfirmation', ['booking' => $booking]);
    }

    public function availability(Request $request): JsonResponse
    {
        $data = $request->validate([
            'cabana_id' => ['required', 'exists:cabanas,id'],
            'package_id' => ['nullable', 'exists:packages,id'],
            'check_in' => ['nullable', 'date'],
            'check_out' => ['nullable', 'date', 'after:check_in'],
        ]);

        $cabana = Cabana::findOrFail($data['cabana_id']);
        $response = ['blocked_dates' => $this->availability->fullyBookedDates($cabana)];

        if (! empty($data['check_in']) && ! empty($data['check_out'])) {
            $package = ! empty($data['package_id']) ? Package::find($data['package_id']) : null;
            $response['available'] = $this->availability->isAvailable($cabana, $data['check_in'], $data['check_out']);
            $response['units_left'] = $this->availability->unitsAvailable($cabana, $data['check_in'], $data['check_out']);
            $response['total'] = $this->availability->quote($cabana, $package, $data['check_in'], $data['check_out']);
        }

        return response()->json($response);
    }
}
