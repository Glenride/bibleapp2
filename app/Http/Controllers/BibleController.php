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
        // The book index always shows the default version (KJV).
        $version = BibleVersion::where(
            'abbreviation',
            BibleVersion::VERSION_SLUGS['kjv']
        )->first();

        if (! $version) {
            return Inertia::render('Welcome', [
                'oldTestament' => [],
                'newTestament' => [],
            ]);
        }

        $books = $version->books()->orderBy('position')->withCount('chapters')->get();

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

    /**
     * Canonical KJV URLs: /bible/{book}/{chapter?}
     * These are unchanged and must never redirect — they are the SEO-canonical pages.
     */
    public function show(string $bookAbbrev, int $chapterNumber = 1)
    {
        return $this->renderChapter('kjv', $bookAbbrev, $chapterNumber);
    }

    /**
     * Version-prefixed URLs: /bible/{version}/{book}/{chapter?}
     * Unknown version slugs 404.
     */
    public function showVersioned(string $versionSlug, string $bookAbbrev, int $chapterNumber = 1)
    {
        return $this->renderChapter($versionSlug, $bookAbbrev, $chapterNumber);
    }

    protected function renderChapter(string $versionSlug, string $bookAbbrev, int $chapterNumber)
    {
        $versionSlug = strtolower($versionSlug);
        $abbreviation = BibleVersion::VERSION_SLUGS[$versionSlug] ?? null;

        if (! $abbreviation) {
            abort(404);
        }

        $version = BibleVersion::where('abbreviation', $abbreviation)->firstOrFail();

        $book = $version->books()->where('abbreviation', $bookAbbrev)->firstOrFail();

        $chapter = $book->chapters()->where('number', $chapterNumber)->with('verses')->firstOrFail();

        // Build prev/next links in the current version's URL space, so the
        // reader never silently drops out of (or into) another translation.
        $chapterLink = fn (string $bookAbbr, int $chapterNum) => $versionSlug === 'kjv'
            ? route('bible.chapter', ['book' => $bookAbbr, 'chapter' => $chapterNum])
            : route('bible.version.chapter', ['version' => $versionSlug, 'book' => $bookAbbr, 'chapter' => $chapterNum);

        // Navigation
        $prevLink = null;
        $nextLink = null;

        // Previous Link
        if ($chapterNumber > 1) {
            $prevLink = $chapterLink($book->abbreviation, $chapterNumber - 1);
        } else {
            $prevBook = $version->books()->where('position', '<', $book->position)->orderBy('position', 'desc')->first();
            if ($prevBook) {
                $lastChapter = $prevBook->chapters()->orderBy('number', 'desc')->first();
                if ($lastChapter) {
                    $prevLink = $chapterLink($prevBook->abbreviation, $lastChapter->number);
                }
            }
        }

        // Next Link
        $chaptersCount = $book->chapters()->count();
        if ($chapterNumber < $chaptersCount) {
            $nextLink = $chapterLink($book->abbreviation, $chapterNumber + 1);
        } else {
            $nextBook = $version->books()->where('position', '>', $book->position)->orderBy('position', 'asc')->first();
            if ($nextBook) {
                $nextLink = $chapterLink($nextBook->abbreviation, 1);
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
            'version' => array_merge(
                $version->only(['name', 'abbreviation', 'language']),
                [
                    'slug' => $versionSlug,
                    'label' => BibleVersion::VERSION_LABELS[$versionSlug] ?? strtoupper($versionSlug),
                ]
            ),
            'available_versions' => BibleVersion::availableForSwitcher(),
            'total_chapters' => $chaptersCount,
            'prev_link' => $prevLink,
            'next_link' => $nextLink,
            'userInteractions' => $userInteractions,
        ]);
    }
}
