<?php

namespace Database\Factories;

use App\Models\BibleVersion;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Book>
 */
class BookFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'bible_version_id' => BibleVersion::factory(),
            'name' => $this->faker->word(),
            'abbreviation' => $this->faker->unique()->lexify('???'),
            'position' => $this->faker->numberBetween(1, 66),
        ];
    }
}
