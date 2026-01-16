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
            ? "Focus the lesson around this theme: {$theme}"
            : "Identify a central theme that connects these verses";

        return <<<PROMPT
You are a thoughtful Bible study teacher creating a personalized lesson based on verses that a reader has highlighted and favorited. These verses represent what resonates with them spiritually.

{$themeInstruction}

VERSES THE READER HAS MARKED:
{$versesContext}

Create a Bible study lesson with:
1. A compelling title (5-10 words)
2. An introduction connecting the verses to daily life
3. 2-3 key insights drawn from these specific verses
4. Reflection questions for personal growth
5. A practical application section
6. A closing prayer or meditation

Format your response as JSON with this structure:
{
  "title": "Lesson title here",
  "detected_theme": "The main theme you identified",
  "content": "The full lesson content in markdown format"
}

Make the lesson personal, warm, and spiritually nourishing. Reference the specific verses throughout.
PROMPT;
    }

    protected function callOpenAI(string $prompt): array
    {
        $response = OpenAI::chat()->create([
            'model' => 'gpt-4o',
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
            'model' => 'gpt-4o',
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
You are a wise theologian and pastor. I need you to analyze a series of Bible study lessons that form a complete sermon series.
Your goal is to identify the overarching prophetic or spiritual theme that connects all these lessons and write a culminating analysis.

SERMON TITLE: {$sermon->title}
SERMON DESCRIPTION: {$sermon->description}

LESSONS IN THIS SERIES:
{$lessonsContext}

Please provide:
1. An overarching "Detected Theme" (3-5 words) that unifies all these lessons.
2. A "Spiritual Analysis" (approx. 200-300 words). This should read like a powerful conclusion to the sermon series, summarizing the journey the student has taken through these lessons and offering a final, life-changing takeaway. It should feel like the "alter call" or the moment of realization.

Format your response as JSON:
{
  "detected_theme": "The unifying theme",
  "analysis": "The spiritual analysis text..."
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
