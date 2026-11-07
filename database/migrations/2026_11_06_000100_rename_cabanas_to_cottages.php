<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * The stays are cottages, not cabanas: renames the cabanas table and every cabana_id column, then the word in
 * saved content (names, slugs, descriptions, gallery captions and category, package inclusions).
 * Rolling back restores the table and columns but leaves the content wording as cottages.
 */
return new class extends Migration
{
    // Tables linking to the stay, with what happens to their rows when it is deleted.
    private const LINKS = ['bookings' => 'cascade', 'packages' => 'set null', 'gallery_images' => 'cascade'];

    public function up(): void
    {
        $this->relink('cabana', 'cottage');
        $this->renameContent();
    }

    public function down(): void
    {
        $this->relink('cottage', 'cabana');
    }

    /**
     * Foreign keys and their indexes are dropped and re-added around the renames, since older MariaDB/MySQL
     * versions can't rename a column that is part of a foreign key or rename an index.
     */
    private function relink(string $from, string $to): void
    {
        foreach (array_keys(self::LINKS) as $table) {
            Schema::table($table, fn (Blueprint $t) => $t->dropForeign(["{$from}_id"]));
            Schema::table($table, function (Blueprint $t) use ($table, $from) {
                if ($table === 'bookings') {
                    $t->dropIndex(["{$from}_id", 'check_in', 'check_out']);
                } elseif (Schema::hasIndex($table, "{$table}_{$from}_id_foreign")) {
                    $t->dropIndex("{$table}_{$from}_id_foreign");
                }
            });
        }

        Schema::rename("{$from}s", "{$to}s");

        foreach (self::LINKS as $table => $onDelete) {
            Schema::table($table, fn (Blueprint $t) => $t->renameColumn("{$from}_id", "{$to}_id"));
            Schema::table($table, function (Blueprint $t) use ($table, $to, $onDelete) {
                if ($table === 'bookings') {
                    $t->index(["{$to}_id", 'check_in', 'check_out']);
                }
                $t->foreign("{$to}_id")->references('id')->on("{$to}s")->onDelete($onDelete);
            });
        }
    }

    private function renameContent(): void
    {
        $this->rewrite('cottages', ['name', 'slug', 'short_description', 'description']);
        $this->rewrite('packages', ['name', 'short_description', 'description'], json: ['inclusions']);
        $this->rewrite('gallery_images', ['caption', 'category']);
    }

    /** Swap the word in text columns, and in each item of JSON list columns. File paths are left alone. */
    private function rewrite(string $table, array $columns, array $json = []): void
    {
        DB::table($table)->get(['id', ...$columns, ...$json])->each(function ($row) use ($table, $columns, $json) {
            $changes = [];
            foreach ($columns as $column) {
                $changes[$column] = $this->cottage($row->{$column});
            }
            foreach ($json as $column) {
                $items = json_decode($row->{$column} ?? 'null', true);
                $changes[$column] = is_array($items)
                    ? json_encode(array_map(fn ($i) => is_string($i) ? $this->cottage($i) : $i, $items))
                    : $row->{$column};
            }
            DB::table($table)->where('id', $row->id)->update($changes);
        });
    }

    /** cabana → cottage, keeping the case: Cabana → Cottage, CABANA → COTTAGE, cabanas → cottages. */
    private function cottage(?string $text): ?string
    {
        return $text === null ? null : preg_replace_callback('/cabana/i', fn ($m) => match (true) {
            $m[0] === strtoupper($m[0]) => 'COTTAGE',
            ctype_upper($m[0][0]) => 'Cottage',
            default => 'cottage',
        }, $text);
    }
};
