<x-mail::message>
# New booking request

**{{ $booking->name }}** · {{ $booking->email }} · {{ $booking->phone }}

@include('mail._booking-table')

@if ($booking->notes)
**Notes:** {{ $booking->notes }}
@endif

<x-mail::button :url="route('admin.bookings.show', $booking)">
Review in admin
</x-mail::button>
</x-mail::message>
