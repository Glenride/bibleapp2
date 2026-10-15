import BibleLayout from '@/layouts/bible-layout';
import { Head } from '@inertiajs/react';
import { Check } from 'lucide-react';

export default function Pricing() {
    return (
        <BibleLayout>
            <Head title="Pricing" />
            <div className="py-16 px-4 md:px-12 max-w-5xl mx-auto">
                <div className="text-center mb-16">
                    <h1 className="font-serif text-4xl mb-4">Simple, Transparent Pricing</h1>
                    <p className="text-muted-foreground">Choose the plan that fits your spiritual journey.</p>
                </div>

                <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {/* Free Plan */}
                    <div className="border border-border/50 rounded-lg p-8 bg-card shadow-sm">
                        <h2 className="text-2xl font-serif mb-2">Free</h2>
                        <div className="text-4xl font-bold mb-6">$0</div>
                        <p className="text-muted-foreground mb-6">Start reading today.</p>
                        <ul className="space-y-3 mb-8">
                            <li className="flex items-center gap-2"><Check className="size-4 text-green-500" /> Unlimited Bible reading</li>
                            <li className="flex items-center gap-2"><Check className="size-4 text-green-500" /> Bookmarking</li>
                            <li className="flex items-center gap-2"><Check className="size-4 text-green-500" /> Free account to manage bookmarks</li>
                        </ul>
                        <button className="w-full py-2 px-4 border border-primary text-primary hover:bg-primary/5 rounded-md transition-colors">
                            Get Started
                        </button>
                    </div>

                    {/* Study Plan */}
                    <div className="border border-primary rounded-lg p-8 bg-card shadow-md relative overflow-hidden">
                        <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs px-3 py-1 rounded-bl-lg font-medium">RECOMMENDED</div>
                        <h2 className="text-2xl font-serif mb-2">Study</h2>
                        <div className="text-4xl font-bold mb-6">$7<span className="text-lg font-normal text-muted-foreground">/mo</span></div>
                        <p className="text-muted-foreground mb-6">Go deeper in your study.</p>
                        <ul className="space-y-3 mb-8">
                            <li className="flex items-center gap-2"><Check className="size-4 text-primary" /> Everything in Free</li>
                            <li className="flex items-center gap-2"><Check className="size-4 text-primary" /> Highlighting and commenting</li>
                            <li className="flex items-center gap-2"><Check className="size-4 text-primary" /> 5 concurrent lessons</li>
                            <li className="flex items-center gap-2"><Check className="size-4 text-primary" /> 1 concurrent sermon</li>
                        </ul>
                        <button className="w-full py-2 px-4 bg-primary text-primary-foreground hover:bg-primary/90 rounded-md transition-colors shadow-sm">
                            Subscribe Now
                        </button>
                    </div>

                    {/* Pro Plan */}
                    <div className="border border-border/50 rounded-lg p-8 bg-card shadow-sm">
                        <h2 className="text-2xl font-serif mb-2">Pro</h2>
                        <div className="text-4xl font-bold mb-6">$27<span className="text-lg font-normal text-muted-foreground">/mo</span></div>
                        <p className="text-muted-foreground mb-6">Full access.</p>
                        <ul className="space-y-3 mb-8">
                            <li className="flex items-center gap-2"><Check className="size-4 text-green-500" /> Everything in Study</li>
                            <li className="flex items-center gap-2"><Check className="size-4 text-green-500" /> Unlimited lessons</li>
                            <li className="flex items-center gap-2"><Check className="size-4 text-green-500" /> Unlimited sermons</li>
                        </ul>
                        <button className="w-full py-2 px-4 border border-primary text-primary hover:bg-primary/5 rounded-md transition-colors">
                            Subscribe Now
                        </button>
                    </div>
                </div>
            </div>
        </BibleLayout>
    );
}
