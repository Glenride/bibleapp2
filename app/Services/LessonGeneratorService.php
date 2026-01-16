<?php

namespace App\Services;

use App\Models\User;
use App\Models\Lesson;
use App\Models\Sermon;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;
use OpenAI\Laravel\Facades\OpenAI;

class LessonGeneratorService
{
    public function generateLesson(User $user, array $options = []): Lesson
    {
        $theme = $options['theme'] ?? null;
        $highlightIds = $options['highlight_ids'] ?? [];
        $favoriteIds = $options['favorite_ids'] ?? [];
        $sermonId = $options['sermon_id'] ?? null;

        $highlights = $user->highlights()
            ->with('verse.chapter.book')
            ->when(!empty($highlightIds), fn($q) => $q->whereIn('id', $highlightIds))
            ->get();

        $favorites = $user->favorites()
            ->with('verse.chapter.book')
            ->when(!empty($favoriteIds), fn($q) => $q->whereIn('id', $favoriteIds))
            ->get();

        $versesContext = $this->buildVersesContext($highlights, $favorites);

        if (empty($versesContext)) {
            throw new \Exception('No highlights or favorites found to generate a lesson from.');
        }

        $prompt = $this->buildPrompt($versesContext, $theme);
        $response = $this->callOpenAI($prompt);

        $lesson = $user->lessons()->create([
            'sermon_id' => $sermonId,
            'title' => $response['title'],
            'content' => $response['content'],
            'source_verses' => $this->extractVerseIds($highlights, $favorites),
            'source_highlights' => $highlights->pluck('id')->toArray(),
            'source_favorites' => $favorites->pluck('id')->toArray(),
            'theme' => $theme ?? $response['detected_theme'],
            'position' => $sermonId ? Lesson::where('sermon_id', $sermonId)->count() : 0,
        ]);

        return $lesson;
    }

    public function generateSermon(User $user, string $title, array $options = []): Sermon
    {
        $description = $options['description'] ?? null;
        $lessonCount = $options['lesson_count'] ?? 3;
        $themes = $options['themes'] ?? [];

        $sermon = $user->sermons()->create([
            'title' => $title,
            'description' => $description,
        ]);

        $highlights = $user->highlights()->with('verse.chapter.book')->get();
        $favorites = $user->favorites()->with('verse.chapter.book')->get();

        if ($highlights->isEmpty() && $favorites->isEmpty()) {
            throw new \Exception('No highlights or favorites found to generate lessons from.');
        }

        if (empty($themes)) {
            $themes = $this->detectThemes($highlights, $favorites, $lessonCount);
        }

        foreach ($themes as $index => $theme) {
            $this->generateLesson($user, [
                'theme' => $theme,
                'sermon_id' => $sermon->id,
            ]);
        }

        return $sermon->load('lessons');
    }

    protected function buildVersesContext(Collection $highlights, Collection $favorites): string
    {
        $verses = collect();

        foreach ($highlights as $highlight) {
            if ($highlight->verse) {
                $verses->push([
                    'reference' => $this->formatReference($highlight->verse),
                    'text' => $highlight->verse->text,
                    'note' => $highlight->note,
                    'type' => 'highlight',
                    'color' => $highlight->color,
                ]);
            }
        }

        foreach ($favorites as $favorite) {
            if ($favorite->verse && !$verses->contains('reference', $this->formatReference($favorite->verse))) {
                $verses->push([
                    'reference' => $this->formatReference($favorite->verse),
                    'text' => $favorite->verse->text,
                    'note' => $favorite->note,
                    'type' => 'favorite',
                ]);
            }
        }

        return $verses->map(function ($verse) {
            $context = "{$verse['reference']}: \"{$verse['text']}\"";
            if (!empty($verse['note'])) {
                $context .= " (User's note: {$verse['note']})";
            }
            return $context;
        })->implode("\n\n");
    }

    protected function formatReference($verse): string
    {
        $book = $verse->chapter->book->name ?? 'Unknown';
        $chapter = $verse->chapter->number ?? '?';
        $verseNum = $verse->number ?? '?';
        return "{$book} {$chapter}:{$verseNum}";
    }

    protected function buildPrompt(string $versesContext, ?string $theme): string
    {
        $themeInstruction = $theme
            ? "Your sermon design must be centered around this specific proposition/theme: {$theme}"
            : "Derive a single, clear proposition from these verses that will serve as the main theme";

        return <<<PROMPT
You are a scholarly expository preacher and Bible study teacher, deeply knowledgeable in homiletics as described by Kenneth R. Lewis. You are designing a lesson based on specific verses a user has highlighted.

OBJECTIVE:
Create a structured expository lesson that strictly follows the homiletical design principles of "Sermon Design and Structure".

INPUT CONTEXT:
{$themeInstruction}

VERSES THE READER HAS MARKED:
{$versesContext}

REQUIRED LESSON STRUCTURE:
1.  **Proposition**: A single, clear sentence that states the timeless truth of the lesson (the "big idea").
2.  **Introduction**:
    *   Arrest attention.
    *   Introduce the subject and the text.
    *   Make a smooth transition to the main points.
3.  **Main Points** (Provide 2-3 distinct points derived directly from the text):
    *   For *each* main point, you MUST include:
        *   **Explanation**: Clarify the meaning of the text (What does it say?).
        *   **Application**: Implications for the hearer (What does it say to us/me?).
        *   **Illustration**: A tangible image or story to clarify the truth (What is it like?).
4.  **Conclusion**:
    *   Summarize the main argument.
    *   Final exhortation or call to action.
    *   Closing prayer.

Format your response as JSON with this exact structure:
{
  "title": "A compelling, brief title (5-10 words)",
  "detected_theme": "The proposition/theme used",
  "content": "The full lesson content in rigorous markdown format, using headers (##, ###) for the sections described above. Ensure the distinctions between Explanation, Application, and Illustration are clear within each point."
}

Make the tone spirutuallly nourishing but intellectually rigorous and structured.
PROMPT;
    }

    protected function callOpenAI(string $prompt): array
    {
        $response = OpenAI::chat()->create([
            'model' => 'gpt-5-mini',
            'messages' => [
                ['role' => 'system', 'content' => 'You are a thoughtful Bible study teacher. Always respond with valid JSON.'],
                ['role' => 'user', 'content' => $prompt],
            ],
            'temperature' => 0.7,
            'max_tokens' => 2000,
        ]);

        $content = $response->choices[0]->message->content;
        
        $jsonStart = strpos($content, '{');
        $jsonEnd = strrpos($content, '}');
        if ($jsonStart !== false && $jsonEnd !== false) {
            $content = substr($content, $jsonStart, $jsonEnd - $jsonStart + 1);
        }

        $decoded = json_decode($content, true);
        
        if (json_last_error() !== JSON_ERROR_NONE) {
            return [
                'title' => 'Untitled Lesson',
                'detected_theme' => 'General',
                'content' => $content,
            ];
        }

        return $decoded;
    }

    protected function detectThemes(Collection $highlights, Collection $favorites, int $count): array
    {
        $versesContext = $this->buildVersesContext($highlights, $favorites);

        $prompt = <<<PROMPT
Analyze these Bible verses that a reader has highlighted and favorited, and identify {$count} distinct themes that could each become a separate Bible study lesson.

VERSES:
{$versesContext}

Return a JSON array of {$count} theme strings, each being 2-4 words describing a lesson theme.
Example: ["God's Faithfulness", "Finding Peace", "Living with Purpose"]
PROMPT;

        $response = OpenAI::chat()->create([
            'model' => 'gpt-5-mini',
            'messages' => [
                ['role' => 'system', 'content' => 'You analyze Bible verses and identify themes. Respond only with a JSON array.'],
                ['role' => 'user', 'content' => $prompt],
            ],
            'temperature' => 0.7,
            'max_tokens' => 200,
        ]);

        $content = $response->choices[0]->message->content;
        $decoded = json_decode($content, true);

        if (!is_array($decoded)) {
            return array_fill(0, $count, 'Faith and Life');
        }

        return array_slice($decoded, 0, $count);
    }

    public function generateSermonAnalysis(Sermon $sermon): array
    {
        $sermon->load('lessons');
        $lessonsContext = $sermon->lessons->map(function ($lesson) {
            return "LESSON: {$lesson->title}\nTHEME: {$lesson->theme}\nCONTENT SUMMARY: " . Str::limit($lesson->content, 500);
        })->implode("\n\n");

        $prompt = <<<PROMPT
You are a scholarly expository preacher and theologian. You have a series of Bible study lessons that form a coherent sermon series.
Your task is to synthesize these lessons into a single, comprehensive "Master Sermon" document that follows the homiletical structure of "Sermon Design and Structure".

SERMON TITLE: {$sermon->title}
SERMON DESCRIPTION: {$sermon->description}

LESSONS (to be used as main points):
{$lessonsContext}

REQUIRED MASTER SERMON STRUCTURE:
1.  **Proposition**: A unifying theme or "big idea" that ties all the lessons together into one message.
2.  **Introduction**:
    *   Introduce the series theme.
    *   Provide context for the journey through these lessons.
3.  **Main Points (The Lessons)**:
    *   Treat each Lesson as a major movement or Main Point in this master sermon.
    *   For each point (Lesson), provide a **Synthesized Explanation** and **Application** that connects it back to the main Proposition.
    *   Do not just copy the lesson content; summarize its spiritual essence and how it fits the whole.
4.  **Conclusion**:
    *   A powerful culpritinating analysis.
    *   Final "Altar Call" or life-changing takeaway.

Format your response as JSON:
{
  "detected_theme": "The unifying proposition",
  "analysis": "The full Master Sermon content in valid markdown. Use H2 for sections (Introduction, Main Points, Conclusion) and H3 for the individual Lesson points."
}
PROMPT;

        $response = $this->callOpenAI($prompt);

        if (isset($response['detected_theme']) && isset($response['analysis'])) {
            return $response;
        }

        return [
            'detected_theme' => $sermon->title,
            'analysis' => 'Unable to generate analysis at this time.',
        ];
    }

    protected function extractVerseIds(Collection $highlights, Collection $favorites): array
    {
        return $highlights->pluck('verse_id')
            ->merge($favorites->pluck('verse_id'))
            ->unique()
            ->values()
            ->toArray();
    }
}
