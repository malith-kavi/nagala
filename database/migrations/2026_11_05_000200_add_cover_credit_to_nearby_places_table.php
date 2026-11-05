<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('nearby_places', function (Blueprint $table) {
            $table->string('cover_credit')->nullable()->after('cover_image');
        });
    }

    public function down(): void
    {
        Schema::table('nearby_places', function (Blueprint $table) {
            $table->dropColumn('cover_credit');
        });
    }
};
