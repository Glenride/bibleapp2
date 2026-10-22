import BibleLayout from '@/layouts/bible-layout';
import { Head, Link } from '@inertiajs/react';

interface Book {
    id: number;
    name: string;
    abbreviation: string;
    position: number;
    image?: string;
    chapters_count?: number;
}

export default function Welcome({ oldTestament = [], newTestament = [] }: { oldTestament?: Book[], newTestament?: Book[] }) {
    return (
        <BibleLayout>
            <Head title="InspireWrite by Glenride — Read the Bible Online Free">
                <meta
                    name="description"
                    content="Read the Bible online free in a beautiful, distraction-free reader. Highlight verses, keep a spiritual journal, and build lessons and sermons with the Assistant."
                />
            </Head>

            {/* Hero Section */}
            <div className="relative bg-[#1a1a1a] text-white py-24 px-4 overflow-hidden">
                <div className="absolute inset-0 bg-black/40 z-10" />
                <div className="relative z-20 max-w-4xl mx-auto text-center">
                    <h1 className="font-serif text-5xl md:text-7xl font-bold mb-6 tracking-tight">Glenride Holy Bible</h1>
                    <p className="text-xl md:text-2xl text-white/80 max-w-2xl mx-auto mb-10 font-light">
                        A journaling companion for your spiritual walk. Read, reflect, and grow.
                    </p>
                    <div className="flex justify-center gap-4">
                        <Link href="/bible/gen/1" className="bg-white text-black px-8 py-3 rounded-full font-medium hover:bg-gray-200 transition-colors">
                            Start Reading
                        </Link>
                        <Link href="/dashboard" className="bg-transparent border border-white/30 text-white px-8 py-3 rounded-full font-medium hover:bg-white/10 transition-colors">
                            My Journal
                        </Link>
                    </div>
                </div>
            </div>

            {/* Index Section */}
            <div className="py-16 px-4 md:px-12 bg-background">
                <div className="max-w-7xl mx-auto">

                    {/* Old Testament */}
                    <section id="old-testament" className="mb-16 scroll-mt-24">
                        <div className="flex items-center gap-4 mb-8">
                            <h2 className="font-serif text-3xl font-bold uppercase tracking-widest text-[#733000] dark:text-[#e8a76f]">Old Testament</h2>
                            <div className="h-px bg-[#733000]/20 dark:bg-[#e8a76f]/25 flex-1" />
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                            {oldTestament.map((book) => (
                                <Link
                                    key={book.id}
                                    href={`/bible/${book.abbreviation}`}
                                    className="p-4 rounded-lg bg-card border border-border/50 hover:border-primary/50 hover:shadow-md transition-all group"
                                >
                                    <h3 className="font-serif font-medium text-lg group-hover:text-primary transition-colors">{book.name}</h3>
                                    {typeof book.chapters_count === 'number' && (
                                        <span className="text-xs text-muted-foreground mt-1">
                                            {book.chapters_count} chapter{book.chapters_count === 1 ? '' : 's'}
                                        </span>
                                    )}
                                </Link>
                            ))}
                        </div>
                    </section>

                    {/* New Testament */}
                    <section id="new-testament" className="scroll-mt-24">
                        <div className="flex items-center gap-4 mb-8">
                            <h2 className="font-serif text-3xl font-bold uppercase tracking-widest text-[#4B0600] dark:text-[#e08e6d]">New Testament</h2>
                            <div className="h-px bg-[#4B0600]/20 dark:bg-[#e08e6d]/25 flex-1" />
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                            {newTestament.map((book) => (
                                <Link
                                    key={book.id}
                                    href={`/bible/${book.abbreviation}`}
                                    className="p-4 rounded-lg bg-card border border-border/50 hover:border-primary/50 hover:shadow-md transition-all group"
                                >
                                    <h3 className="font-serif font-medium text-lg group-hover:text-primary transition-colors">{book.name}</h3>
                                    {typeof book.chapters_count === 'number' && (
                                        <span className="text-xs text-muted-foreground mt-1">
                                            {book.chapters_count} chapter{book.chapters_count === 1 ? '' : 's'}
                                        </span>
                                    )}
                                </Link>
                            ))}
                        </div>
                    </section>
                </div>
            </div>
        </BibleLayout>
    );
}
