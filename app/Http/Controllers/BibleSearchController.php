<?php

namespace App\Http\Controllers;

use App\Models\BibleVersion;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;

class BibleSearchController extends Controller
{
    /**
     * Full-text search over verses. Strategy is picked by database driver:
     * sqlite uses the FTS5 verses_fts table (with a LIKE fallback when the
     * index is missing or empty), mysql uses a FULLTEXT index, pgsql uses
     * tsvector at query time, anything else falls back to LIKE.
     */
    public function search(Request $request)
    {
        $query = trim((string) $request->query('q', ''));
        $versionSlug = strtolower((string) $request->query('version', 'kjv'));

        // Unknown slugs fall back to the default version rather than 404ing:
        // search pages are noindexed utility pages, not canonical content.
        $version = BibleVersion::resolveSlug($versionSlug);

        if (! $version) {
            $versionSlug = 'kjv';
            $version = BibleVersion::resolveSlug($versionSlug);
        }

        $results = [];

        if (mb_strlen($query) >= 2 && $version) {
            $results = $this->searchVerses($version->id, $query);
        }

        return Inertia::render('Bible/Search', [
            'query' => $query,
            'results' => $results,
            'version' => $version ? [
                'slug' => $versionSlug,
                'label' => BibleVersion::VERSION_LABELS[$versionSlug] ?? strtoupper($versionSlug),
                'name' => $version->name,
            ] : null,
            'available_versions' => BibleVersion::availableForSwitcher(),
        ]);
    }

    protected function searchVerses(int $versionId, string $query): array
    {
        return match (Schema::getConnection()->getDriverName()) {
            'sqlite' => $this->searchSqlite($versionId, $query),
            'mysql' => $this->searchMysql($versionId, $query),
            'pgsql' => $this->searchPgsql($versionId, $query),
            default => $this->searchLike($versionId, $query),
        };
    }

    protected function baseQuery(int $versionId)
    {
        return DB::table('verses')
            ->join('chapters', 'chapters.id', '=', 'verses.chapter_id')
            ->join('books', 'books.id', '=', 'chapters.book_id')
            ->where('books.bible_version_id', $versionId)
            ->select([
                'verses.id',
                'verses.number as verse_number',
                'verses.text',
                'chapters.number as chapter_number',
                'books.name as book_name',
                'books.abbreviation as book_abbreviation',
                'books.position as book_position',
            ]);
    }

    protected function searchSqlite(int $versionId, string $query): array
    {
        $hasIndex = Schema::hasTable('verses_fts') && DB::table('verses_fts')->count() > 0;

        if (! $hasIndex) {
            return $this->searchLike($versionId, $query);
        }

        $rows = DB::table('verses_fts')
            ->join('verses', 'verses.id', '=', 'verses_fts.verse_id')
            ->join('chapters', 'chapters.id', '=', 'verses.chapter_id')
            ->join('books', 'books.id', '=', 'chapters.book_id')
            ->where('books.bible_version_id', $versionId)
            ->whereRaw('verses_fts MATCH ?', [$this->fts5Match($query)])
            ->orderByRaw('bm25(verses_fts)')
            ->limit(50)
            ->get([
                'verses.id',
                'verses.number as verse_number',
                'verses.text',
                'chapters.number as chapter_number',
                'books.name as book_name',
                'books.abbreviation as book_abbreviation',
            ]);

        return $rows->map(fn ($row) => $this->formatResult($row, $query))->all();
    }

    protected function searchMysql(int $versionId, string $query): array
    {
        $rows = $this->baseQuery($versionId)
            ->whereRaw('MATCH(verses.text) AGAINST(? IN NATURAL LANGUAGE MODE)', [$query])
            ->orderByRaw('MATCH(verses.text) AGAINST(? IN NATURAL LANGUAGE MODE) DESC', [$query])
            ->limit(50)
            ->get();

        return $rows->map(fn ($row) => $this->formatResult($row, $query))->all();
    }

    protected function searchPgsql(int $versionId, string $query): array
    {
        $rows = $this->baseQuery($versionId)
            ->whereRaw("to_tsvector('english', verses.text) @@ plainto_tsquery('english', ?)", [$query])
            ->orderByRaw("ts_rank(to_tsvector('english', verses.text), plainto_tsquery('english', ?)) DESC", [$query])
            ->limit(50)
            ->get();

        return $rows->map(fn ($row) => $this->formatResult($row, $query))->all();
    }

    protected function searchLike(int $versionId, string $query): array
    {
        $rows = $this->baseQuery($versionId)
            ->where('verses.text', 'like', '%'.$query.'%')
            ->orderBy('books.position')
            ->orderBy('chapters.number')
            ->orderBy('verses.number')
            ->limit(50)
            ->get();

        return $rows->map(fn ($row) => $this->formatResult($row, $query))->all();
    }

    /**
     * Build a safe FTS5 MATCH expression: every token quoted (so special
     * characters are literal), AND-ed together, with a prefix wildcard on
     * the final token for an as-you-type feel.
     */
    protected function fts5Match(string $query): string
    {
        $tokens = preg_split('/\s+/', trim($query), -1, PREG_SPLIT_NO_EMPTY) ?: [];

        if (empty($tokens)) {
            return '""';
        }

        $quoted = array_map(fn ($t) => '"'.str_replace('"', '""', $t).'"', $tokens);

        $last = array_pop($quoted);
        $quoted[] = substr($last, 0, -1).'*"';

        return implode(' AND ', $quoted);
    }

    protected function formatResult(object $row, string $query): array
    {
        return [
            'verse_id' => $row->id,
            'book_name' => $row->book_name,
            'book_abbreviation' => $row->book_abbreviation,
            'chapter_number' => (int) $row->chapter_number,
            'verse_number' => (int) $row->verse_number,
            'reference' => "{$row->book_name} {$row->chapter_number}:{$row->verse_number}",
            'snippet' => $this->snippet($row->text, $query),
        ];
    }

    /**
     * Extract ~140 characters of context around the first match.
     */
    protected function snippet(string $text, string $query, int $radius = 70): string
    {
        $pos = mb_stripos($text, $query);

        if ($pos === false) {
            $token = strtok($query, " \t\n\r");
            $pos = $token !== false ? mb_stripos($text, $token) : false;
        }

        if ($pos === false) {
            return mb_substr($text, 0, 140);
        }

        $start = max(0, $pos - $radius);
        $snippet = mb_substr($text, $start, $radius * 2 + mb_strlen($query));

        return ($start > 0 ? '…' : '').$snippet.'…';
    }
}
