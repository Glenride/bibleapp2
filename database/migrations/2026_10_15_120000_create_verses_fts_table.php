<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Full-text strategy is chosen per database driver:
     * - sqlite:  FTS5 virtual table (populated by BibleSeeder / app:verses-reindex)
     * - mysql:   FULLTEXT index on verses.text
     * - pgsql:   tsvector queried at runtime, no schema change needed
     */
    public function up(): void
    {
        $driver = Schema::getConnection()->getDriverName();

        if ($driver === 'sqlite' && $this->sqliteHasFts5()) {
            DB::statement('CREATE VIRTUAL TABLE IF NOT EXISTS verses_fts USING fts5(verse_id UNINDEXED, text)');
        } elseif ($driver === 'mysql') {
            DB::statement('ALTER TABLE verses ADD FULLTEXT INDEX verses_text_fulltext (text)');
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $driver = Schema::getConnection()->getDriverName();

        if ($driver === 'sqlite' && Schema::hasTable('verses_fts')) {
            DB::statement('DROP TABLE IF EXISTS verses_fts');
        } elseif ($driver === 'mysql') {
            DB::statement('ALTER TABLE verses DROP INDEX verses_text_fulltext');
        }
    }

    /**
     * Check the SQLite build actually ships FTS5; if not, we skip the
     * virtual table and search falls back to LIKE at query time.
     */
    protected function sqliteHasFts5(): bool
    {
        try {
            $options = DB::select('PRAGMA compile_options');

            foreach ($options as $row) {
                $values = (array) $row;

                if (in_array('ENABLE_FTS5', $values, true)) {
                    return true;
                }
            }
        } catch (\Throwable) {
            // fall through to false
        }

        return false;
    }
};
