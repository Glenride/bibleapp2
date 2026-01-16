<?php

namespace Tests\Feature;

use App\Models\BibleVersion;
use App\Models\Book;
use App\Models\Chapter;
use App\Models\User;
use App\Models\Verse;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class BibleReadTest extends TestCase
{
    use RefreshDatabase;

    public function test_bible_index_page_can_be_rendered(): void
    {
        $version = BibleVersion::factory()->create([
            'name' => 'King James Version',
            'abbreviation' => 'KJV',
        ]);
        
        $book = Book::factory()->create([
            'bible_version_id' => $version->id,
            'name' => 'Genesis',
            'abbreviation' => 'gen',
            'position' => 1,
        ]);

        $response = $this->get('/');

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Bible/Index')
            ->has('version')
            ->has('books', 1)
        );
    }

    public function test_bible_chapter_page_can_be_rendered(): void
    {
        $version = BibleVersion::factory()->create();
        $book = Book::factory()->create(['bible_version_id' => $version->id, 'abbreviation' => 'gen']);
        $chapter = Chapter::factory()->create(['book_id' => $book->id, 'number' => 1]);
        $verse = Verse::factory()->create(['chapter_id' => $chapter->id, 'number' => 1, 'text' => 'In the beginning...']);

        $response = $this->get(route('bible.chapter', ['book' => $book->abbreviation, 'chapter' => $chapter->number]));

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Bible/Chapter')
            ->has('book')
            ->has('chapter')
            ->has('verses', 1)
        );
    }
}
