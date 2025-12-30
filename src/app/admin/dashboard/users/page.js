"use client";
import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, X } from 'lucide-react';
import { toast } from 'sonner';
import { adminService } from '@/services/adminService';
import AddUserModal from '@/components/admin/AddUserModal';
import EditUserModal from '@/components/admin/EditUserModal';
import { DeleteUserDialog } from '@/components/admin/DeleteUserDialog';
import BanUserDialog from '@/components/admin/BanUserDialog';
import UsersTable from '@/components/admin/UsersTable';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import BanInfoDialog from '@/components/admin/BanInfoDialog';

export default function UsersPage() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [editingUser, setEditingUser] = useState(null);
    const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
    const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false);
    const [sorting, setSorting] = useState({ column: 'name', direction: 'asc' });
    const [userToDelete, setUserToDelete] = useState(null);
    const [isDeleteUserDialogOpen, setIsDeleteUserDialogOpen] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);

    // Ban Logic
    const [userToBan, setUserToBan] = useState(null);
    const [isBanDialogOpen, setIsBanDialogOpen] = useState(false);
    const [banLoading, setBanLoading] = useState(false);
    const [viewingBanUser, setViewingBanUser] = useState(null);

    useEffect(() => {
        fetchUsers();
    }, [page, searchQuery]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const data = await adminService.getAllUsers(page, 10, searchQuery);

            let usersData = [];
            let totalPagesData = 1;

            if (Array.isArray(data)) {
                usersData = data;
            } else if (data?.users) {
                usersData = data.users;
                totalPagesData = data.totalPages || 1;
            } else if (data?.data) {
                usersData = data.data;
                totalPagesData = data.last_page || data.totalPages || 1;
            }

            if (page === 1) {
                setUsers(usersData || []);
            } else {
                setUsers(prev => [...prev, ...usersData]);
            }
            setTotalPages(totalPagesData);
            setHasMore(page < totalPagesData);
        } catch (error) {
            console.error('Failed to fetch users:', error);
            toast.error('Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        setSearchQuery(e.target.value);
        setPage(1);
    };

    const handleLoadMore = () => {
        if (hasMore) {
            setPage(prev => prev + 1);
        }
    };

    const handleSort = (column) => {
        setSorting(prev => ({
            column,
            direction: prev.column === column && prev.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

    const handleDeleteUser = (user) => {
        setUserToDelete(user);
        setIsDeleteUserDialogOpen(true);
    };

    const confirmDeleteUser = async () => {
        if (!userToDelete) return;
        setDeleteLoading(true);
        try {
            await adminService.deleteUser(userToDelete.user_id || userToDelete.id);
            setUsers(prev => prev.filter(u => (u.id || u.user_id) !== (userToDelete.id || userToDelete.user_id)));
            setIsDeleteUserDialogOpen(false);
            setUserToDelete(null);
            toast.success('User deleted successfully');
        } catch (error) {
            console.error('Failed to delete user:', error);
            toast.error('Failed to delete user');
        } finally {
            setDeleteLoading(false);
        }
    };

    const handleBanUser = (user) => {
        setUserToBan(user);
        setIsBanDialogOpen(true);
    };

    const handleConfirmBan = async (banData) => {
        if (!userToBan) return;
        setBanLoading(true);
        try {
            await adminService.banUser(userToBan.user_id, banData);
            // Update local state to reflect change
            setUsers(prev => prev.map(u =>
                (u.id || u.user_id) === (userToBan.id || userToBan.user_id)
                    ? { ...u, is_banned: true, ban_type: banData.type || 'PERMANENT', ban_details: { type: banData.type, description: banData.reason, start_date: new Date(), end_date: banData.end_date } } // Optimistic update with details
                    : u
            ));
            toast.success('User banned successfully');
            setIsBanDialogOpen(false);
            setUserToBan(null);
        } catch (error) {
            console.error('Failed to ban user:', error);
            toast.error('Failed to ban user');
        } finally {
            setBanLoading(false);
        }
    };

    const handleUnbanUser = async (user) => {
        try {
            await adminService.unbanUser(user.user_id || "");
            setUsers(prev => prev.map(u =>
                (u.user_id || "") === (user.user_id || "")
                    ? { ...u, is_banned: false, ban_type: null, ban_details: null }
                    : u
            ));
            toast.success('User access restored successfully');
        } catch (error) {
            console.error('Failed to unban user:', error);
            toast.error('Failed to unban user');
        }
    };

    return (
        <div className="w-full h-full space-y-6">

            {/* Header Section */}
            <div className="flex flex-col gap-6">

                {/* Actions Row */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                {/* Left: Title */}
                <p className="text-4xl font-bold text-gray-900">
                    All users <span className="text-gray-400 font-normal ml-2">{users?.length || 0}</span>
                </p>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        {/* Search */}
                        <div className="relative flex-1 md:min-w-[320px]">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <Input
                                placeholder="Search"
                                value={searchQuery}
                                onChange={handleSearch}
                                className="pl-10 h-10 w-full bg-white border-gray-200 focus-visible:ring-1 focus-visible:ring-gray-400 rounded-lg shadow-sm"
                            />
                            {searchQuery && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSearchQuery("");
                                        setPage(1);
                                    }}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </div>

                        {/* Filters Button */}
                        <Button variant="outline" className="h-10 px-4 border-gray-200 text-gray-700 bg-white hover:bg-gray-50 font-medium rounded-lg shadow-sm">
                            <Filter className="w-4 h-4 mr-2" />
                            Filters
                        </Button>

                        {/* Add User Button */}
                        <Button
                            onClick={() => setIsAddUserModalOpen(true)}
                            className="bg-gray-900 hover:bg-gray-800 text-white h-10 px-4 font-medium rounded-lg shadow-sm"
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            Add user
                        </Button>
                    </div>
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-xl shadow max-w-full mx-auto">
                <UsersTable
                    users={users}
                    loading={loading && page === 1}
                    sorting={sorting}
                    onSort={handleSort}
                    onEditUser={(user) => {
                        setEditingUser(user);
                        setIsEditUserModalOpen(true);
                    }}
                    onDeleteUser={handleDeleteUser}
                    onBanUser={handleBanUser}
                    onUnbanUser={handleUnbanUser}
                    onViewBanDetails={(user) => setViewingBanUser(user)}
                />
            </div>

            {/* Pagination */}
            {hasMore && !loading && (
                <div className="flex justify-center mt-6">
                    <Button
                        variant="ghost"
                        onClick={handleLoadMore}
                        className="text-[#7564ed] hover:bg-[#7564ed]/10 hover:text-[#7564ed]"
                    >
                        Load more users
                    </Button>
                </div>
            )}

            <EditUserModal
                user={editingUser}
                open={isEditUserModalOpen}
                onOpenChange={setIsEditUserModalOpen}
                onUpdate={() => {
                    setPage(1);
                    fetchUsers();
                }}
            />

            <AddUserModal
                open={isAddUserModalOpen}
                onOpenChange={setIsAddUserModalOpen}
                onUserAdded={() => {
                    setPage(1);
                    fetchUsers();
                }}
            />
            <DeleteUserDialog
                open={isDeleteUserDialogOpen}
                onOpenChange={setIsDeleteUserDialogOpen}
                user={userToDelete}
                onConfirm={confirmDeleteUser}
                loading={deleteLoading}
            />

            <BanUserDialog
                open={isBanDialogOpen}
                onOpenChange={setIsBanDialogOpen}
                onConfirm={handleConfirmBan}
                loading={banLoading}
                userName={userToBan ? `${userToBan.firstName} ${userToBan.lastName}` : ''}
            />

            <BanInfoDialog
                open={!!viewingBanUser}
                onOpenChange={(open) => !open && setViewingBanUser(null)}
                user={viewingBanUser}
                banDetails={viewingBanUser?.ban_details}
                onUnban={handleUnbanUser}
            />
        </div>
    );
}
