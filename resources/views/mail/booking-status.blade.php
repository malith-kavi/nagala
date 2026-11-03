<x-mail::message>
# Hello {{ $booking->name }},

@if ($booking->status === 'confirmed')
Great news — your stay at **Nagala Eco Cottage** is **confirmed**. We look forward to welcoming you!
@elseif ($booking->status === 'cancelled')
Your booking at **Nagala Eco Cottage** has been **cancelled**. If you think this is a mistake, please contact us.
@else
Your booking status is now **{{ $booking->status }}**.
@endif

@include('mail._booking-table')

<x-mail::button :url="route('booking.show', $booking->reference)" color="success">
View your booking
</x-mail::button>

Nagala Eco Cottage
</x-mail::message>
