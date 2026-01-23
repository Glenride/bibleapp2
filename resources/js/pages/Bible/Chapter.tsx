import BibleLayout from '@/layouts/bible-layout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Book, Chapter as ChapterType, Verse, UserInteractions, BookNav } from '@/types/bible';
import { SharedData } from '@/types';
import { useState, useEffect } from 'react';
import { Bookmark, Heart, X, Highlighter, Expand, Minimize, MessageSquare, BookOpen, ChevronRight, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Props {
    book: Book;
    chapter: ChapterType;
    verses: Verse[];
    prev_link: string | null;
    next_link: string | null;
    userInteractions: UserInteractions;
    allBooks: BookNav[];
    bookChapters: { id: number; number: number }[];
}

interface NoteDialogState {
    isOpen: boolean;
    type: 'highlight' | 'favorite' | 'bookmark';
    id: number; // verse_id or chapter_id (for bookmark)
    initialNote: string;
    color?: string; // For highlights
}

export default function Chapter({ book, chapter, verses, prev_link, next_link, userInteractions, allBooks, bookChapters }: Props) {
    const { auth } = usePage<SharedData>().props;
    const [fontSize, setFontSize] = useState(20);
    const [selectedVerseId, setSelectedVerseId] = useState<number | null>(null);
    const [navOpen, setNavOpen] = useState(false);
    const [expandedBook, setExpandedBook] = useState<string | null>(book.abbreviation);

    // Initialize Zen Mode from localStorage
    const [zenMode, setZenMode] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('bible-zen-mode') === 'true';
        }
        return false;
    });

    // Track verse to highlight from URL hash (e.g., #verse-5)
    const [highlightedVerseNum, setHighlightedVerseNum] = useState<number | null>(() => {
        if (typeof window !== 'undefined') {
            const hash = window.location.hash;
            const match = hash.match(/^#verse-(\d+)$/);
            return match ? parseInt(match[1], 10) : null;
        }
        return null;
    });

    // Persist Zen Mode changes
    useEffect(() => {
        localStorage.setItem('bible-zen-mode', String(zenMode));
    }, [zenMode]);

    // Scroll to highlighted verse on mount or when hash changes
    useEffect(() => {
        if (highlightedVerseNum !== null) {
            const verseElement = document.getElementById(`verse-${highlightedVerseNum}`);
            if (verseElement) {
                // Small delay to ensure DOM is ready
                setTimeout(() => {
                    verseElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 100);
                // Clear highlight after a few seconds
                setTimeout(() => {
                    setHighlightedVerseNum(null);
                }, 4000);
            }
        }
    }, [highlightedVerseNum]);

    // Close selection when changing chapters
    useEffect(() => {
        setSelectedVerseId(null);
        // Update highlighted verse from new URL hash
        const hash = window.location.hash;
        const match = hash.match(/^#verse-(\d+)$/);
        setHighlightedVerseNum(match ? parseInt(match[1], 10) : null);
    }, [chapter.id]);

    const [noteDialog, setNoteDialog] = useState<NoteDialogState>({
        isOpen: false,
        type: 'highlight',
        id: 0,
        initialNote: '',
    });
    const [noteContent, setNoteContent] = useState('');

    useEffect(() => {
        if (noteDialog.isOpen) {
            setNoteContent(noteDialog.initialNote || '');
        }
    }, [noteDialog.isOpen, noteDialog.initialNote]);

    const isBookmarked = !!userInteractions.bookmark;

    const handleBookmarkClick = () => {
        if (!auth.user) return router.visit('/login');
        if (!auth.user.is_subscribed) return router.visit('/pricing');

        if (isBookmarked) {
            // Open dialog to edit note or remove
            setNoteDialog({
                isOpen: true,
                type: 'bookmark',
                id: chapter.id,
                initialNote: userInteractions.bookmark?.note || '',
            });
        } else {
            // Just add bookmark
            router.post('/bible/bookmark', {
                book_id: book.id,
                chapter_id: chapter.id,
            }, {
                preserveScroll: true,
            });
        }
    };

    const handleSaveNote = () => {
        const { type, id, color } = noteDialog;

        let url = '';
        let data: any = { note: noteContent };

        if (type === 'bookmark') {
            url = '/bible/bookmark';
            data = {
                ...data,
                book_id: book.id,
                chapter_id: chapter.id,
            };
        } else if (type === 'highlight') {
            url = '/bible/highlight';
            data = {
                ...data,
                verse_id: id,
                color: color || 'yellow', // Default to yellow if new
            };
        } else if (type === 'favorite') {
            url = '/bible/favorite';
            data = {
                ...data,
                verse_id: id,
            };
        }

        router.post(url, data, {
            preserveScroll: true,
            onSuccess: () => setNoteDialog({ ...noteDialog, isOpen: false }),
        });
    };

    const handleHighlight = (color: string) => {
        if (!auth.user) return router.visit('/login');
        if (!auth.user.is_subscribed) return router.visit('/pricing');
        if (!selectedVerseId) return;

        router.post('/bible/highlight', {
            verse_id: selectedVerseId,
            color: color,
        }, {
            preserveScroll: true,
            onSuccess: () => setSelectedVerseId(null),
        });
    };

    const handleFavorite = () => {
        if (!auth.user) return router.visit('/login');
        if (!auth.user.is_subscribed) return router.visit('/pricing');
        if (!selectedVerseId) return;

        router.post('/bible/favorite', {
            verse_id: selectedVerseId,
        }, {
            preserveScroll: true,
            onSuccess: () => setSelectedVerseId(null),
        });
    };

    const openVerseNoteDialog = (verseId: number) => {
        if (!auth.user) return router.visit('/login');

        const highlight = userInteractions.highlights[verseId];
        const favorite = userInteractions.favorites[verseId];

        // Prioritize editing Highlight note, then Favorite note.
        // If neither, we'll create a new Favorite with note (or Highlight? Let's go with Favorite as it's cleaner)
        // Actually, let's go with Highlight (yellow) as default "Note" carrier if nothing exists, as it's more "study" like.

        if (highlight) {
            setNoteDialog({
                isOpen: true,
                type: 'highlight',
                id: verseId,
                initialNote: highlight.note || '',
                color: highlight.color,
            });
        } else if (favorite) {
            setNoteDialog({
                isOpen: true,
                type: 'favorite',
                id: verseId,
                initialNote: favorite.note || '',
            });
        } else {
            // Create new Highlight (Yellow) with Note
            setNoteDialog({
                isOpen: true,
                type: 'highlight',
                id: verseId,
                initialNote: '',
                color: 'yellow',
            });
        }
    };

    const getHighlightColor = (color: string) => {
        switch (color) {
            case 'yellow': return 'bg-yellow-200/50 dark:bg-yellow-900/30';
            case 'green': return 'bg-green-200/50 dark:bg-green-900/30';
            case 'blue': return 'bg-blue-200/50 dark:bg-blue-900/30';
            case 'pink': return 'bg-pink-200/50 dark:bg-pink-900/30';
            default: return '';
        }
    };

    return (
        <BibleLayout zenMode={zenMode}>
            <Head>
                <title>{`${book.name} ${chapter.number}`}</title>
                <meta name="description" content={`Read ${book.name} Chapter ${chapter.number} of the Bible. ${verses[0]?.text.substring(0, 150)}...`} />
                <meta property="og:title" content={`${book.name} ${chapter.number} - Holy Bible`} />
                <meta property="og:description" content={`Read ${book.name} Chapter ${chapter.number}. ${verses[0]?.text.substring(0, 100)}...`} />
            </Head>

            <div className={cn(
                "mx-auto py-8 px-4 md:px-8 relative transition-all duration-500 ease-in-out",
                zenMode ? "max-w-3xl pt-12" : "max-w-4xl"
            )}>
                {/* Navigation Header */}
                <div className={cn(
                    "flex flex-col md:flex-row justify-between items-center mb-12 border-b border-border/50 pb-6 transition-opacity duration-300",
                    zenMode && "opacity-20 hover:opacity-100"
                )}>
                    <Sheet open={navOpen} onOpenChange={setNavOpen}>
                        <SheetTrigger asChild>
                            <button className="flex items-center gap-2 text-sm uppercase tracking-widest mb-4 md:mb-0 hover:text-primary transition-colors group">
                                <BookOpen className="h-4 w-4 text-primary" />
                                <span className="font-medium">Books</span>
                                <span className="text-muted-foreground">/</span>
                                <span className="font-bold text-primary">{book.name}</span>
                                <span className="text-muted-foreground">/</span>
                                <span className="font-medium">Ch. {chapter.number}</span>
                                <ChevronDown className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                            </button>
                        </SheetTrigger>
                        <SheetContent side="left" className="w-[320px] sm:w-[400px] p-0">
                            <SheetHeader className="p-6 border-b">
                                <SheetTitle className="text-left font-serif">Scripture Navigation</SheetTitle>
                            </SheetHeader>
                            <ScrollArea className="h-[calc(100vh-80px)]">
                                <div className="p-4">
                                    {/* Old Testament */}
                                    <div className="mb-6">
                                        <h3 className="text-xs uppercase tracking-widest text-muted-foreground mb-3 px-2">Old Testament</h3>
                                        {allBooks.filter(b => b.position <= 39).map((navBook) => (
                                            <div key={navBook.id} className="mb-1">
                                                <button
                                                    onClick={() => setExpandedBook(expandedBook === navBook.abbreviation ? null : navBook.abbreviation)}
                                                    className={cn(
                                                        "w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors",
                                                        navBook.abbreviation === book.abbreviation
                                                            ? "bg-primary/10 text-primary font-medium"
                                                            : "hover:bg-muted"
                                                    )}
                                                >
                                                    <span>{navBook.name}</span>
                                                    <ChevronRight className={cn(
                                                        "h-4 w-4 transition-transform",
                                                        expandedBook === navBook.abbreviation && "rotate-90"
                                                    )} />
                                                </button>
                                                {expandedBook === navBook.abbreviation && (
                                                    <div className="grid grid-cols-6 gap-1 p-2 ml-2 border-l border-border">
                                                        {Array.from({ length: navBook.chapters_count }, (_, i) => i + 1).map((chNum) => (
                                                            <Link
                                                                key={chNum}
                                                                href={`/bible/${navBook.abbreviation}/${chNum}`}
                                                                onClick={() => setNavOpen(false)}
                                                                className={cn(
                                                                    "w-8 h-8 flex items-center justify-center rounded text-xs font-medium transition-colors",
                                                                    navBook.abbreviation === book.abbreviation && chNum === chapter.number
                                                                        ? "bg-primary text-primary-foreground"
                                                                        : "hover:bg-muted"
                                                                )}
                                                            >
                                                                {chNum}
                                                            </Link>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>

                                    {/* New Testament */}
                                    <div>
                                        <h3 className="text-xs uppercase tracking-widest text-muted-foreground mb-3 px-2">New Testament</h3>
                                        {allBooks.filter(b => b.position > 39).map((navBook) => (
                                            <div key={navBook.id} className="mb-1">
                                                <button
                                                    onClick={() => setExpandedBook(expandedBook === navBook.abbreviation ? null : navBook.abbreviation)}
                                                    className={cn(
                                                        "w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors",
                                                        navBook.abbreviation === book.abbreviation
                                                            ? "bg-primary/10 text-primary font-medium"
                                                            : "hover:bg-muted"
                                                    )}
                                                >
                                                    <span>{navBook.name}</span>
                                                    <ChevronRight className={cn(
                                                        "h-4 w-4 transition-transform",
                                                        expandedBook === navBook.abbreviation && "rotate-90"
                                                    )} />
                                                </button>
                                                {expandedBook === navBook.abbreviation && (
                                                    <div className="grid grid-cols-6 gap-1 p-2 ml-2 border-l border-border">
                                                        {Array.from({ length: navBook.chapters_count }, (_, i) => i + 1).map((chNum) => (
                                                            <Link
                                                                key={chNum}
                                                                href={`/bible/${navBook.abbreviation}/${chNum}`}
                                                                onClick={() => setNavOpen(false)}
                                                                className={cn(
                                                                    "w-8 h-8 flex items-center justify-center rounded text-xs font-medium transition-colors",
                                                                    navBook.abbreviation === book.abbreviation && chNum === chapter.number
                                                                        ? "bg-primary text-primary-foreground"
                                                                        : "hover:bg-muted"
                                                                )}
                                                            >
                                                                {chNum}
                                                            </Link>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </ScrollArea>
                        </SheetContent>
                    </Sheet>

                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleBookmarkClick}
                            className={cn("hover:text-primary transition-colors", isBookmarked && "text-primary fill-primary")}
                            title={isBookmarked ? "Edit Bookmark Note" : "Bookmark Chapter"}
                        >
                            <Bookmark className={cn("h-5 w-5", isBookmarked && "fill-current")} />
                        </Button>

                        <div className="flex items-center gap-2 border-l border-border pl-4">
                            <button onClick={() => setFontSize(Math.max(14, fontSize - 2))} className="text-lg font-serif hover:text-primary w-8 h-8 flex items-center justify-center transition-colors">A-</button>
                            <button onClick={() => setFontSize(Math.min(32, fontSize + 2))} className="text-lg font-serif hover:text-primary w-8 h-8 flex items-center justify-center transition-colors">A+</button>
                        </div>

                        <div className="border-l border-border pl-4">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setZenMode(!zenMode)}
                                title={zenMode ? "Exit Zen Mode" : "Enter Zen Mode"}
                                className="hover:text-primary transition-colors"
                            >
                                {zenMode ? <Minimize className="h-5 w-5" /> : <Expand className="h-5 w-5" />}
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Chapter Navigation */}
                <div className={cn(
                    "flex justify-between items-center mb-12 transition-opacity duration-300",
                    zenMode && "opacity-0 hover:opacity-100"
                )}>
                    {prev_link ? (
                        <Link
                            href={prev_link}
                            className="text-xs uppercase tracking-widest hover:text-primary flex items-center gap-2 text-muted-foreground transition-colors"
                        >
                            &larr; Previous
                        </Link>
                    ) : (
                        <div className="w-20"></div>
                    )}

                    <h1 className="font-serif text-5xl md:text-6xl text-center text-foreground/90 font-medium tracking-tight">
                        <span className="text-2xl md:text-3xl block mb-2 text-muted-foreground italic font-normal">Chapter</span>
                        {chapter.number}
                    </h1>

                    {next_link ? (
                        <Link
                            href={next_link}
                            className="text-xs uppercase tracking-widest hover:text-primary flex items-center gap-2 text-muted-foreground transition-colors"
                        >
                            Next &rarr;
                        </Link>
                    ) : (
                        <div className="w-20"></div>
                    )}
                </div>

                {/* Verses */}
                <div
                    className={cn(
                        "prose prose-lg dark:prose-invert max-w-none font-serif leading-loose text-justify text-foreground/80 selection:bg-primary/20",
                        zenMode && "prose-xl leading-relaxed"
                    )}
                    style={{ fontSize: `${fontSize}px` }}
                >
                    {verses.map((verse, index) => {
                        const highlight = userInteractions.highlights[verse.id];
                        const isFavorited = !!userInteractions.favorites[verse.id];
                        const isSelected = selectedVerseId === verse.id;
                        const isFirstVerse = verse.number === 1;
                        const hasNote = highlight?.note || userInteractions.favorites[verse.id]?.note;

                        return (
                            <span
                                key={verse.id}
                                id={`verse-${verse.number}`}
                                onClick={() => setSelectedVerseId(isSelected ? null : verse.id)}
                                className={cn(
                                    "relative inline transition-colors duration-200 cursor-pointer select-text decoration-clone p-0.5 rounded box-decoration-clone",
                                    highlight ? getHighlightColor(highlight.color) : "hover:bg-black/5 dark:hover:bg-white/5",
                                    isSelected && "bg-black/10 dark:bg-white/10",
                                    highlightedVerseNum === verse.number && "ring-2 ring-primary ring-offset-2 bg-primary/10 animate-pulse"
                                )}
                            >
                                <sup className={cn(
                                    "text-[0.6em] text-primary/40 mr-1 select-none font-sans font-bold align-top relative top-[-0.2em] transition-opacity",
                                    isFirstVerse && "hidden" // Hide verse number 1 for drop cap effect
                                )}>
                                    {verse.number}
                                    {isFavorited && <Heart className="inline-block h-2 w-2 ml-0.5 text-red-500 fill-red-500" />}
                                    {hasNote && <MessageSquare className="inline-block h-2 w-2 ml-0.5 text-blue-500 fill-blue-500" />}
                                </sup>

                                <span className={cn(
                                    isFirstVerse && "float-left text-7xl leading-[0.8] pr-3 pt-1 font-bold text-primary font-serif",
                                )}>
                                    {isFirstVerse ? verse.text.charAt(0) : ''}
                                </span>

                                <span>
                                    {isFirstVerse ? verse.text.substring(1) : verse.text}{' '}
                                </span>

                                {/* Floating Toolbar for Selected Verse */}
                                {isSelected && (
                                    <div
                                        className="absolute z-10 bottom-full left-1/2 -translate-x-1/2 mb-3 bg-popover text-popover-foreground shadow-xl border border-border rounded-full p-1.5 flex items-center gap-1 animate-in fade-in slide-in-from-bottom-2 zoom-in-95 duration-200 whitespace-nowrap"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <div className="flex gap-1 pr-2 border-r border-border mr-1">
                                            {['yellow', 'green', 'blue', 'pink'].map((c) => (
                                                <button
                                                    key={c}
                                                    onClick={() => handleHighlight(c)}
                                                    className={cn(
                                                        "w-6 h-6 rounded-full border border-black/10 hover:scale-110 transition-transform shadow-sm",
                                                        c === 'yellow' && "bg-yellow-200",
                                                        c === 'green' && "bg-green-200",
                                                        c === 'blue' && "bg-blue-200",
                                                        c === 'pink' && "bg-pink-200",
                                                        highlight?.color === c && "ring-2 ring-primary ring-offset-2"
                                                    )}
                                                    title={`Highlight ${c}`}
                                                />
                                            ))}
                                        </div>
                                        <button
                                            onClick={handleFavorite}
                                            className={cn("p-2 rounded-full hover:bg-muted transition-colors", isFavorited ? "text-red-500" : "text-muted-foreground")}
                                            title={isFavorited ? "Remove from Favorites" : "Add to Favorites"}
                                        >
                                            <Heart className={cn("h-4 w-4", isFavorited && "fill-current")} />
                                        </button>
                                        <button
                                            onClick={() => openVerseNoteDialog(verse.id)}
                                            className={cn("p-2 rounded-full hover:bg-muted transition-colors", hasNote ? "text-blue-500" : "text-muted-foreground")}
                                            title="Add/Edit Note"
                                        >
                                            <MessageSquare className={cn("h-4 w-4", hasNote && "fill-current")} />
                                        </button>
                                        <button
                                            onClick={() => setSelectedVerseId(null)}
                                            className="p-2 rounded-full hover:bg-muted text-muted-foreground transition-colors"
                                            title="Close"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>
                                )}
                            </span>
                        );
                    })}
                </div>

                {/* Bottom Navigation */}
                <div className={cn(
                    "flex justify-between items-center mt-16 pt-12 border-t border-border/50 transition-opacity duration-300",
                    zenMode && "opacity-20 hover:opacity-100"
                )}>
                    {prev_link ? (
                        <Link
                            href={prev_link}
                            className="group flex flex-col items-start"
                        >
                            <span className="text-xs uppercase tracking-widest text-muted-foreground mb-1 group-hover:text-primary transition-colors">&larr; Previous</span>
                            <span className="font-serif text-lg group-hover:text-primary transition-colors">Chapter {chapter.number - 1 > 0 ? chapter.number - 1 : 'Book'}</span>
                        </Link>
                    ) : (
                        <div></div>
                    )}

                    {next_link ? (
                        <Link
                            href={next_link}
                            className="group flex flex-col items-end"
                        >
                            <span className="text-xs uppercase tracking-widest text-muted-foreground mb-1 group-hover:text-primary transition-colors">Next &rarr;</span>
                            <span className="font-serif text-lg group-hover:text-primary transition-colors">Chapter {chapter.number + 1}</span>
                        </Link>
                    ) : (
                        <div></div>
                    )}
                </div>
            </div>

            <Dialog open={noteDialog.isOpen} onOpenChange={(open) => setNoteDialog({ ...noteDialog, isOpen: open })}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {noteDialog.type === 'bookmark' && 'Bookmark Note'}
                            {noteDialog.type === 'highlight' && 'Highlight Note'}
                            {noteDialog.type === 'favorite' && 'Favorite Note'}
                        </DialogTitle>
                        <DialogDescription>
                            Add a personal note or reflection.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="note">Note</Label>
                            <Textarea
                                id="note"
                                value={noteContent}
                                onChange={(e) => setNoteContent(e.target.value)}
                                placeholder="Enter your thoughts here..."
                                className="min-h-[120px]"
                            />
                        </div>
                    </div>

                    <DialogFooter className="sm:justify-between">
                        {noteDialog.type === 'bookmark' ? (
                            <Button
                                type="button"
                                variant="destructive"
                                onClick={() => {
                                    setNoteDialog({ ...noteDialog, isOpen: false });
                                    router.post('/bible/bookmark', {
                                        book_id: book.id,
                                        chapter_id: chapter.id,
                                    }, { preserveScroll: true });
                                }}
                            >
                                Remove Bookmark
                            </Button>
                        ) : (
                            <div></div>
                        )}
                        <div className="flex gap-2">
                            <Button variant="secondary" onClick={() => setNoteDialog({ ...noteDialog, isOpen: false })}>
                                Cancel
                            </Button>
                            <Button onClick={handleSaveNote}>
                                Save Note
                            </Button>
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </BibleLayout>
    );
}
