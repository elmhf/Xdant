"use client";
export const dynamic = "force-dynamic";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    Database,
    Cloud,
    FileImage,
    FileText,
    Server,
    HardDrive,
    Trash2,
    Plus,
    MoreVertical,
    Download,
    Loader2,
    Folder,
    Globe
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { adminService } from '@/services/adminService';
import ProjectStorageCard from '@/components/admin/storage/ProjectStorageCard';
import StorageRegionCard from '@/components/admin/storage/StorageRegionCard';
import { toast } from 'sonner';

export default function StoragePage() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    // Create Bucket State
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [newBucketName, setNewBucketName] = useState('');
    const [isNewBucketPublic, setIsNewBucketPublic] = useState(false);
    const [creating, setCreating] = useState(false);

    // Delete/Empty Bucket State
    const [bucketToDelete, setBucketToDelete] = useState(null);
    const [bucketToEmpty, setBucketToEmpty] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);

    const fetchStats = async () => {
        try {
            const data = await adminService.getStorageStats();
            setStats(data);
        } catch (error) {
            console.error("Failed to fetch storage stats", error);
            toast.error("Failed to load storage statistics");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Initial fetch
        fetchStats();

        // Optional: Poll every 30 seconds for live updates
        const interval = setInterval(fetchStats, 30000);
        return () => clearInterval(interval);
    }, []);

    const handleCreateBucket = async () => {
        if (!newBucketName) return;

        setCreating(true);
        try {
            await adminService.createBucket(newBucketName, isNewBucketPublic);
            toast.success(`Bucket "${newBucketName}" created successfully`);
            setIsCreateDialogOpen(false);
            setNewBucketName('');
            setIsNewBucketPublic(false);
            fetchStats(); // Refresh list
        } catch (error) {
            console.error("Failed to create bucket", error);
            toast.error(error.message || "Failed to create bucket");
        } finally {
            setCreating(false);
        }
    };

    const handleDeleteBucket = async () => {
        if (!bucketToDelete) return;

        setActionLoading(true);
        try {
            await adminService.deleteBucket(bucketToDelete);
            toast.success(`Bucket "${bucketToDelete}" deleted successfully`);
            setBucketToDelete(null);
            fetchStats();
        } catch (error) {
            console.error("Failed to delete bucket", error);
            toast.error(error.message || "Failed to delete bucket");
        } finally {
            setActionLoading(false);
        }
    };

    const handleEmptyBucket = async () => {
        if (!bucketToEmpty) return;

        setActionLoading(true);
        try {
            await adminService.emptyBucket(bucketToEmpty);
            toast.success(`Bucket "${bucketToEmpty}" emptied successfully`);
            setBucketToEmpty(null);
            fetchStats();
        } catch (error) {
            console.error("Failed to empty bucket", error);
            toast.error(error.message || "Failed to empty bucket");
        } finally {
            setActionLoading(false);
        }
    };

    const getIcon = (bucketName) => {
        if (!bucketName) return <Database size={18} className="text-gray-500" />;
        const lower = bucketName.toLowerCase();
        if (lower.includes('image') || lower.includes('avatar')) return <FileImage size={18} className="text-emerald-500" />;
        if (lower.includes('backup')) return <Database size={18} className="text-amber-500" />;
        if (lower.includes('doc') || lower.includes('report') || lower.includes('record')) return <FileText size={18} className="text-indigo-500" />;
        return <Server size={18} className="text-gray-400" />;
    };

    if (loading) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center text-gray-400 gap-4">
                <Loader2 className="w-12 h-12 animate-spin text-emerald-500" />
                <p>Loading Supabase Storage...</p>
            </div>
        );
    }

    if (!stats) return null;

    return (
        <div className="space-y-6">
            {/* Header / Stats Row */}
            {/* Storage Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                    <ProjectStorageCard
                        stats={stats}
                        loading={loading}
                        onCreateBucket={() => setIsCreateDialogOpen(true)}
                    />
                </div>
                <div className="flex flex-col gap-6">
                    <StorageRegionCard loading={loading} />
                </div>
            </div>

            <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-gray-900">Buckets</h3>
                    <Button variant="ghost" size="sm">View All</Button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {stats.buckets.map((bucket) => (
                        <div key={bucket.label} className="bg-white border-1 border-gray-200 rounded-xl p-4 flex items-center justify-between hover:bg-gray-50 transition-all group">
                            <Link href={`/admin/dashboard/storage/${bucket.label}`} className="flex items-center gap-3 overflow-hidden flex-1 min-w-0 cursor-pointer">
                                <div className="text-gray-600 group-hover:text-emerald-600 transition-colors shrink-0">
                                    <Folder size={25} />
                                </div>
                                <div className="flex flex-col min-w-0">
                                    <span className="font-medium text-gray-900 truncate">{bucket.label}</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-gray-900 font-mono">{bucket.size}</span>
                                        <span className={`text-[10px] px-1.5 rounded-full border ${bucket.type === 'public' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-gray-50 text-gray-500 border-gray-100'}`}>
                                            {bucket.type === 'public' ? 'Public' : 'Private'}
                                        </span>
                                    </div>
                                </div>
                            </Link>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 outline-none transition-colors">
                                        <MoreVertical size={16} />
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        className=" cursor-pointer"
                                        onClick={() => setTimeout(() => setBucketToEmpty(bucket.label), 0)}
                                    >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Empty Bucket
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        className="0focus:bg-red-50 cursor-pointer"
                                        onClick={() => setTimeout(() => setBucketToDelete(bucket.label), 0)}
                                    >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Delete Bucket
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    ))}
                </div>
            </div>
            <h3 className="text-lg font-bold text-gray-900">Clinic Storage Usage</h3>

            {/* Clinic Storage Usage Table */}
            <div className=" bg-white rounded-3xl border-1 border-gray-300  overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="text-left py-3 px-6 text-sm font-medium text-gray-500">Clinic</th>
                                <th className="text-left py-3 px-6 text-sm font-medium text-gray-500">Total Size</th>
                                <th className="text-left py-3 px-6 text-sm font-medium text-gray-500">Reports Storage</th>
                                <th className="text-left py-3 px-6 text-sm font-medium text-gray-500">Files Storage</th>
                                <th className="text-right py-3 px-6 text-sm font-medium text-gray-500">File Count</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {stats.clinicUsage && stats.clinicUsage.length > 0 ? (
                                stats.clinicUsage.map((clinic, i) => (
                                    <tr key={i} className="hover:bg-gray-50 transition-colors">
                                        <td className="py-3 px-6">
                                            <div className="flex items-center gap-3">
                                                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center border border-gray-200">
                                                    {clinic.logoUrl ? (
                                                        <img src={clinic.logoUrl} alt={clinic.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <span className="text-lg font-bold text-gray-400">
                                                            {clinic.name ? clinic.name.charAt(0).toUpperCase() : '?'}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-semibold text-gray-900 truncate max-w-[200px]" title={clinic.name}>
                                                        {clinic.name}
                                                    </span>
                                                    <span className="text-xs text-gray-500 truncate max-w-[200px]" title={clinic.id}>
                                                        {clinic.email !== '-' ? clinic.email : clinic.id}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-3 px-6">
                                            <span className="font-bold text-gray-900">{clinic.totalSize}</span>
                                        </td>
                                        <td className="py-3 px-6 text-sm text-gray-500">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                                                {clinic.reportSize}
                                                <span className="text-xs text-gray-400">({clinic.reportCount} files)</span>
                                            </div>
                                        </td>
                                        <td className="py-3 px-6 text-sm text-gray-500">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                                {clinic.fileSize}
                                                <span className="text-xs text-gray-400">({clinic.fileCount} files)</span>
                                            </div>
                                        </td>
                                        <td className="py-3 px-6 text-right font-mono text-sm text-gray-600">
                                            {clinic.reportCount + clinic.fileCount}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="py-8 text-center text-gray-500">
                                        No clinic storage data available
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>


            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create New Bucket</DialogTitle>
                        <DialogDescription>
                            Create a new storage bucket to organize your files.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Bucket Name</Label>
                            <Input
                                id="name"
                                placeholder="e.g. user-avatars"
                                value={newBucketName}
                                onChange={(e) => setNewBucketName(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                            />
                            <p className="text-xs text-gray-500">Only lowercase letters, numbers, and dashes.</p>
                        </div>

                        <div className="flex items-center justify-between space-x-2 border p-3 rounded-lg">
                            <div className="flex flex-col space-y-1">
                                <Label htmlFor="public-mode">Public Access</Label>
                                <span className="text-xs text-gray-500">Allow anyone to read files in this bucket.</span>
                            </div>
                            <Switch
                                id="public-mode"
                                checked={isNewBucketPublic}
                                onCheckedChange={setIsNewBucketPublic}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleCreateBucket} disabled={!newBucketName || creating}>
                            {creating ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                'Create Bucket'
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            {/* Empty Bucket Confirmation */}
            <Dialog open={!!bucketToEmpty} onOpenChange={(open) => !open && setBucketToEmpty(null)}>
                <DialogContent className="bg-white border text-left border-gray-200 shadow-xl max-w-lg sm:max-w-[500px] p-6 gap-4">
                    <DialogHeader className="p-0">
                        <DialogTitle className="text-2xl font-bold text-gray-900">Empty Bucket</DialogTitle>
                    </DialogHeader>

                    <div className="flex flex-col gap-1 py-2">
                        <p className="text-gray-600 text-lg">
                            Are you sure you want to delete <span className="font-bold text-red-600">ALL FILES</span> in <span className="font-bold text-gray-900">{bucketToEmpty}</span>?
                        </p>
                        <p className="text-gray-500 text-base">
                            This action cannot be undone.
                        </p>
                    </div>

                    <DialogFooter className="p-0 gap-3 mt-2">
                        <Button
                            variant="ghost"
                            onClick={() => setBucketToEmpty(null)}
                            className="h-10 px-6 text-base font-semibold text-gray-700 hover:bg-gray-200 hover:text-gray-900 rounded-2xl"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleEmptyBucket}
                            disabled={actionLoading}
                            className="h-10 px-6 text-lg font-bold bg-red-50 border-3 border-transparent hover:border-red-500 cursor-pointer text-red-600 rounded-2xl shadow-none hover:bg-red-100"
                        >
                            {actionLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Empty Bucket
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Bucket Confirmation */}
            <Dialog open={!!bucketToDelete} onOpenChange={(open) => !open && setBucketToDelete(null)}>
                <DialogContent className="bg-white border text-left border-gray-200 shadow-xl max-w-lg sm:max-w-[500px] p-6 gap-4">
                    <DialogHeader className="p-0">
                        <DialogTitle className="text-2xl font-bold text-gray-900">Delete Bucket</DialogTitle>
                    </DialogHeader>

                    <div className="flex flex-col gap-1 py-2">
                        <p className="text-gray-600 text-lg">
                            Are you sure you want to delete the bucket <span className="font-bold text-gray-900">{bucketToDelete}</span>?
                        </p>
                        <div className="mt-2 text-amber-600 text-sm bg-amber-50 p-2 rounded-lg border border-amber-100">
                            Note: You can only delete empty buckets. Please empty it first if it contains files.
                        </div>
                    </div>

                    <DialogFooter className="p-0 gap-3 mt-2">
                        <Button
                            variant="ghost"
                            onClick={() => setBucketToDelete(null)}
                            className="h-10 px-6 text-base font-semibold text-gray-700 hover:bg-gray-200 hover:text-gray-900 rounded-2xl"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleDeleteBucket}
                            disabled={actionLoading}
                            className="h-10 px-6 text-lg font-bold bg-red-50 border-3 border-transparent hover:border-red-500 cursor-pointer text-red-600 rounded-2xl shadow-none hover:bg-red-100"
                        >
                            {actionLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Delete Bucket
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div >
    );
}
