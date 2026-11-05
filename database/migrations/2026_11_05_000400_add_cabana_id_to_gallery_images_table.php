<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Cabana photos now join the gallery automatically. Gallery rows with a cabana_id point at that cabana's photo
 * file, so they leave the gallery with it. Photos already on cabanas are added here, unless already in the gallery.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('gallery_images', function (Blueprint $table) {
            $table->foreignId('cabana_id')->nullable()->after('id')->constrained()->cascadeOnDelete();
        });

        $inGallery = DB::table('gallery_images')->pluck('path')->flip()->all();

        DB::table('cabanas')->orderBy('sort_order')->orderBy('id')->get(['id', 'name', 'cover_image', 'images'])
            ->each(function ($cabana) use (&$inGallery) {
                $paths = array_filter([$cabana->cover_image, ...(json_decode($cabana->images ?? '[]', true) ?: [])]);

                foreach ($paths as $path) {
                    if (isset($inGallery[$path])) {
                        continue;
                    }
                    DB::table('gallery_images')->insert([
                        'cabana_id' => $cabana->id,
                        'path' => $path,
                        'caption' => $cabana->name,
                        'category' => 'cabanas',
                        'sort_order' => 0,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                    $inGallery[$path] = true;
                }
            });
    }

    public function down(): void
    {
        DB::table('gallery_images')->whereNotNull('cabana_id')->delete();

        Schema::table('gallery_images', function (Blueprint $table) {
            $table->dropConstrainedForeignId('cabana_id');
        });
    }
};
