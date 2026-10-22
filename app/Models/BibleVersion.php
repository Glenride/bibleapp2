<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Models\Book;

class BibleVersion extends Model
{
    use HasFactory;

    //
    protected $guarded = [];

    /**
     * Public URL slug => dataset abbreviation for the translations we serve.
     * Keep in sync with the allowlist in BibleSeeder::ALLOWED_VERSIONS.
     */
    public const VERSION_SLUGS = [
        'kjv' => 'en_kjv',
        'bbe' => 'en_bbe',
    ];

    /** Short display labels for the URL slugs above. */
    public const VERSION_LABELS = [
        'kjv' => 'KJV',
        'bbe' => 'BBE',
    ];

    /**
     * Resolve a URL slug (e.g. 'bbe') to its imported BibleVersion row,
     * or null when the slug is unknown or the version isn't imported.
     */
    public static function resolveSlug(?string $slug): ?self
    {
        $normalizedSlug = strtolower((string) $slug);
        $abbreviation = self::VERSION_SLUGS[$normalizedSlug] ?? null;

        if (! $abbreviation) {
            return null;
        }

        return static::where('abbreviation', $abbreviation)->first()
            ?? static::where('abbreviation', strtoupper($normalizedSlug))->first()
            ?? static::where('abbreviation', $normalizedSlug)->first();
    }

    /**
     * Version list for switchers: slug, short label, full name.
     * Only versions actually imported into the database are included.
     *
     * @return array<int, array{slug: string, label: string, name: string}>
     */
    public static function availableForSwitcher(): array
    {
        $imported = static::all();

        $list = [];
        foreach (self::VERSION_SLUGS as $slug => $abbreviation) {
            $row = $imported->first(function ($v) use ($slug, $abbreviation) {
                return in_array($v->abbreviation, [$abbreviation, strtoupper($slug), $slug], true);
            });

            if ($row) {
                $list[] = [
                    'slug' => $slug,
                    'label' => self::VERSION_LABELS[$slug] ?? strtoupper($slug),
                    'name' => $row->name,
                ];
            }
        }

        return $list;
    }

    public function books()
    {
        return $this->hasMany(Book::class);
    }
}
