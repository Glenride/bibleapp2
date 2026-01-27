import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';

import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
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
import { Clock, Users, AlertTriangle, CalendarX } from 'lucide-react';

interface TrialUser {
    id: number;
    name: string;
    email: string;
    trial_started_at: string | null;
    trial_ends_at: string | null;
    days_remaining: number | null;
    created_at: string;
}

interface Stats {
    total: number;
    expiring_in_3_days: number;
    expiring_in_7_days: number;
}

interface Props {
    users: TrialUser[];
    stats: Stats;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Admin',
        href: '/admin/users',
    },
    {
        title: 'Trials',
        href: '/admin/trials',
    },
];

export default function AdminTrials({ users, stats }: Props) {
    const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
    const [extendDialogOpen, setExtendDialogOpen] = useState(false);
    const [revokeDialogOpen, setRevokeDialogOpen] = useState(false);
    const [bulkExtendDialogOpen, setBulkExtendDialogOpen] = useState(false);
    const [bulkRevokeDialogOpen, setBulkRevokeDialogOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<TrialUser | null>(null);
    const [extendDays, setExtendDays] = useState<string>('7');

    const toggleUserSelection = (userId: number) => {
        setSelectedUsers(prev =>
            prev.includes(userId)
                ? prev.filter(id => id !== userId)
                : [...prev, userId]
        );
    };

    const toggleSelectAll = () => {
        if (selectedUsers.length === users.length) {
            setSelectedUsers([]);
        } else {
            setSelectedUsers(users.map(u => u.id));
        }
    };

    const openExtendDialog = (user: TrialUser) => {
        setSelectedUser(user);
        setExtendDays('7');
        setExtendDialogOpen(true);
    };

    const openRevokeDialog = (user: TrialUser) => {
        setSelectedUser(user);
        setRevokeDialogOpen(true);
    };

    const handleExtendTrial = () => {
        if (!selectedUser) return;
        router.post(`/admin/users/${selectedUser.id}/extend-trial`, {
            days: parseInt(extendDays),
        }, {
            onSuccess: () => {
                setExtendDialogOpen(false);
                setSelectedUser(null);
            }
        });
    };

    const handleRevokeTrial = () => {
        if (!selectedUser) return;
        router.post(`/admin/users/${selectedUser.id}/revoke-trial`, {}, {
            onSuccess: () => {
                setRevokeDialogOpen(false);
                setSelectedUser(null);
            }
        });
    };

    const handleBulkExtend = () => {
        router.post('/admin/trials/bulk-extend', {
            user_ids: selectedUsers,
            days: parseInt(extendDays),
        }, {
            onSuccess: () => {
                setBulkExtendDialogOpen(false);
                setSelectedUsers([]);
            }
        });
    };

    const handleBulkRevoke = () => {
        router.post('/admin/trials/bulk-revoke', {
            user_ids: selectedUsers,
        }, {
            onSuccess: () => {
                setBulkRevokeDialogOpen(false);
                setSelectedUsers([]);
            }
        });
    };

    const getDaysRemainingBadge = (days: number | null) => {
        if (days === null) return <Badge variant="outline">Unknown</Badge>;
        if (days < 0) return <Badge variant="destructive">Expired</Badge>;
        if (days <= 3) return <Badge variant="destructive">{days} days</Badge>;
        if (days <= 7) return <Badge className="bg-orange-500">{days} days</Badge>;
        return <Badge variant="secondary">{days} days</Badge>;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Admin - Trials" />

            <div className="p-6 space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Trials Management</h1>
                    <p className="text-muted-foreground">View, extend, and revoke user trial subscriptions</p>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-3">
                    <div className="rounded-lg border bg-card p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-full bg-primary/10">
                                <Users className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Active Trials</p>
                                <p className="text-2xl font-bold">{stats.total}</p>
                            </div>
                        </div>
                    </div>
                    <div className="rounded-lg border bg-card p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-full bg-orange-500/10">
                                <Clock className="h-5 w-5 text-orange-500" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Expiring in 7 Days</p>
                                <p className="text-2xl font-bold text-orange-500">{stats.expiring_in_7_days}</p>
                            </div>
                        </div>
                    </div>
                    <div className="rounded-lg border bg-card p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-full bg-red-500/10">
                                <AlertTriangle className="h-5 w-5 text-red-500" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Expiring in 3 Days</p>
                                <p className="text-2xl font-bold text-red-500">{stats.expiring_in_3_days}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bulk Actions Bar */}
                {selectedUsers.length > 0 && (
                    <div className="flex items-center gap-4 p-4 rounded-lg border bg-muted/50">
                        <span className="text-sm font-medium">
                            {selectedUsers.length} user{selectedUsers.length !== 1 ? 's' : ''} selected
                        </span>
                        <div className="flex gap-2">
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                    setExtendDays('7');
                                    setBulkExtendDialogOpen(true);
                                }}
                            >
                                Extend Selected
                            </Button>
                            <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => setBulkRevokeDialogOpen(true)}
                            >
                                Revoke Selected
                            </Button>
                        </div>
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setSelectedUsers([])}
                        >
                            Clear Selection
                        </Button>
                    </div>
                )}

                {/* Trials Table */}
                <div className="rounded-lg border bg-card">
                    {users.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                            <CalendarX className="h-12 w-12 mb-4 opacity-50" />
                            <p className="text-lg font-medium">No active trials</p>
                            <p className="text-sm">Users on trial plans will appear here</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-12">
                                        <Checkbox
                                            checked={selectedUsers.length === users.length && users.length > 0}
                                            onCheckedChange={toggleSelectAll}
                                        />
                                    </TableHead>
                                    <TableHead>User</TableHead>
                                    <TableHead>Trial Started</TableHead>
                                    <TableHead>Trial Ends</TableHead>
                                    <TableHead>Days Remaining</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users.map((user) => (
                                    <TableRow key={user.id}>
                                        <TableCell>
                                            <Checkbox
                                                checked={selectedUsers.includes(user.id)}
                                                onCheckedChange={() => toggleUserSelection(user.id)}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <div>
                                                <p className="font-medium">{user.name}</p>
                                                <p className="text-sm text-muted-foreground">{user.email}</p>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground text-sm">
                                            {user.trial_started_at || 'N/A'}
                                        </TableCell>
                                        <TableCell className="text-muted-foreground text-sm">
                                            {user.trial_ends_at || 'N/A'}
                                        </TableCell>
                                        <TableCell>
                                            {getDaysRemainingBadge(user.days_remaining)}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => openExtendDialog(user)}
                                                >
                                                    Extend
                                                </Button>
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={() => openRevokeDialog(user)}
                                                >
                                                    Revoke
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </div>
            </div>

            {/* Extend Trial Dialog */}
            <Dialog open={extendDialogOpen} onOpenChange={setExtendDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Extend Trial</DialogTitle>
                        <DialogDescription>
                            Extend the trial for {selectedUser?.name}. Current end date: {selectedUser?.trial_ends_at || 'Unknown'}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="extend_days">Extension Duration (Days)</Label>
                            <div className="flex gap-2">
                                {[7, 14, 30].map((days) => (
                                    <Button
                                        key={days}
                                        type="button"
                                        variant={extendDays === String(days) ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => setExtendDays(String(days))}
                                    >
                                        {days} days
                                    </Button>
                                ))}
                            </div>
                            <Input
                                id="extend_days"
                                type="number"
                                placeholder="Custom days"
                                value={extendDays}
                                onChange={(e) => setExtendDays(e.target.value)}
                                min="1"
                                max="365"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setExtendDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleExtendTrial}>
                            Extend Trial
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Revoke Trial Dialog */}
            <Dialog open={revokeDialogOpen} onOpenChange={setRevokeDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Revoke Trial</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to revoke the trial for {selectedUser?.name}? This will immediately cancel their subscription.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setRevokeDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleRevokeTrial}>
                            Revoke Trial
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Bulk Extend Dialog */}
            <Dialog open={bulkExtendDialogOpen} onOpenChange={setBulkExtendDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Extend {selectedUsers.length} Trials</DialogTitle>
                        <DialogDescription>
                            Extend the trial period for all selected users.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="bulk_extend_days">Extension Duration (Days)</Label>
                            <div className="flex gap-2">
                                {[7, 14, 30].map((days) => (
                                    <Button
                                        key={days}
                                        type="button"
                                        variant={extendDays === String(days) ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => setExtendDays(String(days))}
                                    >
                                        {days} days
                                    </Button>
                                ))}
                            </div>
                            <Input
                                id="bulk_extend_days"
                                type="number"
                                placeholder="Custom days"
                                value={extendDays}
                                onChange={(e) => setExtendDays(e.target.value)}
                                min="1"
                                max="365"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setBulkExtendDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleBulkExtend}>
                            Extend All
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Bulk Revoke Dialog */}
            <Dialog open={bulkRevokeDialogOpen} onOpenChange={setBulkRevokeDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Revoke {selectedUsers.length} Trials</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to revoke trials for {selectedUsers.length} user{selectedUsers.length !== 1 ? 's' : ''}? This will immediately cancel their subscriptions.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setBulkRevokeDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleBulkRevoke}>
                            Revoke All
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
