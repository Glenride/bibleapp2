import BibleLayout from '@/layouts/bible-layout';
import { Head, Link } from '@inertiajs/react';
import { chapter } from '@/routes/bible';

interface Book {
    id: number;
    name: string;
    abbreviation: string;
    position: number;
    image?: string;
}

export default function Welcome({ oldTestament = [], newTestament = [] }: { oldTestament?: Book[], newTestament?: Book[] }) {
    return (
        <BibleLayout>
            <Head title="Home" />

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
                    <section className="mb-16">
                        <div className="flex items-center gap-4 mb-8">
                            <h2 className="font-serif text-3xl font-bold uppercase tracking-widest text-[#733000]">Old Testament</h2>
                            <div className="h-px bg-[#733000]/20 flex-1" />
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                            {oldTestament.map((book) => (
                                <Link
                                    key={book.id}
                                    href={chapter.url({ book: book.abbreviation })}
                                    className="p-4 rounded-lg bg-card border border-border/50 hover:border-primary/50 hover:shadow-md transition-all group"
                                >
                                    <h3 className="font-serif font-medium text-lg group-hover:text-primary transition-colors">{book.name}</h3>
                                </Link>
                            ))}
                        </div>
                    </section>

                    {/* New Testament */}
                    <section>
                        <div className="flex items-center gap-4 mb-8">
                            <h2 className="font-serif text-3xl font-bold uppercase tracking-widest text-[#4B0600]">New Testament</h2>
                            <div className="h-px bg-[#4B0600]/20 flex-1" />
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                            {newTestament.map((book) => (
                                <Link
                                    key={book.id}
                                    href={chapter.url({ book: book.abbreviation })}
                                    className="p-4 rounded-lg bg-card border border-border/50 hover:border-primary/50 hover:shadow-md transition-all group"
                                >
                                    <h3 className="font-serif font-medium text-lg group-hover:text-primary transition-colors">{book.name}</h3>
                                </Link>
                            ))}
                        </div>
                    </section>
                </div>
            </div>
        </BibleLayout>
    );
}
