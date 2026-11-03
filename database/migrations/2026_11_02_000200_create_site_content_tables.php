<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cabanas', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('short_description')->nullable();
            $table->text('description')->nullable();
            $table->unsignedTinyInteger('max_guests')->default(2);
            $table->string('beds')->nullable();
            $table->json('features')->nullable();
            $table->unsignedInteger('price_per_night');
            $table->unsignedTinyInteger('units')->default(1);
            $table->string('cover_image')->nullable();
            $table->json('images')->nullable();
            $table->boolean('is_active')->default(true);
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();
        });

        Schema::create('packages', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('short_description')->nullable();
            $table->text('description')->nullable();
            $table->unsignedTinyInteger('nights')->default(1);
            $table->unsignedTinyInteger('guests')->default(2);
            $table->json('inclusions')->nullable();
            $table->unsignedInteger('price');
            $table->foreignId('cabana_id')->nullable()->constrained()->nullOnDelete();
            $table->string('cover_image')->nullable();
            $table->boolean('is_active')->default(true);
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();
        });

        Schema::create('nearby_places', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->decimal('distance_km', 5, 1)->nullable();
            $table->unsignedSmallInteger('travel_minutes')->nullable();
            $table->string('tagline')->nullable();
            $table->string('short_description')->nullable();
            $table->text('description')->nullable();
            $table->string('cover_image')->nullable();
            $table->string('map_url', 1000)->nullable();
            $table->boolean('is_active')->default(true);
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();
        });

        Schema::create('gallery_images', function (Blueprint $table) {
            $table->id();
            $table->string('path');
            $table->string('caption')->nullable();
            $table->string('category')->default('nature');
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();
        });

        Schema::create('bookings', function (Blueprint $table) {
            $table->id();
            $table->string('reference')->unique();
            $table->foreignId('cabana_id')->constrained()->cascadeOnDelete();
            $table->foreignId('package_id')->nullable()->constrained()->nullOnDelete();
            $table->date('check_in');
            $table->date('check_out');
            $table->unsignedTinyInteger('guests');
            $table->string('name');
            $table->string('email');
            $table->string('phone');
            $table->text('notes')->nullable();
            $table->unsignedInteger('total_price');
            $table->string('status')->default('pending')->index();
            $table->timestamps();

            $table->index(['cabana_id', 'check_in', 'check_out']);
        });

        Schema::create('contact_messages', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email');
            $table->string('phone')->nullable();
            $table->string('subject')->nullable();
            $table->text('message');
            $table->timestamp('read_at')->nullable();
            $table->timestamps();
        });

        Schema::create('settings', function (Blueprint $table) {
            $table->string('key')->primary();
            $table->text('value')->nullable();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('settings');
        Schema::dropIfExists('contact_messages');
        Schema::dropIfExists('bookings');
        Schema::dropIfExists('gallery_images');
        Schema::dropIfExists('nearby_places');
        Schema::dropIfExists('packages');
        Schema::dropIfExists('cabanas');
    }
};
