<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Admin\Concerns\ManagesUploads;
use App\Http\Controllers\Controller;
use App\Models\Setting;
use App\Services\ImageOptimizer;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SettingsController extends Controller
{
    use ManagesUploads;

    public function edit(): Response
    {
        return Inertia::render('Admin/Settings', ['settings' => Setting::forFrontend()]);
    }

    public function update(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'site_name' => ['required', 'string', 'max:120'],
            'tagline' => ['nullable', 'string', 'max:190'],
            'phone' => ['nullable', 'string', 'max:40'],
            'whatsapp' => ['nullable', 'regex:/^[0-9]{8,15}$/'],
            'email' => ['nullable', 'email', 'max:190'],
            'address' => ['nullable', 'string', 'max:255'],
            'map_embed_url' => ['nullable', 'url', 'max:2000'],
            'map_url' => ['nullable', 'url', 'max:255'],
            'facebook_url' => ['nullable', 'url', 'max:255'],
            'instagram_url' => ['nullable', 'url', 'max:255'],
            'youtube_url' => ['nullable', 'url', 'max:255'],
            'video_url' => ['nullable', 'url', 'max:255'],
            'check_in_time' => ['nullable', 'string', 'max:20'],
            'check_out_time' => ['nullable', 'string', 'max:20'],
            'hero_image' => ['nullable', ...$this->imageRule()],
            'hero_image_dark' => ['nullable', ...$this->imageRule()],
            'banner_image' => ['nullable', ...$this->imageRule()],
        ], ['whatsapp.regex' => 'Use digits only with country code, e.g. 94771234567.', ...$this->imageMessages()]);

        $current = Setting::allValues();

        $this->savingPhotos(function () use ($request, $data, $current) {
            foreach (Setting::IMAGE_KEYS as $key) {
                unset($data[$key]);
                if ($file = $request->file($key)) {
                    // These fill the whole screen, so they keep more pixels than other photos.
                    $data[$key] = $this->storeImage($file, 'site', $key, ImageOptimizer::MAX_SIDE_LARGE);
                    $this->discardPhoto($current[$key] ?: null);
                } elseif ($request->boolean('remove_'.$key)) {
                    $this->discardPhoto($current[$key] ?: null);
                    $data[$key] = '';
                }
            }

            Setting::put(array_map(fn ($v) => $v ?? '', $data));
        });

        return back()->with('success', 'Settings saved.');
    }
}
