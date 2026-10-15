<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class ReindexVerses extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:verses-reindex';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Rebuild the SQLite FTS5 full-text index over verses (no-op on MySQL/Postgres, which index natively)';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $driver = Schema::getConnection()->getDriverName();

        if ($driver !== 'sqlite') {
            $this->info("Driver [{$driver}] uses a native full-text index; nothing to rebuild.");

            return self::SUCCESS;
        }

        if (! Schema::hasTable('verses_fts')) {
            $this->error('verses_fts table is missing. Run migrations first.');

            return self::FAILURE;
        }

        $this->info('Rebuilding verses_fts...');

        DB::statement('DELETE FROM verses_fts');
        DB::statement('INSERT INTO verses_fts (verse_id, text) SELECT id, text FROM verses');

        $count = DB::table('verses_fts')->count();
        $this->info("Indexed {$count} verses.");

        return self::SUCCESS;
    }
}
