<x-mail::message>
# Thank you, {{ $booking->name }}!

We've received your booking request at **Nagala Eco Cottage**. Our team will confirm it shortly.

@include('mail._booking-table')

Payment is made on arrival. If you need to change anything, just reply to this email or call us.

<x-mail::button :url="route('booking.show', $booking->reference)" color="success">
View your booking
</x-mail::button>

See you soon in nature,<br>
Nagala Eco Cottage
</x-mail::message>
