import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { BookOpen, Bookmark as BookmarkIcon, Heart, Highlighter, MessageSquare } from 'lucide-react';
import { Bookmark, Highlight, Book, Chapter, Verse } from '@/types/bible';
import { cn } from '@/lib/utils';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'My Journal',
        href: dashboard().url,
    },
];

// Extended types with relationships
interface DashboardBookmark extends Bookmark {
    book: Book;
    chapter: Chapter;
    verse: Verse | null;
}

interface DashboardFavorite {
    id: number;
    verse_id: number;
    note: string | null;
    created_at: string;
    verse: Verse & {
        chapter: Chapter & {
            book: Book;
        };
    };
}

interface DashboardHighlight extends Highlight {
    verse: Verse & {
        chapter: Chapter & {
            book: Book;
        };
    };
}

interface DashboardProps {
    bookmarks: DashboardBookmark[];
    favorites: DashboardFavorite[];
    highlights: DashboardHighlight[];
}

export default function Dashboard({ bookmarks, favorites, highlights }: DashboardProps) {
    
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    const getHighlightColor = (color: string) => {
        switch (color) {
            case 'yellow': return 'bg-yellow-200 text-yellow-900 border-yellow-300';
            case 'green': return 'bg-green-200 text-green-900 border-green-300';
            case 'blue': return 'bg-blue-200 text-blue-900 border-blue-300';
            case 'pink': return 'bg-pink-200 text-pink-900 border-pink-300';
            default: return 'bg-gray-200 text-gray-900';
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="My Journal" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4 md:p-8">
                
                {/* Welcome Section */}
                <div className="rounded-xl border border-sidebar-border/70 dark:border-sidebar-border p-8 bg-card shadow-sm">
                    <h2 className="text-2xl font-serif font-bold mb-4">My Bible Journal</h2>
                    <p className="max-w-2xl text-muted-foreground leading-relaxed italic">
                        "Thy word is a lamp unto my feet, and a light unto my path." - Psalm 119:105
                    </p>
                    <div className="mt-6">
                         <Link href="/" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:opacity-90 transition-opacity">
                            <BookOpen size={16} />
                            Continue Reading
                        </Link>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    {/* Bookmarks Column */}
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-2 mb-2">
                             <div className="p-2 bg-primary/10 rounded-lg text-primary">
                                <BookmarkIcon size={20} />
                            </div>
                            <h3 className="font-semibold text-lg">Bookmarks</h3>
                        </div>
                        
                        <div className="flex flex-col gap-3">
                            {bookmarks.length > 0 ? (
                                bookmarks.map((bookmark) => (
                                    <div key={bookmark.id} className="flex flex-col rounded-lg border border-border bg-card shadow-sm overflow-hidden group">
                                        <Link 
                                            href={`/bible/${bookmark.book.abbreviation}/${bookmark.chapter.number}`}
                                            className="p-4 block hover:bg-muted/50 transition-colors"
                                        >
                                            <div className="flex justify-between items-start mb-1">
                                                <span className="font-serif font-bold group-hover:text-primary transition-colors">
                                                    {bookmark.book.name} {bookmark.chapter.number}
                                                </span>
                                                <span className="text-xs text-muted-foreground">{formatDate(bookmark.created_at)}</span>
                                            </div>
                                            <p className="text-sm text-muted-foreground truncate">
                                                {bookmark.verse ? `Verse ${bookmark.verse.number}: ${bookmark.verse.text}` : 'Chapter Bookmark'}
                                            </p>
                                        </Link>
                                        {bookmark.note && (
                                            <div className="px-4 pb-4 pt-0">
                                                <div className="bg-muted/50 p-3 rounded-md text-sm italic text-foreground/80 border border-border/50 flex gap-2">
                                                    <MessageSquare className="w-4 h-4 mt-0.5 text-muted-foreground shrink-0" />
                                                    <span>{bookmark.note}</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <div className="p-8 text-center border border-dashed border-border rounded-lg text-muted-foreground text-sm">
                                    No bookmarks yet.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Favorites Column */}
                    <div className="flex flex-col gap-4">
                         <div className="flex items-center gap-2 mb-2">
                             <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg text-red-600 dark:text-red-400">
                                <Heart size={20} />
                            </div>
                            <h3 className="font-semibold text-lg">Favorites</h3>
                        </div>

                         <div className="flex flex-col gap-3">
                            {favorites.length > 0 ? (
                                favorites.map((favorite) => (
                                    <div key={favorite.id} className="flex flex-col rounded-lg border border-border bg-card shadow-sm overflow-hidden group">
                                        <Link 
                                            href={`/bible/${favorite.verse.chapter.book.abbreviation}/${favorite.verse.chapter.number}`}
                                            className="p-4 block hover:bg-muted/50 transition-colors"
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="font-serif font-bold text-sm group-hover:text-primary transition-colors">
                                                    {favorite.verse.chapter.book.name} {favorite.verse.chapter.number}:{favorite.verse.number}
                                                </span>
                                                <span className="text-xs text-muted-foreground">{formatDate(favorite.created_at)}</span>
                                            </div>
                                            <p className="text-sm text-muted-foreground line-clamp-3 italic font-serif">
                                                "{favorite.verse.text}"
                                            </p>
                                        </Link>
                                        {favorite.note && (
                                            <div className="px-4 pb-4 pt-0">
                                                <div className="bg-muted/50 p-3 rounded-md text-sm italic text-foreground/80 border border-border/50 flex gap-2">
                                                    <MessageSquare className="w-4 h-4 mt-0.5 text-muted-foreground shrink-0" />
                                                    <span>{favorite.note}</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <div className="p-8 text-center border border-dashed border-border rounded-lg text-muted-foreground text-sm">
                                    No favorites yet.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Highlights Column */}
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-2 mb-2">
                             <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg text-yellow-600 dark:text-yellow-400">
                                <Highlighter size={20} />
                            </div>
                            <h3 className="font-semibold text-lg">Highlights</h3>
                        </div>

                         <div className="flex flex-col gap-3">
                            {highlights.length > 0 ? (
                                highlights.map((highlight) => (
                                    <div key={highlight.id} className="flex flex-col rounded-lg border border-border bg-card shadow-sm overflow-hidden group">
                                        <Link 
                                            href={`/bible/${highlight.verse.chapter.book.abbreviation}/${highlight.verse.chapter.number}`}
                                            className="p-4 block hover:bg-muted/50 transition-colors"
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="flex items-center gap-2">
                                                    <span className={cn("w-2 h-2 rounded-full", getHighlightColor(highlight.color).split(' ')[0])}></span>
                                                    <span className="font-serif font-bold text-sm group-hover:text-primary transition-colors">
                                                        {highlight.verse.chapter.book.name} {highlight.verse.chapter.number}:{highlight.verse.number}
                                                    </span>
                                                </div>
                                                <span className="text-xs text-muted-foreground">{formatDate(highlight.created_at)}</span>
                                            </div>
                                            <p className={cn("text-sm line-clamp-3 font-serif p-1 rounded", getHighlightColor(highlight.color))}>
                                                {highlight.verse.text}
                                            </p>
                                        </Link>
                                        {highlight.note && (
                                            <div className="px-4 pb-4 pt-0">
                                                <div className="bg-muted/50 p-3 rounded-md text-sm italic text-foreground/80 border border-border/50 flex gap-2">
                                                    <MessageSquare className="w-4 h-4 mt-0.5 text-muted-foreground shrink-0" />
                                                    <span>{highlight.note}</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <div className="p-8 text-center border border-dashed border-border rounded-lg text-muted-foreground text-sm">
                                    No highlights yet.
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </AppLayout>
    );
}
