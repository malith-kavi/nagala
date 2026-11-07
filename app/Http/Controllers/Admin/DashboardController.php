<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\ContactMessage;
use App\Models\Cottage;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(): Response
    {
        $today = now()->toDateString();

        return Inertia::render('Admin/Dashboard', [
            'stats' => [
                'pending' => Booking::where('status', Booking::STATUS_PENDING)->count(),
                'upcoming' => Booking::where('status', Booking::STATUS_CONFIRMED)->where('check_in', '>=', $today)->count(),
                'staying' => Booking::where('status', Booking::STATUS_CONFIRMED)->where('check_in', '<=', $today)->where('check_out', '>', $today)->count(),
                'unread_messages' => ContactMessage::whereNull('read_at')->count(),
                'cottages' => Cottage::count(),
                'revenue_month' => (int) Booking::where('status', Booking::STATUS_CONFIRMED)
                    ->whereBetween('check_in', [now()->startOfMonth()->toDateString(), now()->endOfMonth()->toDateString()])
                    ->sum('total_price'),
            ],
            'pendingBookings' => Booking::with('cottage:id,name')->where('status', Booking::STATUS_PENDING)->oldest()->take(8)->get(),
            'upcomingBookings' => Booking::with('cottage:id,name')->where('status', Booking::STATUS_CONFIRMED)
                ->where('check_in', '>=', $today)->orderBy('check_in')->take(8)->get(),
            'recentMessages' => ContactMessage::latest()->take(5)->get(),
        ]);
    }
}
