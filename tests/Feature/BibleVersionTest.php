<?php

namespace Tests\Feature;

use App\Models\BibleVersion;
use App\Models\Book;
use App\Models\Chapter;
use App\Models\Verse;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class BibleVersionTest extends TestCase
{
    use RefreshDatabase;

    private function seedVersions(): void
    {
        foreach (['en_kjv' => 'KJV text', 'en_bbe' => 'BBE text'] as $abbreviation => $marker) {
            $version = BibleVersion::factory()->create([
                'abbreviation' => $abbreviation,
                'name' => $abbreviation === 'en_kjv' ? 'King James Version' : 'Basic English',
            ]);

            $book = Book::factory()->create([
                'bible_version_id' => $version->id,
                'name' => 'Genesis',
                'abbreviation' => 'gen',
                'position' => 1,
            ]);

            // Two chapters so prev/next navigation links exist.
            foreach ([1, 2] as $chapterNumber) {
                $chapter = Chapter::factory()->create([
                    'book_id' => $book->id,
                    'number' => $chapterNumber,
                ]);

                Verse::factory()->create([
                    'chapter_id' => $chapter->id,
                    'number' => 1,
                    'text' => $abbreviation === 'en_kjv'
                        ? ($chapterNumber === 1 ? 'In the beginning God created the heaven and the earth.' : 'Thus the heavens and the earth were finished.')
                        : ($chapterNumber === 1 ? 'At the first God made the heaven and the earth.' : 'And the heavens and the earth were finished.'),
                ]);
            }
        }
    }

    public function test_default_bible_url_still_renders_kjv(): void
    {
        $this->seedVersions();

        $response = $this->get('/bible/gen/1');

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Bible/Chapter')
            ->where('version.slug', 'kjv')
            ->where('version.label', 'KJV')
            ->where('verses.0.text', 'In the beginning God created the heaven and the earth.')
            ->has('available_versions', 2)
        );
    }

    public function test_version_prefixed_url_renders_bbe(): void
    {
        $this->seedVersions();

        $response = $this->get('/bible/bbe/gen/1');

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Bible/Chapter')
            ->where('version.slug', 'bbe')
            ->where('version.label', 'BBE')
            ->where('verses.0.text', 'At the first God made the heaven and the earth.')
        );
    }

    public function test_versioned_navigation_links_stay_in_version(): void
    {
        $this->seedVersions();

        $response = $this->get('/bible/bbe/gen/1');

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->where('next_link', fn ($link) => str_contains((string) $link, '/bible/bbe/gen/2'))
        );

        $response = $this->get('/bible/gen/1');

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->where('next_link', fn ($link) => str_contains((string) $link, '/bible/gen/2')
                && ! str_contains((string) $link, '/bible/bbe'))
        );
    }

    public function test_unknown_version_slug_returns_404(): void
    {
        $this->seedVersions();

        $this->get('/bible/niv/gen/1')->assertNotFound();
    }

    public function test_search_can_be_scoped_to_a_version(): void
    {
        $this->seedVersions();

        $response = $this->get('/bible/search?q=beginning&version=bbe');

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Bible/Search')
            ->where('version.slug', 'bbe')
            // "beginning" only appears in the KJV verse text, so the BBE
            // search must come back empty.
            ->has('results', 0)
        );

        $response = $this->get('/bible/search?q=beginning');

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->where('version.slug', 'kjv')
            ->has('results', 1)
        );
    }
}
