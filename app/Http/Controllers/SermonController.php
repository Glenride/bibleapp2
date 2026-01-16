<?php

namespace App\Http\Controllers;

use App\Models\Sermon;
use App\Models\User;
use App\Services\LessonGeneratorService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;

class SermonController extends Controller
{
    public function __construct(
        protected LessonGeneratorService $lessonGenerator
    ) {}

    public function show(Sermon $sermon)
    {
        Gate::authorize('view', $sermon);

        $sermon->load(['lessons', 'user']);

        $availableLessons = [];
        if (Auth::id() === $sermon->user_id) {
            $availableLessons = Auth::user()->lessons()
                ->whereNull('sermon_id')
                ->latest()
                ->get();
        }

        return Inertia::render('Sermons/Show', [
            'sermon' => $sermon,
            'isOwner' => Auth::id() === $sermon->user_id,
            'availableLessons' => $availableLessons,
        ]);
    }

    public function generate(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'lesson_count' => 'nullable|integer|min:1|max:10',
            'themes' => 'nullable|array',
            'themes.*' => 'string|max:100',
        ]);

        $user = Auth::user();

        try {
            $sermon = $this->lessonGenerator->generateSermon($user, $request->title, [
                'description' => $request->description,
                'lesson_count' => $request->lesson_count ?? 3,
                'themes' => $request->themes ?? [],
            ]);

            return redirect()->route('sermons.show', $sermon)
                ->with('success', 'Bible study sermon generated!');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    public function update(Request $request, Sermon $sermon)
    {
        Gate::authorize('update', $sermon);

        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'is_public' => 'nullable|boolean',
        ]);

        $sermon->update($request->only(['title', 'description', 'is_public']));

        return back()->with('success', 'Sermon updated.');
    }

    public function destroy(Sermon $sermon)
    {
        Gate::authorize('delete', $sermon);

        $sermon->delete();

        return redirect()->route('lessons.index')->with('success', 'Sermon deleted.');
    }

    public function shared(string $token)
    {
        $sermon = Sermon::where('share_token', $token)
            ->with(['lessons', 'user'])
            ->firstOrFail();

        if (!$sermon->is_public && Auth::guest()) {
            return redirect()->route('login')->with('message', 'Please login to view this shared sermon.');
        }

        if (!$sermon->is_public) {
            $user = Auth::user();
            $hasAccess = $sermon->user_id === $user->id ||
                $sermon->sharedWith->contains('id', $user->id);

            if (!$hasAccess) {
                abort(403, 'You do not have access to this sermon.');
            }
        }

        return Inertia::render('Sermons/Shared', [
            'sermon' => $sermon,
            'isOwner' => Auth::check() && Auth::id() === $sermon->user_id,
        ]);
    }

    public function share(Request $request, Sermon $sermon)
    {
        Gate::authorize('update', $sermon);

        $request->validate([
            'email' => 'required|email|exists:users,email',
        ]);

        $targetUser = User::where('email', $request->email)->first();

        if ($targetUser->id === Auth::id()) {
            return back()->withErrors(['email' => 'You cannot share with yourself.']);
        }

        if ($sermon->sharedWith->contains('id', $targetUser->id)) {
            return back()->withErrors(['email' => 'Already shared with this user.']);
        }

        $sermon->sharedWith()->attach($targetUser->id, [
            'shared_by_user_id' => Auth::id(),
        ]);

        return back()->with('success', "Sermon shared with {$targetUser->name}!");
    }

    public function togglePublic(Sermon $sermon)
    {
        Gate::authorize('update', $sermon);

        $sermon->update(['is_public' => !$sermon->is_public]);

        $status = $sermon->is_public ? 'public' : 'private';
        return back()->with('success', "Sermon is now {$status}.");
    }

    public function sharedWithMe()
    {
        $user = Auth::user();

        $sermons = $user->sharedSermons()
            ->with(['lessons', 'user'])
            ->latest()
            ->get();

        return Inertia::render('Sermons/SharedWithMe', [
            'sermons' => $sermons,
        ]);
    }

    public function createFromLessons(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'lesson_ids' => 'required|array|min:1',
            'lesson_ids.*' => 'exists:lessons,id',
        ]);

        $user = Auth::user();

        $lessons = $user->lessons()
            ->whereIn('id', $request->lesson_ids)
            ->whereNull('sermon_id')
            ->get();

        if ($lessons->count() !== count($request->lesson_ids)) {
            return back()->withErrors(['error' => 'Some lessons are not available or already belong to a sermon.']);
        }

        $sermon = $user->sermons()->create([
            'title' => $request->title,
            'description' => $request->description,
        ]);

        foreach ($lessons as $index => $lesson) {
            $lesson->update([
                'sermon_id' => $sermon->id,
                'position' => $index,
            ]);
        }

        // Generate analysis
        try {
            $analysis = $this->lessonGenerator->generateSermonAnalysis($sermon);
            $sermon->update([
                'detected_theme' => $analysis['detected_theme'] ?? null,
                'analysis' => $analysis['analysis'] ?? null,
            ]);
        } catch (\Exception $e) {
            // Silently fail analysis generation so we don't block sermon creation
            // Log::error('Sermon analysis failed: ' . $e->getMessage());
        }

        return redirect()->route('sermons.show', $sermon)
            ->with('success', 'Sermon created and analyzed!');
    }

    public function addLesson(Request $request, Sermon $sermon)
    {
        Gate::authorize('update', $sermon);

        $request->validate([
            'lesson_id' => 'required|exists:lessons,id',
        ]);

        $user = Auth::user();
        $lesson = $user->lessons()
            ->where('id', $request->lesson_id)
            ->whereNull('sermon_id')
            ->first();

        if (!$lesson) {
            return back()->withErrors(['error' => 'Lesson not available or already belongs to a sermon.']);
        }

        $position = $sermon->lessons()->count();
        $lesson->update([
            'sermon_id' => $sermon->id,
            'position' => $position,
        ]);

        $sermon->load('lessons');
        try {
            $analysis = $this->lessonGenerator->generateSermonAnalysis($sermon);
            $sermon->update([
                'detected_theme' => $analysis['detected_theme'] ?? null,
                'analysis' => $analysis['analysis'] ?? null,
            ]);
        } catch (\Exception $e) {
            // Log::error("Failed to update sermon analysis: " . $e->getMessage());
        }

        return back()->with('success', 'Lesson added to sermon!');
    }

    public function removeLesson(Request $request, Sermon $sermon)
    {
        Gate::authorize('update', $sermon);

        $request->validate([
            'lesson_id' => 'required|exists:lessons,id',
        ]);

        $lesson = $sermon->lessons()->where('id', $request->lesson_id)->first();

        if (!$lesson) {
            return back()->withErrors(['error' => 'Lesson not found in this sermon.']);
        }

        $lesson->update([
            'sermon_id' => null,
            'position' => 0,
        ]);

        $sermon->lessons()->where('position', '>', $lesson->position)
            ->decrement('position');

        $sermon->load('lessons');
        try {
            $analysis = $this->lessonGenerator->generateSermonAnalysis($sermon);
            $sermon->update([
                'detected_theme' => $analysis['detected_theme'] ?? null,
                'analysis' => $analysis['analysis'] ?? null,
            ]);
        } catch (\Exception $e) {
            // Log::error("Failed to update sermon analysis: " . $e->getMessage());
        }

        return back()->with('success', 'Lesson removed from sermon.');
    }
}
