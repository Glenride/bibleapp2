import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { BookOpen, Bookmark as BookmarkIcon, Heart, Highlighter, MessageSquare, ArrowRight, PenTool, BadgeDollarSign, Copy, Check, CheckCircle2, Circle, X, Sparkles } from 'lucide-react';
import { useState } from 'react';
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
    const { auth } = usePage<SharedData>().props;
    const [linkCopied, setLinkCopied] = useState(false);
    const [showChecklist, setShowChecklist] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('bible-onboarding-dismissed') !== 'true';
        }
        return true;
    });

    const dismissChecklist = () => {
        setShowChecklist(false);
        if (typeof window !== 'undefined') {
            localStorage.setItem('bible-onboarding-dismissed', 'true');
        }
    };

    const copyAffiliateLink = async () => {
        if (!auth.affiliate) return;
        try {
            await navigator.clipboard.writeText(`${window.location.origin}/r/${auth.affiliate.code}`);
            setLinkCopied(true);
            setTimeout(() => setLinkCopied(false), 2000);
        } catch {
            /* clipboard unavailable */
        }
    };
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
                            <PenTool size={20} className="text-[#1a1a1a]" />
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
                        className="inline-flex items-center gap-2 bg-yellow-500 text-[#1a1a1a] font-semibold px-6 py-3 text-sm uppercase tracking-widest hover:bg-yellow-400 transition-colors group"
                    >
                        <BookOpen size={18} />
                        Continue Reading
                        <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>

                {/* First Steps Onboarding Checklist */}
                {showChecklist && (
                    <div className="rounded-xl border border-yellow-500/40 bg-gradient-to-r from-yellow-500/10 via-background to-background p-6 shadow-sm relative">
                        <button
                            type="button"
                            onClick={dismissChecklist}
                            className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors p-1"
                            title="Dismiss checklist"
                        >
                            <X size={18} />
                        </button>
                        <div className="flex items-center gap-2 mb-2">
                            <Sparkles className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                            <h3 className="font-serif font-bold text-lg">First Steps in InspireWrite</h3>
                        </div>
                        <p className="text-sm text-muted-foreground mb-4 max-w-xl">
                            Get started on your spiritual reading and reflection journey with these three simple actions:
                        </p>
                        <div className="grid gap-3 sm:grid-cols-3">
                            <Link
                                href="/bible/jn/1"
                                className="flex items-start gap-3 p-3.5 rounded-lg border border-border/80 bg-background/90 hover:border-yellow-500 hover:shadow-sm transition-all group"
                            >
                                <div className="mt-0.5 text-yellow-600 shrink-0">
                                    <CheckCircle2 size={18} />
                                </div>
                                <div>
                                    <span className="text-xs uppercase tracking-wider font-semibold text-muted-foreground block mb-0.5">Step 1</span>
                                    <span className="text-sm font-medium text-foreground group-hover:text-yellow-600 transition-colors block">
                                        Open John 1 in Easy Read &rarr;
                                    </span>
                                    <span className="text-xs text-muted-foreground mt-0.5 block">
                                        Distraction-free reading experience
                                    </span>
                                </div>
                            </Link>

                            <Link
                                href="/bible/jn/1"
                                className="flex items-start gap-3 p-3.5 rounded-lg border border-border/80 bg-background/90 hover:border-yellow-500 hover:shadow-sm transition-all group"
                            >
                                <div className={cn("mt-0.5 shrink-0", highlights.length > 0 ? "text-yellow-600" : "text-muted-foreground/40")}>
                                    {highlights.length > 0 ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                                </div>
                                <div>
                                    <span className="text-xs uppercase tracking-wider font-semibold text-muted-foreground block mb-0.5">Step 2</span>
                                    <span className="text-sm font-medium text-foreground group-hover:text-yellow-600 transition-colors block">
                                        Highlight a Verse &rarr;
                                    </span>
                                    <span className="text-xs text-muted-foreground mt-0.5 block">
                                        {highlights.length > 0 ? `${highlights.length} verse(s) highlighted` : 'Tap any verse to choose a highlight color'}
                                    </span>
                                </div>
                            </Link>

                            <Link
                                href="/bible/jn/1"
                                className="flex items-start gap-3 p-3.5 rounded-lg border border-border/80 bg-background/90 hover:border-yellow-500 hover:shadow-sm transition-all group"
                            >
                                <div className={cn("mt-0.5 shrink-0", (favorites.some(f => !!f.note) || bookmarks.some(b => !!b.note) || highlights.some(h => !!h.note)) ? "text-yellow-600" : "text-muted-foreground/40")}>
                                    {(favorites.some(f => !!f.note) || bookmarks.some(b => !!b.note) || highlights.some(h => !!h.note)) ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                                </div>
                                <div>
                                    <span className="text-xs uppercase tracking-wider font-semibold text-muted-foreground block mb-0.5">Step 3</span>
                                    <span className="text-sm font-medium text-foreground group-hover:text-yellow-600 transition-colors block">
                                        Write a Reflection &rarr;
                                    </span>
                                    <span className="text-xs text-muted-foreground mt-0.5 block">
                                        Add personal notes using the S.C.R.I.P.T. method
                                    </span>
                                </div>
                            </Link>
                        </div>
                    </div>
                )}

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

                {/* Affiliate card — only for users with an affiliate record */}
                {auth.affiliate && (
                    <div className="rounded-xl border border-primary/30 bg-primary/5 p-6 shadow-sm">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                                    <BadgeDollarSign size={20} />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg">Your affiliate link</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Code <span className="font-mono font-medium">{auth.affiliate.code}</span>
                                        {' · '}
                                        <span className="capitalize">{auth.affiliate.status}</span>
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <code className="rounded-md border bg-background px-3 py-2 text-sm break-all">
                                    {typeof window !== 'undefined' ? `${window.location.origin}/r/${auth.affiliate.code}` : `/r/${auth.affiliate.code}`}
                                </code>
                                <button
                                    type="button"
                                    onClick={copyAffiliateLink}
                                    className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:opacity-90 transition-opacity"
                                >
                                    {linkCopied ? <Check size={16} /> : <Copy size={16} />}
                                    {linkCopied ? 'Copied!' : 'Copy'}
                                </button>
                                <Link
                                    href="/affiliate"
                                    className="inline-flex items-center gap-2 border border-border px-4 py-2 rounded-md text-sm font-medium hover:bg-muted transition-colors"
                                >
                                    Dashboard
                                </Link>
                            </div>
                        </div>
                    </div>
                )}

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
                                <div className="p-8 text-center border-2 border-dashed border-gray-200 rounded-lg text-gray-500 text-sm flex flex-col items-center gap-3">
                                    <BookmarkIcon className="h-6 w-6 text-gray-400" />
                                    <p className="text-gray-600">Save chapters you want to return to.</p>
                                    <Link href="/bible/gn/1" className="text-xs uppercase tracking-wider font-semibold text-yellow-600 hover:text-yellow-700">
                                        Start Reading Genesis 1 &rarr;
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Favorites Column */}
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-yellow-500 text-[#1a1a1a]">
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
                                <div className="p-8 text-center border-2 border-dashed border-gray-200 rounded-lg text-gray-500 text-sm flex flex-col items-center gap-3">
                                    <Heart className="h-6 w-6 text-gray-400" />
                                    <p className="text-gray-600">Save verses that speak to your heart.</p>
                                    <Link href="/bible/jn/1" className="text-xs uppercase tracking-wider font-semibold text-yellow-600 hover:text-yellow-700">
                                        Explore John 1 &rarr;
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Highlights Column */}
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-yellow-500 text-[#1a1a1a]">
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
                                <div className="p-8 text-center border-2 border-dashed border-gray-200 rounded-lg text-gray-500 text-sm flex flex-col items-center gap-3">
                                    <Highlighter className="h-6 w-6 text-gray-400" />
                                    <p className="text-gray-600">Click any verse while reading to highlight it.</p>
                                    <Link href="/bible/ps/23" className="text-xs uppercase tracking-wider font-semibold text-yellow-600 hover:text-yellow-700">
                                        Read Psalm 23 &rarr;
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </AppLayout>
    );
}
