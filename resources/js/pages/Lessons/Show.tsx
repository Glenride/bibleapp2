import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Lesson } from '@/types/bible';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Trash2, Calendar, Tag, Lightbulb, BookOpen, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ReactMarkdown from 'react-markdown';

interface Props {
    lesson: Lesson;
}

export default function LessonShow({ lesson }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Lessons & Sermons', href: '/lessons' },
        { title: lesson.title, href: `/lessons/${lesson.id}` },
    ];

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
        });
    };

    const deleteLesson = () => {
        if (confirm('Are you sure you want to delete this lesson?')) {
            router.delete(`/lessons/${lesson.id}`, {
                onSuccess: () => router.visit('/lessons'),
            });
        }
    };

    const hasStructuredContent = lesson.big_takeaway || lesson.movements?.length || lesson.reflection_questions?.length || lesson.prayer;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={lesson.title} />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4 md:p-8">

                <div className="flex items-center justify-between">
                    <Link
                        href={lesson.sermon_id ? `/sermons/${lesson.sermon_id}` : '/lessons'}
                        className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <ArrowLeft size={16} />
                        Back
                    </Link>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={deleteLesson}
                        className="text-destructive hover:text-destructive"
                    >
                        <Trash2 size={16} className="mr-2" />
                        Delete
                    </Button>
                </div>

                <article className="rounded-xl border border-sidebar-border/70 dark:border-sidebar-border p-8 bg-card shadow-sm max-w-4xl">
                    <header className="mb-8">
                        <h1 className="text-3xl font-serif font-bold mb-4">{lesson.title}</h1>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                                <Calendar size={14} />
                                {formatDate(lesson.created_at)}
                            </span>
                            {lesson.theme && (
                                <span className="flex items-center gap-1 bg-muted px-2 py-1 rounded">
                                    <Tag size={14} />
                                    {lesson.theme}
                                </span>
                            )}
                        </div>
                    </header>

                    {hasStructuredContent ? (
                        <div className="space-y-8">
                            {/* Big Takeaway */}
                            {lesson.big_takeaway && (
                                <div className="bg-primary/5 border-l-4 border-primary p-4 rounded-r-lg">
                                    <div className="flex items-start gap-3">
                                        <Lightbulb size={20} className="text-primary mt-0.5 shrink-0" />
                                        <p className="text-lg font-medium leading-relaxed">{lesson.big_takeaway}</p>
                                    </div>
                                </div>
                            )}

                            {/* Teaching Movements */}
                            {lesson.movements && lesson.movements.length > 0 && (
                                <div className="space-y-6">
                                    {lesson.movements.map((movement, index) => (
                                        <div key={index} className="border border-border rounded-lg overflow-hidden">
                                            <div className="bg-muted/50 px-4 py-3 border-b border-border">
                                                <div className="flex items-center gap-2">
                                                    <BookOpen size={16} className="text-muted-foreground" />
                                                    <h3 className="font-semibold">{movement.focus}</h3>
                                                </div>
                                            </div>
                                            <div className="p-4 space-y-4">
                                                <div className="prose prose-stone dark:prose-invert max-w-none prose-p:leading-relaxed">
                                                    {movement.teaching.split('\n\n').map((para, i) => (
                                                        <p key={i}>{para}</p>
                                                    ))}
                                                </div>
                                                {movement.practice && (
                                                    <div className="bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300 px-4 py-3 rounded-lg text-sm">
                                                        <span className="font-medium">Try this: </span>
                                                        {movement.practice}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Reflection Questions */}
                            {lesson.reflection_questions && lesson.reflection_questions.length > 0 && (
                                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-5">
                                    <div className="flex items-center gap-2 mb-3">
                                        <MessageCircle size={18} className="text-blue-600 dark:text-blue-400" />
                                        <h3 className="font-semibold text-blue-800 dark:text-blue-300">Reflect on these questions</h3>
                                    </div>
                                    <ul className="space-y-2">
                                        {lesson.reflection_questions.map((question, index) => (
                                            <li key={index} className="flex items-start gap-2 text-blue-700 dark:text-blue-300">
                                                <span className="font-medium">{index + 1}.</span>
                                                <span>{question}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Prayer */}
                            {lesson.prayer && (
                                <div className="border-t border-border pt-6">
                                    <p className="text-muted-foreground italic leading-relaxed whitespace-pre-line">
                                        {lesson.prayer}
                                    </p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="prose prose-stone dark:prose-invert max-w-none">
                            <ReactMarkdown>{lesson.content}</ReactMarkdown>
                        </div>
                    )}
                </article>
            </div>
        </AppLayout>
    );
}

