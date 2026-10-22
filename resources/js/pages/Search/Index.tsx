import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Search, BookOpen, FileText, Library, Heart, Highlighter, Sparkles } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Search', href: '/search' },
];

interface VerseResult {
    id: number;
    text: string;
    verse_number: number;
    reference: string;
    book_abbr: string;
    chapter_number: number;
}

interface LessonResult {
    id: number;
    title: string;
    theme: string | null;
    content_preview: string;
    created_at: string;
    sermon_id: number | null;
}

interface SermonResult {
    id: number;
    title: string;
    description: string | null;
    detected_theme: string | null;
    lessons_count: number;
    created_at: string;
}

interface HighlightResult {
    id: number;
    verse_id: number;
    color: string;
    note: string | null;
    text: string;
    reference: string;
    book_abbr: string;
    chapter_number: number;
    verse_number: number;
}

interface FavoriteResult {
    id: number;
    verse_id: number;
    note: string | null;
    text: string;
    reference: string;
    book_abbr: string;
    chapter_number: number;
    verse_number: number;
}

interface SearchResults {
    verses: VerseResult[];
    lessons: LessonResult[];
    sermons: SermonResult[];
    highlights: HighlightResult[];
    favorites: FavoriteResult[];
}

interface Props {
    query: string;
    results: SearchResults;
}

function VerseCard({ verse }: { verse: VerseResult }) {
    return (
        <Link
            href={`/bible/${verse.book_abbr}/${verse.chapter_number}#verse-${verse.verse_number}`}
            className="block p-4 rounded-lg border border-border bg-card hover:bg-muted/50 transition-colors"
        >
            <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400 shrink-0">
                    <BookOpen size={16} />
                </div>
                <div className="flex-1 min-w-0">
                    <span className="font-medium text-sm">{verse.reference}</span>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{verse.text}</p>
                </div>
            </div>
        </Link>
    );
}

function LessonCard({ lesson }: { lesson: LessonResult }) {
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
        });
    };

    return (
        <Link
            href={`/lessons/${lesson.id}`}
            className="block p-4 rounded-lg border border-border bg-card hover:bg-muted/50 transition-colors"
        >
            <div className="flex items-start gap-3">
                <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg text-yellow-600 dark:text-yellow-400 shrink-0">
                    <Sparkles size={16} />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                        <span className="font-medium text-sm truncate">{lesson.title}</span>
                        <span className="text-xs text-muted-foreground shrink-0">{formatDate(lesson.created_at)}</span>
                    </div>
                    {lesson.theme && (
                        <span className="inline-block bg-muted px-2 py-0.5 rounded text-xs text-muted-foreground mt-1">
                            {lesson.theme}
                        </span>
                    )}
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{lesson.content_preview}</p>
                </div>
            </div>
        </Link>
    );
}

function SermonCard({ sermon }: { sermon: SermonResult }) {
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
        });
    };

    return (
        <Link
            href={`/sermons/${sermon.id}`}
            className="block p-4 rounded-lg border border-border bg-card hover:bg-muted/50 transition-colors"
        >
            <div className="flex items-start gap-3">
                <div className="p-2 bg-primary/10 rounded-lg text-primary shrink-0">
                    <Library size={16} />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                        <span className="font-serif font-bold text-sm truncate">{sermon.title}</span>
                        <span className="text-xs text-muted-foreground shrink-0">{formatDate(sermon.created_at)}</span>
                    </div>
                    {sermon.detected_theme && (
                        <span className="inline-block bg-muted px-2 py-0.5 rounded text-xs text-muted-foreground mt-1">
                            {sermon.detected_theme}
                        </span>
                    )}
                    {sermon.description && (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{sermon.description}</p>
                    )}
                    <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                        <FileText size={12} />
                        <span>{sermon.lessons_count} lesson{sermon.lessons_count !== 1 ? 's' : ''}</span>
                    </div>
                </div>
            </div>
        </Link>
    );
}

function HighlightCard({ highlight }: { highlight: HighlightResult }) {
    const getHighlightColor = (color: string) => {
        const colors: Record<string, string> = {
            yellow: '#fef08a',
            green: '#bbf7d0',
            blue: '#bfdbfe',
            pink: '#fbcfe8',
        };
        return colors[color] || colors.yellow;
    };

    return (
        <Link
            href={`/bible/${highlight.book_abbr}/${highlight.chapter_number}#verse-${highlight.verse_number}`}
            className="block p-4 rounded-lg border border-border bg-card hover:bg-muted/50 transition-colors"
        >
            <div className="flex items-start gap-3">
                <div
                    className="p-2 rounded-lg shrink-0"
                    style={{ backgroundColor: getHighlightColor(highlight.color) + '40' }}
                >
                    <Highlighter size={16} style={{ color: getHighlightColor(highlight.color) }} />
                </div>
                <div className="flex-1 min-w-0">
                    <span className="font-medium text-sm">{highlight.reference}</span>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{highlight.text}</p>
                    {highlight.note && (
                        <p className="text-xs text-primary mt-1 italic">Note: {highlight.note}</p>
                    )}
                </div>
            </div>
        </Link>
    );
}

function FavoriteCard({ favorite }: { favorite: FavoriteResult }) {
    return (
        <Link
            href={`/bible/${favorite.book_abbr}/${favorite.chapter_number}#verse-${favorite.verse_number}`}
            className="block p-4 rounded-lg border border-border bg-card hover:bg-muted/50 transition-colors"
        >
            <div className="flex items-start gap-3">
                <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg text-red-500 shrink-0">
                    <Heart size={16} className="fill-current" />
                </div>
                <div className="flex-1 min-w-0">
                    <span className="font-medium text-sm">{favorite.reference}</span>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{favorite.text}</p>
                    {favorite.note && (
                        <p className="text-xs text-primary mt-1 italic">Note: {favorite.note}</p>
                    )}
                </div>
            </div>
        </Link>
    );
}

function EmptyState({ message }: { message: string }) {
    return (
        <div className="p-8 text-center text-muted-foreground text-sm">
            {message}
        </div>
    );
}

export default function SearchIndex({ query, results }: Props) {
    const [searchValue, setSearchValue] = useState(query);
    const [debouncedValue, setDebouncedValue] = useState(query);

    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedValue(searchValue);
        }, 400);
        return () => clearTimeout(timer);
    }, [searchValue]);

    // Navigate with search query when debounced value changes
    useEffect(() => {
        if (debouncedValue !== query) {
            router.get('/search', { q: debouncedValue }, {
                preserveState: true,
                preserveScroll: true,
            });
        }
    }, [debouncedValue]);

    const totalResults =
        results.verses.length +
        results.lessons.length +
        results.sermons.length +
        results.highlights.length +
        results.favorites.length;

    const savedCount = results.highlights.length + results.favorites.length;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Search" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4 md:p-8">

                {/* Header with Search */}
                <div className="rounded-xl border border-sidebar-border/70 dark:border-sidebar-border p-8 bg-card shadow-sm">
                    <h2 className="text-2xl font-serif font-bold mb-4">Search</h2>
                    <p className="max-w-2xl text-muted-foreground leading-relaxed mb-6">
                        Search across Bible verses, your lessons, sermons, highlights, and favorites.
                    </p>
                    <div className="relative max-w-xl">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                        <Input
                            type="text"
                            placeholder="Search for a word, phrase, or topic..."
                            value={searchValue}
                            onChange={(e) => setSearchValue(e.target.value)}
                            className="pl-10 h-12 text-base"
                            autoFocus
                        />
                    </div>
                    {query && (
                        <p className="mt-4 text-sm text-muted-foreground">
                            Found <span className="font-medium text-foreground">{totalResults}</span> result{totalResults !== 1 ? 's' : ''} for "{query}"
                        </p>
                    )}
                </div>

                {/* Results */}
                {query && (
                    <Tabs defaultValue="all" className="flex-1 flex flex-col">
                        <TabsList className="w-full max-w-2xl">
                            <TabsTrigger value="all" className="flex-1">
                                All ({totalResults})
                            </TabsTrigger>
                            <TabsTrigger value="verses" className="flex-1">
                                Verses ({results.verses.length})
                            </TabsTrigger>
                            <TabsTrigger value="lessons" className="flex-1">
                                Lessons ({results.lessons.length})
                            </TabsTrigger>
                            <TabsTrigger value="sermons" className="flex-1">
                                Sermons ({results.sermons.length})
                            </TabsTrigger>
                            <TabsTrigger value="saved" className="flex-1">
                                Saved ({savedCount})
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="all" className="flex-1 mt-6">
                            {totalResults === 0 ? (
                                <EmptyState message="No results found. Try a different search term." />
                            ) : (
                                <div className="grid gap-6 lg:grid-cols-2">
                                    {/* Verses Column */}
                                    {results.verses.length > 0 && (
                                        <div className="flex flex-col gap-3">
                                            <h3 className="font-semibold flex items-center gap-2">
                                                <BookOpen size={16} className="text-blue-600" />
                                                Bible Verses
                                            </h3>
                                            <div className="flex flex-col gap-2">
                                                {results.verses.slice(0, 5).map((verse) => (
                                                    <VerseCard key={verse.id} verse={verse} />
                                                ))}
                                                {results.verses.length > 5 && (
                                                    <p className="text-sm text-muted-foreground text-center py-2">
                                                        +{results.verses.length - 5} more verses
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Lessons & Sermons Column */}
                                    <div className="flex flex-col gap-6">
                                        {results.sermons.length > 0 && (
                                            <div className="flex flex-col gap-3">
                                                <h3 className="font-semibold flex items-center gap-2">
                                                    <Library size={16} className="text-primary" />
                                                    Sermons
                                                </h3>
                                                <div className="flex flex-col gap-2">
                                                    {results.sermons.slice(0, 3).map((sermon) => (
                                                        <SermonCard key={sermon.id} sermon={sermon} />
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {results.lessons.length > 0 && (
                                            <div className="flex flex-col gap-3">
                                                <h3 className="font-semibold flex items-center gap-2">
                                                    <Sparkles size={16} className="text-yellow-600" />
                                                    Lessons
                                                </h3>
                                                <div className="flex flex-col gap-2">
                                                    {results.lessons.slice(0, 3).map((lesson) => (
                                                        <LessonCard key={lesson.id} lesson={lesson} />
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {savedCount > 0 && (
                                            <div className="flex flex-col gap-3">
                                                <h3 className="font-semibold flex items-center gap-2">
                                                    <Heart size={16} className="text-red-500" />
                                                    Saved Content
                                                </h3>
                                                <div className="flex flex-col gap-2">
                                                    {results.highlights.slice(0, 2).map((highlight) => (
                                                        <HighlightCard key={`h-${highlight.id}`} highlight={highlight} />
                                                    ))}
                                                    {results.favorites.slice(0, 2).map((favorite) => (
                                                        <FavoriteCard key={`f-${favorite.id}`} favorite={favorite} />
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="verses" className="flex-1 mt-6">
                            {results.verses.length === 0 ? (
                                <EmptyState message="No verse results found." />
                            ) : (
                                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                                    {results.verses.map((verse) => (
                                        <VerseCard key={verse.id} verse={verse} />
                                    ))}
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="lessons" className="flex-1 mt-6">
                            {results.lessons.length === 0 ? (
                                <EmptyState message="No lesson results found." />
                            ) : (
                                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                                    {results.lessons.map((lesson) => (
                                        <LessonCard key={lesson.id} lesson={lesson} />
                                    ))}
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="sermons" className="flex-1 mt-6">
                            {results.sermons.length === 0 ? (
                                <EmptyState message="No sermon results found." />
                            ) : (
                                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                                    {results.sermons.map((sermon) => (
                                        <SermonCard key={sermon.id} sermon={sermon} />
                                    ))}
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="saved" className="flex-1 mt-6">
                            {savedCount === 0 ? (
                                <EmptyState message="No saved content found." />
                            ) : (
                                <div className="grid gap-6 lg:grid-cols-2">
                                    {results.highlights.length > 0 && (
                                        <div className="flex flex-col gap-3">
                                            <h3 className="font-semibold flex items-center gap-2">
                                                <Highlighter size={16} />
                                                Highlights
                                            </h3>
                                            <div className="flex flex-col gap-2">
                                                {results.highlights.map((highlight) => (
                                                    <HighlightCard key={highlight.id} highlight={highlight} />
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    {results.favorites.length > 0 && (
                                        <div className="flex flex-col gap-3">
                                            <h3 className="font-semibold flex items-center gap-2">
                                                <Heart size={16} className="text-red-500" />
                                                Favorites
                                            </h3>
                                            <div className="flex flex-col gap-2">
                                                {results.favorites.map((favorite) => (
                                                    <FavoriteCard key={favorite.id} favorite={favorite} />
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </TabsContent>
                    </Tabs>
                )}

                {/* Initial state when no query */}
                {!query && (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="text-center text-muted-foreground">
                            <Search size={48} className="mx-auto mb-4 opacity-30" />
                            <p className="text-lg">Start typing to search</p>
                            <p className="text-sm mt-1">Search Bible verses, lessons, sermons, and your saved content</p>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
