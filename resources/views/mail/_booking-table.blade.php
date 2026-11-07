<x-mail::table>
| | |
|:--|:--|
| **Reference** | {{ $booking->reference }} |
| **Cottage** | {{ $booking->cottage->name }} |
@if ($booking->package)
| **Package** | {{ $booking->package->name }} |
@endif
| **Check-in** | {{ $booking->check_in->format('D, j M Y') }} |
| **Check-out** | {{ $booking->check_out->format('D, j M Y') }} |
| **Nights** | {{ $booking->nights }} |
| **Guests** | {{ $booking->guests }} |
| **Total** | LKR {{ number_format($booking->total_price) }} |
</x-mail::table>
