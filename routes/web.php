<?php

use App\Http\Controllers\Admin;
use App\Http\Controllers\BookingController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\CottageController;
use App\Http\Controllers\DiningController;
use App\Http\Controllers\GalleryController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\NearbyPlaceController;
use App\Http\Controllers\PackageController;
use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Public site
|--------------------------------------------------------------------------
*/
Route::get('/', HomeController::class)->name('home');

Route::get('/cottages', [CottageController::class, 'index'])->name('cottages.index');
Route::get('/cottages/{slug}', [CottageController::class, 'show'])->name('cottages.show');
// Old addresses from when the cottages were called cabanas (e.g. /cabanas/couple-cabana).
Route::permanentRedirect('/cabanas', '/cottages');
Route::get('/cabanas/{slug}', fn (string $slug) => redirect()->route('cottages.show', str_replace('cabana', 'cottage', $slug), 301));

Route::get('/packages', [PackageController::class, 'index'])->name('packages.index');
Route::get('/packages/{slug}', [PackageController::class, 'show'])->name('packages.show');

Route::get('/dining', DiningController::class)->name('dining');

Route::get('/nearby-places', [NearbyPlaceController::class, 'index'])->name('places.index');
Route::get('/nearby-places/{slug}', [NearbyPlaceController::class, 'show'])->name('places.show');

Route::get('/gallery', GalleryController::class)->name('gallery');

Route::get('/contact', [ContactController::class, 'create'])->name('contact');
Route::post('/contact', [ContactController::class, 'store'])->middleware('throttle:5,1')->name('contact.store');

Route::get('/book', [BookingController::class, 'create'])->name('book');
Route::post('/book', [BookingController::class, 'store'])->middleware('throttle:10,1')->name('book.store');
Route::get('/booking/{reference}', [BookingController::class, 'show'])->middleware('throttle:30,1')->name('booking.show');
Route::get('/api/availability', [BookingController::class, 'availability'])->middleware('throttle:60,1')->name('availability');

/*
|--------------------------------------------------------------------------
| Admin panel
|--------------------------------------------------------------------------
*/
Route::middleware(['auth', 'admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/', Admin\DashboardController::class)->name('dashboard');

    Route::resource('cottages', Admin\CottageController::class)->except('show');
    Route::resource('packages', Admin\PackageController::class)->except('show');
    Route::resource('places', Admin\NearbyPlaceController::class)->except('show');
    Route::resource('menu', Admin\MenuSectionController::class)->parameters(['menu' => 'section'])->except('show');

    Route::get('gallery', [Admin\GalleryImageController::class, 'index'])->name('gallery.index');
    Route::post('gallery', [Admin\GalleryImageController::class, 'store'])->name('gallery.store');
    Route::patch('gallery/{image}', [Admin\GalleryImageController::class, 'update'])->name('gallery.update');
    Route::delete('gallery/{image}', [Admin\GalleryImageController::class, 'destroy'])->name('gallery.destroy');

    Route::get('bookings', [Admin\BookingController::class, 'index'])->name('bookings.index');
    Route::get('bookings/{booking}', [Admin\BookingController::class, 'show'])->name('bookings.show');
    Route::patch('bookings/{booking}/status', [Admin\BookingController::class, 'updateStatus'])->name('bookings.status');
    Route::delete('bookings/{booking}', [Admin\BookingController::class, 'destroy'])->name('bookings.destroy');

    Route::get('messages', [Admin\ContactMessageController::class, 'index'])->name('messages.index');
    Route::patch('messages/{message}/read', [Admin\ContactMessageController::class, 'markRead'])->name('messages.read');
    Route::delete('messages/{message}', [Admin\ContactMessageController::class, 'destroy'])->name('messages.destroy');

    Route::get('settings', [Admin\SettingsController::class, 'edit'])->name('settings.edit');
    Route::post('settings', [Admin\SettingsController::class, 'update'])->name('settings.update');
});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
