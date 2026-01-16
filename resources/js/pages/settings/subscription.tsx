import HeadingSmall from '@/components/heading-small';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { Check, Crown, Sparkles } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Subscription settings',
        href: '/settings/subscription',
    },
];

interface SubscriptionProps {
    currentPlan: 'none' | 'basic' | 'pro';
    subscriptionEndsAt?: string;
}

export default function Subscription({ currentPlan = 'none', subscriptionEndsAt }: SubscriptionProps) {
    const { auth } = usePage<SharedData>().props;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Subscription settings" />

            <h1 className="sr-only">Subscription Settings</h1>

            <SettingsLayout>
                <div className="space-y-6">
                    <HeadingSmall
                        title="Subscription"
                        description="Manage your subscription plan"
                    />

                    {/* Current Plan Status */}
                    <div className="rounded-lg border border-border/50 bg-card p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-medium">Current Plan</h3>
                                <p className="text-muted-foreground text-sm mt-1">
                                    {currentPlan === 'none' && 'No active subscription'}
                                    {currentPlan === 'basic' && 'Basic - $7/month'}
                                    {currentPlan === 'pro' && 'Journal Pro - $27/month'}
                                </p>
                                {subscriptionEndsAt && (
                                    <p className="text-muted-foreground text-xs mt-2">
                                        Renews on {subscriptionEndsAt}
                                    </p>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                {currentPlan === 'pro' && (
                                    <span className="flex items-center gap-1 text-primary text-sm font-medium">
                                        <Crown className="size-4" /> Pro Member
                                    </span>
                                )}
                                {currentPlan === 'basic' && (
                                    <span className="flex items-center gap-1 text-green-600 text-sm font-medium">
                                        <Check className="size-4" /> Active
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Upgrade Options */}
                    {currentPlan !== 'pro' && (
                        <div className="space-y-4">
                            <h3 className="text-sm font-medium text-muted-foreground">
                                {currentPlan === 'none' ? 'Choose a Plan' : 'Upgrade Your Plan'}
                            </h3>

                            <div className="grid gap-4">
                                {/* Basic Plan */}
                                {currentPlan === 'none' && (
                                    <div className="rounded-lg border border-border/50 bg-card p-6">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <h4 className="font-medium">Basic</h4>
                                                <p className="text-2xl font-bold mt-1">$7<span className="text-sm font-normal text-muted-foreground">/month</span></p>
                                                <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                                                    <li className="flex items-center gap-2">
                                                        <Check className="size-4 text-green-500" /> Full Bible Access
                                                    </li>
                                                    <li className="flex items-center gap-2">
                                                        <Check className="size-4 text-green-500" /> Basic Search
                                                    </li>
                                                    <li className="flex items-center gap-2">
                                                        <Check className="size-4 text-green-500" /> Personal Notes
                                                    </li>
                                                </ul>
                                            </div>
                                            <Button asChild>
                                                <Link href="/checkout/price_1SqIgMLenlwJrzcOoUWAw2qf">
                                                    Subscribe
                                                </Link>
                                            </Button>
                                        </div>
                                    </div>
                                )}

                                {/* Pro Plan */}
                                <div className="rounded-lg border-2 border-primary bg-card p-6 relative">
                                    <div className="absolute -top-3 left-4 bg-primary text-primary-foreground text-xs px-2 py-1 rounded font-medium flex items-center gap-1">
                                        <Sparkles className="size-3" /> RECOMMENDED
                                    </div>
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <h4 className="font-medium">Journal Pro</h4>
                                            <p className="text-2xl font-bold mt-1">$27<span className="text-sm font-normal text-muted-foreground">/month</span></p>
                                            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                                                <li className="flex items-center gap-2">
                                                    <Check className="size-4 text-primary" /> Everything in Basic
                                                </li>
                                                <li className="flex items-center gap-2">
                                                    <Check className="size-4 text-primary" /> Advanced AI Insights
                                                </li>
                                                <li className="flex items-center gap-2">
                                                    <Check className="size-4 text-primary" /> Unlimited Journals
                                                </li>
                                                <li className="flex items-center gap-2">
                                                    <Check className="size-4 text-primary" /> Reading Plans
                                                </li>
                                            </ul>
                                        </div>
                                        <Button asChild className="bg-primary">
                                            <Link href="/checkout/price_1SqIgxLenlwJrzcOw7OEiD4n">
                                                {currentPlan === 'basic' ? 'Upgrade' : 'Subscribe'}
                                            </Link>
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Pro Member Status */}
                    {currentPlan === 'pro' && (
                        <div className="rounded-lg border border-primary/30 bg-primary/5 p-6">
                            <div className="flex items-center gap-3">
                                <div className="rounded-full bg-primary/10 p-3">
                                    <Crown className="size-6 text-primary" />
                                </div>
                                <div>
                                    <h3 className="font-medium">You're a Pro Member!</h3>
                                    <p className="text-sm text-muted-foreground">
                                        You have access to all premium features including AI insights and unlimited journals.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Manage Subscription Link */}
                    {currentPlan !== 'none' && (
                        <div className="pt-4 border-t border-border/50">
                            <p className="text-sm text-muted-foreground">
                                Need to update your payment method or cancel?{' '}
                                <a
                                    href="/billing-portal"
                                    className="text-primary hover:underline"
                                >
                                    Manage Billing
                                </a>
                            </p>
                        </div>
                    )}
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
