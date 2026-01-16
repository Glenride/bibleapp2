<?php

namespace App\Http\Controllers;

use App\Models\BibleVersion;
use App\Models\Book;
use App\Models\Chapter;
use Illuminate\Http\Request;
use Inertia\Inertia;

use Illuminate\Support\Facades\Auth;

class BibleController extends Controller
{
    public function index()
    {
        // For now, we assume we are using the first version (KJV)
        $version = BibleVersion::first();
        
        if (!$version) {
             return Inertia::render('Welcome', [
                 'oldTestament' => [],
                 'newTestament' => []
             ]);
        }

        $books = $version->books()->orderBy('position')->get();

        $oldTestament = $books->filter(function ($book) {
            return $book->position <= 39;
        })->values();

        $newTestament = $books->filter(function ($book) {
            return $book->position >= 40;
        })->values();

        return Inertia::render('Welcome', [
            'oldTestament' => $oldTestament,
            'newTestament' => $newTestament
        ]);
    }

    public function show(string $bookAbbrev, int $chapterNumber = 1)
    {
        $version = BibleVersion::firstOrFail();
        
        $book = $version->books()->where('abbreviation', $bookAbbrev)->firstOrFail();
        
        $chapter = $book->chapters()->where('number', $chapterNumber)->with('verses')->firstOrFail();
        
        // Navigation
        $prevLink = null;
        $nextLink = null;

        // Previous Link
        if ($chapterNumber > 1) {
             $prevLink = route('bible.chapter', ['book' => $book->abbreviation, 'chapter' => $chapterNumber - 1]);
        } else {
            $prevBook = $version->books()->where('position', '<', $book->position)->orderBy('position', 'desc')->first();
            if ($prevBook) {
                $lastChapter = $prevBook->chapters()->orderBy('number', 'desc')->first();
                if ($lastChapter) {
                    $prevLink = route('bible.chapter', ['book' => $prevBook->abbreviation, 'chapter' => $lastChapter->number]);
                }
            }
        }

        // Next Link
        $chaptersCount = $book->chapters()->count();
        if ($chapterNumber < $chaptersCount) {
            $nextLink = route('bible.chapter', ['book' => $book->abbreviation, 'chapter' => $chapterNumber + 1]);
        } else {
            $nextBook = $version->books()->where('position', '>', $book->position)->orderBy('position', 'asc')->first();
            if ($nextBook) {
                $nextLink = route('bible.chapter', ['book' => $nextBook->abbreviation, 'chapter' => 1]);
            }
        }
        
        // User Interactions
        $userInteractions = [
            'highlights' => [],
            'favorites' => [],
            'bookmark' => null
        ];

        if (Auth::check()) {
            $user = Auth::user();
            $verseIds = $chapter->verses->pluck('id');

            $userInteractions['highlights'] = $user->highlights()
                ->whereIn('verse_id', $verseIds)
                ->get()
                ->keyBy('verse_id');

            $userInteractions['favorites'] = $user->favorites()
                ->whereIn('verse_id', $verseIds)
                ->get()
                ->keyBy('verse_id');

            $userInteractions['bookmark'] = $user->bookmarks()
                ->where('chapter_id', $chapter->id)
                ->first();
        }

        return Inertia::render('Bible/Chapter', [
            'book' => $book,
            'chapter' => $chapter,
            'verses' => $chapter->verses,
            'prev_link' => $prevLink,
            'next_link' => $nextLink,
            'userInteractions' => $userInteractions,
        ]);
    }
}
