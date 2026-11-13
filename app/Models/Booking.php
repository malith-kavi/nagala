<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class Booking extends Model
{
    public const STATUS_PENDING = 'pending';
    public const STATUS_CONFIRMED = 'confirmed';
    public const STATUS_CANCELLED = 'cancelled';

    public const STATUSES = [self::STATUS_PENDING, self::STATUS_CONFIRMED, self::STATUS_CANCELLED];

    /** Statuses that hold a cottage unit. */
    public const BLOCKING_STATUSES = [self::STATUS_PENDING, self::STATUS_CONFIRMED];

    protected $fillable = [
        'reference', 'cottage_id', 'package_id', 'check_in', 'check_out', 'guests',
        'name', 'email', 'phone', 'notes', 'total_price', 'status',
    ];

    protected $appends = ['nights'];

    protected function casts(): array
    {
        return [
            'check_in' => 'date:Y-m-d',
            'check_out' => 'date:Y-m-d',
            'guests' => 'integer',
            'total_price' => 'integer',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (Booking $booking) {
            $booking->reference ??= static::generateReference();
        });
    }

    public static function generateReference(): string
    {
        do {
            $reference = 'NGL-'.Str::upper(Str::random(6));
        } while (static::where('reference', $reference)->exists());

        return $reference;
    }

    protected function nights(): Attribute
    {
        return Attribute::get(fn () => $this->check_in && $this->check_out
            ? (int) $this->check_in->diffInDays($this->check_out)
            : 0);
    }

    public function scopeBlocking(Builder $query): Builder
    {
        return $query->whereIn('status', self::BLOCKING_STATUSES);
    }

    public function scopeOverlapping(Builder $query, string $checkIn, string $checkOut): Builder
    {
        return $query->where('check_in', '<', $checkOut)->where('check_out', '>', $checkIn);
    }

    public function cottage(): BelongsTo
    {
        return $this->belongsTo(Cottage::class);
    }

    public function package(): BelongsTo
    {
        return $this->belongsTo(Package::class);
    }

    /** Check-in time for this stay: the package's own, or the site-wide one. */
    public function checkInTime(): string
    {
        return $this->package?->checkInTime() ?? Setting::get('check_in_time');
    }

    /** Check-out time for this stay: the package's own, or the site-wide one. */
    public function checkOutTime(): string
    {
        return $this->package?->checkOutTime() ?? Setting::get('check_out_time');
    }
}
