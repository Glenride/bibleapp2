<?php

namespace Tests\Feature;

use App\Models\Highlight;
use App\Models\Sermon;
use App\Models\User;
use App\Models\Verse;
use App\Services\LessonGeneratorService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Cashier\Subscription;
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

    public function test_basic_plan_cannot_generate_lessons(): void
    {
        $user = User::factory()->create();
        Subscription::factory()->state([
            'user_id' => $user->id,
            'type' => 'default',
            'stripe_price' => User::BASIC_PLAN_PRICE_ID,
        ])->create();

        $response = $this->actingAs($user)
            ->from(route('lessons.index'))
            ->post(route('lessons.generate'), [
                'theme' => 'Faith',
            ]);

        $response->assertRedirect(route('lessons.index'));
        $response->assertSessionHas('error', 'Pro plan required to generate AI lessons.');
    }

    public function test_pro_plan_can_generate_lessons(): void
    {
        $user = User::factory()->create();
        Subscription::factory()->state([
            'user_id' => $user->id,
            'type' => 'default',
            'stripe_price' => User::PRO_PLAN_PRICE_ID,
        ])->create();

        $verse = Verse::factory()->create();
        $highlight = Highlight::create([
            'user_id' => $user->id,
            'verse_id' => $verse->id,
            'color' => 'yellow',
            'note' => 'Test note',
        ]);

        $lessonPayload = [
            'title' => 'Faith That Endures',
            'detected_theme' => 'Faith',
            'content' => '## Proposition\nGod strengthens believers to endure.',
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

        $response = $this->actingAs($user)
            ->from(route('lessons.index'))
            ->post(route('lessons.generate'), [
                'theme' => 'Faith',
                'highlight_ids' => [$highlight->id],
                'favorite_ids' => [],
            ]);

        $response->assertRedirect(route('lessons.index'));
        $response->assertSessionHas('success', 'Lesson generated successfully!');

        $this->assertDatabaseHas('lessons', [
            'user_id' => $user->id,
            'title' => $lessonPayload['title'],
        ]);
    }

    public function test_basic_plan_cannot_generate_sermons(): void
    {
        $user = User::factory()->create();
        Subscription::factory()->state([
            'user_id' => $user->id,
            'type' => 'default',
            'stripe_price' => User::BASIC_PLAN_PRICE_ID,
        ])->create();

        $response = $this->actingAs($user)
            ->from(route('lessons.index'))
            ->post(route('sermons.generate'), [
                'title' => 'Hope That Holds',
                'description' => 'A sermon about enduring hope.',
                'lesson_count' => 1,
                'themes' => ['Hope'],
            ]);

        $response->assertRedirect(route('lessons.index'));
        $response->assertSessionHas('error', 'Pro plan required to generate AI sermons.');
    }

    public function test_pro_plan_can_generate_sermons(): void
    {
        $user = User::factory()->create();
        Subscription::factory()->state([
            'user_id' => $user->id,
            'type' => 'default',
            'stripe_price' => User::PRO_PLAN_PRICE_ID,
        ])->create();

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

        $response = $this->actingAs($user)
            ->from(route('lessons.index'))
            ->post(route('sermons.generate'), [
                'title' => 'Hope That Holds',
                'description' => 'A sermon about enduring hope.',
                'lesson_count' => 1,
                'themes' => ['Hope'],
            ]);

        $sermon = Sermon::where('user_id', $user->id)->first();

        $response->assertRedirect(route('sermons.show', $sermon));
        $response->assertSessionHas('success', 'Bible study sermon generated!');

        $this->assertDatabaseHas('sermons', [
            'user_id' => $user->id,
            'title' => 'Hope That Holds',
        ]);

        $this->assertDatabaseHas('lessons', [
            'user_id' => $user->id,
            'title' => $lessonPayload['title'],
        ]);
    }
}
