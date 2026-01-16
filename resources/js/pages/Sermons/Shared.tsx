import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Sermon } from '@/types/bible';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, FileText, Globe, User } from 'lucide-react';

interface Props {
    sermon: Sermon;
    isOwner: boolean;
}

export default function SermonShared({ sermon, isOwner }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Shared Sermon', href: '#' },
    ];

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={sermon.title} />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4 md:p-8">
                
                <div className="flex items-center justify-between flex-wrap gap-4">
                    {isOwner ? (
                        <Link 
                            href={`/sermons/${sermon.id}`}
                            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <ArrowLeft size={16} />
                            View Full Sermon
                        </Link>
                    ) : (
                        <Link 
                            href="/"
                            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <ArrowLeft size={16} />
                            Back to Bible
                        </Link>
                    )}
                </div>

                <div className="rounded-xl border border-sidebar-border/70 dark:border-sidebar-border p-8 bg-card shadow-sm max-w-4xl">
                    <header className="mb-6">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                            <User size={14} />
                            Shared by {sermon.user?.name || 'Anonymous'}
                        </div>
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

                    <div className="border-t pt-6">
                        <h2 className="font-semibold mb-4">Lessons</h2>
                        <div className="space-y-3">
                            {sermon.lessons && sermon.lessons.length > 0 ? (
                                sermon.lessons.map((lesson, index) => (
                                    <Link 
                                        key={lesson.id}
                                        href={`/lessons/${lesson.id}`}
                                        className="block p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors group"
                                    >
                                        <div className="flex items-start gap-4">
                                            <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-sm">
                                                {index + 1}
                                            </span>
                                            <div className="flex-1 min-w-0">
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
                                            </div>
                                        </div>
                                    </Link>
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
