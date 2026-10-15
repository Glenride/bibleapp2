<?php

namespace Tests\Feature;

use App\Models\BibleVersion;
use App\Models\Book;
use App\Models\Chapter;
use App\Models\Verse;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class BibleSearchTest extends TestCase
{
    use RefreshDatabase;

    private function seedVerses(): void
    {
        $version = BibleVersion::factory()->create(['abbreviation' => 'KJV']);
        $book = Book::factory()->create([
            'bible_version_id' => $version->id,
            'name' => 'Psalms',
            'abbreviation' => 'ps',
            'position' => 19,
        ]);
        $chapter = Chapter::factory()->create(['book_id' => $book->id, 'number' => 23]);

        Verse::factory()->create([
            'chapter_id' => $chapter->id,
            'number' => 1,
            'text' => 'The Lord is my shepherd; I shall not want.',
        ]);
        Verse::factory()->create([
            'chapter_id' => $chapter->id,
            'number' => 2,
            'text' => 'He maketh me to lie down in green pastures.',
        ]);
        Verse::factory()->create([
            'chapter_id' => $chapter->id,
            'number' => 3,
            'text' => 'In the beginning God created the heaven and the earth.',
        ]);

        // Populate the FTS index when the driver uses one, so the MATCH
        // code path is exercised on sqlite.
        if (Schema::getConnection()->getDriverName() === 'sqlite' && Schema::hasTable('verses_fts')) {
            DB::statement('INSERT INTO verses_fts (verse_id, text) SELECT id, text FROM verses');
        }
    }

    public function test_search_returns_matching_verses(): void
    {
        $this->seedVerses();

        $response = $this->get('/bible/search?q=shepherd');

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Bible/Search')
            ->where('query', 'shepherd')
            ->has('results', 1)
            ->where('results.0.reference', 'Psalms 23:1')
            ->where('results.0.book_abbreviation', 'ps')
            ->where('results.0.chapter_number', 23)
            ->where('results.0.verse_number', 1)
        );
    }

    public function test_search_falls_back_to_like_when_fts_is_empty(): void
    {
        $this->seedVerses();

        if (Schema::hasTable('verses_fts')) {
            DB::table('verses_fts')->delete();
        }

        $response = $this->get('/bible/search?q=shepherd');

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Bible/Search')
            ->has('results', 1)
            ->where('results.0.reference', 'Psalms 23:1')
        );
    }

    public function test_search_ignores_short_queries(): void
    {
        $this->seedVerses();

        $response = $this->get('/bible/search?q=a');

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Bible/Search')
            ->where('query', 'a')
            ->has('results', 0)
        );
    }

    public function test_search_with_no_query_returns_empty_results(): void
    {
        $response = $this->get('/bible/search');

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Bible/Search')
            ->where('query', '')
            ->has('results', 0)
        );
    }
}
