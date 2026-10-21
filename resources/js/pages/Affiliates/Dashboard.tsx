import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { BadgeDollarSign, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Affiliate', href: '/affiliate' },
];

interface Payout {
    id: number;
    amount_cents: number;
    method: string;
    reference: string | null;
    paid_at: string | null;
}

interface Props {
    affiliate: {
        code: string;
        status: string;
        referral_url: string;
        commission_rate: number;
    };
    stats: {
        clicks: number;
        signups: number;
        earned_cents: number;
        owed_cents: number;
        paid_cents: number;
    };
    payouts: Payout[];
}

function dollars(cents: number): string {
    return `$${(cents / 100).toFixed(2)}`;
}

export default function AffiliateDashboard({ affiliate, stats, payouts }: Props) {
    const [copied, setCopied] = useState(false);

    const copyLink = async () => {
        try {
            await navigator.clipboard.writeText(affiliate.referral_url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            /* clipboard unavailable — user can select manually */
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Affiliate Dashboard" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-8">
                <div className="flex items-center gap-3">
                    <BadgeDollarSign className="size-8 text-primary" />
                    <div>
                        <h1 className="font-serif text-2xl font-bold">Affiliate Dashboard</h1>
                        <p className="text-sm text-muted-foreground">
                            {Math.round(affiliate.commission_rate * 100)}% commission on subscription revenue
                        </p>
                    </div>
                </div>

                {/* Referral link */}
                <Card>
                    <CardHeader>
                        <CardTitle>Your referral link</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                            <code className="flex-1 rounded-md border bg-muted px-3 py-2 text-sm break-all">
                                {affiliate.referral_url}
                            </code>
                            <Button type="button" onClick={copyLink} className="gap-2">
                                {copied ? <Check size={16} /> : <Copy size={16} />}
                                {copied ? 'Copied!' : 'Copy link'}
                            </Button>
                        </div>
                        <p className="mt-2 text-xs text-muted-foreground">
                            Share this link. Signups within 30 days of clicking are credited to you.
                        </p>
                    </CardContent>
                </Card>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                    {[
                        { label: 'Link clicks', value: String(stats.clicks) },
                        { label: 'Signups', value: String(stats.signups) },
                        { label: 'Total earned', value: dollars(stats.earned_cents) },
                        { label: 'Currently owed', value: dollars(stats.owed_cents) },
                    ].map((s) => (
                        <Card key={s.label}>
                            <CardContent className="pt-6">
                                <div className="font-serif text-2xl font-bold">{s.value}</div>
                                <div className="text-xs uppercase tracking-widest text-muted-foreground">
                                    {s.label}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Payout history */}
                <Card>
                    <CardHeader>
                        <CardTitle>Payout history</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {payouts.length === 0 ? (
                            <p className="text-sm text-muted-foreground">
                                No payouts yet. Payouts are arranged with the site owner and
                                recorded here.
                            </p>
                        ) : (
                            <ul className="divide-y">
                                {payouts.map((p) => (
                                    <li key={p.id} className="flex items-center justify-between py-3 text-sm">
                                        <div>
                                            <div className="font-medium">{dollars(p.amount_cents)}</div>
                                            <div className="text-xs text-muted-foreground">
                                                {p.method}
                                                {p.reference ? ` · ${p.reference}` : ''}
                                            </div>
                                        </div>
                                        <div className="text-xs text-muted-foreground">{p.paid_at}</div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </CardContent>
                </Card>

                <p className="text-xs text-muted-foreground">
                    Questions about your earnings? <Link href="/contact" className="underline hover:text-primary">Contact us</Link>.
                </p>
            </div>
        </AppLayout>
    );
}
