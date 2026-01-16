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

                <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    {/* Free Plan */}
                    <div className="border border-border/50 rounded-lg p-8 bg-card shadow-sm">
                        <h2 className="text-2xl font-serif mb-2">Basic</h2>
                        <div className="text-4xl font-bold mb-6">$7<span className="text-lg font-normal text-muted-foreground">/mo</span></div>
                        <p className="text-muted-foreground mb-6">Essential tools for daily reading.</p>
                        <ul className="space-y-3 mb-8">
                            <li className="flex items-center gap-2"><Check className="size-4 text-green-500" /> Full Bible Access</li>
                            <li className="flex items-center gap-2"><Check className="size-4 text-green-500" /> Basic Search</li>
                            <li className="flex items-center gap-2"><Check className="size-4 text-green-500" /> Personal Notes</li>
                        </ul>
                        <a href="/checkout/price_basic" className="w-full block text-center py-2 px-4 border border-primary text-primary hover:bg-primary/5 rounded-md transition-colors">
                            Get Started
                        </a>
                    </div>

                    {/* Pro Plan */}
                    <div className="border border-primary rounded-lg p-8 bg-card shadow-md relative overflow-hidden">
                        <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs px-3 py-1 rounded-bl-lg font-medium">RECOMMENDED</div>
                        <h2 className="text-2xl font-serif mb-2">Journal Pro</h2>
                        <div className="text-4xl font-bold mb-6">$17<span className="text-lg font-normal text-muted-foreground">/mo</span></div>
                        <p className="text-muted-foreground mb-6">Advanced study tools and unlimited journaling.</p>
                        <ul className="space-y-3 mb-8">
                            <li className="flex items-center gap-2"><Check className="size-4 text-primary" /> Everything in Basic</li>
                            <li className="flex items-center gap-2"><Check className="size-4 text-primary" /> Advanced AI Insights</li>
                            <li className="flex items-center gap-2"><Check className="size-4 text-primary" /> Unlimited Journals</li>
                            <li className="flex items-center gap-2"><Check className="size-4 text-primary" /> Reading Plans</li>
                        </ul>
                        <a href="/checkout/price_pro" className="w-full block text-center py-2 px-4 bg-primary text-primary-foreground hover:bg-primary/90 rounded-md transition-colors shadow-sm">
                            Subscribe Now
                        </a>
                    </div>
                </div>
            </div>
        </BibleLayout>
    );
}
