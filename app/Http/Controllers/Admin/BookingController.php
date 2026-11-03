<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Mail\BookingStatusChanged;
use App\Models\Booking;
use App\Services\AvailabilityService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class BookingController extends Controller
{
    public function index(Request $request): Response
    {
        $filters = $request->only('status', 'search', 'when');

        $bookings = Booking::with('cabana:id,name', 'package:id,name')
            ->when($filters['status'] ?? null, fn ($q, $status) => $q->where('status', $status))
            ->when($filters['search'] ?? null, fn ($q, $search) => $q->where(fn ($q) => $q
                ->where('reference', 'like', "%{$search}%")
                ->orWhere('name', 'like', "%{$search}%")
                ->orWhere('email', 'like', "%{$search}%")
                ->orWhere('phone', 'like', "%{$search}%")))
            ->when(($filters['when'] ?? null) === 'upcoming', fn ($q) => $q->where('check_out', '>=', now()->toDateString())->orderBy('check_in'))
            ->when(($filters['when'] ?? null) === 'past', fn ($q) => $q->where('check_out', '<', now()->toDateString())->orderByDesc('check_in'))
            ->latest()
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('Admin/Bookings/Index', [
            'bookings' => $bookings,
            'filters' => $filters,
            'statuses' => Booking::STATUSES,
        ]);
    }

    public function show(Booking $booking): Response
    {
        return Inertia::render('Admin/Bookings/Show', [
            'booking' => $booking->load('cabana', 'package'),
            'statuses' => Booking::STATUSES,
        ]);
    }

    public function updateStatus(Request $request, Booking $booking, AvailabilityService $availability): RedirectResponse
    {
        $data = $request->validate([
            'status' => ['required', Rule::in(Booking::STATUSES)],
            'notify' => ['boolean'],
        ]);

        if ($data['status'] === $booking->status) {
            return back();
        }

        // Re-activating a cancelled booking must not overbook the cabana.
        if ($booking->status === Booking::STATUS_CANCELLED
            && ! $availability->isAvailable($booking->cabana, $booking->check_in->toDateString(), $booking->check_out->toDateString(), $booking->id)) {
            return back()->with('error', 'Cannot restore this booking: the cabana is fully booked for those dates.');
        }

        $booking->update(['status' => $data['status']]);

        if ($request->boolean('notify', true)) {
            Mail::to($booking->email)->queue(new BookingStatusChanged($booking));
        }

        return back()->with('success', "Booking {$booking->reference} marked as {$booking->status}.");
    }

    public function destroy(Booking $booking): RedirectResponse
    {
        $booking->delete();

        return redirect()->route('admin.bookings.index')->with('success', 'Booking deleted.');
    }
}
