<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /** Left empty, a package uses the site-wide check-in and check-out times from Settings. */
    public function up(): void
    {
        Schema::table('packages', function (Blueprint $table) {
            $table->string('check_in_time', 20)->nullable()->after('guests');
            $table->string('check_out_time', 20)->nullable()->after('check_in_time');
        });
    }

    public function down(): void
    {
        Schema::table('packages', function (Blueprint $table) {
            $table->dropColumn(['check_in_time', 'check_out_time']);
        });
    }
};
