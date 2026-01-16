import BibleLayout from '@/layouts/bible-layout';
import { Head } from '@inertiajs/react';
import { PenTool, BookOpen, Sparkles, Heart } from 'lucide-react';

export default function About() {
    return (
        <BibleLayout>
            <Head title="About Us" />

            {/* Hero */}
            <section className="py-20 px-6 md:px-12 bg-[#F5F2EA]">
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center gap-4 mb-8">
                        <h1 className="text-5xl font-bold uppercase tracking-wider" style={{ fontFamily: 'DM Serif Display, serif' }}>
                            AB<span className="text-red-600">OUT</span> US.
                        </h1>
                        <div className="h-px bg-black/20 flex-1" />
                    </div>

                    <p className="text-xl text-gray-600 leading-relaxed max-w-2xl">
                        InspireWrite by Glenride is a spiritual writing companion designed for those who want to deepen their relationship with scripture.
                    </p>
                </div>
            </section>

            {/* Mission */}
            <section className="py-16 px-6 md:px-12 bg-white">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-2xl font-bold uppercase tracking-wider mb-6" style={{ fontFamily: 'DM Serif Display, serif' }}>
                        Our <span className="text-red-600">Mission</span>
                    </h2>
                    <p className="text-lg text-gray-700 leading-relaxed mb-6">
                        We believe in making the Word of God accessible, beautiful, and deeply personal. Our mission is to provide a distraction-free environment for reading, studying, and reflecting on the scriptures.
                    </p>
                    <p className="text-lg text-gray-700 leading-relaxed">
                        Whether you are following a daily reading plan, journaling your thoughts, or diving deep into creating lessons and sermons, InspireWrite is here to support your spiritual journey.
                    </p>
                </div>
            </section>

            {/* Features */}
            <section className="py-16 px-6 md:px-12 bg-[#F5F2EA]">
                <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
                    <div className="bg-white p-8 border border-gray-100">
                        <BookOpen className="text-red-600 mb-4" size={32} />
                        <h3 className="text-lg font-bold uppercase tracking-wider mb-2">Scripture Reading</h3>
                        <p className="text-gray-600">Immerse yourself in the Word with a clean, distraction-free reading experience.</p>
                    </div>
                    <div className="bg-white p-8 border border-gray-100">
                        <PenTool className="text-red-600 mb-4" size={32} />
                        <h3 className="text-lg font-bold uppercase tracking-wider mb-2">Personal Journaling</h3>
                        <p className="text-gray-600">Capture your spiritual insights, prayers, and reflections in one place.</p>
                    </div>
                    <div className="bg-white p-8 border border-gray-100">
                        <Sparkles className="text-red-600 mb-4" size={32} />
                        <h3 className="text-lg font-bold uppercase tracking-wider mb-2">AI-Powered Lessons</h3>
                        <p className="text-gray-600">Transform your bible study into structured lessons with intelligent assistance.</p>
                    </div>
                    <div className="bg-white p-8 border border-gray-100">
                        <Heart className="text-red-600 mb-4" size={32} />
                        <h3 className="text-lg font-bold uppercase tracking-wider mb-2">Built with Love</h3>
                        <p className="text-gray-600">Crafted by Glenride with passion for scripture and beautiful design.</p>
                    </div>
                </div>
            </section>
        </BibleLayout>
    );
}
