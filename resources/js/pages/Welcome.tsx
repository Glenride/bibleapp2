import { Head, Link } from '@inertiajs/react';
import { usePage } from '@inertiajs/react';
import { SharedData } from '@/types';
import { FlashToaster } from '@/components/flash-toaster';
import { about, pricing } from '@/routes';
import { PenTool, BookOpen, Sparkles, Users, ChevronRight, Quote, ArrowRight, Menu, X } from 'lucide-react';
import { useState } from 'react';

interface Book {
    id: number;
    name: string;
    abbreviation: string;
    position: number;
}

export default function Welcome({ oldTestament = [], newTestament = [] }: { oldTestament?: Book[], newTestament?: Book[] }) {
    const { auth } = usePage<SharedData>().props;
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const features = [
        { num: '01', title: 'Scripture Reading', desc: 'Immerse yourself in the Word with a distraction-free reading experience' },
        { num: '02', title: 'Personal Journaling', desc: 'Capture your spiritual insights, prayers, and reflections' },
        { num: '03', title: 'Lesson Creation', desc: 'Transform your study into structured lessons powered by AI' },
        { num: '04', title: 'Sermon Builder', desc: 'Craft meaningful sermons with intelligent assistance' },
    ];

    const stats = [
        { value: '3+', label: 'Years in Development' },
        { value: '66', label: 'Books of Scripture' },
        { value: '1K+', label: 'Verses to Explore' },
        { value: '∞', label: 'Spiritual Growth' },
    ];

    const testimonials = [
        { quote: 'InspireWrite has transformed how I study and reflect on Scripture. The journaling features are incredible.', author: 'Sarah M.', role: 'Bible Study Leader' },
        { quote: 'Finally, a platform that combines reading, studying, and writing in one beautiful experience.', author: 'Pastor David', role: 'Church Pastor' },
        { quote: 'The AI-powered lesson generator saves me hours of preparation time each week.', author: 'Michelle K.', role: 'Sunday School Teacher' },
    ];

    return (
        <div className="min-h-screen bg-[#F5F2EA] text-[#1a1a1a]" style={{ fontFamily: 'Inter, sans-serif' }}>
            <FlashToaster />
            <Head title="Home" />

            {/* Navigation */}
            <header className="fixed top-0 left-0 right-0 z-50 bg-[#F5F2EA]/95 backdrop-blur-sm border-b border-black/5">
                <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
                    <Link href="/" className="text-2xl tracking-[0.3em] uppercase font-bold" style={{ fontFamily: 'DM Serif Display, serif' }}>
                        INSPIREWRITE.
                    </Link>

                    {/* Desktop Nav */}
                    <nav className="hidden md:flex items-center gap-8 text-sm tracking-widest uppercase">
                        <Link href="/" className="hover:text-red-600 transition-colors">Home</Link>
                        <Link href={about.url()} className="hover:text-red-600 transition-colors">About</Link>
                        <Link href="#features" className="hover:text-red-600 transition-colors">Features</Link>
                        <Link href={pricing.url()} className="hover:text-red-600 transition-colors">Pricing</Link>
                        {auth.user ? (
                            <Link href="/dashboard" className="bg-red-600 text-white px-5 py-2.5 hover:bg-red-700 transition-colors">
                                My Studio
                            </Link>
                        ) : (
                            <>
                                <Link href="/login" className="hover:text-red-600 transition-colors">Log in</Link>
                                <Link href="/register" className="bg-red-600 text-white px-5 py-2.5 hover:bg-red-700 transition-colors">
                                    Get Started
                                </Link>
                            </>
                        )}
                    </nav>

                    {/* Mobile Menu Button */}
                    <button className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden bg-[#F5F2EA] border-t border-black/5 px-6 py-4">
                        <nav className="flex flex-col gap-4 text-sm tracking-widest uppercase">
                            <Link href="/" className="hover:text-red-600 transition-colors py-2">Home</Link>
                            <Link href={about.url()} className="hover:text-red-600 transition-colors py-2">About</Link>
                            <Link href="#features" className="hover:text-red-600 transition-colors py-2">Features</Link>
                            <Link href={pricing.url()} className="hover:text-red-600 transition-colors py-2">Pricing</Link>
                            {auth.user ? (
                                <Link href="/dashboard" className="bg-red-600 text-white px-5 py-2.5 text-center hover:bg-red-700 transition-colors">
                                    My Studio
                                </Link>
                            ) : (
                                <>
                                    <Link href="/login" className="hover:text-red-600 transition-colors py-2">Log in</Link>
                                    <Link href="/register" className="bg-red-600 text-white px-5 py-2.5 text-center hover:bg-red-700 transition-colors">
                                        Get Started
                                    </Link>
                                </>
                            )}
                        </nav>
                    </div>
                )}
            </header>

            {/* Hero Section */}
            <section className="min-h-screen flex items-center pt-20 relative overflow-hidden">
                {/* Background Accent */}
                <div className="absolute top-1/4 right-0 w-96 h-96 bg-red-600/10 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 left-0 w-64 h-64 bg-red-600/5 rounded-full blur-2xl" />

                <div className="max-w-7xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-12 items-center">
                    <div className="relative z-10">
                        <p className="text-red-600 uppercase tracking-[0.3em] text-sm mb-4 font-medium">By Glenride</p>
                        <h1 className="text-6xl md:text-8xl font-bold leading-[0.9] mb-6" style={{ fontFamily: 'DM Serif Display, serif' }}>
                            INSPIRE<span className="text-red-600">WRITE</span>.
                        </h1>
                        <p className="text-xl text-gray-600 mb-8 max-w-md leading-relaxed">
                            A spiritual writing companion for your journey. Read scripture, journal your thoughts, and create meaningful lessons.
                        </p>
                        <div className="flex flex-wrap gap-4">
                            <Link
                                href="/bible/gn/1"
                                className="inline-flex items-center gap-2 bg-[#1a1a1a] text-white px-8 py-4 text-sm uppercase tracking-widest hover:bg-gray-800 transition-colors group"
                            >
                                Start Reading
                                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                            {!auth.user && (
                                <Link
                                    href="/register"
                                    className="inline-flex items-center gap-2 border-2 border-[#1a1a1a] px-8 py-4 text-sm uppercase tracking-widest hover:bg-[#1a1a1a] hover:text-white transition-colors"
                                >
                                    Create Account
                                </Link>
                            )}
                        </div>
                    </div>

                    {/* Decorative Typography */}
                    <div className="hidden md:block relative">
                        <div className="text-[12rem] font-bold text-red-600/10 leading-none absolute -top-20 -right-10 select-none" style={{ fontFamily: 'DM Serif Display, serif' }}>
                            IW
                        </div>
                        <div className="bg-white p-8 shadow-2xl relative z-10">
                            <div className="border border-gray-100 p-6">
                                <Quote className="text-red-600 mb-4" size={32} />
                                <p className="text-lg italic text-gray-700 mb-4" style={{ fontFamily: 'DM Serif Display, serif' }}>
                                    "Thy word is a lamp unto my feet, and a light unto my path."
                                </p>
                                <p className="text-sm text-gray-500 uppercase tracking-widest">Psalm 119:105</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex items-center gap-4 mb-16">
                        <h2 className="text-4xl font-bold uppercase tracking-wider" style={{ fontFamily: 'DM Serif Display, serif' }}>
                            FEAT<span className="text-red-600">URES</span>.
                        </h2>
                        <div className="h-px bg-black/20 flex-1" />
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {features.map((feature) => (
                            <div key={feature.num} className="group p-6 border border-gray-100 hover:border-red-600 hover:shadow-lg transition-all duration-300">
                                <span className="text-5xl font-bold text-red-600/20 group-hover:text-red-600/40 transition-colors" style={{ fontFamily: 'DM Serif Display, serif' }}>
                                    {feature.num}
                                </span>
                                <h3 className="text-lg font-bold uppercase tracking-wider mt-4 mb-2">{feature.title}</h3>
                                <p className="text-gray-600 text-sm leading-relaxed">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* About Section */}
            <section className="py-24 bg-[#1a1a1a] text-white">
                <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
                    <div>
                        <div className="flex items-center gap-4 mb-8">
                            <h2 className="text-4xl font-bold uppercase tracking-wider" style={{ fontFamily: 'DM Serif Display, serif' }}>
                                AB<span className="text-red-600">OUT</span> US.
                            </h2>
                            <div className="h-px bg-white/20 flex-1" />
                        </div>
                        <p className="text-gray-300 text-lg leading-relaxed mb-6">
                            InspireWrite by Glenride is a spiritual writing platform designed for those who want to deepen their relationship with scripture through thoughtful journaling and creative expression.
                        </p>
                        <p className="text-gray-300 leading-relaxed mb-8">
                            We combine the timeless wisdom of the Bible with modern AI technology to help you create lessons, build sermons, and capture your spiritual insights in meaningful ways.
                        </p>
                        <Link href={about.url()} className="inline-flex items-center gap-2 text-red-500 uppercase tracking-widest text-sm hover:text-red-400 transition-colors group">
                            Learn More <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        {stats.map((stat, i) => (
                            <div key={i} className="p-8 border border-white/10 text-center hover:border-red-600/50 transition-colors">
                                <div className="text-5xl font-bold text-red-600 mb-2" style={{ fontFamily: 'DM Serif Display, serif' }}>{stat.value}</div>
                                <div className="text-xs uppercase tracking-widest text-gray-400">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Scripture Index Section */}
            <section className="py-24 bg-[#F5F2EA]">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex items-center gap-4 mb-16">
                        <h2 className="text-4xl font-bold uppercase tracking-wider" style={{ fontFamily: 'DM Serif Display, serif' }}>
                            SCRIP<span className="text-red-600">TURE</span>.
                        </h2>
                        <div className="h-px bg-black/20 flex-1" />
                    </div>

                    {/* Old Testament */}
                    {oldTestament.length > 0 && (
                        <div className="mb-16">
                            <h3 className="text-sm uppercase tracking-[0.3em] text-red-600 mb-6 font-medium">Old Testament</h3>
                            <div className="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-8 gap-3">
                                {oldTestament.map((book) => (
                                    <Link
                                        key={book.id}
                                        href={`/bible/${book.abbreviation}/1`}
                                        className="p-3 bg-white border border-gray-100 text-center text-sm hover:border-red-600 hover:shadow-md transition-all group"
                                    >
                                        <span className="group-hover:text-red-600 transition-colors">{book.name}</span>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* New Testament */}
                    {newTestament.length > 0 && (
                        <div>
                            <h3 className="text-sm uppercase tracking-[0.3em] text-red-600 mb-6 font-medium">New Testament</h3>
                            <div className="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-8 gap-3">
                                {newTestament.map((book) => (
                                    <Link
                                        key={book.id}
                                        href={`/bible/${book.abbreviation}/1`}
                                        className="p-3 bg-white border border-gray-100 text-center text-sm hover:border-red-600 hover:shadow-md transition-all group"
                                    >
                                        <span className="group-hover:text-red-600 transition-colors">{book.name}</span>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </section>

            {/* Testimonials Section */}
            <section className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex items-center gap-4 mb-16">
                        <h2 className="text-4xl font-bold uppercase tracking-wider" style={{ fontFamily: 'DM Serif Display, serif' }}>
                            REVI<span className="text-red-600">EWS</span>.
                        </h2>
                        <div className="h-px bg-black/20 flex-1" />
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {testimonials.map((testimonial, i) => (
                            <div key={i} className="p-8 bg-[#F5F2EA] border border-gray-100 hover:shadow-lg transition-shadow">
                                <Quote className="text-red-600/30 mb-4" size={40} />
                                <p className="text-gray-700 mb-6 italic leading-relaxed" style={{ fontFamily: 'DM Serif Display, serif' }}>
                                    "{testimonial.quote}"
                                </p>
                                <div>
                                    <p className="font-bold uppercase tracking-wider text-sm">{testimonial.author}</p>
                                    <p className="text-gray-500 text-xs uppercase tracking-wider">{testimonial.role}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 bg-red-600 text-white">
                <div className="max-w-4xl mx-auto px-6 text-center">
                    <h2 className="text-5xl md:text-6xl font-bold mb-6" style={{ fontFamily: 'DM Serif Display, serif' }}>
                        GET IN TOUCH.
                    </h2>
                    <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">
                        Ready to transform your spiritual writing journey? Join InspireWrite today and discover a new way to engage with scripture.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            href="/register"
                            className="inline-flex items-center justify-center gap-2 bg-white text-red-600 px-10 py-4 text-sm uppercase tracking-widest hover:bg-gray-100 transition-colors font-bold"
                        >
                            Start Free Trial
                        </Link>
                        <Link
                            href={pricing.url()}
                            className="inline-flex items-center justify-center gap-2 border-2 border-white px-10 py-4 text-sm uppercase tracking-widest hover:bg-white/10 transition-colors"
                        >
                            View Pricing
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-[#1a1a1a] text-white py-16">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid md:grid-cols-4 gap-12 mb-12">
                        <div className="col-span-1 md:col-span-2">
                            <h3 className="text-2xl tracking-[0.3em] mb-4" style={{ fontFamily: 'DM Serif Display, serif' }}>INSPIREWRITE.</h3>
                            <p className="text-gray-400 leading-relaxed max-w-md">
                                A spiritual writing companion by Glenride. Read scripture, journal your thoughts, and create meaningful lessons with AI-powered assistance.
                            </p>
                        </div>

                        <div>
                            <h4 className="text-xs uppercase tracking-[0.3em] text-gray-400 mb-4">Quick Links</h4>
                            <ul className="space-y-3 text-sm">
                                <li><Link href="/" className="hover:text-red-500 transition-colors">Home</Link></li>
                                <li><Link href={about.url()} className="hover:text-red-500 transition-colors">About</Link></li>
                                <li><Link href={pricing.url()} className="hover:text-red-500 transition-colors">Pricing</Link></li>
                                <li><Link href="/bible/gn/1" className="hover:text-red-500 transition-colors">Start Reading</Link></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="text-xs uppercase tracking-[0.3em] text-gray-400 mb-4">Connect</h4>
                            <ul className="space-y-3 text-sm">
                                <li><a href="#" className="hover:text-red-500 transition-colors">Twitter</a></li>
                                <li><a href="#" className="hover:text-red-500 transition-colors">Facebook</a></li>
                                <li><a href="#" className="hover:text-red-500 transition-colors">Instagram</a></li>
                                <li><a href="mailto:hello@inspirewrite.online" className="hover:text-red-500 transition-colors">Contact</a></li>
                            </ul>
                        </div>
                    </div>

                    <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-xs text-gray-500 uppercase tracking-widest">
                            © {new Date().getFullYear()} InspireWrite by Glenride. All Rights Reserved.
                        </p>
                        <p className="text-xs text-gray-500">
                            <a href="https://inspirewrite.online" className="hover:text-red-500 transition-colors">inspirewrite.online</a>
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
