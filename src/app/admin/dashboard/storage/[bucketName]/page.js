"use client";
import React, { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import {
    ArrowLeft,
    FileImage,
    FileText,
    Database,
    Server,
    Search,
    Download,
    Trash2,
    MoreVertical,
    Loader2,
    Folder,
    Home
} from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { adminService } from '@/services/adminService';
import { useNotification } from '@/components/shared/jsFiles/NotificationProvider';

export default function BucketDetailPage() {
    const { pushNotification } = useNotification();
    const { bucketName } = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();

    // Get path from URL query param, default to empty string (root)
    const currentPath = searchParams.get('path') || '';

    const [bucketData, setBucketData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [fileToDelete, setFileToDelete] = useState(null);

    useEffect(() => {
        const fetchBucketContent = async () => {
            setLoading(true);
            try {
                // Pass currentPath to service
                const data = await adminService.getBucketContent(bucketName, currentPath);
                setBucketData(data);
            } catch (error) {
                console.error("Failed to fetch bucket content", error);
                pushNotification('error', `Failed to load bucket content`);
            } finally {
                setLoading(false);
            }
        };

        if (bucketName) {
            fetchBucketContent();
        }
    }, [bucketName, currentPath]); // Re-fetch when path changes

    const handleFolderClick = (folderName) => {
        // Append new folder to current path
        // Ensure we handle trailing slashes correctly
        const newPath = currentPath ? `${currentPath}${folderName}/` : `${folderName}/`;
        router.push(`/admin/dashboard/storage/${bucketName}?path=${encodeURIComponent(newPath)}`);
    };

    const handleBreadcrumbClick = (index, breadcrumbs) => {
        // Reconstruct path up to the clicked index
        if (index === -1) {
            router.push(`/admin/dashboard/storage/${bucketName}`); // Root
            return;
        }
        // Slice up to index+1 because path components are split by '/'
        const newPath = breadcrumbs.slice(0, index + 1).join('/') + '/';
        router.push(`/admin/dashboard/storage/${bucketName}?path=${encodeURIComponent(newPath)}`);
    };

    const handleBack = () => {
        if (!currentPath) {
            // If already at root, go back to buckets list
            router.push('/admin/dashboard/storage');
            return;
        }

        // Remove trailing slash if exists
        const path = currentPath.endsWith('/') ? currentPath.slice(0, -1) : currentPath;
        const segments = path.split('/');

        // Remove last segment to get parent path
        segments.pop();

        const parentPath = segments.length > 0 ? segments.join('/') + '/' : '';

        if (parentPath) {
            router.push(`/admin/dashboard/storage/${bucketName}?path=${encodeURIComponent(parentPath)}`);
        } else {
            router.push(`/admin/dashboard/storage/${bucketName}`);
        }
    };

    const getIcon = (item) => {
        if (item.isFolder) return <Folder className="text-yellow-500 fill-yellow-50" size={20} />;
        const lower = item.name.toLowerCase();
        if (lower.match(/\.(jpg|jpeg|png|gif|svg|webp)$/)) return <FileImage size={18} className="text-emerald-500" />;
        if (lower.match(/\.(pdf|doc|docx|txt)$/)) return <FileText size={18} className="text-indigo-500" />;
        if (lower.match(/\.(sql|db|backup)$/)) return <Database size={18} className="text-amber-500" />;
        return <Server size={18} className="text-gray-400" />;
    };

    const filteredFiles = bucketData?.files?.filter(f =>
        f.name.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

    // Path Breadcrumbs generator
    const breadcrumbs = currentPath.split('/').filter(p => p);


    const handleDownload = async (file) => {
        try {
            // Construct full path including folders
            const fullPath = currentPath ? `${currentPath}${file.name}` : file.name;
            const blob = await adminService.downloadFile(bucketName, fullPath);

            if (blob) {
                // Create object URL and download
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', file.name);
                document.body.appendChild(link);
                link.click();
                link.remove();
                window.URL.revokeObjectURL(url);
                pushNotification('success', `Downloading ${file.name}`);
            }
        } catch (error) {
            console.error("Failed to download file", error);
            pushNotification('error', "Failed to download file");
        }
    };


    const handleDeleteClick = (file) => {
        setFileToDelete(file);
    };

    const confirmDelete = async () => {
        if (!fileToDelete) return;

        try {
            const fullPath = currentPath ? `${currentPath}${fileToDelete.name}` : fileToDelete.name;
            await adminService.deleteFile(bucketName, fullPath);
            pushNotification('success', 'File deleted successfully');

            // Refresh content
            const data = await adminService.getBucketContent(bucketName, currentPath);
            setBucketData(data);
        } catch (error) {
            console.error("Failed to delete file", error);
            pushNotification('error', "Failed to delete file");
        } finally {
            setFileToDelete(null);
        }
    };

    const handleFileSelect = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Reset input
        e.target.value = '';

        const notificationId = pushNotification('loading', `Uploading ${file.name}...`);

        try {
            // Upload
            await adminService.uploadFile(bucketName, currentPath, file, (progressEvent) => {
                const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                // Optional: Update toast message with percentage if supported, or just log
            });

            pushNotification('success', `Successfully uploaded ${file.name}`, { id: notificationId });

            // Refresh content
            const data = await adminService.getBucketContent(bucketName, currentPath);
            setBucketData(data);

        } catch (error) {
            console.error("Upload failed", error);
            pushNotification('error', `Failed to upload ${file.name}: ${error.message}`, { id: notificationId });
        }
    };

    const fileInputRef = React.useRef(null);

    return (
        <div className="space-y-6">
            {/* Header & Actions */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleBack}
                        className="rounded-full hover:bg-gray-100 shrink-0"
                    >
                        <ArrowLeft size={20} className="text-gray-600" />
                    </Button>
                    <p className="text-4xl font-semibold text-gray-900 truncate">{bucketName}</p>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <Input
                            placeholder="Search current folder..."
                            className="pl-9 bg-white"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <input
                        type="file"
                        className="hidden"
                        ref={fileInputRef}
                        onChange={handleFileSelect}
                    />
                    <Button
                        className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 shrink-0"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        Upload to {currentPath ? 'Folder' : 'Root'}
                    </Button>
                </div>
            </div>

            {/* Files List */}
            <div className="bg-white rounded-xl shadow max-w-full mx-auto">
                <div className="border border-gray-200 rounded-2xl overflow-x-auto">
                    {loading ? (
                        <div className="h-[400px] flex flex-col items-center justify-center text-gray-400 gap-4">
                            <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
                        </div>
                    ) : (
                        <div className="max-h-[85vh] overflow-y-auto">
                            <table className="w-full">
                                <thead className="bg-gray-100/70 border-b border-gray-200 sticky top-0 z-10 filter backdrop-blur-sm">
                                    <tr>
                                        <th className="text-left py-3 px-6 text-md font-medium text-gray-500">Name</th>
                                        <th className="text-left py-3 px-6 text-md font-medium text-gray-500">Type</th>
                                        <th className="text-left py-3 px-6 text-md font-medium text-gray-500">Size</th>
                                        <th className="text-left py-3 px-6 text-md font-medium text-gray-500">Last Modified</th>
                                        <th className="text-right py-3 px-6 text-md font-medium text-gray-500">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredFiles.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="py-12 text-center text-gray-400">
                                                {searchTerm ? 'No matching files found.' : 'Folder is empty.'}
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredFiles.map((file) => (
                                            <tr
                                                key={file.id}
                                                className={`border-b border-gray-100 hover:bg-gray-50 transition-colors group ${file.isFolder ? 'cursor-pointer bg-gray-50/30' : ''}`}
                                                onClick={() => file.isFolder && handleFolderClick(file.name)}
                                            >
                                                <td className="py-4 px-4 min-w-80">
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 bg-gray-100 rounded-lg text-gray-500 group-hover:text-emerald-600 transition-colors">
                                                            {getIcon(file)}
                                                        </div>
                                                        <span className={`text-base font-medium ${file.isFolder ? 'text-gray-900' : 'text-gray-900'}`}>
                                                            {file.name}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-4 text-base font-medium text-gray-600 max-w-[150px] truncate">
                                                    {file.type}
                                                </td>
                                                <td className="py-4 px-4 text-base font-medium text-gray-900 font-mono">
                                                    {file.size}
                                                </td>
                                                <td className="py-4 px-4 text-sm text-gray-500">
                                                    {file.created_at}
                                                </td>
                                                <td className="py-4 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                                                    {!file.isFolder && (
                                                        <div className="flex items-center justify-end gap-2">
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8 text-gray-400 hover:text-emerald-600 hover:bg-gray-100 rounded-lg transition-colors"
                                                                onClick={() => handleDownload(file)}
                                                                title="Download"
                                                            >
                                                                <Download size={18} className="stroke-2" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                                onClick={() => handleDeleteClick(file)}
                                                                title="Delete"
                                                            >
                                                                <Trash2 size={18} className="stroke-2" />
                                                            </Button>
                                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                                                                <MoreVertical size={18} className="stroke-2" />
                                                            </Button>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            <Dialog open={!!fileToDelete} onOpenChange={(open) => !open && setFileToDelete(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete File</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete <span className="font-semibold text-gray-900">{fileToDelete?.name}</span>? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setFileToDelete(null)}>Cancel</Button>
                        <Button variant="destructive" onClick={confirmDelete}>Delete</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
