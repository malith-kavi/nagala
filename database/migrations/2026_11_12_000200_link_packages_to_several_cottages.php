<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * A package could name one cottage; now it can name several (cottage_package). A package naming
 * none still fits every cottage sized for its guests.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cottage_package', function (Blueprint $table) {
            $table->foreignId('package_id')->constrained()->cascadeOnDelete();
            $table->foreignId('cottage_id')->constrained()->cascadeOnDelete();
            $table->primary(['package_id', 'cottage_id']);
        });

        DB::table('cottage_package')->insertUsing(
            ['package_id', 'cottage_id'],
            DB::table('packages')->whereNotNull('cottage_id')->select('id', 'cottage_id'),
        );

        Schema::table('packages', function (Blueprint $table) {
            $table->dropForeign(['cottage_id']);
        });
        Schema::table('packages', function (Blueprint $table) {
            $table->dropColumn('cottage_id');
        });
    }

    /** Going back keeps only the first cottage each package names. */
    public function down(): void
    {
        Schema::table('packages', function (Blueprint $table) {
            $table->foreignId('cottage_id')->nullable()->after('price')->constrained()->nullOnDelete();
        });

        DB::table('cottage_package')->selectRaw('package_id, MIN(cottage_id) AS cottage_id')->groupBy('package_id')->get()
            ->each(fn ($link) => DB::table('packages')->where('id', $link->package_id)->update(['cottage_id' => $link->cottage_id]));

        Schema::dropIfExists('cottage_package');
    }
};
