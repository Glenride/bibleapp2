import BibleLayout from '@/layouts/bible-layout';
import { Head, Link, router } from '@inertiajs/react';
import { useState, type FormEvent } from 'react';
import { Search as SearchIcon, BookOpen } from 'lucide-react';

interface SearchResult {
    verse_id: number;
    book_name: string;
    book_abbreviation: string;
    chapter_number: number;
    verse_number: number;
    reference: string;
    snippet: string;
}

interface Props {
    query: string;
    results: SearchResult[];
    version: { slug: string; label: string; name: string } | null;
    available_versions: { slug: string; label: string; name: string }[];
}

/** Highlight query tokens inside a snippet with <mark>. */
function highlightSnippet(snippet: string, query: string) {
    const tokens = query.split(/\s+/).filter(Boolean);

    if (tokens.length === 0) return snippet;

    const lowerTokens = new Set(tokens.map((t) => t.toLowerCase()));
    const pattern = new RegExp(`(${tokens.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'gi');

    return snippet.split(pattern).map((part, i) =>
        lowerTokens.has(part.toLowerCase()) ? (
            <mark key={i} className="bg-primary/30 text-inherit rounded-sm px-0.5">
                {part}
            </mark>
        ) : (
            <span key={i}>{part}</span>
        ),
    );
}

export default function Search({ query, results, version, available_versions }: Props) {
    const [value, setValue] = useState(query);
    const [versionSlug, setVersionSlug] = useState(version?.slug ?? 'kjv');

    const submit = (e: FormEvent) => {
        e.preventDefault();
        const q = value.trim();

        if (q.length >= 2) {
            router.visit(`/bible/search?q=${encodeURIComponent(q)}&version=${encodeURIComponent(versionSlug)}`);
        }
    };

    // Result links stay inside the searched version's URL space.
    const resultHref = (result: SearchResult) =>
        versionSlug === 'kjv'
            ? `/bible/${result.book_abbreviation}/${result.chapter_number}`
            : `/bible/${versionSlug}/${result.book_abbreviation}/${result.chapter_number}`;

    return (
        <BibleLayout>
            <Head>
                <title>{query ? `Search: ${query} | InspireWrite` : 'Search the Bible | InspireWrite'}</title>
                <meta name="description" content="Search the full text of the Bible. Find verses by keyword or phrase." />
                {/* Search result pages are not for indexing */}
                <meta name="robots" content="noindex, nofollow" />
            </Head>

            <div className="mx-auto max-w-4xl px-4 md:px-8 py-12">
                <h1 className="font-serif text-4xl md:text-5xl mb-2">Search Scripture</h1>
                <p className="text-muted-foreground mb-8">Find verses by keyword or phrase across the whole Bible.</p>

                <form onSubmit={submit} className="flex gap-2 mb-10">
                    <div className="relative flex-1">
                        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <input
                            type="search"
                            value={value}
                            onChange={(e) => setValue(e.target.value)}
                            placeholder="e.g. love is patient, shepherd, psalm 23…"
                            className="w-full rounded-md border border-input bg-background pl-10 pr-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none"
                            aria-label="Search the Bible"
                        />
                    </div>
                    {available_versions.length > 1 && (
                        <select
                            value={versionSlug}
                            onChange={(e) => setVersionSlug(e.target.value)}
                            className="rounded-md border border-input bg-background px-3 py-2.5 text-sm text-foreground"
                            aria-label="Bible translation to search"
                        >
                            {available_versions.map((v) => (
                                <option key={v.slug} value={v.slug} title={v.name}>
                                    {v.label}
                                </option>
                            ))}
                        </select>
                    )}
                    <button
                        type="submit"
                        className="rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
                    >
                        Search
                    </button>
                </form>

                {query && (
                    <p className="text-sm text-muted-foreground mb-6">
                        {results.length > 0 ? (
                            <>
                                <span className="font-semibold text-foreground">{results.length}</span> result{results.length === 1 ? '' : 's'} for{' '}
                                <span className="font-serif italic text-foreground">“{query}”</span>
                            </>
                        ) : (
                            <>
                                No results for <span className="font-serif italic text-foreground">“{query}”</span>. Try a different word or phrase.
                            </>
                        )}
                    </p>
                )}

                <div className="space-y-4">
                    {results.map((result) => (
                        <Link
                            key={result.verse_id}
                            href={resultHref(result)}
                            className="block rounded-lg border border-border/50 bg-card p-5 hover:border-primary/50 hover:shadow-md transition-all group"
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <BookOpen className="h-4 w-4 text-primary" />
                                <span className="font-serif font-semibold text-lg group-hover:text-primary transition-colors">
                                    {result.reference}
                                </span>
                            </div>
                            <p className="font-serif text-foreground/80 leading-relaxed">
                                {highlightSnippet(result.snippet, query)}
                            </p>
                        </Link>
                    ))}
                </div>
            </div>
        </BibleLayout>
    );
}
