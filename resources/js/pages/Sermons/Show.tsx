import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Sermon, Lesson } from '@/types/bible';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { ArrowLeft, Trash2, Share2, Globe, Lock, Copy, Check, FileText, Loader2, Plus, X, Sparkles } from 'lucide-react';
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Props {
    sermon: Sermon;
    isOwner: boolean;
    availableLessons: Lesson[];
}

export default function SermonShow({ sermon, isOwner, availableLessons }: Props) {
    const [showShareDialog, setShowShareDialog] = useState(false);
    const [showAddLessonDialog, setShowAddLessonDialog] = useState(false);
    const [copied, setCopied] = useState(false);
    const [selectedLessonId, setSelectedLessonId] = useState<string>('');

    const shareForm = useForm({
        email: '',
    });

    const addLessonForm = useForm({
        lesson_id: '',
    });

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Lessons & Sermons', href: '/lessons' },
        { title: sermon.title, href: `/sermons/${sermon.id}` },
    ];

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
        });
    };

    const deleteSermon = () => {
        if (confirm('Are you sure you want to delete this sermon and all its lessons?')) {
            router.delete(`/sermons/${sermon.id}`);
        }
    };

    const togglePublic = () => {
        router.post(`/sermons/${sermon.id}/toggle-public`);
    };

    const shareWithUser = (e: React.FormEvent) => {
        e.preventDefault();
        shareForm.post(`/sermons/${sermon.id}/share`, {
            onSuccess: () => {
                setShowShareDialog(false);
                shareForm.reset();
            },
        });
    };

    const copyShareLink = () => {
        const shareUrl = `${window.location.origin}/shared/${sermon.share_token}`;
        navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const addLesson = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedLessonId) return;
        router.post(`/sermons/${sermon.id}/add-lesson`, {
            lesson_id: parseInt(selectedLessonId),
        }, {
            onSuccess: () => {
                setShowAddLessonDialog(false);
                setSelectedLessonId('');
            },
        });
    };

    const removeLesson = (lessonId: number) => {
        if (confirm('Remove this lesson from the sermon? (The lesson will become standalone)')) {
            router.post(`/sermons/${sermon.id}/remove-lesson`, {
                lesson_id: lessonId,
            });
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={sermon.title} />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4 md:p-8">

                <div className="flex items-center justify-between flex-wrap gap-4">
                    <Link
                        href="/lessons"
                        className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <ArrowLeft size={16} />
                        Back to Lessons
                    </Link>

                    {isOwner && (
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={togglePublic}
                                className="gap-2"
                            >
                                {sermon.is_public ? <Lock size={14} /> : <Globe size={14} />}
                                {sermon.is_public ? 'Make Private' : 'Make Public'}
                            </Button>

                            <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
                                <DialogTrigger asChild>
                                    <Button variant="outline" size="sm" className="gap-2">
                                        <Share2 size={14} />
                                        Share
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Share Sermon</DialogTitle>
                                        <DialogDescription>
                                            Share this Bible study with friends on the platform or via link.
                                        </DialogDescription>
                                    </DialogHeader>

                                    <div className="space-y-4 py-4">
                                        <div className="space-y-2">
                                            <Label>Share Link</Label>
                                            <div className="flex gap-2">
                                                <Input
                                                    readOnly
                                                    value={`${window.location.origin}/shared/${sermon.share_token}`}
                                                    className="text-sm"
                                                />
                                                <Button variant="outline" size="icon" onClick={copyShareLink}>
                                                    {copied ? <Check size={16} /> : <Copy size={16} />}
                                                </Button>
                                            </div>
                                            <p className="text-xs text-muted-foreground">
                                                {sermon.is_public
                                                    ? 'Anyone with this link can view the sermon.'
                                                    : 'Only users you share with can view this sermon.'}
                                            </p>
                                        </div>

                                        <div className="border-t pt-4">
                                            <form onSubmit={shareWithUser} className="space-y-3">
                                                <Label>Share with a user</Label>
                                                <div className="flex gap-2">
                                                    <Input
                                                        type="email"
                                                        placeholder="friend@email.com"
                                                        value={shareForm.data.email}
                                                        onChange={(e) => shareForm.setData('email', e.target.value)}
                                                    />
                                                    <Button type="submit" disabled={shareForm.processing}>
                                                        {shareForm.processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                        Invite
                                                    </Button>
                                                </div>
                                                {shareForm.errors.email && (
                                                    <p className="text-sm text-destructive">{shareForm.errors.email}</p>
                                                )}
                                            </form>
                                        </div>
                                    </div>
                                </DialogContent>
                            </Dialog>

                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={deleteSermon}
                                className="text-destructive hover:text-destructive"
                            >
                                <Trash2 size={14} />
                            </Button>
                        </div>
                    )}
                </div>

                <div className="rounded-xl border border-sidebar-border/70 dark:border-sidebar-border p-8 bg-card shadow-sm max-w-4xl">
                    <header className="mb-6">
                        <h1 className="text-3xl font-serif font-bold mb-2">{sermon.title}</h1>
                        {sermon.description && (
                            <p className="text-muted-foreground mb-4">{sermon.description}</p>
                        )}
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>{formatDate(sermon.created_at)}</span>
                            <span className="flex items-center gap-1">
                                <FileText size={14} />
                                {sermon.lessons?.length || 0} lessons
                            </span>
                            {sermon.is_public && (
                                <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-0.5 rounded flex items-center gap-1">
                                    <Globe size={12} />
                                    Public
                                </span>
                            )}
                        </div>
                    </header>

                    {/* Sermon Analysis Section */}
                    {(sermon.detected_theme || sermon.analysis) && (
                        <div className="mb-8 p-6 bg-card border rounded-xl shadow-sm space-y-4">
                            <div className="flex items-center gap-2 mb-2">
                                <Sparkles className="text-primary" size={20} />
                                <h3 className="font-serif text-xl font-medium">Spiritual Culmination</h3>
                            </div>

                            {sermon.detected_theme && (
                                <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                                    Theme: {sermon.detected_theme}
                                </div>
                            )}

                            {sermon.analysis && (
                                <div className="prose dark:prose-invert max-w-none text-muted-foreground leading-relaxed">
                                    <ReactMarkdown>{sermon.analysis}</ReactMarkdown>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="border-t pt-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="font-semibold">Lessons</h2>
                            {isOwner && availableLessons && availableLessons.length > 0 && (
                                <Dialog open={showAddLessonDialog} onOpenChange={setShowAddLessonDialog}>
                                    <DialogTrigger asChild>
                                        <Button size="sm" variant="outline" className="gap-2">
                                            <Plus size={14} />
                                            Add Lesson
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <form onSubmit={addLesson}>
                                            <DialogHeader>
                                                <DialogTitle>Add Lesson to Sermon</DialogTitle>
                                                <DialogDescription>
                                                    Select a standalone lesson to add to this sermon.
                                                </DialogDescription>
                                            </DialogHeader>
                                            <div className="py-4">
                                                <Label htmlFor="lesson-select">Select Lesson</Label>
                                                <Select value={selectedLessonId} onValueChange={setSelectedLessonId}>
                                                    <SelectTrigger className="mt-2">
                                                        <SelectValue placeholder="Choose a lesson..." />
                                                    </SelectTrigger>
                                                    <SelectContent position="popper" className="z-[100]" side="bottom" sideOffset={4}>
                                                        {availableLessons.map((lesson) => (
                                                            <SelectItem key={lesson.id} value={lesson.id.toString()}>
                                                                {lesson.title}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <DialogFooter>
                                                <Button type="submit" disabled={!selectedLessonId}>
                                                    Add to Sermon
                                                </Button>
                                            </DialogFooter>
                                        </form>
                                    </DialogContent>
                                </Dialog>
                            )}
                        </div>
                        <div className="space-y-3">
                            {sermon.lessons && sermon.lessons.length > 0 ? (
                                sermon.lessons.map((lesson, index) => (
                                    <div
                                        key={lesson.id}
                                        className="p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors group"
                                    >
                                        <div className="flex items-start gap-4">
                                            <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-sm">
                                                {index + 1}
                                            </span>
                                            <Link
                                                href={`/lessons/${lesson.id}`}
                                                className="flex-1 min-w-0"
                                            >
                                                <h3 className="font-serif font-bold group-hover:text-primary transition-colors">
                                                    {lesson.title}
                                                </h3>
                                                {lesson.theme && (
                                                    <span className="inline-block bg-muted px-2 py-0.5 rounded text-xs text-muted-foreground mt-1">
                                                        {lesson.theme}
                                                    </span>
                                                )}
                                                <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                                                    {lesson.content.substring(0, 150)}...
                                                </p>
                                            </Link>
                                            {isOwner && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => removeLesson(lesson.id)}
                                                    className="text-muted-foreground hover:text-destructive flex-shrink-0"
                                                    title="Remove from sermon"
                                                >
                                                    <X size={16} />
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-muted-foreground text-center py-8">No lessons in this sermon yet.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
