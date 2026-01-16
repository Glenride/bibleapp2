<?php

namespace Tests\Feature;

use App\Models\BibleVersion;
use App\Models\Book;
use App\Models\Chapter;
use App\Models\User;
use App\Models\Verse;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BibleInteractionSecurityTest extends TestCase
{
    use RefreshDatabase;

    private $userA;
    private $userB;
    private $verse;
    private $book;
    private $chapter;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->userA = User::factory()->create();
        $this->userB = User::factory()->create();
        
        $version = BibleVersion::factory()->create();
        $this->book = Book::factory()->create(['bible_version_id' => $version->id]);
        $this->chapter = Chapter::factory()->create(['book_id' => $this->book->id]);
        $this->verse = Verse::factory()->create(['chapter_id' => $this->chapter->id]);
    }

    public function test_users_have_independent_highlights_on_same_verse(): void
    {
        // User A highlights verse
        $this->actingAs($this->userA)->post(route('bible.highlight'), [
            'verse_id' => $this->verse->id,
            'color' => 'yellow',
            'note' => 'User A Note',
        ]);

        // User B highlights same verse
        $this->actingAs($this->userB)->post(route('bible.highlight'), [
            'verse_id' => $this->verse->id,
            'color' => 'green',
            'note' => 'User B Note',
        ]);

        // Verify User A's highlight is unchanged
        $this->assertDatabaseHas('highlights', [
            'user_id' => $this->userA->id,
            'verse_id' => $this->verse->id,
            'color' => 'yellow',
            'note' => 'User A Note',
        ]);

        // Verify User B's highlight is correct
        $this->assertDatabaseHas('highlights', [
            'user_id' => $this->userB->id,
            'verse_id' => $this->verse->id,
            'color' => 'green',
            'note' => 'User B Note',
        ]);
    }

    public function test_user_cannot_delete_another_users_highlight_via_toggle(): void
    {
        // User B highlights a verse
        $this->actingAs($this->userB)->post(route('bible.highlight'), [
            'verse_id' => $this->verse->id,
            'color' => 'yellow',
        ]);

        // User A tries to "remove" highlight on same verse (by toggling with same color)
        // But since User A doesn't have a highlight, this should CREATE one for User A, not delete User B's.
        $this->actingAs($this->userA)->post(route('bible.highlight'), [
            'verse_id' => $this->verse->id,
            'color' => 'yellow',
        ]);

        // User B's highlight should still exist
        $this->assertDatabaseHas('highlights', [
            'user_id' => $this->userB->id,
            'verse_id' => $this->verse->id,
        ]);

        // User A should now have a highlight too
        $this->assertDatabaseHas('highlights', [
            'user_id' => $this->userA->id,
            'verse_id' => $this->verse->id,
        ]);
    }

    public function test_users_have_independent_favorites(): void
    {
        // User A favorites verse
        $this->actingAs($this->userA)->post(route('bible.favorite'), [
            'verse_id' => $this->verse->id,
            'note' => 'User A Fav',
        ]);

        // User B favorites same verse
        $this->actingAs($this->userB)->post(route('bible.favorite'), [
            'verse_id' => $this->verse->id,
            'note' => 'User B Fav',
        ]);

        $this->assertDatabaseHas('favorites', [
            'user_id' => $this->userA->id,
            'verse_id' => $this->verse->id,
            'note' => 'User A Fav',
        ]);

        $this->assertDatabaseHas('favorites', [
            'user_id' => $this->userB->id,
            'verse_id' => $this->verse->id,
            'note' => 'User B Fav',
        ]);
    }

    public function test_users_have_independent_bookmarks(): void
    {
        // User A bookmarks chapter
        $this->actingAs($this->userA)->post(route('bible.bookmark'), [
            'book_id' => $this->book->id,
            'chapter_id' => $this->chapter->id,
            'note' => 'User A Bookmark',
        ]);

        // User B bookmarks same chapter
        $this->actingAs($this->userB)->post(route('bible.bookmark'), [
            'book_id' => $this->book->id,
            'chapter_id' => $this->chapter->id,
            'note' => 'User B Bookmark',
        ]);

        $this->assertDatabaseHas('bookmarks', [
            'user_id' => $this->userA->id,
            'book_id' => $this->book->id,
            'chapter_id' => $this->chapter->id,
            'note' => 'User A Bookmark',
        ]);

        $this->assertDatabaseHas('bookmarks', [
            'user_id' => $this->userB->id,
            'book_id' => $this->book->id,
            'chapter_id' => $this->chapter->id,
            'note' => 'User B Bookmark',
        ]);
    }
}
