<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreBookingRequest;
use App\Mail\BookingReceived;
use App\Mail\NewBookingNotification;
use App\Models\Booking;
use App\Models\Cottage;
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
            'cottages' => Cottage::active()->get()->makeHidden(Cottage::CARD_HIDDEN),
            'packages' => Package::active()->with('cottages:id')->get()->append('cottage_ids')->makeHidden([...Package::CARD_HIDDEN, 'cottages']),
            'preselect' => [
                'cottage' => $request->query('cottage'),
                'package' => $request->query('package'),
            ],
        ]);
    }

    public function store(StoreBookingRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $cottage = Cottage::findOrFail($data['cottage_id']);
        $package = isset($data['package_id']) ? Package::find($data['package_id']) : null;

        $booking = DB::transaction(function () use ($data, $cottage, $package) {
            // Lock the cottage row so concurrent requests can't double-book the last unit.
            Cottage::whereKey($cottage->id)->lockForUpdate()->first();

            if (! $this->availability->isAvailable($cottage, $data['check_in'], $data['check_out'])) {
                throw ValidationException::withMessages([
                    'check_in' => "Sorry, the {$cottage->name} is fully booked for those dates. Please try other dates or another cottage.",
                ]);
            }

            return Booking::create([
                ...$data,
                'total_price' => $this->availability->quote($cottage, $package, $data['check_in'], $data['check_out']),
                'status' => Booking::STATUS_PENDING,
            ]);
        });

        Mail::to($booking->email)->queue(new BookingReceived($booking));
        Mail::to(config('nagala.owner_email'))->queue(new NewBookingNotification($booking));

        return redirect()->route('booking.show', $booking->reference);
    }

    public function show(string $reference): Response
    {
        $booking = Booking::with('cottage', 'package')->where('reference', $reference)->firstOrFail();

        // Reference links are shareable, so only expose a masked email publicly.
        $booking->setAttribute('email', preg_replace('/(?<=.).(?=[^@]*@)/', '*', $booking->email));
        $booking->makeHidden(['phone', 'notes']);

        return Inertia::render('BookingConfirmation', ['booking' => $booking]);
    }

    public function availability(Request $request): JsonResponse
    {
        $data = $request->validate([
            'cottage_id' => ['required', 'exists:cottages,id'],
            'package_id' => ['nullable', 'exists:packages,id'],
            // The dates a booking can have (StoreBookingRequest), with a day's leeway for visitors whose
            // date is behind the server's. Unbounded, a single request for a range of decades kept
            // the server busy for minutes.
            'check_in' => ['nullable', 'date_format:Y-m-d', 'after_or_equal:'.now()->subDay()->toDateString()],
            'check_out' => ['nullable', 'date_format:Y-m-d', 'after:check_in', 'before:'.now()->addYear()->addDay()->toDateString()],
        ]);

        $cottage = Cottage::findOrFail($data['cottage_id']);
        $response = ['blocked_dates' => $this->availability->fullyBookedDates($cottage)];

        if (! empty($data['check_in']) && ! empty($data['check_out'])) {
            $package = ! empty($data['package_id']) ? Package::find($data['package_id']) : null;
            $response['available'] = $this->availability->isAvailable($cottage, $data['check_in'], $data['check_out']);
            $response['units_left'] = $this->availability->unitsAvailable($cottage, $data['check_in'], $data['check_out']);
            $response['total'] = $this->availability->quote($cottage, $package, $data['check_in'], $data['check_out']);
        }

        return response()->json($response);
    }
}
