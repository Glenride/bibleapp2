import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';

import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface User {
    id: number;
    name: string;
    email: string;
    is_admin: boolean;
    is_super_admin: boolean;
    is_beta_tester: boolean;
    beta_expires_at: string | null;
    is_active_beta: boolean;
    current_plan: string;
    subscription_ends_at: string | null;
    created_at: string;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Admin',
        href: '/admin/users',
    },
    {
        title: 'Users',
        href: '/admin/users',
    },
];

export default function AdminUsers({ users }: { users: User[] }) {
    const [betaDialogOpen, setBetaDialogOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [expiresInDays, setExpiresInDays] = useState<string>('30');

    const handleMakeAdmin = (userId: number) => {
        router.post(`/admin/users/${userId}/make-admin`);
    };

    const handleRemoveAdmin = (userId: number) => {
        router.post(`/admin/users/${userId}/remove-admin`);
    };

    const handleAssignTrial = (userId: number) => {
        router.post(`/admin/users/${userId}/assign-trial`);
    };

    const handleCancelSubscription = (userId: number) => {
        router.post(`/admin/users/${userId}/cancel-subscription`);
    };

    const openBetaDialog = (user: User) => {
        setSelectedUser(user);
        setBetaDialogOpen(true);
    };

    const handleToggleBeta = () => {
        if (!selectedUser) return;

        router.post(`/admin/users/${selectedUser.id}/toggle-beta`, {
            expires_in_days: expiresInDays ? parseInt(expiresInDays) : null,
        }, {
            onSuccess: () => {
                setBetaDialogOpen(false);
                setSelectedUser(null);
                setExpiresInDays('30');
            }
        });
    };

    const handleRemoveBeta = (userId: number) => {
        router.post(`/admin/users/${userId}/remove-beta`);
    };

    const getPlanBadge = (plan: string) => {
        const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
            pro: 'default',
            trial: 'secondary',
            basic: 'outline',
            none: 'destructive',
        };
        return <Badge variant={variants[plan] || 'outline'}>{plan.toUpperCase()}</Badge>;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Admin - Users" />

            <div className="p-6 space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">User Management</h1>
                    <p className="text-muted-foreground">Manage users, subscriptions, and beta access</p>
                </div>

                <div className="rounded-lg border bg-card">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>User</TableHead>
                                <TableHead>Plan</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Joined</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell>
                                        <div>
                                            <p className="font-medium">{user.name}</p>
                                            <p className="text-sm text-muted-foreground">{user.email}</p>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col gap-1">
                                            {getPlanBadge(user.current_plan)}
                                            {user.subscription_ends_at && (
                                                <span className="text-xs text-muted-foreground">
                                                    Ends: {user.subscription_ends_at}
                                                </span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-wrap gap-1">
                                            {user.is_super_admin && (
                                                <Badge variant="default" className="bg-purple-600">Super Admin</Badge>
                                            )}
                                            {user.is_admin && !user.is_super_admin && (
                                                <Badge variant="default">Admin</Badge>
                                            )}
                                            {user.is_active_beta && (
                                                <Badge variant="secondary" className="bg-amber-500 text-white">
                                                    Beta Tester
                                                    {user.beta_expires_at && (
                                                        <span className="ml-1 text-xs">
                                                            (until {user.beta_expires_at})
                                                        </span>
                                                    )}
                                                </Badge>
                                            )}
                                            {user.is_beta_tester && !user.is_active_beta && (
                                                <Badge variant="outline" className="text-muted-foreground">
                                                    Beta Expired
                                                </Badge>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground text-sm">
                                        {user.created_at}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex flex-wrap justify-end gap-2">
                                            {/* Admin Controls */}
                                            {!user.is_super_admin && (
                                                user.is_admin ? (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleRemoveAdmin(user.id)}
                                                    >
                                                        Remove Admin
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleMakeAdmin(user.id)}
                                                    >
                                                        Make Admin
                                                    </Button>
                                                )
                                            )}

                                            {/* Beta Tester Controls */}
                                            {user.is_active_beta ? (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="border-amber-500 text-amber-600 hover:bg-amber-50"
                                                    onClick={() => handleRemoveBeta(user.id)}
                                                >
                                                    Remove Beta
                                                </Button>
                                            ) : (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="border-amber-500 text-amber-600 hover:bg-amber-50"
                                                    onClick={() => openBetaDialog(user)}
                                                >
                                                    Add Beta
                                                </Button>
                                            )}

                                            {/* Subscription Controls */}
                                            {user.current_plan === 'none' && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleAssignTrial(user.id)}
                                                >
                                                    Assign Trial
                                                </Button>
                                            )}
                                            {user.current_plan !== 'none' && (
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={() => handleCancelSubscription(user.id)}
                                                >
                                                    Cancel Sub
                                                </Button>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {/* Beta Tester Dialog */}
            <Dialog open={betaDialogOpen} onOpenChange={setBetaDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add Beta Tester</DialogTitle>
                        <DialogDescription>
                            Grant beta access to {selectedUser?.name}. Beta testers get full Pro access without payment.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="expires_in_days">Beta Access Duration (Days)</Label>
                            <Input
                                id="expires_in_days"
                                type="number"
                                placeholder="Leave empty for permanent access"
                                value={expiresInDays}
                                onChange={(e) => setExpiresInDays(e.target.value)}
                                min="1"
                                max="365"
                            />
                            <p className="text-xs text-muted-foreground">
                                Leave empty for permanent beta access, or enter number of days (1-365).
                            </p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setBetaDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleToggleBeta} className="bg-amber-500 hover:bg-amber-600">
                            Grant Beta Access
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
