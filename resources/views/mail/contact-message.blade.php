<x-mail::message>
# New website message

**From:** {{ $contactMessage->name }} ({{ $contactMessage->email }})
@if ($contactMessage->phone)
<br>**Phone:** {{ $contactMessage->phone }}
@endif
@if ($contactMessage->subject)
<br>**Subject:** {{ $contactMessage->subject }}
@endif

{{ $contactMessage->message }}
</x-mail::message>
