import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface Props {
    affiliate: {
        id: number;
        name: string | null;
        email: string | null;
        code: string;
        status: string;
        commission_rate: number;
        commission_override: number | null;
        payout_details: string | null;
        notes: string | null;
        referral_url: string;
    };
    stats: {
        clicks: number;
        signups: number;
        earned_cents: number;
        owed_cents: number;
        paid_cents: number;
    };
    referrals: { id: number; name: string | null; email: string | null; created_at: string | null }[];
    earnings: {
        id: number;
        amount_cents: number;
        kind: string;
        status: string;
        description: string | null;
        created_at: string | null;
    }[];
    payouts: {
        id: number;
        amount_cents: number;
        method: string;
        reference: string | null;
        notes: string | null;
        paid_at: string | null;
    }[];
}

function dollars(cents: number): string {
    return `$${(cents / 100).toFixed(2)}`;
}

export default function AdminAffiliateShow({ affiliate, stats, referrals, earnings, payouts }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Affiliates', href: '/admin/affiliates' },
        { title: affiliate.name ?? affiliate.code, href: '#' },
    ];

    const statusForm = useForm({ status: affiliate.status });
    const detailsForm = useForm({
        commission_rate: affiliate.commission_override ?? '',
        payout_details: affiliate.payout_details ?? '',
        notes: affiliate.notes ?? '',
    });
    const payoutForm = useForm({ amount_dollars: '', method: 'cashapp', reference: '', notes: '' });
    const adjustForm = useForm({ amount_dollars: '', description: '' });

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Affiliate — ${affiliate.name ?? affiliate.code}`} />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-8">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h1 className="font-serif text-2xl font-bold">
                            {affiliate.name ?? 'Affiliate'} <Badge className="ml-2">{affiliate.status}</Badge>
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            {affiliate.email} · Code <span className="font-mono">{affiliate.code}</span>
                        </p>
                    </div>
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            statusForm.patch(`/admin/affiliates/${affiliate.id}/status`);
                        }}
                        className="flex items-center gap-2"
                    >
                        <select
                            value={statusForm.data.status}
                            onChange={(e) => statusForm.setData('status', e.target.value)}
                            className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                            aria-label="Affiliate status"
                        >
                            <option value="invited">invited</option>
                            <option value="active">active</option>
                            <option value="suspended">suspended</option>
                        </select>
                        <Button type="submit" variant="outline" disabled={statusForm.processing}>
                            Set status
                        </Button>
                    </form>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
                    {[
                        { label: 'Clicks', value: String(stats.clicks) },
                        { label: 'Signups', value: String(stats.signups) },
                        { label: 'Earned', value: dollars(stats.earned_cents) },
                        { label: 'Owed', value: dollars(stats.owed_cents) },
                        { label: 'Paid out', value: dollars(stats.paid_cents) },
                    ].map((s) => (
                        <Card key={s.label}>
                            <CardContent className="pt-6">
                                <div className="font-serif text-2xl font-bold">{s.value}</div>
                                <div className="text-xs uppercase tracking-widest text-muted-foreground">{s.label}</div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Record payout */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Record payout</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="mb-4 text-sm text-muted-foreground">
                                Pay the creator however you like (Cash App, Zelle, …), then
                                record it here. Currently owed: <strong>{dollars(stats.owed_cents)}</strong>.
                            </p>
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    payoutForm.post(`/admin/affiliates/${affiliate.id}/payouts`, {
                                        onSuccess: () => payoutForm.reset(),
                                    });
                                }}
                                className="grid gap-4"
                            >
                                <div className="grid gap-2">
                                    <Label htmlFor="amount">Amount (USD)</Label>
                                    <Input
                                        id="amount"
                                        type="number"
                                        step="0.01"
                                        min="0.01"
                                        value={payoutForm.data.amount_dollars}
                                        onChange={(e) => payoutForm.setData('amount_dollars', e.target.value)}
                                        required
                                    />
                                    {payoutForm.errors.amount_dollars && (
                                        <p className="text-sm text-destructive">{payoutForm.errors.amount_dollars}</p>
                                    )}
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="method">Method</Label>
                                    <select
                                        id="method"
                                        value={payoutForm.data.method}
                                        onChange={(e) => payoutForm.setData('method', e.target.value)}
                                        className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    >
                                        <option value="cashapp">Cash App</option>
                                        <option value="zelle">Zelle</option>
                                        <option value="venmo">Venmo</option>
                                        <option value="paypal">PayPal</option>
                                        <option value="manual">Other / manual</option>
                                    </select>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="reference">Reference (optional)</Label>
                                    <Input
                                        id="reference"
                                        value={payoutForm.data.reference}
                                        onChange={(e) => payoutForm.setData('reference', e.target.value)}
                                        placeholder="e.g. Cash App $receipt id"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="payout-notes">Notes (optional)</Label>
                                    <Textarea
                                        id="payout-notes"
                                        value={payoutForm.data.notes}
                                        onChange={(e) => payoutForm.setData('notes', e.target.value)}
                                    />
                                </div>
                                <Button type="submit" disabled={payoutForm.processing || stats.owed_cents <= 0}>
                                    Record payout
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Manual adjustment + details */}
                    <div className="flex flex-col gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Manual adjustment</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        adjustForm.post(`/admin/affiliates/${affiliate.id}/adjustments`, {
                                            onSuccess: () => adjustForm.reset(),
                                        });
                                    }}
                                    className="grid gap-4"
                                >
                                    <div className="grid gap-2">
                                        <Label htmlFor="adj-amount">Amount (USD, negative for debit)</Label>
                                        <Input
                                            id="adj-amount"
                                            type="number"
                                            step="0.01"
                                            value={adjustForm.data.amount_dollars}
                                            onChange={(e) => adjustForm.setData('amount_dollars', e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="adj-desc">Description</Label>
                                        <Input
                                            id="adj-desc"
                                            value={adjustForm.data.description}
                                            onChange={(e) => adjustForm.setData('description', e.target.value)}
                                            placeholder="e.g. Launch bonus"
                                            required
                                        />
                                    </div>
                                    <Button type="submit" variant="outline" disabled={adjustForm.processing}>
                                        Record adjustment
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Affiliate details</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        detailsForm.patch(`/admin/affiliates/${affiliate.id}`);
                                    }}
                                    className="grid gap-4"
                                >
                                    <div className="grid gap-2">
                                        <Label htmlFor="rate">Commission rate override (0–1, blank = default {Math.round(affiliate.commission_rate * 100)}%)</Label>
                                        <Input
                                            id="rate"
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            max="1"
                                            value={detailsForm.data.commission_rate}
                                            onChange={(e) => detailsForm.setData('commission_rate', e.target.value)}
                                            placeholder="e.g. 0.25"
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="pd">Payout details</Label>
                                        <Textarea
                                            id="pd"
                                            value={detailsForm.data.payout_details}
                                            onChange={(e) => detailsForm.setData('payout_details', e.target.value)}
                                            placeholder="How the creator wants to be paid"
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="an">Notes</Label>
                                        <Textarea
                                            id="an"
                                            value={detailsForm.data.notes}
                                            onChange={(e) => detailsForm.setData('notes', e.target.value)}
                                        />
                                    </div>
                                    <Button type="submit" variant="outline" disabled={detailsForm.processing}>
                                        Save details
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                <Separator />

                {/* Ledgers */}
                <div className="grid gap-6 lg:grid-cols-3">
                    <Card>
                        <CardHeader>
                            <CardTitle>Referrals ({referrals.length})</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {referrals.length === 0 ? (
                                <p className="text-sm text-muted-foreground">No signups yet.</p>
                            ) : (
                                <ul className="divide-y text-sm">
                                    {referrals.map((r) => (
                                        <li key={r.id} className="py-2">
                                            <div className="font-medium">{r.name ?? r.email ?? `#${r.id}`}</div>
                                            <div className="text-xs text-muted-foreground">{r.created_at}</div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Earnings ledger</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {earnings.length === 0 ? (
                                <p className="text-sm text-muted-foreground">No earnings yet.</p>
                            ) : (
                                <ul className="divide-y text-sm">
                                    {earnings.map((e) => (
                                        <li key={e.id} className="flex items-center justify-between py-2">
                                            <div>
                                                <div className="font-medium">{dollars(e.amount_cents)}</div>
                                                <div className="text-xs text-muted-foreground">
                                                    {e.kind} · {e.status}
                                                    {e.description ? ` · ${e.description}` : ''}
                                                </div>
                                            </div>
                                            <div className="text-xs text-muted-foreground">{e.created_at}</div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Payouts ledger</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {payouts.length === 0 ? (
                                <p className="text-sm text-muted-foreground">No payouts recorded.</p>
                            ) : (
                                <ul className="divide-y text-sm">
                                    {payouts.map((p) => (
                                        <li key={p.id} className="py-2">
                                            <div className="font-medium">{dollars(p.amount_cents)} · {p.method}</div>
                                            <div className="text-xs text-muted-foreground">
                                                {p.paid_at}
                                                {p.reference ? ` · ${p.reference}` : ''}
                                                {p.notes ? ` · ${p.notes}` : ''}
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
