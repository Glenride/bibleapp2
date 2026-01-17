import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Lesson, Sermon } from '@/types/bible';
import { Head, Link, useForm, router, usePage } from '@inertiajs/react';
import { Sparkles, Trash2, FileText, Library, Loader2, Check, Heart, Highlighter, Plus } from 'lucide-react';
import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Lessons & Sermons', href: '/lessons' },
];

interface SourceItem {
    id: number;
    verse_id: number;
    reference: string;
    text: string;
    note: string | null;
    type: 'highlight' | 'favorite';
    color?: string;
}

interface Props {
    lessons: Lesson[];
    sermons: Sermon[];
    highlights: SourceItem[];
    favorites: SourceItem[];
}

function SelectableSourceItem({
    item,
    isSelected,
    onToggle,
}: {
    item: SourceItem;
    isSelected: boolean;
    onToggle: () => void;
}) {
    return (
        <div
            onClick={(e) => {
                e.stopPropagation();
                onToggle();
            }}
            className={`p-3 rounded-lg cursor-pointer transition-colors ${isSelected
                ? 'bg-primary/10 border border-primary/30'
                : 'bg-muted/30 hover:bg-muted/50 border border-transparent'
                }`}
        >
            <div className="flex items-start gap-3">
                <div className={`mt-0.5 pointer-events-none flex size-4 shrink-0 items-center justify-center rounded-[4px] border shadow-xs transition-shadow ${isSelected
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'border-input'
                    }`}>
                    {isSelected && <Check size={14} strokeWidth={3} />}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">{item.reference}</span>
                        {item.type === 'favorite' ? (
                            <Heart size={12} className="text-red-500 fill-red-500" />
                        ) : (
                            <span
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: item.color || '#fef08a' }}
                            />
                        )}
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">{item.text}</p>
                    {item.note && (
                        <p className="text-xs text-primary mt-1 italic">Note: {item.note}</p>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function LessonsIndex({ lessons, sermons, highlights, favorites }: Props) {
    const [showLessonDialog, setShowLessonDialog] = useState(false);
    const [showSermonDialog, setShowSermonDialog] = useState(false);
    const [showCombineDialog, setShowCombineDialog] = useState(false);
    const [selectedHighlights, setSelectedHighlights] = useState<number[]>([]);
    const [selectedFavorites, setSelectedFavorites] = useState<number[]>([]);
    const [selectedLessons, setSelectedLessons] = useState<number[]>([]);
    const [isGeneratingLesson, setIsGeneratingLesson] = useState(false);

    const lessonForm = useForm({
        theme: '',
        highlight_ids: [] as number[],
        favorite_ids: [] as number[],
    });

    const sermonForm = useForm({
        title: '',
        description: '',
        lesson_count: 3,
    });

    const combineForm = useForm({
        title: '',
        description: '',
        lesson_ids: [] as number[],
    });

    const toggleHighlight = useCallback((id: number) => {
        setSelectedHighlights(prev =>
            prev.includes(id) ? prev.filter(h => h !== id) : [...prev, id]
        );
    }, []);

    const toggleFavorite = useCallback((id: number) => {
        setSelectedFavorites(prev =>
            prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
        );
    }, []);

    const toggleLesson = useCallback((id: number) => {
        setSelectedLessons(prev =>
            prev.includes(id) ? prev.filter(l => l !== id) : [...prev, id]
        );
    }, []);

    const selectAllHighlights = useCallback(() => {
        setSelectedHighlights(prev =>
            prev.length === highlights.length ? [] : highlights.map(h => h.id)
        );
    }, [highlights]);

    const selectAllFavorites = useCallback(() => {
        setSelectedFavorites(prev =>
            prev.length === favorites.length ? [] : favorites.map(f => f.id)
        );
    }, [favorites]);

    const generateLesson = (e: React.FormEvent) => {
        e.preventDefault();
        setIsGeneratingLesson(true);

        // Use router.post directly with the correct data
        router.post('/lessons/generate', {
            theme: lessonForm.data.theme,
            highlight_ids: selectedHighlights,
            favorite_ids: selectedFavorites,
        }, {
            onSuccess: () => {
                setShowLessonDialog(false);
                lessonForm.reset();
                setSelectedHighlights([]);
                setSelectedFavorites([]);
            },
            onFinish: () => {
                setIsGeneratingLesson(false);
            },
        });
    };

    const generateSermon = (e: React.FormEvent) => {
        e.preventDefault();
        sermonForm.post('/sermons/generate', {
            onSuccess: () => {
                setShowSermonDialog(false);
                sermonForm.reset();
            },
        });
    };

    const combineLessons = (e: React.FormEvent) => {
        e.preventDefault();
        combineForm.transform((data) => ({
            ...data,
            lesson_ids: selectedLessons,
        }));
        combineForm.post('/sermons/from-lessons', {
            onSuccess: () => {
                setShowCombineDialog(false);
                combineForm.reset();
                setSelectedLessons([]);
            },
        });
    };

    const deleteLesson = (id: number) => {
        if (confirm('Are you sure you want to delete this lesson?')) {
            router.delete(`/lessons/${id}`);
        }
    };

    const deleteSermon = (id: number) => {
        if (confirm('Are you sure you want to delete this sermon and all its lessons?')) {
            router.delete(`/sermons/${id}`);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Lessons & Sermons" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4 md:p-8">

                {/* Header */}
                <div className="rounded-xl border border-sidebar-border/70 dark:border-sidebar-border p-8 bg-card shadow-sm">
                    <h2 className="text-2xl font-serif font-bold mb-4">AI Bible Study</h2>
                    <p className="max-w-2xl text-muted-foreground leading-relaxed">
                        Transform your highlights, favorites, and notes into personalized Bible study lessons using AI.
                        Combine lessons into sermons to create complete Bible studies you can share with friends.
                    </p>
                    <div className="mt-6 flex flex-wrap gap-3">
                        <Dialog open={showLessonDialog} onOpenChange={(open) => {
                            setShowLessonDialog(open);
                            if (!open) {
                                setSelectedHighlights([]);
                                setSelectedFavorites([]);
                            }
                        }}>
                            <DialogTrigger asChild>
                                <Button type="button" className="gap-2">
                                    <Sparkles size={16} />
                                    Generate Lesson
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col min-h-0">
                                <form onSubmit={generateLesson} className="flex flex-col flex-1 overflow-hidden min-h-0">
                                    <DialogHeader>
                                        <DialogTitle>Generate a Lesson</DialogTitle>
                                        <DialogDescription>
                                            Select verses from your highlights and favorites to include in your lesson.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="flex flex-col gap-4 py-4 flex-1 overflow-hidden min-h-0">
                                        <div className="grid gap-2">
                                            <Label htmlFor="theme">Theme (Optional)</Label>
                                            <Input
                                                id="theme"
                                                placeholder="e.g., Faith, Love, Forgiveness..."
                                                value={lessonForm.data.theme}
                                                onChange={(e) => lessonForm.setData('theme', e.target.value)}
                                            />
                                        </div>

                                        <Tabs defaultValue="highlights" className="flex-1 flex flex-col overflow-hidden min-h-0">
                                            <TabsList className="w-full">
                                                <TabsTrigger value="highlights" className="flex-1 gap-2">
                                                    <Highlighter size={14} />
                                                    Highlights ({selectedHighlights.length}/{highlights.length})
                                                </TabsTrigger>
                                                <TabsTrigger value="favorites" className="flex-1 gap-2">
                                                    <Heart size={14} />
                                                    Favorites ({selectedFavorites.length}/{favorites.length})
                                                </TabsTrigger>
                                            </TabsList>
                                            <TabsContent value="highlights" className="flex-1 overflow-hidden min-h-0">
                                                <div className="border rounded-lg overflow-hidden h-full flex flex-col">
                                                    <div className="p-2 bg-muted/50 border-b flex justify-between items-center">
                                                        <span className="text-sm text-muted-foreground">
                                                            {highlights.length > 0 ? 'Select verses to include' : 'No highlights yet'}
                                                        </span>
                                                        {highlights.length > 0 && (
                                                            <Button type="button" variant="ghost" size="sm" onClick={selectAllHighlights}>
                                                                {selectedHighlights.length === highlights.length ? 'Deselect All' : 'Select All'}
                                                            </Button>
                                                        )}
                                                    </div>
                                                    <ScrollArea className="flex-1 min-h-0">
                                                        <div className="p-2 space-y-1">
                                                            {highlights.map((item) => (
                                                                <SelectableSourceItem
                                                                    key={item.id}
                                                                    item={item}
                                                                    isSelected={selectedHighlights.includes(item.id)}
                                                                    onToggle={() => toggleHighlight(item.id)}
                                                                />
                                                            ))}
                                                        </div>
                                                    </ScrollArea>
                                                </div>
                                            </TabsContent>
                                            <TabsContent value="favorites" className="flex-1 overflow-hidden min-h-0">
                                                <div className="border rounded-lg overflow-hidden h-full flex flex-col">
                                                    <div className="p-2 bg-muted/50 border-b flex justify-between items-center">
                                                        <span className="text-sm text-muted-foreground">
                                                            {favorites.length > 0 ? 'Select verses to include' : 'No favorites yet'}
                                                        </span>
                                                        {favorites.length > 0 && (
                                                            <Button type="button" variant="ghost" size="sm" onClick={selectAllFavorites}>
                                                                {selectedFavorites.length === favorites.length ? 'Deselect All' : 'Select All'}
                                                            </Button>
                                                        )}
                                                    </div>
                                                    <ScrollArea className="flex-1 min-h-0">
                                                        <div className="p-2 space-y-1">
                                                            {favorites.map((item) => (
                                                                <SelectableSourceItem
                                                                    key={item.id}
                                                                    item={item}
                                                                    isSelected={selectedFavorites.includes(item.id)}
                                                                    onToggle={() => toggleFavorite(item.id)}
                                                                />
                                                            ))}
                                                        </div>
                                                    </ScrollArea>
                                                </div>
                                            </TabsContent>
                                        </Tabs>

                                        <p className="text-xs text-muted-foreground">
                                            {selectedHighlights.length + selectedFavorites.length === 0
                                                ? 'Leave empty to use all your saved verses.'
                                                : `${selectedHighlights.length + selectedFavorites.length} verse(s) selected.`}
                                        </p>

                                        {usePage().props.errors.error && (
                                            <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                                                {usePage().props.errors.error}
                                            </div>
                                        )}
                                    </div>
                                    <DialogFooter>
                                        <Button type="submit" disabled={isGeneratingLesson}>
                                            {isGeneratingLesson && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                            Generate Lesson
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>

                        <Dialog open={showSermonDialog} onOpenChange={setShowSermonDialog}>
                            <DialogTrigger asChild>
                                <Button type="button" variant="outline" className="gap-2">
                                    <Library size={16} />
                                    Create Sermon
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <form onSubmit={generateSermon}>
                                    <DialogHeader>
                                        <DialogTitle>Create a Sermon</DialogTitle>
                                        <DialogDescription>
                                            Generate a complete Bible study with multiple lessons you can share.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="grid gap-4 py-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="title">Sermon Title</Label>
                                            <Input
                                                id="title"
                                                placeholder="e.g., Walking in Faith"
                                                value={sermonForm.data.title}
                                                onChange={(e) => sermonForm.setData('title', e.target.value)}
                                                required
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="description">Description (Optional)</Label>
                                            <Textarea
                                                id="description"
                                                placeholder="What is this Bible study about?"
                                                value={sermonForm.data.description}
                                                onChange={(e) => sermonForm.setData('description', e.target.value)}
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="lesson_count">Number of Lessons</Label>
                                            <Input
                                                id="lesson_count"
                                                type="number"
                                                min={1}
                                                max={10}
                                                value={sermonForm.data.lesson_count}
                                                onChange={(e) => sermonForm.setData('lesson_count', parseInt(e.target.value))}
                                            />
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button type="submit" disabled={sermonForm.processing}>
                                            {sermonForm.processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                            Generate Sermon
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Sermons Section */}
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-2 bg-primary/10 rounded-lg text-primary">
                                <Library size={20} />
                            </div>
                            <h3 className="font-semibold text-lg">My Sermons</h3>
                        </div>

                        <div className="flex flex-col gap-3">
                            {sermons.length > 0 ? (
                                sermons.map((sermon) => (
                                    <div key={sermon.id} className="rounded-lg border border-border bg-card shadow-sm overflow-hidden group">
                                        <Link
                                            href={`/sermons/${sermon.id}`}
                                            className="p-4 block hover:bg-muted/50 transition-colors"
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="font-serif font-bold group-hover:text-primary transition-colors">
                                                    {sermon.title}
                                                </span>
                                                <span className="text-xs text-muted-foreground">{formatDate(sermon.created_at)}</span>
                                            </div>
                                            {sermon.description && (
                                                <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                                                    {sermon.description}
                                                </p>
                                            )}
                                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                                <span className="flex items-center gap-1">
                                                    <FileText size={12} />
                                                    {sermon.lessons?.length || 0} lessons
                                                </span>
                                                {sermon.is_public && (
                                                    <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-0.5 rounded">
                                                        Public
                                                    </span>
                                                )}
                                            </div>
                                        </Link>
                                        <div className="px-4 pb-3 flex justify-end">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => deleteSermon(sermon.id)}
                                                className="text-destructive hover:text-destructive"
                                            >
                                                <Trash2 size={14} />
                                            </Button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-8 text-center border border-dashed border-border rounded-lg text-muted-foreground text-sm">
                                    No sermons yet. Create your first Bible study!
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Standalone Lessons Section */}
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg text-yellow-600 dark:text-yellow-400">
                                    <FileText size={20} />
                                </div>
                                <h3 className="font-semibold text-lg">Standalone Lessons</h3>
                            </div>
                            {selectedLessons.length > 0 && (
                                <Dialog open={showCombineDialog} onOpenChange={(open) => {
                                    setShowCombineDialog(open);
                                    if (!open) setSelectedLessons([]);
                                }}>
                                    <DialogTrigger asChild>
                                        <Button size="sm" className="gap-2">
                                            <Plus size={14} />
                                            Combine ({selectedLessons.length})
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <form onSubmit={combineLessons}>
                                            <DialogHeader>
                                                <DialogTitle>Create Sermon from Lessons</DialogTitle>
                                                <DialogDescription>
                                                    Combine {selectedLessons.length} selected lesson(s) into a shareable sermon.
                                                </DialogDescription>
                                            </DialogHeader>
                                            <div className="grid gap-4 py-4">
                                                <div className="grid gap-2">
                                                    <Label htmlFor="combine-title">Sermon Title</Label>
                                                    <Input
                                                        id="combine-title"
                                                        placeholder="e.g., Walking in Faith"
                                                        value={combineForm.data.title}
                                                        onChange={(e) => combineForm.setData('title', e.target.value)}
                                                        required
                                                    />
                                                </div>
                                                <div className="grid gap-2">
                                                    <Label htmlFor="combine-description">Description (Optional)</Label>
                                                    <Textarea
                                                        id="combine-description"
                                                        placeholder="What is this Bible study about?"
                                                        value={combineForm.data.description}
                                                        onChange={(e) => combineForm.setData('description', e.target.value)}
                                                    />
                                                </div>
                                                <div className="border rounded-lg p-3 bg-muted/30">
                                                    <p className="text-sm font-medium mb-2">Selected Lessons:</p>
                                                    <ul className="text-sm text-muted-foreground space-y-1">
                                                        {lessons.filter(l => selectedLessons.includes(l.id)).map(l => (
                                                            <li key={l.id} className="flex items-center gap-2">
                                                                <Check size={12} className="text-primary" />
                                                                {l.title}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </div>
                                            <DialogFooter>
                                                <Button type="submit" disabled={combineForm.processing}>
                                                    {combineForm.processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                    Create Sermon
                                                </Button>
                                            </DialogFooter>
                                        </form>
                                    </DialogContent>
                                </Dialog>
                            )}
                        </div>

                        <div className="flex flex-col gap-3">
                            {lessons.length > 0 ? (
                                lessons.map((lesson) => (
                                    <div
                                        key={lesson.id}
                                        className={`rounded-lg border bg-card shadow-sm overflow-hidden group ${selectedLessons.includes(lesson.id)
                                            ? 'border-primary/50 ring-1 ring-primary/20'
                                            : 'border-border'
                                            }`}
                                    >
                                        <div className="flex items-start">
                                            <button
                                                type="button"
                                                onClick={() => toggleLesson(lesson.id)}
                                                className="p-4 flex items-center justify-center"
                                            >
                                                <Checkbox
                                                    checked={selectedLessons.includes(lesson.id)}
                                                    className="mt-0.5"
                                                />
                                            </button>
                                            <Link
                                                href={`/lessons/${lesson.id}`}
                                                className="flex-1 p-4 pl-0 block hover:bg-muted/50 transition-colors"
                                            >
                                                <div className="flex justify-between items-start mb-2">
                                                    <span className="font-serif font-bold group-hover:text-primary transition-colors">
                                                        {lesson.title}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground">{formatDate(lesson.created_at)}</span>
                                                </div>
                                                {lesson.theme && (
                                                    <span className="inline-block bg-muted px-2 py-0.5 rounded text-xs text-muted-foreground mb-2">
                                                        {lesson.theme}
                                                    </span>
                                                )}
                                                <p className="text-sm text-muted-foreground line-clamp-2">
                                                    {lesson.content.substring(0, 150)}...
                                                </p>
                                            </Link>
                                        </div>
                                        <div className="px-4 pb-3 flex justify-end">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => deleteLesson(lesson.id)}
                                                className="text-destructive hover:text-destructive"
                                            >
                                                <Trash2 size={14} />
                                            </Button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-8 text-center border border-dashed border-border rounded-lg text-muted-foreground text-sm">
                                    No standalone lessons yet. Generate your first lesson above!
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
