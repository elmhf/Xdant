"use client";
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { adminService } from '@/services/adminService';
import { ArrowLeft, Mail, Shield, Calendar, UserCheck, Trash2, Activity, MapPin } from 'lucide-react';
import { toast } from 'sonner';

export default function UserDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (params.userId) {
            fetchUser(params.userId);
        }
    }, [params.userId]);

    const fetchUser = async (id) => {
        try {
            setLoading(true);
            const data = await adminService.getUserById(id);
            console.log("User Detail API Response:", data);

            // Handle different response structures gracefully
            let userData = data;
            if (data?.data) userData = data.data;
            else if (data?.user) userData = data.user;

            setUser(userData);
        } catch (error) {
            console.error('Failed to fetch user details:', error);
            toast.error('Failed to load user details');
        } finally {
            setLoading(false);
        }
    };

    const handlePromoteUser = async () => {
        if (!confirm('Promote this user to Admin?')) return;
        try {
            await adminService.promoteToAdmin(user.email);
            toast.success('User promoted to Admin successfully');
            fetchUser(user.id); // Refresh data
        } catch (error) {
            toast.error('Failed to promote user');
        }
    };

    const handleDeleteUser = async () => {
        if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
        try {
            await adminService.deleteUser(user.id);
            toast.success('User deleted successfully');
            router.push('/admin/dashboard/users');
        } catch (error) {
            toast.error('Failed to delete user');
        }
    };

    if (loading) {
        return <div className="p-8 text-center text-gray-500">Loading user details...</div>;
    }

    if (!user) {
        return (
            <div className="p-8 text-center">
                <p className="text-gray-500 mb-4">User not found</p>
                <button
                    onClick={() => router.back()}
                    className="text-blue-600 hover:underline"
                >
                    Go back
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <button
                onClick={() => router.back()}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
                <ArrowLeft size={20} />
                Back to Users
            </button>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-2xl font-bold">
                            {(user.first_name || user.firstName || 'U')?.charAt(0)}
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                {user.first_name || user.firstName} {user.last_name || user.lastName}
                            </h1>
                            <div className="flex items-center gap-2 text-gray-500 mt-1">
                                <Mail size={16} />
                                {user.email}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={handlePromoteUser}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors font-medium"
                        >
                            <UserCheck size={18} />
                            Promote to Admin
                        </button>
                        <button
                            onClick={handleDeleteUser}
                            className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors font-medium"
                        >
                            <Trash2 size={18} />
                            Delete User
                        </button>
                    </div>
                </div>

                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">Account Details</h3>
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                    <Shield className="text-gray-400" size={20} />
                                    <div>
                                        <div className="text-sm text-gray-500">Role</div>
                                        <div className="font-medium text-gray-900">{user.role || 'User'}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                    <Activity className="text-gray-400" size={20} />
                                    <div>
                                        <div className="text-sm text-gray-500">Status</div>
                                        <div className={`font-medium ${user.isActive !== false ? 'text-green-600' : 'text-gray-600'}`}>
                                            {user.isActive !== false ? 'Active' : 'Inactive'}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                    <Calendar className="text-gray-400" size={20} />
                                    <div>
                                        <div className="text-sm text-gray-500">Joined Date</div>
                                        <div className="font-medium text-gray-900">
                                            {new Date(user.created_at).toLocaleDateString(undefined, {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">Associations</h3>
                            {/* Placeholder for future clinic/report associations */}
                            <div className="p-4 border border-dashed border-gray-300 rounded-lg text-center text-gray-500">
                                <p>No associated clinics or recent reports found.</p>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">Raw Data</h3>
                            <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-xs overflow-x-auto">
                                {JSON.stringify(user, null, 2)}
                            </pre>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
