import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Sermon } from '@/types/bible';
import { Head, Link } from '@inertiajs/react';
import { FileText, User, Library } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Lessons & Sermons', href: '/lessons' },
    { title: 'Shared With Me', href: '/shared-with-me' },
];

interface Props {
    sermons: Sermon[];
}

export default function SharedWithMe({ sermons }: Props) {
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Shared With Me" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4 md:p-8">
                
                <div className="rounded-xl border border-sidebar-border/70 dark:border-sidebar-border p-8 bg-card shadow-sm">
                    <h2 className="text-2xl font-serif font-bold mb-4">Shared With Me</h2>
                    <p className="max-w-2xl text-muted-foreground leading-relaxed">
                        Bible studies that friends have shared with you.
                    </p>
                </div>

                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="p-2 bg-primary/10 rounded-lg text-primary">
                            <Library size={20} />
                        </div>
                        <h3 className="font-semibold text-lg">Sermons</h3>
                    </div>

                    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                        {sermons.length > 0 ? (
                            sermons.map((sermon) => (
                                <div key={sermon.id} className="rounded-lg border border-border bg-card shadow-sm overflow-hidden group">
                                    <Link 
                                        href={`/shared/${sermon.share_token}`}
                                        className="p-4 block hover:bg-muted/50 transition-colors"
                                    >
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                                            <User size={12} />
                                            {sermon.user?.name || 'Anonymous'}
                                        </div>
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="font-serif font-bold group-hover:text-primary transition-colors">
                                                {sermon.title}
                                            </span>
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
                                            <span>{formatDate(sermon.created_at)}</span>
                                        </div>
                                    </Link>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-full p-8 text-center border border-dashed border-border rounded-lg text-muted-foreground text-sm">
                                No one has shared any sermons with you yet.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
