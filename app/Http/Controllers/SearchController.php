<?php

namespace App\Http\Controllers;

use App\Models\Verse;
use App\Models\Lesson;
use App\Models\Sermon;
use App\Models\Highlight;
use App\Models\Favorite;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SearchController extends Controller
{
    public function index(Request $request)
    {
        $query = $request->input('q', '');
        $results = [
            'verses' => [],
            'lessons' => [],
            'sermons' => [],
            'highlights' => [],
            'favorites' => [],
        ];

        if (strlen($query) >= 2) {
            $user = $request->user();

            // Search Bible verses (public content)
            $results['verses'] = Verse::with(['chapter.book'])
                ->where('text', 'like', "%{$query}%")
                ->limit(50)
                ->get()
                ->map(function ($verse) {
                    return [
                        'id' => $verse->id,
                        'text' => $verse->text,
                        'verse_number' => $verse->number,
                        'reference' => $verse->chapter->book->name . ' ' . $verse->chapter->number . ':' . $verse->number,
                        'book_abbr' => $verse->chapter->book->abbreviation,
                        'chapter_number' => $verse->chapter->number,
                    ];
                });

            // Search user's lessons
            $results['lessons'] = Lesson::where('user_id', $user->id)
                ->where(function ($q) use ($query) {
                    $q->where('title', 'like', "%{$query}%")
                      ->orWhere('content', 'like', "%{$query}%")
                      ->orWhere('theme', 'like', "%{$query}%");
                })
                ->limit(20)
                ->get()
                ->map(function ($lesson) {
                    return [
                        'id' => $lesson->id,
                        'title' => $lesson->title,
                        'theme' => $lesson->theme,
                        'content_preview' => \Illuminate\Support\Str::limit(strip_tags($lesson->content), 150),
                        'created_at' => $lesson->created_at->toISOString(),
                        'sermon_id' => $lesson->sermon_id,
                    ];
                });

            // Search user's sermons
            $results['sermons'] = Sermon::where('user_id', $user->id)
                ->where(function ($q) use ($query) {
                    $q->where('title', 'like', "%{$query}%")
                      ->orWhere('description', 'like', "%{$query}%")
                      ->orWhere('detected_theme', 'like', "%{$query}%")
                      ->orWhere('analysis', 'like', "%{$query}%");
                })
                ->withCount('lessons')
                ->limit(20)
                ->get()
                ->map(function ($sermon) {
                    return [
                        'id' => $sermon->id,
                        'title' => $sermon->title,
                        'description' => $sermon->description,
                        'detected_theme' => $sermon->detected_theme,
                        'lessons_count' => $sermon->lessons_count,
                        'created_at' => $sermon->created_at->toISOString(),
                    ];
                });

            // Search user's highlights (verse text)
            $results['highlights'] = Highlight::with(['verse.chapter.book'])
                ->where('user_id', $user->id)
                ->whereHas('verse', function ($q) use ($query) {
                    $q->where('text', 'like', "%{$query}%");
                })
                ->limit(20)
                ->get()
                ->map(function ($highlight) {
                    return [
                        'id' => $highlight->id,
                        'verse_id' => $highlight->verse_id,
                        'color' => $highlight->color,
                        'note' => $highlight->note,
                        'text' => $highlight->verse->text,
                        'reference' => $highlight->verse->chapter->book->name . ' ' . $highlight->verse->chapter->number . ':' . $highlight->verse->number,
                        'book_abbr' => $highlight->verse->chapter->book->abbreviation,
                        'chapter_number' => $highlight->verse->chapter->number,
                        'verse_number' => $highlight->verse->number,
                    ];
                });

            // Search user's favorites (verse text and notes)
            $results['favorites'] = Favorite::with(['verse.chapter.book'])
                ->where('user_id', $user->id)
                ->where(function ($q) use ($query) {
                    $q->whereHas('verse', function ($v) use ($query) {
                        $v->where('text', 'like', "%{$query}%");
                    })->orWhere('note', 'like', "%{$query}%");
                })
                ->limit(20)
                ->get()
                ->map(function ($favorite) {
                    return [
                        'id' => $favorite->id,
                        'verse_id' => $favorite->verse_id,
                        'note' => $favorite->note,
                        'text' => $favorite->verse->text,
                        'reference' => $favorite->verse->chapter->book->name . ' ' . $favorite->verse->chapter->number . ':' . $favorite->verse->number,
                        'book_abbr' => $favorite->verse->chapter->book->abbreviation,
                        'chapter_number' => $favorite->verse->chapter->number,
                        'verse_number' => $favorite->verse->number,
                    ];
                });
        }

        return Inertia::render('Search/Index', [
            'query' => $query,
            'results' => $results,
        ]);
    }
}
