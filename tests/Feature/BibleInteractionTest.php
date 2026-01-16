<?php

namespace Tests\Feature;

use App\Models\BibleVersion;
use App\Models\Book;
use App\Models\Chapter;
use App\Models\User;
use App\Models\Verse;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BibleInteractionTest extends TestCase
{
    use RefreshDatabase;

    private $user;
    private $verse;
    private $book;
    private $chapter;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->user = User::factory()->create();
        $version = BibleVersion::factory()->create();
        $this->book = Book::factory()->create(['bible_version_id' => $version->id]);
        $this->chapter = Chapter::factory()->create(['book_id' => $this->book->id]);
        $this->verse = Verse::factory()->create(['chapter_id' => $this->chapter->id]);
    }

    public function test_user_can_highlight_verse(): void
    {
        $response = $this->actingAs($this->user)->post(route('bible.highlight'), [
            'verse_id' => $this->verse->id,
            'color' => 'yellow',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('highlights', [
            'user_id' => $this->user->id,
            'verse_id' => $this->verse->id,
            'color' => 'yellow',
        ]);
    }

    public function test_user_can_favorite_verse(): void
    {
        $response = $this->actingAs($this->user)->post(route('bible.favorite'), [
            'verse_id' => $this->verse->id,
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('favorites', [
            'user_id' => $this->user->id,
            'verse_id' => $this->verse->id,
        ]);
    }

    public function test_user_can_bookmark_chapter(): void
    {
        $response = $this->actingAs($this->user)->post(route('bible.bookmark'), [
            'book_id' => $this->book->id,
            'chapter_id' => $this->chapter->id,
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('bookmarks', [
            'user_id' => $this->user->id,
            'book_id' => $this->book->id,
            'chapter_id' => $this->chapter->id,
        ]);
    }

    public function test_user_can_add_note_to_highlight(): void
    {
        $response = $this->actingAs($this->user)->post(route('bible.highlight'), [
            'verse_id' => $this->verse->id,
            'color' => 'yellow',
            'note' => 'This is a test note',
        ]);

        $this->assertDatabaseHas('highlights', [
            'user_id' => $this->user->id,
            'verse_id' => $this->verse->id,
            'note' => 'This is a test note',
        ]);
    }
}
