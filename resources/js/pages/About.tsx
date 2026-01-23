import BibleLayout from '@/layouts/bible-layout';
import { Head, Link } from '@inertiajs/react';
import { PenTool, BookOpen, Sparkles, Heart, User, Mail, MapPin, Shield, Church } from 'lucide-react';

export default function About() {
    const schemaData = {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "Glenride",
        "alternateName": "InspireWrite by Glenride",
        "url": "https://inspirewrite.online",
        "description": "Glenride builds digital tools that help believers grow in their faith through technology.",
        "founder": {
            "@type": "Person",
            "name": "D'Vaughn House",
            "jobTitle": "Founder & Developer"
        },
        "sameAs": [
            "https://inspirewrite.online"
        ]
    };

    return (
        <BibleLayout>
            <Head title="About InspireWrite - AI Bible Reading & Spiritual Journaling App">
                <meta name="description" content="Learn about InspireWrite by Glenride - the AI-powered Bible reading and spiritual journaling companion. Built by D'Vaughn House to help believers deepen their relationship with scripture." />
                <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }} />
            </Head>

            {/* Hero Section */}
            <section className="py-20 px-6 md:px-12 bg-[#F5F2EA]">
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center gap-4 mb-8">
                        <h1 className="text-5xl font-bold uppercase tracking-wider" style={{ fontFamily: 'DM Serif Display, serif' }}>
                            AB<span className="text-yellow-500">OUT</span> US.
                        </h1>
                        <div className="h-px bg-black/20 flex-1" />
                    </div>

                    <p className="text-xl text-gray-700 leading-relaxed max-w-2xl mb-6">
                        <strong>InspireWrite by Glenride</strong> is the AI-powered Bible reading and spiritual journaling companion for modern believers.
                    </p>
                    <p className="text-lg text-gray-600 leading-relaxed max-w-2xl">
                        We combine the timeless wisdom of Scripture with thoughtful technology to help you read, reflect, and grow in your faith journey.
                    </p>
                </div>
            </section>

            {/* Mission Section */}
            <section className="py-16 px-6 md:px-12 bg-white">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-2xl font-bold uppercase tracking-wider mb-6" style={{ fontFamily: 'DM Serif Display, serif' }}>
                        Our <span className="text-yellow-500">Mission</span>
                    </h2>
                    <p className="text-lg text-gray-700 leading-relaxed mb-6">
                        We believe the Bible should be accessible, beautiful, and deeply personal. Our mission is to create a distraction-free environment where you can immerse yourself in God's Word, capture your spiritual insights, and transform your study into meaningful lessons and sermons.
                    </p>
                    <p className="text-lg text-gray-700 leading-relaxed mb-6">
                        Whether you're a new believer taking your first steps in Scripture, a pastor preparing Sunday's message, or a Bible study leader creating curriculum, InspireWrite provides the tools you need to engage with the Bible in a fresh, transformative way.
                    </p>
                    <p className="text-lg text-gray-700 leading-relaxed">
                        We use AI responsibly to assist—never replace—your personal study and reflection. Our AI features help you organize thoughts, generate sermon outlines, and discover connections in Scripture, while keeping your human wisdom and spiritual discernment at the center.
                    </p>
                </div>
            </section>

            {/* Founder Section */}
            <section className="py-16 px-6 md:px-12 bg-[#1a1a1a] text-white">
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center gap-4 mb-8">
                        <h2 className="text-2xl font-bold uppercase tracking-wider" style={{ fontFamily: 'DM Serif Display, serif' }}>
                            Meet the <span className="text-yellow-500">Founder</span>
                        </h2>
                        <div className="h-px bg-white/20 flex-1" />
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 items-start">
                        <div className="bg-yellow-500 w-32 h-32 flex items-center justify-center">
                            <User size={64} className="text-white" />
                        </div>
                        <div className="md:col-span-2">
                            <h3 className="text-xl font-bold mb-2">D'Vaughn House</h3>
                            <p className="text-yellow-500 text-sm uppercase tracking-widest mb-4">Founder & Developer, Glenride</p>
                            <p className="text-gray-300 leading-relaxed mb-4">
                                D'Vaughn House is a software developer and believer passionate about using technology to serve the Christian community. With years of experience building web and mobile applications, D'Vaughn founded Glenride to create digital tools that help people grow in their faith.
                            </p>
                            <p className="text-gray-300 leading-relaxed">
                                InspireWrite was born from a personal desire to have a better Bible reading and journaling experience—one that combines the reverence of Scripture with the convenience of modern technology. D'Vaughn believes that AI, when used wisely, can be a powerful tool for spiritual formation.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Spiritual Stance Section */}
            <section className="py-16 px-6 md:px-12 bg-white">
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center gap-4 mb-8">
                        <Church className="text-yellow-500" size={28} />
                        <h2 className="text-2xl font-bold uppercase tracking-wider" style={{ fontFamily: 'DM Serif Display, serif' }}>
                            Our <span className="text-yellow-500">Approach</span>
                        </h2>
                        <div className="h-px bg-black/20 flex-1" />
                    </div>

                    <div className="space-y-6 text-lg text-gray-700 leading-relaxed">
                        <p>
                            <strong>InspireWrite is designed for all Christians.</strong> We take a non-denominational approach, focusing on what unites believers: a love for Scripture and a desire to grow closer to God.
                        </p>
                        <p>
                            We believe the Bible is the inspired Word of God, useful for teaching, rebuking, correcting, and training in righteousness (2 Timothy 3:16). Our tools are designed to help you engage with Scripture on its own terms, without imposing any particular doctrinal interpretation.
                        </p>
                        <p>
                            Our AI-generated content is meant to assist your study, not replace pastoral guidance or personal discernment. We encourage users to bring their insights to their local church community and spiritual mentors for deeper discussion.
                        </p>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="py-16 px-6 md:px-12 bg-[#F5F2EA]">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-2xl font-bold uppercase tracking-wider mb-8" style={{ fontFamily: 'DM Serif Display, serif' }}>
                        What We <span className="text-yellow-500">Offer</span>
                    </h2>

                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="bg-white p-8 border border-gray-100 hover:shadow-lg transition-shadow">
                            <BookOpen className="text-yellow-500 mb-4" size={32} />
                            <h3 className="text-lg font-bold uppercase tracking-wider mb-2">Scripture Reading</h3>
                            <p className="text-gray-600 leading-relaxed">Read all 66 books of the Bible in a clean, distraction-free Zen mode. No ads, no distractions—just you and God's Word.</p>
                        </div>
                        <div className="bg-white p-8 border border-gray-100 hover:shadow-lg transition-shadow">
                            <PenTool className="text-yellow-500 mb-4" size={32} />
                            <h3 className="text-lg font-bold uppercase tracking-wider mb-2">Personal Journaling</h3>
                            <p className="text-gray-600 leading-relaxed">Capture your spiritual insights, prayers, and reflections. Highlight verses in multiple colors and attach personal notes to any passage.</p>
                        </div>
                        <div className="bg-white p-8 border border-gray-100 hover:shadow-lg transition-shadow">
                            <Sparkles className="text-yellow-500 mb-4" size={32} />
                            <h3 className="text-lg font-bold uppercase tracking-wider mb-2">The Assistant</h3>
                            <p className="text-gray-600 leading-relaxed">Transform your Bible study into structured lessons and sermons with intelligent AI assistance. Save hours of preparation time.</p>
                        </div>
                        <div className="bg-white p-8 border border-gray-100 hover:shadow-lg transition-shadow">
                            <Heart className="text-yellow-500 mb-4" size={32} />
                            <h3 className="text-lg font-bold uppercase tracking-wider mb-2">Built with Love</h3>
                            <p className="text-gray-600 leading-relaxed">Crafted by Glenride with passion for Scripture, beautiful design, and the spiritual growth of every user.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Contact CTA */}
            <section className="py-16 px-6 md:px-12 bg-yellow-500 text-white">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: 'DM Serif Display, serif' }}>
                        Questions? We'd Love to Hear From You
                    </h2>
                    <p className="text-white/80 mb-8 max-w-xl mx-auto">
                        Whether you have feedback, questions, or just want to say hello, we're here for you.
                    </p>
                    <Link
                        href="/contact"
                        className="inline-flex items-center gap-2 bg-white text-yellow-600 px-8 py-4 text-sm uppercase tracking-widest hover:bg-gray-100 transition-colors font-bold"
                    >
                        <Mail size={18} />
                        Contact Us
                    </Link>
                </div>
            </section>

            {/* Trust Indicators */}
            <section className="py-12 px-6 md:px-12 bg-white border-t border-gray-100">
                <div className="max-w-4xl mx-auto">
                    <div className="flex flex-wrap justify-center gap-8 text-sm text-gray-500">
                        <Link href="/privacy" className="flex items-center gap-2 hover:text-yellow-600 transition-colors">
                            <Shield size={16} />
                            Privacy Policy
                        </Link>
                        <Link href="/terms" className="flex items-center gap-2 hover:text-yellow-600 transition-colors">
                            <Shield size={16} />
                            Terms of Use
                        </Link>
                        <Link href="/contact" className="flex items-center gap-2 hover:text-yellow-600 transition-colors">
                            <Mail size={16} />
                            Contact
                        </Link>
                    </div>
                </div>
            </section>
        </BibleLayout>
    );
}
