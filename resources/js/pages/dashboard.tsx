import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { BookOpen, Bookmark as BookmarkIcon, Heart, Highlighter, MessageSquare, ArrowRight, PenTool } from 'lucide-react';
import { Bookmark, Highlight, Book, Chapter, Verse } from '@/types/bible';
import { cn } from '@/lib/utils';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'My Studio',
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
            <Head title="My Studio" />
            <div className="flex h-full flex-1 flex-col gap-8 overflow-x-auto p-6 md:p-10 bg-[#F5F2EA]/30">

                {/* Welcome Section */}
                <div className="bg-gradient-to-br from-[#1a1a1a] to-[#2a2a2a] text-white p-10 rounded-none shadow-xl">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-yellow-500 flex items-center justify-center">
                            <PenTool size={20} />
                        </div>
                        <h2 className="text-3xl font-bold tracking-wider uppercase" style={{ fontFamily: 'DM Serif Display, serif' }}>
                            INSPIRE<span className="text-yellow-500">WRITE</span> STUDIO
                        </h2>
                    </div>
                    <p className="text-gray-300 italic text-lg mt-4 mb-6 max-w-2xl" style={{ fontFamily: 'DM Serif Display, serif' }}>
                        "Thy word is a lamp unto my feet, and a light unto my path." — Psalm 119:105
                    </p>
                    <Link
                        href="/bible/gn/1"
                        className="inline-flex items-center gap-2 bg-yellow-500 text-white px-6 py-3 text-sm uppercase tracking-widest hover:bg-yellow-600 transition-colors group"
                    >
                        <BookOpen size={18} />
                        Continue Reading
                        <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>

                {/* Stats Overview */}
                <div className="grid grid-cols-3 gap-4">
                    <div className="bg-white border border-gray-100 p-6 text-center hover:shadow-lg transition-shadow">
                        <div className="text-4xl font-bold text-yellow-500 mb-1" style={{ fontFamily: 'DM Serif Display, serif' }}>{bookmarks.length}</div>
                        <div className="text-xs uppercase tracking-widest text-gray-500">Bookmarks</div>
                    </div>
                    <div className="bg-white border border-gray-100 p-6 text-center hover:shadow-lg transition-shadow">
                        <div className="text-4xl font-bold text-yellow-500 mb-1" style={{ fontFamily: 'DM Serif Display, serif' }}>{favorites.length}</div>
                        <div className="text-xs uppercase tracking-widest text-gray-500">Favorites</div>
                    </div>
                    <div className="bg-white border border-gray-100 p-6 text-center hover:shadow-lg transition-shadow">
                        <div className="text-4xl font-bold text-yellow-500 mb-1" style={{ fontFamily: 'DM Serif Display, serif' }}>{highlights.length}</div>
                        <div className="text-xs uppercase tracking-widest text-gray-500">Highlights</div>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid gap-8 md:grid-cols-3">
                    {/* Bookmarks Column */}
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-[#1a1a1a] text-white">
                                <BookmarkIcon size={18} />
                            </div>
                            <h3 className="text-sm font-bold uppercase tracking-widest">Bookmarks</h3>
                            <div className="h-px bg-black/10 flex-1" />
                        </div>

                        <div className="flex flex-col gap-3">
                            {bookmarks.length > 0 ? (
                                bookmarks.map((bookmark) => (
                                    <div key={bookmark.id} className="flex flex-col bg-white border border-gray-100 overflow-hidden group hover:shadow-lg hover:border-yellow-500/30 transition-all">
                                        <Link
                                            href={`/bible/${bookmark.book.abbreviation}/${bookmark.chapter.number}`}
                                            className="p-5 block"
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="font-bold text-sm uppercase tracking-wider group-hover:text-yellow-600 transition-colors">
                                                    {bookmark.book.name} {bookmark.chapter.number}
                                                </span>
                                                <span className="text-xs text-gray-400">{formatDate(bookmark.created_at)}</span>
                                            </div>
                                            <p className="text-sm text-gray-600 truncate italic" style={{ fontFamily: 'DM Serif Display, serif' }}>
                                                {bookmark.verse ? `Verse ${bookmark.verse.number}: ${bookmark.verse.text}` : 'Chapter Bookmark'}
                                            </p>
                                        </Link>
                                        {bookmark.note && (
                                            <div className="px-5 pb-5 pt-0">
                                                <div className="bg-[#F5F2EA] p-4 text-sm italic text-gray-700 flex gap-2 border-l-2 border-yellow-500">
                                                    <MessageSquare className="w-4 h-4 mt-0.5 text-gray-400 shrink-0" />
                                                    <span>{bookmark.note}</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <div className="p-10 text-center border-2 border-dashed border-gray-200 text-gray-400 text-sm uppercase tracking-wider">
                                    No bookmarks yet
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Favorites Column */}
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-yellow-500 text-white">
                                <Heart size={18} />
                            </div>
                            <h3 className="text-sm font-bold uppercase tracking-widest">Favorites</h3>
                            <div className="h-px bg-black/10 flex-1" />
                        </div>

                        <div className="flex flex-col gap-3">
                            {favorites.length > 0 ? (
                                favorites.map((favorite) => (
                                    <div key={favorite.id} className="flex flex-col bg-white border border-gray-100 overflow-hidden group hover:shadow-lg hover:border-yellow-500/30 transition-all">
                                        <Link
                                            href={`/bible/${favorite.verse.chapter.book.abbreviation}/${favorite.verse.chapter.number}`}
                                            className="p-5 block"
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="font-bold text-sm uppercase tracking-wider group-hover:text-yellow-600 transition-colors">
                                                    {favorite.verse.chapter.book.name} {favorite.verse.chapter.number}:{favorite.verse.number}
                                                </span>
                                                <span className="text-xs text-gray-400">{formatDate(favorite.created_at)}</span>
                                            </div>
                                            <p className="text-sm text-gray-600 line-clamp-3 italic" style={{ fontFamily: 'DM Serif Display, serif' }}>
                                                "{favorite.verse.text}"
                                            </p>
                                        </Link>
                                        {favorite.note && (
                                            <div className="px-5 pb-5 pt-0">
                                                <div className="bg-[#F5F2EA] p-4 text-sm italic text-gray-700 flex gap-2 border-l-2 border-yellow-500">
                                                    <MessageSquare className="w-4 h-4 mt-0.5 text-gray-400 shrink-0" />
                                                    <span>{favorite.note}</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <div className="p-10 text-center border-2 border-dashed border-gray-200 text-gray-400 text-sm uppercase tracking-wider">
                                    No favorites yet
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Highlights Column */}
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-yellow-500 text-white">
                                <Highlighter size={18} />
                            </div>
                            <h3 className="text-sm font-bold uppercase tracking-widest">Highlights</h3>
                            <div className="h-px bg-black/10 flex-1" />
                        </div>

                        <div className="flex flex-col gap-3">
                            {highlights.length > 0 ? (
                                highlights.map((highlight) => (
                                    <div key={highlight.id} className="flex flex-col bg-white border border-gray-100 overflow-hidden group hover:shadow-lg hover:border-yellow-500/30 transition-all">
                                        <Link
                                            href={`/bible/${highlight.verse.chapter.book.abbreviation}/${highlight.verse.chapter.number}`}
                                            className="p-5 block"
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="flex items-center gap-2">
                                                    <span className={cn("w-3 h-3 rounded-full", getHighlightColor(highlight.color).split(' ')[0])}></span>
                                                    <span className="font-bold text-sm uppercase tracking-wider group-hover:text-yellow-600 transition-colors">
                                                        {highlight.verse.chapter.book.name} {highlight.verse.chapter.number}:{highlight.verse.number}
                                                    </span>
                                                </div>
                                                <span className="text-xs text-gray-400">{formatDate(highlight.created_at)}</span>
                                            </div>
                                            <p className={cn("text-sm line-clamp-3 p-2", getHighlightColor(highlight.color))} style={{ fontFamily: 'DM Serif Display, serif' }}>
                                                {highlight.verse.text}
                                            </p>
                                        </Link>
                                        {highlight.note && (
                                            <div className="px-5 pb-5 pt-0">
                                                <div className="bg-[#F5F2EA] p-4 text-sm italic text-gray-700 flex gap-2 border-l-2 border-yellow-500">
                                                    <MessageSquare className="w-4 h-4 mt-0.5 text-gray-400 shrink-0" />
                                                    <span>{highlight.note}</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <div className="p-10 text-center border-2 border-dashed border-gray-200 text-gray-400 text-sm uppercase tracking-wider">
                                    No highlights yet
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </AppLayout>
    );
}
