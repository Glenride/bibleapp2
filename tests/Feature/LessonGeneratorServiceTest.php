<?php

namespace Tests\Feature;

use App\Models\Highlight;
use App\Models\User;
use App\Models\Verse;
use App\Services\LessonGeneratorService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use OpenAI\Laravel\Facades\OpenAI;
use OpenAI\Responses\Chat\CreateResponse;
use Tests\TestCase;

class LessonGeneratorServiceTest extends TestCase
{
    use RefreshDatabase;

    public function test_generate_lesson_uses_gpt_5_2_and_persists_content(): void
    {
        $user = User::factory()->create();
        $verse = Verse::factory()->create();
        $highlight = Highlight::create([
            'user_id' => $user->id,
            'verse_id' => $verse->id,
            'color' => 'yellow',
            'note' => 'Test note',
        ]);

        $lessonPayload = [
            'title' => 'Walking in Steadfast Faith',
            'detected_theme' => 'Steadfast Faith',
            'content' => '## Proposition\nGod strengthens His people to remain faithful.',
        ];

        OpenAI::fake([
            CreateResponse::fake([
                'choices' => [
                    [
                        'message' => [
                            'content' => json_encode($lessonPayload),
                        ],
                    ],
                ],
            ]),
        ]);

        $service = app(LessonGeneratorService::class);
        $lesson = $service->generateLesson($user, [
            'highlight_ids' => [$highlight->id],
            'favorite_ids' => [],
        ]);

        $this->assertDatabaseHas('lessons', [
            'id' => $lesson->id,
            'user_id' => $user->id,
            'title' => $lessonPayload['title'],
        ]);

        OpenAI::chat()->assertSent(function (string $method, array $params): bool {
            return $method === 'create'
                && ($params['model'] ?? null) === 'gpt-5.2'
                && ($params['max_completion_tokens'] ?? null) === 2000;
        });
    }

    public function test_generate_sermon_creates_long_form_analysis(): void
    {
        $user = User::factory()->create();
        $verse = Verse::factory()->create();
        Highlight::create([
            'user_id' => $user->id,
            'verse_id' => $verse->id,
            'color' => 'yellow',
            'note' => 'Test note',
        ]);

        $lessonPayload = [
            'title' => 'Enduring Hope',
            'detected_theme' => 'Hope',
            'content' => '## Proposition\nHope anchors the soul in God.',
        ];

        $analysisPayload = [
            'detected_theme' => 'Hope Anchored in Christ',
            'analysis' => '## Introduction\nA long-form sermon that guides the reader toward hope.',
        ];

        OpenAI::fake([
            CreateResponse::fake([
                'choices' => [
                    [
                        'message' => [
                            'content' => json_encode($lessonPayload),
                        ],
                    ],
                ],
            ]),
            CreateResponse::fake([
                'choices' => [
                    [
                        'message' => [
                            'content' => json_encode($analysisPayload),
                        ],
                    ],
                ],
            ]),
        ]);

        $service = app(LessonGeneratorService::class);
        $sermon = $service->generateSermon($user, 'Hope That Holds', [
            'description' => 'A sermon about enduring hope.',
            'lesson_count' => 1,
            'themes' => ['Hope'],
        ]);

        $sermon->refresh();

        $this->assertSame($analysisPayload['analysis'], $sermon->analysis);
        $this->assertSame($analysisPayload['detected_theme'], $sermon->detected_theme);

        OpenAI::chat()->assertSent(2);
        OpenAI::chat()->assertSent(function (string $method, array $params): bool {
            return $method === 'create'
                && ($params['model'] ?? null) === 'gpt-5.2'
                && ($params['max_completion_tokens'] ?? null) === 3000;
        });
    }
}
