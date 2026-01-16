import BibleLayout from '@/layouts/bible-layout';
import { Head } from '@inertiajs/react';

export default function About() {
    return (
        <BibleLayout>
            <Head title="About Us" />
            <div className="py-12 px-4 md:px-12 max-w-4xl mx-auto">
                <h1 className="font-serif text-4xl mb-6">About Glenride Holy Bible and Journal</h1>
                <div className="prose dark:prose-invert">
                    <p className="text-lg leading-relaxed mb-4">
                        Glenride Holy Bible and Journal is designed to accompany you on your spiritual journey.
                        We believe in making the Word of God accessible, beautiful, and deeply personal.
                    </p>
                    <p className="text-lg leading-relaxed mb-4">
                        Our mission is to provide a distraction-free environment for reading, studying, and reflecting on the scriptures.
                        Whether you are following a daily reading plan or diving deep into a specific book, our tools are here to support you.
                    </p>
                </div>
            </div>
        </BibleLayout>
    );
}
