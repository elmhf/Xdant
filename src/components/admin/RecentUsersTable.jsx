import Link from 'next/link';
import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, MoreVertical, Ban, ShieldCheck, Loader2, ArrowRight } from "lucide-react";
import {
    Empty,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from "@/components/ui/empty";

import BanUserDialog from './BanUserDialog';
import { adminService } from '@/services/adminService';
import { toast } from 'sonner';

export default function RecentUsersTable({ users, loading, onRefresh }) {
    const [selectedUser, setSelectedUser] = useState(null);
    const [isBanDialogOpen, setIsBanDialogOpen] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);

    const handleBanClick = (user) => {
        setSelectedUser(user);
        setIsBanDialogOpen(true);
    };

    const handleUnbanClick = async (user) => {
        if (!confirm(`Are you sure you want to restore access for ${user.firstName}?`)) return;

        setActionLoading(true);
        try {
            await adminService.unbanUser(user.user_id || "");
            toast.success("User access restored successfully");
            if (onRefresh) onRefresh();
        } catch (error) {
            console.error(error);
            toast.error("Failed to unban user");
        } finally {
            setActionLoading(false);
        }
    };

    const handleBanConfirm = async (banData) => {
        if (!selectedUser) return;

        setActionLoading(true);
        try {
            await adminService.banUser(selectedUser.id || selectedUser.user_id, banData);
            toast.success("User banned successfully");
            setIsBanDialogOpen(false);
            if (onRefresh) onRefresh();
        } catch (error) {
            console.error(error);
            toast.error("Failed to ban user");
        } finally {
            setActionLoading(false);
        }
    };

    return (
        <>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col h-full">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                    <div className="space-y-1">
                        <p className="text-4xl font-semibold text-gray-900">Recent Users</p>
                        <p className="text-md font-medium text-gray-500">Latest users registered on the platform.</p>
                    </div>
                    <Link href="/admin/dashboard/users">
                        <button className="h-10 w-10 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors text-gray-600">
                            <ArrowRight className="h-5 w-5" />
                        </button>
                    </Link>
                </div>
                <div className="overflow-x-auto flex-1">
                    <table className="w-full">
                        <thead className="bg-gray-100/20 border-b border-gray-200 sticky top-0 z-10 filter backdrop-blur-sm">
                            <tr>
                                <th className="min-w-64 text-left py-3 px-6 text-lg font-medium text-gray-700">User</th>
                                <th className="text-left py-3 px-6 text-lg font-medium text-gray-700">User ID</th>

                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                [...Array(5)].map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-48"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-24"></div></td>

                                    </tr>
                                ))
                            ) : users?.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="">
                                        <Empty>
                                            <EmptyHeader>
                                                <EmptyMedia variant="icon">
                                                    <User className="h-10 w-10 text-gray-400" />
                                                </EmptyMedia>
                                                <EmptyTitle className="text-xl font-semibold">
                                                    No users found
                                                </EmptyTitle>
                                                <EmptyDescription className="text-gray-600 text-base">
                                                    No recent users.
                                                </EmptyDescription>
                                            </EmptyHeader>
                                        </Empty>
                                    </td>
                                </tr>
                            ) : (
                                users?.slice(0, 5).map((user) => (
                                    <tr key={user.id || user.user_id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors group">
                                        <td className="min-w-64 py-4 px-4 font-medium text-gray-900">
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-10 w-10 rounded-full shrink-0">
                                                    <AvatarImage src={user.profilePhotoUrl} alt={`${user.firstName} ${user.lastName}`} />
                                                    <AvatarFallback className="bg-gradient-to-br from-[#A196F3] to-[#7564ED] text-white">
                                                        {user.firstName?.[0] || 'U'}{user.lastName?.[0] || ''}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex flex-col">
                                                    <span className="text-base font-medium text-gray-900">{user.firstName} {user.lastName}</span>
                                                    <span className="text-xs text-gray-400 font-normal">{user.email}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="min-w-32 py-4 px-4">
                                            <span className="font-mono text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded border border-gray-100">
                                                {user.user_id || "-"}
                                            </span>
                                        </td>

                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <BanUserDialog
                open={isBanDialogOpen}
                onOpenChange={setIsBanDialogOpen}
                onConfirm={handleBanConfirm}
                loading={actionLoading}
                userName={selectedUser ? `${selectedUser.firstName} ${selectedUser.lastName}` : ''}
            />
        </>
    );
}
