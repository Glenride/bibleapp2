<?php

namespace Database\Seeders;

use App\Models\BibleVersion;
use App\Models\Book;
use App\Models\Chapter;
use App\Models\Verse;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Schema;

class BibleSeeder extends Seeder
{
    /**
     * Translations imported into the database. Deliberately an allowlist —
     * the other vendored translations in bible/json are excluded for now.
     *
     * NOTE: pt_nvi (Nova Versão Internacional / Portuguese NIV) must NEVER
     * be added here. It is copyrighted by Biblica and cannot be freely
     * distributed.
     */
    private const ALLOWED_VERSIONS = ['en_kjv', 'en_bbe'];

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Increase memory limit for large imports
        ini_set('memory_limit', '512M');

        $jsonPath = base_path('bible/json');
        $this->command->info("Looking for JSON at: $jsonPath");
        $indexFile = $jsonPath . '/index.json';

        if (!File::exists($indexFile)) {
            $this->command->error("Index file not found at: $indexFile");
            return;
        }

        $languages = json_decode(File::get($indexFile), true);

        // Wrap in transaction to speed up inserts
        DB::transaction(function () use ($languages, $jsonPath) {
            foreach ($languages as $langData) {
                $language = $langData['language'];

                foreach ($langData['versions'] as $versionData) {
                    $versionName = $versionData['name'];
                    $abbreviation = $versionData['abbreviation'];

                    // Only import allowlisted versions (see ALLOWED_VERSIONS above)
                    if (! in_array($abbreviation, self::ALLOWED_VERSIONS, true)) {
                        continue;
                    }

                    $this->command->info("Importing $versionName ($language)...");

                    $bibleVersion = BibleVersion::firstOrCreate(
                        ['abbreviation' => $abbreviation],
                        [
                            'name' => $versionName,
                            'language' => $language,
                        ]
                    );

                    // If books already exist for this version, skip importing content to save time/duplication
                    if ($bibleVersion->books()->exists()) {
                         $this->command->info("Books already exist for $versionName. Skipping content import.");
                         continue;
                    }

                    $versionFile = $jsonPath . '/' . $abbreviation . '.json';

                    if (!File::exists($versionFile)) {
                        $this->command->warn("File not found for version: $abbreviation");
                        continue;
                    }

                    $content = File::get($versionFile);
                    
                    // Remove BOM if present
                    $bom = pack('H*','EFBBBF');
                    $content = preg_replace("/^$bom/", '', $content);
                    
                    $booksData = json_decode($content, true);

                    if (json_last_error() !== JSON_ERROR_NONE) {
                        $this->command->error("JSON Decode Error: " . json_last_error_msg());
                        // Print first few chars to see if it looks right
                        $this->command->info("First 100 chars: " . substr($content, 0, 100));
                        continue;
                    }

                    if (!is_array($booksData)) {
                         $this->command->error("JSON Data is not an array");
                         continue;
                    }

                    $bookPosition = 1;
                    foreach ($booksData as $bookData) {
                        // Some JSONs might use 'name' or 'book' for the book name.
                        // Based on grep, it seems to be 'name' in en_kjv, but README says "book": "name".
                        // Let's check both or fallback.
                        // I saw "name": "Genesis" in my grep.
                        // But README says: "book" : "name"
                        // My grep command `grep -o '"name": "[^"]*"'` returned "name": "Genesis".
                        // So I will trust my grep. But I'll handle potential variations if needed.
                        
                        // Wait, looking at grep output again:
                        // "name": "Genesis"
                        // So the key is "name".
                        
                        $bookName = $bookData['name'] ?? $bookData['book'] ?? 'Unknown';
                        $bookAbbrev = $bookData['abbrev'] ?? '';
                        
                        $book = Book::create([
                            'bible_version_id' => $bibleVersion->id,
                            'name' => $bookName,
                            'abbreviation' => $bookAbbrev,
                            'position' => $bookPosition++,
                        ]);

                        $chapters = $bookData['chapters'] ?? [];
                        
                        foreach ($chapters as $index => $verses) {
                            $chapterNumber = $index + 1;
                            
                            $chapter = Chapter::create([
                                'book_id' => $book->id,
                                'number' => $chapterNumber,
                            ]);

                            $versesData = [];
                            foreach ($verses as $vIndex => $text) {
                                $versesData[] = [
                                    'chapter_id' => $chapter->id,
                                    'number' => $vIndex + 1,
                                    'text' => $text,
                                    'created_at' => now(),
                                    'updated_at' => now(),
                                ];
                            }
                            
                            // Batch insert verses for performance
                            Verse::insert($versesData);
                        }
                    }
                }
            }
        });

        // Keep the SQLite FTS5 search index in sync with the imported verses.
        // (MySQL/Postgres use native indexes; see the verses_fts migration.)
        if (DB::getDriverName() === 'sqlite' && Schema::hasTable('verses_fts')) {
            $this->command->info('Populating verses_fts search index...');
            DB::statement('DELETE FROM verses_fts');
            DB::statement('INSERT INTO verses_fts (verse_id, text) SELECT id, text FROM verses');
        }
    }
}
