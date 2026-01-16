import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Lesson } from '@/types/bible';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Trash2, Calendar, Tag } from 'lucide-react';
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

                    <div className="prose prose-stone dark:prose-invert max-w-none">
                        <ReactMarkdown>{lesson.content}</ReactMarkdown>
                    </div>
                </article>
            </div>
        </AppLayout>
    );
}
