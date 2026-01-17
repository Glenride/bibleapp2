<?php

namespace App\Http\Controllers;

use App\Models\Lesson;
use App\Services\LessonGeneratorService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;

class LessonController extends Controller
{
    public function __construct(
        protected LessonGeneratorService $lessonGenerator
    ) {}

    public function index()
    {
        $user = Auth::user();

        $lessons = $user->lessons()
            ->with('sermon')
            ->whereNull('sermon_id')
            ->latest()
            ->get();

        $sermons = $user->sermons()
            ->with('lessons')
            ->latest()
            ->get();

        $highlights = $user->highlights()
            ->with('verse.chapter.book')
            ->latest()
            ->get()
            ->map(fn($h) => [
                'id' => $h->id,
                'verse_id' => $h->verse_id,
                'color' => $h->color,
                'note' => $h->note,
                'reference' => $h->verse ? $this->formatReference($h->verse) : 'Unknown',
                'text' => $h->verse?->text ?? '',
                'type' => 'highlight',
            ]);

        $favorites = $user->favorites()
            ->with('verse.chapter.book')
            ->latest()
            ->get()
            ->map(fn($f) => [
                'id' => $f->id,
                'verse_id' => $f->verse_id,
                'note' => $f->note,
                'reference' => $f->verse ? $this->formatReference($f->verse) : 'Unknown',
                'text' => $f->verse?->text ?? '',
                'type' => 'favorite',
            ]);

        return Inertia::render('Lessons/Index', [
            'lessons' => $lessons,
            'sermons' => $sermons,
            'highlights' => $highlights,
            'favorites' => $favorites,
        ]);
    }

    protected function formatReference($verse): string
    {
        $book = $verse->chapter->book->name ?? 'Unknown';
        $chapter = $verse->chapter->number ?? '?';
        $verseNum = $verse->number ?? '?';
        return "{$book} {$chapter}:{$verseNum}";
    }

    public function show(Lesson $lesson)
    {
        Gate::authorize('view', $lesson);

        $lesson->load(['sermon', 'user']);

        return Inertia::render('Lessons/Show', [
            'lesson' => $lesson,
        ]);
    }

    public function generate(Request $request)
    {
        $request->validate([
            'theme' => 'nullable|string|max:100',
            'highlight_ids' => 'nullable|array',
            'highlight_ids.*' => 'exists:highlights,id',
            'favorite_ids' => 'nullable|array',
            'favorite_ids.*' => 'exists:favorites,id',
            'sermon_id' => 'nullable|exists:sermons,id',
        ]);

        $user = Auth::user();

        if (!$user->hasProAccess()) {
            return back()->with('error', 'Pro plan required to generate AI lessons.');
        }

        if ($request->sermon_id) {
            $sermon = $user->sermons()->findOrFail($request->sermon_id);
            Gate::authorize('update', $sermon);
        }

        try {
            $lesson = $this->lessonGenerator->generateLesson($user, [
                'theme' => $request->theme,
                'highlight_ids' => $request->highlight_ids ?? [],
                'favorite_ids' => $request->favorite_ids ?? [],
                'sermon_id' => $request->sermon_id,
            ]);

            return back()->with('success', 'Lesson generated successfully!');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    public function destroy(Lesson $lesson)
    {
        Gate::authorize('delete', $lesson);

        $lesson->delete();

        return back()->with('success', 'Lesson deleted.');
    }
}
