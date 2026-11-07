<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Admin\Concerns\ManagesUploads;
use App\Http\Controllers\Controller;
use App\Models\Setting;
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
            'facebook_url' => ['nullable', 'url', 'max:255'],
            'instagram_url' => ['nullable', 'url', 'max:255'],
            'youtube_url' => ['nullable', 'url', 'max:255'],
            'video_url' => ['nullable', 'url', 'max:255'],
            'check_in_time' => ['nullable', 'string', 'max:20'],
            'check_out_time' => ['nullable', 'string', 'max:20'],
            'hero_image' => ['nullable', 'image', 'max:10240'],
            'hero_image_dark' => ['nullable', 'image', 'max:10240'],
            'banner_image' => ['nullable', 'image', 'max:10240'],
        ], ['whatsapp.regex' => 'Use digits only with country code, e.g. 94771234567.']);

        $current = Setting::allValues();

        foreach (Setting::IMAGE_KEYS as $key) {
            unset($data[$key]);
            if ($request->boolean('remove_'.$key)) {
                $this->deleteStored($current[$key] ?: null);
                $data[$key] = '';
            }
            if ($file = $request->file($key)) {
                $this->deleteStored($current[$key] ?: null);
                $data[$key] = $file->store('site', 'uploads');
            }
        }

        Setting::put(array_map(fn ($v) => $v ?? '', $data));

        return back()->with('success', 'Settings saved.');
    }
}
