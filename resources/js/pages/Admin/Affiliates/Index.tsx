import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Affiliates', href: '/admin/affiliates' }];

interface AffiliateRow {
    id: number;
    name: string | null;
    email: string | null;
    code: string;
    status: string;
    clicks: number;
    signups: number;
    earned_cents: number;
    owed_cents: number;
    created_at: string | null;
}

function dollars(cents: number): string {
    return `$${(cents / 100).toFixed(2)}`;
}

function statusBadge(status: string) {
    const variant = status === 'active' ? 'default' : status === 'suspended' ? 'destructive' : 'secondary';
    return <Badge variant={variant}>{status}</Badge>;
}

export default function AdminAffiliatesIndex({ affiliates }: { affiliates: AffiliateRow[] }) {
    const [showInvite, setShowInvite] = useState(false);
    const form = useForm({ email: '', payout_details: '', notes: '' });

    const submitInvite = (e: React.FormEvent) => {
        e.preventDefault();
        form.post(route('admin.affiliates.invite'), {
            onSuccess: () => {
                form.reset();
                setShowInvite(false);
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Affiliates" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-8">
                <div className="flex items-center justify-between">
                    <h1 className="font-serif text-2xl font-bold">Affiliates</h1>
                    <Button type="button" onClick={() => setShowInvite((v) => !v)}>
                        Invite creator
                    </Button>
                </div>

                {showInvite && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Invite a creator</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="mb-4 text-sm text-muted-foreground">
                                Invite-only: the creator must already have an account. Enter
                                their account email — they'll get a referral code immediately.
                            </p>
                            <form onSubmit={submitInvite} className="grid max-w-lg gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="email">Account email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={form.data.email}
                                        onChange={(e) => form.setData('email', e.target.value)}
                                        required
                                    />
                                    {form.errors.email && (
                                        <p className="text-sm text-destructive">{form.errors.email}</p>
                                    )}
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="payout_details">Payout details (optional)</Label>
                                    <Textarea
                                        id="payout_details"
                                        value={form.data.payout_details}
                                        onChange={(e) => form.setData('payout_details', e.target.value)}
                                        placeholder="e.g. Cash App: $creator"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="notes">Notes (optional)</Label>
                                    <Textarea
                                        id="notes"
                                        value={form.data.notes}
                                        onChange={(e) => form.setData('notes', e.target.value)}
                                    />
                                </div>
                                <Button type="submit" disabled={form.processing}>
                                    Create affiliate
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                )}

                <Card>
                    <CardContent className="pt-6">
                        {affiliates.length === 0 ? (
                            <p className="text-sm text-muted-foreground">
                                No affiliates yet. Invite your first creator above.
                            </p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b text-left text-xs uppercase tracking-widest text-muted-foreground">
                                            <th className="py-2 pr-4">Creator</th>
                                            <th className="py-2 pr-4">Code</th>
                                            <th className="py-2 pr-4">Status</th>
                                            <th className="py-2 pr-4 text-right">Clicks</th>
                                            <th className="py-2 pr-4 text-right">Signups</th>
                                            <th className="py-2 pr-4 text-right">Earned</th>
                                            <th className="py-2 pr-4 text-right">Owed</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {affiliates.map((a) => (
                                            <tr key={a.id} className="border-b last:border-0">
                                                <td className="py-3 pr-4">
                                                    <Link
                                                        href={route('admin.affiliates.show', a.id)}
                                                        className="font-medium hover:text-primary"
                                                    >
                                                        {a.name ?? a.email ?? `#${a.id}`}
                                                    </Link>
                                                    {a.email && (
                                                        <div className="text-xs text-muted-foreground">{a.email}</div>
                                                    )}
                                                </td>
                                                <td className="py-3 pr-4 font-mono">{a.code}</td>
                                                <td className="py-3 pr-4">{statusBadge(a.status)}</td>
                                                <td className="py-3 pr-4 text-right">{a.clicks}</td>
                                                <td className="py-3 pr-4 text-right">{a.signups}</td>
                                                <td className="py-3 pr-4 text-right">{dollars(a.earned_cents)}</td>
                                                <td className="py-3 pr-4 text-right font-medium">
                                                    {dollars(a.owed_cents)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
