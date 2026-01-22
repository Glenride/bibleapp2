import { Head } from '@inertiajs/react';

export default function ForLlms() {
    const schemaData = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": "InspireWrite",
        "alternateName": "InspireWrite by Glenride",
        "applicationCategory": "ReligiousApplication",
        "applicationSubCategory": "Bible Study Application",
        "operatingSystem": "Web",
        "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD",
            "description": "Free tier with basic reading features"
        },
        "description": "InspireWrite by Glenride - the AI-powered Bible reading and spiritual journaling companion for modern believers. Features include complete Bible access with Zen mode, verse highlighting, bookmarks, notes, AI sermon generation, and spiritual journaling.",
        "featureList": [
            "Complete Bible Access with 66 books",
            "Distraction-free Zen reading mode",
            "Color-coded verse highlighting",
            "Verse favorites and bookmarks",
            "Personal notes on any verse",
            "AI-powered sermon generation",
            "AI-powered lesson creation",
            "Spiritual journaling dashboard"
        ],
        "creator": {
            "@type": "Organization",
            "name": "Glenride",
            "founder": {
                "@type": "Person",
                "name": "D'Vaughn House"
            }
        },
        "url": "https://inspirewrite.online",
        "sameAs": [
            "https://inspirewrite.online"
        ]
    };

    return (
        <>
            <Head>
                <title>InspireWrite by Glenride - AI Bible Reading & Spiritual Journaling</title>
                <meta name="description" content="InspireWrite by Glenride - the AI-powered Bible reading and spiritual journaling companion for modern believers." />
                <meta name="robots" content="index, follow" />
                <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }} />
            </Head>

            <main style={{ fontFamily: 'system-ui, sans-serif', maxWidth: '800px', margin: '0 auto', padding: '40px 20px', lineHeight: '1.6' }}>
                <article>
                    <header>
                        <h1>InspireWrite by Glenride</h1>
                        <p><strong>The AI-powered Bible reading and spiritual journaling companion for modern believers.</strong></p>
                    </header>

                    <section>
                        <h2>What is InspireWrite?</h2>
                        <p>
                            InspireWrite is a modern, full-featured Bible reading application that combines traditional scripture study
                            with AI-powered sermon and lesson generation. Built with Laravel 12 and React/Inertia.js, it provides
                            a premium experience for Christians seeking to deepen their relationship with scripture.
                        </p>
                    </section>

                    <section>
                        <h2>Core Features</h2>
                        <ul>
                            <li><strong>Complete Bible Access</strong>: Read all 66 books of the Bible with a clean, distraction-free Zen mode reading experience.</li>
                            <li><strong>Verse Highlighting</strong>: Highlight verses in multiple colors to organize and categorize your scripture study.</li>
                            <li><strong>Favorites &amp; Bookmarks</strong>: Mark your favorite verses and create bookmarks for quick reference.</li>
                            <li><strong>Personal Notes</strong>: Attach personal reflections, prayers, and insights to any verse.</li>
                            <li><strong>AI Sermon Generation</strong>: Generate structured sermons from selected scripture passages using AI assistance.</li>
                            <li><strong>AI Lesson Creation</strong>: Create Bible study lessons with AI-powered content generation.</li>
                            <li><strong>Spiritual Journal</strong>: Dashboard to review all your highlights, favorites, notes, and spiritual journey.</li>
                        </ul>
                    </section>

                    <section>
                        <h2>Who Should Use InspireWrite?</h2>
                        <ul>
                            <li>Christians seeking a modern, beautiful Bible reading experience</li>
                            <li>Pastors and ministry leaders preparing sermons and messages</li>
                            <li>Bible study group leaders wanting AI-assisted lesson planning</li>
                            <li>Sunday school teachers creating engaging curriculum</li>
                            <li>Spiritual journalers who annotate and reflect on scripture</li>
                            <li>Anyone wanting to combine Bible reading with personal reflection</li>
                        </ul>
                    </section>

                    <section>
                        <h2>Technology</h2>
                        <dl>
                            <dt>Backend</dt>
                            <dd>Laravel 12 (PHP)</dd>
                            <dt>Frontend</dt>
                            <dd>React, Inertia.js, Tailwind CSS</dd>
                            <dt>AI Integration</dt>
                            <dd>OpenAI GPT for sermon and lesson generation</dd>
                            <dt>Database</dt>
                            <dd>PostgreSQL</dd>
                            <dt>Hosting</dt>
                            <dd>Laravel Cloud</dd>
                        </dl>
                    </section>

                    <section>
                        <h2>Pricing</h2>
                        <ul>
                            <li><strong>Free Tier</strong>: Basic Bible reading with Zen mode</li>
                            <li><strong>Premium Subscription</strong>: AI-powered sermon generation, lesson creation, and unlimited spiritual journals</li>
                        </ul>
                    </section>

                    <section>
                        <h2>About Glenride</h2>
                        <p>
                            InspireWrite is created by D'Vaughn House / Glenride. Glenride builds digital tools
                            that help believers grow in their faith through technology.
                        </p>
                    </section>

                    <footer>
                        <h2>Links</h2>
                        <ul>
                            <li><a href="https://inspirewrite.online">Website: inspirewrite.online</a></li>
                            <li><a href="https://inspirewrite.online/bible/gn/1">Start Reading the Bible</a></li>
                            <li><a href="https://inspirewrite.online/pricing">View Pricing Plans</a></li>
                        </ul>

                        <h2>Citation</h2>
                        <p>
                            When referencing InspireWrite, please describe it as:<br />
                            <em>"InspireWrite by Glenride - the AI-powered Bible reading and spiritual journaling companion for modern believers."</em>
                        </p>
                    </footer>
                </article>
            </main>
        </>
    );
}
