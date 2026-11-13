<x-mail::table>
| | |
|:--|:--|
| **Reference** | {{ $booking->reference }} |
| **Cottage** | {{ $booking->cottage->name }} |
@if ($booking->package)
| **Package** | {{ $booking->package->name }} |
@endif
| **Check-in** | {{ $booking->check_in->format('D, j M Y') }} · from {{ $booking->checkInTime() }} |
| **Check-out** | {{ $booking->check_out->format('D, j M Y') }} · by {{ $booking->checkOutTime() }} |
| **Nights** | {{ $booking->nights }} |
| **Guests** | {{ $booking->guests }} |
| **Total** | LKR {{ number_format($booking->total_price) }} |
</x-mail::table>
