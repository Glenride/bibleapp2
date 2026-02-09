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
        $response = $this->callOpenAI($prompt, 2000, true);

        // Build backward-compatible content from structured fields
        $content = $this->buildContentFromStructured($response);

        $lesson = $user->lessons()->create([
            'sermon_id' => $sermonId,
            'title' => $response['title'],
            'content' => $content,
            'big_takeaway' => $response['big_takeaway'] ?? null,
            'movements' => $response['movements'] ?? null,
            'reflection_questions' => $response['reflection_questions'] ?? null,
            'prayer' => $response['prayer'] ?? null,
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
        $sermon->load('lessons');
        try {
            $analysis = $this->generateSermonAnalysis($sermon);
            $sermon->update([
                'detected_theme' => $analysis['detected_theme'] ?? null,
                'analysis' => $analysis['analysis'] ?? null,
            ]);
        } catch (
            \Exception $e
        ) {
            // Silently fail analysis generation so we don't block sermon creation
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
            ? "Create a lesson centered around this unifying claim: {$theme}"
            : "(If context is missing, derive a single, clear unifying claim from the verses.)";

        return <<<PROMPT
You are a scholarly expository preacher and Bible study teacher, deeply knowledgeable in homiletics as described by Kenneth R. Lewis. Create an expository Bible study lesson that is faithful to the text, clear to a modern reader, and optimized for learning and application.

LENGTH: 700–800 words total across all fields.

INPUT CONTEXT:
{$themeInstruction}

VERSES THE READER HAS MARKED:
{$versesContext}

WRITING RULES (for better user interaction and learning):
- Do NOT use obvious outline labels like: Proposition, Introduction, Main Point, Point 1, Transition, Conclusion.
- Write as a guided learning flow with natural phrases.
- Keep each movement 2–4 short paragraphs.

OUTPUT FORMAT:
Return valid JSON with exactly this structure:
{
  "title": "A compelling, brief title (5-10 words)",
  "detected_theme": "The main theme in 2-4 words",
  "big_takeaway": "One clear sentence summarizing the lesson's core truth",
  "movements": [
    {
      "focus": "Short phrase describing this movement's focus",
      "teaching": "2-4 paragraphs: what the text says/means, how to live it, with a brief story or analogy woven in",
      "practice": "One concrete action step for this movement"
    },
    {
      "focus": "...",
      "teaching": "...",
      "practice": "..."
    },
    {
      "focus": "...",
      "teaching": "...",
      "practice": "..."
    }
  ],
  "reflection_questions": ["Question 1?", "Question 2?"],
  "prayer": "A short closing prayer (4-6 lines)"
}

CONTENT RULES:
- The "teaching" field should naturally include explanation, application, and illustration without labeling them.
- Include smooth bridging ideas between movements within the teaching text.
- Use plain text with light formatting only (short paragraphs).
- Do not include markdown headings.
PROMPT;
    }

    protected function callOpenAI(string $prompt, int $maxCompletionTokens = 2000, bool $validateContent = false): array
    {
        $systemMessage = 'You are a thoughtful Bible study teacher and expository preacher. You design lessons for learning and retention: clear, warm, accurate to the text, and practical. Write in a way that sounds like a guided lesson, not a formal outline. Always return valid JSON only (no markdown outside JSON). Do not use obvious outline headers such as "Proposition," "Introduction," "Main Point," "Transition," or "Conclusion."';

        $response = OpenAI::chat()->create([
            'model' => 'gpt-5.2',
            'messages' => [
                ['role' => 'system', 'content' => $systemMessage],
                ['role' => 'user', 'content' => $prompt],
            ],
            'max_completion_tokens' => $maxCompletionTokens,
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

        // Validate lesson content only when explicitly requested
        if ($validateContent) {
            // Check for structured fields OR legacy content field
            $hasStructuredContent = !empty($decoded['big_takeaway']) || !empty($decoded['movements']);
            $hasLegacyContent = !empty($decoded['content']) && trim($decoded['content']) !== '';
            
            if (!$hasStructuredContent && !$hasLegacyContent) {
                throw new \Exception('AI generated an empty lesson. Please try again.');
            }

            // Ensure title has a meaningful value
            if (empty($decoded['title']) || trim($decoded['title']) === '') {
                $decoded['title'] = 'Bible Study Lesson';
            }
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
            'model' => 'gpt-5.2',
            'messages' => [
                ['role' => 'system', 'content' => 'You analyze Bible verses and identify themes. Respond only with a JSON array.'],
                ['role' => 'user', 'content' => $prompt],
            ],
            'max_completion_tokens' => 200,
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
You have a series of Bible study lessons that form a coherent sermon series. Synthesize them into a single comprehensive Master Sermon that feels unified, pastoral, and easy to follow.

LENGTH: At least 1000 words.

SERMON TITLE: {$sermon->title}
SERMON DESCRIPTION: {$sermon->description}

LESSONS (use these as the core teaching movements, in order):
{$lessonsContext}

UNIFYING TASK:
- Identify one clear unifying theme that ties all lessons together and state it near the beginning as a single sentence (not labeled "proposition").

STRUCTURE & STYLE (optimize for listening + learning):
- Do NOT use obvious outline headers such as: Introduction, Main Point, Point 1, Transition, Conclusion.
- Use subtle, natural section phrases (short lines that sound like a preacher guiding listeners).
- Each movement should include:
  - What we're seeing in the text/idea
  - Why it matters
  - A concrete example or illustration
  - A practical next step
- Include smooth "bridge" sentences that show how one movement leads to the next.
- End with:
  - A direct call-to-action
  - 3 reflection questions
  - A closing prayer (6–10 lines)

OUTPUT FORMAT:
Return valid JSON with exactly this structure:
{
  "detected_theme": "...",
  "analysis": "..."
}

FORMATTING inside the JSON "analysis" field:
- Write in clean markdown, but avoid markdown headings (# / ## / ###).
- You may use short breaks, italics, and bullet lists sparingly for readability.
PROMPT;
        $response = $this->callOpenAI($prompt, 3000);

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

    /**
     * Build backward-compatible content string from structured response.
     */
    protected function buildContentFromStructured(array $response): string
    {
        $parts = [];

        // Big takeaway
        if (!empty($response['big_takeaway'])) {
            $parts[] = "**" . $response['big_takeaway'] . "**";
        }

        // Movements
        if (!empty($response['movements']) && is_array($response['movements'])) {
            foreach ($response['movements'] as $i => $movement) {
                $parts[] = "";
                if (!empty($movement['focus'])) {
                    $parts[] = "**" . $movement['focus'] . "**";
                }
                if (!empty($movement['teaching'])) {
                    $parts[] = $movement['teaching'];
                }
                if (!empty($movement['practice'])) {
                    $parts[] = "• " . $movement['practice'];
                }
            }
        }

        // Reflection questions
        if (!empty($response['reflection_questions']) && is_array($response['reflection_questions'])) {
            $parts[] = "";
            $parts[] = "**Reflect on these questions:**";
            foreach ($response['reflection_questions'] as $q) {
                $parts[] = "• " . $q;
            }
        }

        // Prayer
        if (!empty($response['prayer'])) {
            $parts[] = "";
            $parts[] = "*" . $response['prayer'] . "*";
        }

        // Fallback to content field if structured fields are empty
        if (empty($parts) && !empty($response['content'])) {
            return $response['content'];
        }

        return implode("\n\n", array_filter($parts));
    }
}
